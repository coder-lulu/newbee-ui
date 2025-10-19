<template>
  <Drawer
    title="审计日志详情"
    :loading="loading"
    :show-footer="false"
  >
    <div v-if="auditLog" class="audit-log-detail">
      <!-- 基本信息 -->
      <div class="detail-section">
        <div class="section-title">
          <FileTextOutlined />
          基本信息
        </div>
        <a-row :gutter="16">
          <a-col :span="12">
            <div class="detail-item">
              <span class="detail-label">日志ID:</span>
              <span class="detail-value">{{ auditLog.id }}</span>
              <a-button type="text" size="small" @click="copyText(auditLog.id)">
                <CopyOutlined />
              </a-button>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <span class="detail-label">操作时间:</span>
              <span class="detail-value">{{ formatTime(auditLog.createdAt) }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <span class="detail-label">用户ID:</span>
              <span class="detail-value">{{ auditLog.userId }}</span>
              <a-button type="text" size="small" @click="copyText(auditLog.userId)">
                <CopyOutlined />
              </a-button>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <span class="detail-label">用户名:</span>
              <span class="detail-value">{{ auditLog.userName || '-' }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <span class="detail-label">操作类型:</span>
              <span class="detail-value">
                <AuditOperationTag 
                  v-if="auditLog.operationType"
                  :operation-type="auditLog.operationType" 
                />
                <span v-else>-</span>
              </span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <span class="detail-label">资源类型:</span>
              <span class="detail-value">{{ auditLog.resourceType }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <span class="detail-label">资源ID:</span>
              <span class="detail-value">{{ auditLog.resourceId || '-' }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <span class="detail-label">租户ID:</span>
              <span class="detail-value">{{ auditLog.tenantId || '-' }}</span>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 请求信息 -->
      <div class="detail-section">
        <div class="section-title">
          <ApiOutlined />
          请求信息
        </div>
        <a-row :gutter="16">
          <a-col :span="12">
            <div class="detail-item">
              <span class="detail-label">请求方法:</span>
              <span class="detail-value method-tag" :class="auditLog.requestMethod?.toLowerCase()">
                {{ auditLog.requestMethod }}
              </span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <span class="detail-label">响应状态:</span>
              <span class="detail-value">
                <AuditStatusBadge 
                  v-if="auditLog.responseStatus"
                  :status="auditLog.responseStatus" 
                />
                <span v-else>-</span>
              </span>
            </div>
          </a-col>
          <a-col :span="24">
            <div class="detail-item">
              <span class="detail-label">请求路径:</span>
              <span class="detail-value">{{ auditLog.requestPath }}</span>
              <a-button type="text" size="small" @click="copyText(auditLog.requestPath)">
                <CopyOutlined />
              </a-button>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <span class="detail-label">IP地址:</span>
              <span class="detail-value">{{ auditLog.ipAddress }}</span>
              <a-button type="text" size="small" @click="copyText(auditLog.ipAddress)">
                <CopyOutlined />
              </a-button>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <span class="detail-label">处理耗时:</span>
              <span class="detail-value">
                <ResponseTimeIndicator :duration="auditLog.durationMs || 0" />
              </span>
            </div>
          </a-col>
          <a-col :span="24">
            <div class="detail-item">
              <span class="detail-label">User-Agent:</span>
              <div class="detail-value user-agent">{{ auditLog.userAgent || '-' }}</div>
              <a-button 
                v-if="auditLog.userAgent" 
                type="text" 
                size="small" 
                @click="copyText(auditLog.userAgent)"
              >
                <CopyOutlined />
              </a-button>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 数据详情 -->
      <div class="detail-section">
        <div class="section-title">
          <DatabaseOutlined />
          数据详情
        </div>
        <div class="data-section">
          <JsonViewer 
            v-if="auditLog.requestData"
            :data="auditLog.requestData"
            title="请求数据"
            file-name="request-data.json"
          />
          <div v-else class="no-data">
            <a-empty description="无请求数据" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          </div>
        </div>
        <div class="data-section">
          <JsonViewer 
            v-if="auditLog.responseData"
            :data="auditLog.responseData"
            title="响应数据"
            file-name="response-data.json"
          />
          <div v-else class="no-data">
            <a-empty description="无响应数据" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          </div>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="auditLog.errorMessage" class="detail-section">
        <div class="section-title">
          <ExclamationCircleOutlined />
          错误信息
        </div>
        <div class="error-message">
          <a-alert 
            :message="auditLog.errorMessage" 
            type="error" 
            show-icon 
          />
        </div>
      </div>

      <!-- 元数据 -->
      <div v-if="auditLog.metadata && Object.keys(auditLog.metadata).length > 0" class="detail-section">
        <div class="section-title">
          <TagsOutlined />
          元数据
        </div>
        <JsonViewer 
          :data="auditLog.metadata"
          title="元数据"
          file-name="metadata.json"
        />
      </div>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenDrawer } from '@vben/common-ui';
import {
  Alert as AAlert,
  Button as AButton,
  Col as ACol,
  Empty as AEmpty,
  Row as ARow,
  Empty,
} from 'ant-design-vue';

import {
  ApiOutlined,
  CopyOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  TagsOutlined,
} from '@ant-design/icons-vue';

import type { AuditLogInfo } from '#/api/system/audit-log/model';
import { getAuditLogById } from '#/api/system/audit-log';

import AuditOperationTag from './AuditOperationTag.vue';
import AuditStatusBadge from './AuditStatusBadge.vue';
import ResponseTimeIndicator from './ResponseTimeIndicator.vue';
import JsonViewer from './JsonViewer.vue';

const loading = ref(false);
const auditLog = ref<AuditLogInfo>();

// 使用 useVbenDrawer 来获取共享数据
const [Drawer, drawerApi] = useVbenDrawer({
  footer: false, // 隐藏底部按钮（确认、取消按钮）
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const data = drawerApi.getData<AuditLogInfo>();
      if (data) {
        if (data.id && !data.requestData) {
          // 如果只有基本信息，需要查询完整详情
          loading.value = true;
          try {
            const result = await getAuditLogById(data.id);
            auditLog.value = result;
          } finally {
            loading.value = false;
          }
        } else {
          auditLog.value = data;
        }
      }
    }
  },
  onCancel() {
    drawerApi.close();
  },
});

const formatTime = (timestamp?: number) => {
  return timestamp ? dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss') : '-';
};

const copyText = async (text?: string) => {
  if (!text) return;
  
  try {
    await navigator.clipboard.writeText(text);
    message.success('复制成功');
  } catch {
    message.error('复制失败');
  }
};
</script>

<style scoped>
.audit-log-detail {
  padding: 16px;
}

.detail-section {
  margin-bottom: 24px;
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

.section-title .anticon {
  margin-right: 8px;
  color: #1890ff;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  min-height: 32px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  min-width: 80px;
  color: #666;
  font-weight: 500;
}

.detail-value {
  flex: 1;
  color: #262626;
  margin-left: 8px;
  word-break: break-all;
}

.user-agent {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  max-height: 60px;
  overflow-y: auto;
}

.method-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.method-tag.get {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.method-tag.post {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.method-tag.put {
  background: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.method-tag.delete {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.method-tag.patch {
  background: #f9f0ff;
  color: #722ed1;
  border: 1px solid #d3adf7;
}

.data-section {
  margin-bottom: 16px;
}

.data-section:last-child {
  margin-bottom: 0;
}

.no-data {
  padding: 20px;
  text-align: center;
}

.error-message {
  margin-top: 8px;
}
</style>