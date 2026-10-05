<template>
  <div class="p-4">
    <a-card :bordered="false">
      <template #title>
        {{ isEdit ? '编辑配置' : '新建配置' }}
      </template>
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="配置键" name="configKey">
          <a-input
            v-model:value="formState.configKey"
            placeholder="请输入配置键，如: database.host"
            :disabled="isEdit"
          />
          <template #extra>
            配置键唯一标识，建议使用点号分隔的层级结构
          </template>
        </a-form-item>

        <a-form-item label="配置值" name="configValue">
          <a-textarea
            v-model:value="formState.configValue"
            placeholder="请输入配置值"
            :rows="4"
            show-count
          />
          <template #extra>
            支持字符串、数字、布尔值、JSON等格式
          </template>
        </a-form-item>

        <a-form-item label="值类型" name="valueType">
          <a-select v-model:value="formState.valueType" placeholder="请选择值类型">
            <a-select-option value="string">字符串 (string)</a-select-option>
            <a-select-option value="number">数字 (number)</a-select-option>
            <a-select-option value="boolean">布尔值 (boolean)</a-select-option>
            <a-select-option value="json">JSON对象 (json)</a-select-option>
            <a-select-option value="array">数组 (array)</a-select-option>
            <a-select-option value="object">对象 (object)</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="服务名称" name="serviceName">
          <a-input
            v-model:value="formState.serviceName"
            placeholder="请输入服务名称，如: unified-io"
          />
          <template #extra>
            配置所属的服务名称
          </template>
        </a-form-item>

        <a-form-item label="分类" name="category">
          <a-select v-model:value="formState.category" placeholder="请选择分类">
            <a-select-option value="database">数据库</a-select-option>
            <a-select-option value="redis">Redis</a-select-option>
            <a-select-option value="mq">消息队列</a-select-option>
            <a-select-option value="api">API</a-select-option>
            <a-select-option value="system">系统</a-select-option>
            <a-select-option value="business">业务</a-select-option>
            <a-select-option value="other">其他</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="配置组" name="configGroup">
          <a-input
            v-model:value="formState.configGroup"
            placeholder="请输入配置组，如: discovery-pool"
          />
          <template #extra>
            用于分组管理相关配置
          </template>
        </a-form-item>

        <a-form-item label="作用域" name="scope">
          <a-select v-model:value="formState.scope" placeholder="请选择作用域">
            <a-select-option value="global">全局 (global)</a-select-option>
            <a-select-option value="service">服务级 (service)</a-select-option>
            <a-select-option value="instance">实例级 (instance)</a-select-option>
          </a-select>
          <template #extra>
            全局：所有服务共享；服务级：同一服务共享；实例级：仅当前实例
          </template>
        </a-form-item>

        <a-form-item label="默认值" name="defaultValue">
          <a-input
            v-model:value="formState.defaultValue"
            placeholder="请输入默认值"
          />
          <template #extra>
            当配置值为空时使用的默认值
          </template>
        </a-form-item>

        <a-form-item label="描述" name="description">
          <a-textarea
            v-model:value="formState.description"
            placeholder="请输入配置描述"
            :rows="3"
          />
        </a-form-item>

        <a-form-item label="配置属性" name="properties">
          <a-space direction="vertical">
            <a-checkbox v-model:checked="formState.isReadonly">
              只读配置（禁止修改）
            </a-checkbox>
            <a-checkbox v-model:checked="formState.isSensitive">
              敏感信息（列表中隐藏值）
            </a-checkbox>
          </a-space>
        </a-form-item>

        <a-divider />

        <a-form-item :wrapper-col="{ span: 16, offset: 4 }">
          <a-space>
            <a-button type="primary" :loading="submitting" @click="handleSubmit">
              {{ isEdit ? '保存' : '创建' }}
            </a-button>
            <a-button @click="handleCancel">取消</a-button>
            <a-button v-if="isEdit" type="dashed" @click="testConfig">
              测试配置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- JSON验证对话框 -->
    <a-modal
      v-model:open="jsonValidatorVisible"
      title="JSON 格式验证"
      width="600px"
      @ok="jsonValidatorVisible = false"
      :z-index="1002"
      :mask="true"
      :maskClosable="true"
      :destroyOnClose="true"
      centered
    >
      <div v-if="jsonValidationResult.valid" class="text-green-600">
        ✓ JSON 格式正确
      </div>
      <div v-else class="text-red-600">
        ✗ JSON 格式错误: {{ jsonValidationResult.error }}
      </div>
      <a-divider />
      <pre class="bg-gray-100 p-4 rounded">{{ jsonValidationResult.formatted }}</pre>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter, useRoute } from 'vue-router';
import type { FormInstance, Rule } from 'ant-design-vue/es/form';

import {
  getConfigByKey,
  createConfig,
  updateConfig,
} from '#/api/io/config';
import type {
  ConfigItem,
  CreateConfigReq,
  UpdateConfigReq,
  ValueType,
  ConfigScope,
} from '#/api/io/model';

const router = useRouter();
const route = useRoute();

const formRef = ref<FormInstance>();
const submitting = ref(false);
const isEdit = ref(false);
const originalConfigKey = ref('');

// JSON验证对话框
const jsonValidatorVisible = ref(false);
const jsonValidationResult = reactive({
  valid: false,
  error: '',
  formatted: '',
});

// 表单数据
const formState = reactive<Partial<CreateConfigReq>>({
  configKey: '',
  configValue: '',
  valueType: 'string',
  serviceName: '',
  category: '',
  configGroup: '',
  scope: 'service',
  defaultValue: '',
  description: '',
  isReadonly: false,
  isSensitive: false,
});

// 表单验证规则
const rules: Record<string, Rule[]> = {
  configKey: [
    { required: true, message: '请输入配置键', trigger: 'blur' },
    { min: 3, max: 100, message: '配置键长度应为3-100个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9._-]+$/, message: '只能包含字母、数字、点、下划线和横线', trigger: 'blur' },
  ],
  configValue: [
    { required: true, message: '请输入配置值', trigger: 'blur' },
  ],
  valueType: [
    { required: true, message: '请选择值类型', trigger: 'change' },
  ],
  serviceName: [
    { required: true, message: '请输入服务名称', trigger: 'blur' },
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' },
  ],
};

// 监听值类型变化，自动验证JSON格式
watch(() => formState.valueType, (newType) => {
  if ((newType === 'json' || newType === 'array' || newType === 'object') && formState.configValue) {
    validateJson(formState.configValue);
  }
});

// 验证JSON格式
const validateJson = (value: string) => {
  try {
    const parsed = JSON.parse(value);
    jsonValidationResult.valid = true;
    jsonValidationResult.error = '';
    jsonValidationResult.formatted = JSON.stringify(parsed, null, 2);
  } catch (e: any) {
    jsonValidationResult.valid = false;
    jsonValidationResult.error = e.message;
    jsonValidationResult.formatted = value;
  }
};

// 加载配置详情
const loadConfigDetail = async (configKey: string) => {
  try {
    const { data } = await getConfigByKey({ configKey });
    if (data?.data) {
      const config = data.data;
      Object.assign(formState, {
        configKey: config.configKey,
        configValue: config.configValue,
        valueType: config.valueType,
        serviceName: config.serviceName,
        category: config.category,
        configGroup: config.configGroup,
        scope: config.scope,
        defaultValue: config.defaultValue,
        description: config.description,
        isReadonly: config.isReadonly,
        isSensitive: config.isSensitive,
      });
      originalConfigKey.value = config.configKey;
    }
  } catch (error) {
    message.error('加载配置详情失败');
    router.back();
  }
};

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();

    // 如果是JSON类型，先验证格式
    if (
      (formState.valueType === 'json' ||
       formState.valueType === 'array' ||
       formState.valueType === 'object') &&
      formState.configValue
    ) {
      validateJson(formState.configValue);
      if (!jsonValidationResult.valid) {
        message.error('JSON格式错误，请修正后再提交');
        jsonValidatorVisible.value = true;
        return;
      }
    }

    submitting.value = true;

    if (isEdit.value) {
      await updateConfig(formState as UpdateConfigReq);
      message.success('更新成功');
    } else {
      await createConfig(formState as CreateConfigReq);
      message.success('创建成功');
    }

    router.back();
  } catch (error: any) {
    if (error.errorFields) {
      message.error('请填写必填项');
    } else {
      message.error(isEdit.value ? '更新失败' : '创建失败');
    }
  } finally {
    submitting.value = false;
  }
};

// 取消
const handleCancel = () => {
  router.back();
};

// 测试配置
const testConfig = () => {
  if (!formState.configValue) {
    message.warning('请先填写配置值');
    return;
  }

  // 如果是JSON类型，显示验证结果
  if (
    formState.valueType === 'json' ||
    formState.valueType === 'array' ||
    formState.valueType === 'object'
  ) {
    validateJson(formState.configValue);
    jsonValidatorVisible.value = true;
  } else {
    message.success(`配置值类型: ${formState.valueType}\n当前值: ${formState.configValue}`);
  }
};

onMounted(() => {
  const configKey = route.params.key as string;
  if (configKey) {
    isEdit.value = true;
    loadConfigDetail(configKey);
  }
});
</script>

<style scoped>
:deep(.ant-form-item-extra) {
  font-size: 12px;
  color: #999;
}

/* 确保Modal内容正确显示 */
:deep(.ant-modal) {
  position: relative;
}

:deep(.ant-modal-mask) {
  background-color: rgba(0, 0, 0, 0.45);
}

:deep(.ant-modal-wrap) {
  overflow: auto;
}
</style>
