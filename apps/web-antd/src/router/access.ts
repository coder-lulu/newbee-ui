import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
  RouteRecordStringComponent,
} from '@vben/types';

import type { RouteItem } from '#/api';

import { generateAccessible } from '@vben/access';
import { preferences } from '@vben/preferences';
import { useAccessStore } from '@vben/stores';

import { array2tree } from '@axolo/tree-array';
import { message } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';

import { getMenuListByRole } from '#/api';
import { BasicLayout, IFrameView } from '#/layouts';
import { $t } from '#/locales';
import { useAuthStore } from '#/store';

import { localMenuList } from './routes/local';

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');
const NotFoundComponent = () => import('#/views/_core/fallback/not-found.vue');

/**
 * 后台路由转vben路由
 * @param menuList 后台菜单
 * @param parentPath 上级目录
 * @returns vben路由
 */
function backMenuToVbenMenu(
  menuList: RouteItem[],
  parentPath = '',
): RouteRecordStringComponent[] {
  const resultList: RouteRecordStringComponent[] = [];
  const authStore = useAuthStore();
  menuList.forEach((menu) => {
    // 权限处理
    if (menu.permission && menu.permission !== '') {
      authStore.elementPermissionList.push(menu.permission);
    }
    if (menu.menuType === 2) {
      // 继续下次
      return;
    }
    // 根目录为菜单形式
    // 固定有一个children  children为当前菜单
    if (menu.path === '/' && menu.children && menu.children.length === 1) {
      if (!menu.children || !menu.children[0]) {
        return;
      }

      // 需要处理根目录为内嵌的情况 不会带InnerLink
      if (/^https?:\/\//.test(menu.children[0].path)) {
        menu.children[0].component = 'InnerLink';
        menu.children[0].path = menu.children[0].path
          .replaceAll(/^https?:\/\//g, '')
          .replaceAll('/#/', '')
          .replaceAll('#', '')
          .replaceAll(/[?&]/g, '');
      }

      // 取子路径作为父级路径
      const path = menu.children[0].path;
      // 取子菜单的meta作为当前菜单的meta
      menu.meta = menu.children[0].meta;
      // 由于在一级路由 父级路径需要加上/
      menu.path = `/${path}`;
      menu.component = 'RootMenu';
      // 将子路径设置为''
      menu.children[0].path = '';
    }

    // 外链: http开头 & 组件为Layout || ParentView
    // 正则判断是否为http://或者https://开头
    let link = '';
    if (
      /^https?:\/\//.test(menu.path) &&
      (menu.component === 'ParentView' || menu.component === 'InnerLink')
    ) {
      link = menu.path;
    }
    if (
      /^https?:\/\//.test(menu.path) &&
      (menu.component === 'Layout' || menu.component === 'ParentView')
    ) {
      menu.component = 'Link';
    }

    // 内嵌iframe 组件为InnerLink
    if (/^https?:\/\//.test(menu.path) && menu.component === 'InnerLink') {
      menu.component = 'IFrameView';
    }

    /**
     * 拼接path
     * menu.path为''(根目录路由) 则不拼接
     */
    if (parentPath && menu.path) {
      menu.path = `${parentPath}/${menu.path}`;
    }

    // 创建vben路由对象
    const vbenRoute: RouteRecordStringComponent = {
      component: menu.component,
      meta: {
        // 当前路由不在菜单显示 但是可以通过链接访问
        // 不可访问的路由由后端控制隐藏(不返回对应路由)
        hideInMenu: menu.meta?.hideInMenu,
        icon: menu.meta?.icon,
        keepAlive: !menu.meta?.ignoreKeepAlive,
        title: menu.meta?.title,
        hideInTab: menu.meta.hideTab as any,
        hideInBreadcrumb: menu.meta.hideBreadcrumb as any,
        maxNumOfOpenTab: menu.meta.dynamicLevel as any,
        affixTab: menu.meta.affix as any,
      },
      name: menu.name,
      path: menu.path,
    };

    // 添加路由参数信息
    if (menu.meta.carryParam && menu.meta.params) {
      try {
        const query = JSON.parse(menu.meta.params);
        vbenRoute.meta && (vbenRoute.meta.query = query);
      } catch {
        console.error('错误的路由参数类型, 必须为[json]格式');
      }
    }

    /**
     * 处理不同组件
     */
    switch (menu.component) {
      /**
       * iframe内嵌
       */
      case 'IFrameView': {
        vbenRoute.component = 'IFrameView';
        if (vbenRoute.meta) {
          vbenRoute.meta.iframeSrc = link as any;
        }
        /**
         * 需要判断特殊情况  比如vue的hash是带#的
         * 比如链接 aaa.com/#/bbb  path会转换为 aaa/com/#/bbb
         * 比如链接 aaa.com/?bbb=xxx
         * 需要去除#  否则无法被添加到路由
         */
        vbenRoute.path = vbenRoute.path
          // 替换https:// 或者 http://
          .replaceAll(/^\/.*?https?:\/\//g, '')
          .replaceAll('/#/', '')
          .replaceAll('#', '')
          .replaceAll(/[?&]/g, '');
        console.log(vbenRoute.path);
        break;
      }
      case 'Layout': {
        vbenRoute.component = 'BasicLayout';
        break;
      }
      /**
       * 外链 新窗口打开
       */
      case 'Link': {
        if (vbenRoute.meta) {
          vbenRoute.meta.link = link as any;
        }
        vbenRoute.component = 'BasicLayout';
        break;
      }
      /**
       * 三级以上菜单 父级component为ParentView
       * 不能为layout 会套两层BasicLayout
       */
      case 'ParentView': {
        vbenRoute.component = '';
        break;
      }
      /**
       * 根目录菜单
       */
      case 'RootMenu': {
        if (vbenRoute.meta) {
          vbenRoute.meta.hideChildrenInMenu = true;
        }
        vbenRoute.component = 'BasicLayout';
        break;
      }
      /**
       * 其他自定义组件 如system/user/index 拼接/
       */
      default: {
        vbenRoute.component = `/${menu.component}`;
        break;
      }
    }

    // children处理
    if (menu.children && menu.children.length > 0) {
      vbenRoute.children = backMenuToVbenMenu(menu.children, menu.path);
    }
    // 添加
    resultList.push(vbenRoute);
  });
  return resultList;
}

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
    NotFoundComponent,
  };

  return await generateAccessible(preferences.app.accessMode, {
    ...options,
    fetchMenuListAsync: async () => {
      // 清除以前的message
      message.destroy();
      message.loading({
        content: `${$t('common.loadingMenu')}...`,
        duration: 1,
      });
      // 后台返回路由/菜单
      const menuData = await getMenuListByRole();
      
      let vbenMenuList: RouteRecordStringComponent[] = [];
      
      if (menuData.total > 0) {
        const menuTreeData: RouteItem[] = array2tree(
          menuData.data,
        ) as RouteItem[];
        // 转换为vben能用的路由
        const authStore = useAuthStore();
        const accessStore = useAccessStore();
        authStore.elementPermissionList = [];
        vbenMenuList = backMenuToVbenMenu(menuTreeData);
        accessStore.setAccessCodes(authStore.elementPermissionList);
      }
      
      // 特别注意 这里要深拷贝 - 无论后端菜单是否为空都返回本地菜单
      const menuList = [...cloneDeep(localMenuList), ...vbenMenuList];
      // console.log('menuList', menuList);
      return menuList;
    },
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  });
}

export { generateAccess };
