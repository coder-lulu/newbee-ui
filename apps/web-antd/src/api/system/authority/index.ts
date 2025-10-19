import type { ApiAuthorityInfo, MenuAuthorityInfo } from './model';

import type { ID, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  CreateOrUpdateApiAuthority = '/sys-api/authority/api/create_or_update',
  CreateOrUpdateMenuAuthority = '/sys-api/authority/menu/create_or_update',
  GetApiList = '/sys-api/api/list',
  GetRoleApiList = '/sys-api/authority/api/role',
  GetRoleMenuList = '/sys-api/authority/menu/role',
}

/**
 * 获取岗位列表
 * @param params 参数
 * @returns Post[]
 */
export function getApiList(params?: PageQuery) {
  return requestClient.post<PageResult<ApiAuthorityInfo>>(Api.GetApiList, {
    ...params,
  });
}

export function getApiAuthority(id: ID) {
  return requestClient.post<PageResult<ApiAuthorityInfo>>(Api.GetRoleApiList, {
    id,
  });
}

export function createOrUpdateApiAuthority(data: any) {
  return requestClient.postWithMsg<void>(Api.CreateOrUpdateApiAuthority, data);
}

export function createOrUpdateMenuAuthority(data: any) {
  return requestClient.postWithMsg<void>(Api.CreateOrUpdateMenuAuthority, data);
}

export function getMenuAuthority(id: ID) {
  return requestClient.post<MenuAuthorityInfo>(Api.GetRoleMenuList, { id });
}
