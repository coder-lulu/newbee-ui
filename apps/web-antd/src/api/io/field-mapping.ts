import type {
  BaseMsgResp,
  CreateFieldMappingReq,
  FieldMappingInfo,
  FieldMappingListReq,
  FieldMappingListResp,
  ID,
  IDS,
  UpdateFieldMappingReq,
} from './model';

import { requestClient } from '#/api/request';

// NOTE: Backend REST routes for FieldMapping may be added later.
// We keep endpoints consistent with discovery_pool for now.
enum Api {
  Create = '/io-api/field_mapping/create',
  Update = '/io-api/field_mapping/update',
  Delete = '/io-api/field_mapping/delete',
  GetById = '/io-api/field_mapping',
  List = '/io-api/field_mapping/list',
}

export function getFieldMappingList(params: FieldMappingListReq) {
  return requestClient.get<FieldMappingListResp>(Api.List, { params });
}

export function getFieldMappingById(id: ID) {
  return requestClient.get<FieldMappingInfo>(`${Api.GetById}/${id}`);
}

export function createFieldMapping(data: CreateFieldMappingReq) {
  return requestClient.postWithMsg<FieldMappingInfo>(Api.Create, data);
}

export function updateFieldMapping(data: UpdateFieldMappingReq) {
  return requestClient.postWithMsg<FieldMappingInfo>(Api.Update, data);
}

export function deleteFieldMapping(ids: IDS) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.Delete, { ids });
}

