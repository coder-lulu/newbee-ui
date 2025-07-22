<script lang="ts">
import type { ChoiceItem } from '#/api/cmdb/ci_types/model';

import { computed, defineComponent, ref, watch } from 'vue';

import {
  DatePicker,
  Input,
  InputNumber,
  InputPassword,
  Select,
  SelectOption,
  Switch,
  TimePicker,
} from 'ant-design-vue';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default defineComponent({
  name: 'DynamicFormField',
  components: {
    DatePicker,
    Input,
    InputNumber,
    InputPassword,
    Select,
    SelectOption,
    Switch,
    TextArea,
    TimePicker,
  },
  props: {
    attribute: {
      type: Object as () => {
        alias: string;
        choices?: ChoiceItem[];
        default?: {
          default?: string;
        };
        id: number;
        isChoice: boolean;
        isList: boolean;
        isRequired: boolean;
        name: string;
        validatorRules?: Array<{
          customValidator?: string;
          enabled: boolean;
          message: string;
          params?: Array<{ key: string; value: any }>;
          type: string;
        }>;
        valueType: string;
      },
      required: true,
    },
    modelValue: {
      type: [String, Number, Boolean, Array, Object] as any,
      default: undefined,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    // 内部值状态
    const internalValue = ref(props.modelValue);

    // 监听外部值变化
    watch(
      () => props.modelValue,
      (newVal) => {
        internalValue.value = newVal;
      },
      { immediate: true },
    );

    // 监听内部值变化，触发emit
    watch(
      internalValue,
      (newVal) => {
        emit('update:modelValue', newVal);
      },
      { deep: true },
    );

    // 计算选择器选项
    const selectOptions = computed(() => {
      if (!props.attribute.isChoice || !props.attribute.choices) {
        return [];
      }

      return props.attribute.choices.map((choice) => ({
        label: choice.meta?.label || choice.value,
        style: choice.meta?.style,
        value: choice.value,
      }));
    });

    // 组件类型计算
    const componentType = computed(() => {
      const { isChoice, valueType } = props.attribute;

      if (isChoice) return 'select';

      switch (valueType) {
        case 'boolean': {
          return 'switch';
        }
        case 'date': {
          return 'date';
        }
        case 'datetime': {
          return 'datetime';
        }
        case 'float':
        case 'int': {
          return 'number';
        }
        case 'longtext': {
          return 'textarea';
        }
        case 'password': {
          return 'password';
        }
        case 'time': {
          return 'time';
        }
        default: {
          return 'text';
        }
      }
    });

    // 处理日期时间值
    const handleDateTimeChange = (val: any) => {
      internalValue.value = val ? val.format('YYYY-MM-DD HH:mm:ss') : '';
    };

    const handleDateChange = (val: any) => {
      internalValue.value = val ? val.format('YYYY-MM-DD') : '';
    };

    const handleTimeChange = (val: any) => {
      internalValue.value = val ? val.format('HH:mm:ss') : '';
    };

    // 获取日期时间值
    const getDateTimeValue = computed(() => {
      if (!internalValue.value) return undefined;
      try {
        return dayjs(internalValue.value);
      } catch {
        return undefined;
      }
    });

    const getDateValue = computed(() => {
      if (!internalValue.value) return undefined;
      try {
        return dayjs(internalValue.value);
      } catch {
        return undefined;
      }
    });

    const getTimeValue = computed(() => {
      if (!internalValue.value) return undefined;
      try {
        return dayjs(internalValue.value, 'HH:mm:ss');
      } catch {
        return undefined;
      }
    });

    // 生成样式
    const getChoiceStyle = (style?: any) => {
      if (!style) return {};
      return {
        backgroundColor: style.bgColor || undefined,
        color: style.fontColor || undefined,
        fontStyle: style.fontStyle || undefined,
        fontWeight: style.fontWeight || undefined,
        textDecoration: style.textDecoration || undefined,
      };
    };

    return {
      componentType,
      getChoiceStyle,
      getDateTimeValue,
      getDateValue,
      getTimeValue,
      handleDateChange,
      handleDateTimeChange,
      handleTimeChange,
      internalValue,
      selectOptions,
    };
  },
});
</script>

<template>
  <div class="dynamic-form-field">
    <!-- 文本输入框 -->
    <Input
      v-if="componentType === 'text'"
      :value="internalValue"
      :placeholder="`请输入${attribute.alias}`"
      :disabled="disabled"
      @update:value="(val) => (internalValue = val)"
    />

    <!-- 密码输入框 -->
    <InputPassword
      v-else-if="componentType === 'password'"
      :value="internalValue"
      :placeholder="`请输入${attribute.alias}`"
      :disabled="disabled"
      @update:value="(val) => (internalValue = val)"
    />

    <!-- 长文本输入框 -->
    <TextArea
      v-else-if="componentType === 'textarea'"
      :value="internalValue"
      :placeholder="`请输入${attribute.alias}`"
      :rows="4"
      :disabled="disabled"
      @update:value="(val) => (internalValue = val)"
    />

    <!-- 数字输入框 -->
    <InputNumber
      v-else-if="componentType === 'number'"
      :value="internalValue"
      :placeholder="`请输入${attribute.alias}`"
      style="width: 100%"
      :precision="attribute.valueType === 'float' ? 2 : 0"
      :disabled="disabled"
      @update:value="(val) => (internalValue = val)"
    />

    <!-- 布尔开关 -->
    <Switch
      v-else-if="componentType === 'switch'"
      :checked="internalValue"
      :disabled="disabled"
      @update:checked="(val) => (internalValue = val)"
    />

    <!-- 日期选择器 -->
    <DatePicker
      v-else-if="componentType === 'date'"
      :value="getDateValue"
      :placeholder="`请选择${attribute.alias}`"
      style="width: 100%"
      format="YYYY-MM-DD"
      :disabled="disabled"
      @update:value="handleDateChange"
    />

    <!-- 日期时间选择器 -->
    <DatePicker
      v-else-if="componentType === 'datetime'"
      :value="getDateTimeValue"
      show-time
      :placeholder="`请选择${attribute.alias}`"
      style="width: 100%"
      format="YYYY-MM-DD HH:mm:ss"
      :disabled="disabled"
      @update:value="handleDateTimeChange"
    />

    <!-- 时间选择器 -->
    <TimePicker
      v-else-if="componentType === 'time'"
      :value="getTimeValue"
      :placeholder="`请选择${attribute.alias}`"
      style="width: 100%"
      format="HH:mm:ss"
      :disabled="disabled"
      @update:value="handleTimeChange"
    />

    <!-- 选择器 -->
    <Select
      v-else-if="componentType === 'select'"
      :value="internalValue"
      :placeholder="`请选择${attribute.alias}`"
      style="width: 100%"
      :mode="attribute.isList ? 'multiple' : undefined"
      :show-search="true"
      :filter-option="true"
      :disabled="disabled"
      @update:value="(val) => (internalValue = val)"
    >
      <SelectOption
        v-for="option in selectOptions"
        :key="option.value"
        :value="option.value"
        :style="getChoiceStyle(option.style)"
      >
        {{ option.label }}
      </SelectOption>
    </Select>
  </div>
</template>

<style scoped>
.dynamic-form-field {
  width: 100%;
}
</style>
