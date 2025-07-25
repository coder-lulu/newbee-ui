<script setup lang="ts">
import type { UserInfo } from '#/api/system/user/model';

import { computed, shallowRef } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { DictEnum } from '@vben/constants';

import { Descriptions, DescriptionsItem, Tag } from 'ant-design-vue';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

import { postList } from '#/api/system/post';
import { roleList } from '#/api/system/role';
import { findUserInfo } from '#/api/system/user';
import { renderDict } from '#/utils/render';

dayjs.extend(duration);
dayjs.extend(relativeTime);

const [BasicModal, modalApi] = useVbenModal({
  onOpenChange: handleOpenChange,
  onClosed() {
    currentUser.value = null;
  },
});

interface UserWithNames extends UserInfo {
  postNames: string[];
  roleNames: string[];
}

const currentUser = shallowRef<null | UserWithNames>(null);

async function handleOpenChange(open: boolean) {
  if (!open) {
    return null;
  }
  modalApi.modalLoading(true);

  const { id } = modalApi.getData() as { id: number | string };
  const response = await findUserInfo(id);
  // 外部的roleIds postIds才是真正对应的  新增时为空
  // posts有为Null的情况 需要给默认值
  // 更新 && 赋值
  const { postIds, roleIds } = response;
  const pIds = postIds ?? [];
  const rIds = roleIds ?? [];
  const rolesData = await roleList({ page: 1, pageSize: 10_000 });
  const roles = rolesData?.data ?? [];
  const postsData = await postList({ page: 1, pageSize: 10_000 });
  const posts = postsData?.data ?? [];

  const postNames = posts
    .filter((item) => pIds.includes(item.id as number))
    .map((item) => item.name);

  const roleNames = roles
    .filter((item) => rIds.includes(item.id as number))
    .map((item) => item.name);

  (response as UserWithNames).postNames = postNames;
  (response as UserWithNames).roleNames = roleNames;
  // 赋值
  currentUser.value = response as UserWithNames;
  modalApi.modalLoading(false);
}

const mixInfo = computed(() => {
  if (!currentUser.value) {
    return '-';
  }
  const { username, nickname } = currentUser.value;
  return `${username} / ${nickname}`;
});

// const diffLoginTime = computed(() => {
//   if (!currentUser.value) {
//     return '-';
//   }
//   const { loginDate } = currentUser.value;
//   // 默认en显示
//   dayjs.locale('zh-cn');
//   // 计算相差秒数
//   const diffSeconds = dayjs().diff(dayjs(loginDate), 'second');
//   /**
//    * 转为时间显示(x月 x天)
//    * https://dayjs.fenxianglu.cn/category/duration.html#%E4%BA%BA%E6%80%A7%E5%8C%96
//    *
//    */
//   const diffText = dayjs.duration(diffSeconds, 'seconds').humanize();
//   return diffText;
// });
</script>

<template>
  <BasicModal :footer="false" :fullscreen-button="false" title="用户信息">
    <Descriptions v-if="currentUser" size="small" :column="1" bordered>
      <DescriptionsItem label="userId">
        {{ currentUser.id }}
      </DescriptionsItem>
      <DescriptionsItem label="用户状态">
        <component
          :is="
            renderDict(currentUser.status ?? '', DictEnum.SYS_NORMAL_DISABLE)
          "
        />
      </DescriptionsItem>
      <DescriptionsItem label="用户信息">
        {{ mixInfo }}
      </DescriptionsItem>
      <DescriptionsItem label="手机号">
        {{ currentUser.mobile || '-' }}
      </DescriptionsItem>
      <DescriptionsItem label="邮箱">
        {{ currentUser.email || '-' }}
      </DescriptionsItem>
      <DescriptionsItem label="岗位">
        <div
          v-if="currentUser.postNames.length > 0"
          class="flex flex-wrap gap-0.5"
        >
          <Tag v-for="item in currentUser.postNames" :key="item">
            {{ item }}
          </Tag>
        </div>
        <span v-else>-</span>
      </DescriptionsItem>
      <DescriptionsItem label="权限">
        <div
          v-if="currentUser.roleNames.length > 0"
          class="flex flex-wrap gap-0.5"
        >
          <Tag v-for="item in currentUser.roleNames" :key="item">
            {{ item }}
          </Tag>
        </div>
        <span v-else>-</span>
      </DescriptionsItem>
      <DescriptionsItem label="创建时间">
        {{ dayjs(currentUser.createdAt).format('YYYY-MM-DD') }}
      </DescriptionsItem>
      <!-- <DescriptionsItem label="上次登录IP">
        {{ currentUser.loginIp ?? '-' }}
      </DescriptionsItem> -->
      <!-- <DescriptionsItem label="上次登录时间">
        <span>{{ currentUser.loginDate ?? '-' }}</span>
        <Tag
          class="ml-2"
          v-if="diffLoginTime"
          :bordered="false"
          color="processing"
        >
          {{ diffLoginTime }}前
        </Tag>
      </DescriptionsItem> -->
      <DescriptionsItem label="备注">
        {{ currentUser.description ?? '-' }}
      </DescriptionsItem>
    </Descriptions>
  </BasicModal>
</template>
