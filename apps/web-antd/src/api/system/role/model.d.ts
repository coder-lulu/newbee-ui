export interface Role {
  roleId: number;
  roleName: string;
  roleKey: string;
  roleSort: number;
  dataScope: string;
  menuCheckStrictly: boolean;
  deptCheckStrictly: boolean;
  status: string;
  remark: string;
  createTime: string;
  // 用户是否存在此角色标识 默认不存在
  flag: boolean;
  superAdmin: boolean;
}

export interface RoleInfo {
  id?: number;
  createdAt?: number;
  updatedAt?: number;
  status?: number;
  name?: string;
  code?: string;
  defaultRouter?: string;
  remark?: string;
  sort?: number;
  customDeptIds: number[];
  dataScope: number;
}

export interface DeptOption {
  id: number;
  parentId: number;
  label: string;
  weight: number;
  children: DeptOption[];
  key: string; // 实际上不存在 ide报错
}

export interface DeptResp {
  checkedKeys: number[];
  depts: DeptOption[];
}

export interface RoleCancelAuthReq {
  userIds: string[];
  roleId: number;
}
