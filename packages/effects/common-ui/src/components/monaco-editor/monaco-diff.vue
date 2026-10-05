<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { DiffEditor, loader } from '@guolao/vue-monaco-editor';
import * as monaco from 'monaco-editor';
import type * as Monaco from 'monaco-editor';

// 导入 Monaco Editor Workers（Vite 会自动处理）
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

import type { MonacoDiffProps } from './types';
import { normalizeLanguageId } from './language-config';

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

const props = withDefaults(defineProps<MonacoDiffProps>(), {
  language: 'plaintext',
  theme: 'vs',
  readonly: true,
  height: '600px',
});

// 标准化的语言ID
const normalizedLanguage = computed(() => normalizeLanguageId(props.language));

const computedTheme = computed(() => props.theme);

// 监听主题变化并更新编辑器
watch(computedTheme, (newTheme) => {
  if (diffEditorRef.value && window.monaco) {
    window.monaco.editor.setTheme(newTheme);
  }
});

const diffEditorRef = shallowRef<Monaco.editor.IStandaloneDiffEditor>();

const diffOptions = computed<Monaco.editor.IStandaloneDiffEditorConstructionOptions>(() => ({
  automaticLayout: true,
  readOnly: props.readonly,
  renderSideBySide: true,
  ignoreTrimWhitespace: false,
  fontSize: 14,
  ...props.options,
}));

function handleDiffReady(editor: Monaco.editor.IStandaloneDiffEditor) {
  diffEditorRef.value = editor;
}

defineExpose({
  getDiffEditor: () => diffEditorRef.value,
});
</script>

<template>
  <div class="monaco-diff-wrapper" :style="{ height: props.height }">
    <DiffEditor
      :original="originalValue"
      :modified="modifiedValue"
      :language="normalizedLanguage"
      :theme="computedTheme"
      :height="props.height"
      :options="diffOptions"
      @mount="handleDiffReady"
    />
  </div>
</template>

<style scoped>
.monaco-diff-wrapper {
  border: 1px solid var(--vben-border-color);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.monaco-diff-wrapper :deep(.monaco-diff-editor) {
  height: 100% !important;
}
</style>
