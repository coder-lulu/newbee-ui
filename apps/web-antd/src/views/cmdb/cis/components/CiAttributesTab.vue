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
  message,
  Modal,
  Select,
  Spin,
  Tag,
} from 'ant-design-vue';
// 导入二维码生成库
import QRCode from 'qrcode-generator';

// @ts-ignore
import { listAttributeGroupWithAttribute } from '#/api/cmdb/ci_types';
// @ts-ignore
import { getConfigItemById } from '#/api/cmdb/cis';

interface Props {
  ciId?: number;
  typeId?: number;
  typeName?: string;
  visible: boolean;
}

const props = defineProps<Props>();

// 路由实例
const router = useRouter();

// 响应式数据
const loading = ref(false);
const ciData = ref<any>(null);
const attributeGroups = ref<any[]>([]);

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
    const response = await getConfigItemById(props.ciId);
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
</style>
