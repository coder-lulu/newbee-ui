import type {
  CaptchaLoginParams,
  EmailLoginParams,
  LoginParams,
  LoginResult,
  SmsLoginParams,
} from '@/api/core/auth';

import type { UserInfoModel } from '#/api/core/user';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';
import { isArray } from 'remeda';

import {
  doLogout,
  getUserInfoApi,
  loginApi,
  loginByEmail,
  loginBySms,
  seeConnectionClose,
} from '#/api';
import { getPermCode } from '#/api/core/user';
import { $t } from '#/locales';

import { useDictStore } from './dict';
import { useTenantStore } from './tenant';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const tenantStore = useTenantStore();
  const router = useRouter();
  const isLoggingOut = ref(false);
  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */

  async function authLogin(
    params: LoginParams,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: UserInfoModel = {
      avatar: '',
      homePath: '',
      nickname: '',
      roleNames: [],
      userId: '',
      username: '',
      departmentName: '',
      realName: '',
      roleCodes: [],
    };

    try {
      loginLoading.value = true;

      let resp: LoginResult;
      // 判断登录类型，根据登录类型进行登录
      switch (params.grantType) {
        case 'email': {
          resp = await loginByEmail(params as EmailLoginParams);
          break;
        }
        case 'mobile': {
          resp = await loginBySms(params as SmsLoginParams);
          break;
        }
        case 'password': {
          resp = await loginApi(params as CaptchaLoginParams);
          break;
        }
        // No default
      }

      if (resp.token) {
        // 将 accessToken 存储到 accessStore 中
        accessStore.setAccessToken(resp.token);
        accessStore.setRefreshToken(resp.token);

        // 获取用户信息并存储到 accessStore 中
        const [fetchUserInfoResult, accessCodes] = await Promise.all([
          fetchUserInfo(),
          getPermCode(),
        ]);

        userInfo = fetchUserInfoResult;
        /**
         * 在这里设置权限
         */
        accessStore.setAccessCodes(accessCodes);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(userInfo?.homePath || preferences.app.defaultHomePath);
        }

        // 登录成功后初始化租户信息
        await tenantStore.initTenant();

        if (userInfo?.nickname) {
          notification.success({
            description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.nickname}`,
            duration: 3,
            message: $t('authentication.loginSuccess'),
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    if (isLoggingOut.value) {
      return; // 如果正在登出，直接返回，避免重复登出
    }
    isLoggingOut.value = true;
    try {
      await seeConnectionClose();
      await doLogout();
    } catch (error) {
      console.error(error);
    } finally {
      resetAllStores();
      accessStore.setLoginExpired(false);

      // 回登陆页带上当前路由地址
      await router.replace({
        path: LOGIN_PATH,
        query: redirect
          ? {
              redirect: encodeURIComponent(router.currentRoute.value.fullPath),
            }
          : {},
      });
    }
    isLoggingOut.value = false;
  }

  async function fetchUserInfo() {
    const resp = await getUserInfoApi();
    /**
     * 登录超时的情况
     */

    if (!resp) {
      throw new Error('获取用户信息失败.');
    }

    if (
      resp.avatar === undefined ||
      resp.avatar === null ||
      resp.avatar === ''
    ) {
      resp.avatar = preferences.app.defaultAvatar;
    }

    resp.realName = resp.nickname;
    resp.roles = resp.roleCodes;
    userStore.setUserInfo(resp as any);
    const dictStore = useDictStore();
    dictStore.resetCache();
    return resp;
  }

  function $reset() {
    loginLoading.value = false;
  }

  const elementPermissionList = ref<string[]>([]);

  function hasElementPermission(
    value?: string | string[],
    condition: 'AND' | 'OR' = 'OR',
  ): boolean {
    if (!value) {
      return false;
    }

    if (condition === 'OR') {
      if (isArray(value)) {
        for (const e of value) {
          if (elementPermissionList.value.includes(e)) {
            return true;
          }
        }
      } else {
        if (elementPermissionList.value.includes(value)) {
          return true;
        }
      }
    } else {
      if (isArray(value)) {
        for (const e of value) {
          if (!elementPermissionList.value.includes(e)) {
            return false;
          }
        }
      } else {
        if (elementPermissionList.value.includes(value)) {
          return true;
        }
      }
    }

    return false;
  }

  // 新增方法：刷新用户上下文（不重新登录）
  async function refreshUserContext() {
    try {
      // 重新获取用户信息（包含当前激活租户）
      const [userInfo, accessCodes] = await Promise.all([
        fetchUserInfo(),
        getPermCode(),
      ]);
      
      // 更新权限码
      accessStore.setAccessCodes(accessCodes);
      
      // 重新初始化租户信息
      await tenantStore.initTenant();
      
      return userInfo;
    } catch (error) {
      console.error('Failed to refresh user context:', error);
      throw error;
    }
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
    isLoggingOut,
    elementPermissionList,
    hasElementPermission,
    refreshUserContext,
  };
});
