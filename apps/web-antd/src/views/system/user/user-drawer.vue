<script setup lang="ts">
import type { RoleInfo } from '#/api/system/role/model';

import { computed, h, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import {
  addFullName,
  cloneDeep,
  getPopupContainer,
  listToTree,
} from '@vben/utils';

import { Tag } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { deptList } from '#/api/system/dept';
import { postList } from '#/api/system/post';
import { roleList } from '#/api/system/role';
import { findUserInfo, userAdd, userUpdate } from '#/api/system/user';
import { authScopeOptions } from '#/views/system/role/data';

import { drawerSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    formItemClass: 'col-span-2',
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 80,
  },
  schema: drawerSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

/**
 * 生成角色的自定义label
 * 也可以用option插槽来做
 * renderComponentContent: () => ({
    option: ({value, label, [disabled, key, title]}) => '',
  }),
 */
function genRoleOptionlabel(role: RoleInfo) {
  const found = authScopeOptions.find((item) => item.value === role.dataScope);
  if (!found) {
    return role.name;
  }
  return h('div', { class: 'flex items-center gap-[6px]' }, [
    h('span', null, role.name),
    h(Tag, { color: found.color }, () => found.label),
  ]);
}

/**
 * 岗位的加载
 */
async function setupPostOptions(deptId: number | string) {
  const postListResp = await postList({
    belongDeptId: deptId,
    pageSize: 1000,
    page: 1,
  });
  const postListData = postListResp?.data ?? [];
  const options = postListData.map((item) => ({
    label: item.name,
    value: item.id,
  }));
  const placeholder = options.length > 0 ? '请选择' : '该部门下暂无岗位';
  formApi.updateSchema([
    {
      componentProps: { options, placeholder },
      fieldName: 'postIds',
    },
  ]);
}

/**
 * 初始化部门选择
 */
async function setupDeptSelect() {
  // updateSchema
  const { data } = await deptList({ page: 1, pageSize: 10_000 });
  const deptData = data;
  
  // 处理根部门的情况，如果 parentId 是 1000000 或其他特殊值，将其设为 0
  const processedData = deptData.map(dept => ({
    ...dept,
    parentId: dept.parentId === 1000000 ? 0 : dept.parentId
  }));
  
  const deptTree = listToTree(processedData, { id: 'id', pid: 'parentId' });
  // 选中后显示在输入框的值 即父节点 / 子节点
  addFullName(deptTree, 'name', ' / ');
  formApi.updateSchema([
    {
      componentProps: (formModel) => ({
        class: 'w-full',
        fieldNames: { label: 'name', value: 'id' },
        getPopupContainer,
        async onSelect(deptId: number | string) {
          /** 根据部门ID加载岗位 */
          await setupPostOptions(deptId);
          /** 变化后需要重新选择岗位 */
          formModel.postIds = [];
        },
        placeholder: '请选择',
        showSearch: true,
        treeData: deptTree,
        treeDefaultExpandAll: true,
        treeLine: { showLeafIcon: false },
        // 筛选的字段
        treeNodeFilterProp: 'name',
        // 选中后显示在输入框的值
        treeNodeLabelProp: 'fullName',
      }),
      fieldName: 'departmentId',
    },
  ]);
}

const [BasicDrawer, drawerApi] = useVbenDrawer({
  onCancel: handleCancel,
  onConfirm: handleConfirm,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      // 需要重置岗位选择
      formApi.updateSchema([
        {
          componentProps: { options: [], placeholder: '请先选择部门' },
          fieldName: 'postIds',
        },
      ]);
      return null;
    }
    drawerApi.drawerLoading(true);
    const { id } = drawerApi.getData() as { id?: number | string };
    isUpdate.value = !!id;
    /** update时 禁用用户名修改 不显示密码框 */
    formApi.updateSchema([
      { componentProps: { disabled: isUpdate.value }, fieldName: 'username' },
      {
        dependencies: { show: () => !isUpdate.value, triggerFields: ['id'] },
        fieldName: 'password',
      },
    ]);
    // 无论是新建还是编辑，都需要加载部门列表和角色列表
    await setupDeptSelect();
    
    // 加载角色列表
    const rolesData = await roleList({ page: 1, pageSize: 10_000 });
    const roles = rolesData?.data ?? [];
    formApi.updateSchema([
      {
        componentProps: {
          // title用于选中后回填到输入框 默认为label
          optionLabelProp: 'title',
          options: roles.map((item) => ({
            label: genRoleOptionlabel(item),
            // title用于选中后回填到输入框 默认为label
            title: item.name,
            value: item.id,
          })),
        },
        fieldName: 'roleIds',
      },
    ]);
    
    if (isUpdate.value && id) {
      // 更新 && 赋值
      const user = await findUserInfo(id);
      const { postIds, roleIds } = user;
      const postsData = await postList({ page: 1, pageSize: 10_000 });
      const posts = postsData?.data ?? [];
      const postOptions = (posts ?? []).map((item) => ({
        label: item.name,
        value: item.id,
      }));
      formApi.updateSchema([
        {
          componentProps: {
            options: postOptions,
          },
          fieldName: 'postIds',
        },
      ]);
      if (user) {
        await Promise.all([
          // 添加基础信息
          formApi.setValues(user),
          // 添加角色和岗位
          formApi.setFieldValue('postIds', postIds),
          formApi.setFieldValue('roleIds', roleIds),
          // 更新时不会触发onSelect 需要手动调用
          setupPostOptions(user.departmentId as number),
        ]);
      }
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
    await (isUpdate.value ? userUpdate(data) : userAdd(data));
    emit('reload');
    await handleCancel();
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.drawerLoading(false);
  }
}

async function handleCancel() {
  drawerApi.close();
  await formApi.resetForm();
}
</script>

<template>
  <BasicDrawer :close-on-click-modal="false" :title="title" class="w-[600px]">
    <BasicForm />
  </BasicDrawer>
</template>
