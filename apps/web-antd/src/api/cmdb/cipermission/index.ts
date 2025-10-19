/**
 * CI权限管理API接口
 * 根据后端CI权限前端对接文档定义
 */

import type {
  CiPermissionInfoResponse,
  CiPermissionListRequest,
  CiPermissionListResponse,
  CreateCiPermissionRequest,
  CreateCiPermissionResponse,
  DeleteCiPermissionRequest,
  DeleteCiPermissionResponse,
  UpdateCiPermissionRequest,
} from './model';

export type {
  CiPermissionInfo,
  CiPermissionOperation,
  CiPermissionOperations,
  CiPermissionDataFilters,
  CiPermissionFilterRule,
  CiPermissionFieldMasks,
  CiPermissionConditions,
  ScopeType,
  SubjectType,
  PermissionType,
  PermissionLevel,
  RiskLevel,
  PermissionStatus,
} from './model';

import type { ID } from '#/api/common';

import { requestClient } from '#/api/request';

/**
 * API端点定义
 */
enum Api {
  // 创建权限
  createPermission = '/cmdb-api/ci_permission/create',
  // 删除权限
  deletePermission = '/cmdb-api/ci_permission/delete',
  // 获取权限详情
  getPermission = '/cmdb-api/ci_permission',
  // 获取权限列表
  getPermissionList = '/cmdb-api/ci_permission/list',
  // 更新权限
  updatePermission = '/cmdb-api/ci_permission/update',
}

// ==================== 权限管理 API ====================

/**
 * 创建CI权限
 * @param data 创建权限请求数据
 * @returns 创建结果
 */
export function createCiPermission(data: CreateCiPermissionRequest) {
  return requestClient.post<CreateCiPermissionResponse>(
    Api.createPermission,
    data,
  );
}

/**
 * 更新CI权限
 * @param data 更新权限请求数据
 * @returns 更新结果
 */
export function updateCiPermission(data: UpdateCiPermissionRequest) {
  return requestClient.post<void>(Api.updatePermission, data);
}

/**
 * 删除CI权限
 * @param data 删除权限请求数据
 * @returns 删除结果
 */
export function deleteCiPermission(data: DeleteCiPermissionRequest) {
  return requestClient.post<DeleteCiPermissionResponse>(
    Api.deletePermission,
    data,
  );
}

/**
 * 根据ID获取CI权限详情
 * @param id 权限ID
 * @returns 权限详情
 */
export function getCiPermissionById(id: ID): Promise<CiPermissionInfoResponse> {
  return requestClient.post<CiPermissionInfoResponse>(
    Api.getPermission,
    { id },
  );
}

/**
 * 获取CI权限列表
 * @param params 查询参数
 * @returns 权限列表
 */
export function getCiPermissionList(
  params: CiPermissionListRequest,
): Promise<CiPermissionListResponse> {
  return requestClient.post<CiPermissionListResponse>(Api.getPermissionList, params);
}

// ==================== 批量操作 API ====================

/**
 * 批量删除CI权限
 * @param ids 权限ID列表
 * @returns 删除结果
 */
export function batchDeleteCiPermissions(ids: number[]) {
  return deleteCiPermission({ ids });
}

/**
 * 批量启用CI权限
 * @param ids 权限ID列表
 * @returns 更新结果
 */
export function batchEnableCiPermissions(ids: number[]) {
  const promises = ids.map((id) =>
    updateCiPermission({ id, status: 1 } as UpdateCiPermissionRequest),
  );
  return Promise.all(promises);
}

/**
 * 批量禁用CI权限
 * @param ids 权限ID列表
 * @returns 更新结果
 */
export function batchDisableCiPermissions(ids: number[]) {
  const promises = ids.map((id) =>
    updateCiPermission({ id, status: 0 } as UpdateCiPermissionRequest),
  );
  return Promise.all(promises);
}

// ==================== 便捷方法 ====================

/**
 * 创建用户权限
 * @param userId 用户ID
 * @param userName 用户名
 * @param options 权限配置选项
 * @returns 创建结果
 */
export function createUserPermission(
  userId: string,
  userName: string,
  options: Partial<CreateCiPermissionRequest>,
) {
  return createCiPermission({
    subject_type: 'user',
    subject_id: userId,
    subject_name: userName,
    permission_type: 'allow',
    ...options,
  } as CreateCiPermissionRequest);
}

/**
 * 创建角色权限
 * @param roleId 角色ID
 * @param roleName 角色名
 * @param options 权限配置选项
 * @returns 创建结果
 */
export function createRolePermission(
  roleId: string,
  roleName: string,
  options: Partial<CreateCiPermissionRequest>,
) {
  return createCiPermission({
    subject_type: 'role',
    subject_id: roleId,
    subject_name: roleName,
    permission_type: 'allow',
    ...options,
  } as CreateCiPermissionRequest);
}

/**
 * 创建部门权限
 * @param departmentId 部门ID
 * @param departmentName 部门名
 * @param options 权限配置选项
 * @returns 创建结果
 */
export function createDepartmentPermission(
  departmentId: number,
  departmentName: string,
  options: Partial<CreateCiPermissionRequest>,
) {
  return createCiPermission({
    subject_type: 'department',
    department_id: departmentId,
    subject_name: departmentName,
    permission_type: 'allow',
    ...options,
  } as CreateCiPermissionRequest);
}

// ==================== 查询便捷方法 ====================

/**
 * 根据用户获取权限列表
 * @param userId 用户ID
 * @param params 其他查询参数
 * @returns 权限列表
 */
export function getCiPermissionsByUser(
  userId: string,
  params?: Partial<CiPermissionListRequest>,
) {
  return getCiPermissionList({
    subject_type: 'user',
    subject_id: userId,
    ...params,
  } as CiPermissionListRequest);
}

/**
 * 根据角色获取权限列表
 * @param roleId 角色ID
 * @param params 其他查询参数
 * @returns 权限列表
 */
export function getCiPermissionsByRole(
  roleId: string,
  params?: Partial<CiPermissionListRequest>,
) {
  return getCiPermissionList({
    subject_type: 'role',
    subject_id: roleId,
    ...params,
  } as CiPermissionListRequest);
}

/**
 * 根据部门获取权限列表
 * @param departmentId 部门ID
 * @param params 其他查询参数
 * @returns 权限列表
 */
export function getCiPermissionsByDepartment(
  departmentId: number,
  params?: Partial<CiPermissionListRequest>,
) {
  return getCiPermissionList({
    subject_type: 'department',
    department_id: departmentId,
    ...params,
  } as CiPermissionListRequest);
}

/**
 * 根据CI类型获取权限列表
 * @param ciTypeId CI类型ID
 * @param params 其他查询参数
 * @returns 权限列表
 */
export function getCiPermissionsByCiType(
  ciTypeId: number,
  params?: Partial<CiPermissionListRequest>,
) {
  return getCiPermissionList({
    scope_type: 'ci_type',
    ci_type_id: ciTypeId,
    ...params,
  } as CiPermissionListRequest);
}

/**
 * 根据CI实例获取权限列表
 * @param ciId CI实例ID
 * @param params 其他查询参数
 * @returns 权限列表
 */
export function getCiPermissionsByCiInstance(
  ciId: number,
  params?: Partial<CiPermissionListRequest>,
) {
  return getCiPermissionList({
    scope_type: 'ci_instance',
    ci_id: ciId,
    ...params,
  } as CiPermissionListRequest);
}

// ==================== 权限检查 API ====================

/**
 * 检查用户是否有特定权限
 * @param userId 用户ID
 * @param ciTypeId CI类型ID（可选）
 * @param ciId CI实例ID（可选）
 * @param permissionLevel 所需权限级别
 * @returns 是否有权限
 */
export async function checkUserPermission(
  userId: string,
  permissionLevel: string,
  ciTypeId?: number,
  ciId?: number,
): Promise<boolean> {
  try {
    const params: CiPermissionListRequest = {
      page: 1,
      pageSize: 1,
      subject_type: 'user',
      subject_id: userId,
      permission_level: permissionLevel as any,
    };

    if (ciTypeId) {
      params.ci_type_id = ciTypeId;
    }
    if (ciId) {
      params.ci_id = ciId;
    }

    const response = await getCiPermissionList(params);
    return response.data.total > 0;
  } catch (error) {
    console.error('检查用户权限失败:', error);
    return false;
  }
}

/**
 * 获取用户在特定CI上的最高权限级别
 * @param userId 用户ID
 * @param ciTypeId CI类型ID（可选）
 * @param ciId CI实例ID（可选）
 * @returns 最高权限级别
 */
export async function getUserMaxPermissionLevel(
  userId: string,
  ciTypeId?: number,
  ciId?: number,
): Promise<null | string> {
  try {
    const params: CiPermissionListRequest = {
      page: 1,
      pageSize: 100, // 获取所有相关权限
      subject_type: 'user',
      subject_id: userId,
    };

    if (ciTypeId) {
      params.ci_type_id = ciTypeId;
    }
    if (ciId) {
      params.ci_id = ciId;
    }

    const response = await getCiPermissionList(params);
    const permissions = response.data.data;

    if (permissions.length === 0) {
      return null;
    }

    // 定义权限级别优先级
    const levelPriority = {
      super_admin: 5,
      admin: 4,
      write: 3,
      read: 2,
      none: 1,
    };

    // 找到最高权限级别
    let maxLevel = 'none';
    let maxPriority = 0;

    for (const permission of permissions) {
      const level = permission.permission_level as string;
      const priority = levelPriority[level as keyof typeof levelPriority] || 0;
      if (priority > maxPriority) {
        maxPriority = priority;
        maxLevel = level;
      }
    }

    return maxLevel;
  } catch (error) {
    console.error('获取用户最高权限级别失败:', error);
    return null;
  }
}

