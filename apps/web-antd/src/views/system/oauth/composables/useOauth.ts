import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { useErrorHandler } from './useErrorHandler';
import type { 
  OauthProviderInfo, 
  OauthAccountInfo, 
  UserOauthProviderInfo,
  OauthStatistics 
} from '#/api/system/oauth/model';
import {
  getOauthProviderList,
  createOauthProvider,
  updateOauthProvider,
  deleteOauthProvider,
  testOauthProvider,
  getOauthAccountList,
  getUserOauthProviders,
  unbindOauthAccount,
  getOauthStatistics,
} from '#/api/system/oauth';

/**
 * OAuth 提供商管理相关功能
 */
export function useOauthProviders() {
  const loading = ref(false);
  const providers = ref<OauthProviderInfo[]>([]);
  const { withLoading, handleOAuthError } = useErrorHandler();

  // 获取提供商列表
  const fetchProviders = async (params?: any) => {
    return await withLoading(
      async () => {
        const data = await getOauthProviderList(params);
        providers.value = data.list || [];
        return data;
      },
      { action: '获取提供商列表', component: 'OAuthProviders' },
      { loadingText: '正在加载提供商列表...' }
    );
  };

  // 创建提供商
  const createProvider = async (data: Partial<OauthProviderInfo>) => {
    const result = await withLoading(
      async () => {
        await createOauthProvider(data);
        return true;
      },
      { action: '创建提供商', component: 'OAuthProviders' },
      { 
        loadingText: '正在创建提供商...',
        successMessage: '提供商创建成功',
        errorOptions: { showNotification: true }
      }
    );
    return result !== null;
  };

  // 更新提供商
  const updateProvider = async (data: Partial<OauthProviderInfo>) => {
    const result = await withLoading(
      async () => {
        await updateOauthProvider(data);
        return true;
      },
      { action: '更新提供商', component: 'OAuthProviders' },
      { 
        loadingText: '正在更新提供商...',
        successMessage: '提供商更新成功',
        errorOptions: { showNotification: true }
      }
    );
    return result !== null;
  };

  // 删除提供商
  const deleteProviders = async (ids: (string | number)[]) => {
    const result = await withLoading(
      async () => {
        await deleteOauthProvider(ids);
        return true;
      },
      { action: '删除提供商', component: 'OAuthProviders' },
      { 
        loadingText: '正在删除提供商...',
        successMessage: `成功删除${ids.length}个提供商`,
        errorOptions: { showNotification: true }
      }
    );
    return result !== null;
  };

  // 测试提供商连接
  const testProvider = async (id: string | number) => {
    return await withLoading(
      async () => {
        const result = await testOauthProvider(id);
        if (result.connected) {
          message.success(`连接测试成功 (${result.responseTime}ms)`);
        } else {
          handleOAuthError(
            new Error(result.errorMessage || '连接失败'),
            '提供商连接测试'
          );
        }
        return result;
      },
      { action: '测试提供商连接', component: 'OAuthProviders' },
      { 
        loadingText: '正在测试连接...',
        errorOptions: { showMessage: false } // 使用OAuth专用错误处理
      }
    );
  };

  // 批量启用/禁用
  const batchToggleStatus = async (
    providers: OauthProviderInfo[], 
    enabled: boolean
  ) => {
    const result = await withLoading(
      async () => {
        const promises = providers.map(provider => 
          updateOauthProvider({ ...provider, enabled })
        );
        await Promise.all(promises);
        return true;
      },
      { action: `批量${enabled ? '启用' : '禁用'}提供商`, component: 'OAuthProviders' },
      { 
        loadingText: `正在${enabled ? '启用' : '禁用'}${providers.length}个提供商...`,
        successMessage: `批量${enabled ? '启用' : '禁用'}成功`,
        errorOptions: { showNotification: true }
      }
    );
    return result !== null;
  };

  return {
    loading,
    providers,
    fetchProviders,
    createProvider,
    updateProvider,
    deleteProviders,
    testProvider,
    batchToggleStatus,
  };
}

/**
 * OAuth 账户管理相关功能
 */
export function useOauthAccounts() {
  const loading = ref(false);
  const accounts = ref<OauthAccountInfo[]>([]);
  const userProviders = ref<UserOauthProviderInfo[]>([]);

  // 获取账户列表
  const fetchAccounts = async (params?: any) => {
    loading.value = true;
    try {
      const data = await getOauthAccountList(params);
      accounts.value = data.list || [];
      return data;
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      message.error('获取账户列表失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 获取用户OAuth提供商
  const fetchUserProviders = async () => {
    try {
      const data = await getUserOauthProviders();
      userProviders.value = data;
      return data;
    } catch (error) {
      console.error('Failed to fetch user providers:', error);
      message.error('获取用户提供商失败');
      return [];
    }
  };

  // 解绑账户
  const unbindAccount = async (id: string | number) => {
    try {
      await unbindOauthAccount(id);
      message.success('解绑成功');
      return true;
    } catch (error) {
      console.error('Unbind failed:', error);
      message.error('解绑失败');
      return false;
    }
  };

  return {
    loading,
    accounts,
    userProviders,
    fetchAccounts,
    fetchUserProviders,
    unbindAccount,
  };
}

/**
 * OAuth 统计相关功能
 */
export function useOauthStatistics() {
  const loading = ref(false);
  const statistics = ref<OauthStatistics>({});

  // 获取统计数据
  const fetchStatistics = async () => {
    loading.value = true;
    try {
      const data = await getOauthStatistics();
      statistics.value = data;
      return data;
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      message.error('获取统计数据失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 计算成功率
  const calculateSuccessRate = (successCount: number, failureCount: number) => {
    const total = successCount + failureCount;
    if (total === 0) return 0;
    return Math.round((successCount / total) * 100);
  };

  return {
    loading,
    statistics,
    fetchStatistics,
    calculateSuccessRate,
  };
}

/**
 * OAuth 通用工具函数
 */
export function useOauthUtils() {
  // 获取提供商类型颜色
  const getProviderTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      google: 'red',
      github: 'purple',
      facebook: 'blue',
      wechat: 'green',
      qq: 'cyan',
      feishu: 'orange',
      dingtalk: 'magenta',
      custom: 'default',
    };
    return colorMap[type] || 'default';
  };

  // 获取状态颜色
  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      active: 'success',
      inactive: 'default',
      error: 'error',
      enabled: 'success',
      disabled: 'default',
    };
    return colorMap[status] || 'default';
  };

  // 格式化响应时间
  const formatResponseTime = (time: number): string => {
    if (time < 100) return `${time}ms (优秀)`;
    if (time < 200) return `${time}ms (良好)`;
    if (time < 500) return `${time}ms (一般)`;
    return `${time}ms (较慢)`;
  };

  // 格式化时间
  const formatTime = (timestamp: string | number): string => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString();
  };

  // 获取提供商图标初始化
  const getProviderInitials = (name?: string): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // 验证JSON字符串
  const validateJSON = (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  };

  return {
    getProviderTypeColor,
    getStatusColor,
    formatResponseTime,
    formatTime,
    getProviderInitials,
    validateJSON,
  };
}

/**
 * OAuth 表单预设配置
 */
export function useOauthPresets() {
  const presets: Record<string, Partial<OauthProviderInfo>> = {
    google: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      infoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      scopes: 'openid profile email',
      supportPkce: true,
      providerType: 'oidc',
    },
    github: {
      authUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      infoUrl: 'https://api.github.com/user',
      scopes: 'user:email',
      supportPkce: false,
      providerType: 'oauth2',
    },
    wechat: {
      authUrl: 'https://open.weixin.qq.com/connect/qrconnect',
      tokenUrl: 'https://api.weixin.qq.com/sns/oauth2/access_token',
      infoUrl: 'https://api.weixin.qq.com/sns/userinfo',
      scopes: 'snsapi_login',
      supportPkce: false,
      providerType: 'oauth2',
    },
    facebook: {
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      infoUrl: 'https://graph.facebook.com/me?fields=id,name,email',
      scopes: 'email',
      supportPkce: true,
      providerType: 'oauth2',
    },
    qq: {
      authUrl: 'https://graph.qq.com/oauth2.0/authorize',
      tokenUrl: 'https://graph.qq.com/oauth2.0/token',
      infoUrl: 'https://graph.qq.com/user/get_user_info',
      scopes: 'get_user_info',
      supportPkce: false,
      providerType: 'oauth2',
    },
  };

  const getPreset = (type: string): Partial<OauthProviderInfo> | null => {
    return presets[type] || null;
  };

  const getAvailablePresets = (): Array<{ label: string; value: string }> => {
    return Object.keys(presets).map(key => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value: key,
    }));
  };

  return {
    presets,
    getPreset,
    getAvailablePresets,
  };
}