<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import {
  EyeOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  QrcodeOutlined,
  SettingOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Descriptions,
  Empty,
  Input,
  Table,
  message,
  Modal,
  Select,
  Spin,
  Tag,
} from 'ant-design-vue';
import type { ColumnsType } from 'ant-design-vue/es/table';
// 导入二维码生成库
import QRCode from 'qrcode-generator';

// @ts-ignore
import { listAttributeGroupWithAttribute } from '#/api/cmdb/ci_types';
// @ts-ignore
import { getConfigItemById, getCisDetail } from '#/api/cmdb/cis';
// @ts-ignore
import { getCiRelationsApi, getRelationTypesApi } from '#/api/cmdb/cis/relation';

interface Props {
  ciId?: number;
  typeId?: number;
  typeName?: string;
  visible: boolean;
}

type RelationDirection = 'outgoing' | 'incoming';

const directionDisplayMap: Record<RelationDirection, {
  title: string;
  label: string;
  tagColor: string;
  accentClass: string;
}> = {
  outgoing: {
    title: '下游（出向）',
    label: '当前CI → 关联CI',
    tagColor: 'blue',
    accentClass: 'accent-outgoing',
  },
  incoming: {
    title: '上游（入向）',
    label: '关联CI → 当前CI',
    tagColor: 'purple',
    accentClass: 'accent-incoming',
  },
};

interface CiSummary {
  id: number;
  displayName: string;
  typeId: number;
  typeName: string;
}

interface RelationDisplayItem {
  key: string;
  ciId: number;
  name: string;
  typeId?: number;
  typeName?: string;
  relationId?: number;
  relationTypeId?: number;
  relationTypeName?: string;
  relationStrength?: string;
  status?: string;
  direction: RelationDirection;
}

interface RelationGroup {
  key: string;
  label: string;
  direction: RelationDirection;
  relationTypeId?: number;
  targetTypeId?: number;
  count: number;
  relations: RelationDisplayItem[];
}

interface RelationMenuSection {
  direction: RelationDirection;
  title: string;
  total: number;
  items: RelationGroup[];
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'view-ci', payload: { ciId: number; typeId?: number }): void }>();

// 路由实例
const router = useRouter();

// 响应式数据
const loading = ref(false);
const ciData = ref<any>(null);
const attributeGroups = ref<any[]>([]);
const relationLoading = ref(false);
const relationGroups = ref<RelationGroup[]>([]);
const activeRelationGroupKey = ref('');
const relationTypeMap = ref(new Map<number, { name: string; alias?: string }>());

const ciSummaryCache = new Map<number, CiSummary>();

// 分享和二维码相关
const showShareModal = ref(false);
const showQrModal = ref(false);
const shareUrl = ref('');
const qrCodeData = ref('');
const qrCodeImageUrl = ref('');

// 列数设置
const columnsCount = ref(3);
const columnOptions = [
  { label: '1列', value: 1 },
  { label: '2列', value: 2 },
  { label: '3列', value: 3 },
  { label: '4列', value: 4 },
];

const totalRelationCount = computed(() =>
  relationGroups.value.reduce((sum, group) => sum + group.count, 0),
);

const activeRelationGroup = computed(() =>
  relationGroups.value.find((group) => group.key === activeRelationGroupKey.value) ?? null,
);

const activeRelationItems = computed(
  () => activeRelationGroup.value?.relations ?? [],
);

const outgoingRelationCount = computed(() =>
  relationGroups.value
    .filter((group) => group.direction === 'outgoing')
    .reduce((total, group) => total + group.count, 0),
);

const incomingRelationCount = computed(() =>
  relationGroups.value
    .filter((group) => group.direction === 'incoming')
    .reduce((total, group) => total + group.count, 0),
);

const relationMenuSections = computed<RelationMenuSection[]>(() => {
  const sections: RelationMenuSection[] = [];
  const outgoingItems = relationGroups.value.filter((group) => group.direction === 'outgoing');
  const incomingItems = relationGroups.value.filter((group) => group.direction === 'incoming');

  if (outgoingItems.length > 0) {
    sections.push({
      direction: 'outgoing',
      title: directionDisplayMap.outgoing.title,
      total: outgoingItems.reduce((sum, group) => sum + group.count, 0),
      items: outgoingItems,
    });
  }

  if (incomingItems.length > 0) {
    sections.push({
      direction: 'incoming',
      title: directionDisplayMap.incoming.title,
      total: incomingItems.reduce((sum, group) => sum + group.count, 0),
      items: incomingItems,
    });
  }

  return sections;
});

const normalizeKeyVariants = (key: string): string[] => {
  const variants = new Set<string>();
  variants.add(key);
  if (key.includes('_')) {
    variants.add(key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()));
  }
  if (/[A-Z]/.test(key)) {
    variants.add(
      key
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()
        .replace(/^_/, ''),
    );
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

const toSafeNumber = (value: any): number | undefined => {
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const deriveDisplayName = (ciInfo: any, attributes: any[], fallbackId: number): string => {
  const attributeArray = Array.isArray(attributes) ? attributes : [];

  for (const attr of attributeArray) {
    const isDefault =
      pickFieldValue(attr, 'defaultShow') ?? pickFieldValue(attr, 'isDefaultShow');
    if (isDefault) {
      const value = pickFieldValue(attr, 'value');
      if (value !== undefined) {
        return String(value);
      }
    }
  }

  const candidateFields = ['display_name', 'displayName', 'name', 'hostname', 'ip', 'title', 'label'];
  for (const field of candidateFields) {
    const value = pickFieldValue(ciInfo, field);
    if (value !== undefined) {
      return String(value);
    }
  }

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
    const attributes = ciInfo.attributes ?? ciInfo.Attributes ?? [];
    const displayName = deriveDisplayName(ciInfo, attributes, ciId);

    const typeIdValue =
      pickFieldValue(ciInfo, 'typeId') ?? pickFieldValue(ciInfo, 'type_id');
    const typeId = toSafeNumber(typeIdValue) ?? 0;
    const typeName =
      (pickFieldValue(detailData, 'ciTypeName') ?? pickFieldValue(ciInfo, 'typeName')) ||
      `类型-${typeId || '-'}`;

    if (!typeId) {
      return null;
    }

    const summary: CiSummary = {
      id: ciId,
      displayName,
      typeId,
      typeName: String(typeName),
    };

    ciSummaryCache.set(ciId, summary);
    return summary;
  } catch (error) {
    console.error('获取CI概要信息失败:', error);
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

const formatRelationStatus = (value?: string) => {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized === 'active') return '激活';
  if (normalized === 'inactive') return '未激活';
  return value;
};

const formatRelationStrength = (value?: string) => {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized === 'weak') return '弱';
  if (normalized === 'normal') return '正常';
  if (normalized === 'strong') return '强';
  return value;
};

const getStatusColor = (status?: string) => {
  if (!status) return 'default';
  if (status === '激活') return 'green';
  if (status === '未激活') return 'gold';
  return 'blue';
};

const getStrengthColor = (strength?: string) => {
  if (!strength) return 'default';
  if (strength === '强') return 'red';
  if (strength === '弱') return 'orange';
  return 'blue';
};

// 生成分享链接
const generateShareUrl = () => {
  if (!props.ciId || !props.typeId) {
    message.error('缺少必要参数');
    return;
  }

  // 使用router.resolve生成正确的URL
  const routeResult = router.resolve({
    path: '/cmdb/cis',
    query: {
      ciId: props.ciId.toString(),
      typeId: props.typeId.toString(),
      typeName: props.typeName || '',
      action: 'viewDetail',
    },
  });

  // 生成完整的分享链接
  shareUrl.value = `${window.location.origin}${routeResult.href}`;
};

// 生成二维码数据和图片
const generateQrCodeData = () => {
  if (!props.ciId || !ciData.value) {
    message.error('缺少资产数据');
    return;
  }

  // 获取关键属性信息
  const keyAttributes: any = {};
  if (ciData.value.attributes) {
    ciData.value.attributes.forEach((attr: any) => {
      // 只保留重要的属性
      if (
        ['hostname', 'ip', 'mgmt_ip', 'model', 'name', 'sn', 'vendor'].includes(
          attr.attrName,
        )
      ) {
        keyAttributes[attr.attrName] = attr.value || attr.rawValue;
      }
    });
  }

  const qrData = {
    platform: 'Newbee-OPS',
    action: 'viewAsset',
    assetId: props.ciId,
    assetType: props.typeName || 'CI',
    typeId: props.typeId,
    timestamp: Date.now(),
    url: shareUrl.value,
    keyInfo: keyAttributes,
  };

  qrCodeData.value = JSON.stringify(qrData, null, 2);

  // 生成二维码图片
  try {
    const qr = QRCode(0, 'M');
    qr.addData(shareUrl.value); // 使用分享链接作为二维码内容，更简洁
    qr.make();

    // 创建Canvas来绘制二维码
    const canvas = document.createElement('canvas');
    const cellSize = 4;
    const margin = 4;
    const size = qr.getModuleCount();
    const canvasSize = size * cellSize + margin * 2;

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // 绘制白色背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // 绘制二维码
      ctx.fillStyle = '#000000';
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (qr.isDark(row, col)) {
            ctx.fillRect(
              col * cellSize + margin,
              row * cellSize + margin,
              cellSize,
              cellSize,
            );
          }
        }
      }

      // 转换为Data URL
      qrCodeImageUrl.value = canvas.toDataURL('image/png');
    }
  } catch (error) {
    console.error('生成二维码失败:', error);
    message.error('生成二维码失败');

    // 如果二维码生成失败，至少显示文本数据
    qrCodeImageUrl.value = '';
  }
};

// 处理资产分享
const handleShareAsset = () => {
  generateShareUrl();
  showShareModal.value = true;
};

// 处理生成二维码
const handleGenerateQrCode = () => {
  generateShareUrl();
  generateQrCodeData();
  showQrModal.value = true;
};

// 复制到剪贴板 - 改进版本
const copyToClipboard = async (text: string) => {
  try {
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      message.success('已复制到剪贴板');
      return;
    }

    // 回退方案：使用传统方法
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.append(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    textArea.remove();

    if (successful) {
      message.success('已复制到剪贴板');
    } else {
      throw new Error('复制命令执行失败');
    }
  } catch (error) {
    console.error('复制失败:', error);
    message.error('复制失败，请手动选择文本复制');

    // 最后的回退：自动选中文本
    try {
      const range = document.createRange();
      const selection = window.getSelection();
      // 这里可以尝试选中对应的文本元素
      if (selection) {
        selection.removeAllRanges();
        message.info('请手动选择文本进行复制');
      }
    } catch (selectError) {
      console.error('文本选择失败:', selectError);
    }
  }
};

// 生命周期钩子
onMounted(() => {
  // 初始化时不需要监听窗口大小变化
});

onUnmounted(() => {
  // 清理二维码图片URL（如果是Blob URL才需要revoke）
  if (qrCodeImageUrl.value && qrCodeImageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(qrCodeImageUrl.value);
  }
});

// 计算属性：处理后的属性数据
const computedProcessedAttributes = computed(() => {
  if (!ciData.value?.attributes || attributeGroups.value.length === 0) {
    return [];
  }

  // 创建属性值映射
  const attributeValueMap = new Map();
  ciData.value.attributes.forEach((attr: any) => {
    attributeValueMap.set(attr.attrName, attr);
  });

  // 按分组组织属性
  return attributeGroups.value
    .map((group) => ({
      ...group,
      items: (group.items || [])
        .map((item: any) => {
          if (!item.attribute) return null;

          const attrValue = attributeValueMap.get(item.attribute.name);
          return {
            ...item,
            attributeValue: attrValue || null,
          };
        })
        .filter(Boolean)
        .sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0)),
    }))
    .sort((a, b) => (a.sort || 0) - (b.sort || 0));
});

// 加载CI详情数据
const loadCiData = async () => {
  if (!props.ciId) return;

  try {
    loading.value = true;
    const ci_id = parseInt(props.ciId as string, 10);
    const response = await getConfigItemById(ci_id);
    if (response) {
      ciData.value = response;
      console.log('CI详情数据:', response);
    }
  } catch (error) {
    console.error('加载CI详情失败:', error);
    message.error('加载CI详情失败');
  } finally {
    loading.value = false;
  }
};

// 加载属性分组定义
const loadAttributeGroups = async () => {
  if (!props.typeId) return;

  try {
    const response = await listAttributeGroupWithAttribute(props.typeId);
    if (response && Array.isArray(response)) {
      attributeGroups.value = response;
      console.log('属性分组数据:', response);
    }
  } catch (error) {
    console.error('加载属性分组失败:', error);
    message.error('加载属性分组失败');
  }
};

const ensureRelationTypes = async () => {
  if (relationTypeMap.value.size > 0) {
    return;
  }

  try {
    const response = await getRelationTypesApi({ page: 1, pageSize: 1000 });
    const candidate = (response as any)?.data ?? response;
    const rawList = Array.isArray(candidate)
      ? candidate
      : Array.isArray(candidate?.data)
      ? candidate.data
      : Array.isArray(candidate?.list)
      ? candidate.list
      : [];

    const map = new Map<number, { name: string; alias?: string }>();
    rawList.forEach((item: any) => {
      const id = toSafeNumber(pickFieldValue(item, 'id'));
      if (!id) return;
      const name = String(pickFieldValue(item, 'name') ?? `关系类型 ${id}`);
      const alias = pickFieldValue(item, 'alias');
      map.set(id, { name, alias: alias ? String(alias) : undefined });
    });

    relationTypeMap.value = map;
  } catch (error) {
    console.error('加载关系类型失败:', error);
  }
};

const selectRelationGroup = (key: string) => {
  activeRelationGroupKey.value = key;
};

const handleRelationItemClick = (item: RelationDisplayItem) => {
  emit('view-ci', { ciId: item.ciId, typeId: item.typeId });
};

const relationTableColumns: ColumnsType<RelationDisplayItem> = [
  {
    title: '关联实例',
    dataIndex: 'name',
    key: 'instance',
  },
  {
    title: '关联模型',
    dataIndex: 'typeName',
    key: 'type',
  },
  {
    title: '关系类型',
    dataIndex: 'relationTypeName',
    key: 'relationTypeName',
  },
  {
    title: '方向',
    dataIndex: 'direction',
    key: 'direction',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '强度',
    dataIndex: 'relationStrength',
    key: 'relationStrength',
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
  },
];

const relationTablePagination = computed(() => {
  const pageSize = 8;
  return activeRelationItems.value.length > pageSize
    ? { pageSize, showSizeChanger: false, showQuickJumper: false }
    : false;
});

const loadRelationData = async () => {
  if (!props.ciId) {
    relationGroups.value = [];
    activeRelationGroupKey.value = '';
    return;
  }

  relationLoading.value = true;
  try {
    await ensureRelationTypes();

    const response = await getCiRelationsApi({ id: props.ciId, depth: 1 });
    const data = (response as any)?.data ?? response;
    const sourceRelations =
      data?.sourceRelations ?? data?.source_relations ?? data?.SourceRelations ?? [];
    const targetRelations =
      data?.targetRelations ?? data?.target_relations ?? data?.TargetRelations ?? [];

    const relationEntries: Array<{
      record: any;
      direction: RelationDirection;
      relationId?: number;
      relationTypeId?: number;
      otherCiId: number;
    }> = [];
    const summaryIds = new Set<number>();

    const pushRelation = (record: any, direction: RelationDirection) => {
      const relationId =
        toSafeNumber(pickFieldValue(record, 'id')) ??
        toSafeNumber(pickFieldValue(record, 'relationId'));
      const relationTypeId =
        toSafeNumber(pickFieldValue(record, 'relationTypeId')) ??
        toSafeNumber(pickFieldValue(record, 'relation_type_id'));
      const sourceId =
        toSafeNumber(pickFieldValue(record, 'sourceCiId')) ??
        toSafeNumber(pickFieldValue(record, 'source_ci_id'));
      const targetId =
        toSafeNumber(pickFieldValue(record, 'targetCiId')) ??
        toSafeNumber(pickFieldValue(record, 'target_ci_id'));

      const otherCiId = direction === 'outgoing' ? targetId : sourceId;
      if (!otherCiId) {
        return;
      }

      summaryIds.add(otherCiId);
      relationEntries.push({
        record,
        direction,
        relationId,
        relationTypeId,
        otherCiId,
      });
    };

    sourceRelations.forEach((item: any) => pushRelation(item, 'outgoing'));
    targetRelations.forEach((item: any) => pushRelation(item, 'incoming'));

    const summaryMap = await fetchCiSummaries(Array.from(summaryIds));
    const groupsMap = new Map<string, RelationGroup>();

    relationEntries.forEach((entry, index) => {
      const summary = summaryMap.get(entry.otherCiId);
      const typeId = summary?.typeId;
      const typeName = summary?.typeName ?? `类型-${typeId ?? '-'}`;
      const relationTypeId = entry.relationTypeId;
      const relationTypeInfo = relationTypeId
        ? relationTypeMap.value.get(relationTypeId)
        : undefined;
      const relationTypeLabel =
        relationTypeInfo?.alias || relationTypeInfo?.name ||
        (relationTypeId ? `关系类型 ${relationTypeId}` : '未分类关系');
      const arrow = entry.direction === 'outgoing' ? '→' : '←';
      const groupKey = `${entry.direction}::${relationTypeId ?? 'none'}::${typeId ?? 'unknown'}`;

      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, {
          key: groupKey,
          label: `${relationTypeLabel} ${arrow} ${typeName}`,
          direction: entry.direction,
          relationTypeId,
          targetTypeId: typeId,
          count: 0,
          relations: [],
        });
      }

      const group = groupsMap.get(groupKey)!;
      const strength = pickFieldValue(entry.record, 'relationStrength') ??
        pickFieldValue(entry.record, 'relation_strength');
      const status = pickFieldValue(entry.record, 'status');

      const item: RelationDisplayItem = {
        key: `${entry.otherCiId}-${entry.direction}-${relationTypeId ?? 'none'}-${index}`,
        ciId: entry.otherCiId,
        name: summary?.displayName ?? `CI-${entry.otherCiId}`,
        typeId,
        typeName,
        relationId: entry.relationId,
        relationTypeId,
        relationTypeName: relationTypeLabel,
        relationStrength: formatRelationStrength(strength ? String(strength) : undefined),
        status: formatRelationStatus(status ? String(status) : undefined),
        direction: entry.direction,
      };

      group.relations.push(item);
      group.count += 1;
    });

    const groups = Array.from(groupsMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label, 'zh-Hans'),
    );

    relationGroups.value = groups;
    if (groups.length > 0) {
      const currentKeys = groups.map((group) => group.key);
      if (!currentKeys.includes(activeRelationGroupKey.value)) {
        activeRelationGroupKey.value = groups[0].key;
      }
    } else {
      activeRelationGroupKey.value = '';
    }
  } catch (error) {
    console.error('加载关联关系失败:', error);
    relationGroups.value = [];
    activeRelationGroupKey.value = '';
  } finally {
    relationLoading.value = false;
  }
};

// 格式化属性值显示
const formatAttributeValue = (attr: any, valueData: any) => {
  if (!valueData) return '-';

  const value =
    valueData.rawValue === undefined ? valueData.value : valueData.rawValue;

  if (value === null || value === undefined || value === '') {
    return '-';
  }

  // 如果是选择类型，显示对应的label而不是value
  if (attr.isChoice && attr.choices && value) {
    const choice = attr.choices.find((c: any) => c.value === value);
    if (choice?.meta?.label) {
      return choice.meta.label;
    }
  }

  // 根据属性类型格式化显示
  switch (attr.valueType) {
    case 'boolean': {
      return value ? '是' : '否';
    }
    case 'password': {
      return '******';
    } // 密码类型隐藏显示
    case 'json': {
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch {
        return value;
      }
    }
    default: {
      return value;
    }
  }
};

// 获取属性值的Tag颜色
const getValueTagColor = (attr: any, valueData: any) => {
  if (!valueData) return 'default';

  // 如果是选择类型，查找对应的样式
  if (attr.isChoice && attr.choices) {
    const choice = attr.choices.find((c: any) => c.value === valueData.value);
    if (choice?.meta?.style?.bgColor) {
      return choice.meta.style.bgColor;
    }
  }

  // 根据类型返回默认颜色
  switch (attr.valueType) {
    case 'boolean': {
      return valueData.value ? 'green' : 'red';
    }
    case 'password': {
      return 'orange';
    }
    default: {
      return 'blue';
    }
  }
};

// 监听visible变化，加载数据
watch(
  () => [props.visible, props.ciId, props.typeId],
  ([visible, ciId, typeId]) => {
    if (visible && ciId && typeId) {
      loadAttributeGroups();
      loadCiData();
      void loadRelationData();
    } else if (!visible) {
      relationGroups.value = [];
      activeRelationGroupKey.value = '';
    }
  },
  { immediate: true },
);
</script>

<script lang="ts">
export default {
  name: 'CiAttributesTab',
};
</script>

<template>
  <div class="ci-attributes-tab">
    <Spin :spinning="loading">
      <!-- 空状态 -->
      <div
        v-if="!loading && (!ciData || attributeGroups.length === 0)"
        class="empty-state"
      >
        <Empty
          description="暂无属性数据"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
        />
      </div>

      <!-- 属性分组展示 -->
      <div v-else class="attributes-content">
        <!-- 控制栏 -->
        <div class="control-bar">
          <!-- 操作按钮组 -->
          <div class="action-buttons">
            <Button size="small" @click="handleShareAsset">
              <LinkOutlined />
              分享
            </Button>
            <Button size="small" @click="handleGenerateQrCode">
              <QrcodeOutlined />
              二维码
            </Button>
          </div>

          <!-- 列数设置控件 -->
          <div class="columns-control">
            <div class="control-label">
              <SettingOutlined class="control-icon" />
              <span>列数</span>
            </div>
            <Select
              v-model:value="columnsCount"
              :options="columnOptions"
              size="small"
              style="width: 80px"
            />
          </div>
        </div>

        <div
          v-for="group in computedProcessedAttributes"
          :key="group.groupId"
          class="attribute-group"
        >
          <!-- 分组标题 -->
          <div class="group-header">
            <div class="group-title">
              <span>{{ group.name }}</span>
            </div>
          </div>

          <!-- 使用Descriptions组件展示属性 -->
          <Descriptions
            :column="Math.min(columnsCount, group.items?.length || 1)"
            size="small"
            bordered
            :label-style="{
              fontWeight: '500',
              color: '#595959',
              fontSize: '14px',
              width: '130px',
              minWidth: '130px',
              padding: '10px 14px',
              backgroundColor: '#fafafa',
            }"
            :content-style="{
              fontSize: '14px',
              color: '#262626',
              padding: '10px 14px',
            }"
            class="custom-descriptions"
          >
            <Descriptions.Item
              v-for="item in group.items"
              :key="item.id"
              :span="
                item.attribute.valueType === 'json'
                  ? Math.min(columnsCount, group.items?.length || 1)
                  : 1
              "
            >
              <template #label>
                <div class="attribute-label-wrapper">
                  {{ item.attribute.alias }}
                  <!-- 计算字段标签 -->
                  <Tag
                    v-if="item.attribute.isComputed"
                    color="orange"
                    size="small"
                    class="computed-tag"
                  >
                    计算
                  </Tag>
                </div>
              </template>

              <div class="attribute-value-wrapper">
                <!-- 选择类型的特殊显示 -->
                <Tag
                  v-if="item.attribute.isChoice && item.attributeValue"
                  :color="getValueTagColor(item.attribute, item.attributeValue)"
                  class="choice-tag"
                  :title="
                    formatAttributeValue(item.attribute, item.attributeValue)
                  "
                >
                  <EyeOutlined class="value-icon" />
                  {{
                    formatAttributeValue(item.attribute, item.attributeValue)
                  }}
                </Tag>

                <!-- JSON类型的特殊显示 -->
                <pre
                  v-else-if="
                    item.attribute.valueType === 'json' && item.attributeValue
                  "
                  class="json-value"
                  >{{
                    formatAttributeValue(item.attribute, item.attributeValue)
                  }}
                </pre>

                <!-- 普通类型显示 -->
                <span
                  v-else
                  class="normal-value"
                  :class="{
                    'empty-value':
                      !item.attributeValue ||
                      formatAttributeValue(
                        item.attribute,
                        item.attributeValue,
                      ) === '-',
                  }"
                  :title="
                    formatAttributeValue(item.attribute, item.attributeValue)
                  "
                >
                  {{
                    formatAttributeValue(item.attribute, item.attributeValue)
                  }}
                </span>
              </div>
            </Descriptions.Item>
          </Descriptions>
        </div>

        <div class="relation-section">
          <div class="relation-header">
            <div>
              <div class="relation-title">关联模型关系</div>
              <div class="relation-subtitle">
                从上下游视角洞察模型关联，快速定位关键实例
              </div>
            </div>
            <div class="relation-overview" v-if="totalRelationCount">
              <div class="relation-overview-item">
                <span class="label">关联总数</span>
                <span class="value">{{ totalRelationCount }}</span>
              </div>
              <div class="relation-overview-split"></div>
              <div class="relation-overview-item">
                <span class="dot outgoing"></span>
                <span class="label">下游</span>
                <span class="value">{{ outgoingRelationCount }}</span>
              </div>
              <div class="relation-overview-item">
                <span class="dot incoming"></span>
                <span class="label">上游</span>
                <span class="value">{{ incomingRelationCount }}</span>
              </div>
            </div>
          </div>
          <Spin :spinning="relationLoading">
            <div
              v-if="!relationLoading && relationGroups.length === 0"
              class="relation-empty"
            >
              <Empty
                description="暂无关联模型关系"
                :image="Empty.PRESENTED_IMAGE_SIMPLE"
              />
            </div>
            <div v-else class="relation-layout">
              <div class="relation-sidebar">
                <div class="relation-summary-card">
                  <div class="summary-header">关联概览</div>
                  <div class="summary-total">{{ totalRelationCount }}</div>
                  <div class="summary-metric">
                    <span class="metric-label">
                      <span class="dot outgoing"></span>
                      下游关联
                    </span>
                    <span class="metric-value">{{ outgoingRelationCount }}</span>
                  </div>
                  <div class="summary-metric">
                    <span class="metric-label">
                      <span class="dot incoming"></span>
                      上游关联
                    </span>
                    <span class="metric-value">{{ incomingRelationCount }}</span>
                  </div>
                </div>

                <div
                  v-for="section in relationMenuSections"
                  :key="section.direction"
                  class="relation-menu-section"
                >
                  <div class="section-header">
                    <span class="section-title">{{ section.title }}</span>
                    <span class="section-count">{{ section.total }} 个</span>
                  </div>
                  <div class="section-body">
                    <div
                      v-for="group in section.items"
                      :key="group.key"
                      class="relation-menu-item"
                      :class="[
                        { active: group.key === activeRelationGroupKey },
                        directionDisplayMap[group.direction].accentClass,
                      ]"
                      @click="selectRelationGroup(group.key)"
                    >
                      <div class="menu-item-title">{{ group.label }}</div>
                      <div class="menu-item-meta">{{ group.count }} 条关联</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="relation-list">
                <Table
                  bordered
                  size="middle"
                  :columns="relationTableColumns"
                  :data-source="activeRelationItems"
                  :pagination="relationTablePagination"
                  :row-key="(record) => record.key"
                  class="relation-table"
                >
                  <template #emptyText>
                    <Empty
                      description="请选择左侧关系类型"
                      :image="Empty.PRESENTED_IMAGE_SIMPLE"
                    />
                  </template>
                  <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'instance'">
                      <div class="relation-table-instance">
                        <div class="instance-name" :title="record.name">
                          {{ record.name }}
                        </div>
                        <Tag v-if="record.typeName" color="processing" class="instance-type">
                          {{ record.typeName }}
                        </Tag>
                      </div>
                    </template>
                    <template v-else-if="column.key === 'type'">
                      <span class="relation-table-text" :title="record.typeName || '-'">
                        {{ record.typeName || '-' }}
                      </span>
                    </template>
                    <template v-else-if="column.key === 'relationTypeName'">
                      <span class="relation-table-text" :title="record.relationTypeName || '-'">
                        {{ record.relationTypeName || '-' }}
                      </span>
                    </template>
                    <template v-else-if="column.key === 'direction'">
                      <Tag :color="directionDisplayMap[record.direction].tagColor">
                        {{ directionDisplayMap[record.direction].label }}
                      </Tag>
                    </template>
                    <template v-else-if="column.key === 'status'">
                      <Tag v-if="record.status" :color="getStatusColor(record.status)">
                        {{ record.status }}
                      </Tag>
                      <span v-else class="relation-table-text">-</span>
                    </template>
                    <template v-else-if="column.key === 'relationStrength'">
                      <Tag v-if="record.relationStrength" :color="getStrengthColor(record.relationStrength)">
                        {{ record.relationStrength }}
                      </Tag>
                      <span v-else class="relation-table-text">-</span>
                    </template>
                    <template v-else-if="column.key === 'actions'">
                      <Button type="link" size="small" @click="handleRelationItemClick(record)">
                        查看详情
                      </Button>
                    </template>
                  </template>
                </Table>
              </div>
            </div>
          </Spin>
        </div>
      </div>
    </Spin>

    <!-- 分享链接弹窗 -->
    <Modal
      :open="showShareModal"
      title="分享资产"
      :footer="null"
      width="600px"
      @update:open="(val) => (showShareModal = val)"
    >
      <div class="share-content">
        <p>复制以下链接分享此资产：</p>
        <div class="share-url-container">
          <Input :value="shareUrl" readonly class="share-url-input" />
          <Button type="primary" @click="copyToClipboard(shareUrl)">
            复制链接
          </Button>
        </div>
        <p class="share-tip">
          <InfoCircleOutlined style="margin-right: 4px; color: #1890ff" />
          用户点击链接后将直接跳转到资产列表页面并打开此资产的详情
        </p>
      </div>
    </Modal>

    <!-- 二维码弹窗 -->
    <Modal
      :open="showQrModal"
      title="资产二维码"
      :footer="null"
      width="500px"
      @update:open="(val) => (showQrModal = val)"
    >
      <div class="qr-content">
        <div class="qr-info">
          <h4>资产二维码</h4>
          <p>扫描此二维码可直接访问资产详情页面</p>
        </div>
        <div class="qr-data-container">
          <!-- 左右分栏布局 -->
          <div class="qr-layout">
            <!-- 左侧：二维码图片 -->
            <div class="qr-image-section">
              <img
                v-if="qrCodeImageUrl"
                :src="qrCodeImageUrl"
                alt="资产二维码"
                class="qr-image"
              />
              <div v-else class="qr-loading">生成二维码中...</div>
            </div>

            <!-- 右侧：操作区域 -->
            <div class="qr-operations">
              <!-- 操作按钮 -->
              <div class="qr-actions">
                <Button
                  type="primary"
                  @click="copyToClipboard(shareUrl)"
                  block
                  style="margin-bottom: 8px"
                >
                  复制分享链接
                </Button>
                <Button @click="copyToClipboard(qrCodeData)" block>
                  复制二维码数据
                </Button>
              </div>

              <!-- JSON数据详情（折叠） -->
              <details class="qr-details">
                <summary>查看二维码数据详情</summary>
                <pre class="qr-data">{{ qrCodeData }}</pre>
              </details>
            </div>
          </div>
        </div>
        <div class="qr-usage">
          <p class="usage-tip">
            <InfoCircleOutlined style="margin-right: 4px; color: #1890ff" />
            二维码包含分享链接，扫码后可在浏览器中直接打开资产详情
          </p>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
/* 响应式设计 - 针对Descriptions组件 */
@media (max-width: 1300px) {
  /* 当屏幕较小时，控制栏改为更紧凑的布局 */
  .control-bar {
    gap: 10px;
    padding: 6px 0;
  }

  .action-buttons {
    gap: 6px;
  }

  .columns-control {
    gap: 6px;
  }

  .control-label {
    font-size: 11px;
  }
}

@media (max-width: 1100px) {
  /* 中等屏幕下控制栏更紧凑 */
  .control-bar {
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    padding: 8px 0;
    margin-bottom: 12px;
  }

  .action-buttons {
    gap: 6px;
    order: 1;
  }

  .columns-control {
    gap: 6px;
    order: 2;
    padding: 4px 0;
    margin-bottom: 0;
  }

  .control-label {
    font-size: 11px;
  }
}

@media (max-width: 900px) {
  /* 小屏幕下控制栏垂直排列 */
  .control-bar {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
    padding: 8px 0;
    margin-bottom: 16px;
  }

  .action-buttons {
    gap: 6px;
    justify-content: center;
    order: 1;
  }

  .columns-control {
    justify-content: center;
    order: 2;
    padding: 4px 0;
    margin-bottom: 0;
  }

  /* 小屏幕下二维码布局调整 */
  .qr-layout {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .qr-operations {
    width: 100%;
  }

  .control-label {
    font-size: 11px;
  }

  .attribute-group {
    margin-bottom: 6px;
  }

  .group-header {
    margin-bottom: 12px;
  }

  .group-title {
    padding-bottom: 6px;
    font-size: 14px;
  }
}

/* 中等屏幕优化 */
@media (max-width: 1200px) and (min-width: 901px) {
  /* 针对Descriptions组件的响应式调整 */
  .custom-descriptions :deep(.ant-descriptions) {
    font-size: 13px;
  }

  .custom-descriptions :deep(.ant-descriptions-item-label) {
    width: 110px !important;
    min-width: 110px !important;
    padding: 8px 12px !important;
    font-size: 13px !important;
  }

  .custom-descriptions :deep(.ant-descriptions-item-content) {
    padding: 8px 12px !important;
    font-size: 13px !important;
  }

  .custom-descriptions .choice-tag {
    padding: 2px 6px !important;
    font-size: 12px !important;
  }

  .custom-descriptions .computed-tag {
    height: 16px !important;
    font-size: 9px !important;
    line-height: 16px !important;
  }

  .custom-descriptions .normal-value {
    font-size: 13px !important;
  }
}

/* 极小屏幕优化 - 手机横屏和小屏设备 */
@media (max-width: 600px) {
  .control-bar {
    padding: 6px 0;
    margin-bottom: 12px;
  }

  .action-buttons {
    flex-wrap: wrap;
    gap: 4px;
  }

  .action-buttons > * {
    flex: 1;
    min-width: 70px;
  }

  .columns-control {
    flex-wrap: wrap;
    justify-content: center;
  }

  .control-label {
    font-size: 10px;
  }

  .control-label span {
    display: none; /* 极小屏幕隐藏文字，只显示图标 */
  }

  /* 极小屏幕下的表格样式 */
  .custom-descriptions :deep(.ant-descriptions) {
    font-size: 12px;
  }

  .custom-descriptions :deep(.ant-descriptions-item-label) {
    width: 90px !important;
    min-width: 90px !important;
    padding: 8px 10px !important;
    font-size: 12px !important;
  }

  .custom-descriptions :deep(.ant-descriptions-item-content) {
    padding: 8px 10px !important;
    font-size: 12px !important;
  }

  .custom-descriptions .choice-tag {
    padding: 2px 5px !important;
    font-size: 11px !important;
  }

  .custom-descriptions .computed-tag {
    height: 15px !important;
    font-size: 9px !important;
    line-height: 15px !important;
  }

  .custom-descriptions .normal-value {
    font-size: 12px !important;
  }

  /* 极小屏幕下分组标题调整 */
  .attribute-group {
    margin-bottom: 18px;
  }

  .group-header {
    margin-bottom: 10px;
  }

  .group-title {
    padding-bottom: 5px;
    font-size: 13px;
  }

  .group-icon {
    font-size: 13px;
  }
}

/* 控制栏样式 */
.control-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: flex-end;
  min-height: 32px; /* 确保最小高度 */
  padding: 4px 0;
  margin-bottom: 2px;
}

/* 操作按钮组 */
.action-buttons {
  display: flex;
  flex-shrink: 0; /* 防止按钮被压缩 */
  gap: 8px;
  align-items: center;
}

/* 列数控制器样式 - 简洁设计 */
.columns-control {
  display: flex;
  flex-shrink: 0; /* 防止控件被压缩 */
  gap: 8px;
  align-items: center;
  white-space: nowrap; /* 防止文字换行 */
}

.control-label {
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  color: #666;
}

.control-icon {
  font-size: 12px;
  color: #1890ff;
}

.ci-attributes-tab {
  height: 100%;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.attributes-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attribute-group {
  width: 100%;
  margin-bottom: 8px;
}

/* 分组标题样式 */
.group-header {
  margin-bottom: 16px;
}

.group-title {
  position: relative;
  display: inline-block;
  padding-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  border-bottom: 2px solid #1890ff;
}

.group-icon {
  font-size: 16px;
  color: #1890ff;
}

/* 移除旧的网格布局样式 */

/* 滚动条样式 */
.ci-attributes-tab::-webkit-scrollbar {
  width: 6px;
}

.ci-attributes-tab::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.ci-attributes-tab::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.ci-attributes-tab::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 分享相关样式 */
.share-content {
  padding: 12px 0;
}

.share-url-container {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 12px 0;
}

.share-url-input {
  flex: 1;
}

.share-tip {
  padding: 8px 12px;
  margin: 12px 0 0;
  font-size: 12px;
  color: #666;
  background-color: #f6f8fa;
  border-radius: 4px;
}

/* 二维码相关样式 */
.qr-content {
  padding: 12px 0;
}

.qr-info {
  margin-bottom: 16px;
  text-align: center;
}

.qr-info h4 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #262626;
}

.qr-info p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.qr-data-container {
  margin: 16px 0;
}

.qr-layout {
  display: flex;
  gap: 24px;
  align-items: center;
}

.qr-image-section {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
}

.qr-operations {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.qr-image {
  width: 200px;
  height: 200px;
  padding: 8px;
  object-fit: contain;
  background-color: #fff;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.qr-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  margin: 0 auto;
  font-size: 14px;
  color: #666;
  background-color: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 4px;
}

.qr-actions {
  margin-bottom: 16px;
}

.qr-details {
  width: 100%;
  text-align: left;
}

.qr-details summary {
  padding: 8px 12px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  background-color: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.qr-details summary:hover {
  color: #1890ff;
  background-color: #e6f7ff;
}

.qr-details[open] summary {
  margin-bottom: 0;
  color: #1890ff;
  background-color: #e6f7ff;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.qr-data {
  max-height: 150px;
  padding: 12px;
  margin: 0;
  overflow-y: auto;
  font-family: Monaco, Menlo, 'Ubuntu Mono', monospace;
  font-size: 10px;
  line-height: 1.4;
  color: #262626;
  background-color: #fafbfc;
  border: 1px solid #e1e4e8;
  border-top: none;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
}

.qr-usage {
  margin-top: 16px;
  text-align: center;
}

.usage-tip {
  padding: 8px 12px;
  margin: 0;
  font-size: 12px;
  color: #666;
  background-color: #f6f8fa;
  border-radius: 4px;
}

/* Descriptions组件相关样式 */
.attribute-label-wrapper {
  display: flex;
  gap: 6px;
  align-items: center;
}

.computed-tag {
  height: 14px;
  padding: 0 4px;
  font-size: 8px;
  line-height: 14px;
  transform: scale(0.85);
}

.attribute-value-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  min-height: 18px;
}

.choice-tag {
  display: flex;
  gap: 3px;
  align-items: center;
  padding: 1px 6px;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.3;
  border-radius: 3px;
}

.value-icon {
  font-size: 10px;
}

.json-value {
  max-height: 60px;
  padding: 4px 6px;
  margin: 0;
  overflow-y: auto;
  font-family: Monaco, Menlo, 'Ubuntu Mono', monospace;
  font-size: 10px;
  line-height: 1.3;
  word-break: break-all;
  white-space: pre-wrap;
  background-color: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 3px;
}

.normal-value {
  max-width: 100%;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.3;
  color: #262626;
  text-overflow: ellipsis;
  word-break: break-all;
  white-space: nowrap;
}

.empty-value {
  font-style: italic;
  color: #bfbfbf;
}

/* Descriptions组件定制样式 */
.custom-descriptions :deep(.ant-descriptions-item-label) {
  width: 130px !important;
  min-width: 130px !important;
  padding: 10px 14px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #595959 !important;
  white-space: nowrap !important;
  vertical-align: top !important;
  background-color: #fafafa !important;
  border-right: 1px solid #d9d9d9 !important;
  border-bottom: 1px solid #d9d9d9 !important;
}

.custom-descriptions :deep(.ant-descriptions-item-content) {
  padding: 10px 14px !important;
  font-size: 14px !important;
  color: #262626 !important;
  word-break: break-all !important;
  vertical-align: top !important;
  background-color: #fff !important;
  border-right: 1px solid #d9d9d9 !important;
  border-bottom: 1px solid #d9d9d9 !important;
}

.custom-descriptions :deep(.ant-descriptions-item) {
  padding-bottom: 0 !important;
}

.custom-descriptions :deep(.ant-descriptions-view) {
  overflow: hidden !important;
  border: 1px solid #d9d9d9 !important;
  border-radius: 0 !important;
}

.custom-descriptions :deep(.ant-descriptions-row) {
  border-bottom: none !important;
}

.custom-descriptions
  :deep(.ant-descriptions-row:last-child .ant-descriptions-item-label) {
  border-bottom: none !important;
}

.custom-descriptions
  :deep(.ant-descriptions-row:last-child .ant-descriptions-item-content) {
  border-bottom: none !important;
}

.custom-descriptions :deep(.ant-descriptions-item-label:last-child),
.custom-descriptions :deep(.ant-descriptions-item-content:last-child) {
  border-right: none !important;
}

/* 确保所有边框完整显示 */
.custom-descriptions :deep(table) {
  border-spacing: 0 !important;
  border-collapse: separate !important;
}

.custom-descriptions :deep(td) {
  border-right: 1px solid #d9d9d9 !important;
  border-bottom: 1px solid #d9d9d9 !important;
}

.custom-descriptions :deep(td:last-child) {
  border-right: none !important;
}

.custom-descriptions :deep(tr:last-child td) {
  border-bottom: none !important;
}

/* 特殊字段样式优化 */
.custom-descriptions .choice-tag {
  padding: 3px 8px !important;
  font-size: 13px !important;
  border-radius: 4px !important;
}

.custom-descriptions .json-value {
  max-height: 100px !important;
  padding: 8px 10px !important;
  margin: 0 !important;
  font-size: 12px !important;
  background-color: #f6f8fa !important;
  border: 1px solid #e1e4e8 !important;
  border-radius: 4px !important;
}

.custom-descriptions .computed-tag {
  height: 18px !important;
  padding: 1px 5px !important;
  margin-left: 6px !important;
  font-size: 10px !important;
  line-height: 18px !important;
}

.custom-descriptions .normal-value {
  font-size: 14px !important;
  line-height: 1.5 !important;
}

.custom-descriptions .empty-value {
  font-style: italic !important;
  color: #bfbfbf !important;
}

.relation-section {
  margin-top: 24px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 55%);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.relation-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.relation-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.relation-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #64748b;
}

.relation-overview {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  background: rgba(37, 99, 235, 0.06);
  border-radius: 999px;
  color: #1d4ed8;
  font-size: 13px;
}

.relation-overview-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.relation-overview-item .label {
  opacity: 0.78;
}

.relation-overview-item .value {
  font-weight: 600;
}

.relation-overview-split {
  width: 1px;
  height: 18px;
  background: rgba(37, 99, 235, 0.2);
}

.relation-overview-item .dot,
.relation-summary-card .dot {
  display: inline-flex;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}

.dot.outgoing {
  background: #2563eb;
}

.dot.incoming {
  background: #a855f7;
}

.relation-layout {
  display: flex;
  gap: 20px;
  min-height: 260px;
}

.relation-sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.relation-summary-card {
  padding: 18px 20px;
  border-radius: 14px;
  background: radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.16), rgba(37, 99, 235, 0.05));
  border: 1px solid rgba(37, 99, 235, 0.12);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
}

.summary-header {
  font-size: 13px;
  color: #1d4ed8;
  font-weight: 600;
  letter-spacing: 0.4px;
}

.summary-total {
  margin-top: 8px;
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
}

.summary-metric {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: #334155;
}

.summary-metric .metric-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.summary-metric .metric-value {
  font-weight: 600;
}

.relation-menu-section {
  padding: 16px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: #475569;
  margin-bottom: 12px;
}

.section-title {
  font-weight: 600;
  color: #0f172a;
}

.section-count {
  font-size: 12px;
  color: #64748b;
}

.section-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.relation-menu-item {
  border-radius: 10px;
  padding: 12px 14px;
  border: 1px solid transparent;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: inset 0 0 0 0 rgba(37, 99, 235, 0.08);
}

.relation-menu-item .menu-item-title {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

.relation-menu-item .menu-item-meta {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

.relation-menu-item:hover {
  transform: translateX(3px);
  box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.16);
}

.relation-menu-item.active {
  background: #eff6ff;
  border-color: rgba(37, 99, 235, 0.35);
  box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.2), 0 10px 24px rgba(59, 130, 246, 0.12);
}

.relation-menu-item.active .menu-item-title {
  color: #1d4ed8;
  font-weight: 600;
}

.accent-outgoing.relation-menu-item.active {
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.35);
}

.accent-incoming.relation-menu-item.active {
  background: rgba(168, 85, 247, 0.12);
  border-color: rgba(168, 85, 247, 0.35);
}

.relation-list {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.relation-table :deep(.ant-table) {
  border-radius: 12px;
}

.relation-table-instance {
  display: flex;
  align-items: center;
  gap: 8px;
}

.instance-name {
  max-width: 220px;
  font-weight: 500;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.instance-type {
  font-size: 12px;
  border-radius: 999px;
  padding: 0 10px;
}

.relation-table-text {
  color: #475569;
}

.relation-empty {
  padding: 28px 0;
}

@media (max-width: 1280px) {
  .relation-layout {
    flex-direction: column;
  }

  .relation-sidebar {
    width: 100%;
    flex-direction: row;
    gap: 20px;
  }

  .relation-summary-card,
  .relation-menu-section {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .relation-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .relation-overview {
    width: 100%;
    flex-wrap: wrap;
    border-radius: 16px;
  }

  .relation-sidebar {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .relation-section {
    margin-top: 16px;
    padding: 16px;
  }

  .instance-name {
    max-width: 160px;
  }
}
</style>
