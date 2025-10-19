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
  try {
    // 部门数据
    const { data } = await deptList({ page: 1, pageSize: 10_000 });
    const deptData = data;
    
    // 处理根部门的情况，如果 parentId 是 1000000 或其他特殊值，将其设为 0
    const processedData = deptData.map(dept => ({
      ...dept,
      parentId: dept.parentId === 1000000 ? 0 : dept.parentId
    }));
    
    const treeData = listToTree(processedData, { id: 'id', pid: 'parentId' });
    console.log('部门树数据:', treeData);
    
          // 确保树形数据正确
      if (treeData && treeData.length > 0) {
        // 处理树形数据，确保字段名称正确
        eachTree(treeData, (node) => {
          // 确保所有必要的字段都存在
          node.title = node.name; // TreeSelectPanel 可能使用 title 字段
          node.label = node.name; // 兼容性字段
          node.key = node.id;     // 唯一标识
          node.value = node.id;   // 值字段
          node.children = node.children || []; // 确保 children 字段存在
        });
        
        deptTree.value = treeData;
        console.log('处理后的部门树数据:', deptTree.value);
      } else {
        console.warn('部门树数据为空或格式不正确');
        deptTree.value = [];
      }
  } catch (error) {
    console.error('加载部门树失败:', error);
    deptTree.value = [];
  }
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
          :field-names="{ title: 'name', key: 'id', value: 'id', children: 'children' }"
          @check-strictly-change="handleCheckStrictlyChange"
        />
      </template>
    </BasicForm>
  </BasicModal>
</template>
