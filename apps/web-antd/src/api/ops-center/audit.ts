import { requestClient } from '#/api/request';
import type { PageResult } from '#/api/common.d.ts';

export interface AuditEvent {
  eventID: string;
  type?: string;
  subjectUser?: string;
  subjectCI?: string;
  subjectProxy?: string;
  occurAt?: number;
  meta?: Record<string, string>;
}

export async function listAudit(): Promise<PageResult<AuditEvent>> {
  const ret = await requestClient.get<any>('/ops/audit/list');
  return {
    data: ret?.items ?? ret?.Items ?? [],
    total: ret?.total ?? ret?.Total ?? 0,
  };
}

