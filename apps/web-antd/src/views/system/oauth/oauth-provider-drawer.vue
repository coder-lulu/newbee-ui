<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import { Button, message, Space } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createOauthProvider,
  getOauthProviderById,
  testOauthProvider,
  updateOauthProvider,
} from '#/api/system/oauth';

import { modalSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    formItemClass: 'col-span-2',
    labelWidth: 120,
  },
  schema: modalSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

const testing = ref(false);

// 监听提供商类型变化，自动设置预设配置
watch(() => formApi.getValues().type, (newType) => {
  if (newType && !isUpdate.value) {
    setupProviderPresets(newType);
  }
});

// 设置提供商预设配置
function setupProviderPresets(type: string) {
  const presets: Record<string, any> = {
    google: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      infoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      scopes: 'openid profile email',
      supportPkce: true,
      providerType: 'oidc',
    },
    github: {
      authUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      infoUrl: 'https://api.github.com/user',
      scopes: 'user:email',
      supportPkce: false,
      providerType: 'oauth2',
    },
    wechat: {
      authUrl: 'https://open.weixin.qq.com/connect/qrconnect',
      tokenUrl: 'https://api.weixin.qq.com/sns/oauth2/access_token',
      infoUrl: 'https://api.weixin.qq.com/sns/userinfo',
      scopes: 'snsapi_login',
      supportPkce: false,
      providerType: 'oauth2',
    },
  };

  const preset = presets[type];
  if (preset) {
    formApi.setValues(preset);
  }
}

const [BasicDrawer, drawerApi] = useVbenDrawer({
  onCancel: handleCancel,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      return null;
    }
    drawerApi.drawerLoading(true);

    const { id } = drawerApi.getData() as { id?: number | string };
    isUpdate.value = !!id;

    if (isUpdate.value && id) {
      const record = await getOauthProviderById(id);
      await formApi.setValues(record);
    }

    drawerApi.drawerLoading(false);
  },
});

async function handleConfirm() {
  try {
    drawerApi.drawerLoading(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const data = cloneDeep(await formApi.getValues());
    
    // 数据处理
    if (data.extraConfig) {
      try {
        JSON.parse(data.extraConfig);
      } catch {
        message.error('额外配置必须是有效的JSON格式');
        return;
      }
    }
    
    await (isUpdate.value
      ? updateOauthProvider(data)
      : createOauthProvider(data));
    
    message.success(`${isUpdate.value ? '更新' : '创建'}成功`);
    emit('reload');
    await handleCancel();
  } catch (error) {
    console.error(error);
    message.error(`${isUpdate.value ? '更新' : '创建'}失败`);
  } finally {
    drawerApi.drawerLoading(false);
  }
}

// 测试连接
async function handleTestConnection() {
  try {
    const { valid } = await formApi.validate();
    if (!valid) {
      message.warning('请先完善配置信息');
      return;
    }
    
    const data = await formApi.getValues();
    if (!data.id) {
      message.warning('请先保存配置后再测试');
      return;
    }
    
    testing.value = true;
    const result = await testOauthProvider(data.id);
    
    if (result.connected) {
      message.success(`连接测试成功 (${result.responseTime}ms)`);
    } else {
      message.error(`连接测试失败: ${result.errorMessage}`);
    }
  } catch (error) {
    console.error('Test failed:', error);
    message.error('测试连接失败');
  } finally {
    testing.value = false;
  }
}

async function handleCancel() {
  drawerApi.close();
  await formApi.resetForm();
}
</script>

<template>
  <BasicDrawer
    :title="title"
    class="w-[800px] oauth-provider-drawer"
  >
    <template #extra>
      <Space>
        <Button
          v-if="isUpdate"
          :loading="testing"
          @click="handleTestConnection"
        >
          测试连接
        </Button>
      </Space>
    </template>
    <BasicForm />
  </BasicDrawer>
</template>

<style scoped>
/* 优化分割线样式 */
.oauth-provider-drawer :deep(.ant-divider) {
  margin: 16px 0 8px 0;
  font-weight: 500;
  color: #6b7280;
  font-size: 14px;
  display: block !important;
  width: 100% !important;
}

.oauth-provider-drawer :deep(.ant-divider-horizontal) {
  margin: 16px 0 8px 0;
  border-top: 1px solid #f0f0f0;
}

.oauth-provider-drawer :deep(.ant-divider-inner-text) {
  color: #6b7280;
  font-weight: 500;
  font-size: 14px;
  background: #fff;
  padding: 0 8px;
}

/* 强制修复开关按钮宽度问题 */
.oauth-provider-drawer :deep(.ant-switch) {
  width: 44px !important;
  min-width: 44px !important;
  max-width: 44px !important;
  height: 22px !important;
  flex-shrink: 0 !important;
  flex-grow: 0 !important;
  display: inline-block !important;
}

/* 确保开关组件容器不被拉伸 */
.oauth-provider-drawer :deep(.ant-form-item-control-input-content) {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  width: auto !important;
  flex-wrap: nowrap !important;
}

/* 开关组件的控制容器 */
.oauth-provider-drawer :deep(.ant-form-item-control) {
  flex: 1 !important;
  min-width: 0 !important;
}

/* 开关组件的输入内容区域 */
.oauth-provider-drawer :deep(.ant-form-item-control-input) {
  width: auto !important;
  min-height: auto !important;
  display: flex !important;
  align-items: center !important;
}

/* 优化表单布局 */
.oauth-provider-drawer :deep(.ant-form-item) {
  margin-bottom: 16px;
  display: flex !important;
  align-items: flex-start !important;
}

.oauth-provider-drawer :deep(.ant-form-item-label) {
  padding-bottom: 4px;
  width: 120px !important;
  flex-shrink: 0 !important;
}

/* 优化输入框样式 */
.oauth-provider-drawer :deep(.ant-input),
.oauth-provider-drawer :deep(.ant-select-selector) {
  border-radius: 6px;
}

/* 移除可能重复的按钮 */
.oauth-provider-drawer :deep(.ant-form-item-control-input-content .ant-btn) {
  display: none;
}

/* 优化drawer内容区域 */
.oauth-provider-drawer :deep(.ant-drawer-body) {
  padding: 24px;
}

/* 确保表单网格布局正确 */
.oauth-provider-drawer :deep(.ant-form) {
  max-width: 100%;
  display: grid !important;
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 16px !important;
}

/* 优化分割线间距 */
.oauth-provider-drawer :deep(.ant-divider-horizontal) {
  margin: 16px 0 8px 0;
}

/* 特殊处理开关字段 */
.oauth-provider-drawer :deep(.ant-form-item:has(.ant-switch)) {
  max-width: fit-content !important;
}

/* 开关组件内部元素 */
.oauth-provider-drawer :deep(.ant-switch-inner) {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
}

.oauth-provider-drawer :deep(.ant-switch-handle) {
  width: 18px !important;
  height: 18px !important;
  top: 2px !important;
  left: 2px !important;
}

.oauth-provider-drawer :deep(.ant-switch-checked .ant-switch-handle) {
  left: calc(100% - 20px) !important;
}

/* 禁止开关组件的自动拉伸 */
.oauth-provider-drawer :deep(.ant-form-item-control-input-content .ant-switch) {
  margin-right: auto !important;
}
</style>