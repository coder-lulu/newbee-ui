<script setup lang="ts">
import type { Rule } from 'ant-design-vue/es/form';

// 验证规则参数接口
interface ValidatorParam {
  key: string;
  value: string;
}

// 后端验证规则接口
interface ValidatorRule {
  type: string;
  params?: null | ValidatorParam[];
  message?: string;
  enabled: boolean;
  customValidator?: null | string;
}

// 属性接口（更灵活的定义）
interface AttributeItem {
  id: number;
  name: string;
  alias: string;
  valueType: string;
  isChoice: boolean;
  isList: boolean;
  validatorRules?: null | ValidatorRule[];
  [key: string]: any; // 允许其他属性
}

// 项目接口（更灵活的定义）
interface FormItem {
  attribute?: AttributeItem;
  isRequired?: boolean;
  isEdit?: boolean;
  isUnique?: boolean;
  [key: string]: any; // 允许其他属性
}

// Props
interface Props {
  item: FormItem;
  isEditMode?: boolean;
}

const props = defineProps<Props>();

// 获取参数值的辅助函数
const getParamValue = (
  params: null | undefined | ValidatorParam[],
  key: string,
): string | undefined => {
  if (!params) return undefined;
  const param = params.find((p) => p.key === key);
  return param?.value;
};

// 手机号验证函数
const validateMobile = (value: string): boolean => {
  if (value === null || value === undefined) return true; // 空值由required规则处理
  if (value === '') return true; // 空字符串也由required规则处理
  const pattern = /^1[3-9]\d{9}$/;
  return pattern.test(value);
};

// 字母数字下划线验证函数
const validateAlphaNumDash = (value: string): boolean => {
  if (value === null || value === undefined) return true; // 空值由required规则处理
  if (value === '') return true; // 空字符串也由required规则处理
  const pattern = /^\w+$/;
  return pattern.test(value);
};

// 邮箱验证函数
const validateEmail = (value: string): boolean => {
  if (value === null || value === undefined) return true;
  if (value === '') return true; // 空字符串也由required规则处理
  const pattern = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
  return pattern.test(value);
};

// IP地址验证函数
const validateIP = (value: string): boolean => {
  if (value === null || value === undefined) return true;
  if (value === '') return true; // 空字符串也由required规则处理
  const pattern =
    /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$/;
  return pattern.test(value);
};

// URL验证函数
const validateURL = (value: string): boolean => {
  if (value === null || value === undefined) return true;
  if (value === '') return true; // 空字符串也由required规则处理
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

// 数字范围验证函数
const validateNumericRange = (
  value: any,
  min?: number,
  max?: number,
): boolean => {
  if (value === null || value === undefined || value === '') return true;
  const numValue = Number(value);
  if (Number.isNaN(numValue)) return false;

  if (min !== undefined && numValue < min) return false;
  if (max !== undefined && numValue > max) return false;
  return true;
};

// 字符串长度验证函数
const validateStringLength = (
  value: string,
  minLength?: number,
  maxLength?: number,
): boolean => {
  // 如果值为null或undefined，由required规则处理，这里返回true
  if (value === null || value === undefined) return true;

  // 对于空字符串和非空字符串都要检查长度
  const length = value.length;

  if (minLength !== undefined && length < minLength) return false;
  if (maxLength !== undefined && length > maxLength) return false;
  return true;
};

// 正则表达式验证函数
const validatePattern = (value: string, pattern: string): boolean => {
  if (value === null || value === undefined) return true; // 空值由required规则处理
  if (value === '') return true; // 空字符串也由required规则处理
  try {
    const regex = new RegExp(pattern);
    return regex.test(value);
  } catch {
    return false;
  }
};

// 转换后端验证规则为Ant Design Vue规则
const convertValidatorRule = (rule: ValidatorRule): null | Rule => {
  if (!rule.enabled) return null;

  const baseRule: Rule = {
    message: rule.message || '验证失败',
  };

  switch (rule.type) {
    case 'alphanumdash': {
      return {
        ...baseRule,
        validator: (_rule, value) => {
          if (!validateAlphaNumDash(value)) {
            return Promise.reject(
              new Error(
                rule.message ||
                  `${props.item.attribute?.alias}只能包含字母、数字和下划线`,
              ),
            );
          }
          return Promise.resolve();
        },
      };
    }

    case 'email': {
      return {
        ...baseRule,
        validator: (_rule, value) => {
          if (!validateEmail(value)) {
            return Promise.reject(
              new Error(
                rule.message ||
                  `${props.item.attribute?.alias}必须是有效的邮箱地址`,
              ),
            );
          }
          return Promise.resolve();
        },
      };
    }

    case 'ip':
    case 'ipv4': {
      return {
        ...baseRule,
        validator: (_rule, value) => {
          if (!validateIP(value)) {
            return Promise.reject(
              new Error(
                rule.message ||
                  `${props.item.attribute?.alias}必须是有效的IP地址`,
              ),
            );
          }
          return Promise.resolve();
        },
      };
    }

    case 'len': {
      const length =
        getParamValue(rule.params, 'value') ||
        getParamValue(rule.params, 'length');
      if (!length) return null;

      return {
        ...baseRule,
        validator: (_rule, value) => {
          const expectedLength = Number.parseInt(length, 10);
          if (value && value.length !== expectedLength) {
            return Promise.reject(
              new Error(
                rule.message ||
                  `${props.item.attribute?.alias}长度必须为${expectedLength}个字符`,
              ),
            );
          }
          return Promise.resolve();
        },
      };
    }

    case 'max': {
      const maxValue =
        getParamValue(rule.params, 'value') ||
        getParamValue(rule.params, 'max');
      if (!maxValue) return null;

      return {
        ...baseRule,
        validator: (_rule, value) => {
          const max = Number.parseFloat(maxValue);
          if (!validateNumericRange(value, undefined, max)) {
            return Promise.reject(
              new Error(
                rule.message || `${props.item.attribute?.alias}不能大于${max}`,
              ),
            );
          }
          return Promise.resolve();
        },
      };
    }

    case 'min': {
      const minValue =
        getParamValue(rule.params, 'value') ||
        getParamValue(rule.params, 'min');
      if (!minValue) return null;

      return {
        ...baseRule,
        validator: (_rule, value) => {
          const min = Number.parseFloat(minValue);
          if (!validateNumericRange(value, min, undefined)) {
            return Promise.reject(
              new Error(
                rule.message || `${props.item.attribute?.alias}不能小于${min}`,
              ),
            );
          }
          return Promise.resolve();
        },
      };
    }

    case 'mobile': {
      return {
        ...baseRule,
        validator: (_rule, value) => {
          if (!validateMobile(value)) {
            return Promise.reject(
              new Error(
                rule.message ||
                  `${props.item.attribute?.alias}必须是有效的手机号码`,
              ),
            );
          }
          return Promise.resolve();
        },
      };
    }

    case 'number':
    case 'numeric': {
      const min = getParamValue(rule.params, 'min');
      const max = getParamValue(rule.params, 'max');

      return {
        ...baseRule,
        validator: (_rule, value) => {
          const minValue = min ? Number.parseFloat(min) : undefined;
          const maxValue = max ? Number.parseFloat(max) : undefined;

          if (!validateNumericRange(value, minValue, maxValue)) {
            let message = rule.message;
            if (!message) {
              if (minValue !== undefined && maxValue !== undefined) {
                message = `${props.item.attribute?.alias}必须在${minValue}-${maxValue}之间`;
              } else if (minValue !== undefined) {
                message = `${props.item.attribute?.alias}不能小于${minValue}`;
              } else if (maxValue !== undefined) {
                message = `${props.item.attribute?.alias}不能大于${maxValue}`;
              }
            }
            return Promise.reject(new Error(message));
          }
          return Promise.resolve();
        },
      };
    }

    case 'pattern': {
      const pattern = getParamValue(rule.params, 'pattern');
      if (!pattern) return null;

      return {
        ...baseRule,
        validator: (_rule, value) => {
          if (!validatePattern(value, pattern)) {
            return Promise.reject(
              new Error(
                rule.message || `${props.item.attribute?.alias}格式不正确`,
              ),
            );
          }
          return Promise.resolve();
        },
      };
    }

    case 'required': {
      return {
        required: true,
        message: rule.message || `${props.item.attribute?.alias}不能为空`,
      };
    }

    case 'string': {
      const minLength = getParamValue(rule.params, 'minLength');
      const maxLength = getParamValue(rule.params, 'maxLength');

      return {
        ...baseRule,
        validator: (_rule, value) => {
          const min = minLength ? Number.parseInt(minLength, 10) : undefined;
          const max = maxLength ? Number.parseInt(maxLength, 10) : undefined;

          if (!validateStringLength(value, min, max)) {
            let message = rule.message;
            if (!message) {
              if (min !== undefined && max !== undefined) {
                message = `${props.item.attribute?.alias}长度必须在${min}-${max}个字符之间`;
              } else if (min !== undefined) {
                message = `${props.item.attribute?.alias}长度不能少于${min}个字符`;
              } else if (max !== undefined) {
                message = `${props.item.attribute?.alias}长度不能超过${max}个字符`;
              }
            }
            return Promise.reject(new Error(message));
          }
          return Promise.resolve();
        },
      };
    }

    case 'url': {
      return {
        ...baseRule,
        validator: (_rule, value) => {
          if (!validateURL(value)) {
            return Promise.reject(
              new Error(
                rule.message ||
                  `${props.item.attribute?.alias}必须是有效的URL地址`,
              ),
            );
          }
          return Promise.resolve();
        },
      };
    }

    default: {
      console.warn(`未知的验证规则类型: ${rule.type}`);
      return null;
    }
  }
};

// 生成表单验证规则
const generateFormRules = (): Rule[] => {
  const rules: Rule[] = [];

  // 1. 处理isRequired规则（前端配置的必填）
  if (props.item.isRequired) {
    rules.push({
      required: true,
      message: `${props.item.attribute?.alias}不能为空`,
    });
  }

  // 2. 处理attribute.validatorRules（后端返回的所有验证规则）
  if (props.item.attribute?.validatorRules) {
    props.item.attribute.validatorRules.forEach((rule) => {
      // 如果后端返回的required规则与前端isRequired重复，优先使用后端的消息
      if (rule.type === 'required' && props.item.isRequired) {
        // 更新已添加的required规则的消息
        const existingRequiredRule = rules.find((r) => r.required === true);
        if (existingRequiredRule && rule.message) {
          existingRequiredRule.message = rule.message;
        }
        return;
      }

      const convertedRule = convertValidatorRule(rule);
      if (convertedRule) {
        rules.push(convertedRule);
      }
    });
  }

  // 3. 根据valueType添加额外验证
  switch (props.item.attribute?.valueType) {
    case 'float': {
      rules.push({
        validator: (_rule, value) => {
          if (value !== null && value !== undefined && value !== '') {
            const numValue = Number(value);
            if (Number.isNaN(numValue)) {
              return Promise.reject(
                new Error(`${props.item.attribute?.alias}必须是有效的数字`),
              );
            }
          }
          return Promise.resolve();
        },
      });
      break;
    }
    case 'int': {
      rules.push({
        validator: (_rule, value) => {
          if (value !== null && value !== undefined && value !== '') {
            const numValue = Number(value);
            if (!Number.isInteger(numValue)) {
              return Promise.reject(
                new Error(`${props.item.attribute?.alias}必须是整数`),
              );
            }
          }
          return Promise.resolve();
        },
      });
      break;
    }
    case 'json': {
      rules.push({
        validator: (_rule, value) => {
          if (value) {
            try {
              JSON.parse(value);
            } catch {
              return Promise.reject(
                new Error(`${props.item.attribute?.alias}必须是有效的JSON格式`),
              );
            }
          }
          return Promise.resolve();
        },
      });
      break;
    }
  }

  console.log(`字段 ${props.item.attribute?.name} 生成的验证规则:`, rules);
  return rules;
};

// 导出生成的规则供外部使用
defineExpose({
  generateFormRules,
});
</script>

<script lang="ts">
export default {
  name: 'ValidationRuleGenerator',
};
</script>

<template>
  <!-- 这是一个纯逻辑组件，无需渲染内容 -->
  <div style="display: none"></div>
</template>
