<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';

import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue';
import { Button, message, Select, Space, Table } from 'ant-design-vue';

interface UniqueConst {
  attrIds: number[];
}

interface Attribute {
  id: number;
  name: string;
  alias: string;
}

interface Props {
  value?: UniqueConst[];
  attributes?: Attribute[];
}

defineOptions({
  name: 'UniqueConstraintManager',
});

const props = withDefaults(defineProps<Props>(), {
  value: () => [],
  attributes: () => [],
});

const emit = defineEmits<{
  'update:value': [value: UniqueConst[]];
}>();

// 本地约束列表
const localConstraints = ref<UniqueConst[]>([]);
// 编辑状态
const editingIndex = ref<number>(-1);
// 当前编辑的属性IDs
const currentAttrIds = ref<number[]>([]);

// 监听外部值变化
watch(
  () => props.value,
  (newValue) => {
    localConstraints.value = [...(newValue || [])];
  },
  { immediate: true },
);

// 监听编辑状态变化，确保Select组件能正确显示值
watch(
  () => editingIndex.value,
  (newIndex) => {
    console.log('编辑索引变化:', newIndex);
    if (newIndex >= 0) {
      // 编辑现有约束
      const constraint = localConstraints.value[newIndex];
      if (constraint) {
        console.log('加载约束数据:', constraint.attrIds);
        // 使用nextTick确保在DOM更新后设置值
        nextTick(() => {
          currentAttrIds.value = [...constraint.attrIds];
          console.log('延迟设置currentAttrIds:', currentAttrIds.value);
        });
      }
    } else if (newIndex === -2) {
      // 新增模式
      currentAttrIds.value = [];
    }
  },
);

// 发送更新事件
const emitUpdate = () => {
  emit('update:value', [...localConstraints.value]);
};

// 属性选项
const attributeOptions = computed(() => {
  return props.attributes.map((attr) => ({
    label: attr.alias || attr.name,
    value: attr.id,
  }));
});

// 表格列定义
const columns = [
  {
    title: '模型属性',
    dataIndex: 'attrIds',
    key: 'attrIds',
    width: '70%',
  },
  {
    title: '操作',
    key: 'action',
    width: '30%',
  },
];

// 获取属性名称
const getAttributeNames = (attrIds: number[]): string => {
  return attrIds
    .map((id) => {
      const attr = props.attributes.find((a) => a.id === id);
      return attr?.alias || attr?.name || id.toString();
    })
    .join(', ');
};

// 添加新约束
const handleAdd = () => {
  editingIndex.value = -2; // 使用-2表示新增模式，区别于编辑模式
  currentAttrIds.value = [];
};

// 编辑约束
const handleEdit = (index: number) => {
  console.log('开始编辑约束，索引:', index);
  editingIndex.value = index;
};

// 检查约束是否重复
const isDuplicateConstraint = (
  newAttrIds: number[],
  excludeIndex = -1,
): boolean => {
  const sortedNewIds = [...newAttrIds].sort();

  return localConstraints.value.some((constraint, index) => {
    if (index === excludeIndex) return false; // 排除当前编辑的约束

    const sortedExistingIds = [...constraint.attrIds].sort();

    // 比较两个数组是否相同
    return (
      sortedNewIds.length === sortedExistingIds.length &&
      sortedNewIds.every((id, i) => id === sortedExistingIds[i])
    );
  });
};

// 获取重复约束的属性名称用于提示
const getDuplicateConstraintNames = (attrIds: number[]): string => {
  return attrIds
    .map((id) => {
      const attr = props.attributes.find((a) => a.id === id);
      return attr?.alias || attr?.name || id.toString();
    })
    .join(', ');
};

// 保存约束
const handleSave = () => {
  console.log('保存约束，当前选择的属性IDs:', currentAttrIds.value);

  if (!currentAttrIds.value || currentAttrIds.value.length === 0) {
    message.warning('请至少选择一个属性');
    return;
  }

  // 检查是否存在重复约束（新增模式时排除索引设为-1）
  const excludeIndex = editingIndex.value === -2 ? -1 : editingIndex.value;
  if (isDuplicateConstraint(currentAttrIds.value, excludeIndex)) {
    const duplicateNames = getDuplicateConstraintNames(currentAttrIds.value);
    message.error(`约束 [${duplicateNames}] 已存在，请勿重复添加`);
    return;
  }

  if (editingIndex.value === -2) {
    // 新增模式：添加新约束
    localConstraints.value.push({
      attrIds: [...currentAttrIds.value],
    });
  } else {
    // 编辑模式：更新现有约束
    localConstraints.value[editingIndex.value] = {
      attrIds: [...currentAttrIds.value],
    };
  }

  editingIndex.value = -1;
  currentAttrIds.value = [];
  emitUpdate();
};

// 取消编辑
const handleCancel = () => {
  // 新增模式(-2)或编辑模式都直接重置状态，不需要删除任何数据
  editingIndex.value = -1;
  currentAttrIds.value = [];
};

// 删除约束
const handleDelete = (index: number) => {
  localConstraints.value.splice(index, 1);
  if (editingIndex.value === index) {
    editingIndex.value = -1;
    currentAttrIds.value = [];
  } else if (editingIndex.value > index) {
    editingIndex.value--;
  }
  emitUpdate();
};

// 表格数据
const tableData = computed(() => {
  const data = localConstraints.value.map((constraint, index) => ({
    key: index,
    index,
    attrIds: constraint.attrIds,
  }));

  // 如果处于新增模式，添加一个特殊的编辑行
  if (editingIndex.value === -2) {
    data.push({
      key: -2,
      index: -2,
      attrIds: [],
    });
  }

  return data;
});

// 检查当前选择是否会产生重复约束
const isCurrentSelectionDuplicate = computed(() => {
  if (editingIndex.value === -1 || currentAttrIds.value.length === 0) {
    return false;
  }
  // 新增模式时排除索引设为-1，编辑模式时使用实际索引
  const excludeIndex = editingIndex.value === -2 ? -1 : editingIndex.value;
  return isDuplicateConstraint(currentAttrIds.value, excludeIndex);
});

// 当前选择的重复提示信息
const duplicateWarningMessage = computed(() => {
  if (!isCurrentSelectionDuplicate.value) return '';
  const names = getDuplicateConstraintNames(currentAttrIds.value);
  return `警告：约束 [${names}] 已存在`;
});

// 选项过滤函数
const filterOption = (input: string, option: any) => {
  return option?.label?.toLowerCase().includes(input?.toLowerCase() || '');
};

// 处理Select组件值变化
const handleSelectChange = (value: any) => {
  console.log('Select值变化:', value);
  currentAttrIds.value = Array.isArray(value) ? value : [];
};

// 当前编辑的属性值（用于Select组件显示）
const currentEditingValue = computed(() => {
  console.log('currentEditingValue计算:', currentAttrIds.value);
  return currentAttrIds.value;
});

// 暴露组件给外部使用
defineExpose({
  handleAdd,
  handleEdit,
  handleSave,
  handleCancel,
  handleDelete,
  isDuplicateConstraint,
  isCurrentSelectionDuplicate,
});
</script>

<template>
  <div class="unique-constraint-manager">
    <div class="header">
      <Button type="primary" @click="handleAdd">
        <template #icon>
          <PlusOutlined />
        </template>
        新增
      </Button>
    </div>

    <Table
      :columns="columns"
      :data-source="tableData"
      :pagination="false"
      size="small"
      class="constraint-table"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'attrIds'">
          <div v-if="editingIndex === record.index" class="editing-cell">
            <Select
              :value="currentEditingValue"
              mode="multiple"
              placeholder="请选择属性（多选）"
              :options="attributeOptions"
              style="width: 100%"
              :status="isCurrentSelectionDuplicate ? 'error' : ''"
              :filter-option="filterOption"
              @change="handleSelectChange"
            />

            <!-- 重复约束警告 -->
            <div v-if="duplicateWarningMessage" class="duplicate-warning">
              {{ duplicateWarningMessage }}
            </div>

            <div class="edit-actions">
              <Button
                type="primary"
                size="small"
                :disabled="isCurrentSelectionDuplicate"
                @click="handleSave"
              >
                保存
              </Button>
              <Button size="small" @click="handleCancel"> 取消 </Button>
            </div>
          </div>
          <div v-else class="display-cell">
            {{ getAttributeNames(record.attrIds) }}
          </div>
        </template>

        <template v-else-if="column.key === 'action'">
          <Space v-if="editingIndex !== record.index">
            <Button type="text" size="small" @click="handleEdit(record.index)">
              <template #icon>
                <EditOutlined />
              </template>
              编辑
            </Button>
            <Button
              type="text"
              danger
              size="small"
              @click="handleDelete(record.index)"
            >
              <template #icon>
                <DeleteOutlined />
              </template>
              删除
            </Button>
          </Space>
        </template>
      </template>
    </Table>
  </div>
</template>

<style scoped>
.unique-constraint-manager {
  padding: 16px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

.header {
  margin-bottom: 16px;
}

.constraint-table {
  background: #fff;
  border-radius: 4px;
}

.editing-cell {
  padding: 8px 0;
}

.edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.display-cell {
  padding: 8px 0;
  color: #1677ff;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 8px 12px;
}

:deep(.ant-table-thead > tr > th) {
  font-weight: 600;
  background: #f5f5f5;
}

.duplicate-warning {
  padding: 2px 0;
  margin-top: 4px;
  font-size: 12px;
  color: #ff4d4f;
}
</style>
