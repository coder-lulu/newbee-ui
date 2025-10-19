<template>
  <div class="ci-relation-form-test p-6">
    <h2 class="text-2xl font-bold mb-4">CI关系表单测试页面</h2>
    
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">表单功能测试</h3>
      
      <!-- 测试按钮 -->
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <a-button type="primary" @click="testCreateForm">
            测试创建表单
          </a-button>
          <a-button @click="testEditForm">
            测试编辑表单
          </a-button>
          <a-button @click="testFormWithData" type="dashed">
            测试表单数据填充
          </a-button>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">预设源CI ID:</label>
          <a-input-number v-model:value="presetSourceCiId" :min="1" placeholder="输入源CI ID" />
        </div>
      </div>
      
      <!-- 测试结果显示 -->
      <div v-if="testResult" class="mt-6">
        <h4 class="text-md font-semibold mb-2">测试结果:</h4>
        <a-alert
          :message="testResult.message"
          :type="testResult.type"
          :description="testResult.description"
          show-icon
        />
      </div>
      
      <!-- 表单数据预览 -->
      <div v-if="formData" class="mt-6">
        <h4 class="text-md font-semibold mb-2">表单数据预览:</h4>
        <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">{{ JSON.stringify(formData, null, 2) }}</pre>
      </div>
    </div>

    <!-- CI关系表单组件 -->
    <CiRelationFormModal
      v-model:open="formModalVisible"
      :edit-data="editData"
      :source-ci-id="sourceCiId"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';

// 组件导入
import CiRelationFormModal from './components/CiRelationFormModal.vue';

// 响应式数据
const formModalVisible = ref(false);
const editData = ref();
const sourceCiId = ref<number>();
const presetSourceCiId = ref<number>(1);
const testResult = ref<{
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  description?: string;
}>();
const formData = ref();

// 测试创建表单
const testCreateForm = () => {
  editData.value = undefined;
  sourceCiId.value = presetSourceCiId.value;
  formModalVisible.value = true;
  
  testResult.value = {
    message: '创建表单测试',
    type: 'info',
    description: `打开创建表单，预设源CI ID: ${sourceCiId.value}`,
  };
  
  formData.value = {
    mode: 'create',
    sourceCiId: sourceCiId.value,
    timestamp: new Date().toISOString(),
  };
};

// 测试编辑表单
const testEditForm = () => {
  // 模拟编辑数据
  editData.value = {
    id: 123,
    sourceCiId: 1,
    sourceCiName: 'Web服务器-001',
    targetCiId: 2,
    targetCiName: '数据库服务器-002',
    relationTypeId: 1,
    relationTypeName: '依赖',
    relationStrength: 'normal',
    status: 'active',
    discoverySource: 'manual',
    properties: {
      description: '应用服务器依赖数据库服务器',
      priority: 'high',
    },
    attributeMappings: [
      {
        sourceAttrId: 1,
        targetAttrId: 2,
        syncStatus: 'synced',
        conflictReason: '',
      },
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  };
  
  sourceCiId.value = undefined;
  formModalVisible.value = true;
  
  testResult.value = {
    message: '编辑表单测试',
    type: 'info',
    description: '打开编辑表单，加载模拟的关系数据',
  };
  
  formData.value = {
    mode: 'edit',
    editData: editData.value,
    timestamp: new Date().toISOString(),
  };
};

// 测试表单数据填充
const testFormWithData = () => {
  // 模拟复杂的关系数据
  editData.value = {
    id: 456,
    sourceCiId: 3,
    sourceCiName: '负载均衡器-003',
    targetCiId: 4,
    targetCiName: '应用服务器-004',
    relationTypeId: 2,
    relationTypeName: '连接',
    relationStrength: 'strong',
    status: 'active',
    discoverySource: 'auto_discovery',
    properties: {
      protocol: 'HTTP',
      port: 80,
      healthCheck: true,
      maxConnections: 1000,
    },
    attributeMappings: [
      {
        sourceAttrId: 1,
        targetAttrId: 1,
        syncStatus: 'synced',
        conflictReason: '',
      },
      {
        sourceAttrId: 2,
        targetAttrId: 3,
        syncStatus: 'pending',
        conflictReason: '',
      },
      {
        sourceAttrId: 3,
        targetAttrId: 4,
        syncStatus: 'conflict',
        conflictReason: '数据类型不匹配',
      },
    ],
    createdAt: '2024-02-01T10:30:00.000Z',
    updatedAt: '2024-02-15T14:45:00.000Z',
  };
  
  formModalVisible.value = true;
  
  testResult.value = {
    message: '复杂数据填充测试',
    type: 'info',
    description: '测试表单处理复杂关系数据，包括多个属性映射和JSON属性',
  };
  
  formData.value = {
    mode: 'edit_complex',
    editData: editData.value,
    timestamp: new Date().toISOString(),
  };
};

// 表单成功处理
const handleFormSuccess = () => {
  testResult.value = {
    message: '表单操作成功',
    type: 'success',
    description: '关系创建/更新操作已成功完成',
  };
  
  message.success('关系操作成功！');
  
  // 更新表单数据记录
  formData.value = {
    ...formData.value,
    success: true,
    successTime: new Date().toISOString(),
  };
};
</script>

<style scoped>
.ci-relation-form-test {
  background-color: #f5f5f5;
  min-height: 100vh;
}
</style>