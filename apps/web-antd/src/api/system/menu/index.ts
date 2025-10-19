import type { MenuOption, MenuResp } from './model';

import type { ID, PageResult } from '#/api/common';
import type { MenuInfoPlain } from '#/api/core';

import { requestClient } from '#/api/request';

enum Api {
  CreateMenu = '/sys-api/menu/create',
  DeleteMenu = '/sys-api/menu/delete',
  GetMenuById = '/sys-api/menu/detail',
  GetMenuList = '/sys-api/menu/list',
  GetMenuListByRole = '/sys-api/menu/role/list',
  menuTreeSelect = '/sys-api/menu/treeselect',
  roleMenuTree = '/sys-api/menu/roleMenuTreeselect',

  tenantPackageMenuTreeselect = '/system/menu/tenantPackageMenuTreeselect',
  UpdateMenu = '/sys-api/menu/update',
}

export function menuList(params?: any) {
  return requestClient.get<PageResult<MenuInfoPlain>>(Api.GetMenuList, {
    ...params,
  });
}

/**
 * 菜单详情
 * @param menuId 菜单id
 * @returns 菜单详情
 */
export function menuInfo(menuId: ID) {
  return requestClient.post<MenuInfoPlain>(Api.GetMenuById, { id: menuId });
}

export function menuAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.CreateMenu, data);
}

export function menuUpdate(data: any) {
  return requestClient.postWithMsg<void>(Api.UpdateMenu, data);
}

export function menuRemove(id: ID) {
  return requestClient.postWithMsg<void>(Api.DeleteMenu, { id });
}

/**
 * 返回对应角色的菜单
 * @param roleId id
 * @returns resp
 */
export function roleMenuTreeSelect(roleId: ID) {
  return requestClient.get<MenuResp>(`${Api.roleMenuTree}/${roleId}`);
}

/**
 * 下拉框使用  返回所有的菜单
 * @returns []
 */
export function menuTreeSelect() {
  return requestClient.get<MenuOption[]>(Api.menuTreeSelect);
}

/**
 * 租户套餐使用
 * @param packageId packageId
 * @returns resp
 */
export function tenantPackageMenuTreeSelect(packageId: ID) {
  return requestClient.get<MenuResp>(
    `${Api.tenantPackageMenuTreeselect}/${packageId}`,
  );
}
