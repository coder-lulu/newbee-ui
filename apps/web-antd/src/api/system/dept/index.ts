import type { DepartmentInfo, DeptListRes } from './model';

import type { ID } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  CreateDepartment = '/sys-api/department/create',
  DeleteDepartment = '/sys-api/department/delete',
  deptList = '/system/dept/list',
  deptNodeInfo = '/system/dept/list/exclude',
  GetDepartmentById = '/sys-api/department',
  GetDepartmentList = '/sys-api/department/list',
  root = '/system/dept',
  UpdateDepartment = '/sys-api/department/update',
}

export function deptList(params?: any) {
  return requestClient.post<DeptListRes>(Api.GetDepartmentList, {
    ...params,
  });
}

/**
 * 查询部门列表（排除节点）
 * @param deptId 部门ID
 * @returns void
 */
export function deptNodeList(deptId: ID) {
  return requestClient.get<DepartmentInfo[]>(`${Api.deptNodeInfo}/${deptId}`);
}

/**
 * 部门详情
 * @param deptId 部门id
 * @returns 部门信息
 */
export function deptInfo(deptId: ID) {
  return requestClient.post<DepartmentInfo>(Api.GetDepartmentById, {
    id: deptId,
  });
}

export function deptAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.CreateDepartment, data);
}

export function deptUpdate(data: any) {
  return requestClient.postWithMsg<void>(Api.UpdateDepartment, data);
}

/**
 * 注意这里只允许单删除
 * @param deptId ID
 * @returns void
 */
export function deptRemove(deptId: ID) {
  return requestClient.postWithMsg<void>(Api.DeleteDepartment, {
    ids: [deptId],
  });
}
