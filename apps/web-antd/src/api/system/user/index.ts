import type { ResetPwdParam, UserImportParam, UserInfo } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport, ContentTypeEnum } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  // simple-admin
  ChangePassword = '/sys-api/user/change_password',
  CreateUser = '/sys-api/user/create',
  DeleteUser = '/sys-api/user/delete',
  deptTree = '/system/user/deptTree',
  GetPermCode = '/sys-api/user/perm',
  GetUserById = '/sys-api/user',
  GetUserInfo = '/sys-api/user/info',
  GetUserList = '/sys-api/user/list',
  listDeptUsers = '/system/user/list/dept',
  Login = '/sys-api/user/login',
  LoginByEmail = '/sys-api/user/login_by_email',
  LoginBySms = '/sys-api/user/login_by_sms',
  Logout = '/sys-api/user/logout',
  Profile = '/sys-api/user/profile',
  Register = '/sys-api/user/register',
  RegisterByEmail = '/sys-api/user/register_by_email',
  RegisterBySms = '/sys-api/user/register_by_sms',
  ResetPasswordByEmail = '/sys-api/user/reset_password_by_email',
  ResetPasswordBySms = '/sys-api/user/reset_password_by_sms',
  root = '/system/user',
  UpdateUser = '/sys-api/user/update',
  userAuthRole = '/system/user/authRole',
  userExport = '/system/user/export',
  userImport = '/system/user/importData',
  userImportTemplate = '/system/user/importTemplate',
  userList = '/system/user/list',
  userResetPassword = '/sys-api/user/resetPwd',
  userStatusChange = '/sys-api/user/changeStatus',
}

/**
 *  获取用户列表
 * @param params
 * @returns User
 */
export function userList(params?: PageQuery) {
  return requestClient.post<PageResult<UserInfo>>(Api.GetUserList, {
    ...params,
  });
}

/**
 * 导出excel
 * @param data data
 * @returns blob
 */
export function userExport(data: Partial<UserInfo>) {
  return commonExport(Api.userExport, data);
}

/**
 * 从excel导入用户
 * @param data
 * @returns void
 */
export function userImportData(data: UserImportParam) {
  return requestClient.post<{ code: number; msg: string }>(
    Api.userImport,
    data,
    {
      headers: {
        'Content-Type': ContentTypeEnum.FORM_DATA,
      },
      isTransformResponse: false,
    },
  );
}

/**
 * 下载用户导入模板
 * @returns blob
 */
export function downloadImportTemplate() {
  return requestClient.post<Blob>(
    Api.userImportTemplate,
    {},
    {
      isTransformResponse: false,
      responseType: 'blob',
    },
  );
}

/**
 * 可以不传ID  返回部门和角色options 需要获得原始数据
 * 不传ID时一定要带最后的/
 * @param id 用户ID
 * @returns 用户信息
 */
export function findUserInfo(id?: ID) {
  return requestClient.post<UserInfo>(Api.GetUserById, { id });
}

/**
 * 新增用户
 * @param data data
 * @returns void
 */
export function userAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.CreateUser, data);
}

/**
 * 更新用户
 * @param data data
 * @returns void
 */
export function userUpdate(data: any) {
  return requestClient.postWithMsg<void>(Api.UpdateUser, data);
}

/**
 * 更新用户状态
 * @param data data
 * @returns void
 */
export function userStatusChange(data: Partial<UserInfo>) {
  const requestData = {
    id: data.id,
    status: data.status,
  };
  return requestClient.postWithMsg<void>(Api.UpdateUser, requestData);
}

/**
 * 删除用户
 * @param userIds 用户ID数组
 * @returns void
 */
export function userRemove(userIds: IDS) {
  return requestClient.postWithMsg<void>(Api.DeleteUser, { ids: userIds });
}

/**
 * 重置用户密码 需要加密
 * @param data
 * @returns void
 */
export function userResetPassword(data: ResetPwdParam) {
  return requestClient.postWithMsg<void>(Api.userResetPassword, data, {
    encrypt: false,
  });
}

/**
 * 这个方法未调用过
 * @param userId
 * @returns void
 */
export function getUserAuthRole(userId: ID) {
  return requestClient.get(`${Api.userAuthRole}/${userId}`);
}

/**
 * 这个方法未调用过
 * @param userId
 * @returns void
 */
export function userAuthRoleUpdate(userId: ID, roleIds: number[]) {
  return requestClient.putWithMsg(Api.userAuthRole, { roleIds, userId });
}

/**
 * 获取用户个人信息
 */
export function getUserProfile() {
  return requestClient.get<UserInfo>(Api.Profile);
}
