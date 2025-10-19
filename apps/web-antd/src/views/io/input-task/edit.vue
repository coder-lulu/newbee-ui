<template>
  <div class="p-4">
    <a-card :bordered="false">
      <template #title>{{ isEdit ? '编辑输入任务' : '新建输入任务' }}</template>
      <a-form :model="form" :rules="rules" layout="vertical" ref="formRef">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="名称" name="name" required>
              <a-input v-model:value="form.name" placeholder="请输入任务名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="类型" name="taskType" required>
              <a-select v-model:value="form.taskType" placeholder="请选择类型">
                <a-select-option value="file">file</a-select-option>
                <a-select-option value="api">api</a-select-option>
                <a-select-option value="sdk">sdk</a-select-option>
                <a-select-option value="builtin">builtin</a-select-option>
                <a-select-option value="manual">manual</a-select-option>
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
            <a-form-item label="最大重试" name="maxRetry">
              <a-input-number v-model:value="form.maxRetry" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="任务配置(JSON)" name="taskConfig">
          <a-textarea v-model:value="form.taskConfig" :rows="6" placeholder="JSON 字符串" />
        </a-form-item>
        <a-form-item label="校验配置(JSON)" name="validationConfig">
          <a-textarea v-model:value="form.validationConfig" :rows="6" placeholder="JSON 字符串" />
        </a-form-item>
        <a-form-item label="输出目标(JSON Array)" name="outputTargets">
          <a-textarea v-model:value="form.outputTargets" :rows="4" placeholder='例如: [{"type":"file","path":"/tmp/out.json"}]' />
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
import { createInputTask, getInputTaskById, updateInputTask } from '#/api/io/input-task';
import type { InputTaskInfo } from '#/api/io/model';

const route = useRoute();
const router = useRouter();
const idParam = route.params.id as string | undefined;
const isEdit = !!idParam;
const submitting = ref(false);
const formRef = ref();

const form = reactive<Partial<InputTaskInfo>>({
  name: '',
  taskType: 'file',
  priority: 5,
  timeoutSeconds: 3600,
  maxRetry: 3,
});

const jsonValidator = (v?: string) => {
  if (!v) return Promise.resolve();
  try { JSON.parse(v); return Promise.resolve(); } catch { return Promise.reject('必须是合法 JSON'); }
};

const rules = {
  name: [{ required: true, message: '请输入任务名称' }, { min: 1, max: 100, message: '长度 1-100' }],
  taskType: [{ required: true, message: '请选择类型' }],
  taskConfig: [{ validator: (_: any, v: string) => jsonValidator(v), trigger: 'blur' }],
  validationConfig: [{ validator: (_: any, v: string) => jsonValidator(v), trigger: 'blur' }],
  outputTargets: [{ validator: (_: any, v: string) => jsonValidator(v), trigger: 'blur' }],
};

async function loadDetail(id: number) {
  try { Object.assign(form, await getInputTaskById(id)); } catch {}
}

async function onSubmit() {
  try {
    submitting.value = true;
    await formRef.value?.validate();
    const payload: any = { ...form };
    ['taskConfig', 'validationConfig', 'outputTargets'].forEach((k) => { if (payload[k] && typeof payload[k] !== 'string') payload[k] = JSON.stringify(payload[k]); });
    if (isEdit) { await updateInputTask({ ...payload, id: Number(idParam) }); message.success('更新成功'); }
    else { await createInputTask(payload); message.success('创建成功'); }
    // 列表路由可能尚未注册（由后台菜单驱动），做容错
    if (router.hasRoute('InputTaskList' as any)) {
      router.push({ name: 'InputTaskList' as any });
    } else {
      router.back();
    }
  } catch {}
  finally { submitting.value = false; }
}

function goBack() { router.back(); }

onMounted(() => { if (isEdit) loadDetail(Number(idParam)); });
</script>

<style scoped></style>
