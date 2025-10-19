<template>
  <div class="p-4">
    <a-card :bordered="false">
      <template #title>{{ isEdit ? '编辑发现池' : '新建发现池' }}</template>
      <a-form :model="form" :rules="rules" layout="vertical" ref="formRef">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="名称" name="name" required>
              <a-input v-model:value="form.name" placeholder="请输入名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="类型" name="discoveryType" required>
              <a-select v-model:value="form.discoveryType" placeholder="请选择类型">
                <a-select-option value="file">file</a-select-option>
                <a-select-option value="api">api</a-select-option>
                <a-select-option value="sdk">sdk</a-select-option>
                <a-select-option value="builtin">builtin</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="调度表达式" name="schedule">
              <a-input v-model:value="form.schedule" placeholder="例如: 0 */5 * * * *" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="并发限制" name="concurrentLimit">
              <a-input-number v-model:value="form.concurrentLimit" :min="1" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="批处理大小" name="batchSize">
              <a-input-number v-model:value="form.batchSize" :min="1" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="最大重试次数" name="maxRetry">
              <a-input-number v-model:value="form.maxRetry" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="重试间隔(秒)" name="retryInterval">
              <a-input-number v-model:value="form.retryInterval" :min="1" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="描述" name="description">
              <a-input v-model:value="form.description" placeholder="可选" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="发现配置(JSON)" name="discoveryConfig">
          <a-textarea v-model:value="form.discoveryConfig" :rows="6" placeholder="JSON 字符串" />
        </a-form-item>

        <a-form-item label="字段映射(JSON)" name="fieldMapping">
          <a-textarea v-model:value="form.fieldMapping" :rows="6" placeholder="JSON 字符串" />
        </a-form-item>

        <a-form-item label="元数据(JSON)" name="metadata">
          <a-textarea v-model:value="form.metadata" :rows="4" placeholder="JSON 字符串" />
        </a-form-item>

        <a-space>
          <a-button type="primary" :loading="submitting" @click="onSubmit">保存</a-button>
          <a-button @click="goBack">返回</a-button>
        </a-space>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';

import {
  createDiscoveryPool,
  getDiscoveryPoolById,
  updateDiscoveryPool,
} from '#/api/io/discovery-pool';
import type { DiscoveryPoolInfo } from '#/api/io/model';

const route = useRoute();
const router = useRouter();
const idParam = route.params.id as string | undefined;
const isEdit = !!idParam;
const submitting = ref(false);
const formRef = ref();

const form = reactive<Partial<DiscoveryPoolInfo>>({
  name: '',
  discoveryType: 'file',
  schedule: '',
  batchSize: 100,
  concurrentLimit: 10,
  maxRetry: 3,
  retryInterval: 30,
});

const rules = {
  name: [
    { required: true, message: '请输入名称' },
    { min: 1, max: 100, message: '长度 1-100' },
  ],
  discoveryType: [{ required: true, message: '请选择类型' }],
  batchSize: [{ type: 'number', min: 1, message: '>= 1' }],
  concurrentLimit: [{ type: 'number', min: 1, message: '>= 1' }],
  maxRetry: [{ type: 'number', min: 0, message: '>= 0' }],
  retryInterval: [{ type: 'number', min: 1, message: '>= 1' }],
  discoveryConfig: [
    {
      validator: (_: any, v: string) => {
        if (!v) return Promise.resolve();
        try {
          JSON.parse(v);
          return Promise.resolve();
        } catch {
          return Promise.reject('必须是合法 JSON');
        }
      },
      trigger: 'blur',
    },
  ],
  fieldMapping: [
    {
      validator: (_: any, v: string) => {
        if (!v) return Promise.resolve();
        try {
          JSON.parse(v);
          return Promise.resolve();
        } catch {
          return Promise.reject('必须是合法 JSON');
        }
      },
      trigger: 'blur',
    },
  ],
  metadata: [
    {
      validator: (_: any, v: string) => {
        if (!v) return Promise.resolve();
        try {
          JSON.parse(v);
          return Promise.resolve();
        } catch {
          return Promise.reject('必须是合法 JSON');
        }
      },
      trigger: 'blur',
    },
  ],
};

async function loadDetail(id: number) {
  try {
    const data = await getDiscoveryPoolById(id);
    Object.assign(form, data);
  } catch {}
}

async function onSubmit() {
  try {
    submitting.value = true;
    await formRef.value?.validate();

    const payload: any = { ...form };
    // 字段为对象时后端可能接受 string 或 json，保持 string 传递
    if (payload.discoveryConfig && typeof payload.discoveryConfig !== 'string')
      payload.discoveryConfig = JSON.stringify(payload.discoveryConfig);
    if (payload.fieldMapping && typeof payload.fieldMapping !== 'string')
      payload.fieldMapping = JSON.stringify(payload.fieldMapping);
    if (payload.metadata && typeof payload.metadata !== 'string')
      payload.metadata = JSON.stringify(payload.metadata);

    if (isEdit) {
      await updateDiscoveryPool({ ...payload, id: Number(idParam) });
      message.success('更新成功');
    } else {
      await createDiscoveryPool(payload);
      message.success('创建成功');
    }
    router.push({ name: 'DiscoveryPoolList' });
  } catch (e) {
    // 统一错误提示
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  router.back();
}

onMounted(() => {
  if (isEdit) loadDetail(Number(idParam));
});
</script>

<style scoped></style>

