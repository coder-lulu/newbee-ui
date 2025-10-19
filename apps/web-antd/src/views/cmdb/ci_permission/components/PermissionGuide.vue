<script setup lang="ts">
import { ref } from 'vue';

import { Alert, Button, Card, Divider, Steps, Tag } from 'ant-design-vue';
import {
  CheckCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons-vue';

defineOptions({
  name: 'PermissionGuide',
});

const current = ref(0);

const steps = [
  {
    title: '确定授权对象',
    content: 'subject-selection',
  },
  {
    title: '选择权限范围',
    content: 'scope-selection',
  },
  {
    title: '配置权限级别',
    content: 'level-configuration',
  },
  {
    title: '安全控制设置',
    content: 'security-settings',
  },
  {
    title: '检查和确认',
    content: 'review-confirmation',
  },
];

const bestPractices = {
  'subject-selection': [
    '🎯 优先使用角色和部门授权，便于批量管理',
    '👤 个人用户权限仅用于特殊情况',
    '🏢 系统权限用于应用程序间调用',
    '⚠️ 避免直接给个人用户过高权限',
  ],
  'scope-selection': [
    '🌍 全局权限：谨慎使用，仅限系统管理员',
    '📂 CI类型权限：适合职能团队批量管理',
    '📄 CI实例权限：适合特定资源精确控制',
    '🔍 字段权限：用于敏感数据访问控制',
  ],
  'level-configuration': [
    '📖 只读权限：适合查看和监控场景',
    '✏️ 读写权限：适合日常运维操作',
    '👑 管理员权限：适合团队负责人',
    '⚡ 超级管理员：仅限系统核心管理员',
  ],
  'security-settings': [
    '🔐 高风险操作必须启用MFA',
    '✅ 关键权限建议启用审批流程',
    '⏰ 临时权限设置明确的有效期',
    '📊 定期审查权限使用情况',
  ],
  'review-confirmation': [
    '✅ 确认权限范围最小化',
    '🔍 检查安全控制配置',
    '📝 填写清晰的权限说明',
    '⏱️ 设置合理的有效期',
  ],
};

const securityRules = [
  {
    level: 'error',
    title: '禁止事项',
    rules: [
      '❌ 不得授予超出职责范围的权限',
      '❌ 不得绕过审批流程授予高风险权限',
      '❌ 不得共享个人账号权限',
      '❌ 不得长期保留未使用的权限',
    ],
  },
  {
    level: 'warning',
    title: '注意事项',
    rules: [
      '⚠️ 生产环境权限需要特别审慎',
      '⚠️ 定期检查和清理过期权限',
      '⚠️ 记录权限变更的业务原因',
      '⚠️ 监控权限使用异常情况',
    ],
  },
  {
    level: 'info',
    title: '建议做法',
    rules: [
      '💡 使用权限模板快速配置',
      '💡 建立权限分级审批制度',
      '💡 定期进行权限审计',
      '💡 培训用户正确使用权限',
    ],
  },
];

function next() {
  current.value++;
}

function prev() {
  current.value--;
}
</script>

<template>
  <Card title="权限配置向导" class="permission-guide">
    <Steps :current="current" size="small" class="mb-6">
      <Steps.Step
        v-for="item in steps"
        :key="item.title"
        :title="item.title"
      />
    </Steps>

    <!-- 步骤内容 -->
    <div class="steps-content mb-6">
      <Card size="small" :title="`${current + 1}. ${steps[current].title}`">
        <div class="space-y-4">
          <div class="bg-blue-50 p-4 rounded">
            <div class="flex items-center mb-2">
              <InfoCircleOutlined class="text-blue-500 mr-2" />
              <span class="font-medium text-blue-700">最佳实践建议</span>
            </div>
            <ul class="space-y-1">
              <li
                v-for="practice in bestPractices[steps[current].content]"
                :key="practice"
                class="text-sm text-blue-600"
              >
                {{ practice }}
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>

    <!-- 步骤导航 -->
    <div class="steps-action flex justify-between">
      <Button v-if="current > 0" @click="prev">上一步</Button>
      <div v-else></div>
      <Button v-if="current < steps.length - 1" type="primary" @click="next">
        下一步
      </Button>
      <Button v-else type="primary" @click="$emit('complete')">
        开始配置
      </Button>
    </div>

    <Divider />

    <!-- 安全规则 -->
    <div class="security-rules">
      <h3 class="text-lg font-medium mb-4 flex items-center">
        <WarningOutlined class="text-orange-500 mr-2" />
        安全规则与最佳实践
      </h3>
      
      <div class="space-y-4">
        <Alert
          v-for="category in securityRules"
          :key="category.title"
          :type="category.level"
          :message="category.title"
          show-icon
          class="mb-4"
        >
          <template #description>
            <ul class="mt-2 space-y-1">
              <li
                v-for="rule in category.rules"
                :key="rule"
                class="text-sm"
              >
                {{ rule }}
              </li>
            </ul>
          </template>
        </Alert>
      </div>
    </div>

    <Divider />

    <!-- 权限级别说明 -->
    <div class="permission-levels">
      <h3 class="text-lg font-medium mb-4">权限级别详细说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card size="small" title="只读权限 (Read)">
          <div class="space-y-2">
            <Tag color="green">适用场景</Tag>
            <p class="text-sm text-gray-600">监控、审计、报表查看</p>
            <Tag color="blue">包含操作</Tag>
            <p class="text-sm text-gray-600">查看、搜索、导出报表</p>
          </div>
        </Card>
        
        <Card size="small" title="读写权限 (Write)">
          <div class="space-y-2">
            <Tag color="orange">适用场景</Tag>
            <p class="text-sm text-gray-600">日常运维、配置管理</p>
            <Tag color="blue">包含操作</Tag>
            <p class="text-sm text-gray-600">增删改查、配置变更</p>
          </div>
        </Card>
        
        <Card size="small" title="管理员权限 (Admin)">
          <div class="space-y-2">
            <Tag color="red">适用场景</Tag>
            <p class="text-sm text-gray-600">团队管理、权限分配</p>
            <Tag color="blue">包含操作</Tag>
            <p class="text-sm text-gray-600">用户管理、权限控制</p>
          </div>
        </Card>
        
        <Card size="small" title="超级管理员 (Super Admin)">
          <div class="space-y-2">
            <Tag color="purple">适用场景</Tag>
            <p class="text-sm text-gray-600">系统管理、核心配置</p>
            <Tag color="blue">包含操作</Tag>
            <p class="text-sm text-gray-600">所有操作、系统配置</p>
          </div>
        </Card>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.permission-guide {
  max-width: 800px;
}

.steps-content {
  min-height: 200px;
}

.security-rules :deep(.ant-alert-description) {
  margin-top: 8px;
}
</style>