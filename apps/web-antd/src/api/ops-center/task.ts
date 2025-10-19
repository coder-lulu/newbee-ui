import { requestClient } from '#/api/request';

export interface TaskCommand {
  content: string;
  timeout?: number;
  env?: Record<string, string>;
  workDir?: string;
}

export interface CreateTaskReq {
  name: string;
  ciIds: string[];
  executor: 'agent' | 'ssh';
  command: TaskCommand;
}

export interface CreateTaskResp {
  taskId: string;
  status: string;
}

export interface TaskStatusResp {
  taskId: string;
  status: string;
}

export interface TaskResultResp {
  taskId: string;
  status: string;
  output?: string;
  error?: string;
  exitCode?: number;
}

export async function createTask(data: CreateTaskReq): Promise<CreateTaskResp> {
  return requestClient.post<CreateTaskResp>('/ops/task/create', data);
}

export async function getTaskStatus(taskId: string): Promise<TaskStatusResp> {
  return requestClient.get<TaskStatusResp>(`/ops/task/status/${taskId}`);
}

export async function getTaskResult(taskId: string): Promise<TaskResultResp> {
  return requestClient.get<TaskResultResp>(`/ops/task/result/${taskId}`);
}

