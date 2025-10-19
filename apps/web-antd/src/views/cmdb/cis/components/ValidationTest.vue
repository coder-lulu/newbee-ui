<script setup lang="ts">
import { reactive, ref } from 'vue';

import { Button, Form, message } from 'ant-design-vue';

import DynamicFormField from './DynamicFormField.vue';
import ValidationRuleGenerator from './ValidationRuleGenerator.vue';

// 模拟测试数据
const testItems = [
  {
    attribute: {
      id: 1,
      name: 'hostname',
      alias: '主机名',
      valueType: 'text',
      isChoice: false,
      isList: false,
      validatorRules: [
        {
          type: 'required',
          params: null,
          message: '请填写主机名',
          enabled: true,
          customValidator: null,
        },
        {
          type: 'string',
          params: [
            { key: 'minLength', value: '3' },
            { key: 'maxLength', value: '20' },
          ],
          message: '主机名长度必须在3-20个字符之间',
          enabled: true,
          customValidator: null,
        },
        {
          type: 'alphanumdash',
          params: null,
          message: '主机名只能包含字母、数字和下划线',
          enabled: true,
          customValidator: null,
        },
      ],
    },
    isRequired: true,
    isEdit: true,
  },
  {
    attribute: {
      id: 2,
      name: 'email',
      alias: '邮箱地址',
      valueType: 'text',
      isChoice: false,
      isList: false,
      validatorRules: [
        {
          type: 'email',
          params: null,
          message: '请输入有效的邮箱地址',
          enabled: true,
          customValidator: null,
        },
      ],
    },
    isRequired: false,
    isEdit: true,
  },
  {
    attribute: {
      id: 3,
      name: 'port',
      alias: '端口号',
      valueType: 'int',
      isChoice: false,
      isList: false,
      validatorRules: [
        {
          type: 'numeric',
          params: [
            { key: 'min', value: '1' },
            { key: 'max', value: '65535' },
          ],
          message: '端口号必须在1-65535之间',
          enabled: true,
          customValidator: null,
        },
      ],
    },
    isRequired: true,
    isEdit: true,
  },
];

const formRef = ref();
const formData = reactive<Record<string, any>>({
  hostname: '',
  email: '',
  port: '',
});

// 验证器组件实例引用
const validatorRefs = ref<Record<string, any>>({});

// 动态生成表单验证规则
const getFormRules = () => {
  const rules: Record<string, any[]> = {};

  testItems.forEach((item) => {
    const validatorRef = validatorRefs.value[item.attribute.name];
    if (validatorRef && typeof validatorRef.generateFormRules === 'function') {
      const generatedRules = validatorRef.generateFormRules();
      if (generatedRules.length > 0) {
        rules[item.attribute.name] = generatedRules;
      }
    }
  });

  console.log('生成的验证规则:', rules);
  return rules;
};

// 提交表单测试
const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    message.success(`验证通过！表单数据: ${JSON.stringify(formData)}`);
  } catch (error) {
    console.error('验证失败:', error);
    message.error('表单验证失败');
  }
};

// 重置表单
const handleReset = () => {
  formRef.value.resetFields();
  Object.keys(formData).forEach((key) => {
    formData[key] = '';
  });
};
</script>

<script lang="ts">
export default {
  name: 'ValidationTest',
};
</script>

<template>
  <div class="validation-test">
    <h2>动态验证器测试</h2>

    <Form
      ref="formRef"
      :model="formData"
      :rules="getFormRules()"
      layout="vertical"
      style="max-width: 600px"
    >
      <div v-for="item in testItems" :key="item.attribute.id">
        <Form.Item
          :label="item.attribute.alias"
          :name="item.attribute.name"
          :required="item.isRequired"
        >
          <!-- 验证器组件（隐藏） -->
          <ValidationRuleGenerator
            :ref="
              (el) => {
                if (el) validatorRefs[item.attribute.name] = el;
              }
            "
            :item="item"
            :is-edit-mode="false"
            style="display: none"
          />

          <DynamicFormField
            :attribute="item.attribute"
            :disabled="!item.isEdit"
            v-model="formData[item.attribute.name]"
          />
        </Form.Item>
      </div>

      <Form.Item>
        <Button type="primary" @click="handleSubmit" style="margin-right: 8px">
          提交测试
        </Button>
        <Button @click="handleReset">重置</Button>
      </Form.Item>
    </Form>

    <div style="margin-top: 20px">
      <h3>当前表单数据:</h3>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.validation-test {
  padding: 20px;
}

pre {
  padding: 10px;
  font-size: 12px;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>
