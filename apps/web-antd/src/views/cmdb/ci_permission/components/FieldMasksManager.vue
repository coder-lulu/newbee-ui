<script setup lang="ts">
import { ref, watch } from 'vue';

import { Button, Card, Input, Tag } from 'ant-design-vue';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';

import type { CiPermissionFieldMasks } from '#/api/cmdb/cipermission';

interface Props {
  modelValue: CiPermissionFieldMasks;
}

interface Emits {
  (e: 'update:modelValue', value: CiPermissionFieldMasks): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const masks = ref<CiPermissionFieldMasks>({
  fields: [],
});

const newField = ref('');

// 常用字段示例
const COMMON_FIELDS = [
  'password',
  'phone',
  'email',
  'id_card',
  'salary',
  'bank_account',
];

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    masks.value = newValue || { fields: [] };
  },
  { immediate: true, deep: true },
);

// 监听内部值变化并向外发送
watch(
  masks,
  (newValue) => {
    emit('update:modelValue', newValue);
  },
  { deep: true },
);

function addField() {
  if (newField.value.trim() && !masks.value.fields.includes(newField.value.trim())) {
    masks.value.fields.push(newField.value.trim());
    newField.value = '';
  }
}

function removeField(field: string) {
  const index = masks.value.fields.indexOf(field);
  if (index > -1) {
    masks.value.fields.splice(index, 1);
  }
}

function addCommonField(field: string) {
  if (!masks.value.fields.includes(field)) {
    masks.value.fields.push(field);
  }
}

function handleInputKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    addField();
  }
}
</script>

<template>
  <Card title="字段掩码配置" size="small">
    <div class="space-y-4">
      <!-- 常用字段快捷添加 -->
      <div>
        <div class="mb-2 text-sm font-medium">常用敏感字段:</div>
        <div class="flex flex-wrap gap-2">
          <Tag
            v-for="field in COMMON_FIELDS"
            :key="field"
            :color="masks.fields.includes(field) ? 'blue' : 'default'"
            class="cursor-pointer"
            @click="addCommonField(field)"
          >
            {{ field }}
          </Tag>
        </div>
      </div>

      <!-- 已选择的字段 -->
      <div v-if="masks.fields.length > 0">
        <div class="mb-2 text-sm font-medium">已配置的掩码字段:</div>
        <div class="flex flex-wrap gap-2">
          <Tag
            v-for="field in masks.fields"
            :key="field"
            color="blue"
            closable
            @close="removeField(field)"
          >
            {{ field }}
          </Tag>
        </div>
      </div>

      <!-- 添加新字段 -->
      <div class="flex gap-2">
        <Input
          v-model:value="newField"
          placeholder="输入字段名称"
          @keydown="handleInputKeydown"
        />
        <Button
          type="primary"
          :disabled="!newField.trim() || masks.fields.includes(newField.trim())"
          @click="addField"
        >
          <PlusOutlined />
          添加
        </Button>
      </div>

      <!-- 说明 -->
      <div class="text-xs text-gray-500 p-2 bg-gray-50 rounded">
        <div><strong>字段掩码:</strong> 指定需要脱敏处理的敏感字段</div>
        <div><strong>示例:</strong> password, phone, email, id_card 等</div>
        <div><strong>效果:</strong> 查询结果中这些字段将被掩码处理，如 138****1234</div>
      </div>
    </div>
  </Card>
</template>