<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue';
import { Button, message, Modal, Steps } from 'ant-design-vue';
import { RightOutlined, SaveOutlined } from '@ant-design/icons-vue';
import { createDiscoveryPool } from '#/api/io/discovery-pool';

import AgentSelector from './AgentSelector.vue';
import AttributeMappingConfig from './AttributeMappingConfig.vue';
import DiscoveryMethodSelector from './DiscoveryMethodSelector.vue';
import DiscoveryParameterConfig from './DiscoveryParameterConfig.vue';

export interface DiscoveryMethod {
  id: string;
  name: string;
  icon: any;
  description: string;
  category: 'cloud' | 'network' | 'system' | 'application' | 'database';
  requiredParams: string[];
}

interface Props {
  typeId: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  saved: [];
}>();

const visible = ref(false);
const currentStep = ref(0);

const stepsData = [
  { title: '选择发现方式', description: '选择数据源类型' },
  { title: '配置发现参数', description: '填写连接信息' },
  { title: '选择执行代理', description: '选择OPS代理' },
  { title: '配置属性映射', description: '字段映射规则' },
  { title: '完成配置', description: '保存并执行' },
];

const discoveryForm = reactive({
  method: null as DiscoveryMethod | null,
  parameters: {} as Record<string, any>,
  agentId: null as string | null,
  agentInfo: null as any,
  mappings: [] as any[],
  autoImport: true,
  poolName: '',
  poolDescription: '',
});

const stepValidation = reactive({
  step0: false,
  step1: false,
  step2: false,
  step3: false,
});

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0:
      return stepValidation.step0;
    case 1:
      return stepValidation.step1;
    case 2:
      return stepValidation.step2;
    case 3:
      return stepValidation.step3;
    default:
      return false;
  }
});

const handleMethodSelected = (method: DiscoveryMethod) => {
  discoveryForm.method = method;
  stepValidation.step0 = true;
  discoveryForm.poolName = `${method.name}_发现池_${Date.now()}`;
};

const handleParametersConfigured = (params: Record<string, any>) => {
  discoveryForm.parameters = params;
  stepValidation.step1 = Object.keys(params).length > 0;
};

const handleAgentSelected = (agentId: string, agentInfo: any) => {
  discoveryForm.agentId = agentId;
  discoveryForm.agentInfo = agentInfo;
  stepValidation.step2 = !!agentId;
};

const handleMappingsConfigured = (mappings: any[], autoImport: boolean) => {
  discoveryForm.mappings = mappings;
  discoveryForm.autoImport = autoImport;
  stepValidation.step3 = mappings.length > 0;
};

const handleNext = () => {
  if (currentStep.value < stepsData.length - 1) {
    currentStep.value++;
  }
};

const handlePrev = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const handleSave = async () => {
  try {
    const discoveryPoolConfig = {
      name: discoveryForm.poolName,
      description: discoveryForm.poolDescription || `${discoveryForm.method?.name}自动发现`,
      discovery_type: discoveryForm.method?.category || 'api',
      pool_status: 'active',
      discovery_config: JSON.stringify({
        provider_id: discoveryForm.method?.id,
        config: discoveryForm.parameters,
        agent_id: discoveryForm.agentId,
        agent_info: discoveryForm.agentInfo,
      }),
      field_mapping: JSON.stringify(discoveryForm.mappings),
      batch_size: 100,
      concurrent_limit: 5,
      max_retry: 3,
      retry_interval: 60,
      metadata: JSON.stringify({
        type_id: props.typeId,
        auto_import: discoveryForm.autoImport,
        created_from: 'ui',
      }),
      status: 1, // 1: normal
    };

    console.log('保存发现池配置:', discoveryPoolConfig);
    
    await createDiscoveryPool(discoveryPoolConfig);
    message.success('发现池配置保存成功！');

    visible.value = false;
    resetForm();
    emit('saved');
  } catch (error) {
    console.error('保存失败:', error);
    message.error('保存失败,请重试');
  }
};

const resetForm = () => {
  discoveryForm.method = null;
  discoveryForm.parameters = {};
  discoveryForm.agentId = null;
  discoveryForm.agentInfo = null;
  discoveryForm.mappings = [];
  discoveryForm.autoImport = true;
  discoveryForm.poolName = '';
  discoveryForm.poolDescription = '';

  stepValidation.step0 = false;
  stepValidation.step1 = false;
  stepValidation.step2 = false;
  stepValidation.step3 = false;

  currentStep.value = 0;
};

const open = () => {
  visible.value = true;
};

const close = () => {
  visible.value = false;
  resetForm();
};

defineExpose({
  open,
  close,
});
</script>

<template>
  <Modal
    v-model:open="visible"
    title="新建发现配置"
    width="900px"
    :footer="null"
    :destroy-on-close="true"
    @cancel="close"
  >
    <div class="discovery-wizard-modal">
      <Steps :current="currentStep" size="small" style="margin-bottom: 24px">
        <Steps.Step
          v-for="(step, index) in stepsData"
          :key="index"
          :title="step.title"
          :description="step.description"
        />
      </Steps>

      <div class="wizard-content">
        <div v-show="currentStep === 0" class="step-content">
          <DiscoveryMethodSelector
            :selected-method="discoveryForm.method"
            @method-selected="handleMethodSelected"
          />
        </div>

        <div v-show="currentStep === 1" class="step-content">
          <DiscoveryParameterConfig
            v-if="discoveryForm.method"
            :method="discoveryForm.method"
            :initial-parameters="discoveryForm.parameters"
            @parameters-configured="handleParametersConfigured"
          />
        </div>

        <div v-show="currentStep === 2" class="step-content">
          <AgentSelector
            :selected-agent-id="discoveryForm.agentId"
            :method="discoveryForm.method"
            @agent-selected="handleAgentSelected"
          />
        </div>

        <div v-show="currentStep === 3" class="step-content">
          <AttributeMappingConfig
            v-if="discoveryForm.method"
            :type-id="props.typeId"
            :method="discoveryForm.method"
            :initial-mappings="discoveryForm.mappings"
            :initial-auto-import="discoveryForm.autoImport"
            @mappings-configured="handleMappingsConfigured"
          />
        </div>

        <div v-show="currentStep === 4" class="step-content">
          <div class="summary-section">
            <h4>配置摘要</h4>
            <div class="summary-item">
              <span class="label">发现方式:</span>
              <span class="value">{{ discoveryForm.method?.name }}</span>
            </div>
            <div class="summary-item">
              <span class="label">执行代理:</span>
              <span class="value">
                {{ discoveryForm.agentInfo?.name || discoveryForm.agentId }}
              </span>
            </div>
            <div class="summary-item">
              <span class="label">属性映射:</span>
              <span class="value">{{ discoveryForm.mappings.length }} 个字段</span>
            </div>
            <div class="summary-item">
              <span class="label">自动入库:</span>
              <span class="value">
                {{ discoveryForm.autoImport ? '是' : '否(仅入发现池)' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="wizard-footer">
        <Button v-if="currentStep > 0" @click="handlePrev">上一步</Button>
        <Button
          v-if="currentStep < stepsData.length - 1"
          type="primary"
          :disabled="!canProceed"
          @click="handleNext"
        >
          下一步
          <template #icon><RightOutlined /></template>
        </Button>
        <Button
          v-if="currentStep === stepsData.length - 1"
          type="primary"
          @click="handleSave"
        >
          <template #icon><SaveOutlined /></template>
          保存并创建
        </Button>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="less">
.discovery-wizard-modal {
  .wizard-content {
    min-height: 400px;
    max-height: 500px;
    overflow-y: auto;
    padding: 16px 0;

    .step-content {
      padding: 0;
    }
  }

  .wizard-footer {
    display: flex;
    justify-content: center;
    gap: 12px;
    padding-top: 16px;
    margin-top: 16px;
    border-top: 1px solid #f0f0f0;
  }

  .summary-section {
    h4 {
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 500;
      text-align: center;
    }

    .summary-item {
      display: flex;
      align-items: flex-start;
      padding: 12px;
      margin-bottom: 12px;
      background: #fafafa;
      border-radius: 4px;

      .label {
        min-width: 100px;
        font-weight: 500;
        color: #666;
      }

      .value {
        flex: 1;
        color: #333;
      }
    }
  }
}
</style>
