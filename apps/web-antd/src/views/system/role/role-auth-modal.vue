<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep, eachTree, listToTree } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { deptList } from '#/api/system/dept';
import { roleDataScope, roleInfo } from '#/api/system/role';
import { TreeSelectPanel } from '#/components/tree';

import { authModalSchemas } from './data';

const emit = defineEmits<{ reload: [] }>();

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'vertical',
  schema: authModalSchemas(),
  showDefaultActions: false,
});

const deptTree = ref<any[]>([]);
async function setupDeptTree() {
  // 部门数据
  const deptData = await deptList();
  const treeData = listToTree(deptData, { id: 'id', pid: 'parentId' });
  deptTree.value = treeData;
  // i18n处理
  eachTree(treeData, (node) => {
    node.label = node.name;
  });

  // formApi.setFieldValue('customDeptIds', depts);
}

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onCancel: handleCancel,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      return null;
    }
    modalApi.modalLoading(true);

    const { id } = modalApi.getData() as { id: number | string };
    const record = await roleInfo(id);
    await setupDeptTree();
    await formApi.setValues(record);
    modalApi.modalLoading(false);
  },
});

/**
 * 这里拿到的是一个数组ref
 */
const deptSelectRef = ref();

async function handleConfirm() {
  try {
    modalApi.modalLoading(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    // formApi.getValues拿到的是一个readonly对象，不能直接修改，需要cloneDeep
    const data = cloneDeep(await formApi.getValues());
    // 不为自定义权限的话 删除部门id
    if (data.dataScope === 2) {
      const customDeptIds = deptSelectRef.value?.[0]?.getCheckedKeys() ?? [];
      data.customDeptIds = customDeptIds;
    } else {
      data.customDeptIds = [];
    }
    await roleDataScope(data);
    emit('reload');
    await handleCancel();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.modalLoading(false);
  }
}

async function handleCancel() {
  modalApi.close();
  await formApi.resetForm();
}
const checkStrictly = ref(false);
/**
 * 通过回调更新 无法通过v-model
 * @param value 菜单选择是否严格模式
 */
function handleCheckStrictlyChange(value: boolean) {
  checkStrictly.value = value;
}
</script>

<template>
  <BasicModal
    :close-on-click-modal="false"
    class="min-h-[600px] w-[550px]"
    title="分配权限"
  >
    <BasicForm>
      <template #customDeptIds="slotProps">
        <TreeSelectPanel
          ref="deptSelectRef"
          v-bind="slotProps"
          :check-strictly="checkStrictly"
          :expand-all-on-init="true"
          :tree-data="deptTree"
          @check-strictly-change="handleCheckStrictlyChange"
        />
      </template>
    </BasicForm>
  </BasicModal>
</template>
