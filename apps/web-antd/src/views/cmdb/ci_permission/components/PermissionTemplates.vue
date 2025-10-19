<script setup lang="ts">
import { ref, computed } from 'vue';
import { Card, Button, Tag, Descriptions, Modal, message } from 'ant-design-vue';
import { CopyOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons-vue';

import type { CiPermissionInfo } from '#/api/cmdb/cipermission';

interface Emits {
  (e: 'useTemplate', template: CiPermissionInfo): void;
}

const emit = defineEmits<Emits>();

defineOptions({
  name: 'PermissionTemplates',
});

const showTemplateModal = ref(false);
const selectedTemplate = ref<CiPermissionInfo | null>(null);

// 权限模板示例
const permissionTemplates = ref<CiPermissionInfo[]>([
  {
    id: 1,
    permission_id: 'perm_admin_global_001',
    subject_name: '系统管理员',
    subject_type: 'role',
    permission_type: 'allow',
    permission_level: 'super_admin',
    scope_type: 'global',
    status: 1,
    description: '系统管理员全局权限 - 拥有所有权限',
    priority: 1,
    risk_level: 'critical',
    require_mfa: true,
    require_approval: true,
    inheritable: true,
    is_temporary: false,
    operations: {
      operations: [
        { operation: 'create', allowed: true, description: '创建权限' },
        { operation: 'read', allowed: true, description: '查看权限' },
        { operation: 'update', allowed: true, description: '更新权限' },
        { operation: 'delete', allowed: true, description: '删除权限' },
        { operation: 'export', allowed: true, description: '导出权限' },
      ],
    },
    comments: '用于系统核心管理员，具有最高权限级别',
  },
  {
    id: 2,
    permission_id: 'perm_dev_citype_002',
    subject_name: '开发团队',
    subject_type: 'role',
    permission_type: 'allow',
    permission_level: 'write',
    scope_type: 'ci_type',
    ci_type_id: 1,
    status: 1,
    description: '开发团队CI类型权限 - 可管理特定CI类型',
    priority: 10,
    risk_level: 'medium',
    require_mfa: false,
    require_approval: false,
    inheritable: true,
    is_temporary: false,
    operations: {
      operations: [
        { operation: 'create', allowed: true, description: '创建CI实例' },
        { operation: 'read', allowed: true, description: '查看CI信息' },
        { operation: 'update', allowed: true, description: '更新CI配置' },
        { operation: 'delete', allowed: false, description: '删除操作受限' },
      ],
    },
    comments: '适用于开发团队日常CI管理工作',
  },
  {
    id: 3,
    permission_id: 'perm_ops_instance_003',
    subject_name: '运维部门',
    subject_type: 'department',
    permission_level: 'admin',
    scope_type: 'ci_instance',
    ci_type_id: 2,
    ci_id: 1001,
    status: 1,
    description: '运维部门特定CI实例管理权限',
    priority: 5,
    risk_level: 'high',
    require_mfa: true,
    require_approval: true,
    inheritable: false,
    is_temporary: false,
    effective_from: Math.floor(Date.now() / 1000),
    effective_to: Math.floor(Date.now() / 1000) + 86400 * 365, // 1年有效期
    operations: {
      operations: [
        { operation: 'read', allowed: true, description: '查看实例信息' },
        { operation: 'update', allowed: true, description: '更新实例配置' },
        { operation: 'restart', allowed: true, description: '重启实例' },
        { operation: 'backup', allowed: true, description: '备份实例' },
      ],
    },
    comments: '生产环境CI实例管理权限，需要严格审批',
  },
  {
    id: 4,
    permission_id: 'perm_monitor_readonly_004',
    subject_name: '监控组',
    subject_type: 'group',
    permission_level: 'read',
    scope_type: 'attribute',
    attribute_id: 1,
    status: 1,
    description: '监控组只读权限 - 仅查看监控指标',
    priority: 20,
    risk_level: 'low',
    require_mfa: false,
    require_approval: false,
    inheritable: true,
    is_temporary: false,
    operations: {
      operations: [
        { operation: 'read', allowed: true, description: '查看监控数据' },
        { operation: 'export', allowed: true, description: '导出报表' },
      ],
    },
    field_masks: {
      fields: ['password', 'private_key', 'secret'],
    },
    comments: '适用于监控和审计场景的只读权限',
  },
  {
    id: 5,
    permission_id: 'perm_temp_emergency_005',
    subject_name: '应急处理人员',
    subject_type: 'user',
    subject_id: 1001,
    permission_level: 'admin',
    scope_type: 'global',
    status: 1,
    description: '临时应急权限 - 用于故障处理',
    priority: 1,
    risk_level: 'critical',
    require_mfa: true,
    require_approval: true,
    inheritable: false,
    is_temporary: true,
    effective_from: Math.floor(Date.now() / 1000),
    effective_to: Math.floor(Date.now() / 1000) + 3600 * 4, // 4小时有效期
    operations: {
      operations: [
        { operation: 'create', allowed: true, description: '紧急创建' },
        { operation: 'read', allowed: true, description: '查看所有信息' },
        { operation: 'update', allowed: true, description: '紧急修复' },
        { operation: 'delete', allowed: true, description: '紧急删除' },
      ],
    },
    comments: '仅用于生产故障应急处理，自动过期',
  },
  {
    id: 6,
    permission_id: 'perm_field_sensitive_006',
    subject_name: 'DBA团队',
    subject_type: 'role',
    permission_level: 'read',
    scope_type: 'field',
    field_name: 'database_config',
    status: 1,
    description: '数据库配置字段访问权限',
    priority: 15,
    risk_level: 'high',
    require_mfa: true,
    require_approval: false,
    inheritable: false,
    is_temporary: false,
    operations: {
      operations: [
        { operation: 'read', allowed: true, description: '查看数据库配置' },
      ],
    },
    field_masks: {
      fields: ['password', 'connection_string'],
    },
    data_filters: {
      rules: [
        { field: 'environment', operator: '!=', value: 'production' },
      ],
      logic: 'AND',
    },
    comments: '仅允许查看非生产环境的数据库配置，敏感字段脱敏',
  },
]);

// 分类的模板
const templateCategories = computed(() => {
  const categories = [
    {
      title: '管理员权限模板',
      description: '适用于系统管理员和高级管理人员',
      templates: permissionTemplates.value.filter(t => 
        ['super_admin', 'admin'].includes(t.permission_level || '')
      ),
      color: 'red',
    },
    {
      title: '团队协作权限模板',
      description: '适用于开发团队、运维团队等',
      templates: permissionTemplates.value.filter(t => 
        t.subject_type === 'role' && t.permission_level === 'write'
      ),
      color: 'blue',
    },
    {
      title: '部门权限模板',
      description: '适用于部门级别的权限配置',
      templates: permissionTemplates.value.filter(t => 
        t.subject_type === 'department'
      ),
      color: 'green',
    },
    {
      title: '只读权限模板',
      description: '适用于监控、审计等只读场景',
      templates: permissionTemplates.value.filter(t => 
        t.permission_level === 'read'
      ),
      color: 'orange',
    },
    {
      title: '临时权限模板',
      description: '适用于紧急处理、临时授权等场景',
      templates: permissionTemplates.value.filter(t => 
        t.is_temporary
      ),
      color: 'purple',
    },
    {
      title: '字段级权限模板',
      description: '适用于敏感字段的精细化权限控制',
      templates: permissionTemplates.value.filter(t => 
        t.scope_type === 'field' || t.field_masks?.fields?.length
      ),
      color: 'cyan',
    },
  ];
  
  return categories.filter(c => c.templates.length > 0);
});

function viewTemplate(template: CiPermissionInfo) {
  selectedTemplate.value = template;
  showTemplateModal.value = true;
}

function useTemplate(template: CiPermissionInfo) {
  // 生成新的权限ID和时间戳
  const timestamp = Date.now();
  const newTemplate = {
    ...template,
    id: undefined, // 清除ID，表示新建
    permission_id: `perm_${template.subject_type}_${template.permission_level}_${timestamp}`,
    created_at: undefined,
    updated_at: undefined,
    effective_from: template.is_temporary ? Math.floor(Date.now() / 1000) : template.effective_from,
    effective_to: template.is_temporary ? 
      Math.floor(Date.now() / 1000) + 3600 * 4 : // 临时权限4小时
      template.effective_to,
  };
  
  emit('useTemplate', newTemplate);
  message.success(`已应用模板：${template.description}`);
}

function copyTemplate(template: CiPermissionInfo) {
  const templateJson = JSON.stringify(template, null, 2);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(templateJson).then(() => {
      message.success('模板配置已复制到剪贴板');
    });
  } else {
    // 降级方案
    const textArea = document.createElement('textarea');
    textArea.value = templateJson;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    message.success('模板配置已复制到剪贴板');
  }
}

function getRiskLevelColor(level?: string) {
  const colors = {
    low: 'green',
    medium: 'orange',
    high: 'red',
    critical: 'purple',
  };
  return colors[level as keyof typeof colors] || 'default';
}

function getPermissionLevelText(level?: string) {
  const levels = {
    none: '无权限',
    read: '只读',
    write: '读写',
    admin: '管理员',
    super_admin: '超级管理员',
  };
  return levels[level as keyof typeof levels] || level;
}

function getScopeTypeText(type?: string) {
  const types = {
    global: '全局',
    ci_type: 'CI类型',
    ci_instance: 'CI实例',
    attribute: '属性',
    field: '字段',
  };
  return types[type as keyof typeof types] || type;
}
</script>

<template>
  <div class="permission-templates">
    <div v-for="category in templateCategories" :key="category.title" class="mb-6">
      <div class="mb-4">
        <h3 class="text-lg font-medium flex items-center">
          <Tag :color="category.color" class="mr-2">{{ category.title }}</Tag>
        </h3>
        <p class="text-sm text-gray-600 ml-2">{{ category.description }}</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          v-for="template in category.templates"
          :key="template.id"
          size="small"
          class="permission-template-card"
          hoverable
        >
          <template #title>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium truncate">{{ template.description }}</span>
              <Tag :color="getRiskLevelColor(template.risk_level)" size="small">
                {{ template.risk_level }}
              </Tag>
            </div>
          </template>
          
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">权限级别:</span>
              <Tag color="blue" size="small">{{ getPermissionLevelText(template.permission_level) }}</Tag>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-500">权限范围:</span>
              <Tag color="green" size="small">{{ getScopeTypeText(template.scope_type) }}</Tag>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-500">主体类型:</span>
              <span>{{ template.subject_name }} ({{ template.subject_type }})</span>
            </div>
            
            <div v-if="template.is_temporary" class="flex justify-between">
              <span class="text-gray-500">权限类型:</span>
              <Tag color="orange" size="small">临时权限</Tag>
            </div>
            
            <div v-if="template.require_mfa || template.require_approval" class="flex flex-wrap gap-1">
              <Tag v-if="template.require_mfa" color="red" size="small">需要MFA</Tag>
              <Tag v-if="template.require_approval" color="purple" size="small">需要审批</Tag>
            </div>
          </div>
          
          <template #actions>
            <div class="flex justify-between pt-3">
              <Button size="small" @click="viewTemplate(template)">
                <EyeOutlined />
                查看详情
              </Button>
              <Button size="small" @click="copyTemplate(template)">
                <CopyOutlined />
                复制配置
              </Button>
              <Button type="primary" size="small" @click="useTemplate(template)">
                <PlusOutlined />
                使用模板
              </Button>
            </div>
          </template>
        </Card>
      </div>
    </div>
    
    <!-- 模板详情Modal -->
    <Modal
      v-model:open="showTemplateModal"
      title="权限模板详情"
      width="800px"
      :footer="[
        {
          key: 'copy',
          label: '复制配置',
          type: 'default',
          props: {
            icon: 'CopyOutlined',
            onClick: () => selectedTemplate && copyTemplate(selectedTemplate),
          },
        },
        {
          key: 'use',
          label: '使用模板',
          type: 'primary',
          props: {
            icon: 'PlusOutlined',
            onClick: () => {
              if (selectedTemplate) {
                useTemplate(selectedTemplate);
                showTemplateModal.value = false;
              }
            },
          },
        },
        {
          key: 'close',
          label: '关闭',
          props: {
            onClick: () => { showTemplateModal.value = false; },
          },
        },
      ]"
    >
      <div v-if="selectedTemplate" class="space-y-4">
        <Descriptions :column="2" bordered size="small">
          <Descriptions.Item label="权限ID">{{ selectedTemplate.permission_id }}</Descriptions.Item>
          <Descriptions.Item label="权限描述">{{ selectedTemplate.description }}</Descriptions.Item>
          <Descriptions.Item label="主体名称">{{ selectedTemplate.subject_name }}</Descriptions.Item>
          <Descriptions.Item label="主体类型">{{ selectedTemplate.subject_type }}</Descriptions.Item>
          <Descriptions.Item label="权限级别">
            <Tag color="blue">{{ getPermissionLevelText(selectedTemplate.permission_level) }}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="权限范围">
            <Tag color="green">{{ getScopeTypeText(selectedTemplate.scope_type) }}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="风险级别">
            <Tag :color="getRiskLevelColor(selectedTemplate.risk_level)">{{ selectedTemplate.risk_level }}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="优先级">{{ selectedTemplate.priority }}</Descriptions.Item>
          <Descriptions.Item label="需要MFA">
            <Tag :color="selectedTemplate.require_mfa ? 'red' : 'default'">
              {{ selectedTemplate.require_mfa ? '是' : '否' }}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="需要审批">
            <Tag :color="selectedTemplate.require_approval ? 'purple' : 'default'">
              {{ selectedTemplate.require_approval ? '是' : '否' }}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="可继承">
            <Tag :color="selectedTemplate.inheritable ? 'blue' : 'default'">
              {{ selectedTemplate.inheritable ? '是' : '否' }}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="临时权限">
            <Tag :color="selectedTemplate.is_temporary ? 'orange' : 'default'">
              {{ selectedTemplate.is_temporary ? '是' : '否' }}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
        
        <!-- 操作权限 -->
        <div v-if="selectedTemplate.operations?.operations?.length">
          <h4 class="font-medium mb-2">操作权限:</h4>
          <div class="space-y-1">
            <Tag
              v-for="op in selectedTemplate.operations.operations"
              :key="op.operation"
              :color="op.allowed ? 'green' : 'red'"
              class="mb-1"
            >
              {{ op.operation }}{{ op.allowed ? ' ✓' : ' ✗' }}
            </Tag>
          </div>
        </div>
        
        <!-- 字段掩码 -->
        <div v-if="selectedTemplate.field_masks?.fields?.length">
          <h4 class="font-medium mb-2">字段掩码:</h4>
          <div class="space-y-1">
            <Tag
              v-for="field in selectedTemplate.field_masks.fields"
              :key="field"
              color="orange"
              class="mb-1"
            >
              {{ field }}
            </Tag>
          </div>
        </div>
        
        <!-- 数据过滤 -->
        <div v-if="selectedTemplate.data_filters?.rules?.length">
          <h4 class="font-medium mb-2">数据过滤规则:</h4>
          <div class="space-y-1">
            <Tag
              v-for="rule in selectedTemplate.data_filters.rules"
              :key="`${rule.field}-${rule.operator}-${rule.value}`"
              color="purple"
              class="mb-1"
            >
              {{ rule.field }} {{ rule.operator }} {{ rule.value }}
            </Tag>
          </div>
        </div>
        
        <!-- 备注 -->
        <div v-if="selectedTemplate.comments">
          <h4 class="font-medium mb-2">备注说明:</h4>
          <div class="p-2 bg-gray-50 rounded text-sm">
            {{ selectedTemplate.comments }}
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.permission-templates {
  padding: 16px;
}

.permission-template-card {
  transition: all 0.3s ease;
}

.permission-template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.permission-template-card :deep(.ant-card-body) {
  padding: 12px;
}

.permission-template-card :deep(.ant-card-actions) {
  padding: 8px 12px;
}
</style>