import { acceptHMRUpdate, defineStore } from 'pinia';

interface BasicUserInfo {
  [key: string]: any;
  /**
   * 头像
   */
  avatar: string;
  /**
   * 用户权限
   */
  permissions: string[];
  /**
   * 用户昵称
   */
  realName: string;
  /**
   * 用户角色名
   */
  roleNames: string[];
  /**
   * 用户角色
   */
  roles: string[];
  /**
   * 用户id
   */
  userId: number | string;
  /**
   * 用户名
   */
  username: string;
}

interface AccessState {
  /**
   * 用户信息
   */
  userInfo: BasicUserInfo | null;
  /**
   * 用户角色
   */
  userRoleNames: string[];
  /**
   * 用户角色
   */
  userRoles: string[];
}

/**
 * @zh_CN 用户信息相关
 */
export const useUserStore = defineStore('core-user', {
  actions: {
    setUserInfo(userInfo: BasicUserInfo | null) {
      // 设置用户信息
      this.userInfo = userInfo;
      // 设置角色信息
      const roles = userInfo?.roles ?? [];
      this.setUserRoles(roles);
      const roleNames = userInfo?.roleNames ?? [];
      this.setUserRoleNames(roleNames);
    },
    setUserRoleNames(roleNames: string[]) {
      this.userRoleNames = roleNames;
    },
    setUserRoles(roles: string[]) {
      this.userRoles = roles;
    },
  },
  state: (): AccessState => ({
    userInfo: null,
    userRoleNames: [],
    userRoles: [],
  }),
});

// 解决热更新问题
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useUserStore, hot));
}
