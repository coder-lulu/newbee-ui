import type { ID, IDS, PageResult, BaseMsgResp, BaseDataInfo } from '#/api/common';
import { requestClient } from '#/api/request';
import type { CiTypeRelationInfo, CiTypeRelationListReq } from './model';

enum Api {
  Create = '/cmdb-api/ci_type_relation/create',
  Update = '/cmdb-api/ci_type_relation/update',
  Delete = '/cmdb-api/ci_type_relation/delete',
  GetList = '/cmdb-api/ci_type_relation/list',
  GetById = '/cmdb-api/ci_type_relation',
}

export function getCiTypeRelationList(params: CiTypeRelationListReq) {
  return requestClient.post<PageResult<CiTypeRelationInfo>>(Api.GetList, params);
}

export function createCiTypeRelation(data: CiTypeRelationInfo) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.Create, data);
}

export function updateCiTypeRelation(data: CiTypeRelationInfo) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.Update, data);
}

export function deleteCiTypeRelation(ids: IDS) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.Delete, { ids });
}

export function getCiTypeRelationById(id: ID) {
  return requestClient.post<BaseDataInfo<CiTypeRelationInfo>>(Api.GetById, { id });
}
