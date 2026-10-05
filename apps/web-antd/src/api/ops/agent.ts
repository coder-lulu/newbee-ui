import { requestClient } from "#/api/request";

export namespace AgentAPI {
  // Agent基础信息
  export interface AgentItem {
    id: number;
    name: string;
    agent_id: string;
    host: string;
    port: number;
    agent_status: "error" | "offline" | "online";
    last_heartbeat: number;
    region?: string;
    tags?: string;
    version?: string;
    cpu_usage?: number;
    memory_usage?: number;
    description?: string;
    capabilities?: string;
    supported_providers?: string;
    max_concurrent_tasks?: number;
  }

  // Agent列表请求
  export interface AgentListReq {
    page?: number;
    page_size?: number;
    status?: number;
    agent_status?: string;
    region?: string;
    name?: string;
  }

  // Agent列表响应
  export interface AgentListResp {
    total: number;
    data: AgentItem[];
  }

  /**
   * 获取Agent列表
   */
  export function listAgents(params: AgentListReq = {}) {
    const { page_size, agent_status, ...filters } = params;
    return requestClient.get<AgentListResp>("/ops-api/agent/list", {
      params: { ...filters, pageSize: page_size, agentStatus: agent_status },
    });
  }

  /**
   * 获取Agent详情
   */
  export function getAgentById(id: number) {
    return requestClient.get<AgentItem>(`/ops-api/agent/${id}`);
  }

  /**
   * 创建Agent
   */
  export function createAgent(data: Partial<AgentItem>) {
    return requestClient.post("/ops-api/agent/create", data);
  }

  /**
   * 更新Agent
   */
  export function updateAgent(data: Partial<AgentItem>) {
    return requestClient.post("/ops-api/agent/update", data);
  }

  /**
   * 删除Agent
   */
  export function deleteAgent(ids: number[]) {
    return requestClient.post("/ops-api/agent/delete", { ids });
  }
}
