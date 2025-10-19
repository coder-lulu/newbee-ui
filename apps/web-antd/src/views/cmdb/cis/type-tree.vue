<script lang="ts">
import { defineComponent, onMounted, ref, watch, computed } from 'vue';

import { CloseOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { InputSearch, Tree } from 'ant-design-vue';

import { getCiTypeGroupItemTree } from '#/api/cmdb/ci_types';
import type { CiTypeGroupItemTreeQuery } from '#/api/cmdb/ci_types/model';

export default defineComponent({
  name: 'TypeTree',
  components: {
    Tree,
    InputSearch,
    SearchOutlined,
    CloseOutlined,
  },
  props: {
    // 查询参数
    queryParams: {
      type: Object as () => CiTypeGroupItemTreeQuery,
      default: () => ({}),
    },
    // 外部传入的树数据（用于本地搜索）
    externalTreeData: {
      type: Array as () => any[],
      default: () => [],
    },
    // 搜索关键词（用于高亮显示）
    searchKeyword: {
      type: String,
      default: '',
    },
  },
  emits: ['selectAttribute', 'dataLoaded'],
  setup(props, { emit }) {
    const treeData = ref<any[]>([]);
    const loading = ref(false);
    const selectedKeys = ref<(number | string)[]>([]);
    const expandedKeys = ref<(number | string)[]>([]);
    
    // 搜索相关状态
    const searchValue = ref('');
    const originalTreeData = ref<any[]>([]);

    // 根据搜索过滤后的树数据
    const filteredTreeData = computed(() => {
      if (!searchValue.value) return treeData.value;

      return treeData.value.map((group) => {
        // 检查分组名称是否匹配
        const groupMatches = group.title.toLowerCase().includes(searchValue.value.toLowerCase());
        
        // 过滤子项
        const filteredItems = group.children?.filter((item: any) => 
          item.title.toLowerCase().includes(searchValue.value.toLowerCase())
        ) || [];
        
        // 如果分组名称匹配或有匹配的子项，则保留该分组
        if (groupMatches || filteredItems.length > 0) {
          return {
            ...group,
            children: groupMatches ? group.children : filteredItems
          };
        }
        
        return null;
      }).filter(Boolean);
    });

    // 转换数据格式
    const transformTreeData = (response: any[]) => {
      // 按sort字段对组进行排序
      const sortedGroups = response.sort((a, b) => {
        const sortA = typeof a.sort === 'number' ? a.sort : 0;
        const sortB = typeof b.sort === 'number' ? b.sort : 0;
        return sortA - sortB;
      });

      // 转换数据格式
      const transformedData = sortedGroups.map((group) => {
        const groupKey = `group-${group.id}`;

        // 按sort字段对items进行排序
        const sortedItems = (group.items || []).sort((a: any, b: any) => {
          const sortA = typeof a.sort === 'number' ? a.sort : 0;
          const sortB = typeof b.sort === 'number' ? b.sort : 0;
          return sortA - sortB;
        });

        // 只有当有子项时才创建children数组，否则不设置children属性
        const treeNode: any = {
          key: groupKey,
          title: group.name,
        };

        if (sortedItems.length > 0) {
          treeNode.children = sortedItems.map((item: any) => ({
            key: `item-${item.id}`,
            title: item.name,
            typeId: item.typeId,
            typeName: item.name,
            sort: item.sort,
            isLeaf: true,
          }));
        }

        return treeNode;
      });

      return transformedData;
    };

    // 根据过滤参数过滤树数据
    const filterTreeData = (data: any[]) => {
      if (!props.queryParams?.excludeTypeNames || props.queryParams.excludeTypeNames.length === 0) {
        return data;
      }

      const excludeNames = props.queryParams.excludeTypeNames.map(name => name.toLowerCase());
      
      return data.map((group) => {
        // 检查父节点名称是否在排除列表中
        const groupName = group.title?.toLowerCase() || '';
        if (excludeNames.some(name => groupName.includes(name))) {
          return null; // 标记为需要过滤掉
        }

        // 过滤子项 - 创建新的children数组，不修改原始数据
        if (group.children && group.children.length > 0) {
          const filteredChildren = group.children.filter((item: any) => {
            const itemName = item.title?.toLowerCase() || '';
            return !excludeNames.some(name => itemName.includes(name));
          });
          
          // 如果过滤后没有子项，则不显示该分组
          if (filteredChildren.length === 0) {
            return null; // 标记为需要过滤掉
          }
          
          // 返回新的group对象，包含过滤后的children
          return {
            ...group,
            children: filteredChildren
          };
        }

        // 如果没有children属性，直接返回原group
        return group;
      }).filter(Boolean); // 过滤掉null值
    };

    // 加载树数据
    const loadTreeData = async () => {
      try {
        loading.value = true;
        const response = await getCiTypeGroupItemTree(props.queryParams);
        if (response && Array.isArray(response)) {
          const transformedData = transformTreeData(response);
          const filteredData = filterTreeData(transformedData);
          treeData.value = filteredData;
          originalTreeData.value = filteredData;
          
          // 通知父组件数据已加载
          emit('dataLoaded', filteredData);

          // 设置默认展开所有有子节点的父节点
          expandedKeys.value = treeData.value
            .filter((group) => group.children && group.children.length > 0)
            .map((group) => group.key);

          // 自动选择第一个节点
          autoSelectFirst();
        }
      } catch (error) {
        console.error('加载树数据失败:', error);
      } finally {
        loading.value = false;
      }
    };

    // 自动选择第一个有items的节点
    const autoSelectFirst = () => {
      for (const group of treeData.value) {
        if (group.children && group.children.length > 0) {
          // 第一个子项（已经排序）
          const firstItem = group.children[0];
          if (firstItem) {
            selectedKeys.value = [firstItem.key];
            emit('selectAttribute', firstItem.typeId, firstItem.typeName);
            break;
          }
        }
      }
    };

    // 处理节点选择
    const handleSelect = (
      keys: (number | string)[],
      info: {
        event: 'select';
        nativeEvent: MouseEvent;
        node: any;
        selected: boolean;
        selectedNodes: any[];
      },
    ) => {
      selectedKeys.value = keys;
      const selectedNode = info.selectedNodes[0];
      if (selectedNode && selectedNode.typeId) {
        emit('selectAttribute', selectedNode.typeId, selectedNode.typeName);
      }
    };

    // 处理节点展开/收缩
    const handleExpand = (
      keys: (number | string)[],
      _info: {
        expanded: boolean;
        node: any;
      },
    ) => {
      expandedKeys.value = keys;
    };

    // 监听外部传入的树数据
    watch(
      () => props.externalTreeData,
      (newData) => {
        if (newData && newData.length > 0) {
          treeData.value = newData;
          // 设置默认展开所有有子节点的父节点
          expandedKeys.value = treeData.value
            .filter((group) => group.children && group.children.length > 0)
            .map((group) => group.key);
        }
      },
      { deep: true, immediate: true }
    );

    // 监听查询参数变化，重新加载数据
    watch(
      () => props.queryParams,
      () => {
        loadTreeData();
      },
      { deep: true }
    );

    // 高亮搜索结果
    const getHighlightedName = (name: string, search: string) => {
      if (!search || !name) return name;

      const index = name.toLowerCase().indexOf(search.toLowerCase());
      if (index === -1) return name;
      const preStr = name.slice(0, Math.max(0, index));
      const matchStr = name.slice(index, index + search.length);
      const postStr = name.slice(Math.max(0, index + search.length));

      return `${preStr}<span class="search-highlight">${matchStr}</span>${postStr}`;
    };

    // 处理搜索
    const handleSearch = (value: string) => {
      if (value && value.length > 0) {
        searchValue.value = value;
      } else {
        clearSearch();
      }
    };

    // 清空搜索
    const clearSearch = () => {
      searchValue.value = '';
    };

    // 处理按下回车键
    const handleSearchKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSearch(searchValue.value);
      }
    };

    onMounted(() => {
      loadTreeData();
    });

    return {
      handleSelect,
      handleExpand,
      loading,
      selectedKeys,
      treeData: filteredTreeData,
      expandedKeys,
      getHighlightedName,
      searchValue,
      handleSearch,
      clearSearch,
      handleSearchKeyDown,
    };
  },
});
</script>

<template>
  <div class="type-tree">
    <!-- 搜索框 -->
    <div class="tree-search">
      <div class="search-container">
        <InputSearch
          :value="searchValue"
          placeholder="搜索CI类型..."
          size="small"
          class="search-input"
          @keydown="handleSearchKeyDown"
          @search="handleSearch"
          @change="(e) => searchValue = e.target.value || ''"
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

    <Tree
      :tree-data="treeData"
      :selected-keys="selectedKeys"
      :loading="loading"
      :expanded-keys="expandedKeys"
      :show-line="{ showLeafIcon: false }"
      :show-icon="false"
      @select="handleSelect"
      @expand="handleExpand"
    />
  </div>
</template>

<style scoped>
.type-tree {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 搜索框样式 */
.tree-search {
  padding: 16px 16px 8px 16px;
  background: transparent;
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
.search-highlight {
  background-color: #fffbe6;
  color: #faad14;
  font-weight: bold;
  padding: 0 2px;
  border-radius: 2px;
}

/* 自定义树结构样式 */
.type-tree :deep(.ant-tree) {
  background: transparent;
  padding: 0 16px 16px 16px;
}

/* 树节点样式 */
.type-tree :deep(.ant-tree-treenode) {
  padding: 2px 0;
}

/* 树节点标题样式 */
.type-tree :deep(.ant-tree-node-content-wrapper) {
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

/* 树节点悬停效果 */
.type-tree :deep(.ant-tree-node-content-wrapper:hover) {
  background-color: #f5f5f5;
}

/* 选中节点样式 */
.type-tree :deep(.ant-tree-node-selected .ant-tree-node-content-wrapper) {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
}

/* 连接线样式 - 虚线效果 */
.type-tree :deep(.ant-tree-indent-unit) {
  border-left: 1px dashed #d9d9d9;
}

.type-tree :deep(.ant-tree-switcher) {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
}

/* 连接线 - 水平虚线 */
.type-tree :deep(.ant-tree-switcher-line-icon) {
  border-left: 1px dashed #d9d9d9;
}

/* 父节点连接线 */
.type-tree :deep(.ant-tree-switcher::before) {
  border-left: 1px dashed #d9d9d9;
}

/* 最后一个子节点的连接线 */
.type-tree :deep(.ant-tree-treenode-leaf-last > .ant-tree-switcher::before) {
  border-left: 1px dashed #d9d9d9;
}

/* 树线条颜色和样式 */
.type-tree :deep(.ant-tree-line) {
  border-color: #d9d9d9;
  border-style: dashed;
}

.type-tree :deep(.ant-tree-line::before) {
  border-left: 1px dashed #d9d9d9;
}

.type-tree :deep(.ant-tree-line::after) {
  border-bottom: 1px dashed #d9d9d9;
}

/* 叶子节点图标样式 */
.type-tree :deep(.ant-tree-iconEle) {
  display: inline-block;
  width: 16px;
  height: 16px;
  font-size: 12px;
  line-height: 16px;
  color: #8c8c8c;
  text-align: center;
}

/* 父节点图标样式 */
.type-tree :deep(.ant-tree-switcher-icon) {
  font-size: 12px;
  color: #666;
}

/* 树节点间距调整 */
.type-tree :deep(.ant-tree-child-tree) {
  margin-left: 18px;
}

/* 根节点样式 - 只有有子节点的才显示蓝色 */
.type-tree :deep(.ant-tree-treenode-switcher-open) {
  font-weight: 500;
  color: #1890ff;
}

.type-tree :deep(.ant-tree-treenode-switcher-close) {
  font-weight: 500;
  color: #666;
}

/* 没有子节点的父节点样式 */
.type-tree
  :deep(
    .ant-tree-treenode:not(.ant-tree-treenode-switcher-open):not(
        .ant-tree-treenode-switcher-close
      )
  ) {
  font-weight: 500;
  color: #333;
}

/* 叶子节点样式 */
.type-tree :deep(.ant-tree-treenode-leaf) {
  font-weight: 400;
  color: #333;
}

/* 加载状态样式 */
.type-tree :deep(.ant-tree-treenode-loading .ant-tree-switcher) {
  color: #1890ff;
}
</style>
