<script lang="ts" setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';

import type { Script } from '#/api/ops/script/script-model';
import { scriptAdd, scriptInfo, scriptUpdate } from '#/api/ops/script/script';
import type { ScriptCategory } from '#/api/ops/script/script-category-model';

import { Tabs } from 'ant-design-vue';
import { notification } from 'ant-design-vue';
import { MonacoEditor, useVbenDrawer, useVbenForm } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useCategoryTreeCache } from '../composables/useCategoryTreeCache';
import { emitter } from '../mitt';
import {
  getLanguageFromType,
  scriptBasicSchema,
  scriptConfigSchema,
} from './data';

const emit = defineEmits<{
  success: [];
}>();

const scriptLanguage = ref('shell');
const editorRef = ref(); // Monaco Editor ref
const pendingContent = ref<string>(''); // 待设置的内容（用于编辑器挂载前）

// 创建带有语言切换回调的 schema
const createBasicSchemaWithCallback = () => {
  return scriptBasicSchema.map((field) => {
    if (field.fieldName === 'scriptType') {
      return {
        ...field,
        dependencies: {
          triggerFields: ['scriptType'],
          trigger: (values: any) => {
            if (values.scriptType) {
              const newLanguage = getLanguageFromType(values.scriptType);
              if (scriptLanguage.value !== newLanguage) {
                console.log('[Script Editor] Language changed:', values.scriptType, '->', newLanguage);
                scriptLanguage.value = newLanguage;
              }
            }
          },
        },
      };
    }
    return field;
  });
};

const [BasicForm, basicFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: createBasicSchemaWithCallback(),
  wrapperClass: 'grid-cols-1',
  showDefaultActions: false, // 隐藏默认的提交和重置按钮
});

const [ConfigForm, configFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: scriptConfigSchema,
  wrapperClass: 'grid-cols-1',
  showDefaultActions: false, // 隐藏默认的提交和重置按钮
});

const activeTab = ref('basic');
const scriptContent = ref(''); // 脚本内容
const categoryTreeData = ref<ScriptCategory[]>([]);
const { getCategoryTree } = useCategoryTreeCache();
const isFullscreen = ref(false);
const scriptId = ref<number | undefined>(undefined);
const isUpdate = computed(() => !!scriptId.value);

// Monaco Editor主题选择 - 从localStorage读取或使用默认值
const THEME_STORAGE_KEY = 'monaco-editor-theme';
const editorTheme = ref<string>(localStorage.getItem(THEME_STORAGE_KEY) || 'vs');

// 主题选项
const themeOptions = [
  { label: '亮色主题 (VS)', value: 'vs' },
  { label: '暗色主题 (VS Dark)', value: 'vs-dark' },
  { label: '高对比度 (HC Black)', value: 'hc-black' },
];

// 保存主题选择到localStorage
watch(editorTheme, (newTheme) => {
  localStorage.setItem(THEME_STORAGE_KEY, newTheme);
});

// 抽屉加载兜底定时器（在卸载时清理）
let loadingFallbackTimer: ReturnType<typeof setTimeout> | null = null;

function clearLoadingFallback() {
  if (loadingFallbackTimer) {
    clearTimeout(loadingFallbackTimer);
    loadingFallbackTimer = null;
  }
}

const title = computed(() =>
  isUpdate.value ? $t('common.edit') : $t('common.add'),
);

// 切换全屏
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
}

// Monaco Editor 挂载完成回调
function onEditorReady() {
  console.log('[Script Drawer] Editor mounted:', {
    pendingContent: pendingContent.value?.substring(0, 50),
    scriptContent: scriptContent.value?.substring(0, 50),
    activeTab: activeTab.value,
  });

  // 优先使用 scriptContent（最新的数据源）
  const contentToSet = scriptContent.value || pendingContent.value;

  if (contentToSet && editorRef.value?.setValue) {
    editorRef.value.setValue(contentToSet);
    console.log('[Script Drawer] ✅ Content set on editor ready:', contentToSet.substring(0, 50));
  } else if (!contentToSet) {
    console.log('[Script Drawer] ⚠️ No content to set yet');
  }
}

// 自动同步脚本内容到编辑器
// 当满足以下条件时触发：
// 1. 当前在 content tab
// 2. scriptContent 有值
// 3. 编辑器已挂载
// 4. 编辑器当前值与期望值不一致
watch(
  [activeTab, scriptContent],
  async ([newTab, newContent]) => {
    if (newTab === 'content' && newContent) {
      console.log('[Script Drawer] Content sync check:', {
        tab: newTab,
        content: newContent?.substring(0, 50),
        editorMounted: !!editorRef.value,
      });

      // 等待编辑器挂载（最多等待 1 秒）
      let attempts = 0;
      while (!editorRef.value && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      await nextTick();

      // 检查编辑器是否已挂载
      if (editorRef.value) {
        const currentValue = editorRef.value.getValue?.() || '';
        console.log('[Script Drawer] Current editor value:', currentValue?.substring(0, 50));

        // 如果编辑器的内容与期望的不一致，重新设置
        if (currentValue !== newContent) {
          editorRef.value.setValue(newContent);
          console.log('[Script Drawer] ✅ Content synced to editor');
        } else {
          console.log('[Script Drawer] ✓ Content already in sync');
        }
      } else {
        console.log('[Script Drawer] ⚠️ Editor still not mounted after waiting');
      }
    }
  },
  { immediate: false }
);

async function fetchCategoryTree() {
  try {
    const data = await getCategoryTree();
    categoryTreeData.value = Array.isArray(data) ? data : [];
    const tree = categoryTreeData.value;

    // 确保 children 为数组，避免 Ant TreeSelect 在 children=null 时无法展开/显示
    const normalizeChildren = (nodes: any[]): any[] =>
      nodes.map((n) => ({
        ...n,
        children: Array.isArray(n.children) ? normalizeChildren(n.children) : [],
      }));

    const safeTree = normalizeChildren(tree as any[]);

    await basicFormApi.updateSchema([
      {
        componentProps: {
          fieldNames: {
            children: 'children',
            label: 'name',
            value: 'id',
          },
          treeData: safeTree,
        },
        fieldName: 'categoryId',
      },
    ]);
  } catch (error) {
    console.error('Failed to fetch category tree:', error);
  }
}

async function fetchData(id: number) {
  try {
    const data = await scriptInfo({ id });
    console.log('[Script Drawer] Fetched data:', {
      id,
      contentLength: data.content?.length,
      content: data.content,
      scriptType: data.scriptType,
    });

    // 🔥 关键修复：先设置脚本内容（最重要的数据），避免被表单设置阻塞
    console.log('[Script Drawer] Step 1: Setting scriptContent first...', data.content);
    scriptContent.value = data.content || '';
    scriptLanguage.value = getLanguageFromType(data.scriptType);
    pendingContent.value = data.content || '';
    console.log('[Script Drawer] Step 1: ✅ scriptContent set');

    // 🔥 然后并行设置表单值（非阻塞），不等待完成
    console.log('[Script Drawer] Step 2: Setting form values (non-blocking)...');
    basicFormApi.setValues({
      categoryId: data.categoryId,
      code: data.code,
      description: data.description,
      executor: data.executor,
      name: data.name,
      riskLevel: data.riskLevel,
      scriptType: data.scriptType,
      tags: data.tags,
    }).then(() => {
      console.log('[Script Drawer] ✅ Basic form values set (async)');
    }).catch(err => {
      console.error('[Script Drawer] ❌ Failed to set basic form values:', err);
    });

    configFormApi.setValues({
      defaultTimeout: data.defaultTimeout,
      defaultWorkdir: data.defaultWorkdir,
      isTemplate: data.isTemplate,
      requireConfirmation: data.requireConfirmation,
      schedulable: data.schedulable,
    }).then(() => {
      console.log('[Script Drawer] ✅ Config form values set (async)');
    }).catch(err => {
      console.error('[Script Drawer] ❌ Failed to set config form values:', err);
    });

    console.log('[Script Drawer] Step 2: Form updates dispatched');

    // 尝试立即设置编辑器内容
    await nextTick();
    if (editorRef.value?.setValue) {
      editorRef.value.setValue(data.content || '');
      console.log('[Script Drawer] ✅ Editor content set immediately');
    } else {
      console.log('[Script Drawer] Editor not mounted yet, will set on ready event');
    }
  } catch (error) {
    console.error('Failed to fetch script info:', error);
  }
}

async function handleSubmit() {
  try {
    // 1. 先验证表单
    const basicValidation = await basicFormApi.validate();
    const configValidation = await configFormApi.validate();

    if (!basicValidation.valid || !configValidation.valid) {
      notification.warning({
        description: $t('common.validateFailed'),
        message: $t('common.tip'),
      });
      return;
    }

    // 2. 获取表单值
    const basicValues = await basicFormApi.getValues();
    const configValues = await configFormApi.getValues();

    const values: Script = {
      ...basicValues,
      ...configValues,
      content: scriptContent.value,
    };

    if (isUpdate.value && scriptId.value) {
      await scriptUpdate({ ...values, id: scriptId.value });
      notification.success({
        description: $t('common.updateSuccess'),
        message: $t('common.tip'),
      });
    } else {
      await scriptAdd(values);
      notification.success({
        description: $t('common.createSuccess'),
        message: $t('common.tip'),
      });
    }

    emitter.emit('scriptUpdated');
    emit('success');
    drawerApi.close();
  } catch (error: any) {
    notification.error({
      description: error.message || $t('common.operationFailed'),
      message: $t('common.tip'),
    });
  }
}

// Drawer 控制
const [BasicDrawer, drawerApi] = useVbenDrawer({
  onConfirm: handleSubmit,
  onClosed: async () => {
    await basicFormApi.resetForm();
    await configFormApi.resetForm();
    scriptId.value = undefined;
    scriptContent.value = '';
    pendingContent.value = ''; // 清理待设置的内容
    scriptLanguage.value = 'shell';
    activeTab.value = 'basic';
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;

    drawerApi.drawerLoading(true);
    // 兜底：无论发生什么，最多 3 秒后自动关闭 loading，避免悬挂
    loadingFallbackTimer = setTimeout(() => drawerApi.drawerLoading(false), 3000);

    try {
      const data = drawerApi.getData() as { scriptId?: number };
      scriptId.value = data?.scriptId;

      if (scriptId.value) {
        // 编辑模式：并行拉取分类树与详情，完成后关闭 loading
        await Promise.all([
          fetchCategoryTree(),
          fetchData(scriptId.value),
        ]);
        drawerApi.drawerLoading(false);
        clearLoadingFallback();
      } else {
        // 新增模式：表单初始化后立即关闭 loading，分类树异步加载不阻塞
        // 表单重置采用非阻塞方式，避免等待导致 loading 悬挂
        basicFormApi.resetForm();
        configFormApi.resetForm();
        scriptContent.value = '';
        pendingContent.value = ''; // 清理待设置的内容
        // 初始按默认脚本类型设置语言
        scriptLanguage.value = 'shell';
        activeTab.value = 'basic';

        // 先立即根据传入的 categoryId 进行一次回填（即使树尚未加载，也会在树加载后正确显示）
        {
          const rawPreset = (drawerApi.getData() as any)?.categoryId;
          const preset = rawPreset != null ? Number(rawPreset) : undefined;
          if (preset != null && !Number.isNaN(preset)) {
            // 非阻塞设置，避免阻塞加载
            void basicFormApi.setFieldValue('categoryId', preset);
          }
        }

        // 异步加载分类树，不阻塞抽屉交互
        fetchCategoryTree().then(async () => {
          // 若打开抽屉时通过外部传入了 categoryId（例如从左侧分类树“新增脚本”）则优先回填
          const rawPreset = (drawerApi.getData() as any)?.categoryId;
          const preset = rawPreset != null ? Number(rawPreset) : undefined;
          if (preset != null && !Number.isNaN(preset)) {
            await basicFormApi.setFieldValue('categoryId', preset);
          }
        }).catch((err) => {
          console.error('Failed to fetch category tree:', err);
        }).finally(() => {
          // 无需在此处控制 loading
        });

        drawerApi.drawerLoading(false);
        clearLoadingFallback();
      }
    } catch (error) {
      console.error('Failed to initialize drawer:', error);
      notification.error({
        description: '加载失败，请重试',
        message: $t('common.tip'),
      });
      drawerApi.drawerLoading(false);
      clearLoadingFallback();
    }
  },
});

onUnmounted(() => {
  clearLoadingFallback();
});

// 监听脚本类型变化，自动切换编辑器语言（联动）
basicFormApi.onValueChange?.((values: any, field: string) => {
  if (field === 'scriptType' && values?.scriptType) {
    scriptLanguage.value = getLanguageFromType(values.scriptType);
  }
});
</script>

<template>
  <BasicDrawer :title="title" class="w-[80vw] max-w-[1200px]">
    <Tabs v-model:activeKey="activeTab" class="px-4">
      <a-tab-pane key="basic" :tab="$t('ops.script.tabs.basic')">
        <BasicForm />
      </a-tab-pane>

      <a-tab-pane key="content" :tab="$t('ops.script.tabs.content')">
        <div class="py-4">
          <div class="mb-2 flex items-center justify-between">
            <div class="text-sm text-gray-500">
              {{ $t('ops.script.contentHint') }}
            </div>
            <div class="flex gap-2 items-center">
              <span class="text-sm text-gray-500">主题:</span>
              <a-select
                v-model:value="editorTheme"
                :options="themeOptions"
                size="small"
                style="width: 180px"
              />
              <a-button size="small" @click="toggleFullscreen">
                {{ isFullscreen ? '📉 退出全屏' : '📈 全屏' }}
              </a-button>
            </div>
          </div>
          <div :class="[isFullscreen ? 'fixed inset-0 z-[9999] bg-white dark:bg-gray-900 p-4' : '']">
            <MonacoEditor
              ref="editorRef"
              v-model="scriptContent"
              :language="scriptLanguage"
              :theme="editorTheme"
              :height="isFullscreen ? 'calc(100vh - 120px)' : '500px'"
              :enable-completion="true"
              :minimap="false"
              @ready="onEditorReady"
            />
            <div v-if="isFullscreen" class="mt-2 flex items-center justify-between">
              <div class="flex gap-2 items-center">
                <span class="text-sm text-gray-500">主题:</span>
                <a-select
                  v-model:value="editorTheme"
                  :options="themeOptions"
                  size="small"
                  style="width: 180px"
                />
              </div>
              <a-button size="small" type="primary" @click="toggleFullscreen">
                退出全屏
              </a-button>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="config" :tab="$t('ops.script.tabs.config')">
        <ConfigForm />
      </a-tab-pane>
    </Tabs>
  </BasicDrawer>
</template>
