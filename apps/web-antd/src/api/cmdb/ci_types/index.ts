import type {
  Attribute,
  AttributeAppendToCiType,
  AttributeGroup,
  AttributeGroupInfo,
  AttributeItem,
  CiType,
  CiTypeGroup,
  CiTypeGroupItem,
  CiTypeGroupItemTreeData,
  CiTypeGroupItemTreeQuery,
} from './model';

import type { ID, IDS, PageQuery } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  addAttributeInfo = '/cmdb-api/attribute/create',
  addCiTypeAttribute = '/cmdb-api/ci_type_attribute/create',
  appendAttributeToCiType = '/cmdb-api/ci_type/append-attribute',
  changeCiTypeAttributeListShow = '/cmdb-api/ci_type_attribute/change-list-show',
  createAttributeGroup = '/cmdb-api/ci_type_attribute_group/create',
  createCiType = '/cmdb-api/ci_type/create',
  createCiTypeGroup = '/cmdb-api/ci_type_group/create',
  createCiTypeGroupItem = '/cmdb-api/ci_type_group_item/create',
  createConfigItem = '/cmdb-api/config_item/create',
  deleteAttributeGroup = '/cmdb-api/ci_type_attribute_group/delete',
  deleteAttributeInfo = '/cmdb-api/attribute/delete',
  deleteCiType = '/cmdb-api/ci_type/delete',
  deleteCiTypeAttribute = '/cmdb-api/ci_type_attribute/delete',
  deleteCiTypeGroup = '/cmdb-api/ci_type_group/delete',
  deleteCiTypeGroupItem = '/cmdb-api/ci_type_group_item/delete',
  getAttributeGroupById = '/cmdb-api/ci_type_attribute_group',
  getAttributeGroupList = '/cmdb-api/ci_type_attribute_group/list',
  getAttributeInfoById = '/cmdb-api/attribute',
  getAttributeInfoList = '/cmdb-api/attribute/list',
  getAttributeInfoSimpleList = '/cmdb-api/attribute/simple-list',
  getCiTypeAttributeById = '/cmdb-api/ci_type_attribute',
  getCiTypeById = '/cmdb-api/ci_type',
  getCiTypeGroupById = '/cmdb-api/ci_type_group',
  getCiTypeGroupItemById = '/cmdb-api/ci_type_group_item',
  getCiTypeGroupItemList = '/cmdb-api/ci_type_group_item/list',
  getCiTypeGroupItemTree = '/cmdb-api/ci_type_group_item/tree',
  getCiTypeGroupList = '/cmdb-api/ci_type_group/list',
  getCiTypeList = '/cmdb-api/ci_type/list',
  getCiTypeListByGroupId = '/cmdb-api/ci_type/list/by_group_id',
  getConfigItemById = '/cmdb-api/config_item',
  listCiTypeAttrWithGroup = '/cmdb-api/ci_type_attribute/list_with_group',
  sortAttributeGroup = '/cmdb-api/ci_type_attribute_group/sort',
  sortCiTypeAttributeGroupItem = '/cmdb-api/ci_type_attribute_group_item/sort',
  updateAttributeGroup = '/cmdb-api/ci_type_attribute_group/update',
  updateAttributeInfo = '/cmdb-api/attribute/update',
  updateCiType = '/cmdb-api/ci_type/update',
  updateCiTypeAttribute = '/cmdb-api/ci_type_attribute/update',
  updateCiTypeGroup = '/cmdb-api/ci_type_group/update',
  updateCiTypeGroupItem = '/cmdb-api/ci_type_group_item/update',
  updateCiTypeGroupItemSort = '/cmdb-api/ci_type_group_item/sort',
  updateCiTypeGroupSort = '/cmdb-api/ci_type_group/sort',
  updateConfigItem = '/cmdb-api/config_item/update',
}

/**
 * 获取分组列表
 * @param params 参数
 * @returns CiTypeGroup[]
 */
export function getCiTypeGroupList(params?: PageQuery) {
  return requestClient.post<CiTypeGroup[]>(Api.getCiTypeGroupList, {
    ...params,
  });
}

/**
 * 查询分组信息
 * @param groupId id
 * @returns 分组信息
 */
export function getCiTypeGroupById(groupId: ID) {
  return requestClient.post<CiTypeGroup>(Api.getCiTypeGroupById, {
    id: groupId,
  });
}

/**
 * 创建分组
 * @param data 数据
 * @returns void
 */
export function createCiTypeGroup(data: any) {
  return requestClient.postWithMsg<void>(Api.createCiTypeGroup, data);
}

export function updateCiTypeGroup(data: any) {
  return requestClient.postWithMsg<void>(Api.updateCiTypeGroup, data);
}

export function updateCiTypeGroupSort(data: any) {
  return requestClient.post<void>(Api.updateCiTypeGroupSort, {
    sortItems: data,
  });
}

/**
 * 分组删除
 * @param ids id
 * @returns void
 */
export function deleteCiTypeGroup(ids: IDS) {
  return requestClient.postWithMsg<void>(Api.deleteCiTypeGroup, {
    ids,
  });
}

/**
 * 获取分组项目列表
 * @param params 参数
 * @returns CiTypeGroupItem[]
 */
export function getCiTypeGroupItemList(params?: PageQuery) {
  return requestClient.post<CiTypeGroupItem[]>(Api.getCiTypeGroupItemList, {
    ...params,
  });
}

export function createCiTypeGroupItem(data: any) {
  return requestClient.postWithMsg<void>(Api.createCiTypeGroupItem, data);
}

/**
 * 更新分组项目
 * @param data 数据
 * @returns void
 */
export function updateCiTypeGroupItem(data: any) {
  return requestClient.postWithMsg<void>(Api.updateCiTypeGroupItem, data);
}

export function updateCiTypeGroupItemSort(data: any) {
  return requestClient.post<void>(Api.updateCiTypeGroupItemSort, {
    sortItems: data,
  });
}

/**
 * 分组项目删除
 * @param groupItemId id
 * @returns void
 */
export function deleteCiTypeGroupItem(groupItemId: ID) {
  return requestClient.postWithMsg<void>(Api.deleteCiTypeGroupItem, {
    id: groupItemId,
  });
}

/**
 * 获取分组树
 * @param params 查询参数
 * @returns 分组树
 */
export function getCiTypeGroupItemTree(params?: CiTypeGroupItemTreeQuery) {
  return requestClient.post<CiTypeGroupItemTreeData[]>(
    Api.getCiTypeGroupItemTree,
    params,
  );
}

/**
 * 获取CI类型列表
 * @param params 参数
 * @returns CiTypeGroupItem[]
 */
export function getCiTypeList(params?: PageQuery) {
  return requestClient.post<CiType[]>(Api.getCiTypeList, {
    ...params,
  });
}

/**
 * 获取CI类型列表
 * @param params 参数
 * @returns CiTypeGroupItem[]
 */
export function getCiTypeListByGroupId(groupId: ID) {
  return requestClient.post<CiType[]>(Api.getCiTypeListByGroupId, {
    groupId,
  });
}

export function createCiType(data: any) {
  return requestClient.postWithMsg<void>(Api.createCiType, data);
}

/**
 * 更新CI类型
 * @param data 数据
 * @returns void
 */
export function updateCiType(data: any) {
  return requestClient.postWithMsg<void>(Api.updateCiType, data);
}

/**
 * 删除CI类型
 * @param typeId id
 * @returns void
 */
export function deleteCiType(ids: IDS) {
  return requestClient.postWithMsg<void>(Api.deleteCiType, {
    ids,
  });
}

export function getCiTypeById(typeId: ID) {
  return requestClient.post<CiType>(Api.getCiTypeById, {
    id: typeId,
  });
}

/**
 * 获取属性分组列表
 * @param params 参数
 * @returns CiTypeGroup[]
 */
export function getAttributeGroupList(params?: PageQuery) {
  return requestClient.post<AttributeGroup[]>(Api.getAttributeGroupList, {
    ...params,
  });
}

/**
 * 查询属性分组信息
 * @param groupId id
 * @returns 属性分组信息
 */
export function getAttributeGroupById(groupId: ID) {
  return requestClient.post<AttributeGroup>(Api.getAttributeGroupById, {
    id: groupId,
  });
}

/**
 * 创建属性分组
 * @param data 数据
 * @returns void
 */
export function createAttributeGroup(data: any) {
  return requestClient.postWithMsg<void>(Api.createAttributeGroup, data);
}

export function updateAttributeGroup(data: any) {
  return requestClient.postWithMsg<void>(Api.updateAttributeGroup, data);
}

export function sortAttributeGroup(data: any) {
  return requestClient.post<void>(Api.sortAttributeGroup, {
    sortedGroups: data,
  });
}

/**
 * 删除属性分组
 * @param ids id
 * @returns void
 */
export function deleteAttributeGroup(ids: IDS) {
  return requestClient.postWithMsg<void>(Api.deleteAttributeGroup, {
    ids,
  });
}

export function listAttributeGroupWithAttribute(typeId: ID) {
  return requestClient.post<AttributeGroup[]>(Api.listCiTypeAttrWithGroup, {
    typeId: typeId,
  });
}

/**
 * 排序属性分组项目
 * @param data 数据
 * @returns void
 */
export function sortCiTypeAttributeGroupItem(data: any) {
  return requestClient.post<void>(Api.sortCiTypeAttributeGroupItem, {
    sortedItems: data,
  });
}

// 添加模型属性
/**
 * 添加模型属性
 * @param data 数据
 * @returns void
 */
export function addCiTypeAttribute(data: any) {
  return requestClient.postWithMsg<ID>(Api.addCiTypeAttribute, data);
}

/**
 * 更新模型属性
 * @param data 数据
 * @returns void
 */
export function updateCiTypeAttribute(data: any) {
  return requestClient.postWithMsg<void>(Api.updateCiTypeAttribute, data);
}

/**
 * 删除模型属性
 * @param data 数据
 * @returns void
 */
export function deleteCiTypeAttribute(ids: IDS) {
  return requestClient.postWithMsg<void>(Api.deleteCiTypeAttribute, { ids });
}

// 新版接口：基于 AttributeInfo/AttributeGroupInfo
/**
 * 获取属性分组（新版，结构与后端 proto 对齐）
 */
export function getAttributeGroupInfoList(typeId: ID) {
  return requestClient.post<AttributeGroupInfo[]>(Api.listCiTypeAttrWithGroup, {
    type_id: typeId,
  });
}

/**
 * 新增属性（新版，结构与后端 proto 对齐）
 */
export function addAttributeInfo(data: Attribute) {
  return requestClient.postWithMsg<ID>(Api.addCiTypeAttribute, data);
}

/**
 * 更新属性（新版，结构与后端 proto 对齐）
 */
export function updateAttributeInfo(data: Attribute) {
  return requestClient.postWithMsg<void>(Api.updateCiTypeAttribute, data);
}

/**
 * 删除属性（新版，结构与后端 proto 对齐）
 */
export function deleteAttributeInfo(ids: IDS) {
  return requestClient.postWithMsg<void>(Api.deleteCiTypeAttribute, { ids });
}

// 获取单个属性项详情
export function getCiTypeAttributeById(id: number) {
  return requestClient.post<AttributeItem>(Api.getCiTypeAttributeById, { id });
}

// 获取单个属性项详情
export function getAttributeInfoById(id: number) {
  return requestClient.post<Attribute>(Api.getAttributeInfoById, { id });
}

// 获取属性列表
export function getAttributeInfoList(params?: PageQuery) {
  return requestClient.post<Attribute[]>(Api.getAttributeInfoList, {
    ...params,
  });
}

// 获取属性简单列表
export function getAttributeInfoSimpleList(data?: any) {
  return requestClient.post<Attribute[]>(Api.getAttributeInfoSimpleList, {
    ...data,
  });
}

export function changeCiTypeAttributeListShow(id: number, listShow: boolean) {
  return requestClient.post<void>(Api.changeCiTypeAttributeListShow, {
    id,
    listShow,
  });
}

// 根据 ID 获取 CI 类型组项
export function getCiTypeGroupItemById(id: number) {
  return requestClient.get<CiTypeGroupItem>(
    `${Api.getCiTypeGroupItemById}/${id}`,
  );
}

// 根据 ID 获取配置项
export function getConfigItemById(id: number) {
  return requestClient.get<any>(`${Api.getConfigItemById}/${id}`);
}

// 创建配置项
export function createConfigItem(data: any) {
  return requestClient.post<any>(Api.createConfigItem, data);
}

// 更新配置项
export function updateConfigItem(id: number, data: any) {
  return requestClient.put<any>(`${Api.updateConfigItem}/${id}`, data);
}

// 添加属性到模型
export function appendAttributeToCiType(data: AttributeAppendToCiType) {
  return requestClient.post<void>(Api.appendAttributeToCiType, data);
}
