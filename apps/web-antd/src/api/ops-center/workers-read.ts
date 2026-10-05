import { requestClient } from "#/api/request";

export interface WorkerReadRow {
  id: number;
  proxyId: string;
  name: string;
  ip: string;
  port: number;
  region: string;
  zone: string;
  proxyStatus: string;
  lastHeartbeat: number;
  cpuUsage: number;
  memoryUsage: number;
  activeSessions: number;
  maxSessions: number;
  totalRequests: number;
  successCount: number;
  weight: number;
  priority: number;
}

export interface WorkerMetricSample {
  proxy_id: string;
  timestamp: number;
  cpu_usage: number;
  memory_usage: number;
  active_sessions: number;
  request_delta: number;
  success_delta: number;
  failure_delta: number;
  avg_latency_ms: number;
  proxy_status: string;
}

export interface WorkerSelection {
  proxy_id: string;
  name: string;
  ip: string;
  port: number;
}

// These menus manage Ops Proxy nodes; Job scheduling and IO workers have separate APIs.
export async function readWorkers(): Promise<WorkerReadRow[]> {
  const rows: WorkerReadRow[] = [];
  for (let page = 1; ; page++) {
    const result = await requestClient.get<{
      data: WorkerReadRow[];
      total: number;
    }>("/ops-api/proxy/list", { params: { page, pageSize: 100 } });
    rows.push(...result.data);
    if (result.data.length === 0 || rows.length >= result.total) return rows;
  }
}

export function readWorkerMetrics(
  proxyId: string,
): Promise<WorkerMetricSample[]> {
  return requestClient.get<WorkerMetricSample[]>("/ops-api/proxy/metrics", {
    params: { proxy_id: proxyId, limit: 1000 },
  });
}

// Existing endpoint only reads/filter-selects a Proxy; it does not create a task/session.
export function previewWorkerSelection(
  strategy: string,
  region?: string,
): Promise<WorkerSelection> {
  return requestClient.post<WorkerSelection>("/ops-api/proxy/pick", {
    strategy,
    preferred_region: region || undefined,
  });
}
