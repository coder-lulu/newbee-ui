import type { TaskInfo, TaskLogInfo } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  CreateTask = '/sys-api/task/create',
  // taskLog
  CreateTaskLog = '/sys-api/task_log/create',
  DeleteTask = '/sys-api/task/delete',
  DeleteTaskLog = '/sys-api/task_log/delete',
  GetTaskById = '/sys-api/task',
  GetTaskList = '/sys-api/task/list',
  GetTaskLogById = '/sys-api/task_log',
  GetTaskLogList = '/sys-api/task_log/list',
  UpdateTask = '/sys-api/task/update',
  UpdateTaskLog = '/sys-api/task_log/update',
}

/**
 * @description: Get task list
 */

export const getTaskList = (params: PageQuery) => {
  return requestClient.post<PageResult<TaskInfo>>(Api.GetTaskList, {
    ...params,
  });
};

/**
 *  @description: Create a new task
 */
export const createTask = (params: TaskInfo) => {
  return requestClient.postWithMsg<void>(Api.CreateTask, params);
};

/**
 *  @description: Update the task
 */
export const updateTask = (params: TaskInfo) => {
  return requestClient.postWithMsg<void>(Api.UpdateTask, params);
};

/**
 *  @description: Delete tasks
 */
export const deleteTask = (ids: IDS) => {
  return requestClient.postWithMsg<void>(Api.DeleteTask, { ids });
};

/**
 *  @description: Get task By ID
 */
export const getTaskById = (id: ID) => {
  return requestClient.post<TaskInfo>(Api.GetTaskById, { id });
};

// taskLog

/**
 * @description: Get task log list
 */

export const getTaskLogList = (params: PageQuery) => {
  return requestClient.post<PageResult<TaskLogInfo>>(Api.GetTaskLogList, {
    ...params,
  });
};

/**
 *  @description: Create a new task log
 */
export const createTaskLog = (params: TaskLogInfo) => {
  return requestClient.postWithMsg<void>(Api.CreateTaskLog, params);
};

/**
 *  @description: Update the task log
 */
export const updateTaskLog = (params: TaskLogInfo) => {
  return requestClient.postWithMsg<void>(Api.UpdateTaskLog, params);
};

/**
 *  @description: Delete task logs
 */
export const deleteTaskLog = (ids: IDS) => {
  return requestClient.postWithMsg<void>(Api.DeleteTaskLog, { ids });
};

/**
 *  @description: Get task log By ID
 */
export const getTaskLogById = (id: ID) => {
  return requestClient.post<TaskLogInfo>(Api.GetTaskLogById, { id });
};
