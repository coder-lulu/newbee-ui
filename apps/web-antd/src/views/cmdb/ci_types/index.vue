<!-- eslint-disable no-use-before-define -->
<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref, watch } from 'vue';

import { useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { PlusOutlined } from '@ant-design/icons-vue';
import { Button, message, Modal, Popconfirm, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteCiType,
  deleteCiTypeGroup,
  getCiTypeListByGroupId,
  updateCiTypeGroupItemSort,
  updateCiTypeGroupSort,
} from '#/api/cmdb/ci_types';

import CategoryTree from './category-tree.vue';
import CiTypeGroupModal from './ci-type-group-modal.vue';
import CiTypeDrawer from './components/CiTypeDrawer.vue';
import { columns } from './data';
import TabContent from './TabContent.vue';

// 添加分类树的ref引用，显式指定类型包含loadTree方法
const categoryTreeRef = ref<null | { loadTree: () => Promise<void> }>(null);

const [CiTypeGroupEditModal, ciTypeGroupModalApi] = useVbenModal({
  connectedComponent: CiTypeGroupModal,
});

// 左侧树选择状态
const selectedCode = ref<(number | string)[]>([]);
// 控制显示模式：'models'(CI模型列表) 或 'attribute'(属性详情)
const viewMode = ref<'attribute' | 'models'>('models');
// 当前选中的属性ID
const currentTypeId = ref<null | number>(null);
// 存储CI模型列表数据
const ciModels = ref<any[]>([]);
// 加载状态
const loading = ref(false);
// 树组件宽度
const leftWidth = ref(150);
const isResizing = ref(false);

const gridOptions: VxeGridProps = {
  border: true,
  rowConfig: {
    isHover: true,
    keyField: 'id',
  },
  columns,
  height: 600, // 让表格高度自适应内容
  // height: 'auto', // 让表格高度自适应内容
  maxHeight: 1200, // 最大高度（可根据页面实际情况调整）
  autoResize: true,
  keepSource: true,
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        if (currentGroupId.value) {
          return await getCiTypeListByGroupId(currentGroupId.value);
        }
        return [];
      },
    },
  },
  toolbarConfig: {
    enabled: false,
  },
  showOverflow: false,
};

const currentGroupId = ref<number>(0);

const [BasicTable, tableApi] = useVbenVxeGrid({
  gridOptions,
});

// 监听选择代码变化
watch(
  () => selectedCode.value,
  async (newVal) => {
    if (newVal.length > 0) {
      const id = Number(newVal[0]);
      const type = newVal.length > 1 ? newVal[1] : null;
      if (type === 'g') {
        // 选择的是分组
        viewMode.value = 'models';
        currentGroupId.value = id;
        await loadCiModels();
      } else if (type === 'a') {
        // 选择的是属性
        viewMode.value = 'attribute';
        currentTypeId.value = id;
      }
    } else {
      // 未选择任何项
      viewMode.value = 'models';
      ciModels.value = [];
    }
  },
  { immediate: true },
);

// 加载CI模型列表
async function loadCiModels() {
  loading.value = true;
  try {
    await tableApi.query();
  } catch (error) {
    console.error('加载CI模型失败:', error);
    message.error('加载CI模型失败');
    ciModels.value = [];
  } finally {
    loading.value = false;
  }
}

async function reloadIndexData() {
  await loadCiModels();
  await handlerReloadCategoryTree();
}

// 处理添加分组
function handleAddCategory() {
  ciTypeGroupModalApi.setData({});
  ciTypeGroupModalApi.open();
}

// 处理编辑分组
function handleEditGroup(groupId: number) {
  ciTypeGroupModalApi.setData({ id: groupId });
  ciTypeGroupModalApi.open();
}

// 处理删除分组
function handleDeleteGroup(groupId: number) {
  // 弹出提示，确认后删除
  Modal.confirm({
    title: '确认删除？',
    content: '删除后无法恢复，请谨慎操作。',
    onOk: async () => {
      try {
        await deleteCiTypeGroup([groupId]);
        // 删除后刷新分类树
        handlerReloadCategoryTree();
      } catch (error) {
        console.error(error);
      }
    },
  });
}

// 处理查看属性库
function handleViewAttributes() {
  console.log('查看属性库');
  // 实现查看属性库逻辑
}

// 处理拖拽分组
function handleDragGroup(sortInfos: any[]) {
  // 如果收到空数组，不进行处理
  if (!sortInfos || sortInfos.length === 0) {
    return;
  }

  // 实现拖拽分组逻辑
  const loadingKey = 'updateGroupSort';

  // 显示loading消息
  message.loading({ content: '更新排序中...', key: loadingKey, duration: 0 });

  updateCiTypeGroupSort(sortInfos)
    .then(() => {
      message.success({ content: '排序更新成功', key: loadingKey });
      handlerReloadCategoryTree();
    })
    .catch((error) => {
      console.error('更新分组排序失败:', error);
      message.error({ content: '排序更新失败', key: loadingKey });
    });
}

// 处理拖拽属性
function handleDragAttribute(groupAttributesSortInfos: any[]) {
  // 如果收到空数组，说明是同分组内拖拽到了相同或相邻位置，不需要处理
  if (!groupAttributesSortInfos || groupAttributesSortInfos.length === 0) {
    return;
  }
  // 重组数据，将groupId和items合并
  // 实现拖拽属性逻辑
  // const loadingKey = 'updateAttributeSort';

  // 这里应该调用API更新排序
  // message.loading({ content: '更新排序中...', key: loadingKey, duration: 0 });

  // TODO: 实现保存属性排序的API调用
  updateCiTypeGroupItemSort(groupAttributesSortInfos)
    .then(() => {
      handlerReloadCategoryTree();
    })
    .catch((error) => {
      console.error('更新属性排序失败:', error);
    });
}

// 处理树宽度调整
function handleResized(width: number) {
  leftWidth.value = width;
}

// 处理拖拽调整宽度
function handleMouseDown(event: MouseEvent) {
  isResizing.value = true;
  const startX = event.clientX;
  const startWidth = leftWidth.value;

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.value) return;

    const deltaX = e.clientX - startX;
    const newWidth = Math.max(200, Math.min(500, startWidth + deltaX));
    leftWidth.value = newWidth;
  };

  const handleMouseUp = () => {
    isResizing.value = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
}

// 处理表格操作
function handleEdit(id: number) {
  ciTypeDrawerApi.setData({ id });
  ciTypeDrawerApi.open();
}

async function handleDelete(id: number) {
  await deleteCiType([id]);
  reloadIndexData();
}

function handlerReloadCategoryTree() {
  // 调用子组件的刷新方法
  if (
    categoryTreeRef.value &&
    typeof categoryTreeRef.value.loadTree === 'function'
  ) {
    categoryTreeRef.value.loadTree().catch((error) => {
      console.error('刷新分类树失败:', error);
      message.error('刷新分类树失败');
    });
  }
}

function handleAddCiType() {
  ciTypeDrawerApi.setData({ groupId: currentGroupId.value });
  ciTypeDrawerApi.open();
}

const [CiTypeDrawerComp, ciTypeDrawerApi] = useVbenDrawer({
  connectedComponent: CiTypeDrawer,
});
</script>

<template>
  <div class="ci-types-page" :class="{ resizing: isResizing }">
    <div class="ci-types-left" :style="{ width: `${leftWidth}px` }">
      <CategoryTree
        ref="categoryTreeRef"
        :select-code="selectedCode"
        @update:select-code="(val) => (selectedCode = val)"
        @add-category="handleAddCategory"
        @edit-group="handleEditGroup"
        @delete-group="handleDeleteGroup"
        @view-attributes="handleViewAttributes"
        @drag-group="handleDragGroup"
        @drag-attribute="handleDragAttribute"
        @resized="handleResized"
        @edit-model="handleEdit"
      />
    </div>

    <!-- 拖拽分割条 -->
    <div
      class="resize-handle"
      :class="{ active: isResizing }"
      @mousedown="handleMouseDown"
    >
      <div class="resize-button">
        <div class="resize-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <div class="ci-types-right">
      <!-- CI模型列表视图 --> 
      <div v-if="viewMode === 'models'" class="flex-1">
        <div class="table-header">
          <div class="table-title">CI类型列表</div>
          <div class="table-toolbar">
            <Button type="primary" @click="handleAddCiType" v-access:code="['cmdb:ci_type:create']">
              <PlusOutlined />
              新增CI类型
            </Button>
          </div>
        </div>
        <div class="table-container">
          <BasicTable>
            <template #action="{ row }">
              <Space>
                <ghost-button
                  v-access:code="['cmdb:ci_type:update']"
                  @click.stop="handleEdit(row.id)"
                >
                  {{ $t('pages.common.edit') }}
                </ghost-button>
                <Popconfirm
                  :get-popup-container="getVxePopupContainer"
                  placement="left"
                  title="确认删除？"
                  @confirm="handleDelete(row.id)"
                >
                  <ghost-button
                    danger
                    v-access:code="['cmdb:ci_type:delete']"
                    @click.stop=""
                  >
                    {{ $t('pages.common.delete') }}
                  </ghost-button>
                </Popconfirm>
              </Space>
            </template>
          </BasicTable>
        </div>
      </div>

      <!-- 属性详情视图 -->
      <div v-else-if="viewMode === 'attribute'" class="flex-1">
        <TabContent :type-id="currentTypeId || 0" />
      </div>
    </div>

    <CiTypeGroupEditModal @reload="handlerReloadCategoryTree" />
    <!-- 新增CI模型抽屉 -->
    <CiTypeDrawerComp @reload="reloadIndexData" />
  </div>
</template>

<style scoped>
.ci-types-page {
  display: flex;
  height: 100%;
  background: #fff;
}

.ci-types-left {
  min-width: 200px;
  max-width: 500px;
  height: 100%;
  overflow-y: auto;
  background: #fff;
  border-right: 1px solid #f0f0f0;
  transition: width 0.1s ease;
}

/* 拖拽分割条 */
.resize-handle {
  position: relative;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  background: transparent;
  transition: background-color 0.2s ease;
}

.resize-handle:hover {
  background-color: rgb(24 144 255 / 10%);
}

.resize-handle.active {
  background-color: rgb(24 144 255 / 20%);
}

.resize-handle::before {
  position: absolute;
  inset: 0 -4px;
  content: '';
  background: transparent;
}

.resize-button {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 40px;
  padding: 0;
  cursor: col-resize;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 10%);
  opacity: 0.6;
  transition: all 0.2s ease;
  transform: translate(-50%, -50%);
}

.resize-handle:hover .resize-button {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgb(24 144 255 / 20%);
  opacity: 1;
}

.resize-handle.active .resize-button {
  background: #e6f7ff;
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgb(24 144 255 / 30%);
  opacity: 1;
}

.resize-dots {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: center;
}

.resize-dots span {
  display: block;
  width: 3px;
  height: 3px;
  background-color: #8c8c8c;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.resize-handle:hover .resize-dots span {
  background-color: #1890ff;
}

.resize-handle.active .resize-dots span {
  background-color: #1890ff;
}

.ci-types-right {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  padding: 24px;
  overflow: hidden;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.table-toolbar {
  display: flex;
  align-items: center;
}

.table-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px 0 rgb(0 0 0 / 3%);
}

:deep(.vxe-table) {
  border: 1px solid #f0f0f0;
}

:deep(.vxe-table .vxe-header--column) {
  font-weight: 600;
  background: #fafafa;
}

:deep(.vxe-table .vxe-body--row:hover) {
  background: #f5f5f5;
}

/* 拖拽时禁用选择 */
.ci-types-page.resizing {
  user-select: none;
}

.ci-types-page.resizing * {
  cursor: col-resize !important;
}

/* 确保flex布局正确 */
.flex-1 {
  flex: 1;
  min-height: 0;
}
</style>
