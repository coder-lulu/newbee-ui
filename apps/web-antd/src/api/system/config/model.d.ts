export interface SysConfig {
  configId: number;
  configName: string;
  configKey: string;
  configValue: string;
  configType: string;
  remark: string;
  createTime: string;
}

/**
 *  @description: Configuration info response
 */
export interface ConfigInfo {
  id?: number;
  createdAt?: number;
  updatedAt?: number;
  sort?: number;
  state?: boolean;
  name?: string;
  key?: string;
  value?: string;
  category?: string;
  remark?: string;
}

export interface ConfigListResp {
  data: ConfigInfo[];
  total: number;
}
