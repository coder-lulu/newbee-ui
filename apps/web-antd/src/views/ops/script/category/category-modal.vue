<script lang="ts" setup>
import { computed, ref } from 'vue';

import type { ScriptCategory } from '#/api/ops/script/script-category-model';
import {
  scriptCategoryAdd,
  scriptCategoryInfo,
  scriptCategoryUpdate,
} from '#/api/ops/script/script-category';

import { notification } from 'ant-design-vue';
import { useVbenForm } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useCategoryTreeCache } from '../composables/useCategoryTreeCache';
import { emitter } from '../mitt';
import { categoryModalSchema } from './data';

interface Props {
  categoryId?: number;
}

const props = defineProps<Props>();

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
});

const loading = ref(false);
const { getCategoryTree, clearCache } = useCategoryTreeCache();
const categoryTreeData = ref<ScriptCategory[]>([]);

const isUpdate = computed(() => !!props.categoryId);

async function fetchCategoryTree() {
  try {
    categoryTreeData.value = await getCategoryTree();

    // 更新父分类选择器的数据源
    baseFormApi.updateSchema([
      {
        componentProps: {
          treeData: categoryTreeData.value,
        },
        fieldName: 'parentId',
      },
    ]);
  } catch (error) {
    console.error('Failed to fetch category tree:', error);
  }
}

async function fetchData() {
  if (!props.categoryId) return;

  loading.value = true;
  try {
    const data = await scriptCategoryInfo({ id: props.categoryId });
    await baseFormApi.setValues(data);
  } catch (error) {
    console.error('Failed to fetch category info:', error);
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  loading.value = true;
  try {
    const values = await baseFormApi.validate();

    if (isUpdate.value) {
      await scriptCategoryUpdate({ ...(values as any), id: props.categoryId });
      notification.success({
        description: $t('common.updateSuccess'),
        message: $t('common.tip'),
      });
    } else {
      await scriptCategoryAdd(values as any);
      notification.success({
        description: $t('common.createSuccess'),
        message: $t('common.tip'),
      });
    }

    // 清除缓存，下次获取最新数据
    clearCache();
    emitter.emit('categoryUpdated');
    emit('success');
  } catch (error: any) {
    notification.error({
      description: error.message || $t('common.operationFailed'),
      message: $t('common.tip'),
    });
  } finally {
    loading.value = false;
  }
}

// 初始化方法
async function init() {
  await fetchCategoryTree();
  if (props.categoryId) {
    await fetchData();
  } else {
    // 重置表单
    baseFormApi.resetForm();
  }
}

defineExpose({
  handleSubmit,
  init,
  loading,
});
</script>

<template>
  <BaseForm />
</template>
