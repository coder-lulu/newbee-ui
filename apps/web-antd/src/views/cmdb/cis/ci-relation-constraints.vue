<template>
  <div class="ci-relation-constraints h-full flex flex-col">
    <!-- 头部工具栏 -->
    <div class="mb-4 bg-white p-4 rounded-lg shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h2 class="text-xl font-semibold">CI关系约束配置</h2>
          <a-divider type="vertical" />
          <a-select
            v-model:value="filterCiType"
            :options="ciTypeOptions"
            placeholder="筛选CI类型"
            style="width: 200px"
            allow-clear
            @change="loadConstraintList"
          />
          <a-select
            v-model:value="filterConstraintType"
            :options="constraintTypeOptions"
            placeholder="筛选约束类型"
            style="width: 150px"
            allow-clear
            @change="loadConstraintList"
          />
        </div>
        <div class="flex items-center gap-2">
          <a-button type="primary" @click="showCreateConstraint">
            <template #icon>
              <PlusOutlined />
            </template>
            创建约束
          </a-button>
          <a-button @click="loadConstraintList" :loading="loading">
            <template #icon>
              <ReloadOutlined />
            </template>
            刷新
          </a-button>
          <a-button @click="showConstraintPreview" type="dashed">
            <template #icon>
              <EyeOutlined />
            </template>
            约束预览
          </a-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="mb-4 grid grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="bg-blue-100 p-3 rounded-full mr-3">
            <LinkOutlined class="text-blue-600 text-lg" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">{{ statistics.totalConstraints }}</div>
            <div class="text-sm text-gray-500">总约束数</div>
          </div>
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="bg-green-100 p-3 rounded-full mr-3">
            <CheckCircleOutlined class="text-green-600 text-lg" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">{{ statistics.activeConstraints }}</div>
            <div class="text-sm text-gray-500">激活约束</div>
          </div>
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="bg-yellow-100 p-3 rounded-full mr-3">
            <ExclamationTriangleOutlined class="text-yellow-600 text-lg" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">{{ statistics.violatedConstraints }}</div>
            <div class="text-sm text-gray-500">违反约束</div>
          </div>
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="bg-purple-100 p-3 rounded-full mr-3">
            <SettingOutlined class="text-purple-600 text-lg" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">{{ statistics.complexConstraints }}</div>
            <div class="text-sm text-gray-500">复杂约束</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 约束列表 -->
    <div class="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">约束配置列表</h3>
          <div class="flex items-center gap-2">
            <a-input-search
              v-model:value="searchKeyword"
              placeholder="搜索约束..."
              style="width: 250px"
              @search="handleSearch"
              allow-clear
            />
            <a-dropdown>
              <template #overlay>
                <a-menu @click="handleBulkAction">
                  <a-menu-item key="enable">批量启用</a-menu-item>
                  <a-menu-item key="disable">批量禁用</a-menu-item>
                  <a-menu-item key="validate">批量验证</a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="export">导出配置</a-menu-item>
                </a-menu>
              </template>
              <a-button v-if="selectedRowKeys.length > 0">
                批量操作 ({{ selectedRowKeys.length }})
                <DownOutlined />
              </a-button>
            </a-dropdown>
          </div>
        </div>
      </div>

      <a-table
        :columns="tableColumns"
        :data-source="constraintList"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        row-key="id"
        size="middle"
        @change="handleTableChange"
        class="constraint-table"
      >
        <!-- 约束类型 -->
        <template #constraintType="{ record }">
          <a-tag :color="getConstraintTypeColor(record.constraintType)">
            {{ getConstraintTypeText(record.constraintType) }}
          </a-tag>
        </template>

        <!-- CI类型关系 -->
        <template #ciTypeRelation="{ record }">
          <div class="flex items-center">
            <span class="font-medium">{{ record.parentTypeName }}</span>
            <ArrowRightOutlined class="mx-2 text-gray-400" />
            <span class="font-medium">{{ record.childTypeName }}</span>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            关系类型: {{ record.relationTypeName }}
          </div>
        </template>

        <!-- 约束详情 -->
        <template #constraintDetails="{ record }">
          <div class="space-y-1">
            <div v-if="record.maxCount !== null" class="text-sm">
              最大数量: <a-tag size="small">{{ record.maxCount }}</a-tag>
            </div>
            <div v-if="record.minCount !== null" class="text-sm">
              最小数量: <a-tag size="small">{{ record.minCount }}</a-tag>
            </div>
            <div v-if="record.customRules && record.customRules.length > 0" class="text-sm">
              自定义规则: <a-tag size="small" color="orange">{{ record.customRules.length }}条</a-tag>
            </div>
          </div>
        </template>

        <!-- 验证状态 -->
        <template #validationStatus="{ record }">
          <div class="flex items-center">
            <a-badge
              :status="getValidationStatusBadge(record.validationStatus)"
              :text="getValidationStatusText(record.validationStatus)"
            />
            <a-button
              type="text"
              size="small"
              @click="validateConstraint(record)"
              :loading="record.validating"
              class="ml-2"
            >
              验证
            </a-button>
          </div>
        </template>

        <!-- 状态 -->
        <template #status="{ record }">
          <a-switch
            v-model:checked="record.enabled"
            :loading="record.updating"
            @change="toggleConstraintStatus(record)"
            checked-children="启用"
            un-checked-children="禁用"
          />
        </template>

        <!-- 操作 -->
        <template #action="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="viewConstraintDetail(record)">
              详情
            </a-button>
            <a-button type="text" size="small" @click="editConstraint(record)">
              编辑
            </a-button>
            <a-button type="text" size="small" @click="duplicateConstraint(record)">
              复制
            </a-button>
            <a-popconfirm
              title="确定删除这个约束吗？"
              @confirm="deleteConstraint(record)"
              ok-text="确定"
              cancel-text="取消"
            >
              <a-button type="text" size="small" danger>
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </div>

    <!-- 创建/编辑约束模态框 -->
    <a-modal
      v-model:open="constraintModalVisible"
      :title="constraintModalTitle"
      width="900px"
      :confirm-loading="modalConfirmLoading"
      @ok="handleConstraintSubmit"
      @cancel="handleConstraintCancel"
      :destroy-on-close="true"
    >
      <a-form
        ref="constraintFormRef"
        :model="constraintForm"
        :rules="constraintFormRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
        class="mt-4"
      >
        <!-- 基本信息 -->
        <a-divider orientation="left">基本信息</a-divider>
        
        <a-form-item label="约束名称" name="name">
          <a-input v-model:value="constraintForm.name" placeholder="输入约束名称" />
        </a-form-item>

        <a-form-item label="描述" name="description">
          <a-textarea
            v-model:value="constraintForm.description"
            placeholder="输入约束描述"
            :rows="2"
          />
        </a-form-item>

        <!-- CI类型关系配置 -->
        <a-divider orientation="left">CI类型关系</a-divider>

        <a-form-item label="父CI类型" name="parentTypeId">
          <a-select
            v-model:value="constraintForm.parentTypeId"
            :options="ciTypeOptions"
            placeholder="选择父CI类型"
            @change="handleParentTypeChange"
          />
        </a-form-item>

        <a-form-item label="子CI类型" name="childTypeId">
          <a-select
            v-model:value="constraintForm.childTypeId"
            :options="ciTypeOptions"
            placeholder="选择子CI类型"
          />
        </a-form-item>

        <a-form-item label="关系类型" name="relationTypeId">
          <a-select
            v-model:value="constraintForm.relationTypeId"
            :options="relationTypeOptions"
            placeholder="选择关系类型"
          />
        </a-form-item>

        <!-- 约束配置 -->
        <a-divider orientation="left">约束配置</a-divider>

        <a-form-item label="约束类型" name="constraintType">
          <a-select v-model:value="constraintForm.constraintType" placeholder="选择约束类型">
            <a-select-option value="one_to_one">
              <div>
                <div>一对一 (One-to-One)</div>
                <div class="text-xs text-gray-500">每个CI只能有一个此类型的关系</div>
              </div>
            </a-select-option>
            <a-select-option value="one_to_many">
              <div>
                <div>一对多 (One-to-Many)</div>
                <div class="text-xs text-gray-500">源CI可以有多个目标CI，但目标CI只能有一个源CI</div>
              </div>
            </a-select-option>
            <a-select-option value="many_to_one">
              <div>
                <div>多对一 (Many-to-One)</div>
                <div class="text-xs text-gray-500">多个源CI可以指向同一个目标CI</div>
              </div>
            </a-select-option>
            <a-select-option value="many_to_many">
              <div>
                <div>多对多 (Many-to-Many)</div>
                <div class="text-xs text-gray-500">没有数量限制</div>
              </div>
            </a-select-option>
            <a-select-option value="custom">
              <div>
                <div>自定义约束</div>
                <div class="text-xs text-gray-500">自定义数量限制和规则</div>
              </div>
            </a-select-option>
          </a-select>
        </a-form-item>

        <!-- 数量限制（自定义约束时显示） -->
        <template v-if="constraintForm.constraintType === 'custom'">
          <a-form-item label="最小数量" name="minCount">
            <a-input-number
              v-model:value="constraintForm.minCount"
              :min="0"
              placeholder="最小关系数量"
            />
          </a-form-item>

          <a-form-item label="最大数量" name="maxCount">
            <a-input-number
              v-model:value="constraintForm.maxCount"
              :min="0"
              placeholder="最大关系数量，0表示无限制"
            />
          </a-form-item>
        </template>

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
            
            <div v-if="constraintForm.attributeMappings.length === 0" class="text-center text-gray-500 py-4">
              暂无属性映射配置
            </div>
            
            <div v-else class="space-y-3">
              <div
                v-for="(mapping, index) in constraintForm.attributeMappings"
                :key="index"
                class="flex items-center gap-2 p-3 border rounded-lg bg-gray-50"
              >
                <div class="flex-1">
                  <a-row :gutter="8">
                    <a-col :span="10">
                      <a-input v-model:value="mapping.parentAttrName" placeholder="父属性名称" size="small" />
                    </a-col>
                    <a-col :span="2" class="text-center">
                      <ArrowRightOutlined class="text-gray-400" />
                    </a-col>
                    <a-col :span="10">
                      <a-input v-model:value="mapping.childAttrName" placeholder="子属性名称" size="small" />
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
                </div>
              </div>
            </div>
          </div>
        </a-form-item>

        <!-- 自定义规则 -->
        <a-form-item label="自定义规则" name="customRules">
          <a-textarea
            v-model:value="constraintForm.customRulesText"
            placeholder="输入自定义验证规则，每行一条"
            :rows="4"
          />
          <div class="text-xs text-gray-500 mt-1">
            支持简单的验证表达式，如：source.status == 'active', target.type != 'temporary'
          </div>
        </a-form-item>

        <!-- 优先级和状态 -->
        <a-divider orientation="left">其他配置</a-divider>

        <a-form-item label="优先级" name="priority">
          <a-slider
            v-model:value="constraintForm.priority"
            :min="1"
            :max="10"
            :marks="{ 1: '低', 5: '中', 10: '高' }"
            :tooltip-formatter="(value: number) => `优先级: ${value}`"
          />
        </a-form-item>

        <a-form-item label="启用状态" name="enabled">
          <a-switch
            v-model:checked="constraintForm.enabled"
            checked-children="启用"
            un-checked-children="禁用"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 约束详情抽屉 -->
    <a-drawer
      v-model:open="constraintDetailVisible"
      title="约束详情"
      width="600"
      :destroy-on-close="true"
    >
      <div v-if="selectedConstraint">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="约束名称">
            {{ selectedConstraint.name }}
          </a-descriptions-item>
          <a-descriptions-item label="约束类型">
            <a-tag :color="getConstraintTypeColor(selectedConstraint.constraintType)">
              {{ getConstraintTypeText(selectedConstraint.constraintType) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="CI类型关系">
            {{ selectedConstraint.parentTypeName }} → {{ selectedConstraint.childTypeName }}
          </a-descriptions-item>
          <a-descriptions-item label="关系类型">
            {{ selectedConstraint.relationTypeName }}
          </a-descriptions-item>
          <a-descriptions-item label="描述" v-if="selectedConstraint.description">
            {{ selectedConstraint.description }}
          </a-descriptions-item>
          <a-descriptions-item label="优先级">
            <a-tag>{{ selectedConstraint.priority }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="selectedConstraint.enabled ? 'green' : 'red'">
              {{ selectedConstraint.enabled ? '启用' : '禁用' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="验证状态">
            <a-badge
              :status="getValidationStatusBadge(selectedConstraint.validationStatus)"
              :text="getValidationStatusText(selectedConstraint.validationStatus)"
            />
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ formatDateTime(selectedConstraint.createdAt) }}
          </a-descriptions-item>
          <a-descriptions-item label="更新时间">
            {{ formatDateTime(selectedConstraint.updatedAt) }}
          </a-descriptions-item>
        </a-descriptions>

        <!-- 约束配置详情 -->
        <div v-if="selectedConstraint.constraintType === 'custom'" class="mt-4">
          <h4 class="mb-2">数量限制</h4>
          <div class="bg-gray-100 p-3 rounded">
            <div v-if="selectedConstraint.minCount !== null">
              最小数量: {{ selectedConstraint.minCount }}
            </div>
            <div v-if="selectedConstraint.maxCount !== null">
              最大数量: {{ selectedConstraint.maxCount }}
            </div>
          </div>
        </div>

        <!-- 自定义规则 -->
        <div v-if="selectedConstraint.customRules && selectedConstraint.customRules.length > 0" class="mt-4">
          <h4 class="mb-2">自定义规则</h4>
          <div class="bg-gray-100 p-3 rounded">
            <div v-for="(rule, index) in selectedConstraint.customRules" :key="index" class="mb-1">
              {{ index + 1 }}. {{ rule }}
            </div>
          </div>
        </div>

        <!-- 属性映射 -->
        <div v-if="selectedConstraint.attributeMappings && selectedConstraint.attributeMappings.length > 0" class="mt-4">
          <h4 class="mb-2">属性映射</h4>
          <a-table
            :dataSource="selectedConstraint.attributeMappings"
            :columns="[
              { title: '父属性', dataIndex: 'parentAttrName', key: 'parentAttrName' },
              { title: '子属性', dataIndex: 'childAttrName', key: 'childAttrName' },
            ]"
            :pagination="false"
            size="small"
          />
        </div>
      </div>
    </a-drawer>

    <!-- 约束预览抽屉 -->
    <a-drawer
      v-model:open="constraintPreviewVisible"
      title="约束预览"
      width="800"
      :destroy-on-close="true"
    >
      <div class="space-y-4">
        <div>
          <h4 class="mb-2">约束类型分布</h4>
          <div ref="constraintChartContainer" class="w-full h-64 border rounded"></div>
        </div>
        
        <div>
          <h4 class="mb-2">验证状态统计</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-green-50 p-3 rounded">
              <div class="text-sm text-gray-600">验证通过</div>
              <div class="text-2xl font-bold text-green-600">{{ previewStats.validPassed }}</div>
            </div>
            <div class="bg-red-50 p-3 rounded">
              <div class="text-sm text-gray-600">验证失败</div>
              <div class="text-2xl font-bold text-red-600">{{ previewStats.validFailed }}</div>
            </div>
          </div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import {
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  ExclamationTriangleOutlined,
  SettingOutlined,
  DownOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue';

// 类型定义
interface ConstraintInfo {
  id: number;
  name: string;
  description: string;
  parentTypeId: number;
  parentTypeName: string;
  childTypeId: number;
  childTypeName: string;
  relationTypeId: number;
  relationTypeName: string;
  constraintType: string;
  minCount?: number;
  maxCount?: number;
  priority: number;
  enabled: boolean;
  validationStatus: string;
  customRules?: string[];
  attributeMappings?: Array<{
    parentAttrName: string;
    childAttrName: string;
  }>;
  createdAt: string;
  updatedAt: string;
  updating?: boolean;
  validating?: boolean;
}

interface ConstraintForm {
  id?: number;
  name: string;
  description: string;
  parentTypeId: number;
  childTypeId: number;
  relationTypeId: number;
  constraintType: string;
  minCount?: number;
  maxCount?: number;
  priority: number;
  enabled: boolean;
  customRulesText: string;
  attributeMappings: Array<{
    parentAttrName: string;
    childAttrName: string;
  }>;
}

interface Statistics {
  totalConstraints: number;
  activeConstraints: number;
  violatedConstraints: number;
  complexConstraints: number;
}

// 响应式数据
const loading = ref(false);
const filterCiType = ref<number>();
const filterConstraintType = ref<string>();
const searchKeyword = ref('');

// 列表数据
const constraintList = ref<ConstraintInfo[]>([]);
const selectedRowKeys = ref<number[]>([]);

// 选项数据
const ciTypeOptions = ref<Array<{ label: string; value: number }>>([]);
const relationTypeOptions = ref<Array<{ label: string; value: number }>>([]);

// 统计数据
const statistics = reactive<Statistics>({
  totalConstraints: 0,
  activeConstraints: 0,
  violatedConstraints: 0,
  complexConstraints: 0,
});

// 模态框
const constraintModalVisible = ref(false);
const modalConfirmLoading = ref(false);
const constraintFormRef = ref();

// 详情抽屉
const constraintDetailVisible = ref(false);
const selectedConstraint = ref<ConstraintInfo>();

// 预览抽屉
const constraintPreviewVisible = ref(false);
const constraintChartContainer = ref<HTMLElement>();
const previewStats = reactive({
  validPassed: 0,
  validFailed: 0,
});

// 约束类型选项
const constraintTypeOptions = [
  { label: '一对一', value: 'one_to_one' },
  { label: '一对多', value: 'one_to_many' },
  { label: '多对一', value: 'many_to_one' },
  { label: '多对多', value: 'many_to_many' },
  { label: '自定义', value: 'custom' },
];

// 表单数据
const constraintForm = reactive<ConstraintForm>({
  name: '',
  description: '',
  parentTypeId: 0,
  childTypeId: 0,
  relationTypeId: 0,
  constraintType: 'one_to_one',
  priority: 5,
  enabled: true,
  customRulesText: '',
  attributeMappings: [],
});

// 表单验证规则
const constraintFormRules = {
  name: [{ required: true, message: '请输入约束名称' }],
  parentTypeId: [{ required: true, message: '请选择父CI类型', type: 'number' }],
  childTypeId: [{ required: true, message: '请选择子CI类型', type: 'number' }],
  relationTypeId: [{ required: true, message: '请选择关系类型', type: 'number' }],
  constraintType: [{ required: true, message: '请选择约束类型' }],
};

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`,
});

// 计算属性
const constraintModalTitle = computed(() => {
  return constraintForm.id ? '编辑约束配置' : '创建约束配置';
});

// 表格列配置
const tableColumns = [
  {
    title: '约束名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
  },
  {
    title: '约束类型',
    dataIndex: 'constraintType',
    key: 'constraintType',
    width: 120,
    slots: { customRender: 'constraintType' },
  },
  {
    title: 'CI类型关系',
    dataIndex: 'ciTypeRelation',
    key: 'ciTypeRelation',
    width: 250,
    slots: { customRender: 'ciTypeRelation' },
  },
  {
    title: '约束详情',
    dataIndex: 'constraintDetails',
    key: 'constraintDetails',
    width: 200,
    slots: { customRender: 'constraintDetails' },
  },
  {
    title: '验证状态',
    dataIndex: 'validationStatus',
    key: 'validationStatus',
    width: 140,
    slots: { customRender: 'validationStatus' },
  },
  {
    title: '状态',
    dataIndex: 'enabled',
    key: 'enabled',
    width: 100,
    slots: { customRender: 'status' },
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 80,
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    slots: { customRender: 'action' },
  },
];

// 行选择配置
const rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys: number[]) => {
    selectedRowKeys.value = keys;
  },
};

// 方法
const formatDateTime = (dateTime: string) => {
  return dateTime ? dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss') : '-';
};

const getConstraintTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'one_to_one': 'blue',
    'one_to_many': 'green',
    'many_to_one': 'orange',
    'many_to_many': 'purple',
    'custom': 'red',
  };
  return colorMap[type] || 'default';
};

const getConstraintTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'one_to_one': '一对一',
    'one_to_many': '一对多',
    'many_to_one': '多对一',
    'many_to_many': '多对多',
    'custom': '自定义',
  };
  return textMap[type] || type;
};

const getValidationStatusBadge = (status: string) => {
  const badgeMap: Record<string, string> = {
    'passed': 'success',
    'failed': 'error',
    'warning': 'warning',
    'pending': 'processing',
  };
  return badgeMap[status] || 'default';
};

const getValidationStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'passed': '验证通过',
    'failed': '验证失败',
    'warning': '有警告',
    'pending': '待验证',
  };
  return textMap[status] || status;
};

// 加载约束列表
const loadConstraintList = async () => {
  loading.value = true;
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟数据
    const mockData: ConstraintInfo[] = [
      {
        id: 1,
        name: '服务器-应用依赖约束',
        description: '服务器与应用之间的依赖关系约束',
        parentTypeId: 1,
        parentTypeName: '服务器',
        childTypeId: 2,
        childTypeName: '应用',
        relationTypeId: 1,
        relationTypeName: '依赖',
        constraintType: 'one_to_many',
        priority: 8,
        enabled: true,
        validationStatus: 'passed',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      },
      {
        id: 2,
        name: '数据库-应用连接约束',
        description: '数据库与应用之间的连接关系约束',
        parentTypeId: 3,
        parentTypeName: '数据库',
        childTypeId: 2,
        childTypeName: '应用',
        relationTypeId: 2,
        relationTypeName: '连接',
        constraintType: 'many_to_many',
        priority: 5,
        enabled: true,
        validationStatus: 'warning',
        customRules: ['source.status == "active"', 'target.port != null'],
        createdAt: '2024-01-03T00:00:00.000Z',
        updatedAt: '2024-01-04T00:00:00.000Z',
      },
      {
        id: 3,
        name: '负载均衡器约束',
        description: '负载均衡器与服务器的连接约束',
        parentTypeId: 4,
        parentTypeName: '负载均衡器',
        childTypeId: 1,
        childTypeName: '服务器',
        relationTypeId: 2,
        relationTypeName: '连接',
        constraintType: 'custom',
        minCount: 2,
        maxCount: 10,
        priority: 9,
        enabled: false,
        validationStatus: 'failed',
        attributeMappings: [
          { parentAttrName: 'port', childAttrName: 'listen_port' },
          { parentAttrName: 'protocol', childAttrName: 'protocol' },
        ],
        createdAt: '2024-01-05T00:00:00.000Z',
        updatedAt: '2024-01-06T00:00:00.000Z',
      },
    ];

    // 应用筛选
    let filteredData = mockData;
    if (filterCiType.value) {
      filteredData = filteredData.filter(
        item => item.parentTypeId === filterCiType.value || item.childTypeId === filterCiType.value
      );
    }
    if (filterConstraintType.value) {
      filteredData = filteredData.filter(item => item.constraintType === filterConstraintType.value);
    }
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      filteredData = filteredData.filter(
        item => item.name.toLowerCase().includes(keyword) ||
                item.description.toLowerCase().includes(keyword)
      );
    }

    constraintList.value = filteredData;
    pagination.total = filteredData.length;

    // 更新统计
    updateStatistics(mockData);
    
  } catch (error) {
    console.error('加载约束列表失败:', error);
    message.error('加载约束列表失败');
  } finally {
    loading.value = false;
  }
};

// 更新统计信息
const updateStatistics = (constraints: ConstraintInfo[]) => {
  statistics.totalConstraints = constraints.length;
  statistics.activeConstraints = constraints.filter(c => c.enabled).length;
  statistics.violatedConstraints = constraints.filter(c => c.validationStatus === 'failed').length;
  statistics.complexConstraints = constraints.filter(c => c.constraintType === 'custom').length;
};

// 加载选项数据
const loadOptions = async () => {
  // 模拟CI类型选项
  ciTypeOptions.value = [
    { label: '服务器', value: 1 },
    { label: '应用', value: 2 },
    { label: '数据库', value: 3 },
    { label: '负载均衡器', value: 4 },
    { label: '网络设备', value: 5 },
  ];

  // 模拟关系类型选项
  relationTypeOptions.value = [
    { label: '依赖', value: 1 },
    { label: '连接', value: 2 },
    { label: '包含', value: 3 },
    { label: '监控', value: 4 },
  ];
};

// 搜索处理
const handleSearch = () => {
  loadConstraintList();
};

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
};

// 显示创建约束
const showCreateConstraint = () => {
  Object.assign(constraintForm, {
    id: undefined,
    name: '',
    description: '',
    parentTypeId: 0,
    childTypeId: 0,
    relationTypeId: 0,
    constraintType: 'one_to_one',
    priority: 5,
    enabled: true,
    customRulesText: '',
    attributeMappings: [],
  });
  constraintModalVisible.value = true;
};

// 编辑约束
const editConstraint = (record: ConstraintInfo) => {
  Object.assign(constraintForm, {
    id: record.id,
    name: record.name,
    description: record.description,
    parentTypeId: record.parentTypeId,
    childTypeId: record.childTypeId,
    relationTypeId: record.relationTypeId,
    constraintType: record.constraintType,
    minCount: record.minCount,
    maxCount: record.maxCount,
    priority: record.priority,
    enabled: record.enabled,
    customRulesText: record.customRules?.join('\n') || '',
    attributeMappings: record.attributeMappings || [],
  });
  constraintModalVisible.value = true;
};

// 查看约束详情
const viewConstraintDetail = (record: ConstraintInfo) => {
  selectedConstraint.value = record;
  constraintDetailVisible.value = true;
};

// 复制约束
const duplicateConstraint = (record: ConstraintInfo) => {
  Object.assign(constraintForm, {
    id: undefined,
    name: `${record.name} - 副本`,
    description: record.description,
    parentTypeId: record.parentTypeId,
    childTypeId: record.childTypeId,
    relationTypeId: record.relationTypeId,
    constraintType: record.constraintType,
    minCount: record.minCount,
    maxCount: record.maxCount,
    priority: record.priority,
    enabled: false,
    customRulesText: record.customRules?.join('\n') || '',
    attributeMappings: record.attributeMappings || [],
  });
  constraintModalVisible.value = true;
};

// 删除约束
const deleteConstraint = async (record: ConstraintInfo) => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    message.success('约束删除成功');
    loadConstraintList();
  } catch (error) {
    console.error('删除约束失败:', error);
    message.error('删除约束失败');
  }
};

// 切换约束状态
const toggleConstraintStatus = async (record: ConstraintInfo) => {
  record.updating = true;
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    message.success(`约束已${record.enabled ? '启用' : '禁用'}`);
  } catch (error) {
    console.error('更新约束状态失败:', error);
    message.error('更新约束状态失败');
    record.enabled = !record.enabled; // 回滚状态
  } finally {
    record.updating = false;
  }
};

// 验证约束
const validateConstraint = async (record: ConstraintInfo) => {
  record.validating = true;
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 模拟验证结果
    const results = ['passed', 'failed', 'warning'];
    record.validationStatus = results[Math.floor(Math.random() * results.length)];
    
    message.success('约束验证完成');
  } catch (error) {
    console.error('验证约束失败:', error);
    message.error('验证约束失败');
  } finally {
    record.validating = false;
  }
};

// 批量操作处理
const handleBulkAction = ({ key }: { key: string }) => {
  const selectedCount = selectedRowKeys.value.length;
  
  switch (key) {
    case 'enable':
      Modal.confirm({
        title: '批量启用约束',
        content: `确定要启用选中的 ${selectedCount} 个约束吗？`,
        onOk: () => {
          message.success('批量启用成功');
          selectedRowKeys.value = [];
          loadConstraintList();
        },
      });
      break;
    case 'disable':
      Modal.confirm({
        title: '批量禁用约束',
        content: `确定要禁用选中的 ${selectedCount} 个约束吗？`,
        onOk: () => {
          message.success('批量禁用成功');
          selectedRowKeys.value = [];
          loadConstraintList();
        },
      });
      break;
    case 'validate':
      message.info('正在批量验证约束...');
      setTimeout(() => {
        message.success('批量验证完成');
        loadConstraintList();
      }, 2000);
      break;
    case 'export':
      message.info('正在导出约束配置...');
      break;
  }
};

// 父类型变化处理
const handleParentTypeChange = () => {
  // 可以在这里实现一些联动逻辑
};

// 添加属性映射
const addAttributeMapping = () => {
  constraintForm.attributeMappings.push({
    parentAttrName: '',
    childAttrName: '',
  });
};

// 删除属性映射
const removeAttributeMapping = (index: number) => {
  constraintForm.attributeMappings.splice(index, 1);
};

// 提交约束表单
const handleConstraintSubmit = async () => {
  try {
    await constraintFormRef.value?.validate();
    
    modalConfirmLoading.value = true;
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    message.success(constraintForm.id ? '约束更新成功' : '约束创建成功');
    constraintModalVisible.value = false;
    loadConstraintList();
  } catch (error) {
    console.error('操作失败:', error);
    message.error('操作失败');
  } finally {
    modalConfirmLoading.value = false;
  }
};

// 取消约束操作
const handleConstraintCancel = () => {
  constraintModalVisible.value = false;
};

// 显示约束预览
const showConstraintPreview = async () => {
  constraintPreviewVisible.value = true;
  
  await nextTick();
  
  // 更新预览统计
  previewStats.validPassed = constraintList.value.filter(c => c.validationStatus === 'passed').length;
  previewStats.validFailed = constraintList.value.filter(c => c.validationStatus === 'failed').length;
  
  // 绘制图表
  drawConstraintChart();
};

// 绘制约束图表
const drawConstraintChart = () => {
  if (!constraintChartContainer.value) return;
  
  const chartInstance = echarts.init(constraintChartContainer.value);
  
  // 统计约束类型分布
  const typeStats = constraintList.value.reduce((acc, constraint) => {
    acc[constraint.constraintType] = (acc[constraint.constraintType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const data = Object.entries(typeStats).map(([type, count]) => ({
    name: getConstraintTypeText(type),
    value: count,
    itemStyle: {
      color: getConstraintTypeColor(type) === 'blue' ? '#1890ff' :
             getConstraintTypeColor(type) === 'green' ? '#52c41a' :
             getConstraintTypeColor(type) === 'orange' ? '#fa8c16' :
             getConstraintTypeColor(type) === 'purple' ? '#722ed1' :
             '#f5222d'
    }
  }));
  
  const option = {
    title: {
      text: '约束类型分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    series: [
      {
        name: '约束类型',
        type: 'pie',
        radius: '60%',
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  
  chartInstance.setOption(option);
};

// 生命周期
onMounted(async () => {
  await loadOptions();
  await loadConstraintList();
});
</script>

<style scoped>
.ci-relation-constraints {
  background-color: #f5f5f5;
}

:deep(.constraint-table .ant-table-tbody > tr > td) {
  padding: 12px 16px;
}

:deep(.constraint-table .ant-table-thead > tr > th) {
  background-color: #fafafa;
  font-weight: 600;
}

:deep(.ant-descriptions-item-label) {
  font-weight: 600;
  width: 120px;
}

:deep(.ant-form-item-label) {
  font-weight: 600;
}

:deep(.ant-divider-horizontal.ant-divider-with-text) {
  margin: 16px 0;
}
</style>