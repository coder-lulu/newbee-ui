import { expect, it, vi } from "vitest";

import { getOauthStatistics } from "./index";

const client = vi.hoisted(() => ({ post: vi.fn(), get: vi.fn() }));
vi.mock("#/api/request", () => ({ requestClient: client }));
it("uses the real POST statistics endpoint without fabricated fallback", async () => {
  const data = { totalProviders: 32, providerStats: [], loginTrend: [] };
  client.post.mockResolvedValueOnce(data);
  expect(await getOauthStatistics()).toBe(data);
  expect(client.post).toHaveBeenCalledExactlyOnceWith(
    "/sys-api/oauth/statistics",
    {},
  );
  expect(client.get).not.toHaveBeenCalled();
  client.post.mockRejectedValueOnce(new Error("RPC unavailable"));
  await expect(getOauthStatistics({ providerId: 32 })).rejects.toThrow(
    "RPC unavailable",
  );
  expect(client.post).toHaveBeenLastCalledWith("/sys-api/oauth/statistics", {
    providerId: 32,
  });
});
