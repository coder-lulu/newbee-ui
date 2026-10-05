<script lang="ts" setup>
import { computed, ref, nextTick } from 'vue';

import type { ScriptCategory } from '#/api/ops/script/script-category-model';
import {
  scriptCategoryAdd,
  scriptCategoryInfo,
  scriptCategoryUpdate,
} from '#/api/ops/script/script-category';

import { notification } from 'ant-design-vue';
import { useVbenDrawer, useVbenForm } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useCategoryTreeCache } from '../composables/useCategoryTreeCache';
import { emitter } from '../mitt';
import { categoryModalSchema } from './data';

const emit = defineEmits<{
  success: [];
}>();

const [BaseForm, baseFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: categoryModalSchema,
  wrapperClass: 'grid-cols-1',
  showDefaultActions: false,
});

const loading = ref(false);
const { getCategoryTree, clearCache } = useCategoryTreeCache();
const categoryTreeData = ref<ScriptCategory[]>([]);
const categoryId = ref<number | undefined>(undefined);
const parentId = ref<number | undefined>(undefined);
const isUpdate = computed(() => !!categoryId.value);
const title = computed(() => (isUpdate.value ? $t('common.edit') : $t('common.add')));

async function fetchCategoryTree() {
  try {
    const raw = await getCategoryTree();
    // 规范化 children=null -> []，避免 TreeSelect 渲染异常
    function normalize(nodes: any[]): any[] {
      if (!Array.isArray(nodes)) return [] as any[];
      return nodes.map((n: any) => {
        const children = Array.isArray(n?.children) ? normalize(n.children) : [];
        return { ...n, children };
      });
    }
    categoryTreeData.value = normalize(raw);

    // 更新父分类选择器的数据源
    baseFormApi.updateSchema([
      {
        componentProps: {
          treeData: categoryTreeData.value,
        },
        fieldName: 'parentId',
      },
    ]);
    // 等待 schema 应用，避免后续 setValues 不生效
    await nextTick();
  } catch (error) {
    console.error('Failed to fetch category tree:', error);
  }
}

async function fetchData() {
  if (!categoryId.value) return;

  loading.value = true;
  try {
    const data = await scriptCategoryInfo({ id: categoryId.value });
    // 编辑时回填；若后端 parentId=0 代表根，为了 UI 友好显示为空（但提交时仍会补 0）
    const fill = { ...data } as any;
    if (fill.parentId === 0) fill.parentId = undefined;
    await baseFormApi.setValues(fill);
  } catch (error) {
    console.error('Failed to fetch category info:', error);
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  loading.value = true;
  try {
    const vr = await baseFormApi.validate();
    if (!vr?.valid) {
      loading.value = false;
      return;
    }
    const values: any = await baseFormApi.getValues();
    // 后端期望始终包含 parentId；无父级时以 0 表示根
    if (values.parentId === undefined || values.parentId === null) {
      values.parentId = 0;
    }

    if (isUpdate.value) {
      await scriptCategoryUpdate({ ...values, id: categoryId.value });
      notification.success({
        description: $t('common.updateSuccess'),
        message: $t('common.tip'),
      });
    } else {
      await scriptCategoryAdd(values);
      notification.success({
        description: $t('common.createSuccess'),
        message: $t('common.tip'),
      });
    }

    // 清除缓存，下次获取最新数据
    clearCache();
    emitter.emit('categoryUpdated');
    emit('success');

    // 关闭抽屉
    drawerApi.close();
  } catch (error: any) {
    notification.error({
      description: error.message || $t('common.operationFailed'),
      message: $t('common.tip'),
    });
  } finally {
    loading.value = false;
  }
}

// Drawer 控制（从父组件注入 options）
const [BasicDrawer, drawerApi] = useVbenDrawer({
  onConfirm: handleSubmit,
  onClosed: async () => {
    await baseFormApi.resetForm();
    categoryId.value = undefined;
    parentId.value = undefined;
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return null;
    drawerApi.drawerLoading(true);
    const data = drawerApi.getData() as { categoryId?: number; parentId?: number };
    categoryId.value = data?.categoryId;
    parentId.value = data?.parentId;

    // 1. 先更新树数据
    await fetchCategoryTree();

    // 2. 重置表单
    await baseFormApi.resetForm();

    // 3. 等待重置完成（关键：确保 schema 更新和重置都完成）
    await nextTick();

    // 4. 填充数据
    if (categoryId.value) {
      await fetchData();
    } else if (parentId.value !== undefined) {
      // 新建子类时，直接预填 parentId
      await baseFormApi.setValues({ parentId: parentId.value });
    }

    drawerApi.drawerLoading(false);
  },
});
</script>

<template>
  <BasicDrawer :title="title" class="w-[600px]">
    <BaseForm />
  </BasicDrawer>
</template>
