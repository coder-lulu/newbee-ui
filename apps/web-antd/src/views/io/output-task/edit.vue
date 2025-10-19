<template>
  <div class="p-4">
    <a-card :bordered="false">
      <template #title>{{ isEdit ? '编辑输出任务' : '新建输出任务' }}</template>
      <a-form :model="form" :rules="rules" layout="vertical" ref="formRef">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="名称" name="name" required>
              <a-input v-model:value="form.name" placeholder="请输入任务名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="输出类型" name="outputType" required>
              <a-select v-model:value="form.outputType" placeholder="请选择类型">
                <a-select-option value="kafka">kafka</a-select-option>
                <a-select-option value="elasticsearch">elasticsearch</a-select-option>
                <a-select-option value="database">database</a-select-option>
                <a-select-option value="api">api</a-select-option>
                <a-select-option value="file">file</a-select-option>
                <a-select-option value="webhook">webhook</a-select-option>
                <a-select-option value="email">email</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="优先级" name="priority">
              <a-input-number v-model:value="form.priority" :min="1" :max="10" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="超时(秒)" name="timeoutSeconds">
              <a-input-number v-model:value="form.timeoutSeconds" :min="1" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="输出格式" name="outputFormat">
              <a-select v-model:value="form.outputFormat" allow-clear>
                <a-select-option value="json">json</a-select-option>
                <a-select-option value="xml">xml</a-select-option>
                <a-select-option value="csv">csv</a-select-option>
                <a-select-option value="excel">excel</a-select-option>
                <a-select-option value="txt">txt</a-select-option>
                <a-select-option value="parquet">parquet</a-select-option>
                <a-select-option value="avro">avro</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="数据源配置(JSON)" name="dataSource">
          <a-textarea v-model:value="form.dataSource" :rows="6" placeholder="JSON 字符串" />
        </a-form-item>
        <a-form-item label="转换配置(JSON)" name="transformConfig">
          <a-textarea v-model:value="form.transformConfig" :rows="6" placeholder="JSON 字符串" />
        </a-form-item>
        <a-form-item label="推送目标(JSON Array)" name="pushTargets">
          <a-textarea v-model:value="form.pushTargets" :rows="4" placeholder='例如: [{"type":"kafka","topic":"demo"}]' />
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
import { onMounted, reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import { createOutputTask, getOutputTaskById, updateOutputTask } from '#/api/io/output-task';
import type { OutputTaskInfo } from '#/api/io/model';

const route = useRoute();
const router = useRouter();
const idParam = route.params.id as string | undefined;
const isEdit = !!idParam;
const submitting = ref(false);
const formRef = ref();

const form = reactive<Partial<OutputTaskInfo>>({
  name: '',
  outputType: 'database',
  priority: 5,
  timeoutSeconds: 1800,
  outputFormat: 'json',
});

const jsonValidator = (v?: string) => { if (!v) return Promise.resolve(); try { JSON.parse(v); return Promise.resolve(); } catch { return Promise.reject('必须是合法 JSON'); } };

const rules = {
  name: [{ required: true, message: '请输入任务名称' }, { min: 1, max: 100, message: '长度 1-100' }],
  outputType: [{ required: true, message: '请选择类型' }],
  dataSource: [{ validator: (_: any, v: string) => jsonValidator(v), trigger: 'blur' }],
  transformConfig: [{ validator: (_: any, v: string) => jsonValidator(v), trigger: 'blur' }],
  pushTargets: [{ validator: (_: any, v: string) => jsonValidator(v), trigger: 'blur' }],
};

async function loadDetail(id: number) { try { Object.assign(form, await getOutputTaskById(id)); } catch {} }

async function onSubmit() {
  try {
    submitting.value = true;
    await formRef.value?.validate();
    const payload: any = { ...form };
    ['dataSource', 'transformConfig', 'pushTargets'].forEach((k) => { if (payload[k] && typeof payload[k] !== 'string') payload[k] = JSON.stringify(payload[k]); });
    if (isEdit) { await updateOutputTask({ ...payload, id: Number(idParam) }); message.success('更新成功'); }
    else { await createOutputTask(payload); message.success('创建成功'); }
    router.push({ name: 'OutputTaskList' });
  } catch {}
  finally { submitting.value = false; }
}

function goBack() { router.back(); }

onMounted(() => { if (isEdit) loadDetail(Number(idParam)); });
</script>

<style scoped></style>

