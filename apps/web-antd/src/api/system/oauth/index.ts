import type { 
  OauthAccountInfo,
  OauthLoginReq, 
  OauthProviderInfo, 
  OauthProviderTestResult,
  OauthStatistics,
  RedirectInfo,
  UserOauthProviderInfo
} from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  // OAuth Provider APIs
  CreateOauthProvider = '/sys-api/oauth_provider/create',
  DeleteOauthProvider = '/sys-api/oauth_provider/delete',
  GetOauthProviderById = '/sys-api/oauth_provider',
  GetOauthProviderList = '/sys-api/oauth_provider/list',
  UpdateOauthProvider = '/sys-api/oauth_provider/update',
  TestOauthProvider = '/sys-api/oauth_provider/test',
  
  // OAuth Login APIs
  OauthLogin = '/sys-api/oauth/login',
  OauthLoginCallback = '/sys-api/oauth/login/callback',
  GetUserOauthProviders = '/sys-api/oauth/providers',
  
  // OAuth Account Management APIs
  BindOauthAccount = '/sys-api/oauth/bind',
  UnbindOauthAccount = '/sys-api/oauth/unbind',
  GetUserOauthAccounts = '/sys-api/oauth/accounts',
  GetOauthAccountList = '/sys-api/oauth_account/list',
  
  // OAuth Statistics APIs
  GetOauthStatistics = '/sys-api/oauth/statistics',
}

export interface LoginResult {
  token: string;
  userId: string;
  expire: number;
}

/**
 * @description: Get oauth provider list
 */

export const getOauthProviderList = (params: PageQuery) => {
  return requestClient.post<PageResult<OauthProviderInfo>>(
    Api.GetOauthProviderList,
    { ...params },
  );
};

/**
 *  @description: Create a new oauth provider
 */
export const createOauthProvider = (data: any) => {
  return requestClient.postWithMsg<void>(Api.CreateOauthProvider, data);
};

/**
 *  @description: Update the oauth provider
 */
export const updateOauthProvider = (data: any) => {
  return requestClient.postWithMsg<void>(Api.UpdateOauthProvider, data);
};

/**
 *  @description: Delete oauth providers
 */
export const deleteOauthProvider = (ids: IDS) => {
  return requestClient.postWithMsg<void>(Api.DeleteOauthProvider, { ids });
};

/**
 *  @description: Get oauth provider By ID
 */
export const getOauthProviderById = (id: ID) => {
  return requestClient.post<OauthProviderInfo>(Api.GetOauthProviderById, {
    id,
  });
};

/**
 *  @description: oauth log in
 */
export const oauthLogin = (params: OauthLoginReq) => {
  return requestClient.post<RedirectInfo>(Api.OauthLogin, { ...params });
};

/**
 *  @description: oauth log in callback
 */
export const oauthLoginCallback = (URL: string) => {
  return requestClient.get<LoginResult>(Api.OauthLoginCallback + URL);
};

/**
 *  @description: Test OAuth provider connection
 */
export const testOauthProvider = (providerId: ID) => {
  return requestClient.post<OauthProviderTestResult>(Api.TestOauthProvider, {
    providerId,
  });
};

/**
 *  @description: Get user available OAuth providers
 */
export const getUserOauthProviders = (enabledOnly?: boolean) => {
  return requestClient.post<UserOauthProviderInfo[]>(Api.GetUserOauthProviders, {
    enabledOnly,
  });
};

/**
 *  @description: Bind OAuth account
 */
export const bindOauthAccount = (data: {
  userId: string;
  providerType: string;
  providerId: number;
  authorizationCode: string;
  state: string;
}) => {
  return requestClient.postWithMsg<void>(Api.BindOauthAccount, data);
};

/**
 *  @description: Unbind OAuth account
 */
export const unbindOauthAccount = (data: {
  userId: string;
  providerId: number;
}) => {
  return requestClient.postWithMsg<void>(Api.UnbindOauthAccount, data);
};

/**
 *  @description: Get user OAuth accounts
 */
export const getUserOauthAccounts = (params: PageQuery & { userId: string }) => {
  return requestClient.post<PageResult<OauthAccountInfo>>(
    Api.GetUserOauthAccounts,
    params,
  );
};

/**
 *  @description: Get OAuth account list (admin)
 */
export const getOauthAccountList = (params: PageQuery & {
  providerType?: string;
  providerId?: number;
  userId?: string;
}) => {
  return requestClient.post<PageResult<OauthAccountInfo>>(
    Api.GetOauthAccountList,
    params,
  );
};

/**
 *  @description: Get OAuth statistics
 */
export const getOauthStatistics = () => {
  return requestClient.get<OauthStatistics>(Api.GetOauthStatistics);
};
