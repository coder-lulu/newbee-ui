export interface Script {
  id?: number;
  createdAt?: number;
  updatedAt?: number;
  tenantId?: number;
  status?: number;
  name?: string;
  code?: string;
  description?: string;
  categoryId?: number;
  tags?: string[];
  scriptType?: string;
  executor?: string;
  content?: string;
  isTemplate?: boolean;
  templateEngine?: string;
  parameters?: Record<string, any>;
  version?: string;
  baseVersionId?: number;
  isLatest?: boolean;
  targetCiTypes?: string[];
  targetOsTypes?: string[];
  targetSelector?: Record<string, any>;
  credentialRef?: string;
  requiredCapabilities?: string[];
  defaultTimeout?: number;
  defaultWorkdir?: string;
  defaultEnv?: Record<string, string>;
  requireConfirmation?: boolean;
  riskLevel?: string;
  schedulable?: boolean;
  defaultSchedule?: string;
  executionCount?: number;
  successCount?: number;
  failureCount?: number;
  lastExecutedAt?: number;
}

export interface ScriptListReq {
  page: number;
  pageSize: number;
  name?: string;
  code?: string;
  categoryId?: number;
  scriptType?: string;
  executor?: string;
  riskLevel?: string;
  status?: number;
}

export interface ScriptListResp {
  total: number;
  data: Script[];
}
