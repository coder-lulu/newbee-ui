import { requestClient } from '#/api/request';

import type {
  ScriptVersion,
  ScriptVersionListReq,
  ScriptVersionListResp,
} from './script-version-model';

enum Api {
  GetScriptVersionList = '/ops-api/script_version/list',
  GetScriptVersionById = '/ops-api/script_version',
}

export async function scriptVersionList(params?: ScriptVersionListReq) {
  return requestClient.post<ScriptVersionListResp>(
    Api.GetScriptVersionList,
    params,
  );
}

export async function scriptVersionInfo(params: { id: number }) {
  return requestClient.post<ScriptVersion>(Api.GetScriptVersionById, params);
}
