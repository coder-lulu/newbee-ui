<script setup lang="ts">
import { computed, h, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import {
  ArrowLeftOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons-vue';
import { Button, message, Tooltip } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  addCiTypeAttribute,
  createCiType,
  getAttributeInfoSimpleList,
  getCiTypeById,
  getCiTypeList,
  listAttributeGroupWithAttribute,
  updateCiType,
  updateCiTypeAttribute,
} from '#/api/cmdb/ci_types';

import AttributeForm from './AttributeForm.vue';
import { drawerCiTypeSchema } from './data';
import UniqueConstraintManager from './UniqueConstraintManager.vue';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => (isUpdate.value ? '编辑CI模型' : '新增CI模型'));

// 属性表单相关状态
const showAttributeForm = ref(false);
const currentTypeId = ref(0);

const attributeOptions = ref<{ alias?: string; id: number; name: string }[]>(
  [],
);

// CI类型选项
const ciTypeOptions = ref<{ alias?: string; id: number; name: string }[]>([]);

// 当前模型的属性列表
const currentTypeAttributes = ref<
  { alias?: string; id: number; name: string }[]
>([]);

// 表单数据
const formData = ref<any>({
  uniqueConst: [],
});

// 控制继承模型字段显示
const showInheritedModels = ref(false);
const allAttributes = ref<{ alias?: string; id: number; name: string }[]>([]);

// 保存的表单数据（在切换到属性表单时临时保存）
const savedFormData = ref<any>(null);

// 表单刷新标识
const formKey = ref(0);

// 强制刷新表单
const refreshForm = () => {
  formKey.value += 1;
};

// 处理唯一性约束更新
const handleUniqueConstUpdate = (value: any) => {
  formData.value.uniqueConst = value;
};

// 加载CI类型选项
const loadCiTypeOptions = async () => {
  try {
    const res = await getCiTypeList();
    ciTypeOptions.value = Array.isArray(res.data)
      ? res.data
          .filter((item) => typeof item.id === 'number')
          .filter((item) => item.id !== currentTypeId.value) // 过滤掉当前正在编辑的模型
          .map((item) => ({
            id: item.id as number,
            name: item.name || '',
            alias: item.alias || '',
          }))
      : [];
  } catch {
    ciTypeOptions.value = [];
  }
};

// 更新表单选项
const updateFormOptions = async () => {
  try {
    console.log(
      '开始更新表单选项，当前模型属性数量:',
      currentTypeAttributes.value.length,
    );
    console.log('当前模型属性列表:', currentTypeAttributes.value);

    const values = await formApi.getValues();
    const isInherited = values?.isInherited === true;

    formApi.updateSchema([
      {
        componentProps: {
          options: ciTypeOptions.value.map((item) => ({
            label: item.alias || item.name,
            value: item.id,
          })),
        },
        fieldName: 'inheritedModels',
        // 使用响应式变量控制显示
        dependencies: {
          show: () => showInheritedModels.value,
          triggerFields: ['isInherited'],
        },
        // 当isInherited为true时设置为必填项
        rules: isInherited ? 'required' : '',
      },
      {
        componentProps: {
          optionLabelProp: 'title',
          options: attributeOptions.value.map((item) => ({
            label: item.alias || item.name,
            title: item.alias || item.name,
            value: item.id,
          })),
        },
        fieldName: 'uniqueId',
        // 添加后缀按钮
        suffix: () =>
          h(
            Tooltip,
            { title: '找不到想要的属性？点击新建属性' },
            {
              default: () =>
                h(
                  Button,
                  {
                    type: 'text',
                    size: 'small',
                    onClick: handleShowAttributeForm,
                    class: 'ml-2',
                  },
                  {
                    default: () => h(QuestionCircleOutlined),
                  },
                ),
            },
          ),
      },
      {
        componentProps: {
          optionLabelProp: 'title',
          options: currentTypeAttributes.value.map((item) => ({
            label: item.alias || item.name,
            title: item.alias || item.name,
            value: item.id,
          })),
        },
        fieldName: 'showId',
      },
    ]);
    console.log('表单选项更新完成');
  } catch (error) {
    console.error('更新表单选项失败:', error);
  }
};

// 加载属性选项
const loadAttributeOptions = async () => {
  try {
    const res = await getAttributeInfoSimpleList();
    attributeOptions.value = Array.isArray(res)
      ? res
          .filter((item) => typeof item.id === 'number')
          .map((item) => ({
            id: item.id as number,
            name: item.name || '',
            alias: item.alias || '',
          }))
      : [];
  } catch {
    attributeOptions.value = [];
  }
};

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    formItemClass: 'col-span-2',
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 100,
  },
  showDefaultActions: false,
  schema: drawerCiTypeSchema(),
  // 注册自定义组件
  actionWrapperClass: 'vben-form-action',
});

// 更新继承模型字段显示状态
const updateInheritedModelsVisibility = async () => {
  try {
    const values = await formApi.getValues();
    const isInherited = values?.isInherited === true;
    showInheritedModels.value = isInherited;

    // 更新schema确保显示状态同步，并动态设置验证规则
    formApi.updateSchema([
      {
        fieldName: 'inheritedModels',
        dependencies: {
          show: () => showInheritedModels.value,
          triggerFields: ['isInherited'],
        },
        // 当isInherited为true时设置为必填项
        rules: isInherited ? 'required' : '',
      },
    ]);
  } catch {
    // 静默处理错误
  }
};

// 定时检查表单值变化并自动更新显示状态
let checkInterval: any = null;
const startAutoCheck = () => {
  if (checkInterval) clearInterval(checkInterval);
  checkInterval = setInterval(updateInheritedModelsVisibility, 300);
};

const stopAutoCheck = () => {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
};

const [BasicDrawer, drawerApi] = useVbenDrawer({
  onCancel: handleCancel,
  onConfirm: handleConfirm,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      // 抽屉关闭时重置所有状态
      await formApi.resetForm();
      showAttributeForm.value = false;
      currentTypeId.value = 0;
      showInheritedModels.value = false;
      savedFormData.value = null; // 清理保存的表单数据
      stopAutoCheck();
      return null;
    }

    // 抽屉打开时确保状态初始化
    showAttributeForm.value = false;
    drawerApi.drawerLoading(true);

    try {
      const { id, groupId } = drawerApi.getData() as {
        groupId?: number;
        id?: number | string;
      };
      isUpdate.value = !!id;
      currentTypeId.value = id ? Number(id) : 0;
      // 并行加载属性选项和CI类型选项
      await Promise.all([loadAttributeOptions(), loadCiTypeOptions()]);

      if (isUpdate.value && id) {
        try {
          const res = (await getCiTypeById(id)) as any;
          const formValues = {
            ...res,
            uniqueId:
              res.uniqueId === undefined ? undefined : Number(res.uniqueId),
            showId: res.showId === undefined ? undefined : Number(res.showId),
            isInherited: res.isInherited || false,
            inheritedModels: res.inheritedModels || [],
          };
          await formApi.setValues(formValues);
          // 同步唯一性约束数据
          formData.value.uniqueConst = res.uniqueConst || [];
          // 同步继承模型显示状态
          showInheritedModels.value = formValues.isInherited === true;
          // 加载当前模型的属性
          await getCurrentTypeAttributes();
          // 属性加载完成后更新表单选项
          await updateFormOptions();
        } catch {
          console.log('获取CI类型详情失败');
        }
      } else {
        await formApi.resetForm();
        // 设置默认值，包括分组ID
        const defaultValues: any = {
          isInherited: false,
          inheritedModels: [],
        };

        // 如果传入了groupId，设置为默认分组
        if (groupId) {
          defaultValues.groupId = groupId;
        }

        await formApi.setValues(defaultValues);
        formData.value.uniqueConst = [];
        // 重置继承模型显示状态
        showInheritedModels.value = false;
        // 新增模式下清空当前模型属性
        currentTypeAttributes.value = [];
        // 更新表单选项
        await updateFormOptions();
      }

      // 加载所有属性（用于唯一性约束）
      allAttributes.value = attributeOptions.value;

      // 启动自动检查
      startAutoCheck();
    } finally {
      drawerApi.drawerLoading(false);
    }
  },
});

async function handleConfirm() {
  try {
    drawerApi.drawerLoading(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const data = await formApi.getValues();
    // 合并唯一性约束数据，过滤掉空的约束
    const validUniqueConst = formData.value.uniqueConst.filter(
      (constraint: any) => constraint.attrIds && constraint.attrIds.length > 0,
    );
    const submitData = {
      ...data,
      uniqueConst: validUniqueConst,
    };
    // 如果是更新则去除 groupId
    if (isUpdate.value) {
      delete submitData.groupId;
    }
    await (isUpdate.value
      ? updateCiType(submitData)
      : createCiType(submitData));
    emit('reload');
    await handleCancel();
  } catch {
    console.log(isUpdate.value ? '编辑CI模型失败' : '新增CI模型失败');
  } finally {
    drawerApi.drawerLoading(false);
  }
}

async function handleCancel() {
  drawerApi.close();
  await formApi.resetForm();
  showAttributeForm.value = false;
  currentTypeId.value = 0;
  savedFormData.value = null; // 清理保存的表单数据
}

// 获取当前模型的属性 通过调用list_with_group接口来获取
const getCurrentTypeAttributes = async () => {
  try {
    if (currentTypeId.value) {
      const res = await listAttributeGroupWithAttribute(currentTypeId.value);
      // 从每个分组的items中提取attribute信息
      currentTypeAttributes.value = res
        .flatMap(
          (group) =>
            group.items?.map((item) => ({
              id: item.attribute?.id || 0,
              name: item.attribute?.name || '',
              alias: item.attribute?.alias || '',
            })) || [],
        )
        .filter((attr) => attr.id > 0) // 过滤掉无效的属性
        .reverse(); // 反排序，显示正常顺序
    } else {
      currentTypeAttributes.value = [];
    }
  } catch (error) {
    console.error('获取当前模型属性失败:', error);
    currentTypeAttributes.value = [];
  }
};

// 显示属性创建表单
const handleShowAttributeForm = async () => {
  try {
    // 等待一小段时间确保表单状态是最新的
    await new Promise((resolve) => setTimeout(resolve, 50));

    // 保存当前表单数据
    let currentFormValues;
    try {
      currentFormValues = await formApi.getValues();
    } catch {
      // 如果getValues是同步的，直接调用
      currentFormValues = formApi.getValues();
    }

    // 处理Promise情况
    if (currentFormValues && typeof currentFormValues.then === 'function') {
      currentFormValues = await currentFormValues;
      console.log('Promise解析后的表单数据:', currentFormValues);
    }

    // 确保所有字段都被正确保存，包括空值和undefined
    const formValues = currentFormValues as any; // 类型断言避免TypeScript错误
    const savedData = {
      // 直接保存原始数据，避免过度处理
      ...formValues,

      // 特殊处理一些重要字段
      enabled: formValues?.enabled === undefined ? true : formValues.enabled,
      isInherited:
        formValues?.isInherited === undefined ? false : formValues.isInherited,
      inheritedModels: formValues?.inheritedModels || [],

      // 唯一性约束
      uniqueConst: [...formData.value.uniqueConst],
    };

    savedFormData.value = savedData;

    showAttributeForm.value = true;
  } catch (error) {
    console.error('保存表单数据失败:', error);
    showAttributeForm.value = true;
  }
};

// 隐藏属性创建表单
const handleHideAttributeForm = async () => {
  showAttributeForm.value = false;

  try {
    // 恢复保存的表单数据
    if (savedFormData.value) {
      // 等待DOM更新完成，确保表单组件完全渲染
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 分步骤恢复数据，确保每个步骤都成功
      try {
        await formApi.setValues(savedFormData.value);

        // 恢复唯一性约束数据
        formData.value.uniqueConst = savedFormData.value.uniqueConst || [];

        // 恢复继承模型显示状态
        showInheritedModels.value = savedFormData.value.isInherited === true;

        // 再次等待确保所有状态都已更新
        await new Promise((resolve) => setTimeout(resolve, 100));

        // 验证数据是否正确设置
        let currentValues;
        try {
          currentValues = await formApi.getValues();
        } catch {
          currentValues = formApi.getValues();
        }

        // 如果是Promise，等待解析
        if (currentValues && typeof currentValues.then === 'function') {
          currentValues = await currentValues;
        }

        const values = currentValues as any; // 类型断言

        // 如果发现数据没有正确设置，尝试强制刷新
        if (!values?.name && savedFormData.value.name) {
          refreshForm(); // 强制刷新表单组件
          await new Promise((resolve) => setTimeout(resolve, 100));
          await formApi.setValues(savedFormData.value);

          // 再次验证
          await formApi.getValues();
        }
      } catch (setError) {
        console.error('设置表单值时出错:', setError);
      }

      savedFormData.value = null;
    } else {
      savedFormData.value = null;
    }
  } catch (error) {
    console.error('恢复表单数据失败:', error);
  }
};

// 处理属性创建成功
const handleAttributeCreate = async (data: any) => {
  try {
    await addCiTypeAttribute(data);
    message.success('属性创建成功');

    // 重新加载属性选项
    await loadAttributeOptions();

    // 如果是编辑模式，重新加载当前模型的属性
    if (isUpdate.value && currentTypeId.value) {
      await getCurrentTypeAttributes();
    }

    // 临时保存当前的savedFormData
    const tempSavedData = savedFormData.value;

    // 关闭属性表单但不恢复数据
    showAttributeForm.value = false;

    // 更新表单选项
    await updateFormOptions();

    // 等待DOM更新
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 现在恢复数据
    if (tempSavedData) {
      await formApi.setValues(tempSavedData);
      formData.value.uniqueConst = tempSavedData.uniqueConst || [];
      showInheritedModels.value = tempSavedData.isInherited === true;
    }

    savedFormData.value = null;
  } catch {
    message.error('属性创建失败');
  }
};

// 处理属性更新成功
const handleAttributeUpdate = async (data: any) => {
  try {
    await updateCiTypeAttribute(data);
    message.success('属性更新成功');

    // 重新加载属性选项
    await loadAttributeOptions();

    // 如果是编辑模式，重新加载当前模型的属性
    if (isUpdate.value && currentTypeId.value) {
      await getCurrentTypeAttributes();
    }

    // 临时保存当前的savedFormData
    const tempSavedData = savedFormData.value;

    // 关闭属性表单但不恢复数据
    showAttributeForm.value = false;

    // 更新表单选项
    await updateFormOptions();

    // 等待DOM更新
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 现在恢复数据
    if (tempSavedData) {
      await formApi.setValues(tempSavedData);
      formData.value.uniqueConst = tempSavedData.uniqueConst || [];
      showInheritedModels.value = tempSavedData.isInherited === true;
    }

    savedFormData.value = null;
  } catch {
    message.error('属性更新失败');
  }
};
</script>

<template>
  <BasicDrawer :close-on-click-modal="false" :title="title" class="w-[800px]">
    <!-- 使用Transition组件实现流畅切换 -->
    <Transition name="slide-fade" mode="out-in">
      <div v-if="!showAttributeForm" key="main-form" class="main-form">
        <BasicForm :key="formKey" />

        <!-- 唯一性约束管理 -->
        <div class="form-item-wrapper">
          <label class="form-label">唯一性约束:</label>

          <UniqueConstraintManager
            :value="formData.uniqueConst"
            :attributes="
              allAttributes.map((attr) => ({
                id: attr.id,
                name: attr.name || '',
                alias: attr.alias || '',
              }))
            "
            @update:value="handleUniqueConstUpdate"
          />
        </div>
      </div>

      <div v-else key="attribute-form" class="attribute-form-container">
        <div class="attribute-form-header">
          <div class="header-left">
            <Button
              type="text"
              @click="handleHideAttributeForm"
              class="back-button"
              size="small"
            >
              <ArrowLeftOutlined />
              <span class="ml-1">返回</span>
            </Button>
            <div class="divider"></div>
            <h3>新增CI模型属性</h3>
          </div>
        </div>
        <div class="attribute-form-content">
          <AttributeForm
            :type-id="currentTypeId"
            :group-id="0"
            @create="handleAttributeCreate"
            @update="handleAttributeUpdate"
            @cancel="handleHideAttributeForm"
          />
        </div>
      </div>
    </Transition>
  </BasicDrawer>
</template>

<style scoped>
/* 过渡动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 主表单容器 */
.main-form {
  min-height: 200px;
}

/* 属性表单容器 */
.attribute-form-container {
  min-height: 400px;
  overflow: hidden;
  background: #fafafa;
  border-radius: 8px;
}

.attribute-form-header {
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 3%);
}

.header-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.back-button {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  font-weight: 500;
  color: #1677ff;
  border-radius: 4px;
  transition: all 0.2s;
}

.back-button:hover {
  color: #0958d9;
  background-color: #f0f7ff;
}

.divider {
  width: 1px;
  height: 16px;
  background-color: #d9d9d9;
}

.attribute-form-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.attribute-form-content {
  padding: 20px;
  margin: 16px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 3%);
}

/* 美化滚动条 */
.attribute-form-container::-webkit-scrollbar {
  width: 6px;
}

.attribute-form-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.attribute-form-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.attribute-form-container::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* 表单项样式 */
.form-item-wrapper {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}
</style>
