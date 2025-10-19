<script setup lang="ts">
import { ref, watch } from 'vue';

import { Button, Card, Checkbox, Input, Space } from 'ant-design-vue';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';

import type { CiPermissionOperation } from '#/api/cmdb/cipermission';

interface Props {
  modelValue: CiPermissionOperation[];
}

interface Emits {
  (e: 'update:modelValue', value: CiPermissionOperation[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const operations = ref<CiPermissionOperation[]>([]);

// 预定义的操作类型
const PREDEFINED_OPERATIONS = [
  { operation: 'read', label: '读取' },
  { operation: 'write', label: '写入' },
  { operation: 'delete', label: '删除' },
  { operation: 'approve', label: '审批' },
  { operation: 'export', label: '导出' },
];

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    operations.value = newValue || [];
  },
  { immediate: true, deep: true },
);

// 监听内部值变化并向外发送
watch(
  operations,
  (newValue) => {
    emit('update:modelValue', newValue);
  },
  { deep: true },
);

function addOperation() {
  operations.value.push({
    operation: '',
    description: '',
  });
}

function removeOperation(index: number) {
  operations.value.splice(index, 1);
}

function updateOperation(index: number, field: keyof CiPermissionOperation, value: any) {
  operations.value[index] = {
    ...operations.value[index],
    [field]: value,
  };
}

function addPredefinedOperation(predefined: { operation: string; label: string }) {
  const exists = operations.value.some(op => op.operation === predefined.operation);
  if (!exists) {
    operations.value.push({
      operation: predefined.operation,
      allowed: true,
      description: predefined.label,
    });
  }
}
</script>

<template>
  <Card title="操作权限配置" size="small">
    <div class="space-y-4">
      <!-- 快捷添加预定义操作 -->
      <div>
        <div class="mb-2 text-sm font-medium">快捷添加:</div>
        <Space wrap>
          <Button
            v-for="predefined in PREDEFINED_OPERATIONS"
            :key="predefined.operation"
            size="small"
            type="dashed"
            :disabled="operations.some(op => op.operation === predefined.operation)"
            @click="addPredefinedOperation(predefined)"
          >
            {{ predefined.label }}
          </Button>
        </Space>
      </div>

      <!-- 操作列表 -->
      <div class="space-y-2">
        <div
          v-for="(operation, index) in operations"
          :key="index"
          class="flex items-center gap-2 p-3 border border-gray-200 rounded"
        >
          <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              :value="operation.operation"
              placeholder="操作名称 (如: read, write)"
              @input="updateOperation(index, 'operation', $event.target.value)"
            />
            <Input
              :value="operation.description"
              placeholder="描述"
              @input="updateOperation(index, 'description', $event.target.value)"
            />
            <div class="flex items-center">
              <Checkbox
                :checked="operation.allowed"
                @change="updateOperation(index, 'allowed', $event.target.checked)"
              >
                允许此操作
              </Checkbox>
            </div>
          </div>
          <Button
            size="small"
            danger
            type="text"
            @click="removeOperation(index)"
          >
            <DeleteOutlined />
          </Button>
        </div>
      </div>

      <!-- 添加新操作 -->
      <Button
        type="dashed"
        block
        @click="addOperation"
      >
        <PlusOutlined />
        添加操作
      </Button>
    </div>
  </Card>
</template>