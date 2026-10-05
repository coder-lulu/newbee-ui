import type {
  BaseMsgResp,
  ConfigAuditLog,
  ConfigItem,
  CreateConfigReq,
  DeleteConfigReq,
  GetConfigHistoryReq,
  GetConfigHistoryResp,
  GetConfigReq,
  GetConfigResp,
  ListAuditLogReq,
  ListAuditLogResp,
  ListConfigReq,
  ListConfigResp,
  RollbackConfigReq,
  UpdateConfigReq,
} from './model';

import { requestClient } from '#/api/request';

enum Api {
  List = '/io-api/config/list',
  Get = '/io-api/config/get',
  Create = '/io-api/config/create',
  Update = '/io-api/config/update',
  Delete = '/io-api/config/delete',
  ListAuditLog = '/io-api/config/audit_log/list',
  GetHistory = '/io-api/config/history/get',
  Rollback = '/io-api/config/rollback',
}

export function getConfigList(params: ListConfigReq) {
  return requestClient.post<ListConfigResp>(Api.List, params);
}

export function getConfigByKey(params: GetConfigReq) {
  return requestClient.post<GetConfigResp>(Api.Get, params);
}

export function createConfig(data: CreateConfigReq) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.Create, data);
}

export function updateConfig(data: UpdateConfigReq) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.Update, data);
}

export function deleteConfig(params: DeleteConfigReq) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.Delete, params);
}

export function getAuditLogList(params: ListAuditLogReq) {
  return requestClient.post<ListAuditLogResp>(Api.ListAuditLog, params);
}

export function getConfigHistory(params: GetConfigHistoryReq) {
  return requestClient.post<GetConfigHistoryResp>(Api.GetHistory, params);
}

export function rollbackConfig(params: RollbackConfigReq) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.Rollback, params);
}
