<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import {
  AlibabaOutlined,
  AmazonOutlined,
  ApiOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  DesktopOutlined,
  GlobalOutlined,
  HddOutlined,
  SafetyOutlined,
  WifiOutlined,
  WindowsOutlined,
} from '@ant-design/icons-vue';
import { Card, Col, Empty, Input, Radio, Row, Spin, Tag, message } from 'ant-design-vue';
import { DiscoveryProviderAPI } from '#/api/io/discovery-provider';

export interface DiscoveryMethod {
  id: string;
  name: string;
  icon: any;
  description: string;
  category: string;
  version?: string;
}

interface Props {
  selectedMethod: DiscoveryMethod | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  methodSelected: [method: DiscoveryMethod];
}>();

// 发现方式列表（动态加载）
const discoveryMethods = ref<DiscoveryMethod[]>([]);
const loading = ref(false);

// 图标映射
const iconMap: Record<string, any> = {
  cloud: CloudServerOutlined,
  network: WifiOutlined,
  system: DesktopOutlined,
  application: ApiOutlined,
  database: DatabaseOutlined,
  agent: SafetyOutlined,
  api: ApiOutlined,
  sdk: CloudServerOutlined,
  builtin: HddOutlined,
  file: HddOutlined,
};

// 加载Provider列表
const loadProviders = async () => {
  loading.value = true;
  try {
    const res = await DiscoveryProviderAPI.listProviders();
    if (res && res.data && Array.isArray(res.data)) {
      discoveryMethods.value = res.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        icon: iconMap[p.category] || CloudServerOutlined,
        description: p.description || '',
        category: p.category,
        version: p.version,
      }));
    } else if (res && Array.isArray(res)) {
      // 兼容直接返回数组的情况
      discoveryMethods.value = res.map((p: any) => ({
        id: p.id,
        name: p.name,
        icon: iconMap[p.category] || CloudServerOutlined,
        description: p.description || '',
        category: p.category,
        version: p.version,
      }));
    } else {
      // 如果API失败，使用fallback数据
      console.warn('API返回数据格式异常，使用fallback数据');
      discoveryMethods.value = fallbackMethods;
    }
  } catch (error) {
    console.error('加载发现方式失败:', error);
    message.warning('加载发现方式失败，使用内置配置');
    // 使用fallback数据
    discoveryMethods.value = fallbackMethods;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadProviders();
});

// 静态fallback数据（当API失败时）
const fallbackMethods: DiscoveryMethod[] = [
  // 云平台
  {
    id: 'vmware_vcenter',
    name: 'VMware vCenter',
    icon: CloudServerOutlined,
    description: '从VMware vCenter发现虚拟机、主机、集群等资源',
    category: 'cloud',
    requiredParams: ['host', 'username', 'password', 'port'],
  },
  {
    id: 'aliyun',
    name: '阿里云',
    icon: AlibabaOutlined,
    description: '从阿里云API发现ECS、RDS、SLB等云资源',
    category: 'cloud',
    requiredParams: ['accessKeyId', 'accessKeySecret', 'region'],
  },
  {
    id: 'aws',
    name: 'AWS',
    icon: AmazonOutlined,
    description: '从AWS API发现EC2、RDS、ELB等云资源',
    category: 'cloud',
    requiredParams: ['accessKeyId', 'secretAccessKey', 'region'],
  },
  {
    id: 'tencent_cloud',
    name: '腾讯云',
    icon: CloudServerOutlined,
    description: '从腾讯云API发现CVM、CDB等云资源',
    category: 'cloud',
    requiredParams: ['secretId', 'secretKey', 'region'],
  },
  {
    id: 'huawei_cloud',
    name: '华为云',
    icon: CloudServerOutlined,
    description: '从华为云API发现ECS、RDS等云资源',
    category: 'cloud',
    requiredParams: ['ak', 'sk', 'region'],
  },

  // 网络设备
  {
    id: 'network_switch',
    name: '交换机发现',
    icon: WifiOutlined,
    description: '通过SNMP协议发现交换机配置和端口信息',
    category: 'network',
    requiredParams: ['host', 'snmpCommunity', 'snmpVersion'],
  },
  {
    id: 'network_router',
    name: '路由器发现',
    icon: GlobalOutlined,
    description: '通过SNMP协议发现路由器配置和路由表信息',
    category: 'network',
    requiredParams: ['host', 'snmpCommunity', 'snmpVersion'],
  },
  {
    id: 'network_firewall',
    name: '防火墙发现',
    icon: SafetyOutlined,
    description: '通过API或SNMP发现防火墙规则和策略',
    category: 'network',
    requiredParams: ['host', 'protocol', 'credentials'],
  },

  // 操作系统
  {
    id: 'linux_ssh',
    name: 'Linux系统发现',
    icon: DesktopOutlined,
    description: '通过SSH连接发现Linux服务器的硬件和软件信息',
    category: 'system',
    requiredParams: ['host', 'port', 'username', 'password'],
  },
  {
    id: 'windows_wmi',
    name: 'Windows系统发现',
    icon: WindowsOutlined,
    description: '通过WMI协议发现Windows服务器信息',
    category: 'system',
    requiredParams: ['host', 'username', 'password', 'domain'],
  },

  // 数据库
  {
    id: 'mysql',
    name: 'MySQL数据库',
    icon: DatabaseOutlined,
    description: '发现MySQL数据库实例、库、表等信息',
    category: 'database',
    requiredParams: ['host', 'port', 'username', 'password'],
  },
  {
    id: 'oracle',
    name: 'Oracle数据库',
    icon: DatabaseOutlined,
    description: '发现Oracle数据库实例和表空间信息',
    category: 'database',
    requiredParams: ['host', 'port', 'sid', 'username', 'password'],
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL数据库',
    icon: DatabaseOutlined,
    description: '发现PostgreSQL数据库实例和数据库信息',
    category: 'database',
    requiredParams: ['host', 'port', 'database', 'username', 'password'],
  },

  // 应用
  {
    id: 'api_rest',
    name: 'REST API',
    icon: ApiOutlined,
    description: '通过自定义REST API接口发现资源',
    category: 'application',
    requiredParams: ['url', 'method', 'headers'],
  },
];

// 分类筛选
const selectedCategory = ref<string>('all');
const categoryOptions = [
  { label: '全部', value: 'all' },
  { label: '云平台', value: 'cloud' },
  { label: '网络设备', value: 'network' },
  { label: '操作系统', value: 'system' },
  { label: '数据库', value: 'database' },
  { label: '应用', value: 'application' },
];

// 搜索关键词
const searchKeyword = ref('');

// 过滤后的方法列表
const filteredMethods = computed(() => {
  let methods = discoveryMethods.value;

  // 分类筛选
  if (selectedCategory.value !== 'all') {
    methods = methods.filter((m) => m.category === selectedCategory.value);
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    methods = methods.filter(
      (m) =>
        m.name.toLowerCase().includes(keyword) || m.description.toLowerCase().includes(keyword),
    );
  }

  return methods;
});

// 选择发现方式
const handleSelectMethod = (method: DiscoveryMethod) => {
  emit('methodSelected', method);
};

// 分类颜色映射
const categoryColors: Record<string, string> = {
  cloud: 'blue',
  network: 'green',
  system: 'orange',
  database: 'purple',
  application: 'cyan',
};

// 分类名称映射
const categoryNames: Record<string, string> = {
  cloud: '云平台',
  network: '网络设备',
  system: '操作系统',
  database: '数据库',
  application: '应用',
};
</script>

<template>
  <div class="discovery-method-selector">
    <div class="selector-header">
      <h3>选择发现方式</h3>
      <p>选择合适的发现方式来自动采集配置项属性信息</p>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-area">
      <Row :gutter="16">
        <Col :span="12">
          <Radio.Group v-model:value="selectedCategory" button-style="solid">
            <Radio.Button v-for="option in categoryOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </Radio.Button>
          </Radio.Group>
        </Col>
        <Col :span="12">
          <Input.Search
            v-model:value="searchKeyword"
            placeholder="搜索发现方式..."
            allow-clear
            style="width: 100%"
          />
        </Col>
      </Row>
    </div>

    <!-- 方法列表 -->
    <Spin :spinning="loading" tip="加载发现方式...">
      <div class="methods-grid">
        <Row :gutter="[16, 16]">
          <Col v-for="method in filteredMethods" :key="method.id" :xs="24" :sm="12" :md="8" :lg="6">
          <Card
            hoverable
            :class="['method-card', { selected: props.selectedMethod?.id === method.id }]"
            @click="handleSelectMethod(method)"
          >
            <div class="method-icon">
              <component :is="method.icon" :style="{ fontSize: '32px', color: '#1890ff' }" />
            </div>
            <div class="method-info">
              <h4>{{ method.name }}</h4>
              <Tag :color="categoryColors[method.category]" size="small">
                {{ categoryNames[method.category] }}
              </Tag>
              <p class="description">{{ method.description }}</p>
            </div>
          </Card>
        </Col>
        </Row>

        <Empty v-if="filteredMethods.length === 0" description="未找到匹配的发现方式" />
      </div>
    </Spin>
  </div>
</template>

<style scoped lang="less">
.discovery-method-selector {
  .selector-header {
    margin-bottom: 16px;
    text-align: center;

    h3 {
      margin-bottom: 4px;
      font-size: 18px;
      font-weight: 500;
    }

    p {
      color: #666;
      font-size: 13px;
    }
  }

  .filter-area {
    margin-bottom: 16px;
  }

  .methods-grid {
    .method-card {
      height: 200px;
      transition: all 0.3s;
      cursor: pointer;
      box-shadow: 0 1px 2px rgb(0 0 0 / 5%);

      &:hover {
        border-color: #1890ff;
        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
      }

      &.selected {
        border-color: #1890ff;
        background: #e6f7ff;
        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.25);
      }

      :deep(.ant-card-body) {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
        padding: 16px;
      }

      .method-icon {
        margin-bottom: 12px;
      }

      .method-info {
        flex: 1;
        text-align: center;

        h4 {
          margin-bottom: 6px;
          font-size: 15px;
          font-weight: 500;
        }

        .description {
          margin-top: 6px;
          color: #666;
          font-size: 12px;
          line-height: 1.4;
        }
      }
    }
  }
}
</style>
