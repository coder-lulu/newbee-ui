import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  previewWorkerSelection,
  readWorkerMetrics,
  readWorkers,
} from "./workers-read";

const client = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("#/api/request", () => ({ requestClient: client }));
describe("ops worker read contracts", () => {
  beforeEach(() => vi.clearAllMocks());
  it("reads all server pages without fabricating rows", async () => {
    client.get
      .mockResolvedValueOnce({ data: [{ id: 1 }], total: 2 })
      .mockResolvedValueOnce({ data: [{ id: 2 }], total: 2 });
    expect(await readWorkers()).toEqual([{ id: 1 }, { id: 2 }]);
    expect(client.get).toHaveBeenLastCalledWith("/ops-api/proxy/list", {
      params: { page: 2, pageSize: 100 },
    });
  });
  it("uses the real snake-case metrics query and unwrapped array", async () => {
    const samples = [{ proxy_id: "demo-proxy-01", timestamp: 100 }];
    client.get.mockResolvedValueOnce(samples);
    expect(await readWorkerMetrics("demo-proxy-01")).toEqual(samples);
    expect(client.get).toHaveBeenCalledWith("/ops-api/proxy/metrics", {
      params: { proxy_id: "demo-proxy-01", limit: 1000 },
    });
    expect(client.post).not.toHaveBeenCalled();
  });
  it("calls only the existing preview endpoint with its real request fields", async () => {
    client.post.mockResolvedValueOnce({ proxy_id: "online-node" });
    await previewWorkerSelection("least_connections", "cn-beijing");
    expect(client.post).toHaveBeenCalledExactlyOnceWith("/ops-api/proxy/pick", {
      strategy: "least_connections",
      preferred_region: "cn-beijing",
    });
  });
});
