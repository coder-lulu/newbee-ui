import type {
  ID,
  MappingLogInfo,
  MappingLogListReq,
  MappingLogListResp,
  TaskLogInfo,
  TaskLogListReq,
  TaskLogListResp,
} from "./model";

import { requestClient } from "#/api/request";

enum Api {
  MappingLogById = "/io-api/mapping_log",
  MappingLogList = "/io-api/mapping_log/list",
  TaskLogById = "/io-api/task_log",
  TaskLogList = "/io-api/task_log/list",
}

export function getTaskLogList(params: TaskLogListReq) {
  return requestClient.get<TaskLogListResp>(Api.TaskLogList, { params });
}

export function getTaskLogById(id: ID) {
  return requestClient.get<TaskLogInfo>(`${Api.TaskLogById}/${id}`);
}

export function getMappingLogList(params: MappingLogListReq) {
  return requestClient.get<MappingLogListResp>(Api.MappingLogList, { params });
}

export function getMappingLogById(id: ID) {
  return requestClient.get<MappingLogInfo>(`${Api.MappingLogById}/${id}`);
}
