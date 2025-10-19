import { requestClient } from '#/api/request';
import type { PageResult } from '#/api/common.d.ts';

export interface CredentialRef {
  id?: string;
  provider?: string;
  ref?: string;
  scope?: string;
  createdBy?: string;
  tags?: Record<string, string>;
}

export interface CredentialCreateReq {
  credential: CredentialRef;
}

export async function createCredential(data: CredentialCreateReq) {
  return requestClient.postWithMsg<void>('/ops/credential/create', data);
}

export async function updateCredential(data: CredentialCreateReq) {
  return requestClient.postWithMsg<void>('/ops/credential/update', data);
}

export async function getCredential(id: string): Promise<CredentialRef> {
  return requestClient.get<CredentialRef>(`/ops/credential/${id}`);
}

export async function listCredential(): Promise<PageResult<CredentialRef>> {
  const ret = await requestClient.get<any>('/ops/credential/list');
  return {
    data: ret?.items ?? ret?.Items ?? [],
    total: ret?.total ?? ret?.Total ?? 0,
  };
}

export async function deleteCredential(id: string) {
  return requestClient.deleteWithMsg<void>(`/ops/credential/delete/${id}`);
}

