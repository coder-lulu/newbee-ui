import { requestClient } from '#/api/request';

import type {
  ScriptCategory,
  ScriptCategoryDetailResp,
  ScriptCategoryListReq,
  ScriptCategoryListResp,
} from './script-category-model';

export interface BaseResp {
  code: number;
  msg: string;
}

enum Api {
  CreateScriptCategory = '/ops-api/script/category/create',
  UpdateScriptCategory = '/ops-api/script/category/update',
  GetScriptCategoryList = '/ops-api/script/category/list',
  GetScriptCategoryById = '/ops-api/script/category',
  DeleteScriptCategory = '/ops-api/script/category/delete',
}

export async function scriptCategoryList(params?: ScriptCategoryListReq): Promise<ScriptCategory[]> {
  // 注意：后端返回格式为 { code, msg, data: [] }，requestClient 会自动解包为 []
  return requestClient.get<ScriptCategory[]>(
    Api.GetScriptCategoryList,
    { params },
  );
}

export async function scriptCategoryInfo(params: { id: number }): Promise<ScriptCategory> {
  // 注意：后端返回格式为 { code, msg, data: {...} }，requestClient 会自动解包为 {...}
  return requestClient.get<ScriptCategory>(
    Api.GetScriptCategoryById,
    { params },
  );
}

export async function scriptCategoryAdd(data: ScriptCategory) {
  return requestClient.post<BaseResp>(Api.CreateScriptCategory, data);
}

export async function scriptCategoryUpdate(data: ScriptCategory) {
  return requestClient.post<BaseResp>(Api.UpdateScriptCategory, data);
}

export async function scriptCategoryRemove(params: { ids: number[] }) {
  return requestClient.post<BaseResp>(Api.DeleteScriptCategory, params);
}
