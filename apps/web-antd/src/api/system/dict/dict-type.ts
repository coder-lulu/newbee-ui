import type { DictType } from './dict-type-model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  CreateDictionary = '/sys-api/dictionary/create',
  DeleteDictionary = '/sys-api/dictionary/delete',
  dictOptionSelectList = '/system/dict/type/optionselect',
  dictTypeExport = '/system/dict/type/export',
  dictTypeList = '/system/dict/type/list',
  dictTypeRefreshCache = '/system/dict/type/refreshCache',
  GetDictionaryById = '/sys-api/dictionary',
  GetDictionaryList = '/sys-api/dictionary/list',
  root = '/system/dict/type',
  UpdateDictionary = '/sys-api/dictionary/update',
}

/**
 * 获取字典类型列表
 * @param params 请求参数
 * @returns list
 */
export function dictTypeList(params?: PageQuery) {
  return requestClient.post<PageResult<DictType>>(Api.GetDictionaryList, {
    ...params,
  });
}

/**
 * 导出字典类型列表
 * @param data 表单参数
 * @returns blob
 */
export function dictTypeExport(data: Partial<DictType>) {
  return commonExport(Api.dictTypeExport, data);
}

/**
 * 删除字典类型
 * @param dictIds 字典类型id数组
 * @returns void
 */
export function dictTypeRemove(dictIds: IDS) {
  return requestClient.postWithMsg<void>(Api.DeleteDictionary, {
    ids: dictIds,
  });
}

/**
 * 刷新字典缓存
 * @returns void
 */
export function refreshDictTypeCache() {
  return requestClient.postWithMsg<void>(Api.dictTypeRefreshCache);
}

/**
 * 新增
 * @param data 表单参数
 * @returns void
 */
export function dictTypeAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.CreateDictionary, data);
}

/**
 * 修改
 * @param data 表单参数
 * @returns void
 */
export function dictTypeUpdate(data: any) {
  return requestClient.postWithMsg<void>(Api.UpdateDictionary, data);
}

/**
 * 查询详情
 * @param dictId 字典类型id
 * @returns 信息
 */
export function dictTypeInfo(dictId: ID) {
  return requestClient.post<DictType>(Api.GetDictionaryById, { id: dictId });
}

/**
 * 这个在ele用到 v5用不上
 * 下拉框  返回值和list一样
 * @returns options
 */
export function dictOptionSelectList() {
  return requestClient.get<DictType[]>(Api.dictOptionSelectList);
}
