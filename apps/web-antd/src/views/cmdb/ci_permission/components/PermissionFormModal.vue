<script setup lang="ts">
import type { Rule } from 'ant-design-vue/es/form';

import { computed, reactive, ref, watch } from 'vue';

import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Switch,
} from 'ant-design-vue';
import dayjs from 'dayjs';

// 权限信息类型定义
interface CiPermissionInfo {
  id?: number;
  permission_id?: string;
  subject_name?: string;
  subject_type?: string;
  permission_level?: string;
  scope_type?: string;
  status?: number;
  description?: string;
  effective_from?: number;
  effective_to?: number;
  ci_type_id?: string;
  ci_instance_id?: string;
  inherit_enabled?: boolean;
  priority?: number;
  risk_level?: string;
  mfa_required?: boolean;
  approval_required?: boolean;
  conditions?: string;
}

// 组件属性定义
interface Props {
  open?: boolean;
  loading?: boolean;
  isEdit?: boolean;
  formData?: Partial<CiPermissionInfo>;
}

// 组件事件定义
interface Emits {
  (e: 'update:open', value: boolean): void;
  (e: 'submit', data: CiPermissionInfo): void;
  (e: 'cancel'): void;
}

// 导出组件名称
defineOptions({
  name: 'PermissionFormModal',
});

const props = withDefaults(defineProps<Props>(), {
  open: false,
  loading: false,
  isEdit: false,
  formData: () => ({}),
});

const emit = defineEmits<Emits>();

// 表单数据
const formState = reactive<CiPermissionInfo>({
  permission_id: '',
  subject_name: '',
  subject_type: 'user',
  permission_level: 'read',
  scope_type: 'ci_type',
  status: 1,
  description: '',
  effective_from: undefined,
  effective_to: undefined,
  ci_type_id: '',
  ci_instance_id: '',
  inherit_enabled: true,
  priority: 1,
  risk_level: 'low',
  mfa_required: false,
  approval_required: false,
  conditions: '',
});

// 表单引用
const formRef = ref();

// 高级设置展开状态
const advancedVisible = ref(false);

// 日期相关的响应式数据（用于DatePicker显示）
const effectiveFromDate = ref<any>(undefined);
const effectiveToDate = ref<any>(undefined);

// 监听表单数据变化
watch(
  () => props.formData,
  (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      Object.assign(formState, {
        permission_id: newData.permission_id || '',
        subject_name: newData.subject_name || '',
        subject_type: newData.subject_type || 'user',
        permission_level: newData.permission_level || 'read',
        scope_type: newData.scope_type || 'ci_type',
        status: newData.status ?? 1,
        description: newData.description || '',
        effective_from: newData.effective_from,
        effective_to: newData.effective_to,
        ci_type_id: newData.ci_type_id || '',
        ci_instance_id: newData.ci_instance_id || '',
        inherit_enabled: newData.inherit_enabled ?? true,
        priority: newData.priority || 1,
        risk_level: newData.risk_level || 'low',
        mfa_required: newData.mfa_required || false,
        approval_required: newData.approval_required || false,
        conditions: newData.conditions || '',
      });

      // 转换时间戳为日期对象
      effectiveFromDate.value = newData.effective_from
        ? dayjs(newData.effective_from * 1000)
        : undefined;
      effectiveToDate.value = newData.effective_to
        ? dayjs(newData.effective_to * 1000)
        : undefined;
    } else {
      // 重置表单
      Object.assign(formState, {
        permission_id: '',
        subject_name: '',
        subject_type: 'user',
        permission_level: 'read',
        scope_type: 'ci_type',
        status: 1,
        description: '',
        effective_from: undefined,
        effective_to: undefined,
        ci_type_id: '',
        ci_instance_id: '',
        inherit_enabled: true,
        priority: 1,
        risk_level: 'low',
        mfa_required: false,
        approval_required: false,
        conditions: '',
      });

      // 重置日期
      effectiveFromDate.value = undefined;
      effectiveToDate.value = undefined;
    }
  },
  { immediate: true, deep: true },
);

// 计算属性
const modalTitle = computed(() => {
  return props.isEdit ? '编辑CI权限' : '新建CI权限';
});

// 选项配置
const subjectTypeOptions = [
  { label: '用户', value: 'user' },
  { label: '角色', value: 'role' },
  { label: '部门', value: 'department' },
  { label: '用户组', value: 'group' },
  { label: '系统', value: 'system' },
];

const permissionLevelOptions = [
  { label: '无权限', value: 'none' },
  { label: '只读', value: 'read' },
  { label: '读写', value: 'write' },
  { label: '管理员', value: 'admin' },
  { label: '超级管理员', value: 'super_admin' },
];

const scopeTypeOptions = [
  { label: '全局权限', value: 'global' },
  { label: 'CI类型权限', value: 'ci_type' },
  { label: 'CI实例权限', value: 'ci_instance' },
  { label: '属性权限', value: 'attribute' },
  { label: '字段权限', value: 'field' },
];

const riskLevelOptions = [
  { label: '低风险', value: 'low' },
  { label: '中风险', value: 'medium' },
  { label: '高风险', value: 'high' },
  { label: '极高风险', value: 'critical' },
];

// 表单验证规则
const rules: Record<string, Rule[]> = {
  permission_id: [
    { required: true, message: '请输入权限ID' },
    { min: 3, max: 50, message: '权限ID长度应在3-50字符之间' },
    {
      pattern: /^[\w-]+$/,
      message: '权限ID只能包含字母、数字、下划线和横线',
    },
  ],
  subject_name: [
    { required: true, message: '请输入权限主体名称' },
    { min: 1, max: 100, message: '主体名称长度应在1-100字符之间' },
  ],
  subject_type: [{ required: true, message: '请选择主体类型' }],
  permission_level: [{ required: true, message: '请选择权限级别' }],
  scope_type: [{ required: true, message: '请选择权限范围' }],
  priority: [
    { type: 'number', min: 1, max: 100, message: '优先级范围应在1-100之间' },
  ],
};

// 表单提交
const handleSubmit = async () => {
  try {
    await formRef.value.validate();

    // 转换日期对象为时间戳
    const submitData = {
      ...formState,
      effective_from: effectiveFromDate.value
        ? Math.floor(effectiveFromDate.value.valueOf() / 1000)
        : undefined,
      effective_to: effectiveToDate.value
        ? Math.floor(effectiveToDate.value.valueOf() / 1000)
        : undefined,
    };

    emit('submit', submitData);
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

// 取消操作
const handleCancel = () => {
  emit('update:open', false);
  emit('cancel');
};

// 切换高级设置
const toggleAdvanced = () => {
  advancedVisible.value = !advancedVisible.value;
};
</script>

<template>
  <Drawer
    :open="open"
    :title="modalTitle"
    :width="800"
    :destroy-on-close="true"
    placement="right"
    @update:open="(val) => emit('update:open', val)"
  >
    <div class="permission-form-container">
      <Form
        ref="formRef"
        :model="formState"
        :rules="rules"
        layout="vertical"
        :scroll-to-first-error="true"
      >
        <!-- 基础信息 -->
        <div class="form-section">
          <h3 class="section-title">📋 基础信息</h3>
          <Row :gutter="16">
            <Col :span="12">
              <Form.Item label="权限ID" name="permission_id">
                <Input
                  v-model:value="formState.permission_id"
                  placeholder="请输入权限ID"
                  :disabled="isEdit"
                />
              </Form.Item>
            </Col>
            <Col :span="12">
              <Form.Item label="状态" name="status">
                <Radio.Group v-model:value="formState.status">
                  <Radio :value="1">启用</Radio>
                  <Radio :value="0">禁用</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          <Row :gutter="16">
            <Col :span="24">
              <Form.Item label="描述" name="description">
                <Input.TextArea
                  v-model:value="formState.description"
                  placeholder="请输入权限描述"
                  :rows="2"
                  :max-length="500"
                  show-count
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <!-- 权限主体 -->
        <div class="form-section">
          <h3 class="section-title">👤 权限主体</h3>
          <Row :gutter="16">
            <Col :span="12">
              <Form.Item label="主体类型" name="subject_type">
                <Select
                  v-model:value="formState.subject_type"
                  placeholder="请选择主体类型"
                  :options="subjectTypeOptions"
                />
              </Form.Item>
            </Col>
            <Col :span="12">
              <Form.Item label="主体名称" name="subject_name">
                <Input
                  v-model:value="formState.subject_name"
                  placeholder="请输入主体名称"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <!-- 权限配置 -->
        <div class="form-section">
          <h3 class="section-title">🔐 权限配置</h3>
          <Row :gutter="16">
            <Col :span="12">
              <Form.Item label="权限级别" name="permission_level">
                <Select
                  v-model:value="formState.permission_level"
                  placeholder="请选择权限级别"
                  :options="permissionLevelOptions"
                />
              </Form.Item>
            </Col>
            <Col :span="12">
              <Form.Item label="权限范围" name="scope_type">
                <Select
                  v-model:value="formState.scope_type"
                  placeholder="请选择权限范围"
                  :options="scopeTypeOptions"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row v-if="formState.scope_type === 'ci_type'" :gutter="16">
            <Col :span="12">
              <Form.Item label="CI类型ID" name="ci_type_id">
                <Input
                  v-model:value="formState.ci_type_id"
                  placeholder="请输入CI类型ID"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row v-if="formState.scope_type === 'ci_instance'" :gutter="16">
            <Col :span="12">
              <Form.Item label="CI实例ID" name="ci_instance_id">
                <Input
                  v-model:value="formState.ci_instance_id"
                  placeholder="请输入CI实例ID"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <!-- 时间设置 -->
        <div class="form-section">
          <h3 class="section-title">⏰ 时间设置</h3>
          <Row :gutter="16">
            <Col :span="12">
              <Form.Item label="生效时间" name="effective_from">
                <DatePicker
                  v-model:value="effectiveFromDate"
                  placeholder="请选择生效时间"
                  show-time
                  format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                />
              </Form.Item>
            </Col>
            <Col :span="12">
              <Form.Item label="失效时间" name="effective_to">
                <DatePicker
                  v-model:value="effectiveToDate"
                  placeholder="请选择失效时间"
                  show-time
                  format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <!-- 高级设置 -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="section-title">⚙️ 高级设置</h3>
            <Button type="link" size="small" @click="toggleAdvanced">
              {{ advancedVisible ? '收起' : '展开' }}
              <span class="expand-icon" :class="{ expanded: advancedVisible }"
                >▼</span
              >
            </Button>
          </div>

          <div v-if="advancedVisible" class="advanced-content">
            <Row :gutter="16">
              <Col :span="8">
                <Form.Item label="优先级" name="priority">
                  <InputNumber
                    v-model:value="formState.priority"
                    :min="1"
                    :max="100"
                    style="width: 100%"
                  />
                </Form.Item>
              </Col>
              <Col :span="8">
                <Form.Item label="风险等级" name="risk_level">
                  <Select
                    v-model:value="formState.risk_level"
                    placeholder="请选择风险等级"
                    :options="riskLevelOptions"
                  />
                </Form.Item>
              </Col>
              <Col :span="8">
                <Form.Item label="继承权限" name="inherit_enabled">
                  <Switch v-model:checked="formState.inherit_enabled" />
                </Form.Item>
              </Col>
            </Row>
            <Row :gutter="16">
              <Col :span="12">
                <Form.Item label="需要MFA" name="mfa_required">
                  <Switch v-model:checked="formState.mfa_required" />
                </Form.Item>
              </Col>
              <Col :span="12">
                <Form.Item label="需要审批" name="approval_required">
                  <Switch v-model:checked="formState.approval_required" />
                </Form.Item>
              </Col>
            </Row>
            <Row :gutter="16">
              <Col :span="24">
                <Form.Item label="权限条件" name="conditions">
                  <Input.TextArea
                    v-model:value="formState.conditions"
                    placeholder="请输入权限条件配置（JSON格式）"
                    :rows="3"
                    :max-length="1000"
                    show-count
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </div>
      </Form>
    </div>

    <!-- 底部操作区域 -->
    <div class="drawer-footer">
      <Space>
        <Button @click="handleCancel">取消</Button>
        <Button type="primary" :loading="loading" @click="handleSubmit">
          {{ isEdit ? '更新' : '创建' }}
        </Button>
      </Space>
    </div>
  </Drawer>
</template>

<style lang="less" scoped>
.permission-form-container {
  height: calc(100vh - 120px);
  overflow-y: auto;
  padding: 0 8px 80px 8px;

  .form-section {
    margin-bottom: 24px;
    padding: 16px;
    background: #fafafa;
    border-radius: 6px;
    border: 1px solid #f0f0f0;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .section-title {
      margin: 0 0 16px 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .expand-icon {
      display: inline-block;
      margin-left: 4px;
      transition: transform 0.3s ease;
      font-size: 12px;

      &.expanded {
        transform: rotate(180deg);
      }
    }

    .advanced-content {
      animation: slideDown 0.3s ease-out;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  background: white;
  text-align: right;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 表单样式优化
:deep(.ant-form-item) {
  margin-bottom: 16px;

  .ant-form-item-label {
    > label {
      font-weight: 500;
      color: #333;
    }
  }
}

:deep(.ant-input),
:deep(.ant-select-selector),
:deep(.ant-picker) {
  border-radius: 6px;

  &:hover {
    border-color: #40a9ff;
  }
}

:deep(.ant-btn) {
  border-radius: 6px;
}

// 响应式设计
@media (max-width: 768px) {
  .permission-form-container {
    .form-section {
      padding: 12px;

      :deep(.ant-col-12),
      :deep(.ant-col-8) {
        flex: 0 0 100%;
        max-width: 100%;
      }
    }
  }
}
</style>
