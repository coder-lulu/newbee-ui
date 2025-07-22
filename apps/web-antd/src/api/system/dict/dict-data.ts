import type { DictData, DictDataSimpleListResp } from './dict-data-model';

import type { ID, IDS, PageQuery } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  CreateDictionaryDetail = '/sys-api/dictionary_detail/create',
  DeleteDictionaryDetail = '/sys-api/dictionary_detail/delete',
  dictDataExport = '/system/dict/data/export',
  dictDataList = '/system/dict/data/list',
  GetDictionaryDetailByDictionaryName = '/sys-api/dict',
  GetDictionaryDetailById = '/sys-api/dictionary_detail',
  GetDictionaryDetailList = '/sys-api/dictionary_detail/list',
  root = '/system/dict/data',
  UpdateDictionaryDetail = '/sys-api/dictionary_detail/update',
}

/**
 * 主要是DictTag组件使用
 * @param dictType 字典类型
 * @returns 字典数据
 */
export function dictDataInfo(dictType: string) {
  return requestClient.get<DictDataSimpleListResp>(
    `${Api.GetDictionaryDetailByDictionaryName}/${dictType}`,
  );
}

/**
 * 字典数据
 * @param params 查询参数
 * @returns 字典数据列表
 */
export function dictDataList(params?: PageQuery) {
  return requestClient.post<DictData[]>(Api.GetDictionaryDetailList, {
    ...params,
  });
}

/**
 * 导出字典数据
 * @param data 表单参数
 * @returns blob
 */
export function dictDataExport(data: Partial<DictData>) {
  return commonExport(Api.dictDataExport, data);
}

/**
 * 删除
 * @param dictIds 字典ID Array
 * @returns void
 */
export function dictDataRemove(dictIds: IDS) {
  return requestClient.postWithMsg<void>(Api.DeleteDictionaryDetail, {
    ids: dictIds,
  });
}

/**
 * 新增
 * @param data 表单参数
 * @returns void
 */
export function dictDataAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.CreateDictionaryDetail, data);
}

/**
 * 修改
 * @param data 表单参数
 * @returns void
 */
export function dictDataUpdate(data: any) {
  return requestClient.postWithMsg<void>(Api.UpdateDictionaryDetail, data);
}

/**
 * 查询字典数据详细
 * @param id 字典编码
 * @returns 字典数据
 */
export function dictDetailInfo(id: ID) {
  return requestClient.post<DictData>(Api.GetDictionaryDetailById, { id });
}
