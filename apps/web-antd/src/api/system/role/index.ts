import type { UserInfo } from '@vben/types';

import type { DeptResp, RoleCancelAuthReq, RoleInfo } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  cancelAuthUser = '/sys-api/role/cancelAuthUser',
  CreateRole = '/sys-api/role/create',
  DeleteRole = '/sys-api/role/delete',
  GetRoleById = '/sys-api/role',
  GetRoleList = '/sys-api/role/list',

  roleAllocatedList = '/system/role/authUser/allocatedList',
  roleAuthCancel = '/system/role/authUser/cancel',
  roleAuthCancelAll = '/system/role/authUser/cancelAll',
  roleAuthSelectAll = '/system/role/authUser/selectAll',

  roleChangeStatus = '/sys-api/role/changeRoleStatus',
  roleDataScope = '/sys-api/role/dataScope',
  roleDeptTree = '/system/role/deptTree',
  roleExport = '/system/role/export',
  roleList = '/system/role/list',
  roleMultiAuthUser = '/sys-api/role/multiAuthUser',
  roleOptionSelect = '/system/role/optionselect',
  roleUnallocatedList = '/sys-api/user/unallocatedList',
  root = '/system/role',
  UpdateRole = '/sys-api/role/update',
}

/**
 * 查询角色分页列表
 * @param params 搜索条件
 * @returns 分页列表
 */
export function roleList(params?: PageQuery) {
  return requestClient.post<PageResult<RoleInfo>>(Api.GetRoleList, {
    ...params,
  });
}

/**
 * 导出角色信息
 * @param data 查询参数
 * @returns blob
 */
export function roleExport(data: Partial<RoleInfo>) {
  return commonExport(Api.roleExport, data);
}

/**
 * 查询角色信息
 * @param roleId 角色id
 * @returns 角色信息
 */
export function roleInfo(roleId: ID) {
  return requestClient.post<RoleInfo>(Api.GetRoleById, { id: roleId });
}

export function roleAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.CreateRole, data);
}

export function roleUpdate(data: any) {
  return requestClient.postWithMsg<void>(Api.UpdateRole, data);
}

export function roleChangeStatus(data: any) {
  const requestData = {
    id: data.id,
    status: data.status,
  };
  return requestClient.postWithMsg<void>(Api.roleChangeStatus, requestData);
}

export function roleCancelAuth(data: RoleCancelAuthReq) {
  return requestClient.postWithMsg<void>(Api.cancelAuthUser, data);
}

/**
 * 更新数据权限
 * @param data
 * @returns void
 */
export function roleDataScope(data: any) {
  return requestClient.postWithMsg<void>(Api.roleDataScope, data);
}

export function roleRemove(roleIds: IDS) {
  return requestClient.postWithMsg<void>(Api.DeleteRole, { ids: roleIds });
}

export function roleOptionSelect(params?: any) {
  return requestClient.get(Api.roleOptionSelect, { params });
}

/**
 * 已分配角色的用户分页
 * @param params 请求参数
 * @returns 分页
 */
export function roleAllocatedList(params?: PageQuery) {
  return requestClient.get<PageResult<UserInfo>>(Api.roleAllocatedList, {
    params,
  });
}

/**
 * 未授权的用户
 * @param params
 * @returns void
 */
export function roleUnallocatedList(params: any) {
  return requestClient.post(Api.roleUnallocatedList, { ...params });
}

/**
 * 取消用户角色授权
 * @returns void
 */
export function roleAuthCancel(data: { roleId: ID; userId: ID }) {
  return requestClient.putWithMsg<void>(Api.roleAuthCancel, data);
}

/**
 * 批量取消授权
 * @param roleId 角色ID
 * @param userIds 用户ID集合
 * @returns void
 */
export function roleAuthCancelAll(roleId: ID, userIds: IDS) {
  return requestClient.putWithMsg<void>(
    `${Api.roleAuthCancelAll}?roleId=${roleId}&userIds=${userIds.join(',')}`,
  );
}

/**
 * 批量授权用户
 * @param data
 * @returns void
 */
export function roleMultiAuthUser(data: {
  roleId: number | string;
  userIds: number[] | string[];
}) {
  return requestClient.postWithMsg<void>(Api.roleMultiAuthUser, data);
}

/**
 * 根据角色id获取部门树
 * @param roleId 角色id
 * @returns DeptResp
 */
export function roleDeptTree(roleId: ID) {
  return requestClient.get<DeptResp>(`${Api.roleDeptTree}/${roleId}`);
}
