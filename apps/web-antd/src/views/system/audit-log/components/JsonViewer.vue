<template>
  <div class="json-viewer">
    <div class="json-viewer-header">
      <a-space>
        <span class="json-viewer-title">{{ title }}</span>
        <a-button 
          type="text" 
          size="small" 
          @click="copyToClipboard"
          :loading="copying"
        >
          <template #icon>
            <CopyOutlined />
          </template>
          复制
        </a-button>
        <a-button 
          type="text" 
          size="small" 
          @click="downloadJson"
        >
          <template #icon>
            <DownloadOutlined />
          </template>
          下载
        </a-button>
      </a-space>
    </div>
    <div class="json-viewer-content">
      <pre v-if="formattedJson" class="json-code">{{ formattedJson }}</pre>
      <a-empty v-else description="无数据" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { message } from 'ant-design-vue';
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons-vue';
import { Button as AButton, Empty as AEmpty, Space as ASpace, Empty } from 'ant-design-vue';

interface Props {
  data?: string | object;
  title?: string;
  fileName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'JSON数据',
  fileName: 'data.json',
});

const copying = ref(false);

const formattedJson = computed(() => {
  if (!props.data) return '';
  
  try {
    const jsonData = typeof props.data === 'string' 
      ? JSON.parse(props.data) 
      : props.data;
    return JSON.stringify(jsonData, null, 2);
  } catch {
    return typeof props.data === 'string' ? props.data : '';
  }
});

const copyToClipboard = async () => {
  if (!formattedJson.value) return;
  
  copying.value = true;
  try {
    await navigator.clipboard.writeText(formattedJson.value);
    message.success('复制成功');
  } catch {
    message.error('复制失败');
  } finally {
    copying.value = false;
  }
};

const downloadJson = () => {
  if (!formattedJson.value) return;
  
  const blob = new Blob([formattedJson.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = props.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  message.success('下载成功');
};
</script>

<style scoped>
.json-viewer {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
}

.json-viewer-header {
  padding: 8px 12px;
  background-color: #fafafa;
  border-bottom: 1px solid #d9d9d9;
}

.json-viewer-title {
  font-weight: 500;
  color: #262626;
}

.json-viewer-content {
  max-height: 400px;
  overflow: auto;
}

.json-code {
  margin: 0;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #262626;
  background-color: #fff;
  border: none;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>