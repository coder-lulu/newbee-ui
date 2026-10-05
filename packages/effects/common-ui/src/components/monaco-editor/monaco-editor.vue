<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue';
import { Editor, loader } from '@guolao/vue-monaco-editor';
import * as monaco from 'monaco-editor';
import type * as Monaco from 'monaco-editor';

// 导入 Monaco Editor Workers（Vite 会自动处理）
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

import type { MonacoEditorProps } from './types';
import { configureLanguageSupport, normalizeLanguageId } from './language-config';

// 配置 Monaco Editor Worker（只配置一次）
if (typeof window !== 'undefined' && !(self as any).MonacoEnvironment) {
  (self as any).MonacoEnvironment = {
    getWorker(_: any, label: string) {
      if (label === 'json') {
        return new jsonWorker();
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new cssWorker();
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new htmlWorker();
      }
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker();
      }
      return new editorWorker();
    },
  };

  // 配置 loader 使用本地的 monaco
  loader.config({ monaco });

  // 将monaco挂载到window，供全局访问
  window.monaco = monaco;
}

const props = withDefaults(defineProps<MonacoEditorProps>(), {
  language: 'plaintext',
  theme: 'vs', // 默认使用亮色主题
  readonly: false,
  height: '500px',
  width: '100%',
  enableCompletion: true,
  minimap: true,
  lineNumbers: 'on',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'ready': [editor: Monaco.editor.IStandaloneCodeEditor];
  'change': [value: string];
  'focus': [];
  'blur': [];
}>();

// 使用props.theme，不再自动检测系统主题
const computedTheme = computed(() => props.theme);

// 监听主题变化并更新编辑器
watch(computedTheme, (newTheme) => {
  if (editorRef.value && window.monaco) {
    window.monaco.editor.setTheme(newTheme);
  }
});

const editorRef = shallowRef<Monaco.editor.IStandaloneCodeEditor>();
const completionDisposable = shallowRef<Monaco.IDisposable>();

// 标准化的语言ID
const normalizedLanguage = computed(() => normalizeLanguageId(props.language));

// 监听语言变化，重新配置补全提供者
watch(normalizedLanguage, (newLanguage) => {
  if (editorRef.value && props.enableCompletion && window.monaco) {
    console.log('[Monaco Editor] Language changed to:', newLanguage, '- Reconfiguring completion...');

    // 清理旧的补全提供者
    if (completionDisposable.value) {
      completionDisposable.value.dispose();
      completionDisposable.value = undefined;
    }

    // 注册新的补全提供者
    completionDisposable.value = configureLanguageSupport(newLanguage, editorRef.value, props.completionProvider);
  }
});

const editorOptions = computed<Monaco.editor.IStandaloneEditorConstructionOptions>(() => ({
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
  wordWrap: 'on',
  minimap: { enabled: props.minimap },
  lineNumbers: props.lineNumbers,
  readOnly: props.readonly,
  scrollBeyondLastLine: false,
  fontSize: 14,
  tabSize: 2,
  insertSpaces: true,
  // 代码补全配置 - 必须是对象或true
  quickSuggestions: props.enableCompletion ? {
    other: true,
    comments: false,
    strings: true,
  } : false,
  suggestOnTriggerCharacters: props.enableCompletion,
  acceptSuggestionOnCommitCharacter: props.enableCompletion,
  acceptSuggestionOnEnter: props.enableCompletion ? 'on' : 'off',
  tabCompletion: 'on', // 允许使用Tab键接受建议
  // 显示建议widget
  suggest: {
    showIcons: true,
    showStatusBar: true,
    insertMode: 'replace',
    snippetsPreventQuickSuggestions: false, // 允许在snippet中显示建议
  },
  // 参数提示
  parameterHints: {
    enabled: props.enableCompletion,
  },
  // 自动补全
  wordBasedSuggestions: 'off', // 关闭基于单词的建议，使用我们自定义的provider
  ...props.options,
}));

function handleEditorReady(editor: Monaco.editor.IStandaloneCodeEditor) {
  editorRef.value = editor;

  // 使用标准化的语言ID配置语言支持
  if (props.enableCompletion) {
    completionDisposable.value = configureLanguageSupport(normalizedLanguage.value, editor, props.completionProvider);
  }

  emit('ready', editor);
}

function handleChange(value: string | undefined) {
  emit('update:modelValue', value || '');
  emit('change', value || '');
}

onBeforeUnmount(() => {
  // 清理补全提供者
  if (completionDisposable.value) {
    completionDisposable.value.dispose();
  }

  // 清理编辑器
  if (editorRef.value) {
    editorRef.value.dispose();
  }
});

defineExpose({
  getEditor: () => editorRef.value,
  focus: () => editorRef.value?.focus(),
  setValue: (value: string) => editorRef.value?.setValue(value),
  getValue: () => editorRef.value?.getValue(),
});
</script>

<template>
  <div class="monaco-editor-wrapper" :style="{ height: props.height, width: props.width }">
    <Editor
      :value="modelValue"
      :language="normalizedLanguage"
      :theme="computedTheme"
      :height="props.height"
      :width="props.width"
      :options="editorOptions"
      @update:value="handleChange"
      @mount="handleEditorReady"
      @focus="emit('focus')"
      @blur="emit('blur')"
    />
  </div>
</template>

<style scoped>
.monaco-editor-wrapper {
  border: 1px solid var(--vben-border-color);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.monaco-editor-wrapper :deep(.monaco-editor-container) {
  height: 100% !important;
}
</style>
