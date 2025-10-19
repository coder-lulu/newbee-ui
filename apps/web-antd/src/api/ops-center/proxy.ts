import { requestClient } from '#/api/request';

export interface ProxyRegisterReq {
  proxyId: string;
  region?: string;
  az?: string;
  endpoints?: Record<string, string>;
  capabilities?: string[];
  labels?: Record<string, string>;
}

export interface ProxyHeartbeatReq {
  proxyId: string;
  status?: string;
  load?: {
    cpu?: number;
    mem?: number;
    session?: { active?: number; max?: number };
  };
}

export interface PickProxyResp {
  proxyId: string;
  endpoint: string;
}

export async function registerProxy(data: ProxyRegisterReq) {
  return requestClient.postWithMsg<void>('/ops/proxy/register', data);
}

export async function heartbeatProxy(data: ProxyHeartbeatReq) {
  return requestClient.postWithMsg<void>('/ops/proxy/heartbeat', data);
}

export async function pickProxy(): Promise<PickProxyResp> {
  return requestClient.get<PickProxyResp>('/ops/proxy/pick');
}

