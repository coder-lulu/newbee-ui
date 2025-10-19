import type {
  BaseMsgResp,
  CreateOutputTaskReq,
  ID,
  IDS,
  OutputTaskInfo,
  OutputTaskListReq,
  OutputTaskListResp,
  UpdateOutputTaskReq,
} from './model';

import { requestClient } from '#/api/request';

enum Api {
  Create = '/io-api/output_task/create',
  Update = '/io-api/output_task/update',
  Delete = '/io-api/output_task/delete',
  GetById = '/io-api/output_task',
  List = '/io-api/output_task/list',
  Start = '/io-api/output_task/start',
  Pause = '/io-api/output_task/pause',
  Cancel = '/io-api/output_task/cancel',
}

export function getOutputTaskList(params: OutputTaskListReq) {
  return requestClient.get<OutputTaskListResp>(Api.List, { params });
}

export function getOutputTaskById(id: ID) {
  return requestClient.get<OutputTaskInfo>(`${Api.GetById}/${id}`);
}

export function createOutputTask(data: CreateOutputTaskReq) {
  return requestClient.postWithMsg<OutputTaskInfo>(Api.Create, data);
}

export function updateOutputTask(data: UpdateOutputTaskReq) {
  return requestClient.postWithMsg<OutputTaskInfo>(Api.Update, data);
}

export function deleteOutputTask(ids: IDS) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.Delete, { ids });
}

export function startOutputTask(id: ID) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.Start, { id });
}

export function pauseOutputTask(id: ID) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.Pause, { id });
}

export function cancelOutputTask(id: ID) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.Cancel, { id });
}

