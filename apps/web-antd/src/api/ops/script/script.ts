import { requestClient } from '#/api/request';

import type { Script, ScriptListReq, ScriptListResp } from './script-model';

export interface BaseResp {
  code: number;
  msg: string;
}

enum Api {
  CreateScript = '/ops-api/script/create',
  UpdateScript = '/ops-api/script/update',
  GetScriptList = '/ops-api/script/list',
  GetScriptById = '/ops-api/script',
  DeleteScript = '/ops-api/script/delete',
}

export async function scriptList(params?: ScriptListReq) {
  return requestClient.get<ScriptListResp>(Api.GetScriptList, { params });
}

export async function scriptInfo(params: { id: number }) {
  return requestClient.get<Script>(Api.GetScriptById, { params });
}

export async function scriptAdd(data: Script) {
  return requestClient.post<BaseResp>(Api.CreateScript, data);
}

export async function scriptUpdate(data: Script) {
  return requestClient.post<BaseResp>(Api.UpdateScript, data);
}

export async function scriptRemove(params: { ids: number[] }) {
  return requestClient.post<BaseResp>(Api.DeleteScript, params);
}
