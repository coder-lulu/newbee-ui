import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

export type { ID, IDS, PageQuery, PageResult };

export type DiscoveryType = 'file' | 'api' | 'sdk' | 'builtin';
export type PoolStatus = 'active' | 'inactive' | 'error' | 'maintain';

export interface DiscoveryPoolInfo {
  id?: number;
  name: string;
  description?: string;
  discoveryType: DiscoveryType;
  poolStatus: PoolStatus;
  discoveryConfig?: string; // JSON string
  schedule?: string;
  batchSize?: number;
  concurrentLimit?: number;
  maxRetry?: number;
  retryInterval?: number;
  fieldMapping?: string; // JSON string
  totalRuns?: number;
  successRuns?: number;
  failedRuns?: number;
  lastRunAt?: number | null;
  lastSuccessAt?: number | null;
  lastError?: string | null;
  metadata?: string; // JSON string
  createdAt?: number;
  updatedAt?: number;
}

export interface DiscoveryPoolListReq extends PageQuery {
  name?: string;
  discoveryType?: DiscoveryType;
  poolStatus?: PoolStatus;
}

export interface DiscoveryPoolListResp extends PageResult<DiscoveryPoolInfo> {}

export interface CreateDiscoveryPoolReq {
  name: string;
  description?: string;
  discoveryType: DiscoveryType;
  discoveryConfig?: string;
  schedule?: string;
  batchSize?: number;
  concurrentLimit?: number;
  maxRetry?: number;
  retryInterval?: number;
  fieldMapping?: string;
  metadata?: string;
}

export interface UpdateDiscoveryPoolReq extends Partial<CreateDiscoveryPoolReq> {
  id: ID;
}

export interface BaseMsgResp {
  code: number;
  msg: string;
}

// ========== Field Mapping ==========
export type MappingType = 'input' | 'output' | 'transform' | 'validation';
export type DataType = 'string' | 'int' | 'float' | 'bool' | 'date' | 'datetime' | 'json' | 'array';
export type TransformType = 'direct' | 'format' | 'calculate' | 'lookup' | 'conditional' | 'custom';

export interface FieldMappingInfo {
  id?: number;
  mappingName: string;
  description?: string;
  mappingType: MappingType;
  isActive?: boolean;
  sourceField: string;
  sourceFieldPath?: string;
  sourceDataType?: DataType;
  targetField: string;
  targetFieldPath?: string;
  targetDataType?: DataType;
  transformType?: TransformType;
  transformConfig?: string; // JSON string
  sourceFormat?: string;
  targetFormat?: string;
  defaultValue?: string;
  allowNull?: boolean;
  isRequired?: boolean;
  validationRules?: string; // JSON array string
  validationRegex?: string;
  lookupTable?: string; // JSON string
  lookupCaseSensitive?: boolean;
  conditionRules?: string; // JSON array string
  priority?: number;
  sortOrder?: number;
  discoveryPoolId?: number;
  inputTaskId?: number;
  outputTaskId?: number;
  usageCount?: number;
  successCount?: number;
  failedCount?: number;
  lastUsedAt?: number | null;
  lastError?: string | null;
  lastErrorAt?: number | null;
  version?: string;
  versionHistory?: string; // JSON array string
  metadata?: string; // JSON string
  createdAt?: number;
  updatedAt?: number;
}

export interface FieldMappingListReq extends PageQuery {
  mappingName?: string;
  mappingType?: MappingType;
  isActive?: boolean;
}

export interface FieldMappingListResp extends PageResult<FieldMappingInfo> {}

export interface CreateFieldMappingReq extends Partial<FieldMappingInfo> {
  mappingName: string;
  mappingType: MappingType;
  sourceField: string;
  targetField: string;
}

export interface UpdateFieldMappingReq extends Partial<CreateFieldMappingReq> {
  id: ID;
}

// ========== Input Task ==========
export type TaskType = 'file' | 'api' | 'sdk' | 'builtin' | 'manual';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';

export interface InputTaskInfo {
  id?: number;
  name: string;
  description?: string;
  taskType: TaskType;
  taskStatus?: TaskStatus;
  priority?: number;
  timeoutSeconds?: number;
  taskConfig?: string; // JSON
  validationConfig?: string; // JSON
  outputTargets?: string; // JSON array
  scheduledAt?: number | null;
  startedAt?: number | null;
  completedAt?: number | null;
  processedRecords?: number;
  successRecords?: number;
  failedRecords?: number;
  errorMessage?: string | null;
  errorDetails?: string; // JSON
  maxRetry?: number;
  retryCount?: number;
  nextRetryAt?: number | null;
  discoveryPoolId?: number;
  workerId?: string;
  progressPercent?: number;
  progressMessage?: string;
  metadata?: string; // JSON
  createdAt?: number;
  updatedAt?: number;
}

export interface InputTaskListReq extends PageQuery {
  name?: string;
  taskType?: TaskType;
  taskStatus?: TaskStatus;
  discoveryPoolId?: number;
}

export interface InputTaskListResp extends PageResult<InputTaskInfo> {}

export interface CreateInputTaskReq extends Partial<InputTaskInfo> {
  name: string;
  taskType: TaskType;
}

export interface UpdateInputTaskReq extends Partial<CreateInputTaskReq> {
  id: ID;
}

// ========== Output Task ==========
export type OutputType = 'kafka' | 'elasticsearch' | 'database' | 'api' | 'file' | 'webhook' | 'email';

export interface OutputTaskInfo {
  id?: number;
  name: string;
  description?: string;
  outputType: OutputType;
  taskStatus?: TaskStatus;
  priority?: number;
  timeoutSeconds?: number;
  dataSource?: string; // JSON
  outputFormat?: 'json' | 'xml' | 'csv' | 'excel' | 'txt' | 'parquet' | 'avro';
  pushTargets?: string; // JSON array
  compressionConfig?: string; // JSON
  transformConfig?: string; // JSON
  scheduledAt?: number | null;
  startedAt?: number | null;
  completedAt?: number | null;
  processedRecords?: number;
  successRecords?: number;
  failedRecords?: number;
  outputFilePath?: string;
  outputFileSize?: number;
  errorMessage?: string | null;
  errorDetails?: string; // JSON
  maxRetry?: number;
  retryCount?: number;
  nextRetryAt?: number | null;
  workerId?: string;
  progressPercent?: number;
  progressMessage?: string;
  throughputRate?: number;
  durationSeconds?: number;
  triggerSource?: string;
  triggerTaskId?: number;
  dependencies?: string; // JSON array
  metadata?: string; // JSON
  createdAt?: number;
  updatedAt?: number;
}

export interface OutputTaskListReq extends PageQuery {
  name?: string;
  outputType?: OutputType;
  taskStatus?: TaskStatus;
}

export interface OutputTaskListResp extends PageResult<OutputTaskInfo> {}

export interface CreateOutputTaskReq extends Partial<OutputTaskInfo> {
  name: string;
  outputType: OutputType;
}

export interface UpdateOutputTaskReq extends Partial<CreateOutputTaskReq> {
  id: ID;
}

// ========== Logs ==========
export interface TaskLogInfo {
  id?: number;
  taskId?: number;
  taskType?: 'input' | 'output';
  level?: string;
  message?: string;
  details?: string; // JSON
  createdAt?: number;
}

export interface TaskLogListReq extends PageQuery {
  taskId?: number;
  taskType?: 'input' | 'output';
  level?: string;
}

export interface TaskLogListResp extends PageResult<TaskLogInfo> {}

export interface MappingLogInfo {
  id?: number;
  fieldMappingId?: number;
  level?: string;
  message?: string;
  details?: string; // JSON
  createdAt?: number;
}

export interface MappingLogListReq extends PageQuery {
  fieldMappingId?: number;
  level?: string;
}

export interface MappingLogListResp extends PageResult<MappingLogInfo> {}
