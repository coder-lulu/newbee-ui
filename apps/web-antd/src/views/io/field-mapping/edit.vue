<template>
  <div class="p-4">
    <a-card :bordered="false">
      <template #title>{{ isEdit ? '编辑字段映射' : '新建字段映射' }}</template>
      <a-form :model="form" :rules="rules" layout="vertical" ref="formRef">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="映射名称" name="mappingName" required>
              <a-input v-model:value="form.mappingName" placeholder="请输入映射名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="类型" name="mappingType" required>
              <a-select v-model:value="form.mappingType" placeholder="请选择类型">
                <a-select-option value="input">input</a-select-option>
                <a-select-option value="output">output</a-select-option>
                <a-select-option value="transform">transform</a-select-option>
                <a-select-option value="validation">validation</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="源字段" name="sourceField" required>
              <a-input v-model:value="form.sourceField" placeholder="请输入源字段" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="目标字段" name="targetField" required>
              <a-input v-model:value="form.targetField" placeholder="请输入目标字段" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="源字段类型" name="sourceDataType">
              <a-select v-model:value="form.sourceDataType" allow-clear>
                <a-select-option value="string">string</a-select-option>
                <a-select-option value="int">int</a-select-option>
                <a-select-option value="float">float</a-select-option>
                <a-select-option value="bool">bool</a-select-option>
                <a-select-option value="date">date</a-select-option>
                <a-select-option value="datetime">datetime</a-select-option>
                <a-select-option value="json">json</a-select-option>
                <a-select-option value="array">array</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="目标字段类型" name="targetDataType">
              <a-select v-model:value="form.targetDataType" allow-clear>
                <a-select-option value="string">string</a-select-option>
                <a-select-option value="int">int</a-select-option>
                <a-select-option value="float">float</a-select-option>
                <a-select-option value="bool">bool</a-select-option>
                <a-select-option value="date">date</a-select-option>
                <a-select-option value="datetime">datetime</a-select-option>
                <a-select-option value="json">json</a-select-option>
                <a-select-option value="array">array</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="转换类型" name="transformType">
              <a-select v-model:value="form.transformType" allow-clear>
                <a-select-option value="direct">direct</a-select-option>
                <a-select-option value="format">format</a-select-option>
                <a-select-option value="calculate">calculate</a-select-option>
                <a-select-option value="lookup">lookup</a-select-option>
                <a-select-option value="conditional">conditional</a-select-option>
                <a-select-option value="custom">custom</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="启用" name="isActive">
              <a-switch v-model:checked="form.isActive" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="优先级" name="priority">
              <a-input-number v-model:value="form.priority" :min="1" :max="1000" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="排序" name="sortOrder">
              <a-input-number v-model:value="form.sortOrder" :min="1" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="转换配置(JSON)" name="transformConfig">
          <a-textarea v-model:value="form.transformConfig" :rows="5" placeholder="JSON 字符串" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="默认值" name="defaultValue">
              <a-input v-model:value="form.defaultValue" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="允许空值" name="allowNull">
              <a-switch v-model:checked="form.allowNull" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="必填" name="isRequired">
              <a-switch v-model:checked="form.isRequired" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="校验正则" name="validationRegex">
              <a-input v-model:value="form.validationRegex" placeholder="可选" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="校验规则(JSON Array)" name="validationRules">
          <a-textarea v-model:value="form.validationRules" :rows="5" placeholder='例如: [{"type":"min","value":1}]' />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="查找表(JSON)" name="lookupTable">
              <a-textarea v-model:value="form.lookupTable" :rows="5" placeholder='例如: {"A":"1","B":"2"}' />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="查找区分大小写" name="lookupCaseSensitive">
              <a-switch v-model:checked="form.lookupCaseSensitive" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="条件规则(JSON Array)" name="conditionRules">
          <a-textarea v-model:value="form.conditionRules" :rows="5" placeholder='例如: [{"if":"x>0","then":"..."}]' />
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
import { onMounted, reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';

import { createFieldMapping, getFieldMappingById, updateFieldMapping } from '#/api/io/field-mapping';
import type { FieldMappingInfo } from '#/api/io/model';

const route = useRoute();
const router = useRouter();
const idParam = route.params.id as string | undefined;
const isEdit = !!idParam;
const submitting = ref(false);
const formRef = ref();

const form = reactive<Partial<FieldMappingInfo>>({
  mappingName: '',
  mappingType: 'transform',
  isActive: true,
  priority: 100,
  sortOrder: 100,
});

const jsonValidator = (value?: string) => {
  if (!value) return Promise.resolve();
  try {
    JSON.parse(value);
    return Promise.resolve();
  } catch {
    return Promise.reject('必须是合法 JSON');
  }
};

const rules = {
  mappingName: [
    { required: true, message: '请输入映射名称' },
    { min: 1, max: 100, message: '长度 1-100' },
  ],
  mappingType: [{ required: true, message: '请选择类型' }],
  sourceField: [{ required: true, message: '请输入源字段' }],
  targetField: [{ required: true, message: '请输入目标字段' }],
  transformConfig: [{ validator: (_: any, v: string) => jsonValidator(v), trigger: 'blur' }],
  validationRules: [{ validator: (_: any, v: string) => jsonValidator(v), trigger: 'blur' }],
  lookupTable: [{ validator: (_: any, v: string) => jsonValidator(v), trigger: 'blur' }],
  conditionRules: [{ validator: (_: any, v: string) => jsonValidator(v), trigger: 'blur' }],
  metadata: [{ validator: (_: any, v: string) => jsonValidator(v), trigger: 'blur' }],
};

async function loadDetail(id: number) {
  try {
    const data = await getFieldMappingById(id);
    Object.assign(form, data);
  } catch {}
}

async function onSubmit() {
  try {
    submitting.value = true;
    await formRef.value?.validate();

    const payload: any = { ...form };
    ['transformConfig', 'validationRules', 'lookupTable', 'conditionRules', 'metadata'].forEach((k) => {
      if (payload[k] && typeof payload[k] !== 'string') payload[k] = JSON.stringify(payload[k]);
    });

    if (isEdit) {
      await updateFieldMapping({ ...payload, id: Number(idParam) });
      message.success('更新成功');
    } else {
      await createFieldMapping(payload);
      message.success('创建成功');
    }
    router.push({ name: 'FieldMappingList' });
  } catch (e) {
    // ignore
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

