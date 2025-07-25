<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import {
  addFullName,
  cloneDeep,
  getPopupContainer,
  listToTree,
} from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { menuAdd, menuInfo, menuList, menuUpdate } from '#/api/system/menu';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { drawerSchema } from './data';

interface ModalProps {
  id?: number | string;
  update: boolean;
}

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
    labelWidth: 90,
  },
  schema: drawerSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

async function setupMenuSelect() {
  // menu
  const menuData = await menuList();
  const menuArray = menuData.data;
  // support i18n
  menuArray.forEach((item) => {
    item.name = $t(item.name);
  });
  /**
   * 这里需要过滤掉按钮类型
   * 不允许在按钮下添加数据
   */
  const filteredList = menuArray.filter((item) => item.menuType !== 'F');
  const menuTree = listToTree(filteredList, { id: 'menuId', pid: 'parentId' });
  const fullMenuTree = [
    {
      id: 1_000_000,
      name: $t('menu.root'),
      children: menuTree,
    },
  ];
  addFullName(fullMenuTree, 'name', ' / ');

  formApi.updateSchema([
    {
      componentProps: {
        fieldNames: {
          label: 'name',
          value: 'id',
        },
        getPopupContainer,
        // 设置弹窗滚动高度 默认256
        listHeight: 300,
        showSearch: true,
        treeData: fullMenuTree,
        treeDefaultExpandAll: false,
        // 默认展开的树节点
        treeDefaultExpandedKeys: [0],
        treeLine: { showLeafIcon: false },
        // 筛选的字段
        treeNodeFilterProp: 'name',
        treeNodeLabelProp: 'fullName',
      },
      fieldName: 'parentId',
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

    const { id, update } = drawerApi.getData() as ModalProps;
    isUpdate.value = update;

    // 加载菜单树选择
    await setupMenuSelect();
    if (id) {
      await formApi.setFieldValue('parentId', id);
      if (update) {
        const record = await menuInfo(id);
        await formApi.setValues(record);
      }
    }
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
    data.title = data.name;
    await (isUpdate.value ? menuUpdate(data) : menuAdd(data));
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
