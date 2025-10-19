export interface Dept {
  createBy: string;
  createTime: string;
  updateBy?: string;
  updateTime?: string;
  remark?: string;
  deptId: number;
  parentId: number;
  ancestors: string;
  deptName: string;
  orderNum: number;
  leader: string;
  phone: string;
  email: string;
  status: string;
  delFlag: string;
  parentName?: string;
  children?: Dept[];
}

/**
 *  @description: Department info response
 */
export interface DepartmentInfo {
  id?: number;
  createdAt?: number;
  updatedAt?: number;
  trans?: string;
  status?: number;
  sort?: number;
  name?: string;
  ancestors?: string;
  leader?: string;
  phone?: string;
  email?: string;
  remark?: string;
  parentId?: number;
  children?: DepartmentInfo[];
  disabled?: boolean;
}

export interface DeptListRes {
  data: DepartmentInfo[];
  total: number;
}
