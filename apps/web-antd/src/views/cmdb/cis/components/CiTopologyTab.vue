<template>
  <div class="ci-topology-tab h-full flex flex-col">
    <!-- 工具栏 -->
    <div class="mb-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
      <div class="flex items-center gap-3">
        <!-- 层级面包屑导航 -->
        <div class="flex items-center gap-1">
          <a-breadcrumb class="level-breadcrumb">
            <a-breadcrumb-item
              v-for="(level, index) in levelStack"
              :key="level.ciId"
              class="cursor-pointer"
              @click="navigateToLevel(index)"
            >
              <span :class="{ 'text-primary': index === levelStack.length - 1 }">
                {{ level.ciName }}
              </span>
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>

        <!-- 返回上级按钮 -->
        <a-button
          v-if="levelStack.length > 1"
          size="small"
          @click="drillUp"
        >
          <template #icon>
            <ArrowLeftOutlined />
          </template>
          返回上级
        </a-button>
      </div>

      <div class="flex items-center gap-2">
        <!-- 关系深度选择 -->
        <a-select
          v-model:value="relationDepth"
          :options="depthOptions"
          size="small"
          style="width: 100px"
        />

        <!-- 刷新按钮 -->
        <a-button size="small" @click="refreshTopology" :loading="loading">
          <template #icon>
            <ReloadOutlined />
          </template>
        </a-button>

        <!-- 重置缩放 -->
        <a-button size="small" @click="resetZoom">
          <template #icon>
            <ExpandOutlined />
          </template>
        </a-button>

        <!-- 筛选器 -->
        <a-dropdown>
          <template #overlay>
            <a-menu>
              <a-menu-item key="filter-type">
                <FilterOutlined /> 按类型筛选
              </a-menu-item>
              <a-menu-item key="filter-relation">
                <LinkOutlined /> 按关系筛选
              </a-menu-item>
            </a-menu>
          </template>
          <a-button size="small">
            <template #icon>
              <FilterOutlined />
            </template>
            筛选
          </a-button>
        </a-dropdown>
      </div>
    </div>

    <!-- 拓扑图形区域 -->
    <div class="flex-1 bg-white rounded-lg border overflow-hidden relative">
      <div
        ref="chartContainer"
        class="topology-canvas"
        v-loading="loading"
      ></div>
      <Transition name="fade-blur">
        <div
          v-if="hoverDetail.visible"
          class="ci-hover-modal"
          :style="hoverPositionStyle"
        >
          <div class="modal-content" :class="{ loading: hoverDetail.loading }">
            <div v-if="hoverDetail.loading" class="loading-state">
              <span class="loading-indicator"></span>
              <span>加载中...</span>
            </div>
            <div v-else-if="hoverDetail.error" class="error-state">
              <span>加载失败</span>
            </div>
            <div v-else-if="hoverDetail.payload" class="detail-state">
              <div class="detail-header">
                <div class="detail-title">{{ hoverDetail.payload.title }}</div>
                <div class="detail-type">{{ hoverDetail.payload.typeLabel }}</div>
              </div>
              <div class="detail-meta">
                <div v-if="hoverDetail.payload.statusLabel" class="meta-row">
                  <span class="meta-label">状态</span>
                  <span class="meta-value">{{ hoverDetail.payload.statusLabel }}</span>
                </div>
                <div v-if="hoverDetail.payload.updatedAt" class="meta-row">
                  <span class="meta-label">更新时间</span>
                  <span class="meta-value">{{ hoverDetail.payload.updatedAt }}</span>
                </div>
              </div>
              <div v-if="hoverDetail.payload.tags?.length" class="detail-tags">
                <span
                  v-for="tag in hoverDetail.payload.tags"
                  :key="tag"
                  class="tag-item"
                >
                  {{ tag }}
                </span>
              </div>
              <div v-if="hoverDetail.payload.primaryAttributes.length" class="detail-section">
                <div class="section-title">关键信息</div>
                <table class="detail-table">
                  <tbody>
                    <tr v-for="item in hoverDetail.payload.primaryAttributes" :key="item.key">
                      <th>{{ item.label }}</th>
                      <td>{{ item.value }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div
                v-if="hoverDetail.payload.secondaryAttributes.length"
                class="detail-section"
              >
                <div class="section-title">
                  更多字段
                  <span v-if="hoverDetail.payload.hiddenAttributeCount"
                    >+{{ hoverDetail.payload.hiddenAttributeCount }} 项</span
                  >
                </div>
                <div class="detail-grid">
                  <div
                    v-for="item in hoverDetail.payload.secondaryAttributes"
                    :key="item.key"
                    class="grid-item"
                  >
                    <div class="grid-label">{{ item.label }}</div>
                    <div class="grid-value">{{ item.value }}</div>
                  </div>
                </div>
              </div>
              <div
                v-if="
                  !hoverDetail.payload.primaryAttributes.length &&
                  !hoverDetail.payload.secondaryAttributes.length
                "
                class="empty-hint"
              >
                暂无属性信息
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import * as echarts from 'echarts';
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  ExpandOutlined,
  FilterOutlined,
  LinkOutlined,
} from '@ant-design/icons-vue';

import {
  getCiRelationsApi,
  type CiRelationInfo,
  type CiRelationQueryResult,
} from '#/api/cmdb/cis/relation';
import { getCisDetail } from '#/api/cmdb/cis';
import { getCiTypeRelationList } from '#/api/cmdb/ciTypeRelation';
import { getCiTypeList } from '#/api/cmdb/ci_types';
import { getRelationTypesApi } from '#/api/cmdb/cis/relation';

interface Props {
  ciId?: number;
  typeId?: number;
  typeName?: string;
  visible?: boolean;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'view-ci', payload: { ciId: number; typeId?: number }): void;
}

const emit = defineEmits<Emits>();

interface TopologyLevel {
  ciId: number;
  ciName: string;
  depth: number;
  parentId?: number;
  typeId?: number;
}

interface CiSummary {
  id: number;
  displayName: string;
  typeId: number;
  typeName: string;
}

interface ModelRelationDefinition {
  id?: number;
  parentId: number;
  childId: number;
  relationTypeId: number;
  direction: 'source_to_target' | 'target_to_source';
}

interface TopologyTreeNode {
  id: string;
  name: string;
  level: number;
  ciId?: number;
  typeId?: number;
  typeName?: string;
  direction: 'root' | 'group' | 'model' | 'ci';
  relationId?: number;
  relationTypeId?: number;
  relationTypeName?: string;
  relationStrength?: string;
  status?: string;
  count?: number;
  fallback?: boolean;
  children?: TopologyTreeNode[];
}

const chartContainer = ref<HTMLElement>();
const chartInstance = ref<echarts.ECharts>();
const loading = ref(false);
const relationDepth = ref(2);
const levelStack = ref<TopologyLevel[]>([]);
const treeData = ref<TopologyTreeNode | null>(null);
const currentTypeId = ref<number | null>(props.typeId ?? null);
const collapsedNodeIds = new Set<string>();
const lastLoadedCiId = ref<number | null>(null);

const ciSummaryCache = new Map<number, CiSummary>();
const ciDetailCache = new Map<number, any>();
const typeInfoMap = ref(new Map<number, { name: string; alias?: string }>());
const relationTypeInfoMap = ref(new Map<number, { name: string; alias?: string }>());
const modelRelationCache = new Map<
  number,
  { outgoing: ModelRelationDefinition[]; incoming: ModelRelationDefinition[] }
>();

const handleWindowResize = () => {
  chartInstance.value?.resize();
};

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

const getNodeKey = (node: TopologyTreeNode) => {
  if (node.direction === 'ci') {
    return `ci-${node.ciId}-${node.relationId ?? 'none'}`;
  }
  if (node.id !== undefined && node.id !== null) {
    return String(node.id);
  }
  if (node.ciId !== undefined && node.ciId !== null) {
    return String(node.ciId);
  }
  if (node.name) {
    return String(node.name);
  }
  return Math.random().toString(16).slice(2);
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

const extractList = (response: any): any[] => {
  if (!response) {
    return [];
  }
  if (Array.isArray(response)) {
    return response;
  }
  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  if (Array.isArray(response?.list)) {
    return response.list;
  }
  return [];
};

const fetchCiSummary = async (ciId: number): Promise<CiSummary | null> => {
  if (ciSummaryCache.has(ciId)) {
    return ciSummaryCache.get(ciId) ?? null;
  }

  try {
    const detail = await getCisDetail({ id: ciId });
    const detailData = (detail as any)?.data ?? detail;
    if (!detailData) return null;

    const ciInfo = detailData.ciInfo ?? detailData.ci_info ?? {};
    const typeId = Number(
      pickFieldValue(ciInfo, 'typeId') ?? pickFieldValue(ciInfo, 'type_id'),
    );
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

  await Promise.all(
    ids.map(async (id) => {
      const summary = await fetchCiSummary(id);
      if (summary) {
        result.set(id, summary);
      }
    }),
  );
  return result;
};

const ensureAllTypeInfo = async () => {
  if (typeInfoMap.value.size > 0) {
    return;
  }
  try {
    const response = await getCiTypeList({ page: 1, pageSize: 1000 });
    const list = extractList(response);
    const map = new Map<number, { name: string; alias?: string }>();
    list.forEach((item: any) => {
      const id = Number(pickFieldValue(item, 'id'));
      if (!id) return;
      map.set(id, {
        name: String(pickFieldValue(item, 'name') ?? `类型-${id}`),
        alias: pickFieldValue(item, 'alias')
          ? String(pickFieldValue(item, 'alias'))
          : undefined,
      });
    });
    typeInfoMap.value = map;
  } catch (error) {
    console.error('加载CI类型列表失败:', error);
  }
};

const ensureRelationTypeInfo = async () => {
  if (relationTypeInfoMap.value.size > 0) {
    return;
  }
  try {
    const response = await getRelationTypesApi({ page: 1, pageSize: 1000 });
    const list = extractList(response);
    const map = new Map<number, { name: string; alias?: string }>();
    list.forEach((item: any) => {
      const id = Number(pickFieldValue(item, 'id'));
      if (!id) return;
      map.set(id, {
        name: String(pickFieldValue(item, 'name') ?? `关系类型-${id}`),
        alias: pickFieldValue(item, 'alias')
          ? String(pickFieldValue(item, 'alias'))
          : undefined,
      });
    });
    relationTypeInfoMap.value = map;
  } catch (error) {
    console.error('加载关系类型失败:', error);
  }
};

const getTypeDisplayName = (typeId: number) => {
  const info = typeInfoMap.value.get(typeId);
  if (!info) return `类型-${typeId}`;
  return info.alias || info.name || `类型-${typeId}`;
};

const getRelationTypeDisplayName = (relationTypeId: number) => {
  const info = relationTypeInfoMap.value.get(relationTypeId);
  if (!info) return `关系类型-${relationTypeId}`;
  return info.alias || info.name || `关系类型-${relationTypeId}`;
};

interface HoverDetailAttribute {
  key: string;
  label: string;
  value: string;
  attrId?: number;
}

interface HoverDetailPayload {
  title: string;
  typeLabel: string;
  statusLabel?: string;
  updatedAt?: string;
  tags?: string[];
  primaryAttributes: HoverDetailAttribute[];
  secondaryAttributes: HoverDetailAttribute[];
  hiddenAttributeCount: number;
}

interface HoverDetailState {
  visible: boolean;
  loading: boolean;
  error: boolean;
  x: number;
  y: number;
  ciId: number | null;
  payload: HoverDetailPayload | null;
}

const hoverDetail = reactive<HoverDetailState>({
  visible: false,
  loading: false,
  error: false,
  x: 0,
  y: 0,
  ciId: null,
  payload: null,
});

const hoverHideTimer = ref<number | null>(null);
const hoverRequestToken = ref(0);

const hoverPositionStyle = computed(() => ({
  left: `${hoverDetail.x}px`,
  top: `${hoverDetail.y}px`,
}));

const clearHoverHideTimer = () => {
  if (hoverHideTimer.value !== null) {
    window.clearTimeout(hoverHideTimer.value);
    hoverHideTimer.value = null;
  }
};

const scheduleHideHoverDetail = (delay = 120) => {
  clearHoverHideTimer();
  hoverHideTimer.value = window.setTimeout(() => {
    hoverDetail.visible = false;
    hoverDetail.loading = false;
    hoverDetail.error = false;
    hoverDetail.payload = null;
    hoverDetail.ciId = null;
  }, delay);
};

const formatTimestamp = (timestamp?: number) => {
  if (!timestamp) return undefined;
  const normalized = timestamp > 1e12 ? timestamp : timestamp * 1000;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const extractHoverAttributes = (
  ciInfo: any,
): { primary: HoverDetailAttribute[]; secondary: HoverDetailAttribute[]; hidden: number } => {
  const attributes = Array.isArray(ciInfo?.attributes) ? ciInfo.attributes : [];
  if (attributes.length === 0) {
    return { primary: [], secondary: [], hidden: 0 };
  }

  const mapped = attributes
    .map((attr: any, index: number) => {
      const value = pickFieldValue(attr, 'value');
      if (value === undefined || value === null || value === '') {
        return null;
      }
      const attrId = Number(pickFieldValue(attr, 'attrId') ?? pickFieldValue(attr, 'attr_id'));
      const label =
        (pickFieldValue(attr, 'attrAlias') ?? pickFieldValue(attr, 'attrAliasName')) ||
        pickFieldValue(attr, 'attrName') ||
        `属性-${index + 1}`;
      return {
        key: `${attrId || index}-${label}`,
        label: String(label),
        value: String(value),
        attrId: Number.isFinite(attrId) ? attrId : undefined,
        isDefault:
          pickFieldValue(attr, 'defaultShow') === true ||
          pickFieldValue(attr, 'isDefaultShow') === true,
      } as HoverDetailAttribute & { isDefault?: boolean };
    })
    .filter((item): item is HoverDetailAttribute & { isDefault?: boolean } => Boolean(item));

  const defaultShown = mapped.filter((item) => item.isDefault);
  const source = defaultShown.length > 0 ? defaultShown : mapped;
  const primary = source.slice(0, 6).map(({ isDefault, ...item }) => item);

  const primaryKeys = new Set(primary.map((item) => item.key));
  const remaining = mapped
    .filter((item) => !primaryKeys.has(item.key))
    .map(({ isDefault, ...item }) => item);

  const secondary = remaining.slice(0, 10);
  const hidden = Math.max(remaining.length - secondary.length, 0);

  return { primary, secondary, hidden };
};

const buildHoverPayload = (
  detail: any,
  fallbackName: string,
  ciId: number,
): HoverDetailPayload | null => {
  const detailData = detail?.data ?? detail;
  if (!detailData) {
    return null;
  }
  const ciInfo = detailData.ciInfo ?? detailData.ci_info ?? {};
  const { primary, secondary, hidden } = extractHoverAttributes(ciInfo);
  const displayName = deriveDisplayName(ciInfo, ciInfo?.attributes ?? [], ciId) || fallbackName;
  const typeLabel =
    String(detailData.ciTypeAlias || detailData.ciTypeName || ciInfo?.typeName || '未命名类型');
  const statusCandidate =
    pickFieldValue(ciInfo, 'statusText') ??
    pickFieldValue(ciInfo, 'statusLabel') ??
    pickFieldValue(ciInfo, 'statusName') ??
    pickFieldValue(ciInfo, 'status');
  const statusLabel =
    statusCandidate !== undefined && statusCandidate !== null
      ? String(statusCandidate)
      : undefined;
  const tags = Array.isArray(ciInfo?.tags) ? ciInfo.tags.map(String).slice(0, 6) : undefined;

  return {
    title: displayName,
    typeLabel,
    statusLabel,
    updatedAt: formatTimestamp(ciInfo.updatedAt ?? ciInfo.updated_at),
    tags,
    primaryAttributes: primary,
    secondaryAttributes: secondary,
    hiddenAttributeCount: hidden,
  };
};

const updateHoverPosition = (x: number, y: number) => {
  const container = chartContainer.value;
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const maxWidth = 320;
  const maxHeight = 260;
  const offset = 18;

  let left = x + offset;
  let top = y + offset;

  if (left + maxWidth > rect.width - 12) {
    left = Math.max(12, x - maxWidth - offset);
  }
  if (top + maxHeight > rect.height - 12) {
    top = Math.max(12, y - maxHeight - offset);
  }

  hoverDetail.x = left;
  hoverDetail.y = top;
};

const showHoverDetailForNode = async (node: TopologyTreeNode, event: any) => {
  if (!node.ciId) {
    return;
  }
  clearHoverHideTimer();
  const rawEvent = event?.event ?? event;
  const offsetX = rawEvent?.offsetX ?? rawEvent?.layerX ?? 0;
  const offsetY = rawEvent?.offsetY ?? rawEvent?.layerY ?? 0;
  updateHoverPosition(offsetX, offsetY);
  hoverDetail.visible = true;
  hoverDetail.loading = true;
  hoverDetail.error = false;
  hoverDetail.payload = null;
  hoverDetail.ciId = node.ciId;

  const requestId = ++hoverRequestToken.value;

  const cached = ciDetailCache.get(node.ciId);
  if (cached) {
    const payload = buildHoverPayload(cached, node.name, node.ciId);
    if (payload) {
      hoverDetail.payload = payload;
    }
    hoverDetail.loading = false;
    return;
  }

  try {
    const detail = await getCisDetail({ id: node.ciId });
    if (requestId !== hoverRequestToken.value) {
      return;
    }
    ciDetailCache.set(node.ciId, detail);
    const payload = buildHoverPayload(detail, node.name, node.ciId);
    if (payload) {
      hoverDetail.payload = payload;
    } else {
      hoverDetail.error = true;
    }
  } catch (error) {
    if (requestId === hoverRequestToken.value) {
      hoverDetail.error = true;
      console.error('加载CI详情失败:', error);
    }
  } finally {
    if (requestId === hoverRequestToken.value) {
      hoverDetail.loading = false;
    }
  }
};

const handleChartMouseOver = async (params: any) => {
  const data = params?.data as TopologyTreeNode | undefined;
  if (!data || data.direction !== 'ci') {
    scheduleHideHoverDetail();
    return;
  }
  await showHoverDetailForNode(data, params.event);
};

const handleChartMouseOut = (params: any) => {
  const data = params?.data as TopologyTreeNode | undefined;
  if (data && data.direction === 'ci') {
    scheduleHideHoverDetail(180);
  }
};

const handleChartGlobalOut = () => {
  scheduleHideHoverDetail(200);
};

const loadModelRelationDefinitions = async (typeId: number) => {
  if (modelRelationCache.has(typeId)) {
    return modelRelationCache.get(typeId)!;
  }
  await Promise.all([ensureAllTypeInfo(), ensureRelationTypeInfo()]);
  const [outgoingResp, incomingResp] = await Promise.all([
    getCiTypeRelationList({ page: 1, pageSize: 1000, parentId: typeId }),
    getCiTypeRelationList({ page: 1, pageSize: 1000, childId: typeId }),
  ]);
  const outgoing = extractList(outgoingResp)
    .map((item: any) => ({
      id: Number(pickFieldValue(item, 'id') ?? 0),
      parentId: Number(pickFieldValue(item, 'parentId') ?? pickFieldValue(item, 'parent_id') ?? 0),
      childId: Number(pickFieldValue(item, 'childId') ?? pickFieldValue(item, 'child_id') ?? 0),
      relationTypeId: Number(
        pickFieldValue(item, 'relationTypeId') ?? pickFieldValue(item, 'relation_type_id') ?? 0,
      ),
      direction: 'source_to_target' as const,
    }))
    .filter((item) => item.parentId === typeId && item.childId > 0 && item.relationTypeId > 0);
  const incoming = extractList(incomingResp)
    .map((item: any) => ({
      id: Number(pickFieldValue(item, 'id') ?? 0),
      parentId: Number(pickFieldValue(item, 'parentId') ?? pickFieldValue(item, 'parent_id') ?? 0),
      childId: Number(pickFieldValue(item, 'childId') ?? pickFieldValue(item, 'child_id') ?? 0),
      relationTypeId: Number(
        pickFieldValue(item, 'relationTypeId') ?? pickFieldValue(item, 'relation_type_id') ?? 0,
      ),
      direction: 'target_to_source' as const,
    }))
    .filter((item) => item.childId === typeId && item.parentId > 0 && item.relationTypeId > 0);

  const definitions = { outgoing, incoming };
  modelRelationCache.set(typeId, definitions);
  return definitions;
};

const makeGroupKey = (
  direction: 'source_to_target' | 'target_to_source',
  relationTypeId: number,
  otherTypeId: number,
) => `${direction}|${relationTypeId}|${otherTypeId}`;

const buildTopologyTree = async (
  relationData: CiRelationQueryResult | null,
  centerSummary: CiSummary,
  relatedSummaries: Map<number, CiSummary>,
): Promise<TopologyTreeNode> => {
  const definitions = await loadModelRelationDefinitions(centerSummary.typeId);
  const groupedRelations = new Map<
    string,
    { relation: CiRelationInfo; summary: CiSummary }[]
  >();

  const sourceRelations = relationData?.sourceRelations ?? [];
  sourceRelations.forEach((relation: any) => {
    const targetId = Number(
      relation.target_ci_id ?? relation.targetCiId ?? relation.TargetCiId ?? 0,
    );
    if (!targetId) return;
    const summary = relatedSummaries.get(targetId);
    if (!summary) return;
    const relationTypeId = Number(
      pickFieldValue(relation, 'relationTypeId') ??
        pickFieldValue(relation, 'relation_type_id') ??
        0,
    );
    if (!relationTypeId) return;
    const key = makeGroupKey('source_to_target', relationTypeId, summary.typeId);
    if (!groupedRelations.has(key)) groupedRelations.set(key, []);
    groupedRelations.get(key)!.push({ relation, summary });
  });

  const targetRelations = relationData?.targetRelations ?? [];
  targetRelations.forEach((relation: any) => {
    const sourceId = Number(
      relation.source_ci_id ?? relation.sourceCiId ?? relation.SourceCiId ?? 0,
    );
    if (!sourceId) return;
    const summary = relatedSummaries.get(sourceId);
    if (!summary) return;
    const relationTypeId = Number(
      pickFieldValue(relation, 'relationTypeId') ??
        pickFieldValue(relation, 'relation_type_id') ??
        0,
    );
    if (!relationTypeId) return;
    const key = makeGroupKey('target_to_source', relationTypeId, summary.typeId);
    if (!groupedRelations.has(key)) groupedRelations.set(key, []);
    groupedRelations.get(key)!.push({ relation, summary });
  });

  const createRelationNodes = (
    defs: ModelRelationDefinition[],
    directionLabel: '出向关系' | '入向关系',
  ) => {
    const nodes: TopologyTreeNode[] = [];
    defs.forEach((definition) => {
      const relationTypeId = definition.relationTypeId;
      const targetTypeId =
        definition.direction === 'source_to_target' ? definition.childId : definition.parentId;
      const relationTypeName = getRelationTypeDisplayName(relationTypeId);
      const targetTypeName = getTypeDisplayName(targetTypeId);
      const key = makeGroupKey(definition.direction, relationTypeId, targetTypeId);
      const directionLabel = definition.direction === 'source_to_target' ? '下游' : '上游';
      const arrowLabel = definition.direction === 'source_to_target' ? '→' : '←';
      const relations = groupedRelations.get(key) ?? [];
      const ciNodes = relations.map(({ relation, summary }) => ({
        id: `ci-${summary.id}-${
          pickFieldValue(relation, 'id') ??
          pickFieldValue(relation, 'Id') ??
          Math.random().toString(16).slice(2)
        }`,
        name: summary.displayName,
        level: 3,
        ciId: summary.id,
        typeId: summary.typeId,
        typeName: summary.typeName,
        direction: 'ci' as const,
        relationId: Number(
          pickFieldValue(relation, 'id') ?? pickFieldValue(relation, 'Id') ?? 0,
        ),
        relationTypeId,
        relationTypeName,
        relationStrength:
          (pickFieldValue(relation, 'relationStrength') ??
            pickFieldValue(relation, 'relation_strength')) || 'normal',
        status: (pickFieldValue(relation, 'status') as string) || 'active',
        children: [],
      }));
      const count = ciNodes.length;
      nodes.push({
        id: `model-${definition.direction}-${relationTypeId}-${targetTypeId}`,
        name: `${directionLabel} · ${relationTypeName} ${arrowLabel} ${targetTypeName}`,
        level: 2,
        direction: 'model',
        relationTypeId,
        relationTypeName,
        typeId: targetTypeId,
        typeName: targetTypeName,
        count,
        children: ciNodes,
      });
      groupedRelations.delete(key);
    });
    return nodes;
  };

  const outgoingNodes = createRelationNodes(definitions.outgoing, '出向关系');
  const incomingNodes = createRelationNodes(definitions.incoming, '入向关系');

  const fallbackOutgoing: TopologyTreeNode[] = [];
  const fallbackIncoming: TopologyTreeNode[] = [];

  groupedRelations.forEach((relations, key) => {
    const [direction, relationTypeIdStr, typeIdStr] = key.split('|');
    const relationTypeId = Number(relationTypeIdStr);
    const otherTypeId = Number(typeIdStr);
    const relationTypeName = getRelationTypeDisplayName(relationTypeId);
    const otherTypeName = getTypeDisplayName(otherTypeId);
    const directionLabel = direction === 'source_to_target' ? '下游' : '上游';
    const arrowLabel = direction === 'source_to_target' ? '→' : '←';
    const ciNodes = relations.map(({ relation, summary }) => ({
      id: `ci-${summary.id}-${
        pickFieldValue(relation, 'id') ??
        pickFieldValue(relation, 'Id') ??
        Math.random().toString(16).slice(2)
      }`,
      name: summary.displayName,
      level: 3,
      ciId: summary.id,
      typeId: summary.typeId,
      typeName: summary.typeName,
      direction: 'ci' as const,
      relationId: Number(
        pickFieldValue(relation, 'id') ?? pickFieldValue(relation, 'Id') ?? 0,
      ),
      relationTypeId,
      relationTypeName,
      relationStrength:
        (pickFieldValue(relation, 'relationStrength') ??
          pickFieldValue(relation, 'relation_strength')) || 'normal',
      status: (pickFieldValue(relation, 'status') as string) || 'active',
      children: [],
    }));
    const node: TopologyTreeNode = {
      id: `fallback-${key}`,
      name: `${directionLabel} · ${relationTypeName} ${arrowLabel} ${otherTypeName}`,
      level: 2,
      direction: 'model',
      relationTypeId,
      relationTypeName,
      typeId: otherTypeId,
      typeName: otherTypeName,
      count: ciNodes.length,
      fallback: true,
      children: ciNodes,
    };
    if (direction === 'source_to_target') {
      fallbackOutgoing.push(node);
    } else {
      fallbackIncoming.push(node);
    }
  });

  if (fallbackOutgoing.length) {
    outgoingNodes.push(...fallbackOutgoing);
  }
  if (fallbackIncoming.length) {
    incomingNodes.push(...fallbackIncoming);
  }

  const sumCount = (nodes: TopologyTreeNode[]) =>
    nodes.reduce((total, node) => total + (node.count ?? 0), 0);

  const groupNodes: TopologyTreeNode[] = [];
  if (outgoingNodes.length > 0) {
    groupNodes.push({
      id: 'group-outgoing',
      name: `下游关系 (${sumCount(outgoingNodes)})`,
      level: 1,
      direction: 'group',
      children: outgoingNodes,
    });
  }

  if (incomingNodes.length > 0) {
    groupNodes.push({
      id: 'group-incoming',
      name: `上游关系 (${sumCount(incomingNodes)})`,
      level: 1,
      direction: 'group',
      children: incomingNodes,
    });
  }

  const root: TopologyTreeNode = {
    id: centerSummary.id.toString(),
    name: centerSummary.displayName,
    level: 0,
    ciId: centerSummary.id,
    typeId: centerSummary.typeId,
    typeName: centerSummary.typeName,
    direction: 'root',
    children: groupNodes,
  };

  return root;
};

const nodeColors: Record<TopologyTreeNode['direction'], string> = {
  root: '#4f46e5',
  group: '#2563eb',
  model: '#0ea5e9',
  ci: '#22c55e',
};

const fallbackColor = '#f97316';

const convertNodeToSeries = (node: TopologyTreeNode): any => {
  const children = Array.isArray(node.children)
    ? node.children.map(convertNodeToSeries)
    : [];
  const key = getNodeKey(node);
  const collapsed = key ? collapsedNodeIds.has(key) : false;
  const renderedChildren = collapsed ? [] : children;
  const normalizedStatus = (node.status ?? '').toLowerCase();
  const edgeColor =
    node.direction === 'ci'
      ? normalizedStatus === 'active'
        ? '#16a34a'
        : '#9ca3af'
      : '#cbd5e1';
  return {
    ...node,
    id: key,
    value: node.count ?? node.ciId ?? node.name,
    name: node.name,
    children: renderedChildren,
    itemStyle: {
      color: node.fallback ? fallbackColor : nodeColors[node.direction] ?? '#64748b',
    },
    symbolSize:
      node.direction === 'root'
        ? 34
        : node.direction === 'group'
          ? 26
          : node.direction === 'model'
            ? 22
            : 18,
    isCollapsed: collapsed,
    hasChildren: children.length > 0,
    lineStyle: {
      color: edgeColor,
      width: 1.5,
    },
  };
};

const updateChart = () => {
  if (!chartInstance.value) {
    return;
  }
  if (!treeData.value) {
    chartInstance.value.clear();
    return;
  }

  const option = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: (params: any) => {
        const data = params.data as TopologyTreeNode;
        if (data.direction === 'ci') {
          return '';
        }
        if (data.direction === 'root') {
          return `CI: ${data.name}<br/>类型: ${data.typeName ?? '-'}`;
        }
        if (data.direction === 'group') {
          return data.name;
        }
        if (data.direction === 'model') {
          const extra = data.fallback ? '<br/>（未在模型关系中配置）' : '';
          return `模型关系: ${data.name}<br/>数量: ${data.count ?? 0}${extra}`;
        }
        return data.name;
      },
    },
    series: [
      {
        name: 'CI关系树',
        type: 'tree',
        data: [convertNodeToSeries(treeData.value)],
        top: '4%',
        left: '4%',
        right: '4%',
        bottom: '4%',
        orient: 'LR',
        roam: true,
        expandAndCollapse: false,
        initialTreeDepth: relationDepth.value + 1,
        label: {
          position: 'right',
          align: 'left',
          verticalAlign: 'middle',
          fontSize: 12,
          formatter: (params: any) => {
            const data = params.data as TopologyTreeNode & {
              isCollapsed?: boolean;
              hasChildren?: boolean;
            };
            switch (data.direction) {
              case 'root':
                return `${data.name}\n[${data.typeName ?? ''}]`;
              case 'group': {
                const suffix = data.hasChildren && data.isCollapsed ? ' [+]' : '';
                return `${data.name}${suffix}`;
              }
              case 'model': {
                const suffix = data.hasChildren && data.isCollapsed ? ' [+]' : '';
                return `${data.name} · ${data.count ?? 0}个${suffix}`;
              }
              case 'ci':
                return `${data.name}\n[${data.typeName ?? ''}]`;
              default:
                return data.name;
            }
          },
        },
        leaves: {
          label: {
            position: 'right',
            align: 'left',
          },
        },
        lineStyle: {
          color: '#cbd5e1',
          width: 1.5,
        },
        animationDuration: 300,
        animationDurationUpdate: 500,
      },
    ],
  };

  chartInstance.value.setOption(option, { notMerge: false, lazyUpdate: true });
};

const initChart = () => {
  if (!chartContainer.value) return;
  chartInstance.value = echarts.init(chartContainer.value);
  chartInstance.value.on('mouseover', handleChartMouseOver);
  chartInstance.value.on('mouseout', handleChartMouseOut);
  chartInstance.value.on('globalout', handleChartGlobalOut);
  chartInstance.value.on('click', (params: any) => {
    const data = params.data as TopologyTreeNode;
    if (!data) {
      return;
    }

    if (data.direction === 'ci' && data.ciId) {
      emit('view-ci', { ciId: data.ciId, typeId: data.typeId });
      return;
    }

    if (data.direction === 'model' || data.direction === 'group') {
      const hasChildren = (data as any).hasChildren;
      if (!hasChildren) {
        return;
      }
      const key = getNodeKey(data);
      if (!key) {
        return;
      }
      if (collapsedNodeIds.has(key)) {
        collapsedNodeIds.delete(key);
      } else {
        collapsedNodeIds.add(key);
      }
      updateChart();
    }
  });
};

const currentCiId = computed(() => {
  if (levelStack.value.length > 0) {
    return levelStack.value[levelStack.value.length - 1].ciId;
  }
  return props.ciId;
});

const loadTopologyData = async (ciId?: number) => {
  if (!ciId) return;
  scheduleHideHoverDetail(0);
  loading.value = true;
  try {
    const centerSummary =
      (await fetchCiSummary(ciId)) || {
        id: ciId,
        displayName: `CI-${ciId}`,
        typeId: currentTypeId.value ?? props.typeId ?? 0,
        typeName: props.typeName ?? '',
      };

    currentTypeId.value = centerSummary.typeId;

    if (levelStack.value.length === 0) {
      levelStack.value = [
        {
          ciId: centerSummary.id,
          ciName: centerSummary.displayName,
          depth: 0,
          typeId: centerSummary.typeId,
        },
      ];
    } else {
      const currentLevel = levelStack.value[levelStack.value.length - 1];
      currentLevel.ciName = centerSummary.displayName;
      currentLevel.typeId = centerSummary.typeId;
    }

    const relationData = await getCiRelationsApi({
      id: ciId,
      depth: relationDepth.value,
    });

    const relatedIds = new Set<number>();
    relationData?.sourceRelations?.forEach((relation: any) => {
      const targetId = Number(
        relation.target_ci_id ?? relation.targetCiId ?? relation.TargetCiId ?? 0,
      );
      if (targetId) relatedIds.add(targetId);
    });
    relationData?.targetRelations?.forEach((relation: any) => {
      const sourceId = Number(
        relation.source_ci_id ?? relation.sourceCiId ?? relation.SourceCiId ?? 0,
      );
      if (sourceId) relatedIds.add(sourceId);
    });

    const summaryMap = await fetchCiSummaries(Array.from(relatedIds));
    const root = await buildTopologyTree(relationData ?? null, centerSummary, summaryMap);
    collapsedNodeIds.clear();
    treeData.value = root;
    lastLoadedCiId.value = ciId;

    await nextTick();
    updateChart();
  } catch (error) {
    console.error('加载拓扑数据失败:', error);
    message.error('加载拓扑数据失败');
  } finally {
    loading.value = false;
  }
};

const drillUp = () => {
  if (levelStack.value.length > 1) {
    levelStack.value.pop();
    const currentLevel = levelStack.value[levelStack.value.length - 1];
    currentTypeId.value = currentLevel.typeId ?? currentTypeId.value;
    loadTopologyData(currentLevel.ciId);
  }
};

const navigateToLevel = (levelIndex: number) => {
  if (levelIndex < levelStack.value.length - 1) {
    levelStack.value = levelStack.value.slice(0, levelIndex + 1);
    const targetLevel = levelStack.value[levelIndex];
    currentTypeId.value = targetLevel.typeId ?? currentTypeId.value;
    loadTopologyData(targetLevel.ciId);
  }
};

const refreshTopology = () => {
  if (currentCiId.value) {
    loadTopologyData(currentCiId.value);
  }
};

const resetZoom = () => {
  if (chartInstance.value) {
    chartInstance.value.dispatchAction({ type: 'restore' });
  }
};

const depthOptions = [
  { label: '1层', value: 1 },
  { label: '2层', value: 2 },
  { label: '3层', value: 3 },
  { label: '4层', value: 4 },
];

watch(relationDepth, () => {
  if (currentCiId.value) {
    loadTopologyData(currentCiId.value);
  }
});

onMounted(async () => {
  await nextTick();
  initChart();
  if (props.ciId) {
    await loadTopologyData(props.ciId);
  }
  window.addEventListener('resize', handleWindowResize);
});

watch(
  () => props.ciId,
  async (newCiId) => {
    if (!newCiId) {
      return;
    }
    scheduleHideHoverDetail(0);
    levelStack.value = [];
    collapsedNodeIds.clear();
    treeData.value = null;
    lastLoadedCiId.value = null;
    if (props.visible) {
      await loadTopologyData(newCiId);
    }
  },
);

watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      scheduleHideHoverDetail(0);
      return;
    }
    nextTick(() => {
      if (!chartInstance.value) {
        initChart();
      }
      chartInstance.value?.resize();
      if (treeData.value && lastLoadedCiId.value === currentCiId.value) {
        updateChart();
      } else if (props.ciId) {
        loadTopologyData(props.ciId);
      }
    });
  },
);

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleWindowResize);
  clearHoverHideTimer();
  if (chartInstance.value) {
    chartInstance.value.dispose();
    chartInstance.value = undefined as any;
  }
});
</script>

<style scoped>
.ci-topology-tab {
  background-color: #fafafa;
}

.topology-canvas {
  width: 100%;
  height: calc(100vh - 220px);
  min-height: 520px;
}

.fade-blur-enter-active,
.fade-blur-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease, filter 0.18s ease;
}

.fade-blur-enter-from,
.fade-blur-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
  filter: blur(6px);
}

.ci-hover-modal {
  position: absolute;
  min-width: 240px;
  max-width: 320px;
  pointer-events: none;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.22);
  color: #0f172a;
  backdrop-filter: blur(16px) saturate(140%);
}

.ci-hover-modal .modal-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ci-hover-modal .modal-content.loading {
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: #334155;
}

.loading-state,
.error-state,
.detail-state {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.loading-state {
  align-items: center;
  justify-content: center;
  color: #1d4ed8;
}

.error-state {
  align-items: center;
  justify-content: center;
  color: #dc2626;
}

.loading-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #2563eb;
  animation: hover-pulse 1.1s ease-in-out infinite;
}

@keyframes hover-pulse {
  0%,
  100% {
    transform: scale(0.7);
    opacity: 0.65;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.detail-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.2;
}

.detail-type {
  align-self: flex-start;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
  border: 1px solid rgba(59, 130, 246, 0.18);
}

.detail-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  gap: 4px;
  align-items: center;
}

.meta-row {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #475569;
}

.meta-label {
  width: 64px;
  flex-shrink: 0;
  color: #64748b;
}

.meta-value {
  color: #1f2937;
  font-weight: 500;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-item {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.12);
  color: #0369a1;
  border: 1px solid rgba(56, 189, 248, 0.18);
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  color: #1f2937;
  overflow: hidden;
  border-radius: 10px;
}

.detail-table th,
.detail-table td {
  padding: 6px 8px;
  vertical-align: top;
}

.detail-table th {
  width: 96px;
  color: #64748b;
  font-weight: 600;
  text-align: left;
}

.detail-table td {
  color: #111827;
  word-break: break-all;
}

.detail-table tr:nth-child(odd) {
  background: rgba(148, 163, 184, 0.12);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 8px;
  background: rgba(241, 245, 249, 0.78);
}

.grid-label {
  font-size: 11px;
  color: #64748b;
}

.grid-value {
  font-size: 12px;
  color: #0f172a;
  word-break: break-word;
}

.empty-hint {
  font-size: 12px;
  color: #94a3b8;
}

.level-breadcrumb :deep(.ant-breadcrumb-link) {
  font-weight: 500;
}

.level-breadcrumb :deep(.ant-breadcrumb-link:hover) {
  color: #1890ff;
}

/* Context menu removed */
</style>
