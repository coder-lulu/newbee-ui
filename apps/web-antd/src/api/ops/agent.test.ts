import { expect, it, vi } from "vitest";

import { AgentAPI } from "./agent";

const client = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("#/api/request", () => ({ requestClient: client }));
it("maps agent pagination and state to the HTTP query contract", async () => {
  const data = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    agent_status: "offline",
  }));
  client.get.mockResolvedValueOnce({ total: 30, data });
  const response = await AgentAPI.listAgents({
    page: 1,
    page_size: 20,
    agent_status: "offline",
    name: "演示",
  });
  expect(client.get).toHaveBeenCalledExactlyOnceWith("/ops-api/agent/list", {
    params: { page: 1, pageSize: 20, agentStatus: "offline", name: "演示" },
  });
  expect(response.data).toHaveLength(20);
  expect(response.total).toBe(30);
});
