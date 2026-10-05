import { requestClient } from "#/api/request";

// Placeholder endpoints; wire up when backend exposes REST for metrics/performance
enum Api {
  Health = "/io-api/health",
  Metrics = "/io-api/metrics",
  Performance = "/io-api/performance",
  Status = "/io-api/status",
}

export function getIoStatus() {
  return requestClient.get(Api.Status);
}

export function getIoHealth() {
  return requestClient.get(Api.Health);
}

export function getIoMetrics() {
  return requestClient.get(Api.Metrics, { isTransformResponse: false } as any);
}

export function getIoPerformance() {
  return requestClient.get(Api.Performance);
}

export interface WorkerMetricsInfo {
  id: number;
  workerId: string;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  currentTaskCount: number;
  metricTime: number;
}
export function getWorkerMetricsList(params: {
  page: number;
  pageSize: number;
  workerId?: string;
}) {
  return requestClient.post<{ data: WorkerMetricsInfo[]; total: number }>(
    "/io-api/worker_metrics/list",
    params,
  );
}
