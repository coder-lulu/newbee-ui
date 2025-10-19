<script setup lang="tsx">
import type { VxeGridProps } from '@vben/plugins/vxe-table';
import type { BindItem } from '../../oauth-common';
import type { UserOauthProviderInfo } from '#/api/system/oauth/model';

import { computed, ref, unref, onMounted } from 'vue';

import { useVbenVxeGrid } from '@vben/plugins/vxe-table';

import { Alert, Avatar, Card, List, ListItem, Modal, Row, Col, Statistic, Tag, Button, Popconfirm, message } from 'ant-design-vue';
import { LinkOutlined, UnlockOutlined } from '@ant-design/icons-vue';

import { authUnbinding } from '#/api';
import { socialList } from '#/api/system/social';
import { getUserOauthProviders, unbindOauthAccount } from '#/api/system/oauth';

import { accountBindList, handleAuthBinding } from '../../oauth-common';

function buttonText(item: BindItem) {
  return item.bound ? '已绑定' : '绑定';
}

/**
 * 已经绑定的平台
 */
const boundPlatformsList = ref<string[]>([]);
const bindList = computed<BindItem[]>(() => {
  const list = [...accountBindList];
  list.forEach((item) => {
    item.bound = !!unref(boundPlatformsList).includes(item.source);
  });
  return list;
});

// OAuth提供商数据
const userProviders = ref<UserOauthProviderInfo[]>([]);

// 加载OAuth提供商数据
async function loadUserProviders() {
  try {
    userProviders.value = await getUserOauthProviders();
  } catch (error) {
    console.error('Failed to load user providers:', error);
  }
}

// 解绑OAuth账户
async function handleOauthUnbind(provider: UserOauthProviderInfo) {
  try {
    await unbindOauthAccount({
      userId: 'current-user-id', // 这里应该从用户状态获取当前用户ID
      providerId: provider.id
    });
    message.success('解绑成功');
    await reloadAllData();
  } catch (error) {
    console.error('Unbind failed:', error);
    message.error('解绑失败');
  }
}

const gridOptions: VxeGridProps = {
  columns: [
    {
      field: 'source',
      title: '绑定平台',
    },
    {
      slots: {
        default: ({ row }) => {
          return <Avatar src={row.avatar} />;
        },
      },
      field: 'avatar',
      title: '头像',
    },
    {
      align: 'center',
      field: 'username',
      title: '账号',
    },
    {
      align: 'center',
      slots: {
        default: 'action',
      },
      title: '操作',
    },
  ],
  height: 220,
  keepSource: true,
  pagerConfig: {
    enabled: false,
  },
  toolbarConfig: {
    enabled: false,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        const resp = await socialList();
        /**
         * 平台转小写
         * 已经绑定的平台
         */
        boundPlatformsList.value = resp.map((item) =>
          item.source.toLowerCase(),
        );
        return {
          rows: resp,
        };
      },
    },
  },
  rowConfig: {
    isCurrent: false,
    keyField: 'id',
  },
  id: 'profile-bind-table',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  gridOptions,
});

/**
 * 解绑账号
 */
function handleUnbind(record: Record<string, any>) {
  Modal.confirm({
    content: `确定解绑[${record.source}]平台的[${record.userName}]账号吗？`,
    async onOk() {
      await authUnbinding(record.id);
      await tableApi.reload();
    },
    title: '提示',
    type: 'warning',
  });
}

// 重新加载所有数据
async function reloadAllData() {
  await loadUserProviders();
  await tableApi.reload();
}

onMounted(() => {
  loadUserProviders();
});
</script>

<template>
  <div class="flex flex-col gap-[16px]">
    <!-- 简化的统计指标 -->
    <Row :gutter="16" class="mb-4">
      <Col :span="12">
        <Card size="small">
          <Statistic
            title="已绑定账户"
            :value="userProviders.filter(p => p.isBound).length || 0"
            :value-style="{ color: '#3f8600', fontSize: '20px' }"
          >
            <template #prefix>
              <LinkOutlined style="color: #3f8600" />
            </template>
            <template #suffix>
              <span class="text-sm text-gray-500">/ {{ userProviders.length }}</span>
            </template>
          </Statistic>
        </Card>
      </Col>
      <Col :span="12">
        <Card size="small">
          <Statistic
            title="可用平台"
            :value="bindList.length"
            :value-style="{ color: '#1890ff', fontSize: '20px' }"
          >
            <template #prefix>
              <UnlockOutlined style="color: #1890ff" />
            </template>
          </Statistic>
        </Card>
      </Col>
    </Row>

    <!-- 已绑定账户管理 -->
    <div>
      <h4 class="mb-3 text-base font-medium">已绑定的账户</h4>
      <BasicTable>
        <template #action="{ row }">
          <a-button type="link" @click="handleUnbind(row)">解绑</a-button>
        </template>
      </BasicTable>
    </div>

    <!-- 已绑定的OAuth账户 -->
    <div v-if="userProviders.filter(p => p.isBound).length > 0">
      <h4 class="mb-3 text-base font-medium">已绑定的OAuth账户</h4>
      <Row :gutter="[16, 16]" class="mb-6">
        <Col 
          v-for="provider in userProviders.filter(p => p.isBound)" 
          :key="provider.id"
          :xl="8" :lg="12" :md="24"
        >
          <Card 
            size="small" 
            :hoverable="true"
            class="provider-card bound"
            style="border-color: #52c41a"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Avatar 
                  :src="provider.iconUrl" 
                  :size="32"
                  style="backgroundColor: #52c41a"
                >
                  {{ provider.displayName?.charAt(0) }}
                </Avatar>
                <div>
                  <div class="font-medium text-sm">{{ provider.displayName }}</div>
                  <div class="text-xs text-gray-500">
                    {{ provider.boundAccount?.providerEmail || '已绑定账户' }}
                  </div>
                  <div class="text-xs text-gray-400">
                    登录{{ provider.boundAccount?.loginCount || 0 }}次
                  </div>
                </div>
              </div>
              <div class="flex flex-col items-end gap-1">
                <Tag color="success" size="small">已绑定</Tag>
                <Popconfirm
                  title="确定要解绑此账户吗？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleOauthUnbind(provider)"
                >
                  <Button type="link" size="small" danger class="p-0">
                    解绑
                  </Button>
                </Popconfirm>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>

    <!-- 可绑定的OAuth账户 -->
    <div v-if="userProviders.filter(p => !p.isBound).length > 0">
      <h4 class="mb-3 text-base font-medium">可绑定的OAuth账户</h4>
      <Row :gutter="[16, 16]" class="mb-6">
        <Col 
          v-for="provider in userProviders.filter(p => !p.isBound)" 
          :key="provider.id"
          :xl="8" :lg="12" :md="24"
        >
          <Card 
            size="small" 
            :hoverable="true"
            class="provider-card unbound"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Avatar 
                  :src="provider.iconUrl" 
                  :size="32"
                  style="backgroundColor: #d9d9d9"
                >
                  {{ provider.displayName?.charAt(0) }}
                </Avatar>
                <div>
                  <div class="font-medium text-sm">{{ provider.displayName }}</div>
                  <div class="text-xs text-gray-500">点击绑定账户</div>
                </div>
              </div>
              <div class="flex flex-col items-end gap-1">
                <Tag color="default" size="small">未绑定</Tag>
                <Button type="primary" size="small" class="p-1">
                  立即绑定
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>

    <!-- 传统账户绑定 -->
    <div class="pb-3">
      <h4 class="mb-3 text-base font-medium">其他第三方账户</h4>
      <List
        :data-source="bindList"
        :grid="{ gutter: 8, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 3 }"
      >
        <template #renderItem="{ item }">
          <ListItem>
            <Card size="small">
              <div class="flex w-full items-center gap-4">
                <component
                  :is="item.avatar"
                  v-if="item.avatar"
                  :style="item?.style ?? {}"
                  class="size-[32px]"
                />
                <div class="flex flex-1 items-center justify-between">
                  <div class="flex flex-col">
                    <h4 class="mb-1 text-sm text-black/85 dark:text-white/85">
                      {{ item.title }}
                    </h4>
                    <span class="text-xs text-black/45 dark:text-white/45">
                      {{ item.description }}
                    </span>
                  </div>
                  <a-button
                    :disabled="item.bound"
                    size="small"
                    type="link"
                    @click="handleAuthBinding(item.source)"
                  >
                    {{ buttonText(item) }}
                  </a-button>
                </div>
              </div>
            </Card>
          </ListItem>
        </template>
      </List>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/**
list item 间距
*/
:deep(.ant-list-item) {
  padding: 6px;
}

.provider-card {
  transition: all 0.3s ease;
  border-radius: 6px;
}

.provider-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.provider-card.bound {
  background: linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%);
  border-color: #52c41a;
}

.provider-card.unbound {
  background: #fafafa;
}
</style>
