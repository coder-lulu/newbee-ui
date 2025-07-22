<script setup lang="ts">
import { computed } from 'vue';

import { Button, Checkbox, Space, Tag } from 'ant-design-vue';

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
  created_at?: number;
  updated_at?: number;
}

// 组件属性定义
interface Props {
  permission: CiPermissionInfo;
  selected?: boolean;
  showActions?: boolean;
}

// 组件事件定义
interface Emits {
  (e: 'select', permission: CiPermissionInfo): void;
  (e: 'edit', permission: CiPermissionInfo): void;
  (e: 'delete', permission: CiPermissionInfo): void;
  (e: 'view', permission: CiPermissionInfo): void;
  (e: 'toggleStatus', permission: CiPermissionInfo): void;
}

// 导出组件名称
defineOptions({
  name: 'PermissionCard',
});

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  showActions: true,
});

const emit = defineEmits<Emits>();

// 辅助函数
const getLevelText = (level: string): string => {
  const levelMap: Record<string, string> = {
    none: '无权限',
    read: '只读',
    write: '读写',
    admin: '管理员',
    super_admin: '超级管理员',
  };
  return levelMap[level] || level;
};

const getScopeText = (scope: string): string => {
  const scopeMap: Record<string, string> = {
    global: '全局权限',
    ci_type: 'CI类型权限',
    ci_instance: 'CI实例权限',
    attribute: '属性权限',
    field: '字段权限',
  };
  return scopeMap[scope] || scope;
};

const getSubjectTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    user: '用户',
    role: '角色',
    department: '部门',
    group: '用户组',
    system: '系统',
  };
  return typeMap[type] || type;
};

const formatTimestamp = (timestamp?: number): string => {
  if (!timestamp) return '-';
  return new Date(timestamp * 1000).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 计算属性
const levelColor = computed(() => {
  const colorMap: Record<string, string> = {
    none: 'default',
    read: 'blue',
    write: 'green',
    admin: 'orange',
    super_admin: 'red',
  };
  return colorMap[props.permission.permission_level || ''] || 'default';
});

const statusColor = computed(() => {
  return props.permission.status === 1 ? 'green' : 'red';
});

const statusText = computed(() => {
  return props.permission.status === 1 ? '启用' : '禁用';
});

const cardClass = computed(() => {
  return {
    'permission-card': true,
    selected: props.selected,
    disabled: props.permission.status === 0,
  };
});

// 事件处理
const handleCardClick = () => {
  emit('select', props.permission);
};

const handleEdit = (e: Event) => {
  e.stopPropagation();
  emit('edit', props.permission);
};

const handleDelete = (e: Event) => {
  e.stopPropagation();
  emit('delete', props.permission);
};

const handleView = (e: Event) => {
  e.stopPropagation();
  emit('view', props.permission);
};

const handleToggleStatus = (e: Event) => {
  e.stopPropagation();
  emit('toggleStatus', props.permission);
};

const handleCheckboxChange = (e: Event) => {
  e.stopPropagation();
  emit('select', props.permission);
};
</script>

<template>
  <div :class="cardClass" @click="handleCardClick">
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="permission-info">
        <span class="permission-id">{{ permission.permission_id }}</span>
        <Tag :color="statusColor">{{ statusText }}</Tag>
      </div>
      <div class="card-checkbox">
        <Checkbox
          :checked="selected"
          @change="handleCheckboxChange"
          @click.stop
        />
      </div>
    </div>

    <!-- 卡片主体 -->
    <div class="card-body">
      <div class="info-grid">
        <div class="info-item">
          <span class="label">权限主体:</span>
          <span class="value">{{ permission.subject_name || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">主体类型:</span>
          <Tag color="blue" size="small">
            {{ getSubjectTypeText(permission.subject_type || '') }}
          </Tag>
        </div>
        <div class="info-item">
          <span class="label">权限级别:</span>
          <Tag :color="levelColor" size="small" class="level-tag">
            {{ getLevelText(permission.permission_level || '') }}
          </Tag>
        </div>
        <div class="info-item">
          <span class="label">权限范围:</span>
          <Tag color="cyan" size="small">
            {{ getScopeText(permission.scope_type || '') }}
          </Tag>
        </div>
      </div>

      <!-- 描述信息 -->
      <div v-if="permission.description" class="description">
        <span class="label">描述:</span>
        <span class="description-text">{{ permission.description }}</span>
      </div>

      <!-- 时间信息 -->
      <div class="time-info">
        <div class="time-item">
          <span class="label">创建时间:</span>
          <span class="time-text">{{
            formatTimestamp(permission.created_at)
          }}</span>
        </div>
        <div v-if="permission.updated_at" class="time-item">
          <span class="label">更新时间:</span>
          <span class="time-text">{{
            formatTimestamp(permission.updated_at)
          }}</span>
        </div>
      </div>
    </div>

    <!-- 卡片操作 -->
    <div v-if="showActions" class="card-actions" @click.stop>
      <Space size="small">
        <Button size="small" @click="handleView">详情</Button>
        <Button size="small" type="primary" @click="handleEdit">编辑</Button>
        <Button
          size="small"
          :type="permission.status === 1 ? 'default' : 'primary'"
          @click="handleToggleStatus"
        >
          {{ permission.status === 1 ? '禁用' : '启用' }}
        </Button>
        <Button size="small" danger @click="handleDelete">删除</Button>
      </Space>
    </div>

    <!-- 选中指示器 -->
    <div v-if="selected" class="selection-indicator"></div>
  </div>
</template>

<style lang="less" scoped>
.permission-card {
  position: relative;
  background: white;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    border-color: #40a9ff;
    box-shadow: 0 4px 12px rgba(64, 169, 255, 0.15);
    transform: translateY(-2px);
  }

  &.selected {
    border-color: #1890ff;
    background: linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.25);

    .selection-indicator {
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(135deg, #1890ff 0%, #52c41a 100%);
    }
  }

  &.disabled {
    opacity: 0.7;

    &:hover {
      transform: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .permission-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;

      .permission-id {
        font-weight: 600;
        color: #333;
        font-size: 16px;
        line-height: 1.4;
      }
    }

    .card-checkbox {
      flex-shrink: 0;
    }
  }

  .card-body {
    margin-bottom: 16px;

    .info-grid {
      display: grid;
      gap: 8px;
      margin-bottom: 12px;

      .info-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .label {
          min-width: 80px;
          color: #666;
          font-size: 13px;
          font-weight: 500;
          flex-shrink: 0;
        }

        .value {
          color: #333;
          font-size: 13px;
          flex: 1;
          word-break: break-word;
        }
      }
    }

    .description {
      margin-bottom: 12px;
      padding: 8px 12px;
      background: #f9f9f9;
      border-radius: 4px;
      border-left: 3px solid #1890ff;

      .label {
        color: #666;
        font-size: 12px;
        font-weight: 500;
        display: block;
        margin-bottom: 4px;
      }

      .description-text {
        color: #333;
        font-size: 13px;
        line-height: 1.5;
        display: block;
        word-break: break-word;
      }
    }

    .time-info {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding-top: 8px;
      border-top: 1px solid #f0f0f0;

      .time-item {
        flex: 1;

        .label {
          color: #999;
          font-size: 11px;
          display: block;
          margin-bottom: 2px;
        }

        .time-text {
          color: #666;
          font-size: 12px;
          font-family: 'JetBrains Mono', monospace;
        }
      }
    }
  }

  .card-actions {
    border-top: 1px solid #f0f0f0;
    padding-top: 12px;
    display: flex;
    justify-content: flex-end;
  }
}

// 标签样式优化
:deep(.ant-tag) {
  border-radius: 4px;
  font-weight: 500;
  margin: 0;

  &.level-tag {
    font-weight: 600;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .permission-card {
    padding: 16px;

    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;

      .permission-info {
        width: 100%;
      }

      .card-checkbox {
        align-self: flex-end;
      }
    }

    .card-body {
      .info-grid {
        .info-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;

          .label {
            min-width: auto;
          }
        }
      }

      .time-info {
        flex-direction: column;
        gap: 8px;
      }
    }

    .card-actions {
      :deep(.ant-space) {
        width: 100%;
        justify-content: center;
      }
    }
  }
}

// 卡片网格布局适配
@media (max-width: 1400px) {
  .permission-card {
    .card-body {
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
