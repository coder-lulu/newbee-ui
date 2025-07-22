<script setup lang="ts">
import { reactive, ref } from 'vue';

import { ReloadOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { Button, Col, Form, Input, Row, Select, Space } from 'ant-design-vue';

// 定义筛选参数类型
interface FilterParams {
  permission_id?: string;
  subject_name?: string;
  subject_type?: string;
  permission_level?: string;
  scope_type?: string;
  status?: number;
}

// 组件属性定义
interface Props {
  value?: FilterParams;
}

// 组件事件定义
interface Emits {
  (e: 'update:value', value: FilterParams): void;
  (e: 'search'): void;
  (e: 'reset'): void;
}

// 导出组件名称
defineOptions({
  name: 'FilterForm',
});

const props = withDefaults(defineProps<Props>(), {
  value: () => ({}),
});

const emit = defineEmits<Emits>();

// 表单数据
const formData = reactive<FilterParams>({
  permission_id: props.value?.permission_id || '',
  subject_name: props.value?.subject_name || '',
  subject_type: props.value?.subject_type || undefined,
  permission_level: props.value?.permission_level || undefined,
  scope_type: props.value?.scope_type || undefined,
  status: props.value?.status || undefined,
});

// 展开/收起状态
const expanded = ref(false);

// 权限主体类型选项
const subjectTypeOptions = [
  { label: '用户', value: 'user' },
  { label: '角色', value: 'role' },
  { label: '部门', value: 'department' },
  { label: '用户组', value: 'group' },
  { label: '系统', value: 'system' },
];

// 权限级别选项
const permissionLevelOptions = [
  { label: '无权限', value: 'none' },
  { label: '只读', value: 'read' },
  { label: '读写', value: 'write' },
  { label: '管理员', value: 'admin' },
  { label: '超级管理员', value: 'super_admin' },
];

// 权限范围选项
const scopeTypeOptions = [
  { label: '全局权限', value: 'global' },
  { label: 'CI类型权限', value: 'ci_type' },
  { label: 'CI实例权限', value: 'ci_instance' },
  { label: '属性权限', value: 'attribute' },
  { label: '字段权限', value: 'field' },
];

// 状态选项
const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
];

// 搜索处理
const handleSearch = () => {
  emit('update:value', { ...formData });
  emit('search');
};

// 重置处理
const handleReset = () => {
  formData.permission_id = '';
  formData.subject_name = '';
  formData.subject_type = undefined;
  formData.permission_level = undefined;
  formData.scope_type = undefined;
  formData.status = undefined;

  emit('update:value', { ...formData });
  emit('reset');
};

// 切换展开状态
const toggleExpanded = () => {
  expanded.value = !expanded.value;
};

// 处理Select组件值变化的方法
const handleSubjectTypeChange = (val: any) => {
  formData.subject_type = val;
};

const handlePermissionLevelChange = (val: any) => {
  formData.permission_level = val;
};

const handleScopeTypeChange = (val: any) => {
  formData.scope_type = val;
};

const handleStatusChange = (val: any) => {
  formData.status = val;
};
</script>

<template>
  <div class="filter-form">
    <Form :model="formData" layout="inline">
      <Row :gutter="[16, 16]" class="filter-row">
        <!-- 第一行：基础筛选 -->
        <Col :span="6">
          <Form.Item label="权限ID" name="permission_id">
            <Input
              :value="formData.permission_id"
              placeholder="请输入权限ID"
              allow-clear
              @update:value="(val) => (formData.permission_id = val)"
            />
          </Form.Item>
        </Col>

        <Col :span="6">
          <Form.Item label="权限主体" name="subject_name">
            <Input
              :value="formData.subject_name"
              placeholder="请输入主体名称"
              allow-clear
              @update:value="(val) => (formData.subject_name = val)"
            />
          </Form.Item>
        </Col>

        <Col :span="6">
          <Form.Item label="主体类型" name="subject_type">
            <Select
              :value="formData.subject_type"
              placeholder="请选择主体类型"
              allow-clear
              :options="subjectTypeOptions"
              @update:value="handleSubjectTypeChange"
            />
          </Form.Item>
        </Col>

        <Col :span="6">
          <Form.Item label="权限级别" name="permission_level">
            <Select
              :value="formData.permission_level"
              placeholder="请选择权限级别"
              allow-clear
              :options="permissionLevelOptions"
              @update:value="handlePermissionLevelChange"
            />
          </Form.Item>
        </Col>
      </Row>

      <!-- 第二行：高级筛选（可展开） -->
      <Row v-if="expanded" :gutter="[16, 16]" class="filter-row advanced-row">
        <Col :span="6">
          <Form.Item label="权限范围" name="scope_type">
            <Select
              :value="formData.scope_type"
              placeholder="请选择权限范围"
              allow-clear
              :options="scopeTypeOptions"
              @update:value="handleScopeTypeChange"
            />
          </Form.Item>
        </Col>

        <Col :span="6">
          <Form.Item label="状态" name="status">
            <Select
              :value="formData.status"
              placeholder="请选择状态"
              allow-clear
              :options="statusOptions"
              @update:value="handleStatusChange"
            />
          </Form.Item>
        </Col>
      </Row>

      <!-- 操作按钮区域 -->
      <Row class="filter-actions">
        <Col :span="24">
          <Space>
            <Button type="primary" @click="handleSearch">
              <SearchOutlined />
              搜索
            </Button>
            <Button @click="handleReset">
              <ReloadOutlined />
              重置
            </Button>
            <Button type="link" @click="toggleExpanded">
              {{ expanded ? '收起' : '展开' }}
              <span class="expand-icon" :class="{ expanded }">▼</span>
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  </div>
</template>

<style lang="less" scoped>
.filter-form {
  padding: 20px 24px;
  background: white;
  border-radius: 6px;

  .filter-row {
    margin-bottom: 16px;

    &.advanced-row {
      border-top: 1px solid #f0f0f0;
      padding-top: 16px;
      margin-top: 8px;
    }
  }

  .filter-actions {
    margin-bottom: 0;

    .expand-icon {
      display: inline-block;
      margin-left: 4px;
      transition: transform 0.3s ease;

      &.expanded {
        transform: rotate(180deg);
      }
    }
  }

  // 响应式设计
  @media (max-width: 1200px) {
    .filter-row {
      :deep(.ant-col-6) {
        flex: 0 0 50%;
        max-width: 50%;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 16px;

    .filter-row {
      :deep(.ant-col-6) {
        flex: 0 0 100%;
        max-width: 100%;
      }
    }

    .filter-actions {
      :deep(.ant-space) {
        width: 100%;
        justify-content: center;
      }
    }
  }
}

// 表单项样式优化
:deep(.ant-form-item) {
  margin-bottom: 0;

  .ant-form-item-label {
    width: 80px;

    label {
      color: #333;
      font-weight: 500;
    }
  }

  .ant-form-item-control {
    flex: 1;
    max-width: calc(100% - 80px);
  }
}

:deep(.ant-input),
:deep(.ant-select-selector) {
  border-radius: 6px;

  &:hover {
    border-color: #40a9ff;
  }
}

:deep(.ant-btn) {
  border-radius: 6px;

  &.ant-btn-primary {
    background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
    border: none;

    &:hover {
      background: linear-gradient(135deg, #69c0ff 0%, #40a9ff 100%);
    }
  }
}
</style>
