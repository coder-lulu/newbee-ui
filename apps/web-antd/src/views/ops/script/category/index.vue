<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { emitter } from '../mitt';
import CategoryDrawer from './category-drawer.vue';
import ScriptCategoryTree from './script-category-tree.vue';

const [CategoryEditDrawer, categoryEditDrawerApi] = useVbenDrawer({
  connectedComponent: CategoryDrawer,
  appendToBody: true,
  onClosed() {
    categoryEditDrawerApi.setData(undefined);
  },
});

function handleSelect(categoryId: number) {
  emitter.emit('categorySelected', categoryId);
}

onMounted(() => {
  emitter.on('openCategoryAdd', () => {
    categoryEditDrawerApi.setData({});
    categoryEditDrawerApi.open();
  });
  emitter.on('openCategoryEdit', (payload: { categoryId: number }) => {
    categoryEditDrawerApi.setData({ categoryId: payload.categoryId });
    categoryEditDrawerApi.open();
  });
  emitter.on('openCategoryAddChild', (payload: { parentId: number }) => {
    categoryEditDrawerApi.setData({ parentId: payload.parentId });
    categoryEditDrawerApi.open();
  });
});

onUnmounted(() => {
  emitter.off('openCategoryAdd');
  emitter.off('openCategoryEdit');
  emitter.off('openCategoryAddChild');
});
</script>

<template>
  <div class="h-full flex flex-col">
    <ScriptCategoryTree @select="handleSelect" />
    <CategoryEditDrawer />
  </div>
</template>
