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

import {
  Button,
  Divider,
  Drawer,
  Form,
  InputNumber,
  Modal,
  Radio,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  message,
} from 'ant-design-vue';

// @ts-ignore
import { listAttributeGroupWithAttribute } from '#/api/cmdb/ci_types';
// @ts-ignore
import {
  createConfigItem,
  getConfigItemById,
  initCmdbDatabase,
  updateConfigItem,
  getCisDetail,
} from '#/api/cmdb/cis';
// @ts-ignore
import { getCiTypeRelationList } from '#/api/cmdb/ciTypeRelation';
// @ts-ignore
import {
  getRelationTypesApi,
  getCiRelationsApi,
  type CiRelationCreateInfo,
  type CiRelationUpdateInfo,
  type CiRelationsData,
  type CiRelationInfo,
} from '#/api/cmdb/cis/relation';

import CiSelector from './CiSelector.vue';
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

interface RelationTypeOption {
  id: number;
  name: string;
  alias?: string;
  description?: string;
}

interface SelectedCiItem {
  id: number;
  typeId: number;
  typeName: string;
  displayName: string;
  [key: string]: any;
}

interface PendingRelation {
  key: string;
  mode: 'selector' | 'manual';
  targetCiId: number | null;
  targetDisplay: string;
  targetTypeId?: number;
  targetTypeName?: string;
  relationTypeId: number | null;
  direction: 'source_to_target' | 'target_to_source';
  relationStrength: string;
  status: string;
  relationId?: number;
  isNew?: boolean;
  markedForDeletion?: boolean;
  original?: {
    relationTypeId: number | null;
    direction: 'source_to_target' | 'target_to_source';
    relationStrength: string;
    status: string;
    targetCiId: number | null;
  };
}

interface CiSummary {
  id: number;
  displayName: string;
  typeId: number;
  typeName: string;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formRef = ref();
const loading = ref(false);
const initLoading = ref(false);
const formData = reactive<Record<string, any>>({});
const attributeGroups = ref<AttributeGroup[]>([]);

const relationTypes = ref<RelationTypeOption[]>([]);
const relationTypesLoading = ref(false);
const relationEntries = ref<PendingRelation[]>([]);
const selectorOpen = ref(false);
const selectorSelectedCis = ref<SelectedCiItem[]>([]);
const manualRelationModalOpen = ref(false);
const manualRelationForm = reactive<{ targetCiId?: number }>({});

const ciSummaryCache = new Map<number, CiSummary>();
const relationDefinitionMap = ref<Record<string, number[]>>({});
const relationDefinitionPromises = new Map<string, Promise<void>>();

const relationStrengthOptions = [
  { label: '弱', value: 'weak', tag: 'orange' },
  { label: '正常', value: 'normal', tag: 'blue' },
  { label: '强', value: 'strong', tag: 'red' },
];

const relationStatusOptions = [
  { label: '激活', value: 'active', tag: 'green' },
  { label: '非激活', value: 'inactive', tag: 'gray' },
];

const relationDirectionOptions: Array<{
  label: string;
  value: 'source_to_target' | 'target_to_source';
}> = [
  { label: '当前CI → 目标CI', value: 'source_to_target' },
  { label: '目标CI → 当前CI', value: 'target_to_source' },
];

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
      attributeGroups.value = response
        .map((group) => ({
          ...group,
        }))
        .sort((a, b) => {
          const sortA = typeof a.sort === 'number' ? a.sort : 0;
          const sortB = typeof b.sort === 'number' ? b.sort : 0;
          return sortA - sortB;
        });

      attributeGroups.value.forEach((group) => {
        if (group.items && Array.isArray(group.items)) {
          group.items = group.items
            .map((item) => ({ ...item }))
            .sort((a, b) => {
              const sortA = typeof a.sort === 'number' ? a.sort : 0;
              const sortB = typeof b.sort === 'number' ? b.sort : 0;
              return sortA - sortB;
            });
        }
      });

      if (!isEditMode.value) {
        initFormData();
      }

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

  // 根据主模型属性设置默认值
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
    if (response?.attributes) {
      initFormData();

      response.attributes.forEach((attr: any) => {
        if (!attr.attrName || attr.value === undefined) {
          return;
        }

        if (attr.isComputed) {
          return;
        }

        let value = attr.value;
        if (attr.rawValue !== undefined) {
          value = attr.rawValue;
        }

        switch (attr.valueType) {
          case 'boolean': {
            formData[attr.attrName] =
              typeof value === 'string'
                ? value === 'true' || value === '1'
                : Boolean(value);
            break;
          }
          case 'float': {
            formData[attr.attrName] = Number.parseFloat(value) || 0;
            break;
          }
          case 'int': {
            formData[attr.attrName] = Number.parseInt(value, 10) || 0;
            break;
          }
          case 'json': {
            try {
              formData[attr.attrName] =
                typeof value === 'string' ? JSON.parse(value) : value;
            } catch {
              formData[attr.attrName] = value;
            }
            break;
          }
          default: {
            formData[attr.attrName] = value;
          }
        }
      });
    }

    if (props.id) {
      await loadExistingRelations(props.id);
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

const resetRelationState = () => {
  relationEntries.value = [];
  selectorSelectedCis.value = [];
  manualRelationForm.targetCiId = undefined;
  relationDefinitionMap.value = {};
  relationDefinitionPromises.clear();
};

const defaultRelationTypeId = computed(() => relationTypes.value[0]?.id ?? null);

const loadRelationTypes = async () => {
  if (relationTypesLoading.value || relationTypes.value.length > 0) return;
  try {
    relationTypesLoading.value = true;
    const response = await getRelationTypesApi({ page: 1, pageSize: 1000 });
    let types: RelationTypeOption[] = [];
    if (Array.isArray(response)) {
      types = response as RelationTypeOption[];
    } else if (Array.isArray((response as any)?.data?.data)) {
      types = (response as any).data.data;
    } else if (Array.isArray((response as any)?.data)) {
      types = (response as any).data;
    } else if (Array.isArray((response as any)?.list)) {
      types = (response as any).list;
    }
    relationTypes.value = types;
  } catch (error) {
    console.error('加载关系类型失败:', error);
    message.error('加载关系类型失败');
  } finally {
    relationTypesLoading.value = false;
  }
};

const syncSelectorSnapshot = () => {
  selectorSelectedCis.value = relationEntries.value
    .filter(
      (entry) =>
        entry.mode === 'selector' &&
        entry.isNew &&
        !entry.markedForDeletion &&
        entry.targetCiId,
    )
    .map((entry) => ({
      id: entry.targetCiId!,
      typeId: entry.targetTypeId ?? 0,
      typeName: entry.targetTypeName ?? '',
      displayName: entry.targetDisplay,
    }));
};

const createRelationEntry = (
  ci: SelectedCiItem,
  mode: 'selector' | 'manual',
): PendingRelation => ({
  key: `${mode}-${ci.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  mode,
  targetCiId: ci.id,
  targetDisplay: ci.displayName || `CI #${ci.id}`,
  targetTypeId: ci.typeId,
  targetTypeName: ci.typeName,
  relationTypeId: defaultRelationTypeId.value,
  direction: 'source_to_target',
  relationStrength: 'normal',
  status: 'active',
  isNew: true,
});

const createRelationEntryFromApi = (
  relation: CiRelationInfo,
  direction: 'source_to_target' | 'target_to_source',
) => {
  const relationId = relation.id ?? relation.id;
  const relationTypeId =
    relation.relation_type_id ?? (relation as any).relationTypeId ?? null;
  const relationStrength =
    relation.relation_strength ?? (relation as any).relationStrength ?? 'normal';
  const status = relation.status ?? (relation as any).status ?? 'active';

  const targetCiId =
    direction === 'source_to_target'
      ? relation.target_ci_id ?? (relation as any).targetCiId ?? null
      : relation.source_ci_id ?? (relation as any).sourceCiId ?? null;

  const targetDisplay =
    direction === 'source_to_target'
      ? relation.targetCiName || `CI #${targetCiId ?? ''}`
      : relation.sourceCiName || `CI #${targetCiId ?? ''}`;

  const entry: PendingRelation = {
    key: `existing-${relationId}-${Math.random().toString(16).slice(2)}`,
    mode: 'selector',
    relationId: relationId ?? undefined,
    isNew: false,
    markedForDeletion: false,
    targetCiId,
    targetDisplay,
    targetTypeId: undefined,
    targetTypeName:
      direction === 'source_to_target'
        ? (relation as any).targetCiTypeName
        : (relation as any).sourceCiTypeName,
    relationTypeId: relationTypeId ?? defaultRelationTypeId.value,
    direction,
    relationStrength,
    status,
    original: {
      relationTypeId: relationTypeId ?? defaultRelationTypeId.value,
      direction,
      relationStrength,
      status,
      targetCiId: targetCiId ?? null,
    },
  };

  return entry;
};

const normalizeKeyVariants = (key: string): string[] => {
  const variants = new Set<string>();
  variants.add(key);
  if (key.includes('_')) {
    const camel = key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    variants.add(camel);
  }
  if (/[A-Z]/.test(key)) {
    const snake = key
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
    variants.add(snake);
  }
  variants.add(key.toLowerCase());
  return Array.from(variants);
};

const pickFieldValue = (obj: any, key: string) => {
  if (!obj) return undefined;
  for (const variant of normalizeKeyVariants(key)) {
    if (Object.prototype.hasOwnProperty.call(obj, variant)) {
      const value = obj[variant];
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
  }
  return undefined;
};

const deriveDisplayName = (ciInfo: any, attributes: any[], fallbackId: number): string => {
  const attributeArray = Array.isArray(attributes) ? attributes : [];

  // 1. 优先使用标记为默认展示的属性
  for (const attr of attributeArray) {
    const isDefault = pickFieldValue(attr, 'defaultShow') ?? pickFieldValue(attr, 'isDefaultShow');
    if (isDefault) {
      const value = pickFieldValue(attr, 'value');
      if (value !== undefined) {
        return String(value);
      }
    }
  }

  // 2. 常见名称字段
  const candidateFields = ['display_name', 'displayName', 'name', 'hostname', 'ip', 'title', 'label'];
  for (const field of candidateFields) {
    const value = pickFieldValue(ciInfo, field);
    if (value !== undefined) {
      return String(value);
    }
  }

  // 3. 属性中查找候选字段
  for (const attr of attributeArray) {
    const attrName = String(pickFieldValue(attr, 'attrName') ?? '').toLowerCase();
    const attrAlias = String(pickFieldValue(attr, 'attrAlias') ?? '').toLowerCase();
    const value = pickFieldValue(attr, 'value');
    if (value === undefined) continue;

    const matched = candidateFields.some((field) => {
      const candidate = field.toLowerCase();
      return attrName === candidate || attrAlias === candidate;
    });

    if (matched) {
      return String(value);
    }
  }

  return `CI-${fallbackId}`;
};

const fetchCiSummary = async (ciId: number): Promise<CiSummary | null> => {
  if (ciSummaryCache.has(ciId)) {
    return ciSummaryCache.get(ciId) ?? null;
  }

  try {
    const detail = await getCisDetail({ id: ciId });
    const detailData = (detail as any)?.data ?? detail;
    if (!detailData) {
      return null;
    }

    const ciInfo = detailData.ciInfo ?? detailData.ci_info ?? {};
    const typeId = Number(pickFieldValue(ciInfo, 'typeId') ?? pickFieldValue(ciInfo, 'type_id'));
    const typeName =
      (pickFieldValue(detailData, 'ciTypeName') ?? pickFieldValue(ciInfo, 'typeName')) || '';

    const attributes = ciInfo.attributes ?? ciInfo.Attributes ?? [];
    const displayName = deriveDisplayName(ciInfo, attributes, ciId);

    if (!Number.isFinite(typeId) || typeId <= 0) {
      return null;
    }

    const summary: CiSummary = {
      id: ciId,
      displayName,
      typeId,
      typeName: String(typeName || `类型-${typeId}`),
    };

    ciSummaryCache.set(ciId, summary);
    return summary;
  } catch (error) {
    console.error('获取CI详情失败:', error);
    return null;
  }
};

const fetchCiSummaries = async (ciIds: number[]): Promise<Map<number, CiSummary>> => {
  const ids = Array.from(new Set(ciIds)).filter((id) => Number.isFinite(id) && id > 0);
  const result = new Map<number, CiSummary>();
  if (ids.length === 0) {
    return result;
  }

  const fetchPromises = ids.map(async (id) => {
    const summary = await fetchCiSummary(id);
    if (summary) {
      result.set(id, summary);
    }
  });

  await Promise.all(fetchPromises);
  return result;
};

const enrichRelationEntry = (entry: PendingRelation, summary: CiSummary) => {
  entry.targetCiId = summary.id;
  entry.targetDisplay = summary.displayName;
  entry.targetTypeId = summary.typeId;
  entry.targetTypeName = summary.typeName;
  if (entry.original && entry.original.targetCiId == null) {
    entry.original.targetCiId = summary.id;
  }
};

const buildDefinitionKey = (parentId: number, childId: number) => `${parentId}->${childId}`;

const ensureRelationDefinition = async (
  parentId?: number | null,
  childId?: number | null,
) => {
  if (!parentId || !childId) {
    return;
  }
  const key = buildDefinitionKey(parentId, childId);
  if (relationDefinitionMap.value[key] !== undefined) {
    return;
  }

  if (relationDefinitionPromises.has(key)) {
    await relationDefinitionPromises.get(key);
    return;
  }

  const promise = (async () => {
    try {
      const response = await getCiTypeRelationList({
        page: 1,
        pageSize: 1000,
        parentId,
        childId,
      });

      let list: any[] = [];
      if (Array.isArray(response)) {
        list = response;
      } else if (Array.isArray((response as any)?.data?.data)) {
        list = (response as any).data.data;
      } else if (Array.isArray((response as any)?.data)) {
        list = (response as any).data;
      } else if (Array.isArray((response as any)?.list)) {
        list = (response as any).list;
      }

      const relationTypeIds = list
        .map((item) => Number(pickFieldValue(item, 'relationTypeId')))
        .filter((id) => Number.isFinite(id) && id > 0);

      relationDefinitionMap.value = {
        ...relationDefinitionMap.value,
        [key]: relationTypeIds,
      };
    } catch (error) {
      console.error('加载模型关系定义失败:', error);
      relationDefinitionMap.value = {
        ...relationDefinitionMap.value,
        [key]: [],
      };
    } finally {
      relationDefinitionPromises.delete(key);
    }
  })();

  relationDefinitionPromises.set(key, promise);
  await promise;
};

const ensureRelationDefinitionForEntry = async (entry: PendingRelation) => {
  if (!props.typeId || !entry.targetTypeId) {
    return;
  }

  const parentId =
    entry.direction === 'source_to_target' ? props.typeId : entry.targetTypeId;
  const childId =
    entry.direction === 'source_to_target' ? entry.targetTypeId : props.typeId;

  await ensureRelationDefinition(parentId, childId);
};

const getRelationDefinitionsForEntry = (entry: PendingRelation) => {
  if (!props.typeId || !entry.targetTypeId) {
    return undefined;
  }
  const parentId =
    entry.direction === 'source_to_target' ? props.typeId : entry.targetTypeId;
  const childId =
    entry.direction === 'source_to_target' ? entry.targetTypeId : props.typeId;
  const key = buildDefinitionKey(parentId, childId);
  return relationDefinitionMap.value[key];
};

const isRelationTypeSelectable = (
  entry: PendingRelation,
  relationTypeId: number | null,
) => {
  if (relationTypeId == null || entry.markedForDeletion) {
    return true;
  }

  const definitions = getRelationDefinitionsForEntry(entry);
  if (definitions === undefined) {
    return true; // 等待加载
  }
  if (definitions.length === 0) {
    return false;
  }
  return definitions.includes(relationTypeId);
};

const hasRelationDefinition = (entry: PendingRelation) => {
  const definitions = getRelationDefinitionsForEntry(entry);
  if (definitions === undefined) {
    return true; // 仍在加载时不提示
  }
  return definitions.length > 0;
};

const canUseDirection = (
  entry: PendingRelation,
  direction: 'source_to_target' | 'target_to_source',
) => {
  if (!props.typeId || !entry.targetTypeId) {
    return true;
  }
  const parentId = direction === 'source_to_target' ? props.typeId : entry.targetTypeId;
  const childId = direction === 'source_to_target' ? entry.targetTypeId : props.typeId;
  const key = buildDefinitionKey(parentId, childId);
  const definitions = relationDefinitionMap.value[key];
  if (definitions === undefined) {
    return true; // 等待加载
  }
  return definitions.length > 0;
};

const openRelationSelector = async () => {
  await loadRelationTypes();
  selectorOpen.value = true;
};

const handleSelectorConfirm = (cis: SelectedCiItem[]) => {
  const existingManual = relationEntries.value.filter(
    (entry) => entry.mode === 'manual',
  );

  const mapped = cis.map((ci) => {
    const hit = relationEntries.value.find(
      (entry) => entry.mode === 'selector' && entry.targetCiId === ci.id,
    );
    if (hit) {
      return hit;
    }
    ciSummaryCache.set(ci.id, {
      id: ci.id,
      displayName: ci.displayName,
      typeId: ci.typeId,
      typeName: ci.typeName,
    });
    return createRelationEntry(ci, 'selector');
  });

  relationEntries.value = [...existingManual, ...mapped];
  selectorOpen.value = false;
  syncSelectorSnapshot();
  mapped.forEach((entry) => {
    void ensureRelationDefinitionForEntry(entry);
  });
  message.success(`已选择 ${cis.length} 个关联CI`);
};

const handleSelectorCancel = () => {
  selectorOpen.value = false;
};

const addManualRelation = async () => {
  await loadRelationTypes();
  manualRelationForm.targetCiId = undefined;
  manualRelationModalOpen.value = true;
};

const confirmManualRelation = async () => {
  if (!manualRelationForm.targetCiId) {
    message.error('请输入目标CI ID');
    return;
  }

  const exists = relationEntries.value.some(
    (entry) =>
      entry.mode === 'manual' && entry.targetCiId === manualRelationForm.targetCiId,
  );
  if (exists) {
    message.warning('该目标CI已在关联列表中');
    return;
  }

  const summary = await fetchCiSummary(manualRelationForm.targetCiId);
  if (!summary) {
    message.error('未找到指定的CI，请确认ID是否正确');
    return;
  }

  const entry = createRelationEntry(
    {
      id: summary.id,
      typeId: summary.typeId,
      typeName: summary.typeName,
      displayName: summary.displayName,
    },
    'manual',
  );
  enrichRelationEntry(entry, summary);
  relationEntries.value.push(entry);
  manualRelationModalOpen.value = false;
  manualRelationForm.targetCiId = undefined;
  await ensureRelationDefinitionForEntry(entry);
  syncSelectorSnapshot();
  message.success('已添加关联CI');
};

const removeRelationEntry = (key: string) => {
  const entry = relationEntries.value.find((item) => item.key === key);
  if (!entry) {
    return;
  }

  if (entry.isNew) {
    relationEntries.value = relationEntries.value.filter((item) => item.key !== key);
  } else {
    entry.markedForDeletion = !entry.markedForDeletion;
  }

  syncSelectorSnapshot();
};

const loadExistingRelations = async (ciId: number) => {
  try {
    await loadRelationTypes();
    const relationData = await getCiRelationsApi({ id: ciId, depth: 1 });
    if (!relationData) {
      relationEntries.value = relationEntries.value.filter((entry) => entry.isNew);
      syncSelectorSnapshot();
      return;
    }

    const sourceRelations = relationData.sourceRelations ?? [];
    const targetRelations = relationData.targetRelations ?? [];

    const relatedIds = new Set<number>();
    sourceRelations.forEach((relation: any) => {
      const targetId = Number(
        (relation.target_ci_id ?? relation.targetCiId ?? relation.TargetCiId) || 0,
      );
      if (targetId > 0) {
        relatedIds.add(targetId);
      }
    });
    targetRelations.forEach((relation: any) => {
      const sourceId = Number(
        (relation.source_ci_id ?? relation.sourceCiId ?? relation.SourceCiId) || 0,
      );
      if (sourceId > 0) {
        relatedIds.add(sourceId);
      }
    });

    const summaryMap = await fetchCiSummaries(Array.from(relatedIds));

    const existingEntries: PendingRelation[] = [];

    sourceRelations.forEach((relation: any) => {
      const entry = createRelationEntryFromApi(relation, 'source_to_target');
      if (entry.targetCiId) {
        const summary = summaryMap.get(entry.targetCiId);
        if (summary) {
          enrichRelationEntry(entry, summary);
        }
        existingEntries.push(entry);
      }
    });

    targetRelations.forEach((relation: any) => {
      const entry = createRelationEntryFromApi(relation, 'target_to_source');
      if (entry.targetCiId) {
        const summary = summaryMap.get(entry.targetCiId);
        if (summary) {
          enrichRelationEntry(entry, summary);
        }
        existingEntries.push(entry);
      }
    });

    relationEntries.value = existingEntries;
    await Promise.all(existingEntries.map((entry) => ensureRelationDefinitionForEntry(entry)));
    syncSelectorSnapshot();
  } catch (error) {
    console.error('加载关联关系失败:', error);
  }
};

const buildRelationsPayload = (): CiRelationsData | undefined | null => {
  if (relationEntries.value.length === 0) {
    return undefined;
  }

  const missingRequired = relationEntries.value.some((entry) => {
    if (entry.markedForDeletion) return false;
    if (!entry.relationTypeId) return true;
    if (!entry.targetCiId) return true;
    return false;
  });

  if (missingRequired) {
    message.error('请为每条保留的关系补全目标CI和关系类型');
    return null;
  }

  const invalidModelRelation = relationEntries.value.some((entry) => {
    if (entry.markedForDeletion) return false;
    if (!entry.relationTypeId) return false;
    return !isRelationTypeSelectable(entry, entry.relationTypeId);
  });

  if (invalidModelRelation) {
    message.error('存在未在模型关系中配置的关联，请先在模型关系中维护后再保存');
    return null;
  }

  const createRelations: CiRelationCreateInfo[] = [];
  const updateRelations: CiRelationUpdateInfo[] = [];
  const deleteRelationIds: number[] = [];

  relationEntries.value.forEach((entry) => {
    if (entry.isNew) {
      if (entry.markedForDeletion) {
        return;
      }
      createRelations.push({
        target_ci_id: entry.targetCiId!,
        relation_type_id: entry.relationTypeId!,
        direction: entry.direction,
        relation_strength: entry.relationStrength,
        status: entry.status,
        discovery_source: 'manual',
      });
      return;
    }

    if (!entry.relationId) {
      return;
    }

    if (entry.markedForDeletion) {
      deleteRelationIds.push(entry.relationId);
      return;
    }

    const original = entry.original;
    const updatePayload: CiRelationUpdateInfo = {
      relation_id: entry.relationId,
    };

    if (original) {
      if (original.targetCiId !== entry.targetCiId && entry.targetCiId) {
        updatePayload.target_ci_id = entry.targetCiId;
      }
      if (
        original.relationTypeId !== entry.relationTypeId &&
        entry.relationTypeId !== null &&
        entry.relationTypeId !== undefined
      ) {
        updatePayload.relation_type_id = entry.relationTypeId;
      }
      if (original.relationStrength !== entry.relationStrength) {
        updatePayload.relation_strength = entry.relationStrength;
      }
      if (original.status !== entry.status) {
        updatePayload.status = entry.status;
      }
    } else {
      if (entry.targetCiId) {
        updatePayload.target_ci_id = entry.targetCiId;
      }
      if (entry.relationTypeId !== null && entry.relationTypeId !== undefined) {
        updatePayload.relation_type_id = entry.relationTypeId;
      }
      updatePayload.relation_strength = entry.relationStrength;
      updatePayload.status = entry.status;
    }

    if (Object.keys(updatePayload).length > 1) {
      updateRelations.push(updatePayload);
    }
  });

  if (
    createRelations.length === 0 &&
    updateRelations.length === 0 &&
    deleteRelationIds.length === 0
  ) {
    return undefined;
  }

  return {
    create_relations:
      createRelations.length > 0 ? createRelations : undefined,
    update_relations:
      updateRelations.length > 0 ? updateRelations : undefined,
    delete_relation_ids:
      deleteRelationIds.length > 0 ? deleteRelationIds : undefined,
  };
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
    const relationsPayload = buildRelationsPayload();
    if (relationsPayload === null) {
      loading.value = false;
      return;
    }

    if (isEditMode.value) {
      // 更新配置项
      const updateData: UpdateCisRequest = {
        id: props.id!,
        status: 1, // 默认状态为1
        attributes,
      };
      if (relationsPayload) {
        updateData.relations = relationsPayload;
      }
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
      if (relationsPayload) {
        createData.relations = relationsPayload;
      }
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
  resetRelationState();
  emit('update:open', false);
};

// 处理数据库初始化
const handleInitDatabase = async () => {
  try {
    initLoading.value = true;
    const result = await initCmdbDatabase();
    message.success('示例数据初始化成功！正在重新加载...');
    
    // 等待一下让初始化完成
    setTimeout(async () => {
      // 重新加载属性分组
      if (props.typeId) {
        await loadAttributeGroups();
      }
      initLoading.value = false;
    }, 1000);
    
  } catch (error) {
    console.error('初始化失败:', error);
    message.error('初始化失败，请检查后端服务状态');
    initLoading.value = false;
  }
};

// 监听弹窗打开状态
watch(
  () => props.open,
  async (newVal) => {
    if (newVal && props.typeId) {
      resetRelationState();
      await loadRelationTypes();
      // 先加载属性分组
      await loadAttributeGroups();
      // 如果是编辑模式，再加载编辑数据
      if (props.id) {
        await loadEditData();
      }
    } else if (!newVal) {
      resetRelationState();
    }
  },
  { immediate: true },
);

// 监听typeId变化
watch(
  () => props.typeId,
  () => {
    if (props.open && props.typeId) {
      resetRelationState();
      loadAttributeGroups();
    }
  },
);

watch(
  () => manualRelationModalOpen.value,
  (open) => {
    if (!open) {
      manualRelationForm.targetCiId = undefined;
    }
  },
);

watch(
  relationEntries,
  (entries) => {
    entries.forEach((entry) => {
      if (entry.markedForDeletion) return;
      if (!entry.targetTypeId) return;
      void ensureRelationDefinitionForEntry(entry);
    });
  },
  { deep: true },
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
        <!-- 调试信息 -->
        <div v-if="filteredAttributeGroups.length === 0" style="padding: 20px; text-align: center; color: #666;">
          <p>🔧 该CI类型暂未配置属性模板</p>
          <p>请联系管理员配置CI类型的属性定义</p>
          
          <div style="margin: 16px 0;">
            <Button 
              type="primary" 
              @click="handleInitDatabase"
              :loading="initLoading"
            >
              🚀 初始化示例数据
            </Button>
            <p style="margin-top: 8px; font-size: 12px; color: #999;">
              点击创建示例CI类型和属性配置
            </p>
          </div>
          
          <details style="margin-top: 12px; text-align: left;">
            <summary style="cursor: pointer; color: #1890ff;">技术信息 (点击展开)</summary>
            <div style="margin-top: 8px; font-size: 12px; color: #999;">
              <p>原始分组数量: {{ attributeGroups.length }}</p>
              <p>CI类型ID: {{ props.typeId }}</p>
              <p>是否编辑模式: {{ isEditMode }}</p>
            </div>
          </details>
        </div>

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
        <div class="relation-section">
          <Divider orientation="left">关联关系</Divider>
          <div class="relation-actions">
            <Space>
              <Button type="primary" @click="openRelationSelector">
                通过选择器或规则添加
              </Button>
              <Button @click="addManualRelation">手动输入ID</Button>
            </Space>
            <span class="relation-hint">
              {{
                isEditMode
                  ? '已存在的关系会在此处列出，可新增、修改或标记删除。'
                  : '使用选择器批量筛选现有CI，或直接输入ID 建立关联。'
              }}
            </span>
          </div>

          <div v-if="relationEntries.length === 0" class="relation-empty">
            <p>{{ isEditMode ? '该CI尚无关联关系。' : '尚未添加关联关系。' }}</p>
            <p class="relation-empty-sub">创建后可在关系列表中进一步维护。</p>
          </div>

          <div v-else class="relation-list">
            <div
              v-for="entry in relationEntries"
              :key="entry.key"
              class="relation-item"
              :class="{
                'relation-item--deleted': entry.markedForDeletion,
                'relation-item--existing': !entry.isNew,
              }"
            >
              <div class="relation-target">
                <Tag color="blue">{{ entry.targetTypeName || 'CI' }}</Tag>
                <span class="relation-name">{{ entry.targetDisplay }}</span>
                <span class="relation-id">ID: {{ entry.targetCiId }}</span>
                <Tooltip v-if="!entry.isNew && !entry.markedForDeletion" title="历史关联">
                  <Tag color="geekblue">已存在</Tag>
                </Tooltip>
                <Tooltip v-if="entry.markedForDeletion" title="保存后将删除该关系">
                  <Tag color="red">将删除</Tag>
                </Tooltip>
                <Tooltip v-if="entry.mode === 'manual'" title="手动添加">
                  <Tag color="default" style="margin-left: 8px">手动</Tag>
                </Tooltip>
              </div>
              <div class="relation-controls">
                <Select
                  v-model:value="entry.relationTypeId"
                  placeholder="选择关系类型"
                  style="min-width: 200px"
                  :disabled="entry.markedForDeletion"
                >
                  <Select.Option
                    v-for="type in relationTypes"
                    :key="type.id"
                    :value="type.id"
                    :disabled="entry.markedForDeletion || !isRelationTypeSelectable(entry, type.id)"
                  >
                    <span>{{ type.name }}</span>
                    <span v-if="type.alias" class="relation-type-alias">
                      ({{ type.alias }})
                    </span>
                  </Select.Option>
                </Select>
                <div
                  v-if="
                    !entry.markedForDeletion &&
                    entry.relationTypeId &&
                    !isRelationTypeSelectable(entry, entry.relationTypeId)
                  "
                  class="relation-warning"
                >
                  未配置对应模型关系，请先在模型关系中维护
                </div>
                <div
                  v-else-if="
                    !entry.markedForDeletion &&
                    entry.targetTypeId &&
                    !hasRelationDefinition(entry)
                  "
                  class="relation-warning"
                >
                  当前方向暂无可用的模型关系
                </div>

                <Radio.Group v-model:value="entry.direction">
                  <Radio
                    value="source_to_target"
                    :disabled="
                      entry.markedForDeletion ||
                      (!entry.isNew && entry.direction !== 'source_to_target') ||
                      !canUseDirection(entry, 'source_to_target')
                    "
                  >
                    当前 → 目标
                  </Radio>
                  <Radio
                    value="target_to_source"
                    :disabled="
                      entry.markedForDeletion ||
                      (!entry.isNew && entry.direction !== 'target_to_source') ||
                      !canUseDirection(entry, 'target_to_source')
                    "
                  >
                    目标 → 当前
                  </Radio>
                </Radio.Group>

                <Select
                  v-model:value="entry.relationStrength"
                  style="width: 120px"
                  :disabled="entry.markedForDeletion"
                >
                  <Select.Option
                    v-for="option in relationStrengthOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </Select.Option>
                </Select>

                <Select
                  v-model:value="entry.status"
                  style="width: 120px"
                  :disabled="entry.markedForDeletion"
                >
                  <Select.Option
                    v-for="option in relationStatusOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </Select.Option>
                </Select>

                <Button type="link" danger @click="removeRelationEntry(entry.key)">
                  {{
                    entry.isNew
                      ? '移除'
                      : entry.markedForDeletion
                        ? '撤销删除'
                        : '标记删除'
                  }}
                </Button>
              </div>
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

  <CiSelector
    :open="selectorOpen"
    :multiple="true"
    title="选择关联CI"
    :selected-cis="selectorSelectedCis"
    @update:open="(value) => (selectorOpen = value)"
    @confirm="handleSelectorConfirm"
    @cancel="handleSelectorCancel"
  />

  <Modal
    v-model:open="manualRelationModalOpen"
    title="手动添加关联CI"
    @ok="confirmManualRelation"
    @cancel="() => (manualRelationModalOpen = false)"
  >
    <Form layout="vertical">
      <Form.Item label="目标CI ID" required>
        <InputNumber
          v-model:value="manualRelationForm.targetCiId"
          style="width: 100%"
          :min="1"
          placeholder="请输入已有CI的ID"
        />
      </Form.Item>
      <p class="manual-hint">
        系统将以当前CI作为{{ relationDirectionOptions[0].label }}创建关系，可在列表中调整方向。
      </p>
    </Form>
  </Modal>
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

.relation-section {
  margin-top: 32px;
  border-top: 1px solid #f0f0f0;
  padding-top: 24px;
}

.relation-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.relation-hint {
  font-size: 12px;
  color: #666;
}

.relation-empty {
  padding: 24px;
  text-align: center;
  color: #888;
  background: #fafafa;
  border-radius: 8px;
}

.relation-empty-sub {
  margin-top: 4px;
  font-size: 12px;
}

.relation-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.relation-item {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.relation-target {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.relation-name {
  font-weight: 600;
}

.relation-id {
  font-size: 12px;
  color: #999;
}

.relation-warning {
  margin-top: 4px;
  color: #d4380d;
  font-size: 12px;
}

.relation-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.relation-type-alias {
  margin-left: 4px;
  font-size: 12px;
  color: #999;
}

.relation-item--existing {
  border-left: 4px solid #5470ff;
}

.relation-item--deleted {
  background: #fff1f0;
  border-color: #ffa39e;
  opacity: 0.85;
}

.manual-hint {
  font-size: 12px;
  color: #888;
}
</style>
