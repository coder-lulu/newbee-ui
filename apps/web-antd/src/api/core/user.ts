import { requestClient } from '#/api/request';

export interface UserInfoModel {
  // 用户id
  userId: number | string;
  // 用户名
  username: string;
  // 昵称
  nickname: string;
  // 头像
  avatar: string;
  // 介绍
  desc?: string;
  // 用户首页
  homePath: string;
  // 用户角色
  roles?: string[];
  // 用户角色名称
  roleNames: string[];
  // 角色编码
  roleCodes: string[];
  // 部门名称
  departmentName?: string;
  // 真实名称
  realName?: string;
}

export interface Role {
  dataScope: string;
  flag: boolean;
  roleId: number;
  roleKey: string;
  roleName: string;
  roleSort: number;
  status: string;
  superAdmin: boolean;
}

export interface User {
  avatar: string;
  createTime: string;
  deptId: number;
  deptName: string;
  email: string;
  loginDate: string;
  loginIp: string;
  nickName: string;
  phonenumber: string;
  remark: string;
  roles: Role[];
  sex: string;
  status: string;
  tenantId: string;
  userId: number;
  userName: string;
  userType: string;
}

export interface UserInfoResp {
  permissions: string[];
  roles: string[];
  user: User;
}

/**
 * 获取用户信息
 * 存在返回null的情况(401) 不会抛出异常 需要手动抛异常
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfoModel>('/sys-api/user/info');
}

export function getPermCode() {
  return requestClient.get<string[]>('/sys-api/user/perm');
}
