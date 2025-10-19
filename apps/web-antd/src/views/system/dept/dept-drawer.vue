<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { addFullName, cloneDeep, listToTree } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { deptAdd, deptInfo, deptList, deptUpdate } from '#/api/system/dept';
import { userList } from '#/api/system/user';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { drawerSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

interface DrawerProps {
  id?: number | string;
  update: boolean;
}

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
    labelWidth: 80,
  },
  schema: drawerSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

async function getDeptTree() {
  let ret: any[] = [];
  // ret = await (!deptId || exclude ? deptList({}) : deptNodeList(deptId));
  const { data } = await deptList({ page: 1, pageSize: 10_000 });
  ret = data;
  
  // 处理根部门的情况，如果 parentId 是 1000000 或其他特殊值，将其设为 0
  const processedData = ret.map(dept => ({
    ...dept,
    parentId: dept.parentId === 1000000 ? 0 : dept.parentId
  }));
  
  const treeData = listToTree(processedData, { id: 'id', pid: 'parentId' });
  // 添加部门名称 如 xx-xx-xx
  addFullName(treeData, 'name', ' / ');
  return treeData;
}

async function initDeptSelect() {
  // 需要动态更新TreeSelect组件 这里允许为空
  const treeData = await getDeptTree();
  formApi.updateSchema([
    {
      componentProps: {
        fieldNames: { label: 'name', value: 'id' },
        showSearch: true,
        treeData,
        treeDefaultExpandAll: true,
        treeLine: { showLeafIcon: false },
        // 选中后显示在输入框的值
        treeNodeLabelProp: 'fullName',
      },
      fieldName: 'parentId',
    },
  ]);
}

/**
 * 部门管理员下拉框 更新时才会enable
 * @param deptId
 */
async function initDeptUsers(deptId: number | string) {
  const ret = await userList({
    page: 1,
    pageSize: 100,
    departmentId: deptId,
  });
  const users = ret.data ?? [];
  const options = users.map((user) => ({
    label: `${user.username} | ${user.nickname}`,
    value: user.id,
  }));
  formApi.updateSchema([
    {
      componentProps: {
        disabled: users.length === 0,
        options,
        placeholder: users.length === 0 ? '该部门暂无用户' : '请选择部门负责人',
      },
      fieldName: 'leader',
    },
  ]);
}

async function setLeaderOptions() {
  formApi.updateSchema([
    {
      componentProps: {
        disabled: true,
        options: [],
        placeholder: '仅在更新时可选部门负责人',
      },
      fieldName: 'leader',
    },
  ]);
}

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: defaultFormValueGetter(formApi),
    currentGetter: defaultFormValueGetter(formApi),
  },
);

const [BasicDrawer, drawerApi] = useVbenDrawer({
  onBeforeClose,
  onClosed: handleClosed,
  onConfirm: handleConfirm,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return null;
    }
    drawerApi.drawerLoading(true);

    const { id, update } = drawerApi.getData() as DrawerProps;
    isUpdate.value = update;

    if (id) {
      await formApi.setFieldValue('parentId', id);
      if (update) {
        const record = await deptInfo(id);
        await formApi.setValues(record);
      }
    }

    await (update && id ? initDeptUsers(id) : setLeaderOptions());
    /** 部门选择 下拉框 */
    await initDeptSelect(id);
    await markInitialized();

    drawerApi.drawerLoading(false);
  },
});

async function handleConfirm() {
  try {
    drawerApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const data = cloneDeep(await formApi.getValues());

    await (isUpdate.value ? deptUpdate(data) : deptAdd(data));
    resetInitialized();
    emit('reload');
    drawerApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.lock(false);
  }
}

async function handleClosed() {
  await formApi.resetForm();
  resetInitialized();
}
</script>

<template>
  <BasicDrawer :title="title" class="w-[600px]">
    <BasicForm />
  </BasicDrawer>
</template>
