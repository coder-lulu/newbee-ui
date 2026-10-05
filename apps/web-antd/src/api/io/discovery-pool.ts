import type {
  BaseMsgResp,
  CreateDiscoveryPoolReq,
  DiscoveryPoolInfo,
  DiscoveryPoolListReq,
  DiscoveryPoolListResp,
  ID,
  IDS,
  UpdateDiscoveryPoolReq,
} from "./model";

import { requestClient } from "#/api/request";

enum Api {
  Create = "/io-api/discovery_pool/create",
  Delete = "/io-api/discovery_pool/delete",
  Disable = "/io-api/discovery_pool/disable",
  Enable = "/io-api/discovery_pool/enable",
  GetById = "/io-api/discovery_pool",
  List = "/io-api/discovery_pool/list",
  Stats = "/io-api/discovery_pool/stats",
  Trigger = "/io-api/discovery_pool/trigger",
  Update = "/io-api/discovery_pool/update",
}

export function getDiscoveryPoolList(params: DiscoveryPoolListReq) {
  return requestClient.post<DiscoveryPoolListResp>(Api.List, params, {
    params: { page: params.page, pageSize: params.pageSize },
  });
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
