<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { preferences } from '@vben/preferences';
import { getVxePopupContainer } from '@vben/utils';

import {
  Avatar,
  Dropdown,
  Menu,
  MenuItem,
  Modal,
  Popconfirm,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import {
  userExport,
  userList,
  userRemove,
  userStatusChange,
} from '#/api/system/user';
import { TableSwitch } from '#/components/table';
import { commonDownloadExcel } from '#/utils/file/download';

import { columns, querySchema } from './data';
import DeptTree from './dept-tree.vue';
import userDrawer from './user-drawer.vue';
import userImportModal from './user-import-modal.vue';
import userInfoModal from './user-info-modal.vue';
import userResetPwdModal from './user-reset-pwd-modal.vue';

/**
 * 导入
 */
const [UserImpotModal, userImportModalApi] = useVbenModal({
  connectedComponent: userImportModal,
});

function handleImport() {
  userImportModalApi.open();
}

// 左边部门用
const selectDeptId = ref<string[]>([]);

const formOptions: VbenFormProps = {
  schema: querySchema(),
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  handleReset: async () => {
    selectDeptId.value = [];

    const { formApi, reload } = tableApi;
    await formApi.resetForm();
    const formValues = formApi.form.values;
    formApi.setLatestSubmissionValues(formValues);
    await reload(formValues);
  },
  // 日期选择格式化
  fieldMappingTime: [
    [
      'createTime',
      ['params[beginTime]', 'params[endTime]'],
      ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
    ],
  ],
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    // 高亮
    highlight: true,
    // 翻页时保留选中状态
    reserve: true,
    // 点击行选中
    trigger: 'default',
    checkMethod: ({ row }) => row?.id !== 1,
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues: Recordable<any> = {}) => {
        // 部门树选择处理
        if (selectDeptId.value.length === 1) {
          formValues.departmentId = selectDeptId.value[0];
        } else {
          Reflect.deleteProperty(formValues, 'departmentId');
        }

        return await userList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  headerCellConfig: {
    height: 44,
  },
  cellConfig: {
    height: 48,
  },
  rowConfig: {
    keyField: 'id',
  },
  id: 'system-user-index',
};
const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [UserDrawer, userDrawerApi] = useVbenDrawer({
  connectedComponent: userDrawer,
});

function handleAdd() {
  userDrawerApi.setData({});
  userDrawerApi.open();
}

function handleEdit(row: Recordable<any>) {
  userDrawerApi.setData({ id: row.id });
  userDrawerApi.open();
}

async function handleDelete(row: Recordable<any>) {
  await userRemove([row.id]);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: any) => row.id);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await userRemove(ids);
      await tableApi.query();
    },
  });
}

function handleDownloadExcel() {
  commonDownloadExcel(userExport, '用户管理', tableApi.formApi.form.values, {
    fieldMappingTime: formOptions.fieldMappingTime,
  });
}

const [UserInfoModal, userInfoModalApi] = useVbenModal({
  connectedComponent: userInfoModal,
});
function handleUserInfo(row: Recordable<any>) {
  userInfoModalApi.setData({ id: row.id });
  userInfoModalApi.open();
}

const [UserResetPwdModal, userResetPwdModalApi] = useVbenModal({
  connectedComponent: userResetPwdModal,
});

function handleResetPwd(record: Recordable<any>) {
  userResetPwdModalApi.setData({ record });
  userResetPwdModalApi.open();
}

const { hasAccessByCodes } = useAccess();
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex h-full gap-[8px]">
      <DeptTree
        v-model:select-dept-id="selectDeptId"
        class="w-[260px]"
        @reload="() => tableApi.reload()"
        @select="() => tableApi.reload()"
      />
      <BasicTable class="flex-1 overflow-hidden" table-title="用户列表">
        <template #toolbar-tools>
          <Space>
            <a-button
              v-access:code="['system:user:export']"
              @click="handleDownloadExcel"
            >
              {{ $t('pages.common.export') }}
            </a-button>
            <a-button
              v-access:code="['system:user:import']"
              @click="handleImport"
            >
              {{ $t('pages.common.import') }}
            </a-button>
            <a-button
              :disabled="!vxeCheckboxChecked(tableApi)"
              danger
              type="primary"
              v-access:code="['system:user:delete']"
              @click="handleMultiDelete"
            >
              {{ $t('pages.common.delete') }}
            </a-button>
            <a-button
              type="primary"
              v-access:code="['system:user:create']"
              @click="handleAdd"
            >
              {{ $t('pages.common.add') }}
            </a-button>
          </Space>
        </template>
        <template #avatar="{ row }">
          <!-- 可能要判断空字符串情况 所以没有使用?? -->
          <Avatar :src="row.avatar || preferences.app.defaultAvatar" />
        </template>
        <template #status="{ row }">
          <TableSwitch
            :un-checked-value="0"
            :checked-value="1"
            v-model:value="row.status"
            :api="() => userStatusChange(row)"
            :disabled="
              row.id === '0193ea27-045c-74d1-8ad2-03fe671fdbc6' ||
              !hasAccessByCodes(['system:user:update'])
            "
            @reload="() => tableApi.query()"
          />
        </template>
        <template #action="{ row }">
          <template v-if="row.id !== 1">
            <Space>
              <ghost-button
                v-access:code="['system:user:update']"
                @click.stop="handleEdit(row)"
              >
                {{ $t('pages.common.edit') }}
              </ghost-button>
              <Popconfirm
                :get-popup-container="getVxePopupContainer"
                placement="left"
                title="确认删除？"
                @confirm="handleDelete(row)"
              >
                <ghost-button
                  danger
                  v-access:code="['system:user:delete']"
                  @click.stop=""
                >
                  {{ $t('pages.common.delete') }}
                </ghost-button>
              </Popconfirm>
            </Space>
            <Dropdown placement="bottomRight">
              <template #overlay>
                <Menu>
                  <MenuItem key="1" @click="handleUserInfo(row)">
                    用户信息
                  </MenuItem>
                  <span v-access:code="['system:user:resetPwd']">
                    <MenuItem key="2" @click="handleResetPwd(row)">
                      重置密码
                    </MenuItem>
                  </span>
                </Menu>
              </template>
              <a-button size="small" type="link">
                {{ $t('pages.common.more') }}
              </a-button>
            </Dropdown>
          </template>
        </template>
      </BasicTable>
    </div>
    <UserImpotModal @reload="tableApi.query()" />
    <UserDrawer @reload="tableApi.query()" />
    <UserInfoModal />
    <UserResetPwdModal />
  </Page>
</template>
