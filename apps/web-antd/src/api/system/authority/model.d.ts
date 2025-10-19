export interface MenuAuthorityInfo {
  roleId: number;
  menuIds: number[];
}

/**
 *  @description: this interface is used to get the api list for authorization
 */

export interface ApiListReq {
  page: number;
  pageSize: number;
  path?: string;
  group?: string;
  description?: string;
  method?: string;
}

export interface ApiAuthorityInfo {
  path: string;
  method: string;
}

/**
 *  @description:
 */

export interface ApiAuthorityReq {
  roleId: number;
  data: ApiAuthorityInfo[];
}
