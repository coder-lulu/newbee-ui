<script setup lang="ts">
import type { ValidationRule, ValidationRuleConfig } from './types';

import { computed, ref, watch } from 'vue';

import {
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popover,
  Row,
  Select,
  Space,
  Switch,
  Tag,
} from 'ant-design-vue';

import { VALIDATION_RULE_CONFIGS } from './types';

interface Props {
  rules?: ValidationRule[];
}

const props = withDefaults(defineProps<Props>(), {
  rules: () => [],
});

const emit = defineEmits<{
  change: [rules: ValidationRule[]];
  'update:rules': [rules: ValidationRule[]];
}>();

const rules = ref<ValidationRule[]>([...props.rules]);
const showAddModal = ref(false);
const editingRule = ref<null | ValidationRule>(null);
const editingIndex = ref(-1);

// 监听props.rules的变化，同步更新内部状态
watch(
  () => props.rules,
  (newRules: undefined | ValidationRule[]) => {
    console.log('ValidationRuleManager 接收到新的规则:', newRules);
    rules.value = [...(newRules || [])];
  },
  { deep: true, immediate: false },
);

// 当前编辑的规则表单
const ruleForm = ref<Partial<ValidationRule>>({
  type: '',
  message: '',
  enabled: true,
  params: [],
});

// 当前选择的规则配置
const selectedRuleConfig = ref<null | ValidationRuleConfig>(null);

// 预设正则表达式列表
const presetRegexList = [
  { name: '自定义', pattern: '' },
  { name: '字母', pattern: '^[A-Za-z]+$' },
  { name: '数字', pattern: '^[0-9]+$' },
  { name: '字母和数字', pattern: '^[A-Za-z0-9]+$' },
  { name: '手机号码', pattern: String.raw`^1[3-9]\d{9}$` },
  { name: '座机', pattern: String.raw`^(0\d{2,3}-?)?\d{7,8}$` },
  { name: '邮政编码', pattern: String.raw`^[1-9]\d{5}$` },
  {
    name: '身份证号',
    pattern: String.raw`^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}([0-9]|X)$`,
  },
  {
    name: 'IPv4地址',
    pattern: String.raw`^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$`,
  },
  {
    name: '邮箱',
    pattern: String.raw`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`,
  },
  { name: '链接', pattern: String.raw`^(https?|ftp)://[^\s/$.?#].[^\s]*$` },
  { name: '货币金额', pattern: String.raw`^\d+(\.\d{1,2})?$` },
];

// 正则表达式相关状态
const currentRegexIndex = ref(0);
const regexTest = ref('');
const regexTestResult = ref<{ message: string; valid: boolean }>({
  valid: false,
  message: '',
});

// 可用的规则类型选项
const ruleTypeOptions = computed(() => {
  return VALIDATION_RULE_CONFIGS.map((config) => ({
    label: config.label,
    value: config.type,
    description: config.description,
  }));
});

// 当前规则类型的参数配置
const currentRuleParams = computed(() => {
  return selectedRuleConfig.value?.params || [];
});

// 添加新规则
const addRule = () => {
  ruleForm.value = {
    type: '',
    message: '',
    enabled: true,
    params: [],
  };
  selectedRuleConfig.value = null;
  editingRule.value = null;
  editingIndex.value = -1;
  showAddModal.value = true;
};

// 编辑规则
const editRule = (rule: ValidationRule, index: number) => {
  ruleForm.value = { ...rule };
  selectedRuleConfig.value =
    VALIDATION_RULE_CONFIGS.find((config) => config.type === rule.type) || null;
  editingRule.value = rule;
  editingIndex.value = index;
  showAddModal.value = true;
};

// 删除规则
const deleteRule = (index: number) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这个验证规则吗？',
    onOk() {
      rules.value.splice(index, 1);
      emitChange();
    },
  });
};

// 切换规则启用状态
const toggleRuleEnabled = (index: number) => {
  if (rules.value[index]) {
    rules.value[index].enabled = !rules.value[index].enabled;
    emitChange();
  }
};

// 规则类型改变
const onRuleTypeChange = (type: number | string | undefined) => {
  if (typeof type !== 'string') return;

  selectedRuleConfig.value =
    VALIDATION_RULE_CONFIGS.find((config) => config.type === type) || null;

  // 重置参数
  ruleForm.value.params = [];

  // 初始化默认参数
  if (selectedRuleConfig.value?.params) {
    ruleForm.value.params = selectedRuleConfig.value.params.map((param) => ({
      key: param.key,
      value: param.defaultValue || '',
    }));
  }
};

// 更新参数值
const updateParamValue = (paramKey: string, value: any) => {
  if (!ruleForm.value.params) {
    ruleForm.value.params = [];
  }

  const existingParam = ruleForm.value.params.find((p) => p.key === paramKey);
  if (existingParam) {
    existingParam.value = value;
  } else {
    ruleForm.value.params.push({ key: paramKey, value });
  }
};

// 获取参数值
const getParamValue = (paramKey: string) => {
  return ruleForm.value.params?.find((p) => p.key === paramKey)?.value || '';
};

// 确认保存规则
const confirmRule = () => {
  // 验证必填字段
  if (!ruleForm.value.type || !ruleForm.value.message) {
    Modal.error({
      title: '错误',
      content: '请填写完整的规则信息',
    });
    return;
  }

  // 验证必需参数
  if (selectedRuleConfig.value?.params) {
    for (const param of selectedRuleConfig.value.params) {
      if (param.required) {
        const value = getParamValue(param.key);
        if (!value && value !== 0) {
          Modal.error({
            title: '错误',
            content: `参数 ${param.label} 是必填的`,
          });
          return;
        }
      }
    }
  }

  const newRule: ValidationRule = {
    type: ruleForm.value.type!,
    message: ruleForm.value.message!,
    enabled: ruleForm.value.enabled ?? true,
    params: ruleForm.value.params || [],
    customValidator: ruleForm.value.customValidator,
  };

  if (editingIndex.value >= 0) {
    // 编辑模式
    rules.value[editingIndex.value] = newRule;
  } else {
    // 添加模式
    rules.value.push(newRule);
  }

  emitChange();
  showAddModal.value = false;
};

// 取消编辑
const cancelEdit = () => {
  showAddModal.value = false;
};

// 发出变更事件
const emitChange = () => {
  emit('update:rules', [...rules.value]);
  emit('change', [...rules.value]);
};

// 获取规则类型的显示名称
const getRuleTypeName = (type: string) => {
  const config = VALIDATION_RULE_CONFIGS.find((c) => c.type === type);
  return config?.label || type;
};

// 格式化参数显示
const formatParamsDisplay = (params?: { key: string; value: any }[]) => {
  if (!params || params.length === 0) return '';
  return params.map((p) => `${p.key}=${p.value}`).join(', ');
};

// 选择预设正则表达式
const selectPresetRegex = (value: any) => {
  try {
    const index = Number(value);
    currentRegexIndex.value = index;

    // 处理"自定义"选项（第一项）
    if (index === 0) {
      return;
    }

    // 非自定义选项，直接使用预设
    if (
      index >= 0 &&
      index < presetRegexList.length &&
      presetRegexList[index]
    ) {
      const pattern = presetRegexList[index].pattern;
      updateParamValue('pattern', pattern);
    }
  } catch (error) {
    console.error('设置正则表达式出错:', error);
  }
};

// 测试正则表达式
const testRegex = () => {
  const pattern = getParamValue('pattern');
  const testValue = regexTest.value;

  if (!pattern) {
    regexTestResult.value = {
      valid: false,
      message: '请先输入正则表达式',
    };
    return;
  }

  if (!testValue) {
    regexTestResult.value = {
      valid: false,
      message: '请输入测试文本',
    };
    return;
  }

  try {
    const regex = new RegExp(pattern);
    const isValid = regex.test(testValue);

    regexTestResult.value = {
      valid: isValid,
      message: isValid ? '✓ 匹配成功' : '✗ 不匹配',
    };
  } catch (error) {
    regexTestResult.value = {
      valid: false,
      message: `正则表达式错误: ${error}`,
    };
  }
};

// 处理正则测试弹窗打开
const handleRegexPopoverOpenChange = (visible: boolean) => {
  if (visible) {
    window.setTimeout(() => {
      const input = document.querySelector(
        '.regex-test-input',
      ) as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 100);
  }
};
</script>

<template>
  <div class="validation-rule-manager">
    <!-- 规则列表 -->
    <div class="rule-list">
      <div class="rule-list-header">
        <h4>验证规则</h4>
        <Button type="primary" @click="addRule">
          <PlusOutlined />
          添加规则
        </Button>
      </div>

      <div v-if="rules.length === 0" class="empty-state">
        <p>暂无验证规则，点击"添加规则"创建</p>
      </div>

      <div v-else class="rules-container">
        <Card
          v-for="(rule, index) in rules"
          :key="index"
          size="small"
          class="rule-card"
          :class="{ disabled: !rule.enabled }"
        >
          <template #title>
            <div class="rule-title">
              <Tag :color="rule.enabled ? 'blue' : 'default'">
                {{ getRuleTypeName(rule.type) }}
              </Tag>
              <span class="rule-message">{{ rule.message }}</span>
            </div>
          </template>

          <template #extra>
            <Space>
              <Switch
                v-model:checked="rule.enabled"
                size="small"
                @change="() => toggleRuleEnabled(index)"
              />
              <Button type="link" size="small" @click="editRule(rule, index)">
                编辑
              </Button>
              <Button
                type="link"
                size="small"
                danger
                @click="deleteRule(index)"
              >
                <DeleteOutlined />
              </Button>
            </Space>
          </template>

          <div v-if="rule.params && rule.params.length > 0" class="rule-params">
            <span class="params-label">参数：</span>
            <span class="params-value">{{
              formatParamsDisplay(rule.params)
            }}</span>
          </div>
        </Card>
      </div>
    </div>

    <!-- 添加/编辑规则对话框 -->
    <Modal
      v-model:open="showAddModal"
      :title="editingRule ? '编辑验证规则' : '添加验证规则'"
      width="600px"
      @ok="confirmRule"
      @cancel="cancelEdit"
    >
      <Form layout="vertical" class="rule-form">
        <Form.Item label="规则类型" required>
          <Select
            v-model:value="ruleForm.type"
            placeholder="选择验证规则类型"
            @change="onRuleTypeChange"
          >
            <Select.Option
              v-for="option in ruleTypeOptions"
              :key="option.value"
              :value="option.value"
            >
              <div>
                <div>{{ option.label }}</div>
                <div class="option-description">{{ option.description }}</div>
              </div>
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="错误提示信息" required>
          <Input
            v-model:value="ruleForm.message"
            placeholder="验证失败时显示的错误信息"
          />
        </Form.Item>

        <!-- 动态参数配置 -->
        <div v-if="currentRuleParams.length > 0" class="params-section">
          <h5>参数配置</h5>
          <Row :gutter="16">
            <Col v-for="param in currentRuleParams" :key="param.key" :span="12">
              <Form.Item :label="param.label" :required="param.required">
                <!-- 正则表达式特殊处理 -->
                <template v-if="param.key === 'pattern'">
                  <div class="regex-input-container">
                    <div class="regex-input-group">
                      <div class="regex-preset-select">
                        <Select
                          :value="currentRegexIndex"
                          placeholder="预置正则"
                          @change="selectPresetRegex"
                          style="width: 100px"
                        >
                          <Select.Option
                            v-for="(item, index) in presetRegexList"
                            :key="index"
                            :value="index"
                          >
                            {{ item.name }}
                          </Select.Option>
                        </Select>
                      </div>
                      <div class="regex-input-wrapper">
                        <Input
                          :value="getParamValue(param.key)"
                          placeholder="请输入正则表达式"
                          @update:value="
                            (value) => updateParamValue(param.key, value)
                          "
                        />
                      </div>
                      <div class="regex-test-button">
                        <Popover
                          title="正则表达式测试"
                          trigger="click"
                          placement="right"
                          @open-change="handleRegexPopoverOpenChange"
                        >
                          <template #content>
                            <div style="width: 320px">
                              <div v-if="getParamValue('pattern')" class="mb-2">
                                <div class="mb-1 font-bold">
                                  当前正则表达式:
                                </div>
                                <div class="regex-current">
                                  {{ getParamValue('pattern') }}
                                </div>
                              </div>
                              <div>
                                <div class="mb-1 font-bold">测试文本:</div>
                                <Input
                                  v-model:value="regexTest"
                                  placeholder="请输入测试文本"
                                  class="regex-test-input"
                                  @keyup.enter="testRegex"
                                />
                              </div>
                              <div
                                class="regex-test-result"
                                :class="{
                                  success: regexTestResult.valid,
                                  error:
                                    !regexTestResult.valid &&
                                    regexTestResult.message,
                                  neutral: !regexTestResult.message,
                                }"
                              >
                                {{
                                  regexTestResult.message || '请点击测试按钮'
                                }}
                              </div>
                              <div class="mt-3">
                                <Button
                                  type="primary"
                                  block
                                  @click="testRegex"
                                  size="middle"
                                >
                                  <SearchOutlined /> 测试正则表达式
                                </Button>
                              </div>
                            </div>
                          </template>
                          <Button type="default">
                            <SearchOutlined />
                          </Button>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- 字符串类型参数 -->
                <Input
                  v-else-if="param.type === 'string'"
                  :value="getParamValue(param.key)"
                  :placeholder="`请输入${param.label}`"
                  @update:value="(value) => updateParamValue(param.key, value)"
                />

                <!-- 数字类型参数 -->
                <InputNumber
                  v-else-if="param.type === 'number'"
                  :value="getParamValue(param.key)"
                  :placeholder="`请输入${param.label}`"
                  style="width: 100%"
                  @update:value="(value) => updateParamValue(param.key, value)"
                />

                <!-- 布尔类型参数 -->
                <Switch
                  v-else-if="param.type === 'boolean'"
                  :checked="getParamValue(param.key)"
                  @update:checked="
                    (value) => updateParamValue(param.key, value)
                  "
                />

                <!-- 数组类型参数 -->
                <Input
                  v-else-if="param.type === 'array'"
                  :value="getParamValue(param.key)"
                  placeholder="请输入数组值，用逗号分隔"
                  @update:value="
                    (value) =>
                      updateParamValue(
                        param.key,
                        value ? value.split(',').map((v) => v.trim()) : [],
                      )
                  "
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <!-- 自定义验证器名称 -->
        <Form.Item
          v-if="ruleForm.type === 'custom'"
          label="自定义验证器"
          required
        >
          <Input
            v-model:value="ruleForm.customValidator"
            placeholder="请输入自定义验证函数名称"
          />
        </Form.Item>

        <Form.Item label="启用状态">
          <Switch v-model:checked="ruleForm.enabled" />
          <span class="enable-desc">{{
            ruleForm.enabled ? '启用' : '禁用'
          }}</span>
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
.validation-rule-manager {
  width: 100%;
}

.rule-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.rule-list-header h4 {
  margin: 0;
}

.empty-state {
  padding: 40px 20px;
  color: #999;
  text-align: center;
}

.rules-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule-card {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
}

.rule-card.disabled {
  background-color: #fafafa;
  opacity: 0.6;
}

.rule-title {
  display: flex;
  gap: 8px;
  align-items: center;
}

.rule-message {
  font-size: 14px;
  font-weight: normal;
}

.rule-params {
  font-size: 12px;
  color: #666;
}

.params-label {
  font-weight: 500;
}

.params-value {
  margin-left: 4px;
}

.rule-form .params-section {
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.rule-form .params-section h5 {
  margin-bottom: 16px;
  color: #333;
}

.option-description {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.enable-desc {
  margin-left: 8px;
  color: #666;
}

.regex-input-container {
  width: 100%;
}

.regex-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.regex-preset-select {
  flex-shrink: 0;
}

.regex-input-wrapper {
  flex: 1;
  min-width: 200px;
}

.regex-test-button {
  flex-shrink: 0;
}

.regex-current {
  padding: 8px;
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.regex-test-result {
  padding: 8px;
  margin: 8px 0;
  text-align: center;
  border-radius: 4px;
}

.regex-test-result.success {
  color: #52c41a;
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
}

.regex-test-result.error {
  color: #ff4d4f;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
}

.regex-test-result.neutral {
  color: #999;
  background-color: #f9f9f9;
  border: 1px solid #e8e8e8;
}

.mb-1 {
  margin-bottom: 4px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mt-3 {
  margin-top: 16px;
}

.font-bold {
  font-weight: bold;
}
</style>
