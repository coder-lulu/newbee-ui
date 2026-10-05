export interface ScriptCategory {
  id?: number;
  createdAt?: number;
  updatedAt?: number;
  tenantId?: number;
  status?: number;
  name?: string;
  code?: string;
  description?: string;
  parentId?: number;
  sortOrder?: number;
  icon?: string;
  children?: ScriptCategory[];
}

export interface ScriptCategoryListReq {
  page: number;
  pageSize: number;
  name?: string;
  code?: string;
  status?: number;
}

export interface ScriptCategoryListResp {
  code: number;
  msg: string;
  data: ScriptCategory[];
}

export interface ScriptCategoryDetailResp {
  code: number;
  msg: string;
  data: ScriptCategory;
}
