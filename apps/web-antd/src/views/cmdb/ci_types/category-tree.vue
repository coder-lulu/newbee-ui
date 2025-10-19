<script setup lang="ts">
import type { PropType } from 'vue';

import { computed, onMounted, reactive, ref } from 'vue';

import {
  CloseOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EllipsisOutlined,
  PlusOutlined,
  SearchOutlined,
  SyncOutlined,
} from '@ant-design/icons-vue';
import { Dropdown, InputSearch, Menu, Skeleton } from 'ant-design-vue';

import { getCiTypeGroupItemTree } from '#/api/cmdb/ci_types';

/**
 * CI类型分组项信息 - 用于关联CI类型与分组
 */
export interface CiTypeGroupItem {
  // ID
  id: number;

  // 排序编号
  sort: number;

  // 外键，关联cmdb_ci_type_groups.id
  groupId: number;

  // 外键，关联cmdb_ci_types.id
  typeId: number;

  // 名称
  name: string;
}

export interface CiTypeGroupItemTreeData {
  id: number;
  sort: number;
  name: string;
  items: CiTypeGroupItem[];
}

// 定义拖拽事件返回类型
interface GroupSortInfo {
  groupId: number;
  sort: number;
}

interface AttributeSortInfo {
  id: number;
  sort: number;
}

interface GroupAttributesSortInfo {
  groupId: number;
  items: AttributeSortInfo[];
}

defineOptions({ inheritAttrs: false });

// 使用props替代defineModel
const props = defineProps({
  selectCode: {
    type: Array as PropType<(number | string)[]>,
    required: true,
    default: () => [],
  },
});

const emit = defineEmits<{
  /**
   * 点击添加分组按钮的事件
   */
  addCategory: [];
  /**
   * 删除分组事件
   */
  deleteGroup: [groupId: number];
  /**
   * 下载模型事件
   */
  downloadModel: [attributeId: number];
  /**
   * 属性拖拽事件 - 返回涉及分组的属性排序信息
   */
  dragAttribute: [groupAttributesSortInfos: GroupAttributesSortInfo[]];
  /**
   * 分组拖拽事件 - 返回所有分组的排序信息
   */
  dragGroup: [groupSortInfos: GroupSortInfo[]];
  /**
   * 编辑分组事件
   */
  editGroup: [groupId: number];
  /**
   * 编辑模型事件
   */
  editModel: [attributeId: number];
  /**
   * 点击刷新按钮的事件
   */
  reload: [];
  /**
   * 点击属性的事件
   */
  selectAttribute: [attributeId: number];
  /**
   * 点击分组的事件
   */
  selectGroup: [groupId: number];
  /**
   * 选择代码更新事件
   */
  'update:selectCode': [value: (number | string)[]];
  /**
   * 点击查看属性库按钮的事件
   */
  viewAttributes: [];
}>();

const searchValue = ref('');

// 树状数据
const treeData = ref<CiTypeGroupItemTreeData[]>([]);
/** 骨架屏加载 */
const showSkeleton = ref<boolean>(true);

// 悬浮状态管理
const hoverState = reactive({
  groupId: null as null | number,
  attributeId: null as null | number,
});

// 下拉菜单显示状态管理
const dropdownState = reactive({
  groupId: null as null | number,
  attributeId: null as null | number,
});

// 延迟清除悬浮状态的定时器
let hoverDelayTimer: null | number = null;

// 添加拖拽状态管理
const dragState = reactive({
  isDragging: false,
  dragType: null as 'attribute' | 'group' | null,
  dragId: null as null | number,
  dragGroupId: null as null | number,
  overGroupIndex: null as null | number,
  overAttributeId: null as null | number,
});

// 添加拖拽事件去抖动相关状态
const lastDropTime = ref(0);
const DEBOUNCE_TIME = 300; // 毫秒

// 排序后的树数据
const sortedTreeData = computed(() => {
  return [...treeData.value]
    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
    .map((group) => ({
      ...group,
      items: [...group.items].sort((a, b) => (a.sort || 0) - (b.sort || 0)),
    }));
});

// 根据搜索过滤后的树数据
const filteredTreeData = computed(() => {
  if (!searchValue.value) return sortedTreeData.value;

  return sortedTreeData.value.map((group) => {
    // 仅筛选属性，保留所有分组
    const filteredItems = group.items.filter((item) =>
      item.name?.toLowerCase().includes(searchValue.value.toLowerCase()),
    );

    return {
      ...group,
      items: filteredItems,
    };
  });
  // 移除对分组的筛选，始终保留所有分组
  // 即使该分组没有匹配的属性也会显示
});

// 计算哪些项目被选中
const isSelected = (id: number, type?: 'attribute' | 'group'): boolean => {
  // 如果没有选择代码，直接返回false
  if (props.selectCode.length === 0) {
    return false;
  }

  // 获取当前选中的ID和类型
  const selectedId = props.selectCode[0] as number;

  // 获取已选中的类型标记
  // 使用数组第二个元素来标记类型: 'g' 表示分组, 'a' 表示属性
  const selectedType = props.selectCode.length > 1 ? props.selectCode[1] : null;

  if (!type) {
    // 兼容旧调用方式
    return selectedId === id;
  }

  // 根据类型判断
  return type === 'group'
    ? selectedId === id && selectedType === 'g'
    : selectedId === id && selectedType === 'a';
};

async function loadTree() {
  showSkeleton.value = true;
  searchValue.value = '';
  emit('update:selectCode', []);

  try {
    // 这里替换为实际的API调用
    const response = await getCiTypeGroupItemTree();
    if (response) {
      treeData.value = response as unknown as CiTypeGroupItemTreeData[];
    }
  } finally {
    showSkeleton.value = false;
  }
}

async function handleReload() {
  await loadTree();
  emit('reload');
}

function handleAddCategory() {
  emit('addCategory');
}

function handleViewAttributes() {
  emit('viewAttributes');
}

// 点击分组
function handleGroupClick(groupId: number) {
  emit('selectGroup', groupId);

  // 更新选中状态，第二个元素用'g'标记这是一个分组
  emit('update:selectCode', [groupId, 'g']);
}

// 点击属性
function handleAttributeClick(attributeId: number) {
  emit('selectAttribute', attributeId);

  // 更新选中状态，第二个元素用'a'标记这是一个属性
  emit('update:selectCode', [attributeId, 'a']);
}

// 鼠标悬浮分组
function handleGroupMouseEnter(groupId: number, event?: MouseEvent) {
  // 如果事件来源于属性元素，则不处理分组悬浮
  if (event && event.target instanceof HTMLElement) {
    const target = event.target;
    // 检查事件目标是否是属性相关元素
    if (
      target.closest('.attribute-item') ||
      target.closest('.attribute-actions')
    ) {
      return;
    }
  }

  // 清除之前的延迟定时器
  if (hoverDelayTimer) {
    clearTimeout(hoverDelayTimer);
    hoverDelayTimer = null;
  }
  hoverState.groupId = groupId;
}

// 鼠标离开分组
function handleGroupMouseLeave(event: MouseEvent) {
  // 检查鼠标是否移动到了子元素（操作按钮）上
  const target = event.target as HTMLElement;
  const relatedTarget = event.relatedTarget as HTMLElement;

  // 如果鼠标移动到了分组容器内的其他元素，不清除悬浮状态
  if (
    relatedTarget &&
    target.closest('.group-container')?.contains(relatedTarget)
  ) {
    return;
  }

  // 添加延迟，避免鼠标快速移动时菜单闪烁
  hoverDelayTimer = window.setTimeout(() => {
    hoverState.groupId = null;
    hoverDelayTimer = null;
  }, 150);
}

// 鼠标悬浮属性
function handleAttributeMouseEnter(attributeId: number, event?: MouseEvent) {
  // 阻止事件冒泡，避免触发父级分组的悬浮效果
  if (event) {
    event.stopPropagation();
  }

  // 清除分组的悬浮状态
  hoverState.groupId = null;

  // 清除之前的延迟定时器
  if (hoverDelayTimer) {
    clearTimeout(hoverDelayTimer);
    hoverDelayTimer = null;
  }
  hoverState.attributeId = attributeId;
}

// 鼠标离开属性
function handleAttributeMouseLeave(event: MouseEvent) {
  // 阻止事件冒泡
  event.stopPropagation();

  // 如果下拉菜单正在显示，不清除悬浮状态
  if (dropdownState.attributeId !== null) {
    return;
  }

  // 检查鼠标是否移动到了子元素（操作按钮）上
  const target = event.target as HTMLElement;
  const relatedTarget = event.relatedTarget as HTMLElement;

  // 如果鼠标移动到了属性容器内的其他元素，不清除悬浮状态
  if (
    relatedTarget &&
    target.closest('.attribute-item')?.contains(relatedTarget)
  ) {
    return;
  }

  // 添加延迟，避免鼠标快速移动时菜单闪烁
  hoverDelayTimer = window.setTimeout(() => {
    hoverState.attributeId = null;
    hoverDelayTimer = null;
  }, 150);
}

// 处理属性下拉菜单显示状态变化
function handleAttributeDropdownOpenChange(open: boolean, attributeId: number) {
  if (open) {
    // 下拉菜单显示时，保持悬浮状态并记录下拉菜单状态
    dropdownState.attributeId = attributeId;
    hoverState.attributeId = attributeId;
    // 清除可能存在的延迟定时器
    if (hoverDelayTimer) {
      clearTimeout(hoverDelayTimer);
      hoverDelayTimer = null;
    }
  } else {
    // 下拉菜单隐藏时，清除下拉菜单状态
    dropdownState.attributeId = null;
  }
}

// 编辑分组
function handleEditGroup(groupId: number, event: Event) {
  event.stopPropagation();
  emit('editGroup', groupId);
}

// 删除分组
function handleDeleteGroup(groupId: number, event: Event) {
  event.stopPropagation();
  emit('deleteGroup', groupId);
}

// 编辑模型
function handleEditModel(attributeId: number, event: Event) {
  event.stopPropagation();
  emit('editModel', attributeId);
}

// 下载模型
function handleDownloadModel(attributeId: number, event: Event) {
  event.stopPropagation();
  // TODO: 实现下载模型功能
  console.log('下载模型功能开发中，模型ID:', attributeId);
  emit('downloadModel', attributeId);
}

// 拖拽开始 - 分组或属性
function handleDragStart(
  event: DragEvent,
  type: 'attribute' | 'group',
  id: number,
  groupId?: number,
) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('type', type);
    event.dataTransfer.setData('id', id.toString());
    if (groupId !== undefined) {
      event.dataTransfer.setData('groupId', groupId.toString());
    }

    // 设置拖拽状态
    dragState.isDragging = true;
    dragState.dragType = type;
    dragState.dragId = id;
    dragState.dragGroupId = groupId || null;

    // 设置拖拽时的透明度
    if (event.target instanceof HTMLElement) {
      event.target.style.opacity = '0.6';
    }
  }
}

// 拖拽结束时重置状态
function handleDragEnd(event: DragEvent) {
  dragState.isDragging = false;
  dragState.dragType = null;
  dragState.dragId = null;
  dragState.dragGroupId = null;
  dragState.overGroupIndex = null;
  dragState.overAttributeId = null;

  // 恢复元素透明度
  if (event.target instanceof HTMLElement) {
    event.target.style.opacity = '1';
  }
}

// 元素进入可放置区域
function handleDragEnter(
  event: DragEvent,
  type: 'attribute' | 'group',
  index: number,
  id?: number,
) {
  event.preventDefault();

  if (type === 'group') {
    dragState.overGroupIndex = index;
  } else if (type === 'attribute') {
    dragState.overAttributeId = id || null;
  }
}

// 元素离开可放置区域
function handleDragLeave() {
  // 延迟清除悬停状态，以防闪烁
  setTimeout(() => {
    if (!dragState.isDragging) {
      dragState.overGroupIndex = null;
      dragState.overAttributeId = null;
    }
  }, 50);
}

// 允许放置
function handleDragOver(event: DragEvent) {
  event.preventDefault();
}

// 计算拖拽后分组的排序信息
function getGroupSortInfos(
  sourceGroupId: number,
  targetIndex: number,
): GroupSortInfo[] {
  // 复制当前分组数据并按排序顺序排列
  const sortedGroups = [...sortedTreeData.value];

  // 找到源分组和目标位置
  const sourceIndex = sortedGroups.findIndex((g) => g.id === sourceGroupId);
  if (sourceIndex === -1) return [];

  // 移动分组
  const [movedGroup] = sortedGroups.splice(sourceIndex, 1);
  if (!movedGroup) return [];

  sortedGroups.splice(targetIndex, 0, movedGroup);

  // 返回所有分组的ID和新排序值
  return sortedGroups.map((group, index) => ({
    groupId: group.id,
    sort: index + 1, // 排序从1开始
  }));
}

// 计算拖拽后属性的排序信息
function getAttributeSortInfos(
  sourceAttributeId: number,
  sourceGroupId: number,
  targetGroupId: number,
  targetIndex: number,
): GroupAttributesSortInfo[] {
  // 找到源分组和目标分组
  const sourceGroup = sortedTreeData.value.find((g) => g.id === sourceGroupId);
  const targetGroup = sortedTreeData.value.find((g) => g.id === targetGroupId);

  if (!sourceGroup || !targetGroup) return [];

  try {
    // 复制分组的属性数据并按排序顺序排列
    const sourceItems = [...sourceGroup.items].sort((a, b) => a.sort - b.sort);

    // 如果是同一分组内移动，则共用一个数组副本
    // 如果是跨分组移动，则为目标分组创建单独的副本
    const targetItems =
      sourceGroupId === targetGroupId
        ? sourceItems // 同一分组使用同一个数组
        : [...targetGroup.items].sort((a, b) => a.sort - b.sort);

    // 找到源属性的索引
    const sourceItemIndex = sourceItems.findIndex(
      (item) => item.id === sourceAttributeId,
    );
    if (sourceItemIndex === -1) return [];

    // 获取拖拽的项
    const movedAttribute = sourceItems[sourceItemIndex];
    // 确保movedAttribute存在
    if (!movedAttribute) return [];

    // 如果是同一分组内移动，并且拖拽位置与原位置相同或相邻，则无需移动
    if (sourceGroupId === targetGroupId) {
      // 如果拖到原位置或前一个位置（等价情况），则不处理
      if (
        sourceItemIndex === targetIndex ||
        sourceItemIndex === targetIndex - 1
      ) {
        return [];
      }

      // 在同组内移动，先移除元素
      sourceItems.splice(sourceItemIndex, 1);

      // 确保目标索引反映了源项被移除后的位置
      const adjustedTargetIndex =
        targetIndex > sourceItemIndex ? targetIndex - 1 : targetIndex;

      // 插入到目标位置
      sourceItems.splice(adjustedTargetIndex, 0, movedAttribute);

      // 返回单个分组的排序信息
      return [
        {
          groupId: sourceGroupId,
          items: sourceItems.map((item, index) => ({
            id: item.typeId,
            sort: index + 1, // 排序从1开始
          })),
        },
      ];
    } else {
      // 跨分组移动的情况

      // 从源分组中移除
      sourceItems.splice(sourceItemIndex, 1);

      // 插入到目标分组的目标位置
      targetItems.splice(targetIndex, 0, movedAttribute);

      // 返回两个分组的排序信息
      return [
        {
          groupId: sourceGroupId,
          items: sourceItems.map((item, index) => ({
            id: item.typeId,
            sort: index + 1,
          })),
        },
        {
          groupId: targetGroupId,
          items: targetItems.map((item, index) => ({
            id: item.typeId,
            sort: index + 1,
          })),
        },
      ];
    }
  } catch (error) {
    console.error('Error calculating attribute sort infos:', error);
    return [];
  }
}

// 放置分组
function handleDropOnGroup(event: DragEvent, targetGroupIndex: number) {
  event.preventDefault();
  if (!event.dataTransfer) return;

  // 添加去抖动逻辑，避免短时间内多次触发
  const now = Date.now();
  if (now - lastDropTime.value < DEBOUNCE_TIME) {
    return;
  }
  lastDropTime.value = now;

  try {
    const type = event.dataTransfer.getData('type');
    const id = Number.parseInt(event.dataTransfer.getData('id'));

    if (type === 'group') {
      // 计算并发送所有分组的排序信息
      const sortInfos = getGroupSortInfos(id, targetGroupIndex);
      if (sortInfos.length > 0) {
        emit('dragGroup', sortInfos);
      }
    } else if (type === 'attribute') {
      const sourceGroupId = Number.parseInt(
        event.dataTransfer.getData('groupId'),
      );
      if (
        targetGroupIndex >= 0 &&
        sortedTreeData.value &&
        sortedTreeData.value.length > targetGroupIndex
      ) {
        const targetGroup = sortedTreeData.value[targetGroupIndex];
        if (targetGroup) {
          // 计算并发送属性的排序信息（跨分组到分组的开始位置）
          const sortInfos = getAttributeSortInfos(
            id,
            sourceGroupId,
            targetGroup.id,
            0,
          );
          if (sortInfos.length > 0) {
            emit('dragAttribute', sortInfos);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error handling drop on group:', error);
  } finally {
    // 重置拖拽状态
    dragState.isDragging = false;
    dragState.dragType = null;
    dragState.dragId = null;
    dragState.dragGroupId = null;
    dragState.overGroupIndex = null;
    dragState.overAttributeId = null;
  }
}

// 放置属性
function handleDropOnAttribute(
  event: DragEvent,
  targetGroupId: number,
  targetAttributeIndex: number,
) {
  event.preventDefault();
  if (!event.dataTransfer) return;

  // 添加去抖动逻辑，避免短时间内多次触发
  const now = Date.now();
  if (now - lastDropTime.value < DEBOUNCE_TIME) {
    return;
  }
  lastDropTime.value = now;

  try {
    const type = event.dataTransfer.getData('type');
    const id = Number.parseInt(event.dataTransfer.getData('id'));

    if (type === 'attribute') {
      const sourceGroupId = Number.parseInt(
        event.dataTransfer.getData('groupId'),
      );
      // 计算并发送属性的排序信息
      const sortInfos = getAttributeSortInfos(
        id,
        sourceGroupId,
        targetGroupId,
        targetAttributeIndex,
      );
      if (sortInfos.length > 0) {
        emit('dragAttribute', sortInfos);
      }
    }
  } catch (error) {
    console.error('Error handling drop on attribute:', error);
  } finally {
    // 重置拖拽状态
    dragState.isDragging = false;
    dragState.dragType = null;
    dragState.dragId = null;
    dragState.dragGroupId = null;
    dragState.overGroupIndex = null;
    dragState.overAttributeId = null;
  }
}

// 判断当前元素是否是正在拖拽的元素
function isDraggingItem(type: 'attribute' | 'group', id: number): boolean {
  return (
    dragState.isDragging &&
    dragState.dragType === type &&
    dragState.dragId === id
  );
}

// 判断当前元素是否是拖拽悬停的目标元素
function isDropTarget(
  type: 'attribute' | 'group',
  index: number,
  id?: number,
): boolean {
  if (!dragState.isDragging) return false;

  if (type === 'group') {
    return dragState.overGroupIndex === index;
  } else if (type === 'attribute') {
    return dragState.overAttributeId === id;
  }

  return false;
}

// 添加搜索功能
function handleSearch(value: string) {
  if (value && value.length > 0) {
    searchValue.value = value;
  } else {
    handleReload();
  }
}

// 处理按下回车键
function handleSearchKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    // 阻止默认行为
    event.preventDefault();
    // 执行搜索
    handleSearch(searchValue.value);
  }
}

// 清空搜索
function clearSearch() {
  searchValue.value = '';
}

// 高亮搜索结果
function getHighlightedName(name: string, search: string) {
  if (!search || !name) return name;

  const index = name.toLowerCase().indexOf(search.toLowerCase());
  if (index === -1) return name;
  const preStr = name.slice(0, Math.max(0, index));
  const matchStr = name.slice(index, index + search.length);
  const postStr = name.slice(Math.max(0, index + search.length));

  return `${preStr}<span class="text-yellow-600 font-bold">${matchStr}</span>${postStr}`;
}

// 初始化组件
onMounted(() => {
  loadTree();
});

// 暴露给父组件的方法
defineExpose({
  loadTree,
});
</script>

<template>
  <div class="category-tree-container h-full">
    <Skeleton :loading="showSkeleton" :paragraph="{ rows: 8 }" active>
      <div :class="[$attrs.class]" class="relative h-full p-[8px]">
        <div
          class="bg-background flex h-full flex-col overflow-y-auto rounded-lg"
        >
          <!-- 固定在顶部 必须加上bg-background背景色 否则会产生'穿透'效果 -->
          <div class="bg-background z-100 sticky left-0 top-0 p-[8px]">
            <div class="mb-2 flex items-center justify-between">
              <InputSearch
                v-model="searchValue"
                :placeholder="$t('pages.common.search')"
                size="small"
                class="mr-2 flex-1"
                @keydown="handleSearchKeyDown"
                @search="handleSearch"
              >
                <template #enterButton>
                  <a-button type="primary">
                    <SearchOutlined />
                  </a-button>
                </template>
              </InputSearch>

              <a-button
                size="small"
                @click="clearSearch"
                title="清空搜索"
                class="mr-1"
                v-if="searchValue"
              >
                <CloseOutlined />
              </a-button>

              <Dropdown>
                <a-button size="small">
                  <EllipsisOutlined />
                </a-button>
                <template #overlay>
                  <Menu>
                    <Menu.Item @click="handleAddCategory">
                      <div class="flex items-center">
                        <PlusOutlined class="mr-1" />
                        <span>添加分组</span>
                      </div>
                    </Menu.Item>
                    <Menu.Item @click="handleViewAttributes">
                      <div class="flex items-center">
                        <SyncOutlined class="mr-1" />
                        <span>查看属性库</span>
                      </div>
                    </Menu.Item>
                  </Menu>
                </template>
              </Dropdown>
            </div>
            <!-- 搜索提示 -->
            <div
              v-if="searchValue"
              class="search-prompt mb-2 text-xs text-gray-500"
            >
              搜索结果: "{{ searchValue }}"
              <span
                class="ml-2 cursor-pointer text-blue-500 hover:text-blue-700"
                @click="clearSearch"
              >
                清除
              </span>
            </div>
          </div>

          <div class="flex-1 px-[8px]">
            <!-- 树状分组和属性 -->
            <div class="tree-container h-full">
              <transition-group name="drag-list" tag="div">
                <!-- 分组列表 -->
                <div
                  v-for="(group, groupIndex) in filteredTreeData"
                  :key="group.id"
                  class="group-container mb-2"
                  :class="{
                    'is-dragging': isDraggingItem('group', group.id),
                    'drop-target': isDropTarget('group', groupIndex),
                  }"
                  @dragover="handleDragOver"
                  @dragenter="handleDragEnter($event, 'group', groupIndex)"
                  @dragleave="handleDragLeave"
                  @drop="handleDropOnGroup($event, groupIndex)"
                >
                  <!-- 分组标题 -->
                  <div
                    class="group-header flex cursor-pointer items-center justify-between rounded-md px-2 py-1 hover:bg-gray-100"
                    :class="{
                      'bg-gray-100': hoverState.groupId === group.id,
                      'selected-item': isSelected(group.id, 'group'),
                    }"
                    draggable="true"
                    @mouseenter="handleGroupMouseEnter(group.id, $event)"
                    @mouseleave="handleGroupMouseLeave($event)"
                    @click="handleGroupClick(group.id)"
                    @dragstart="handleDragStart($event, 'group', group.id)"
                    @dragend="handleDragEnd"
                  >
                    <div class="font-medium">
                      <span
                        v-if="searchValue"
                        v-html="getHighlightedName(group.name, searchValue)"
                      ></span>
                      <span v-else>{{ group.name }}</span>
                      ({{ group.items.length }})
                    </div>
                    <div
                      v-if="hoverState.groupId === group.id"
                      class="group-actions flex"
                    >
                      <PlusOutlined
                        class="mr-2 cursor-pointer hover:text-blue-500"
                        @click.stop="handleAddCategory"
                      />
                      <EditOutlined
                        class="mr-2 cursor-pointer hover:text-blue-500"
                        @click="handleEditGroup(group.id, $event)"
                      />
                      <DeleteOutlined
                        class="cursor-pointer hover:text-red-500"
                        @click="handleDeleteGroup(group.id, $event)"
                      />
                    </div>
                  </div>

                  <!-- 属性列表 -->
                  <div class="attribute-list mt-1 pl-4">
                    <transition-group name="drag-list" tag="div">
                      <div
                        v-for="(attribute, attrIndex) in group.items"
                        :key="attribute.id"
                        class="attribute-item flex cursor-pointer items-center justify-between rounded-md px-2 py-1 hover:bg-gray-50"
                        :class="{
                          'bg-gray-50': hoverState.attributeId === attribute.id,
                          'selected-item': isSelected(
                            attribute.typeId,
                            'attribute',
                          ),
                          'is-dragging': isDraggingItem(
                            'attribute',
                            attribute.id,
                          ),
                          'drop-target': isDropTarget(
                            'attribute',
                            0,
                            attribute.id,
                          ),
                          'highlight-search':
                            searchValue &&
                            attribute.name
                              ?.toLowerCase()
                              .includes(searchValue.toLowerCase()),
                        }"
                        draggable="true"
                        @mouseenter="
                          handleAttributeMouseEnter(attribute.id, $event)
                        "
                        @mouseleave="handleAttributeMouseLeave($event)"
                        @click="handleAttributeClick(attribute.typeId)"
                        @dragstart="
                          handleDragStart(
                            $event,
                            'attribute',
                            attribute.id,
                            group.id,
                          )
                        "
                        @dragend="handleDragEnd"
                        @dragover="handleDragOver"
                        @dragenter="
                          handleDragEnter(
                            $event,
                            'attribute',
                            attrIndex,
                            attribute.id,
                          )
                        "
                        @dragleave="handleDragLeave"
                        @drop="
                          handleDropOnAttribute($event, group.id, attrIndex)
                        "
                      >
                        <div>
                          <span
                            v-if="searchValue"
                            v-html="
                              getHighlightedName(attribute.name, searchValue)
                            "
                          ></span>
                          <span v-else>{{ attribute.name }}</span>
                        </div>
                        <div
                          v-if="
                            hoverState.attributeId === attribute.id ||
                            dropdownState.attributeId === attribute.id
                          "
                          class="attribute-actions"
                        >
                          <Dropdown
                            :trigger="['click']"
                            @open-change="
                              (open) =>
                                handleAttributeDropdownOpenChange(
                                  open,
                                  attribute.id,
                                )
                            "
                          >
                            <EllipsisOutlined
                              class="cursor-pointer"
                              @click.stop
                            />
                            <template #overlay>
                              <Menu>
                                <Menu.Item
                                  @click="
                                    handleEditModel(attribute.typeId, $event)
                                  "
                                >
                                  <div class="flex items-center">
                                    <EditOutlined class="mr-1" />
                                    <span>编辑模型</span>
                                  </div>
                                </Menu.Item>
                                <Menu.Item
                                  @click="
                                    handleDownloadModel(attribute.id, $event)
                                  "
                                >
                                  <div class="flex items-center">
                                    <DownloadOutlined class="mr-1" />
                                    <span>下载模型</span>
                                  </div>
                                </Menu.Item>
                              </Menu>
                            </template>
                          </Dropdown>
                        </div>
                      </div>
                    </transition-group>
                  </div>
                </div>
              </transition-group>

              <!-- 空状态 -->
              <div
                v-if="filteredTreeData.length === 0"
                class="empty-state py-4 text-center text-gray-500"
              >
                <div v-if="searchValue">没有匹配的结果</div>
                <div v-else>暂无数据，请添加分组</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Skeleton>
  </div>
</template>

<style scoped>
.group-header {
  transition: background-color 0.2s;
}

.attribute-item {
  transition: background-color 0.2s;
}

.group-actions,
.attribute-actions {
  opacity: 1;
  transition: opacity 0.2s;
}

.selected-item {
  background-color: #e6f7ff;
  border-left: 2px solid #1890ff;
}

.highlight-search {
  background-color: #fffbe6; /* 浅黄色背景 */
  border-left: 2px dashed #faad14; /* 黄色边框 */
}

/* 确保父容器高度100% */
:deep(.ant-skeleton) {
  height: 100%;
}

:deep(.ant-skeleton-content) {
  height: 100%;
}

/* 拖拽动画 */
.drag-list-move {
  transition: transform 0.5s ease;
}

.is-dragging {
  opacity: 0.5;
}

.drop-target {
  position: relative;
}

.drop-target::before {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  content: '';
  background-color: rgb(24 144 255 / 10%);
  border: 2px dashed #1890ff;
  border-radius: 4px;
}

/* 搜索结果样式 */
.search-prompt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  background-color: #f0f7ff;
  border-radius: 4px;
}
</style>
