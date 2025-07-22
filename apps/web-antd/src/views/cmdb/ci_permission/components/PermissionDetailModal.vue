<script setup lang="ts">
import { computed } from 'vue';

import { Drawer, Spin, Tag } from 'ant-design-vue';

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
  created_at?: number;
  updated_at?: number;
  creator?: string;
  updater?: string;
}

// 组件属性定义
interface Props {
  open?: boolean;
  loading?: boolean;
  permission?: CiPermissionInfo;
}

// 组件事件定义
interface Emits {
  (e: 'update:open', value: boolean): void;
  (e: 'close'): void;
}

// 导出组件名称
defineOptions({
  name: 'PermissionDetailModal',
});

const props = withDefaults(defineProps<Props>(), {
  open: false,
  loading: false,
  permission: undefined,
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

const getRiskLevelText = (level: string): string => {
  const levelMap: Record<string, string> = {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
    critical: '极高风险',
  };
  return levelMap[level] || level;
};

const formatTimestamp = (timestamp?: number): string => {
  if (!timestamp) return '-';
  return new Date(timestamp * 1000).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
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
  return colorMap[props.permission?.permission_level || ''] || 'default';
});

const statusColor = computed(() => {
  return props.permission?.status === 1 ? 'green' : 'red';
});

const riskColor = computed(() => {
  const colorMap: Record<string, string> = {
    low: 'green',
    medium: 'orange',
    high: 'red',
    critical: 'purple',
  };
  return colorMap[props.permission?.risk_level || ''] || 'default';
});

// 事件处理已移除，使用抽屉的 @update:open 事件处理
</script>

<template>
  <Drawer
    :open="open"
    title="权限详情"
    :width="800"
    placement="right"
    @update:open="(val) => emit('update:open', val)"
  >
    <div class="permission-detail-container">
      <Spin :spinning="loading" tip="正在加载权限详情...">
        <div v-if="permission" class="detail-content">
          <!-- 基础信息 -->
          <div class="detail-section">
            <h3 class="section-title">📋 基础信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>权限ID:</label>
                <span class="value-text">{{
                  permission.permission_id || '-'
                }}</span>
              </div>
              <div class="detail-item">
                <label>状态:</label>
                <Tag :color="statusColor">
                  {{ permission.status === 1 ? '启用' : '禁用' }}
                </Tag>
              </div>
              <div class="detail-item">
                <label>创建时间:</label>
                <span class="value-text">{{
                  formatTimestamp(permission.created_at)
                }}</span>
              </div>
              <div class="detail-item">
                <label>更新时间:</label>
                <span class="value-text">{{
                  formatTimestamp(permission.updated_at)
                }}</span>
              </div>
              <div v-if="permission.creator" class="detail-item">
                <label>创建者:</label>
                <span class="value-text">{{ permission.creator }}</span>
              </div>
              <div v-if="permission.updater" class="detail-item">
                <label>更新者:</label>
                <span class="value-text">{{ permission.updater }}</span>
              </div>
            </div>
            <div v-if="permission.description" class="description-item">
              <label>描述:</label>
              <div class="description-content">
                {{ permission.description }}
              </div>
            </div>
          </div>

          <!-- 权限主体 -->
          <div class="detail-section">
            <h3 class="section-title">👤 权限主体</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>主体名称:</label>
                <span class="value-text">{{
                  permission.subject_name || '-'
                }}</span>
              </div>
              <div class="detail-item">
                <label>主体类型:</label>
                <Tag color="blue">
                  {{ getSubjectTypeText(permission.subject_type || '') }}
                </Tag>
              </div>
            </div>
          </div>

          <!-- 权限配置 -->
          <div class="detail-section">
            <h3 class="section-title">🔐 权限配置</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>权限级别:</label>
                <Tag :color="levelColor">
                  {{ getLevelText(permission.permission_level || '') }}
                </Tag>
              </div>
              <div class="detail-item">
                <label>权限范围:</label>
                <Tag color="cyan">
                  {{ getScopeText(permission.scope_type || '') }}
                </Tag>
              </div>
              <div v-if="permission.ci_type_id" class="detail-item">
                <label>CI类型ID:</label>
                <span class="value-text">{{ permission.ci_type_id }}</span>
              </div>
              <div v-if="permission.ci_instance_id" class="detail-item">
                <label>CI实例ID:</label>
                <span class="value-text">{{ permission.ci_instance_id }}</span>
              </div>
            </div>
          </div>

          <!-- 时间设置 -->
          <div
            v-if="permission.effective_from || permission.effective_to"
            class="detail-section"
          >
            <h3 class="section-title">⏰ 时间设置</h3>
            <div class="detail-grid">
              <div v-if="permission.effective_from" class="detail-item">
                <label>生效时间:</label>
                <span class="value-text">{{
                  formatTimestamp(permission.effective_from)
                }}</span>
              </div>
              <div v-if="permission.effective_to" class="detail-item">
                <label>失效时间:</label>
                <span class="value-text">{{
                  formatTimestamp(permission.effective_to)
                }}</span>
              </div>
            </div>
          </div>

          <!-- 高级设置 -->
          <div class="detail-section">
            <h3 class="section-title">⚙️ 高级设置</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>优先级:</label>
                <span class="value-text">{{ permission.priority || 1 }}</span>
              </div>
              <div class="detail-item">
                <label>风险等级:</label>
                <Tag :color="riskColor">
                  {{ getRiskLevelText(permission.risk_level || 'low') }}
                </Tag>
              </div>
              <div class="detail-item">
                <label>继承权限:</label>
                <Tag :color="permission.inherit_enabled ? 'green' : 'red'">
                  {{ permission.inherit_enabled ? '是' : '否' }}
                </Tag>
              </div>
              <div class="detail-item">
                <label>需要MFA:</label>
                <Tag :color="permission.mfa_required ? 'orange' : 'default'">
                  {{ permission.mfa_required ? '是' : '否' }}
                </Tag>
              </div>
              <div class="detail-item">
                <label>需要审批:</label>
                <Tag
                  :color="permission.approval_required ? 'purple' : 'default'"
                >
                  {{ permission.approval_required ? '是' : '否' }}
                </Tag>
              </div>
            </div>
            <div v-if="permission.conditions" class="conditions-item">
              <label>权限条件:</label>
              <div class="conditions-content">
                <pre>{{ permission.conditions }}</pre>
              </div>
            </div>
          </div>

          <!-- 操作历史占位 -->
          <div class="detail-section">
            <h3 class="section-title">📝 操作历史</h3>
            <div class="history-placeholder">
              <div class="placeholder-icon">📊</div>
              <p>操作历史功能开发中...</p>
              <p class="placeholder-tip">
                将显示权限的创建、修改、启用、禁用等操作记录
              </p>
            </div>
          </div>
        </div>

        <div v-else class="empty-content">
          <div class="empty-icon">❌</div>
          <p>暂无权限详情数据</p>
        </div>
      </Spin>
    </div>
  </Drawer>
</template>

<style lang="less" scoped>
.permission-detail-container {
  height: calc(100vh - 80px);
  overflow-y: auto;
  padding: 8px;

  .detail-content {
    .detail-section {
      margin-bottom: 32px;
      padding: 20px;
      background: #fafafa;
      border-radius: 8px;
      border: 1px solid #f0f0f0;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        margin: 0 0 20px 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: 1px solid #e8e8e8;
        padding-bottom: 10px;
      }

      .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        margin-bottom: 16px;

        .detail-item {
          display: flex;
          align-items: center;
          gap: 8px;

          label {
            min-width: 80px;
            color: #666;
            font-weight: 500;
            flex-shrink: 0;
          }

          .value-text {
            color: #333;
            word-break: break-word;
            flex: 1;
          }
        }
      }

      .description-item,
      .conditions-item {
        .description-content,
        .conditions-content {
          margin-top: 8px;
          padding: 12px;
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 6px;
          line-height: 1.6;
          color: #333;

          pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
            font-family: 'JetBrains Mono', 'Courier New', monospace;
            font-size: 13px;
          }
        }

        label {
          color: #666;
          font-weight: 500;
        }
      }

      .history-placeholder {
        text-align: center;
        padding: 40px 20px;
        color: #666;

        .placeholder-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        p {
          margin: 8px 0;
          line-height: 1.5;
        }

        .placeholder-tip {
          font-size: 14px;
          color: #999;
        }
      }
    }
  }

  .empty-content {
    text-align: center;
    padding: 60px 20px;
    color: #666;

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    p {
      margin: 0;
      font-size: 16px;
    }
  }
}

// 标签样式优化
:deep(.ant-tag) {
  border-radius: 4px;
  font-weight: 500;
  padding: 2px 8px;
}

// 响应式设计
@media (max-width: 768px) {
  .permission-detail-container {
    .detail-content {
      .detail-section {
        padding: 16px;

        .detail-grid {
          grid-template-columns: 1fr;
          gap: 12px;

          .detail-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;

            label {
              min-width: auto;
            }
          }
        }
      }
    }
  }
}
</style>
