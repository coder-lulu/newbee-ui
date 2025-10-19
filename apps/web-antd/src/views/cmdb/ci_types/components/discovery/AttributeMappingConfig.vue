<script lang="ts" setup>
import type { DiscoveryMethod } from './DiscoveryWizardModal.vue';
import { onMounted, ref, watch } from 'vue';
import { DiscoveryProviderAPI } from '#/api/io/discovery-provider';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Empty,
  Input,
  message,
  Row,
  Select,
  Space,
  Switch,
  Tag,
} from 'ant-design-vue';
import { ArrowRightOutlined, CheckCircleOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';

interface Props {
  typeId: number;
  method: DiscoveryMethod;
  initialMappings: any[];
  initialAutoImport: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  mappingsConfigured: [mappings: any[], autoImport: boolean];
}>();

// CI模型属性列表
const ciAttributes = ref<any[]>([]);
// 发现字段列表(动态加载)
const discoveryFields = ref<any[]>([]);
const loadingFields = ref(false);
// 映射关系列表
const mappings = ref<any[]>(props.initialMappings || []);
const autoImport = ref(props.initialAutoImport);

// 加载CI模型属性
const loadCiAttributes = async () => {
  try {
    // TODO: 调用API加载CI类型属性
    // const response = await getCiTypeAttributeList({ typeId: props.typeId });
    // ciAttributes.value = response?.data || [];
    
    // 模拟数据
    ciAttributes.value = [
      { id: 1, name: 'hostname', alias: '主机名', valueType: 'text', required: true },
      { id: 2, name: 'ip_address', alias: 'IP地址', valueType: 'text', required: true },
      { id: 3, name: 'os_type', alias: '操作系统', valueType: 'text', required: false },
      { id: 4, name: 'cpu_cores', alias: 'CPU核数', valueType: 'int', required: false },
      { id: 5, name: 'memory_gb', alias: '内存(GB)', valueType: 'int', required: false },
      { id: 6, name: 'disk_gb', alias: '磁盘(GB)', valueType: 'int', required: false },
      { id: 7, name: 'status', alias: '状态', valueType: 'text', required: false },
      { id: 8, name: 'region', alias: '区域', valueType: 'text', required: false },
    ];
  } catch (error) {
    console.error('加载CI属性失败:', error);
    message.error('加载CI属性失败');
  }
};

// 加载发现字段(从后端动态获取)
const loadDiscoveryFields = async () => {
  if (!props.method?.id) {
    return;
  }

  loadingFields.value = true;
  try {
    const res = await DiscoveryProviderAPI.getProviderSchema(props.method.id);
    if (res && res.data && res.data.fieldSchema) {
      discoveryFields.value = res.data.fieldSchema.map((field: any) => ({
        name: field.name,
        label: field.label,
        type: field.dataType,
        required: field.required,
        description: field.description,
        example: field.example,
      }));
    }
  } catch (error) {
    console.error('加载发现字段失败:', error);
    message.error('加载发现字段失败，使用默认配置');
    // Fallback到默认字段
    useFallbackFields();
  } finally {
    loadingFields.value = false;
  }
};

// Fallback字段配置
const useFallbackFields = () => {
  const fieldsByMethod: Record<string, any[]> = {
    vmware_vcenter: [
      { name: 'name', label: '虚拟机名称', type: 'string' },
      { name: 'ipAddress', label: 'IP地址', type: 'string' },
      { name: 'guestOS', label: '客户操作系统', type: 'string' },
      { name: 'numCPU', label: 'CPU数量', type: 'integer' },
      { name: 'memoryMB', label: '内存(MB)', type: 'integer' },
      { name: 'diskGB', label: '磁盘(GB)', type: 'integer' },
      { name: 'powerState', label: '电源状态', type: 'string' },
      { name: 'datacenter', label: '数据中心', type: 'string' },
    ],
    linux_ssh: [
      { name: 'hostname', label: '主机名', type: 'string' },
      { name: 'ip', label: 'IP地址', type: 'string' },
      { name: 'os_name', label: '操作系统', type: 'string' },
      { name: 'cpu_count', label: 'CPU核数', type: 'integer' },
      { name: 'memory_total', label: '总内存(GB)', type: 'integer' },
      { name: 'disk_total', label: '总磁盘(GB)', type: 'integer' },
      { name: 'uptime', label: '运行时间', type: 'string' },
    ],
    aliyun: [
      { name: 'InstanceName', label: '实例名称', type: 'string' },
      { name: 'InstanceId', label: '实例ID', type: 'string' },
      { name: 'PrivateIpAddress', label: '私网IP', type: 'string' },
      { name: 'OSName', label: '操作系统', type: 'string' },
      { name: 'Cpu', label: 'CPU核数', type: 'integer' },
      { name: 'Memory', label: '内存(MB)', type: 'integer' },
      { name: 'Status', label: '状态', type: 'string' },
      { name: 'RegionId', label: '地域', type: 'string' },
    ],
  };

  discoveryFields.value = fieldsByMethod[props.method.id] || [
    { name: 'field1', label: '字段1', type: 'string' },
    { name: 'field2', label: '字段2', type: 'string' },
    { name: 'field3', label: '字段3', type: 'integer' },
  ];
};

// 添加映射
const addMapping = (ciAttr?: any, discoveryField?: any) => {
  mappings.value.push({
    ciAttributeId: ciAttr?.id || null,
    ciAttributeName: ciAttr?.name || '',
    discoveryFieldName: discoveryField?.name || '',
    discoveryFieldLabel: discoveryField?.label || '',
    dataType: discoveryField?.type || 'string',
  });
  emitChanges();
};

// 删除映射
const removeMapping = (index: number) => {
  mappings.value.splice(index, 1);
  emitChanges();
};

// 检查CI属性是否已被映射
const isCiAttributeMapped = (attrId: number) => {
  return mappings.value.some((m) => m.ciAttributeId === attrId);
};

// 检查发现字段是否已被映射
const isDiscoveryFieldMapped = (fieldName: string) => {
  return mappings.value.some((m) => m.discoveryFieldName === fieldName);
};

// 快速映射(点击CI属性)
const handleCiAttrClick = (attr: any) => {
  if (isCiAttributeMapped(attr.id)) {
    message.warning('该属性已被映射');
    return;
  }
  // 查找未映射的发现字段
  const unmappedField = discoveryFields.value.find(
    (f) => !isDiscoveryFieldMapped(f.name)
  );
  if (unmappedField) {
    addMapping(attr, unmappedField);
  } else {
    addMapping(attr);
  }
};

// 快速映射(点击发现字段)
const handleDiscoveryFieldClick = (field: any) => {
  if (isDiscoveryFieldMapped(field.name)) {
    message.warning('该字段已被映射');
    return;
  }
  // 查找未映射的CI属性
  const unmappedAttr = ciAttributes.value.find(
    (a) => !isCiAttributeMapped(a.id)
  );
  if (unmappedAttr) {
    addMapping(unmappedAttr, field);
  } else {
    addMapping(undefined, field);
  }
};

const emitChanges = () => {
  emit('mappingsConfigured', mappings.value, autoImport.value);
};

watch([mappings, autoImport], emitChanges, { deep: true });

onMounted(() => {
  loadCiAttributes();
  loadDiscoveryFields();
});
</script>

<template>
  <div class="attribute-mapping-config">
    <div class="config-header">
      <h3>配置属性映射</h3>
      <p>将发现的数据字段映射到CI属性</p>
    </div>

    <Alert
      message="映射说明"
      description="左侧为CI模型属性,右侧为发现方式提供的字段。点击可快速创建映射,或手动在中间区域配置映射关系。"
      type="info"
      show-icon
      style="margin-bottom: 12px"
    />

    <div class="mapping-controls" style="margin-bottom: 12px">
      <Space>
        <Switch
          v-model:checked="autoImport"
          checked-children="自动入库"
          un-checked-children="仅入发现池"
        />
        <span style="color: #666; font-size: 13px">
          当前已映射 {{ mappings.length }} 个字段
        </span>
      </Space>
    </div>

    <Row :gutter="16">
      <!-- 左侧: CI模型属性 -->
      <Col :span="8">
        <Card title="CI模型属性" size="small" :bordered="true">
          <div class="attribute-list">
            <div
              v-for="attr in ciAttributes"
              :key="attr.id"
              :class="['attribute-item', { mapped: isCiAttributeMapped(attr.id) }]"
              @click="handleCiAttrClick(attr)"
            >
              <div class="attr-info">
                <span class="attr-name">{{ attr.alias || attr.name }}</span>
                <Tag v-if="attr.required" color="red" size="small">必填</Tag>
                <Tag :color="attr.valueType === 'text' ? 'blue' : 'green'" size="small">
                  {{ attr.valueType }}
                </Tag>
              </div>
              <CheckCircleOutlined
                v-if="isCiAttributeMapped(attr.id)"
                style="color: #52c41a"
              />
            </div>
            <Empty v-if="ciAttributes.length === 0" description="暂无属性" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          </div>
        </Card>
      </Col>

      <!-- 中间: 映射关系 -->
      <Col :span="8">
        <Card title="映射关系" size="small" :bordered="true">
          <div class="mapping-list">
            <div
              v-for="(mapping, index) in mappings"
              :key="index"
              class="mapping-item"
            >
              <div class="mapping-content">
                <div class="mapping-side left">
                  <Select
                    v-model:value="mapping.ciAttributeId"
                    placeholder="选择CI属性"
                    size="small"
                    style="width: 100%"
                  >
                    <Select.Option
                      v-for="attr in ciAttributes"
                      :key="attr.id"
                      :value="attr.id"
                      :disabled="isCiAttributeMapped(attr.id) && mapping.ciAttributeId !== attr.id"
                    >
                      {{ attr.alias || attr.name }}
                    </Select.Option>
                  </Select>
                </div>
                <div class="mapping-arrow">
                  <ArrowRightOutlined />
                </div>
                <div class="mapping-side right">
                  <Select
                    v-model:value="mapping.discoveryFieldName"
                    placeholder="选择发现字段"
                    size="small"
                    style="width: 100%"
                  >
                    <Select.Option
                      v-for="field in discoveryFields"
                      :key="field.name"
                      :value="field.name"
                      :disabled="isDiscoveryFieldMapped(field.name) && mapping.discoveryFieldName !== field.name"
                    >
                      {{ field.label }}
                    </Select.Option>
                  </Select>
                </div>
              </div>
              <Button
                type="text"
                danger
                size="small"
                @click="removeMapping(index)"
                style="margin-top: 4px"
              >
                <template #icon><DeleteOutlined /></template>
              </Button>
            </div>

            <Button
              type="dashed"
              block
              size="small"
              @click="addMapping()"
              style="margin-top: 8px"
            >
              <template #icon><PlusOutlined /></template>
              添加映射
            </Button>

            <Empty
              v-if="mappings.length === 0"
              description="暂无映射关系,点击两侧属性快速创建"
              :image="Empty.PRESENTED_IMAGE_SIMPLE"
              style="padding: 20px 0"
            />
          </div>
        </Card>
      </Col>

      <!-- 右侧: 发现字段 -->
      <Col :span="8">
        <Card title="发现字段" size="small" :bordered="true">
          <div class="field-list">
            <div
              v-for="field in discoveryFields"
              :key="field.name"
              :class="['field-item', { mapped: isDiscoveryFieldMapped(field.name) }]"
              @click="handleDiscoveryFieldClick(field)"
            >
              <div class="field-info">
                <span class="field-name">{{ field.label }}</span>
                <Tag :color="field.type === 'string' ? 'blue' : 'orange'" size="small">
                  {{ field.type }}
                </Tag>
              </div>
              <CheckCircleOutlined
                v-if="isDiscoveryFieldMapped(field.name)"
                style="color: #52c41a"
              />
            </div>
            <Empty v-if="discoveryFields.length === 0" description="暂无字段" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          </div>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<style scoped lang="less">
.attribute-mapping-config {
  .config-header {
    margin-bottom: 16px;
    text-align: center;

    h3 {
      margin-bottom: 4px;
      font-size: 16px;
      font-weight: 500;
    }

    p {
      color: #666;
      font-size: 13px;
    }
  }

  .mapping-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  :deep(.ant-card) {
    box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
    height: 450px;

    .ant-card-head {
      padding: 8px 12px;
      min-height: 36px;
      background-color: #f7f9fc;

      .ant-card-head-title {
        padding: 4px 0;
        font-size: 14px;
        font-weight: 500;
      }
    }

    .ant-card-body {
      padding: 12px;
      height: calc(100% - 36px);
      overflow-y: auto;
    }
  }

  .attribute-list,
  .field-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .attribute-item,
  .field-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: #fafafa;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: #e6f7ff;
      border-color: #1890ff;
    }

    &.mapped {
      background: #f6ffed;
      border-color: #b7eb8f;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .attr-info,
    .field-info {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;

      .attr-name,
      .field-name {
        font-size: 13px;
        font-weight: 500;
        color: #333;
      }
    }
  }

  .mapping-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .mapping-item {
    padding: 8px;
    background: linear-gradient(135deg, #fafcff 0%, #f0f8ff 100%);
    border: 1px solid #e8f4fd;
    border-radius: 6px;
    border-left: 3px solid #1890ff;

    .mapping-content {
      display: flex;
      align-items: center;
      gap: 8px;

      .mapping-side {
        flex: 1;

        &.left {
          text-align: left;
        }

        &.right {
          text-align: right;
        }
      }

      .mapping-arrow {
        color: #1890ff;
        font-size: 14px;
        font-weight: 600;
      }
    }
  }
}
</style>
