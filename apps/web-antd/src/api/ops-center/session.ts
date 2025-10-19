import { requestClient } from '#/api/request';
import type { PageResult } from '#/api/common.d.ts';

export interface SessionItem {
  id: string;
  tenantId?: string;
  userId?: string;
  ciId: string;
  protocol: string;
  proxyId?: string;
  endpoint?: string;
  createdAt?: number;
  expiresAt?: number;
  status?: string;
  closedAt?: number;
}

export interface CreateSessionReq {
  ciId: string;
  protocol: string; // ssh|telnet|rdp|vnc
  preferProxy?: string;
  params?: Record<string, string>;
  options?: {
    port?: number;
    width?: number;
    height?: number;
    depth?: number;
    locale?: string;
    timezone?: string;
  };
  comment?: string;
}

export interface CreateSessionResp {
  sessionId: string;
  proxyId: string;
  wsUrl: string;
  token: string;
  expiresAt: number;
  handshake?: Record<string, string>;
}

export interface CloseSessionReq {
  sessionId: string;
  reason?: string;
  force?: boolean;
}

export interface SessionListParams {
  status?: string;
  ciId?: string;
  page?: number;
  size?: number;
  protocol?: string;
  proxyId?: string;
  userId?: string;
  begin?: number;
  end?: number;
  sortBy?: string;
  order?: string;
}

export async function createSession(
  data: CreateSessionReq,
): Promise<CreateSessionResp> {
  return requestClient.post<CreateSessionResp>('/ops/session/create', data);
}

export async function closeSession(
  data: CloseSessionReq,
): Promise<{ ok: boolean; closedAt: number }> {
  return requestClient.post('/ops/session/close', data);
}

export async function getSessionById(id: string): Promise<SessionItem> {
  return requestClient.get<SessionItem>(`/ops/session/${id}`);
}

export async function getSessionByQuery(
  params: Partial<Pick<SessionItem, 'id' | 'ciId' | 'status' | 'protocol' | 'proxyId' | 'userId'>>,
): Promise<SessionItem> {
  return requestClient.get<SessionItem>('/ops/session/get', { params });
}

export async function listSessions(
  params: SessionListParams,
): Promise<PageResult<SessionItem>> {
  const ret = await requestClient.get<any>('/ops/session/list', { params });
  // 后端为 { Items, Total }，适配到前端 PageResult { data, total }
  return {
    data: ret?.items ?? ret?.Items ?? [],
    total: ret?.total ?? ret?.Total ?? 0,
  };
}

