import type { RouteMeta } from 'vue-router';

import { requestClient } from '#/api/request';

export interface RouteItemMeta extends RouteMeta {
  params?: string;
}

export interface RouteItem {
  id?: number;
  parentId?: number;
  path: string;
  component: any;
  sort: number;
  menuType: number;
  meta: RouteItemMeta;
  name?: string;
  alias?: string | string[];
  redirect?: string;
  caseSensitive?: boolean;
  children?: RouteItem[];
  permission?: string;
}

/**
 * @description: 菜单meta
 * @param title 菜单名
 * @param icon 菜单图标
 * @param noCache 是否不缓存
 * @param link 外链链接
 */
export interface MenuMeta {
  icon: string;
  link?: string;
  noCache: boolean;
  title: string;
}

/**
 * @description: 菜单
 * @param name 菜单名
 * @param path 菜单路径
 * @param hidden 是否隐藏
 * @param component 组件名称 Layout
 * @param alwaysShow 总是显示
 * @param query 路由参数(json形式)
 * @param meta 路由信息
 * @param children 子路由信息
 */
export interface Menu {
  alwaysShow?: boolean;
  children: Menu[];
  component: string;
  hidden: boolean;
  meta: MenuMeta;
  name: string;
  path: string;
  query?: string;
  redirect?: string;
}

/**
 *  author: ryan
 *  @description: Get menu by page
 */
export interface MenuPageResp {
  total: number;
  data: RouteItem[];
}

export interface MenuInfoPlain {
  id?: number;
  type?: number;
  trans?: string;
  parentId?: number;
  path?: string;
  name?: string;
  redirect?: string;
  component?: string;
  sort?: number;
  disabled?: boolean;
  createdAt?: number;
  updatedAt?: number;
  title?: string;
  icon?: string;
  hideMenu?: boolean;
  hideBreadcrumb?: boolean;
  ignoreKeepAlive?: boolean;
  hideTab?: boolean;
  frameSrc?: string;
  carryParam?: boolean;
  hideChildrenInMenu?: boolean;
  affix?: boolean;
  dynamicLevel?: number;
  realPath?: string;
  serviceName?: string;
  permission?: string;
}

export interface RoleMenuResp {
  data: RouteItem[];
  total: number;
}

// GetMenuListByRole = '/sys-api/menu/role/list',

/**
 * @description: Get user menu list by role id
 */

export const getMenuListByRole = () => {
  return requestClient.get<RoleMenuResp>('/sys-api/menu/role/list');
};
