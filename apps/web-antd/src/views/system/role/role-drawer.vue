<!--
TODO: 这个页面要优化逻辑
-->
<script setup lang="ts">
import type { MenuOption } from '#/api/system/menu/model';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep, eachTree, listToTree } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { getMenuAuthority } from '#/api/system/authority';
import { menuList } from '#/api/system/menu';
import { roleAdd, roleInfo, roleUpdate } from '#/api/system/role';
import { MenuSelectTable } from '#/components/tree';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { drawerSchema } from './data';

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
    formItemClass: 'col-span-1',
  },
  layout: 'vertical',
  schema: drawerSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2 gap-x-4',
});

// （M目录 C菜单 F按钮）
const menuTypes = {
  1: 'C',
  2: 'F',
  0: 'M',
};

const menuTree = ref<MenuOption[]>([]);
async function setupMenuTree(id?: number | string) {
  // 菜单
  const menus = await menuList();
  const treeData = listToTree(menus.data, { id: 'id', pid: 'parentId' });

  // i18n处理
  eachTree(treeData, (node) => {
    node.label = $t(node.title);
    node.menuType = menuTypes[node.menuType as 0 | 1 | 2];
  });
  // 设置菜单信息
  menuTree.value = treeData;
  // keys依赖于menu 需要先加载menu
  await nextTick();
  if (id) {
    const resp = await getMenuAuthority(id);
    if (resp.menuIds === null) {
      formApi.setFieldValue('menuIds', []);
    } else {
      formApi.setFieldValue('menuIds', resp.menuIds);
    }
  } else {
    await formApi.setFieldValue('menuIds', []);
  }
}

async function customFormValueGetter() {
  const v = await defaultFormValueGetter(formApi)();
  // 获取勾选信息
  const menuIds = menuSelectRef.value?.getCheckedKeys?.() ?? [];
  const mixStr = v + menuIds.join(',');
  return mixStr;
}

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: customFormValueGetter,
    currentGetter: customFormValueGetter,
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

    const { id } = drawerApi.getData() as { id?: number | string };
    isUpdate.value = !!id;

    if (isUpdate.value && id) {
      const record = await roleInfo(id);
      await formApi.setValues(record);
    }
    // formApi.updateSchema([
    //   {
    //     componentProps: {
    //       disabled: isUpdate.value,
    //     },
    //     fieldName: 'code',
    //   },
    // ]);
    // if (id) {
    //   const resp = await getMenuAuthority(id);
    //   if (resp.menuIds === null) {
    //     formApi.setFieldValue('menuIds', []);
    //   } else {
    //     formApi.setFieldValue('menuIds', resp.menuIds);
    //   }
    // } else {
    //   formApi.setFieldValue('menuIds', []);
    // }
    // init菜单 注意顺序要放在赋值record之后 内部watch会依赖record
    await setupMenuTree(id);
    await markInitialized();

    drawerApi.drawerLoading(false);
  },
});

const menuSelectRef = ref<InstanceType<typeof MenuSelectTable>>();
async function handleConfirm() {
  try {
    drawerApi.lock(true);

    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    // 这个用于提交
    const menuIds = menuSelectRef.value?.getCheckedKeys?.() ?? [];
    // formApi.getValues拿到的是一个readonly对象，不能直接修改，需要cloneDeep
    const data = cloneDeep(await formApi.getValues());
    // 将menuIds从data中删除
    data.menuIds = menuIds;
    await (isUpdate.value ? roleUpdate(data) : roleAdd(data));
    emit('reload');
    resetInitialized();
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

/**
 * 通过回调更新 无法通过v-model
 * @param value 菜单选择是否严格模式
 */
function handleMenuCheckStrictlyChange(value: boolean) {
  formApi.setFieldValue('menuCheckStrictly', value);
}
</script>

<template>
  <BasicDrawer :title="title" class="w-[800px]">
    <BasicForm>
      <template #menuIds="slotProps">
        <div class="h-[600px] w-full">
          <!-- association为readonly 不能通过v-model绑定 -->
          <MenuSelectTable
            ref="menuSelectRef"
            :checked-keys="slotProps.value"
            :association="formApi.form.values.menuCheckStrictly"
            :menus="menuTree"
            @update:association="handleMenuCheckStrictlyChange"
          />
        </div>
      </template>
    </BasicForm>
  </BasicDrawer>
</template>
