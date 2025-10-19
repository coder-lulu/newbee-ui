import type {
  BaseMsgResp,
  CreateInputTaskReq,
  ID,
  IDS,
  InputTaskInfo,
  InputTaskListReq,
  InputTaskListResp,
  UpdateInputTaskReq,
} from './model';

import { requestClient } from '#/api/request';

enum Api {
  Create = '/io-api/input_task/create',
  Update = '/io-api/input_task/update',
  Delete = '/io-api/input_task/delete',
  GetById = '/io-api/input_task',
  List = '/io-api/input_task/list',
  Start = '/io-api/input_task/start',
  Pause = '/io-api/input_task/pause',
  Cancel = '/io-api/input_task/cancel',
}

export function getInputTaskList(params: InputTaskListReq) {
  return requestClient.post<InputTaskListResp>(Api.List, params);
}

export function getInputTaskById(id: ID) {
  return requestClient.get<InputTaskInfo>(`${Api.GetById}/${id}`);
}

export function createInputTask(data: CreateInputTaskReq) {
  return requestClient.postWithMsg<InputTaskInfo>(Api.Create, data);
}

export function updateInputTask(data: UpdateInputTaskReq) {
  return requestClient.postWithMsg<InputTaskInfo>(Api.Update, data);
}

export function deleteInputTask(ids: IDS) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.Delete, { ids });
}

export function startInputTask(id: ID) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.Start, { id });
}

export function pauseInputTask(id: ID) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.Pause, { id });
}

export function cancelInputTask(id: ID) {
  return requestClient.postWithMsg<BaseMsgResp>(Api.Cancel, { id });
}

