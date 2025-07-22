<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';

import { Tree } from 'ant-design-vue';

import { getCiTypeGroupItemTree } from '#/api/cmdb/ci_types';

export default defineComponent({
  name: 'TypeTree',
  components: {
    Tree,
  },
  emits: ['selectAttribute'],
  setup(props, { emit }) {
    const treeData = ref<any[]>([]);
    const loading = ref(false);
    const selectedKeys = ref<(number | string)[]>([]);
    const expandedKeys = ref<(number | string)[]>([]);

    // 加载树数据
    const loadTreeData = async () => {
      try {
        loading.value = true;
        const response = await getCiTypeGroupItemTree();
        if (response && Array.isArray(response)) {
          // 按sort字段对组进行排序
          const sortedGroups = response.sort((a, b) => {
            const sortA = typeof a.sort === 'number' ? a.sort : 0;
            const sortB = typeof b.sort === 'number' ? b.sort : 0;
            return sortA - sortB;
          });

          // 转换数据格式
          treeData.value = sortedGroups.map((group) => {
            const groupKey = `group-${group.id}`;

            // 按sort字段对items进行排序
            const sortedItems = (group.items || []).sort((a, b) => {
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
              treeNode.children = sortedItems.map((item) => ({
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

    onMounted(() => {
      loadTreeData();
    });

    return {
      handleSelect,
      handleExpand,
      loading,
      selectedKeys,
      treeData,
      expandedKeys,
    };
  },
});
</script>

<template>
  <div class="type-tree">
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
  padding: 16px;
}

/* 自定义树结构样式 */
.type-tree :deep(.ant-tree) {
  background: transparent;
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
