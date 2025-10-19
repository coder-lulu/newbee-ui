import type {
  MappingLogInfo,
  MappingLogListReq,
  MappingLogListResp,
  TaskLogInfo,
  TaskLogListReq,
  TaskLogListResp,
  ID,
} from './model';

import { requestClient } from '#/api/request';

enum Api {
  TaskLogList = '/io-api/log/task/list',
  TaskLogById = '/io-api/log/task',
  MappingLogList = '/io-api/log/mapping/list',
  MappingLogById = '/io-api/log/mapping',
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

