<script setup lang="ts">
import type { IpamDomain } from '../../../api/ipam/types';

import { onMounted, ref } from 'vue';

import { FolderOutlined, GlobalOutlined } from '@ant-design/icons-vue';
import { message, Tree } from 'ant-design-vue';

import { DomainApi } from '../../../api/ipam/domain';

interface Emits {
  (e: 'select', domainId: number, domainName: string): void;
}

const emit = defineEmits<Emits>();

// 响应式数据
const loading = ref(false);
const treeData = ref<any[]>([]);
const selectedKeys = ref<string[]>([]);

// 加载网域数据
async function loadDomains() {
  try {
    loading.value = true;

    // 使用真实API加载数据
    const listData = await DomainApi.list({
      page: 1,
      pageSize: 100,
    });

    const domains = listData.data;
    // 转换为树形数据
    treeData.value = domains.map((domain: IpamDomain) => ({
      key: domain.id.toString(),
      title: domain.name,
      icon: domain.type === '安全域' ? GlobalOutlined : FolderOutlined,
      isLeaf: true,
      domain,
    }));
  } catch (error) {
    console.error('加载网域数据失败:', error);

    // 网络错误时使用模拟数据
    const mockDomains = [
      { id: 1, name: '公网域', type: '安全域', description: '公网IP地址段' },
      { id: 2, name: '内网域', type: '业务域', description: '内网IP地址段' },
      {
        id: 3,
        name: '测试域',
        type: '自定义',
        description: '测试环境IP地址段',
      },
    ];

    treeData.value = mockDomains.map((domain) => ({
      key: domain.id.toString(),
      title: domain.name,
      icon: domain.type === '安全域' ? GlobalOutlined : FolderOutlined,
      isLeaf: true,
      domain,
    }));

    message.warning('网络连接失败，使用模拟数据');
  } finally {
    loading.value = false;
  }
}

// 处理节点选择
function handleSelect(keys: (number | string)[], info: any) {
  selectedKeys.value = keys.map(String);
  if (keys.length > 0 && info.node.domain) {
    const domain = info.node.domain;
    emit('select', domain.id, domain.name);
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadDomains();
});

// 暴露方法给父组件
defineExpose({
  loadDomains,
});
</script>

<template>
  <div class="domain-tree">
    <Tree
      :selected-keys="selectedKeys"
      :tree-data="treeData"
      :loading="loading"
      :show-icon="true"
      :block-node="true"
      @select="handleSelect"
    />
  </div>
</template>

<style scoped>
.domain-tree {
  height: 100%;
  padding: 8px;
  overflow: auto;
}

.tree-node-title {
  display: flex;
  gap: 6px;
  align-items: center;
}

.tree-node-icon {
  color: #1890ff;
}

:deep(.ant-tree-node-content-wrapper) {
  padding: 4px 8px;
  border-radius: 4px;
}

:deep(.ant-tree-node-content-wrapper:hover) {
  background-color: #f5f5f5;
}

:deep(.ant-tree-node-content-wrapper.ant-tree-node-selected) {
  background-color: #e6f7ff;
}
</style>
