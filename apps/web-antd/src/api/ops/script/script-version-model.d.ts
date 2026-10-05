export interface ScriptVersion {
  id?: number;
  createdAt?: number;
  updatedAt?: number;
  tenantId?: number;
  scriptId?: number;
  version?: string;
  content?: string;
  parameters?: Record<string, any>;
  scriptType?: string;
  executor?: string;
  changeLog?: string;
  createdBy?: number;
  checksum?: string;
}

export interface ScriptVersionListReq {
  page: number;
  pageSize: number;
  scriptId?: number;
  version?: string;
}

export interface ScriptVersionListResp {
  total: number;
  data: ScriptVersion[];
}
