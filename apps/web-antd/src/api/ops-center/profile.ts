import { requestClient } from '#/api/request';
import type { PageResult } from '#/api/common.d.ts';

export interface AccessProfile {
  ciId: string;
  capabilities?: string[];
  ports?: Record<string, number>;
  credentialRef?: string;
  preferProxy?: string;
  jumpChain?: string[];
  tags?: Record<string, string>;
}

export interface AccessProfileReq {
  accessProfile: AccessProfile;
}

export async function createProfile(data: AccessProfileReq) {
  return requestClient.postWithMsg<void>('/ops/profile/create', data);
}

export async function updateProfile(data: AccessProfileReq) {
  return requestClient.postWithMsg<void>('/ops/profile/update', data);
}

export async function getProfile(params?: { ciId?: string }): Promise<AccessProfile> {
  return requestClient.get<AccessProfile>('/ops/profile/get', { params });
}

export async function listProfiles(): Promise<PageResult<AccessProfile>> {
  const ret = await requestClient.get<any>('/ops/profile/list');
  return {
    data: ret?.items ?? ret?.Items ?? [],
    total: ret?.total ?? ret?.Total ?? 0,
  };
}

export async function deleteProfile(params: { ciId: string }) {
  return requestClient.deleteWithMsg<void>('/ops/profile/delete', { params });
}

