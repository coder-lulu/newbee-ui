<template>
  <a-modal
    v-model:open="modalVisible"
    :title="modalTitle"
    width="800px"
    :confirm-loading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    :destroy-on-close="true"
    :mask-closable="false"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 18 }"
      class="mt-4"
    >
      <!-- 基本信息 -->
      <a-divider orientation="left">基本信息</a-divider>
      
      <!-- 源CI -->
      <a-form-item label="源CI" name="sourceCiId">
        <a-select
          v-model:value="formData.sourceCiId"
          :options="sourceCiOptions"
          placeholder="选择源CI"
          show-search
          :filter-option="filterOption"
          :disabled="isEdit"
          @change="handleSourceCiChange"
        >
          <template #option="{ label, value }">
            <div class="flex items-center justify-between">
              <span>{{ label }}</span>
              <a-tag size="small" color="blue">{{ getCiTypeById(value) }}</a-tag>
            </div>
          </template>
        </a-select>
      </a-form-item>

      <!-- 目标CI -->
      <a-form-item label="目标CI" name="targetCiId">
        <a-select
          v-model:value="formData.targetCiId"
          :options="targetCiOptions"
          placeholder="选择目标CI"
          show-search
          :filter-option="filterOption"
          @change="handleTargetCiChange"
        >
          <template #option="{ label, value }">
            <div class="flex items-center justify-between">
              <span>{{ label }}</span>
              <a-tag size="small" color="green">{{ getCiTypeById(value) }}</a-tag>
            </div>
          </template>
        </a-select>
      </a-form-item>

      <!-- 关系类型 -->
      <a-form-item label="关系类型" name="relationTypeId">
        <a-select
          v-model:value="formData.relationTypeId"
          :options="relationTypeOptions"
          placeholder="选择关系类型"
          @change="handleRelationTypeChange"
        >
          <template #option="{ label, value, description }">
            <div>
              <div>{{ label }}</div>
              <div class="text-xs text-gray-500" v-if="description">{{ description }}</div>
            </div>
          </template>
        </a-select>
      </a-form-item>

      <!-- 关系方向 -->
      <a-form-item label="关系方向" name="direction">
        <a-radio-group v-model:value="formData.direction">
          <a-radio value="source_to_target">
            <span class="flex items-center">
              <ArrowRightOutlined class="mr-1" />
              源 → 目标
            </span>
          </a-radio>
          <a-radio value="target_to_source">
            <span class="flex items-center">
              <ArrowLeftOutlined class="mr-1" />
              目标 ← 源
            </span>
          </a-radio>
        </a-radio-group>
      </a-form-item>

      <!-- 关系强度 -->
      <a-form-item label="关系强度" name="relationStrength">
        <a-select v-model:value="formData.relationStrength" placeholder="选择关系强度">
          <a-select-option value="weak">
            <a-tag color="orange">弱</a-tag>
            轻微依赖或松散关联
          </a-select-option>
          <a-select-option value="normal">
            <a-tag color="blue">正常</a-tag>
            一般依赖或标准关联
          </a-select-option>
          <a-select-option value="strong">
            <a-tag color="red">强</a-tag>
            强依赖或紧密关联
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- 状态 -->
      <a-form-item label="状态" name="status">
        <a-radio-group v-model:value="formData.status">
          <a-radio value="active">
            <a-tag color="green">激活</a-tag>
          </a-radio>
          <a-radio value="inactive">
            <a-tag color="gray">非激活</a-tag>
          </a-radio>
        </a-radio-group>
      </a-form-item>

      <!-- 发现来源 -->
      <a-form-item label="发现来源" name="discoverySource">
        <a-select v-model:value="formData.discoverySource" placeholder="选择发现来源">
          <a-select-option value="manual">手动创建</a-select-option>
          <a-select-option value="auto_discovery">自动发现</a-select-option>
          <a-select-option value="import">数据导入</a-select-option>
          <a-select-option value="api">API接口</a-select-option>
        </a-select>
      </a-form-item>

      <!-- 扩展信息 -->
      <a-divider orientation="left">扩展信息</a-divider>

      <!-- 关系属性 -->
      <a-form-item label="关系属性" name="properties">
        <a-textarea
          v-model:value="formData.properties"
          placeholder="输入JSON格式的关系属性"
          :rows="3"
          :auto-size="{ minRows: 3, maxRows: 6 }"
        />
        <div class="text-xs text-gray-500 mt-1">
          格式: {"key": "value", "description": "关系描述"}
        </div>
      </a-form-item>

      <!-- 属性映射配置 -->
      <a-form-item label="属性映射" name="attributeMappings">
        <div class="border rounded-lg p-4">
          <div class="flex items-center justify-between mb-4">
            <span class="font-medium">属性映射配置</span>
            <a-button type="dashed" size="small" @click="addAttributeMapping">
              <template #icon>
                <PlusOutlined />
              </template>
              添加映射
            </a-button>
          </div>
          
          <div v-if="formData.attributeMappings.length === 0" class="text-center text-gray-500 py-4">
            暂无属性映射配置
          </div>
          
          <div v-else class="space-y-3">
            <div
              v-for="(mapping, index) in formData.attributeMappings"
              :key="index"
              class="flex items-center gap-2 p-3 border rounded-lg bg-gray-50"
            >
              <div class="flex-1">
                <a-row :gutter="8">
                  <a-col :span="10">
                    <a-select
                      v-model:value="mapping.sourceAttrId"
                      :options="sourceAttributeOptions"
                      placeholder="源属性"
                      size="small"
                    />
                  </a-col>
                  <a-col :span="2" class="text-center">
                    <ArrowRightOutlined class="text-gray-400" />
                  </a-col>
                  <a-col :span="10">
                    <a-select
                      v-model:value="mapping.targetAttrId"
                      :options="targetAttributeOptions"
                      placeholder="目标属性"
                      size="small"
                    />
                  </a-col>
                  <a-col :span="2">
                    <a-button
                      type="text"
                      danger
                      size="small"
                      @click="removeAttributeMapping(index)"
                    >
                      <template #icon>
                        <DeleteOutlined />
                      </template>
                    </a-button>
                  </a-col>
                </a-row>
                <a-row :gutter="8" class="mt-2">
                  <a-col :span="12">
                    <a-select
                      v-model:value="mapping.syncStatus"
                      placeholder="同步状态"
                      size="small"
                    >
                      <a-select-option value="synced">已同步</a-select-option>
                      <a-select-option value="pending">待同步</a-select-option>
                      <a-select-option value="failed">同步失败</a-select-option>
                      <a-select-option value="conflict">冲突</a-select-option>
                    </a-select>
                  </a-col>
                  <a-col :span="12">
                    <a-input
                      v-model:value="mapping.conflictReason"
                      placeholder="冲突原因"
                      size="small"
                    />
                  </a-col>
                </a-row>
              </div>
            </div>
          </div>
        </div>
      </a-form-item>
    </a-form>

    <!-- 验证结果显示 -->
    <div v-if="validationResult && !validationResult.isValid" class="mt-4">
      <a-alert
        message="关系验证失败"
        type="error"
        show-icon
        :description="validationResult.errors.join('; ')"
      />
    </div>

    <div v-if="validationResult && validationResult.warnings.length > 0" class="mt-2">
      <a-alert
        message="验证警告"
        type="warning"
        show-icon
        :description="validationResult.warnings.join('; ')"
      />
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import {
  ArrowRightOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue';

// API导入
import { getCisList } from '#/api/cmdb/cis';
import {
  createCiRelationApi,
  updateCiRelationApi,
  validateCiRelationApi,
  getRelationTypesApi,
  type CiRelationCreateInfo,
  type CiRelationUpdateInfo,
  type RelationValidationResult,
} from '#/api/cmdb/cis/relation';

// 类型定义
interface AttributeMappingForm {
  sourceAttrId: number;
  targetAttrId: number;
  syncStatus: string;
  conflictReason: string;
}

interface FormData {
  relationId?: number;
  sourceCiId: number;
  targetCiId: number;
  relationTypeId: number;
  direction: 'source_to_target' | 'target_to_source';
  relationStrength: string;
  status: string;
  discoverySource: string;
  properties: string;
  attributeMappings: AttributeMappingForm[];
}

// Props & Emits
interface Props {
  open: boolean;
  editData?: any;
  sourceCiId?: number;
}

interface Emits {
  (e: 'update:open', value: boolean): void;
  (e: 'success'): void;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  editData: undefined,
  sourceCiId: undefined,
});

const emit = defineEmits<Emits>();

// 响应式数据
const formRef = ref();
const confirmLoading = ref(false);
const validationResult = ref<RelationValidationResult>();

// 计算属性
const modalVisible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
});

const modalTitle = computed(() => {
  return isEdit.value ? '编辑CI关系' : '创建CI关系';
});

const isEdit = computed(() => {
  return !!props.editData?.id;
});

// 表单数据
const formData = reactive<FormData>({
  sourceCiId: 0,
  targetCiId: 0,
  relationTypeId: 0,
  direction: 'source_to_target',
  relationStrength: 'normal',
  status: 'active',
  discoverySource: 'manual',
  properties: '',
  attributeMappings: [],
});

// 选项数据
const sourceCiOptions = ref<Array<{ label: string; value: number }>>([]);
const targetCiOptions = ref<Array<{ label: string; value: number }>>([]);
const relationTypeOptions = ref<Array<{ label: string; value: number; description?: string }>>([]);
const sourceAttributeOptions = ref<Array<{ label: string; value: number }>>([]);
const targetAttributeOptions = ref<Array<{ label: string; value: number }>>([]);

// 表单验证规则
const formRules = {
  sourceCiId: [{ required: true, message: '请选择源CI', type: 'number' }],
  targetCiId: [{ required: true, message: '请选择目标CI', type: 'number' }],
  relationTypeId: [{ required: true, message: '请选择关系类型', type: 'number' }],
  direction: [{ required: true, message: '请选择关系方向' }],
  relationStrength: [{ required: true, message: '请选择关系强度' }],
  status: [{ required: true, message: '请选择状态' }],
  properties: [
    {
      validator: (_: any, value: string) => {
        if (!value) return Promise.resolve();
        try {
          JSON.parse(value);
          return Promise.resolve();
        } catch {
          return Promise.reject(new Error('属性必须是有效的JSON格式'));
        }
      },
    },
  ],
};

// 方法
const filterOption = (input: string, option: any) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};

const getCiTypeById = (ciId: number) => {
  // 模拟获取CI类型
  const typeMap: Record<number, string> = {
    1: '服务器',
    2: '数据库',
    3: '网络设备',
    4: '应用',
  };
  return typeMap[ciId] || '未知';
};

// 加载CI列表
const loadCiList = async () => {
  try {
    const response = await getCisList({ current: 1, size: 1000 });
    if (response.data?.list) {
      const options = response.data.list.map((ci: any) => ({
        label: `${ci.name} (${ci.id})`,
        value: ci.id,
      }));
      sourceCiOptions.value = options;
      targetCiOptions.value = options;
    }
  } catch (error) {
    console.error('加载CI列表失败:', error);
    message.error('加载CI列表失败');
  }
};

// 加载关系类型
const loadRelationTypes = async () => {
  try {
    const response = await getRelationTypesApi();
    if (response.data) {
      relationTypeOptions.value = response.data.map((type: any) => ({
        label: type.name,
        value: type.id,
        description: type.description,
      }));
    }
  } catch (error) {
    console.error('加载关系类型失败:', error);
    message.error('加载关系类型失败');
  }
};

// 处理源CI变化
const handleSourceCiChange = (ciId: number) => {
  // 加载源CI的属性列表
  loadSourceAttributes(ciId);
  // 重新验证关系
  validateRelation();
};

// 处理目标CI变化
const handleTargetCiChange = (ciId: number) => {
  // 加载目标CI的属性列表
  loadTargetAttributes(ciId);
  // 重新验证关系
  validateRelation();
};

// 处理关系类型变化
const handleRelationTypeChange = () => {
  validateRelation();
};

// 加载源CI属性
const loadSourceAttributes = async (ciId: number) => {
  try {
    // 这里应该调用获取CI属性的API
    // const response = await getCiAttributesApi(ciId);
    
    // 模拟数据
    sourceAttributeOptions.value = [
      { label: '名称', value: 1 },
      { label: 'IP地址', value: 2 },
      { label: '端口', value: 3 },
      { label: '状态', value: 4 },
    ];
  } catch (error) {
    console.error('加载源CI属性失败:', error);
  }
};

// 加载目标CI属性
const loadTargetAttributes = async (ciId: number) => {
  try {
    // 这里应该调用获取CI属性的API
    // const response = await getCiAttributesApi(ciId);
    
    // 模拟数据
    targetAttributeOptions.value = [
      { label: '名称', value: 1 },
      { label: 'IP地址', value: 2 },
      { label: '端口', value: 3 },
      { label: '状态', value: 4 },
    ];
  } catch (error) {
    console.error('加载目标CI属性失败:', error);
  }
};

// 验证关系
const validateRelation = async () => {
  if (!formData.sourceCiId || !formData.targetCiId || !formData.relationTypeId) {
    return;
  }

  try {
    const response = await validateCiRelationApi({
      sourceCiId: formData.sourceCiId,
      targetCiId: formData.targetCiId,
      relationTypeId: formData.relationTypeId,
    });
    validationResult.value = response.data;
  } catch (error) {
    console.error('关系验证失败:', error);
  }
};

// 添加属性映射
const addAttributeMapping = () => {
  formData.attributeMappings.push({
    sourceAttrId: 0,
    targetAttrId: 0,
    syncStatus: 'pending',
    conflictReason: '',
  });
};

// 删除属性映射
const removeAttributeMapping = (index: number) => {
  formData.attributeMappings.splice(index, 1);
};

// 初始化表单数据
const initFormData = () => {
  if (isEdit.value && props.editData) {
    // 编辑模式，填充现有数据
    Object.assign(formData, {
      relationId: props.editData.id,
      sourceCiId: props.editData.sourceCiId,
      targetCiId: props.editData.targetCiId,
      relationTypeId: props.editData.relationTypeId,
      direction: 'source_to_target', // 从现有关系推断方向
      relationStrength: props.editData.relationStrength || 'normal',
      status: props.editData.status || 'active',
      discoverySource: props.editData.discoverySource || 'manual',
      properties: props.editData.properties ? JSON.stringify(props.editData.properties, null, 2) : '',
      attributeMappings: props.editData.attributeMappings || [],
    });
  } else {
    // 创建模式，重置表单
    Object.assign(formData, {
      relationId: undefined,
      sourceCiId: props.sourceCiId || 0,
      targetCiId: 0,
      relationTypeId: 0,
      direction: 'source_to_target',
      relationStrength: 'normal',
      status: 'active',
      discoverySource: 'manual',
      properties: '',
      attributeMappings: [],
    });
  }
  
  // 清除验证结果
  validationResult.value = undefined;
};

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    
    // 检查验证结果
    if (validationResult.value && !validationResult.value.isValid) {
      message.error('关系验证失败，请检查配置');
      return;
    }

    confirmLoading.value = true;

    // 构建请求数据
    const relationInfo: CiRelationCreateInfo | CiRelationUpdateInfo = {
      targetCiId: formData.targetCiId,
      relationTypeId: formData.relationTypeId,
      direction: formData.direction,
      relationStrength: formData.relationStrength,
      status: formData.status,
      discoverySource: formData.discoverySource,
      properties: formData.properties ? formData.properties : undefined,
      attributeMappings: formData.attributeMappings.length > 0 ? formData.attributeMappings : undefined,
    };

    if (isEdit.value) {
      // 更新关系
      await updateCiRelationApi({
        relationInfo: {
          relationId: formData.relationId!,
          ...relationInfo,
        } as CiRelationUpdateInfo,
      });
      message.success('关系更新成功');
    } else {
      // 创建关系
      await createCiRelationApi({
        sourceCiId: formData.sourceCiId,
        relationInfo: relationInfo as CiRelationCreateInfo,
      });
      message.success('关系创建成功');
    }

    emit('success');
    modalVisible.value = false;
  } catch (error) {
    console.error('操作失败:', error);
    message.error('操作失败');
  } finally {
    confirmLoading.value = false;
  }
};

// 取消操作
const handleCancel = () => {
  modalVisible.value = false;
};

// 监听模态框打开状态
watch(
  () => props.open,
  async (open) => {
    if (open) {
      await loadCiList();
      await loadRelationTypes();
      await nextTick();
      initFormData();
    }
  },
  { immediate: true }
);

// 监听表单数据变化，自动验证
watch(
  [() => formData.sourceCiId, () => formData.targetCiId, () => formData.relationTypeId],
  () => {
    validateRelation();
  }
);
</script>

<style scoped>
:deep(.ant-form-item-label) {
  font-weight: 600;
}

:deep(.ant-divider-horizontal.ant-divider-with-text) {
  margin: 16px 0;
}

:deep(.ant-select-selector) {
  border-radius: 6px;
}

:deep(.ant-input) {
  border-radius: 6px;
}
</style>