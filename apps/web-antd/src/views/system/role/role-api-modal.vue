<script setup lang="ts">
import type { DataNode } from 'ant-design-vue/es/vc-tree/interface';

import type { ApiInfo } from '#/api/system/api-interface/model';
import type { ApiAuthorityInfo } from '#/api/system/authority/model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Tree } from 'ant-design-vue';
import { clone, concat, isNumber, unique } from 'remeda';

import { getApiList } from '#/api/system/api-interface';
import {
  createOrUpdateApiAuthority,
  getApiAuthority,
} from '#/api/system/authority';

const treeApiData = ref<DataNode[]>([]);

const checkedKeys = ref();
const roleId = ref<number>();

let tempApiList: ApiInfo[] = [];

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
    roleId.value = id as number;
    await getApiData();
    modalApi.modalLoading(false);
  },
});

async function handleConfirm() {
  try {
    modalApi.modalLoading(true);
    const apiReqData: ApiAuthorityInfo[] = convertApiCheckedKeysToReq(
      checkedKeys.value,
      tempApiList,
    );
    await createOrUpdateApiAuthority({
      roleId: Number(roleId.value),
      data: apiReqData,
    });
    await handleCancel();
  } catch (error) {
    console.error(error);
  } finally {
    checkedKeys.value = [];
    tempApiList = [];
    modalApi.modalLoading(false);
  }
}

async function handleCancel() {
  checkedKeys.value = [];
  tempApiList = [];
  modalApi.close();
}

async function getApiData() {
  try {
    treeApiData.value = [];
    const apiData = await getApiList({
      page: 1,
      pageSize: 10_000,
    });
    tempApiList = apiData.data;
    const dataConv = convertApiTreeData(apiData.data);
    for (const key in dataConv) {
      treeApiData.value.push(dataConv[key] as any);
    }
    const checkedData = await getApiAuthority(roleId.value as number);
    checkedKeys.value =
      checkedData === null
        ? convertApiToCheckedKeys([], apiData.data)
        : convertApiToCheckedKeys(checkedData.data, apiData.data);
  } catch {
    // console.log(error);
  }
}

/**
 *  author: Ryan Su
 *  @description: this function is used to convert menu data into tree node data
 */

function convertApiTreeData(params: ApiInfo[]): DataNode[] {
  const finalData: DataNode[] = [];
  const apiData: DataNode[] = [];
  if (params.length === 0) {
    return apiData;
  }

  const apiMap = new Map<string, string>();
  const serviceMap = new Map<string, boolean>();
  for (const param of params) {
    apiMap.set(param.group, param.serviceName);
    serviceMap.set(param.serviceName, true);
  }

  for (const k of apiMap.keys()) {
    const apiTmp: DataNode = {
      title: k,
      key: k,
      children: [],
    };

    for (const param of params) {
      if (param.group === k) {
        apiTmp.children?.push({
          title: param.trans,
          key: param.id as number,
          disableCheckbox: param.isRequired,
        });
      }
    }

    apiData.push(apiTmp);
  }

  for (const k1 of serviceMap.keys()) {
    const svcTmp: DataNode = {
      title: k1,
      key: k1,
      children: [],
    };

    for (const apiDatum of apiData) {
      if (apiMap.get(apiDatum.title) === k1) {
        svcTmp.children?.push(clone(apiDatum));
      }
    }

    finalData.push(svcTmp);
  }

  return finalData;
}

/**
 *  author: Ryan Su
 *  @description: convert checked data into authorized data
 */
function convertApiCheckedKeysToReq(
  checked: number[],
  data: ApiInfo[],
): ApiAuthorityInfo[] {
  // delete string keys
  const pureDigit: number[] = [];
  for (const element of checked) {
    if (isNumber(element)) {
      pureDigit.push(element);
    }
  }

  // sort data
  data.sort((a, b) => {
    if (a.id !== undefined && b.id !== undefined) return a.id - b.id;
    return 1;
  });
  pureDigit.sort((a, b) => {
    return a - b;
  });
  // convert data
  const target: ApiAuthorityInfo[] = [];
  let j = 0;
  for (const datum of data) {
    if (datum.id === pureDigit[j]) {
      target.push({
        path: datum.path,
        method: datum.method,
      });
      j++;
    }
  }
  return target;
}

/**
 *  author: Ryan Su
 *  @description: this function is used to convert authorization api response into checked keys
 */

function convertApiToCheckedKeys(
  checked: ApiAuthorityInfo[],
  data: ApiInfo[],
): number[] {
  const dataMap = new Map();
  const authorityApis: number[] = [];
  const requiredAPIs: number[] = [];
  data.forEach((value, _key) => {
    if (value.isRequired) {
      requiredAPIs.push(value.id as number);
    }
  });

  for (const datum of data) {
    dataMap.set(datum.path + datum.method, datum.id);
  }
  for (const element of checked) {
    authorityApis.push(dataMap.get(element.path + element.method));
  }

  return unique(concat(authorityApis, requiredAPIs));
}
</script>

<template>
  <BasicModal
    :close-on-click-modal="false"
    class="min-h-[600px] w-[550px]"
    title="分配接口权限"
  >
    <Tree
      v-model:checked-keys="checkedKeys"
      :tree-data="treeApiData"
      checkable
      default-expand-all
    />
  </BasicModal>
</template>
