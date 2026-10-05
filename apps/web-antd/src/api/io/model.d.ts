import type { ID, IDS, PageQuery, PageResult } from "#/api/common";

export type { ID, IDS, PageQuery, PageResult };

export type DiscoveryType = "api" | "builtin" | "file" | "sdk";
export type PoolStatus = "active" | "error" | "inactive" | "maintain";

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
  lastRunAt?: null | number;
  lastSuccessAt?: null | number;
  lastError?: null | string;
  metadata?: string; // JSON string
  createdAt?: number;
  updatedAt?: number;
}

export interface DiscoveryPoolListReq extends PageQuery {
  name?: string;
  discoveryType?: DiscoveryType;
  poolStatus?: PoolStatus;
}

export type DiscoveryPoolListResp = PageResult<DiscoveryPoolInfo>;

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

export interface UpdateDiscoveryPoolReq
  extends Partial<CreateDiscoveryPoolReq> {
  id: ID;
}

export interface BaseMsgResp {
  code: number;
  msg: string;
}

// ========== Field Mapping ==========
export type MappingType = "input" | "output" | "transform" | "validation";
export type DataType =
  | "array"
  | "bool"
  | "date"
  | "datetime"
  | "float"
  | "int"
  | "json"
  | "string";
export type TransformType =
  | "calculate"
  | "conditional"
  | "custom"
  | "direct"
  | "format"
  | "lookup";

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
  lastUsedAt?: null | number;
  lastError?: null | string;
  lastErrorAt?: null | number;
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

export type FieldMappingListResp = PageResult<FieldMappingInfo>;

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
export type TaskType = "api" | "builtin" | "file" | "manual" | "sdk";
export type TaskStatus =
  | "cancelled"
  | "completed"
  | "failed"
  | "paused"
  | "pending"
  | "running";

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
  scheduledAt?: null | number;
  startedAt?: null | number;
  completedAt?: null | number;
  totalRecords?: number;
  processedRecords?: number;
  successRecords?: number;
  failedRecords?: number;
  errorMessage?: null | string;
  errorDetails?: string; // JSON
  maxRetry?: number;
  retryCount?: number;
  nextRetryAt?: null | number;
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

export type InputTaskListResp = PageResult<InputTaskInfo>;

export interface CreateInputTaskReq extends Partial<InputTaskInfo> {
  name: string;
  taskType: TaskType;
}

export interface UpdateInputTaskReq extends Partial<CreateInputTaskReq> {
  id: ID;
}

// ========== Output Task ==========
export type OutputType =
  | "api"
  | "database"
  | "elasticsearch"
  | "email"
  | "file"
  | "kafka"
  | "webhook";

export interface OutputTaskInfo {
  id?: number;
  name: string;
  description?: string;
  outputType: OutputType;
  taskStatus?: TaskStatus;
  priority?: number;
  timeoutSeconds?: number;
  dataSource?: string; // JSON
  outputFormat?: "avro" | "csv" | "excel" | "json" | "parquet" | "txt" | "xml";
  pushTargets?: string; // JSON array
  compressionConfig?: string; // JSON
  transformConfig?: string; // JSON
  scheduledAt?: null | number;
  startedAt?: null | number;
  completedAt?: null | number;
  totalRecords?: number;
  processedRecords?: number;
  successRecords?: number;
  failedRecords?: number;
  outputFilePath?: string;
  outputFileSize?: number;
  errorMessage?: null | string;
  errorDetails?: string; // JSON
  maxRetry?: number;
  retryCount?: number;
  nextRetryAt?: null | number;
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

export type OutputTaskListResp = PageResult<OutputTaskInfo>;

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
  taskType?: "input" | "output";
  level?: string;
  message?: string;
  details?: string; // JSON
  createdAt?: number;
}

export interface TaskLogListReq extends PageQuery {
  taskId?: number;
  taskType?: "input" | "output";
  level?: string;
}

export type TaskLogListResp = PageResult<TaskLogInfo>;

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

export type MappingLogListResp = PageResult<MappingLogInfo>;

// ========== Config Center ==========
export type ValueType =
  | "array"
  | "boolean"
  | "json"
  | "number"
  | "object"
  | "string";
export type ConfigScope = "global" | "instance" | "service";
export type ChangeType = "create" | "delete" | "rollback" | "update";

export interface ConfigItem {
  id?: number;
  tenantId?: number;
  configKey: string;
  configValue: string;
  valueType?: ValueType;
  category?: string;
  serviceName?: string;
  description?: string;
  defaultValue?: string;
  version?: number;
  status?: number;
  isReadonly?: boolean;
  isSensitive?: boolean;
  scope?: ConfigScope;
  configGroup?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface ConfigAuditLog {
  id?: number;
  tenantId?: number;
  configKey: string;
  oldValue?: string;
  newValue?: string;
  changeType?: ChangeType;
  changedBy?: number;
  changedByName?: string;
  serviceName?: string;
  category?: string;
  configGroup?: string;
  changeReason?: string;
  ipAddress?: string;
  userAgent?: string;
  oldVersion?: number;
  newVersion?: number;
  isRollback?: boolean;
  rollbackFromLogId?: string;
  createdAt?: number;
}

export interface ListConfigReq extends PageQuery {
  serviceName?: string;
  category?: string;
  configGroup?: string;
  keyword?: string;
}

export type ListConfigResp = PageResult<ConfigItem>;

export interface GetConfigReq {
  configKey: string;
}

export interface GetConfigResp {
  data?: ConfigItem;
}

export interface CreateConfigReq {
  configKey: string;
  configValue: string;
  valueType?: ValueType;
  category?: string;
  serviceName?: string;
  description?: string;
  defaultValue?: string;
  isReadonly?: boolean;
  isSensitive?: boolean;
  scope?: ConfigScope;
  configGroup?: string;
}

export interface UpdateConfigReq extends Partial<CreateConfigReq> {
  configKey: string;
}

export interface DeleteConfigReq {
  configKey: string;
}

export interface ListAuditLogReq extends PageQuery {
  configKey?: string;
  changeType?: ChangeType;
  startTime?: number;
  endTime?: number;
}

export type ListAuditLogResp = PageResult<ConfigAuditLog>;

export interface GetConfigHistoryReq {
  configKey: string;
}

export interface GetConfigHistoryResp {
  data?: ConfigAuditLog[];
}

export interface RollbackConfigReq {
  auditLogId: number;
}
