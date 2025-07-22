// CI权限管理API

// 权限信息类型定义
export interface CiPermissionInfo {
  id?: number;
  permission_id?: string;
  subject_name?: string;
  subject_type?: string;
  permission_level?: string;
  scope_type?: string;
  status?: number;
  description?: string;
  effective_from?: number;
  effective_to?: number;
  ci_type_id?: string;
  ci_instance_id?: string;
  inherit_enabled?: boolean;
  priority?: number;
  risk_level?: string;
  mfa_required?: boolean;
  approval_required?: boolean;
  conditions?: string;
  created_at?: number;
  updated_at?: number;
  creator?: string;
  updater?: string;
}

// 查询参数
export interface PermissionQueryParams {
  page?: number;
  pageSize?: number;
  permission_id?: string;
  subject_name?: string;
  subject_type?: string;
  permission_level?: string;
  scope_type?: string;
  status?: number;
}

// API响应类型
export interface PermissionListResponse {
  code: number;
  data: CiPermissionInfo[];
  total: number;
  message: string;
}

/**
 * 获取权限列表
 */
export async function getPermissionList(
  params: PermissionQueryParams,
): Promise<PermissionListResponse> {
  // TODO: 实际API调用
  // return requestClient.get('/api/cmdb/ci-permissions', { params });

  // 临时Mock数据
  const mockData: CiPermissionInfo[] = [
    {
      id: 1,
      permission_id: 'perm_user_read_001',
      subject_name: 'admin',
      subject_type: 'user',
      permission_level: 'read',
      scope_type: 'global',
      status: 1,
      description: '系统管理员全局权限',
      effective_from: 1_704_067_200, // 2025/01/02 00:00:00
      effective_to: 1_735_689_600, // 2025/01/02 00:00:00
      ci_type_id: '',
      ci_instance_id: '',
      inherit_enabled: true,
      priority: 1,
      risk_level: 'low',
      mfa_required: false,
      approval_required: false,
      conditions: '',
      created_at: 1_704_067_200,
      updated_at: 1_704_067_200,
      creator: 'system',
      updater: 'system',
    },
    {
      id: 2,
      permission_id: 'perm_role_write_002',
      subject_name: 'developer',
      subject_type: 'role',
      permission_level: 'write',
      scope_type: 'ci_type',
      status: 1,
      description: '开发者CI类型权限',
      effective_from: 1_704_153_600, // 2025/01/02 24:00:00
      effective_to: 1_735_776_000, // 2025/01/03 24:00:00
      ci_type_id: 'server',
      ci_instance_id: '',
      inherit_enabled: false,
      priority: 2,
      risk_level: 'medium',
      mfa_required: true,
      approval_required: false,
      conditions: '{"department": "IT"}',
      created_at: 1_704_153_600,
      updated_at: 1_704_153_600,
      creator: 'admin',
      updater: 'admin',
    },
    {
      id: 3,
      permission_id: 'perm_dept_admin_003',
      subject_name: '运维部',
      subject_type: 'department',
      permission_level: 'admin',
      scope_type: 'ci_instance',
      status: 1,
      description: '运维部管理员权限',
      effective_from: 1_704_240_000,
      effective_to: 1_735_862_400,
      ci_type_id: 'network',
      ci_instance_id: 'switch_001',
      inherit_enabled: true,
      priority: 3,
      risk_level: 'high',
      mfa_required: true,
      approval_required: true,
      conditions: '{"location": "datacenter"}',
      created_at: 1_704_240_000,
      updated_at: 1_704_240_000,
      creator: 'admin',
      updater: 'admin',
    },
    {
      id: 4,
      permission_id: 'perm_group_read_004',
      subject_name: '监控组',
      subject_type: 'group',
      permission_level: 'read',
      scope_type: 'attribute',
      status: 0,
      description: '监控组只读权限',
      effective_from: 1_704_326_400,
      effective_to: 1_735_948_800,
      ci_type_id: 'database',
      ci_instance_id: '',
      inherit_enabled: false,
      priority: 4,
      risk_level: 'low',
      mfa_required: false,
      approval_required: false,
      conditions: '',
      created_at: 1_704_326_400,
      updated_at: 1_704_326_400,
      creator: 'admin',
      updater: 'admin',
    },
    {
      id: 5,
      permission_id: 'perm_system_super_005',
      subject_name: 'CMDB系统',
      subject_type: 'system',
      permission_level: 'super_admin',
      scope_type: 'global',
      status: 1,
      description: '系统级超级管理员权限',
      effective_from: 1_704_412_800,
      effective_to: 1_736_035_200,
      ci_type_id: '',
      ci_instance_id: '',
      inherit_enabled: true,
      priority: 0,
      risk_level: 'critical',
      mfa_required: true,
      approval_required: true,
      conditions: '{"system": true, "emergency": false}',
      created_at: 1_704_412_800,
      updated_at: 1_704_412_800,
      creator: 'system',
      updater: 'system',
    },
  ];

  // 模拟筛选和分页
  let filteredData = mockData;

  if (params.permission_id) {
    const permissionId = params.permission_id;
    filteredData = filteredData.filter((item) =>
      item.permission_id?.includes(permissionId),
    );
  }

  if (params.subject_name) {
    const subjectName = params.subject_name;
    filteredData = filteredData.filter((item) =>
      item.subject_name?.includes(subjectName),
    );
  }

  if (params.subject_type) {
    filteredData = filteredData.filter(
      (item) => item.subject_type === params.subject_type,
    );
  }

  if (params.permission_level) {
    filteredData = filteredData.filter(
      (item) => item.permission_level === params.permission_level,
    );
  }

  if (params.scope_type) {
    filteredData = filteredData.filter(
      (item) => item.scope_type === params.scope_type,
    );
  }

  if (params.status !== undefined) {
    filteredData = filteredData.filter((item) => item.status === params.status);
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedData = filteredData.slice(startIndex, endIndex);

  return {
    code: 200,
    data: pagedData,
    total: filteredData.length,
    message: 'success',
  };
}

/**
 * 获取权限详情
 */
export async function getPermissionInfo(
  id: number | string,
): Promise<CiPermissionInfo> {
  // TODO: 实际API调用
  // return requestClient.get(`/api/cmdb/ci-permissions/${id}`);

  const { data } = await getPermissionList({});
  const permission = data.find((item) => item.id === Number(id));

  if (!permission) {
    throw new Error('权限信息不存在');
  }

  return permission;
}

/**
 * 创建权限
 */
export async function createPermission(
  data: Partial<CiPermissionInfo>,
): Promise<CiPermissionInfo> {
  // TODO: 实际API调用
  // return requestClient.post('/api/cmdb/ci-permissions', data);

  console.log('创建权限:', data);
  return { ...data, id: Date.now() } as CiPermissionInfo;
}

/**
 * 更新权限
 */
export async function updatePermission(
  data: CiPermissionInfo,
): Promise<CiPermissionInfo> {
  // TODO: 实际API调用
  // return requestClient.put(`/api/cmdb/ci-permissions/${data.id}`, data);

  console.log('更新权限:', data);
  return data;
}

/**
 * 删除权限
 */
export async function deletePermission(ids: number[]): Promise<void> {
  // TODO: 实际API调用
  // return requestClient.delete('/api/cmdb/ci-permissions', { data: { ids } });

  console.log('删除权限:', ids);
}

/**
 * 批量更新权限状态
 */
export async function updatePermissionStatus(
  ids: number[],
  status: number,
): Promise<void> {
  // TODO: 实际API调用
  // return requestClient.patch('/api/cmdb/ci-permissions/status', { ids, status });

  console.log('批量更新权限状态:', ids, status);
}

/**
 * 导出权限数据
 */
export async function exportPermissions(
  params: PermissionQueryParams,
): Promise<Blob> {
  // TODO: 实际API调用
  // return requestClient.get('/api/cmdb/ci-permissions/export', { params, responseType: 'blob' });

  console.log('导出权限数据:', params);
  return new Blob();
}
