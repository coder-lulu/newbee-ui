<script lang="ts" setup>
import { computed, h, onMounted, ref, watch } from 'vue';

import type { ScriptCategory } from '#/api/ops/script/script-category-model';
import {
  scriptCategoryList,
  scriptCategoryRemove,
} from '#/api/ops/script/script-category';

import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import { $t } from '@vben/locales';
import { listToTree } from '@vben/utils';

import { Dropdown, Input, Menu, Modal, Skeleton, Tree, message } from 'ant-design-vue';

import { useCategoryTreeCache } from '../composables/useCategoryTreeCache';
import { emitter } from '../mitt';

const InputSearch = Input.Search;

const emit = defineEmits<{
  select: [categoryId: number];
}>();

const { clearCache } = useCategoryTreeCache();
const treeData = ref<any[]>([]);
const searchValue = ref('');
const expandedKeys = ref<number[]>([]);
const selectedKeys = ref<number[]>([]);
const autoExpandParent = ref(true);
const loading = ref(false);

// Drawer由父级(index.vue)统一承载与控制，通过事件触发打开

// 获取分类树数据
async function loadTree() {
  loading.value = true;
  try {
    // 获取树形结构的分类列表（tree默认为true）
    const list = await scriptCategoryList({ tree: true });
    // 转换为树结构
    treeData.value = listToTree(list || [], { id: 'id', pid: 'parentId' });
    
    // 如果没有选中项，且有数据，默认展开第一层
    if (selectedKeys.value.length === 0 && treeData.value.length > 0) {
      // 可选：默认选中第一个
      // selectedKeys.value = [treeData.value[0].id];
      // emit('select', treeData.value[0].id);
    }
  } catch (error) {
    console.error('Failed to load category tree:', error);
  } finally {
    loading.value = false;
  }
}

// 搜索处理
function handleSearch(value: string) {
  const expanded: number[] = [];
  
  // 简单的搜索逻辑：遍历树，找到匹配的节点及其父节点
  // 这里为了简单，如果搜索不为空，就重新获取并扁平化搜索？
  // Ant Design Tree 推荐在前端过滤/搜索
  
  if (!value) {
    expandedKeys.value = [];
    return;
  }

  // 辅助函数：查找匹配节点并收集父节点ID
  const searchLoop = (data: any[]) => {
    data.forEach((item: any) => {
      if (item.name.toLowerCase().indexOf(value.toLowerCase()) > -1) {
        // 匹配到了，虽然expandedKeys是控制展开的，但Antdv Tree会自动处理父节点展开吗？
        // 需要手动收集父节点路径
        // 这里简化处理：如果是搜索状态，展开所有或者展开匹配项
        // 实际项目通常需要递归查找并维护一个expandedKeys列表
        // 简单做法：展开所有匹配项的父节点
      }
      if (item.children) {
        searchLoop(item.children);
      }
    });
  };
  
  // 更简单的做法：扁平化列表搜索，然后计算expandedKeys
  // 由于treeData已经是树结构，我们重新请求一次扁平数据或者缓存扁平数据会更好
  // 这里直接利用 listToTree 之前的 list 数据会更方便，但 ref 中存的是树
  // 暂时仅做简单过滤展示，Antdv Tree 需要自定义渲染来实现高亮
  
  // 展开所有节点（简单粗暴，或者根据匹配项）
  const getAllKeys = (data: any[]) => {
    let keys: number[] = [];
    data.forEach(item => {
      keys.push(item.id);
      if (item.children) {
        keys = keys.concat(getAllKeys(item.children));
      }
    });
    return keys;
  };
  
  if (value) {
     // 搜索时展开所有，实际应该只展开匹配路径
     // 为了演示效果，先展开所有
     expandedKeys.value = getAllKeys(treeData.value);
     autoExpandParent.value = true;
  }
}

function onExpand(keys: number[]) {
  expandedKeys.value = keys;
  autoExpandParent.value = false;
}

function handleSelect(keys: number[], { node }: any) {
  selectedKeys.value = keys;
  if (keys.length > 0) {
    emit('select', keys[0]);
  }
}

// 操作处理
function handleAdd() {
  emitter.emit('openCategoryAdd');
}

function handleEdit(item: any) {
  emitter.emit('openCategoryEdit', { categoryId: item.id });
}

function handleAddChild(item: any) {
  emitter.emit('openCategoryAddChild', { parentId: item.id });
}

function handleDelete(item: any) {
  Modal.confirm({
    title: $t('common.confirmDelete'),
    content: $t('common.confirmDelete'),
    okType: 'danger',
    onOk: async () => {
      try {
        await scriptCategoryRemove({ ids: [item.id] });
        message.success($t('common.deleteSuccess'));
        clearCache();
        emitter.emit('categoryUpdated');
        loadTree();
      } catch (error: any) {
        message.error(error.message || $t('common.deleteFailed'));
      }
    },
  });
}

function clearSearch() {
  searchValue.value = '';
  handleSearch('');
}

// 高亮搜索结果 - 参照 CI 类型树
function getHighlightedName(name: string, search: string) {
  if (!search || !name) return name;

  const index = name.toLowerCase().indexOf(search.toLowerCase());
  if (index === -1) return name;

  const preStr = name.slice(0, Math.max(0, index));
  const matchStr = name.slice(index, index + search.length);
  const postStr = name.slice(Math.max(0, index + search.length));

  return `${preStr}<span class="search-highlight">${matchStr}</span>${postStr}`;
}

// 监听更新事件
onMounted(() => {
  loadTree();
  emitter.on('categoryUpdated', loadTree);
});
</script>

<template>
  <div class="script-category-tree">
    <!-- 搜索框 - 参照 CI 类型树样式 -->
    <div class="tree-search">
      <div class="search-container">
        <InputSearch
          v-model:value="searchValue"
          placeholder="搜索脚本分类..."
          size="small"
          class="search-input"
          @search="handleSearch"
          @change="(e) => handleSearch(e.target.value || '')"
        >
          <template #enterButton>
            <a-button type="primary" size="small">
              <SearchOutlined />
            </a-button>
          </template>
        </InputSearch>

        <a-button
          v-if="searchValue"
          size="small"
          @click="clearSearch"
          title="清空搜索"
          class="clear-button"
        >
          <CloseOutlined />
        </a-button>

        <Dropdown>
          <a-button size="small" type="text" title="更多操作">
            <EllipsisOutlined />
          </a-button>
          <template #overlay>
            <Menu>
              <Menu.Item @click="handleAdd">
                <div class="flex items-center">
                  <PlusOutlined class="mr-2" />
                  <span>{{ $t('common.add') }}</span>
                </div>
              </Menu.Item>
              <Menu.Item @click="loadTree">
                <div class="flex items-center">
                  <SearchOutlined class="mr-2" />
                  <span>{{ $t('common.refresh') }}</span>
                </div>
              </Menu.Item>
            </Menu>
          </template>
        </Dropdown>
      </div>

      <!-- 搜索提示 -->
      <div
        v-if="searchValue"
        class="search-prompt"
      >
        搜索结果: "{{ searchValue }}"
        <span
          class="clear-link"
          @click="clearSearch"
        >
          清除
        </span>
      </div>
    </div>

    <Skeleton :loading="loading" active :paragraph="{ rows: 6 }">
      <Tree
        v-if="treeData.length > 0"
        v-model:expandedKeys="expandedKeys"
        v-model:selectedKeys="selectedKeys"
        :tree-data="treeData"
        :auto-expand-parent="autoExpandParent"
        :show-line="{ showLeafIcon: false }"
        :show-icon="false"
        block-node
        :field-names="{ children: 'children', title: 'name', key: 'id' }"
        @expand="onExpand"
        @select="handleSelect"
      >
        <template #title="{ dataRef }">
          <div class="group flex items-center justify-between w-full pr-1">
            <span
              class="flex-1 truncate text-sm"
              v-if="searchValue && dataRef.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1"
              v-html="getHighlightedName(dataRef.name, searchValue)"
            ></span>
            <span v-else class="flex-1 truncate text-sm">{{ dataRef.name }}</span>

            <div class="tree-node-actions flex items-center gap-0.5 ml-2">
              <a-button
                type="text"
                size="small"
                class="!p-1 !h-6 !w-6 hover:bg-blue-50"
                title="添加子分类"
                @click.stop="handleAddChild(dataRef)"
              >
                <PlusOutlined class="text-blue-500 text-xs" />
              </a-button>
              <a-button
                type="text"
                size="small"
                class="!p-1 !h-6 !w-6 hover:bg-blue-50"
                title="编辑"
                @click.stop="handleEdit(dataRef)"
              >
                <EditOutlined class="text-blue-500 text-xs" />
              </a-button>
              <a-button
                type="text"
                size="small"
                class="!p-1 !h-6 !w-6 hover:bg-red-50"
                title="删除"
                @click.stop="handleDelete(dataRef)"
              >
                <DeleteOutlined class="text-red-500 text-xs" />
              </a-button>
            </div>
          </div>
        </template>
      </Tree>
      <div v-else class="text-center text-gray-400 mt-10">
        {{ $t('common.noData') }}
      </div>
    </Skeleton>
  </div>
</template>

<style scoped>
.script-category-tree {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

/* 搜索框样式 */
.tree-search {
  padding: 16px 16px 8px 16px;
  background: #fff;
  flex-shrink: 0;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 0;
}

.search-input {
  flex: 1;
}

.clear-button {
  flex-shrink: 0;
}

/* 搜索提示样式 */
.search-prompt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background-color: #f0f7ff;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
  margin-top: 8px;
  border: 1px solid #e6f7ff;
}

.clear-link {
  cursor: pointer;
  color: #1890ff;
  margin-left: 8px;
}

.clear-link:hover {
  color: #40a9ff;
}

/* 搜索结果高亮 */
:deep(.search-highlight) {
  background-color: #fffbe6;
  color: #faad14;
  font-weight: bold;
  padding: 0 2px;
  border-radius: 2px;
}

/* 自定义树结构样式 */
.script-category-tree :deep(.ant-tree) {
  background: #fff;
  padding: 0 16px 16px 16px;
}

/* 树节点样式 */
.script-category-tree :deep(.ant-tree-treenode) {
  padding: 2px 0;
}

/* 树节点标题样式 - 添加透明边框避免抖动 */
.script-category-tree :deep(.ant-tree-node-content-wrapper) {
  padding: 4px 8px;
  border-radius: 4px;
  border-left: 3px solid transparent;
  border-top: 1px solid transparent;
  border-right: 1px solid transparent;
  border-bottom: 1px solid transparent;
  transition: background-color 0.2s ease;
}

/* 树节点悬停效果 - 只改变背景色 */
.script-category-tree :deep(.ant-tree-node-content-wrapper:hover) {
  background-color: #f5f5f5;
}

/* 选中节点样式 - 左侧蓝色竖条 + 浅蓝背景 */
.script-category-tree :deep(.ant-tree-node-selected .ant-tree-node-content-wrapper) {
  background-color: #e6f7ff !important;
  border-left-color: #1890ff !important;
  border-top-color: #91d5ff !important;
  border-right-color: #91d5ff !important;
  border-bottom-color: #91d5ff !important;
}

/* 连接线样式 - 虚线效果 */
.script-category-tree :deep(.ant-tree-indent-unit) {
  border-left: 1px dashed #d9d9d9;
}

.script-category-tree :deep(.ant-tree-switcher) {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
}

/* 连接线 - 水平虚线 */
.script-category-tree :deep(.ant-tree-switcher-line-icon) {
  border-left: 1px dashed #d9d9d9;
}

/* 父节点连接线 */
.script-category-tree :deep(.ant-tree-switcher::before) {
  border-left: 1px dashed #d9d9d9;
}

/* 最后一个子节点的连接线 */
.script-category-tree :deep(.ant-tree-treenode-leaf-last > .ant-tree-switcher::before) {
  border-left: 1px dashed #d9d9d9;
}

/* 树线条颜色和样式 */
.script-category-tree :deep(.ant-tree-line) {
  border-color: #d9d9d9;
  border-style: dashed;
}

.script-category-tree :deep(.ant-tree-line::before) {
  border-left: 1px dashed #d9d9d9;
}

.script-category-tree :deep(.ant-tree-line::after) {
  border-bottom: 1px dashed #d9d9d9;
}

/* 叶子节点图标样式 */
.script-category-tree :deep(.ant-tree-iconEle) {
  display: inline-block;
  width: 16px;
  height: 16px;
  font-size: 12px;
  line-height: 16px;
  color: #8c8c8c;
  text-align: center;
}

/* 父节点图标样式 */
.script-category-tree :deep(.ant-tree-switcher-icon) {
  font-size: 12px;
  color: #666;
}

/* 树节点间距调整 */
.script-category-tree :deep(.ant-tree-child-tree) {
  margin-left: 18px;
}

/* 根节点样式 - 只有有子节点的才显示蓝色 */
.script-category-tree :deep(.ant-tree-treenode-switcher-open) {
  font-weight: 500;
  color: #1890ff;
}

.script-category-tree :deep(.ant-tree-treenode-switcher-close) {
  font-weight: 500;
  color: #666;
}

/* 没有子节点的父节点样式 */
.script-category-tree
  :deep(
    .ant-tree-treenode:not(.ant-tree-treenode-switcher-open):not(
        .ant-tree-treenode-switcher-close
      )
  ) {
  font-weight: 500;
  color: #333;
}

/* 叶子节点样式 */
.script-category-tree :deep(.ant-tree-treenode-leaf) {
  font-weight: 400;
  color: #333;
}

/* 加载状态样式 */
.script-category-tree :deep(.ant-tree-treenode-loading .ant-tree-switcher) {
  color: #1890ff;
}

/* 树节点标题容器样式 */
.script-category-tree :deep(.ant-tree-title) {
  display: block;
  width: 100%;
}

/* 树节点操作按钮 - 默认隐藏但占位 */
.tree-node-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

/* 树节点hover时显示操作按钮 */
.group:hover .tree-node-actions {
  opacity: 1;
}
</style>
