<template>
  <div class="p-4">
    <a-card :bordered="false">
      <template #title>映射详情</template>
      <a-descriptions :column="2" bordered :label-style="{ width: '160px' }">
        <a-descriptions-item label="ID">{{ data?.id }}</a-descriptions-item>
        <a-descriptions-item label="名称">{{ data?.mappingName }}</a-descriptions-item>
        <a-descriptions-item label="类型">{{ data?.mappingType }}</a-descriptions-item>
        <a-descriptions-item label="启用">
          <a-badge :status="data?.isActive ? 'success' : 'default'" :text="data?.isActive ? '是' : '否'" />
        </a-descriptions-item>
        <a-descriptions-item label="源字段">{{ data?.sourceField }}</a-descriptions-item>
        <a-descriptions-item label="目标字段">{{ data?.targetField }}</a-descriptions-item>
        <a-descriptions-item label="源类型">{{ data?.sourceDataType }}</a-descriptions-item>
        <a-descriptions-item label="目标类型">{{ data?.targetDataType }}</a-descriptions-item>
        <a-descriptions-item label="转换类型">{{ data?.transformType }}</a-descriptions-item>
        <a-descriptions-item label="优先级/排序">{{ data?.priority }} / {{ data?.sortOrder }}</a-descriptions-item>
        <a-descriptions-item label="统计" :span="2">
          使用 {{ data?.usageCount }}，成功 {{ data?.successCount }}，失败 {{ data?.failedCount }}
        </a-descriptions-item>
        <a-descriptions-item label="描述" :span="2">{{ data?.description || '—' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />
      <a-space>
        <a-button type="primary" @click="goEdit">编辑</a-button>
        <a-button @click="goList">返回列表</a-button>
      </a-space>

      <a-divider />
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card size="small" title="转换配置(JSON)">
            <pre class="code-block">{{ pretty(data?.transformConfig) }}</pre>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card size="small" title="校验规则(JSON)">
            <pre class="code-block">{{ pretty(data?.validationRules) }}</pre>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card size="small" title="查找表(JSON)">
            <pre class="code-block">{{ pretty(data?.lookupTable) }}</pre>
          </a-card>
        </a-col>
      </a-row>
      <a-row :gutter="16" class="mt-4">
        <a-col :span="12">
          <a-card size="small" title="条件规则(JSON)">
            <pre class="code-block">{{ pretty(data?.conditionRules) }}</pre>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card size="small" title="元数据(JSON)">
            <pre class="code-block">{{ pretty(data?.metadata) }}</pre>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getFieldMappingById } from '#/api/io/field-mapping';
import type { FieldMappingInfo } from '#/api/io/model';

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const data = ref<FieldMappingInfo>();

function pretty(str?: string) {
  if (!str) return '—';
  try {
    const obj = typeof str === 'string' ? JSON.parse(str) : str;
    return JSON.stringify(obj, null, 2);
  } catch {
    return str;
  }
}

async function refresh() {
  try {
    data.value = await getFieldMappingById(id);
  } catch {}
}

function goEdit() {
  router.push({ name: 'FieldMappingEdit', params: { id: String(id) } });
}

function goList() {
  router.push({ name: 'FieldMappingList' });
}

onMounted(refresh);
</script>

<style scoped>
.code-block {
  max-height: 260px;
  overflow: auto;
  background: var(--vben-color-fill-secondary, #fafafa);
  border-radius: 6px;
  padding: 12px;
}
.mt-4 { margin-top: 16px; }
</style>

