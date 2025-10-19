<script setup lang="ts">
import type {
  ValidationResult,
  ValidationRule,
  ValidationRuleConfig,
} from './types';

import { ref, watch } from 'vue';

import { Alert, Spin } from 'ant-design-vue';

import { VALIDATION_RULE_CONFIGS } from './types';
import ValidationRuleManager from './validation-rule-manager.vue';
import { validator } from './validator';

interface Props {
  rules?: ValidationRule[];
  value?: any;
  showRuleManager?: boolean;
  autoValidate?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  rules: () => [],
  showRuleManager: true,
  autoValidate: true,
});

const emit = defineEmits<{
  'update:rules': [rules: ValidationRule[]];
  'validation-result': [result: ValidationResult];
}>();

const validationResult = ref<ValidationResult>({ valid: true });
const validating = ref(false);

// 类型转换工具
function convertRuleParams(
  rule: ValidationRule,
  config: ValidationRuleConfig,
): ValidationRule {
  if (!rule.params || !config.params) return rule;
  const newParams = rule.params.map((param) => {
    const paramConfig = config.params!.find((p) => p.key === param.key);
    if (!paramConfig) return param;
    let value: any = param.value;
    switch (paramConfig.type) {
      case 'array': {
        value = Array.isArray(value)
          ? value
          : typeof value === 'string'
            ? value.split(',').map((v: string) => v.trim())
            : [];
        break;
      }
      case 'boolean': {
        value = value === 'true' || value === true;
        break;
      }
      case 'number': {
        value = value === '' ? undefined : Number(value);
        break;
      }
      case 'string':
      default: {
        // 保持字符串
        break;
      }
    }
    return { ...param, value };
  });
  return { ...rule, params: newParams };
}

function convertAllRules(rules: ValidationRule[]): ValidationRule[] {
  return rules.map((rule) => {
    const config = VALIDATION_RULE_CONFIGS.find((c) => c.type === rule.type);
    if (!config) return rule;
    return convertRuleParams(rule, config);
  });
}

// 执行验证
const validate = async (
  value: any = props.value,
  rules: ValidationRule[] = props.rules,
) => {
  if (rules.length === 0) {
    const result = { valid: true };
    validationResult.value = result;
    emit('validation-result', result);
    return result;
  }

  validating.value = true;
  try {
    // 类型转换
    const convertedRules = convertAllRules(rules);
    const result = await validator.validate(value, convertedRules);
    validationResult.value = result;
    emit('validation-result', result);
    return result;
  } finally {
    validating.value = false;
  }
};

// 监听值变化，自动验证
watch(
  () => [props.value, props.rules],
  () => {
    if (props.autoValidate) {
      validate();
    }
  },
  { deep: true },
);

// 规则变化处理
const handleRulesChange = (newRules: ValidationRule[]) => {
  emit('update:rules', newRules);
  if (props.autoValidate) {
    validate(props.value, newRules);
  }
};

// 暴露验证方法
defineExpose({
  validate,
});
</script>

<template>
  <div class="validation-engine">
    <!-- 验证结果显示 -->
    <div v-if="validating" class="validation-loading">
      <Spin size="small" />
      <span>验证中...</span>
    </div>

    <div
      v-else-if="!validationResult.valid && validationResult.errors?.length"
      class="validation-errors"
    >
      <Alert
        v-for="(error, index) in validationResult.errors"
        :key="index"
        :message="error"
        type="error"
        size="small"
        show-icon
        style="margin-bottom: 8px"
      />
    </div>

    <!-- 规则管理器 -->
    <ValidationRuleManager
      v-if="showRuleManager"
      :rules="rules"
      @change="handleRulesChange"
    />
  </div>
</template>

<style scoped>
.validation-engine {
  width: 100%;
}

.validation-loading {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 0;
  color: #666;
}

.validation-errors {
  margin-bottom: 16px;
}
</style>
