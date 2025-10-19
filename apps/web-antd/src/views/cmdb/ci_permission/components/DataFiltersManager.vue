<script setup lang="ts">
import { ref, watch } from 'vue';

import { Button, Card, Input, Select, Space } from 'ant-design-vue';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';

import type { CiPermissionDataFilters, CiPermissionFilterRule } from '#/api/cmdb/cipermission';

interface Props {
  modelValue: CiPermissionDataFilters;
}

interface Emits {
  (e: 'update:modelValue', value: CiPermissionDataFilters): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const filters = ref<CiPermissionDataFilters>({
  rules: [],
  logic: 'AND',
});

// 操作符选项
const OPERATORS = [
  { label: '等于', value: '=' },
  { label: '不等于', value: '!=' },
  { label: '大于', value: '>' },
  { label: '大于等于', value: '>=' },
  { label: '小于', value: '<' },
  { label: '小于等于', value: '<=' },
  { label: '包含', value: 'LIKE' },
  { label: '不包含', value: 'NOT LIKE' },
  { label: '在列表中', value: 'IN' },
  { label: '不在列表中', value: 'NOT IN' },
];

// 逻辑操作符选项
const LOGIC_OPTIONS = [
  { label: '且 (AND)', value: 'AND' },
  { label: '或 (OR)', value: 'OR' },
];

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    filters.value = newValue || { rules: [], logic: 'AND' };
  },
  { immediate: true, deep: true },
);

// 监听内部值变化并向外发送
watch(
  filters,
  (newValue) => {
    emit('update:modelValue', newValue);
  },
  { deep: true },
);

function addRule() {
  filters.value.rules.push({
    field: '',
    operator: '=',
    value: '',
  });
}

function removeRule(index: number) {
  filters.value.rules.splice(index, 1);
}

function updateRule(index: number, field: keyof CiPermissionFilterRule, value: any) {
  filters.value.rules[index] = {
    ...filters.value.rules[index],
    [field]: value,
  };
}

function updateLogic(logic: string) {
  filters.value.logic = logic;
}
</script>

<template>
  <Card title="数据过滤规则" size="small">
    <div class="space-y-4">
      <!-- 逻辑操作符选择 -->
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">规则逻辑:</span>
        <Select
          :value="filters.logic"
          :options="LOGIC_OPTIONS"
          class="w-32"
          @change="updateLogic"
        />
      </div>

      <!-- 过滤规则列表 -->
      <div class="space-y-2">
        <div
          v-for="(rule, index) in filters.rules"
          :key="index"
          class="flex items-center gap-2 p-3 border border-gray-200 rounded"
        >
          <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              :value="rule.field"
              placeholder="字段名称"
              @input="updateRule(index, 'field', $event.target.value)"
            />
            <Select
              :value="rule.operator"
              :options="OPERATORS"
              placeholder="操作符"
              @change="updateRule(index, 'operator', $event)"
            />
            <Input
              :value="rule.value"
              placeholder="值"
              @input="updateRule(index, 'value', $event.target.value)"
            />
          </div>
          <Button
            size="small"
            danger
            type="text"
            @click="removeRule(index)"
          >
            <DeleteOutlined />
          </Button>
        </div>
      </div>

      <!-- 添加新规则 -->
      <Button
        type="dashed"
        block
        @click="addRule"
      >
        <PlusOutlined />
        添加过滤规则
      </Button>

      <!-- 说明 -->
      <div class="text-xs text-gray-500 p-2 bg-gray-50 rounded">
        <div><strong>字段名称:</strong> 数据库字段名，如 department_id, user_id</div>
        <div><strong>操作符:</strong> 比较操作符，支持等于、大于、包含等</div>
        <div><strong>值:</strong> 比较的值，支持字符串、数字、逗号分隔的列表</div>
      </div>
    </div>
  </Card>
</template>