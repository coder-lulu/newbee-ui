import type {
  BaseMsgResp,
  CreateInputTaskReq,
  ID,
  IDS,
  InputTaskInfo,
  InputTaskListReq,
  InputTaskListResp,
  UpdateInputTaskReq,
} from "./model";

import { requestClient } from "#/api/request";

enum Api {
  Cancel = "/io-api/input_task/cancel",
  Create = "/io-api/input_task/create",
  Delete = "/io-api/input_task/delete",
  GetById = "/io-api/input_task",
  List = "/io-api/input_task/list",
  Pause = "/io-api/input_task/pause",
  Start = "/io-api/input_task/start",
  Update = "/io-api/input_task/update",
}

export function getInputTaskList(params: InputTaskListReq) {
  return requestClient.post<InputTaskListResp>(Api.List, params, {
    params: { page: params.page, pageSize: params.pageSize },
  });
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
