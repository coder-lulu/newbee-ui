/**
 *  @description: Task info response
 */
export interface TaskInfo {
  id?: number;
  createdAt?: number;
  updatedAt?: number;
  status?: number;
  name?: string;
  taskGroup?: string;
  cronExpression?: string;
  pattern?: string;
  payload?: string;
}

/**
 *  @description: TaskLog info response
 */
export interface TaskLogInfo {
  id?: number;
  startedAt?: number;
  finishedAt?: number;
  result?: number;
}
