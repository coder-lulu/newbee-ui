import type {
  BaseMsgResp,
  CreateDiscoveryPoolReq,
  DiscoveryPoolInfo,
  DiscoveryPoolListReq,
  DiscoveryPoolListResp,
  ID,
  IDS,
  UpdateDiscoveryPoolReq,
} from './model';

import { requestClient } from '#/api/request';

enum Api {
  Create = '/io-api/discovery_pool/create',
  Update = '/io-api/discovery_pool/update',
  Delete = '/io-api/discovery_pool/delete',
  GetById = '/io-api/discovery_pool',
  List = '/io-api/discovery_pool/list',
  Enable = '/io-api/discovery_pool/enable',
  Disable = '/io-api/discovery_pool/disable',
  Trigger = '/io-api/discovery_pool/trigger',
  Stats = '/io-api/discovery_pool/stats',
}

export function getDiscoveryPoolList(params: DiscoveryPoolListReq) {
  return requestClient.post<DiscoveryPoolListResp>(Api.List, params);
}

export function getDiscoveryPoolById(id: ID) {
  return requestClient.get<DiscoveryPoolInfo>(`${Api.GetById}/${id}`);
}

export function createDiscoveryPool(data: CreateDiscoveryPoolReq) {
  return requestClient.postWithMsg<DiscoveryPoolInfo>(Api.Create, data);
}

export function updateDiscoveryPool(data: UpdateDiscoveryPoolReq) {
  return requestClient.postWithMsg<DiscoveryPoolInfo>(Api.Update, data);
}

export function deleteDiscoveryPool(ids: IDS) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.Delete, { ids });
}

export function enableDiscoveryPool(id: ID) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.Enable, { id });
}

export function disableDiscoveryPool(id: ID) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.Disable, { id });
}

export function triggerDiscoveryPool(id: ID) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.Trigger, { id });
}

export function getDiscoveryPoolStats(id: ID) {
  return requestClient.get<any>(`${Api.Stats}/${id}`);
}

