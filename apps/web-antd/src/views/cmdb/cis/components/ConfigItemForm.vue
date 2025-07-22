<script setup lang="ts">
// @ts-ignore
import type { AttributeGroup } from '#/api/cmdb/ci_types/model';
// @ts-ignore
import type {
  CiAttributeValue,
  CreateCisRequest,
  UpdateCisRequest,
} from '#/api/cmdb/cis/model';

import { computed, nextTick, reactive, ref, watch } from 'vue';

import { Button, Divider, Drawer, Form, message, Spin } from 'ant-design-vue';



// @ts-ignore
import { listAttributeGroupWithAttribute } from '#/api/cmdb/ci_types';
// @ts-ignore
import {
  createConfigItem,
  getConfigItemById,
  updateConfigItem,
} from '#/api/cmdb/cis';

import DynamicFormField from './DynamicFormField.vue';
import ValidationRuleGenerator from './ValidationRuleGenerator.vue';

interface Props {
  id?: number; // 如果传入id则为编辑模式
  open: boolean;
  typeId?: null | number;
  typeName?: string; // 配置项类型名称
}

interface Emits {
  (e: 'success'): void;
  (e: 'update:open', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formRef = ref();
const loading = ref(false);
const formData = reactive<Record<string, any>>({});
const attributeGroups = ref<AttributeGroup[]>([]);

// 验证器组件实例引用
const validatorRefs = ref<Record<string, any>>({});

// 强制刷新验证规则的响应式变量
const forceRefreshRules = ref(0);

// 是否为编辑模式
const isEditMode = computed(() => !!props.id);

// 表单标题
const formTitle = computed(() => {
  const operation = isEditMode.value ? '编辑' : '新建';
  const typeName = props.typeName || '配置项';
  return `${operation} ${typeName}`;
});

// 加载属性分组数据
const loadAttributeGroups = async () => {
  if (!props.typeId) return;

  try {
    loading.value = true;
    const response = await listAttributeGroupWithAttribute(props.typeId);
    if (response && Array.isArray(response)) {
      // 按sort字段从小到大排序分组
      attributeGroups.value = response.sort((a, b) => {
        const sortA = typeof a.sort === 'number' ? a.sort : 0;
        const sortB = typeof b.sort === 'number' ? b.sort : 0;
        return sortA - sortB;
      });

      // 对每个分组内的items也进行排序
      attributeGroups.value.forEach((group) => {
        if (group.items && Array.isArray(group.items)) {
          group.items.sort((a, b) => {
            const sortA = typeof a.sort === 'number' ? a.sort : 0;
            const sortB = typeof b.sort === 'number' ? b.sort : 0;
            return sortA - sortB;
          });
        }
      });

      // 只在非编辑模式下初始化表单数据
      if (!isEditMode.value) {
        initFormData();
      }

      // 延迟刷新验证规则，确保验证器组件完全挂载
      await nextTick();
      refreshFormRules();
    }
  } catch (error) {
    console.error('加载属性分组失败:', error);
    message.error('加载属性分组失败');
  } finally {
    loading.value = false;
  }
};

// 初始化表单数据
const initFormData = () => {
  // 清空现有数据
  Object.keys(formData).forEach((key) => {
    delete formData[key];
  });

  // 根据属性设置默认值
  attributeGroups.value.forEach((group) => {
    group.items?.forEach((item) => {
      if (item.attribute) {
        const attr = item.attribute;
        // 跳过计算属性，计算属性不需要表单输入
        if (attr.isComputed) {
          return;
        }
        const defaultValue = getAttributeDefaultValue(attr);
        formData[attr.name] = defaultValue;
      }
    });
  });
};

// 获取属性的默认值
const getAttributeDefaultValue = (attr: any) => {
  // 如果有默认值，使用默认值
  if (attr.default) {
    if (typeof attr.default === 'string') {
      return attr.default;
    } else if (attr.default.default) {
      return attr.default.default;
    }
  }

  // 根据类型返回对应的默认值
  switch (attr.valueType) {
    case 'boolean': {
      return false;
    }
    case 'float':
    case 'int': {
      return undefined;
    }
    case 'json': {
      return '{}';
    }
    default: {
      return attr.isList ? [] : '';
    }
  }
};

// 加载编辑数据
const loadEditData = async () => {
  if (!props.id) return;

  try {
    loading.value = true;
    const response = await getConfigItemById(props.id);
    if (response && response.attributes) {
      // 先初始化表单数据（设置默认值）
      initFormData();

      // 将属性值填充到表单
      response.attributes.forEach((attr: any) => {
        if (attr.attrName && attr.value !== undefined) {
          // 跳过计算属性，计算属性不需要表单输入
          if (attr.isComputed) {
            return;
          }

          // 根据属性类型处理值
          let value = attr.value;

          // 如果有rawValue，优先使用rawValue
          if (attr.rawValue !== undefined) {
            value = attr.rawValue;
          }

          // 根据valueType进行类型转换
          switch (attr.valueType) {
            case 'boolean': {
              // 布尔类型转换
              formData[attr.attrName] =
                typeof value === 'string'
                  ? value === 'true' || value === '1'
                  : Boolean(value);
              break;
            }
            case 'float': {
              // 浮点数类型转换
              formData[attr.attrName] = Number.parseFloat(value) || 0;
              break;
            }
            case 'int': {
              // 整数类型转换
              formData[attr.attrName] = Number.parseInt(value, 10) || 0;
              break;
            }
            case 'json': {
              // JSON类型处理
              try {
                formData[attr.attrName] =
                  typeof value === 'string' ? JSON.parse(value) : value;
              } catch {
                formData[attr.attrName] = value;
              }
              break;
            }
            default: {
              // 其他类型（text, password等）直接赋值
              formData[attr.attrName] = value;
            }
          }
        }
      });

      console.log('编辑数据加载完成:', formData);
    }
  } catch (error) {
    console.error('加载配置项数据失败:', error);
    message.error('加载配置项数据失败');
  } finally {
    loading.value = false;
  }
};

// 计算属性：过滤后的属性分组（排除计算属性和更新时的不可编辑字段）
const filteredAttributeGroups = computed(() => {
  return attributeGroups.value
    .map((group) => ({
      ...group,
      items:
        group.items?.filter((item) => {
          if (!item.attribute) return false;

          // 排除计算属性
          if (item.attribute.isComputed) return false;

          // 在更新模式下，排除不可编辑的字段
          if (isEditMode.value && !item.isEdit) return false;

          return true;
        }) || [],
    }))
    .filter((group) => group.items.length > 0); // 过滤掉没有可显示字段的分组
});

// 动态生成表单验证规则（改为计算属性）
const formRules = computed(() => {
  // 通过forceRefreshRules触发重新计算
  const _refresh = forceRefreshRules.value; // 避免linter警告

  const rules: Record<string, any[]> = {};

  filteredAttributeGroups.value.forEach((group) => {
    group.items?.forEach((item) => {
      if (item.attribute) {
        const validatorRef = validatorRefs.value[item.attribute.name];
        if (
          validatorRef &&
          typeof validatorRef.generateFormRules === 'function'
        ) {
          // 使用ValidationRuleGenerator生成的规则
          const generatedRules = validatorRef.generateFormRules();
          if (generatedRules.length > 0) {
            rules[item.attribute.name] = generatedRules;
          }
        }
      }
    });
  });

  console.log('生成的表单验证规则:', rules, '刷新次数:', _refresh);
  return rules;
});

// 强制刷新验证规则
const refreshFormRules = () => {
  forceRefreshRules.value += 1;
};

// 转换表单数据为API格式
const transformFormDataToApiFormat = (): CiAttributeValue[] => {
  const attributes: CiAttributeValue[] = [];

  attributeGroups.value.forEach((group) => {
    group.items?.forEach((item) => {
      if (item.attribute) {
        const attr = item.attribute;

        // 跳过计算属性，计算属性不需要提交
        if (attr.isComputed) {
          return;
        }

        // 跳过不可编辑的字段，更新时不提交这些字段
        if (isEditMode.value && !item.isEdit) {
          return;
        }

        const fieldValue = formData[attr.name];

        // 跳过空值（除非是必填字段）
        if (
          fieldValue === undefined ||
          fieldValue === null ||
          fieldValue === ''
        ) {
          if (item.isRequired) {
            // 必填字段设置默认值
            const defaultValue = getAttributeDefaultValue(attr);
            if (
              defaultValue !== undefined &&
              defaultValue !== null &&
              defaultValue !== ''
            ) {
              attributes.push({
                attrId: attr.id,
                attrName: attr.name,
                attrAlias: attr.alias,
                valueType: attr.valueType,
                value: attr.isList
                  ? JSON.stringify(defaultValue)
                  : String(defaultValue),
              });
            }
          }
          return;
        }

        // 处理值的转换
        let value: string;
        if (attr.isList) {
          // 列表类型，转换为JSON字符串
          value = Array.isArray(fieldValue)
            ? JSON.stringify(fieldValue)
            : String(fieldValue);
        } else {
          // 非列表类型，直接转换为字符串
          value = String(fieldValue);
        }

        attributes.push({
          attrId: attr.id,
          attrName: attr.name,
          attrAlias: attr.alias,
          valueType: attr.valueType,
          value,
        });
      }
    });
  });

  return attributes;
};

// 提交表单
const handleSubmit = async () => {
  try {
    // 调试：显示当前表单验证规则
    console.log('当前表单验证规则:', formRules.value);
    console.log('当前表单数据:', formData);

    await formRef.value.validate();
    loading.value = true;

    // 转换表单数据为API格式
    const attributes = transformFormDataToApiFormat();

    if (isEditMode.value) {
      // 更新配置项
      const updateData: UpdateCisRequest = {
        id: props.id!,
        status: 1, // 默认状态为1
        attributes,
      };
      await updateConfigItem(props.id!, updateData);
    } else {
      // 创建配置项
      if (!props.typeId) {
        message.error('请选择配置项类型');
        return;
      }

      const createData: CreateCisRequest = {
        typeId: props.typeId,
        status: 1, // 默认状态为1
        attributes,
      };
      await createConfigItem(createData);
    }

    emit('success');
    handleClose();
  } catch (error: any) {
    console.error('提交失败:', error);
    if (error.errorFields) {
      console.log('验证失败的字段:', error.errorFields);
    }
    message.error('提交失败');
  } finally {
    loading.value = false;
  }
};

// 关闭表单
const handleClose = () => {
  emit('update:open', false);
};

// 监听弹窗打开状态
watch(
  () => props.open,
  async (newVal) => {
    if (newVal && props.typeId) {
      // 先加载属性分组
      await loadAttributeGroups();
      // 如果是编辑模式，再加载编辑数据
      if (props.id) {
        await loadEditData();
      }
    }
  },
  { immediate: true },
);

// 监听typeId变化
watch(
  () => props.typeId,
  () => {
    if (props.open && props.typeId) {
      loadAttributeGroups();
    }
  },
);

// 添加测试验证按钮
const testValidation = async () => {
  console.log('=== 开始测试验证 ===');
  console.log('当前表单数据:', formData);
  console.log('当前验证规则:', formRules.value);
  console.log('验证器引用:', validatorRefs.value);

  // 测试每个字段的验证规则生成
  console.log('\n=== 验证规则详情 ===');
  filteredAttributeGroups.value.forEach((group) => {
    console.log(`分组: ${group.name}`);
    group.items?.forEach((item) => {
      if (item.attribute) {
        const fieldName = item.attribute.name;
        const fieldValue = formData[fieldName];
        const validatorRef = validatorRefs.value[fieldName];
        const fieldRules = formRules.value[fieldName] || [];

        console.log(`  字段: ${item.attribute.alias} (${fieldName})`);
        console.log(
          `    当前值: "${fieldValue}" (长度: ${fieldValue?.length || 0})`,
        );
        console.log(`    isRequired: ${item.isRequired}`);
        console.log(`    isEdit: ${item.isEdit}`);
        console.log(`    验证器引用存在: ${!!validatorRef}`);
        console.log(`    生成的规则数量: ${fieldRules.length}`);
        console.log(`    后端验证规则:`, item.attribute.validatorRules);

        if (fieldRules.length > 0) {
          fieldRules.forEach((rule, index) => {
            console.log(`      规则${index + 1}:`, rule);
          });
        }
      }
    });
  });

  // 手动触发表单验证
  console.log('\n=== 开始表单验证 ===');
  try {
    await formRef.value.validate();
    message.success('所有字段验证通过！');
    console.log('✅ 验证成功');
  } catch (error: any) {
    console.log('❌ 验证失败:', error);
    if (error.errorFields) {
      console.log('失败的字段:', error.errorFields);
      const fieldNames = error.errorFields
        .map((field: any) => field.name[0])
        .join(', ');
      message.error(`验证失败的字段: ${fieldNames}`);

      // 详细显示每个失败字段的信息
      error.errorFields.forEach((field: any) => {
        const fieldName = field.name[0];
        const fieldErrors = field.errors;
        console.log(`  失败字段 ${fieldName}:`);
        fieldErrors.forEach((err: string, index: number) => {
          console.log(`    错误${index + 1}: ${err}`);
        });
      });
    } else {
      message.error('表单验证失败');
    }
  }

  console.log('=== 测试验证结束 ===\n');
};
</script>

<script lang="ts">
export default {
  name: 'ConfigItemForm',
};
</script>

<template>
  <Drawer :open="open" :title="formTitle" width="800" @close="handleClose">
    <Spin :spinning="loading">
      <Form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
        class="config-item-form"
        :validate-trigger="['blur', 'change']"
        :scroll-to-first-error="true"
      >
        <div v-for="group in filteredAttributeGroups" :key="group.groupId">
          <Divider orientation="left">{{ group.name }}</Divider>

          <div class="form-grid">
            <div
              v-for="item in group.items"
              :key="item.id"
              class="form-grid-item"
            >
              <Form.Item
                v-if="item.attribute"
                :label="item.attribute.alias"
                :name="item.attribute.name"
                :required="item.isRequired"
                :validate-trigger="['blur', 'change']"
              >
                <!-- 验证器组件（隐藏） -->
                <ValidationRuleGenerator
                  v-if="item.attribute"
                  :ref="
                    (el) => {
                      if (el && item.attribute)
                        validatorRefs[item.attribute.name] = el;
                    }
                  "
                  :item="item"
                  :is-edit-mode="isEditMode"
                  style="display: none"
                />

                <DynamicFormField
                  :attribute="{
                    id: item.attribute.id,
                    name: item.attribute.name,
                    alias: item.attribute.alias,
                    valueType: item.attribute.valueType,
                    isChoice: item.attribute.isChoice,
                    isList: item.attribute.isList,
                    isRequired: item.isRequired || false,
                    validatorRules: item.attribute.validatorRules,
                    choices: item.attribute.choices,
                    default: item.attribute.default
                      ? {
                          default:
                            typeof item.attribute.default === 'string'
                              ? item.attribute.default
                              : item.attribute.default.default,
                        }
                      : undefined,
                  }"
                  v-model="formData[item.attribute.name]"
                />
              </Form.Item>
            </div>
          </div>
        </div>
      </Form>
    </Spin>

    <template #footer>
      <div class="drawer-footer">
        <Button @click="handleClose">取消</Button>
        <Button
          type="default"
          @click="testValidation"
          style="margin-right: 8px"
        >
          测试验证
        </Button>
        <Button type="primary" @click="handleSubmit" :loading="loading">
          {{ isEditMode ? '更新' : '创建' }}
        </Button>
      </div>
    </template>
  </Drawer>
</template>

<style scoped>
/* 在小屏幕上改为单列 */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.config-item-form {
  padding-bottom: 60px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-grid-item {
  min-width: 0; /* 防止内容溢出 */
}

.drawer-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
