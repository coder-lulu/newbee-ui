<script lang="ts" setup>
import type { DiscoveryMethod } from './DiscoveryMethodSelector.vue';
import type { FormInstance } from 'ant-design-vue';

import { onMounted, reactive, ref, watch } from 'vue';
import { DiscoveryProviderAPI } from '#/api/io/discovery-provider';

import { CheckOutlined, EyeInvisibleOutlined, EyeOutlined, InfoCircleOutlined } from '@ant-design/icons-vue';
import { Alert, Button, Card, Checkbox, Col, Form, Input, InputNumber, message, Row, Select, Space, Tooltip } from 'ant-design-vue';

interface Props {
  method: DiscoveryMethod;
  initialParameters: Record<string, any>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  parametersConfigured: [parameters: Record<string, any>];
}>();

const formRef = ref<FormInstance>();
const formState = reactive<Record<string, any>>({});
const showPassword = ref<Record<string, boolean>>({});

// Provider Schema相关状态
const providerSchema = ref<DiscoveryProviderAPI.ProviderSchemaInfo | null>(null);
const schemaLoading = ref(false);
const dynamicParameters = ref<DiscoveryProviderAPI.ParameterDefinition[]>([]);

// 参数定义模板
const parameterDefinitions: Record<
  string,
  {
    label: string;
    type: 'text' | 'password' | 'number' | 'select';
    placeholder?: string;
    options?: Array<{ label: string; value: any }>;
    default?: any;
    tooltip?: string;
    rules?: any[];
  }
> = {
  // 通用参数
  host: {
    label: '主机地址',
    type: 'text',
    placeholder: '请输入主机IP或域名',
    tooltip: '目标主机的IP地址或域名',
    rules: [{ required: true, message: '请输入主机地址' }],
  },
  port: {
    label: '端口',
    type: 'number',
    placeholder: '请输入端口号',
    default: 22,
    tooltip: '服务监听端口',
    rules: [{ required: true, message: '请输入端口号' }],
  },
  username: {
    label: '用户名',
    type: 'text',
    placeholder: '请输入用户名',
    rules: [{ required: true, message: '请输入用户名' }],
  },
  password: {
    label: '密码',
    type: 'password',
    placeholder: '请输入密码',
    rules: [{ required: true, message: '请输入密码' }],
  },

  // 云平台参数
  accessKeyId: {
    label: 'Access Key ID',
    type: 'text',
    placeholder: '请输入Access Key ID',
    rules: [{ required: true, message: '请输入Access Key ID' }],
  },
  accessKeySecret: {
    label: 'Access Key Secret',
    type: 'password',
    placeholder: '请输入Access Key Secret',
    rules: [{ required: true, message: '请输入Access Key Secret' }],
  },
  secretAccessKey: {
    label: 'Secret Access Key',
    type: 'password',
    placeholder: '请输入Secret Access Key',
    rules: [{ required: true, message: '请输入Secret Access Key' }],
  },
  secretId: {
    label: 'Secret ID',
    type: 'text',
    placeholder: '请输入Secret ID',
    rules: [{ required: true, message: '请输入Secret ID' }],
  },
  secretKey: {
    label: 'Secret Key',
    type: 'password',
    placeholder: '请输入Secret Key',
    rules: [{ required: true, message: '请输入Secret Key' }],
  },
  ak: {
    label: 'AK (Access Key)',
    type: 'text',
    placeholder: '请输入AK',
    rules: [{ required: true, message: '请输入AK' }],
  },
  sk: {
    label: 'SK (Secret Key)',
    type: 'password',
    placeholder: '请输入SK',
    rules: [{ required: true, message: '请输入SK' }],
  },
  region: {
    label: '区域',
    type: 'text',
    placeholder: '如: cn-hangzhou, us-east-1',
    default: 'cn-hangzhou',
    tooltip: '云平台区域标识',
    rules: [{ required: true, message: '请输入区域' }],
  },

  // SNMP参数
  snmpCommunity: {
    label: 'SNMP Community',
    type: 'text',
    placeholder: '请输入Community字符串',
    default: 'public',
    tooltip: 'SNMP认证字符串',
    rules: [{ required: true, message: '请输入SNMP Community' }],
  },
  snmpVersion: {
    label: 'SNMP版本',
    type: 'select',
    options: [
      { label: 'v1', value: '1' },
      { label: 'v2c', value: '2c' },
      { label: 'v3', value: '3' },
    ],
    default: '2c',
    rules: [{ required: true, message: '请选择SNMP版本' }],
  },

  // 数据库参数
  sid: {
    label: 'SID',
    type: 'text',
    placeholder: '请输入Oracle SID',
    tooltip: 'Oracle数据库实例标识',
    rules: [{ required: true, message: '请输入SID' }],
  },
  database: {
    label: '数据库名',
    type: 'text',
    placeholder: '请输入数据库名',
    rules: [{ required: true, message: '请输入数据库名' }],
  },

  // Windows参数
  domain: {
    label: '域',
    type: 'text',
    placeholder: '请输入域名（可选）',
    tooltip: 'Windows域，如果不在域环境可留空',
  },

  // API参数
  url: {
    label: 'API URL',
    type: 'text',
    placeholder: '请输入完整的API地址',
    tooltip: 'REST API的完整URL',
    rules: [{ required: true, message: '请输入API URL' }],
  },
  method: {
    label: 'HTTP方法',
    type: 'select',
    options: [
      { label: 'GET', value: 'GET' },
      { label: 'POST', value: 'POST' },
    ],
    default: 'GET',
    rules: [{ required: true, message: '请选择HTTP方法' }],
  },
  headers: {
    label: 'HTTP Headers',
    type: 'text',
    placeholder: '{"Authorization": "Bearer token"}',
    tooltip: 'JSON格式的HTTP请求头',
  },
  protocol: {
    label: '协议',
    type: 'select',
    options: [
      { label: 'HTTPS', value: 'https' },
      { label: 'HTTP', value: 'http' },
      { label: 'SNMP', value: 'snmp' },
    ],
    default: 'https',
  },
  credentials: {
    label: '认证信息',
    type: 'text',
    placeholder: '请输入认证信息（JSON格式）',
    tooltip: '根据设备类型提供相应的认证信息',
  },
};

// 加载Provider Schema
const loadProviderSchema = async () => {
  if (!props.method?.id) return;
  
  schemaLoading.value = true;
  try {
    const res = await DiscoveryProviderAPI.getProviderSchema(props.method.id);
    if (res && res.data) {
      providerSchema.value = res.data;
      dynamicParameters.value = res.data.parameterSchema || [];
      initFormFromSchema();
    } else {
      // 如果获取schema失败，使用fallback方式
      console.warn('无法获取Provider Schema，使用fallback参数');
      initFormFromFallback();
    }
  } catch (error) {
    console.error('加载Provider Schema失败:', error);
    message.warning('加载参数配置失败，使用默认配置');
    initFormFromFallback();
  } finally {
    schemaLoading.value = false;
  }
};

// 从Schema初始化表单
const initFormFromSchema = () => {
  const params = props.initialParameters || {};
  
  // 清空现有表单状态
  Object.keys(formState).forEach(key => {
    delete formState[key];
  });
  
  // 根据Schema初始化表单
  dynamicParameters.value.forEach((param) => {
    formState[param.name] = params[param.name] ?? param.defaultValue ?? '';
  });
};

// Fallback初始化表单（原有逻辑）
const initFormFromFallback = () => {
  const params = props.initialParameters || {};
  const requiredParams = props.method.requiredParams || [];
  
  // 清空现有表单状态
  Object.keys(formState).forEach(key => {
    delete formState[key];
  });
  
  requiredParams.forEach((paramKey) => {
    const def = parameterDefinitions[paramKey];
    formState[paramKey] = params[paramKey] ?? def?.default ?? '';
  });
};

// 监听方法变化
watch(
  () => props.method,
  () => {
    loadProviderSchema();
  },
  { immediate: true },
);

// 切换密码可见性
const togglePasswordVisibility = (key: string) => {
  showPassword.value[key] = !showPassword.value[key];
};

// 测试连接
const testing = ref(false);
const handleTestConnection = async () => {
  try {
    await formRef.value?.validate();
    testing.value = true;

    // 调用后端API测试连接
    const res = await DiscoveryProviderAPI.testConnection({
      providerId: props.method.id,
      config: { ...formState }
    });

    if (res && res.data && res.data.success) {
      message.success(res.data.message || '连接测试成功！');
      handleSave();
    } else {
      message.error(res?.data?.message || '连接测试失败');
    }
  } catch (error) {
    console.error('测试连接失败:', error);
    message.error('连接测试失败，请检查参数配置');
  } finally {
    testing.value = false;
  }
};

// 保存配置
const handleSave = () => {
  emit('parametersConfigured', { ...formState });
};

// 直接保存（不测试）
const handleSaveWithoutTest = async () => {
  try {
    await formRef.value?.validate();
    handleSave();
    message.success('参数配置已保存');
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

// 获取动态参数定义（优先使用Schema中的定义）
const getParameterDefinition = (paramName: string) => {
  // 先找Schema中的定义
  const schemaParam = dynamicParameters.value.find(p => p.name === paramName);
  if (schemaParam) {
    return {
      label: schemaParam.label || paramName,
      type: schemaParam.type === 'password' ? 'password' : 
            schemaParam.type === 'number' ? 'number' :
            schemaParam.options && schemaParam.options.length > 0 ? 'select' : 'text',
      placeholder: schemaParam.placeholder || `请输入${schemaParam.label || paramName}`,
      options: schemaParam.options?.map(opt => ({ label: opt, value: opt })),
      default: schemaParam.defaultValue,
      tooltip: schemaParam.description,
      rules: schemaParam.required ? [{ required: true, message: `请输入${schemaParam.label || paramName}` }] : [],
    };
  }
  
  // 回退到硬编码定义
  return parameterDefinitions[paramName] || {
    label: paramName,
    type: 'text',
    placeholder: `请输入${paramName}`,
    rules: [{ required: true, message: `请输入${paramName}` }],
  };
};

// 获取当前要渲染的参数列表
const getCurrentParameters = () => {
  if (dynamicParameters.value.length > 0) {
    // 优先使用Schema中的参数定义
    return dynamicParameters.value.map(p => p.name);
  }
  // 回退到方法中定义的必需参数
  return props.method.requiredParams || [];
};

onMounted(() => {
  loadProviderSchema();
});
</script>

<template>
  <div class="discovery-parameter-config">
    <div class="config-header">
      <h3>配置发现参数 - {{ props.method.name }}</h3>
      <p>{{ props.method.description }}</p>
    </div>

    <Alert
      message="参数说明"
      description="请根据实际环境配置连接参数。建议先测试连接确保参数正确。"
      type="info"
      show-icon
      closable
      style="margin-bottom: 24px"
    />

    <Spin :spinning="schemaLoading" tip="加载参数配置...">
      <Card :bordered="false">
        <Form ref="formRef" :model="formState" layout="vertical">
          <Row :gutter="16">
            <Col
              v-for="paramKey in getCurrentParameters()"
              :key="paramKey"
              :xs="24"
              :sm="12"
              :md="12"
              :lg="8"
            >
              <Form.Item
                :label="getParameterDefinition(paramKey).label"
                :name="paramKey"
                :rules="getParameterDefinition(paramKey).rules"
              >
                <!-- 文本输入 -->
                <Input
                  v-if="getParameterDefinition(paramKey).type === 'text'"
                  v-model:value="formState[paramKey]"
                  :placeholder="getParameterDefinition(paramKey).placeholder"
                >
                  <template v-if="getParameterDefinition(paramKey).tooltip" #suffix>
                    <Tooltip :title="getParameterDefinition(paramKey).tooltip">
                      <InfoCircleOutlined style="color: rgba(0, 0, 0, 0.45)" />
                    </Tooltip>
                  </template>
                </Input>

                <!-- 密码输入 -->
                <Input
                  v-else-if="getParameterDefinition(paramKey).type === 'password'"
                  v-model:value="formState[paramKey]"
                  :type="showPassword[paramKey] ? 'text' : 'password'"
                  :placeholder="getParameterDefinition(paramKey).placeholder"
                >
                  <template #suffix>
                    <span @click="togglePasswordVisibility(paramKey)" style="cursor: pointer">
                      <EyeOutlined v-if="showPassword[paramKey]" />
                      <EyeInvisibleOutlined v-else />
                    </span>
                  </template>
                </Input>

                <!-- 数字输入 -->
                <InputNumber
                  v-else-if="getParameterDefinition(paramKey).type === 'number'"
                  v-model:value="formState[paramKey]"
                  :placeholder="getParameterDefinition(paramKey).placeholder"
                  style="width: 100%"
                />

                <!-- 下拉选择 -->
                <Select
                  v-else-if="getParameterDefinition(paramKey).type === 'select'"
                  v-model:value="formState[paramKey]"
                  :options="getParameterDefinition(paramKey).options"
                  :placeholder="`请选择${getParameterDefinition(paramKey).label}`"
                />
            </Form.Item>
          </Col>
        </Row>

        <!-- 高级选项 -->
        <Card title="高级选项" size="small" style="margin-top: 16px">
          <Row :gutter="16">
            <Col :span="12">
              <Form.Item label="超时时间(秒)" name="timeout">
                <InputNumber
                  v-model:value="formState.timeout"
                  :min="5"
                  :max="300"
                  placeholder="默认30秒"
                  style="width: 100%"
                />
              </Form.Item>
            </Col>
            <Col :span="12">
              <Form.Item label="SSL验证">
                <Checkbox v-model:checked="formState.verifySsl">启用SSL证书验证</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <!-- 按钮组 -->
        <div style="margin-top: 24px; text-align: center">
          <Space size="large">
            <Button type="primary" :loading="testing" @click="handleTestConnection">
              <template #icon>
                <CheckOutlined />
              </template>
              测试连接并保存
            </Button>
            <Button @click="handleSaveWithoutTest">跳过测试，直接保存</Button>
          </Space>
        </div>
      </Form>
    </Card>
    </Spin>
  </div>
</template>

<style scoped lang="less">
.discovery-parameter-config {
  .config-header {
    margin-bottom: 16px;
    text-align: center;

    h3 {
      margin-bottom: 4px;
      font-size: 16px;
      font-weight: 500;
    }

    p {
      color: #666;
      font-size: 13px;
    }
  }

  :deep(.ant-card) {
    box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
  }

  :deep(.ant-card-head) {
    min-height: 36px;
    padding: 8px 16px;
    font-size: 14px;
    background-color: #f7f9fc;
  }

  :deep(.ant-card-body) {
    padding: 16px;
  }

  :deep(.ant-alert) {
    margin-bottom: 12px;
  }

  :deep(.ant-form-item) {
    margin-bottom: 12px;
  }
}
</style>
