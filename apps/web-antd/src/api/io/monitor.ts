import { requestClient } from '#/api/request';

// Placeholder endpoints; wire up when backend exposes REST for metrics/performance
enum Api {
  Status = '/io-api/status',
  Health = '/io-api/health',
  Metrics = '/io-api/metrics',
  Performance = '/io-api/performance',
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

