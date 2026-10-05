import type {
  OauthAccountInfo,
  OauthLoginReq,
  OauthProviderInfo,
  OauthProviderTestResult,
  OauthStatistics,
  RedirectInfo,
  UserOauthProviderInfo,
} from "./model";

import type { ID, IDS, PageQuery, PageResult } from "#/api/common";

import { requestClient } from "#/api/request";

enum Api {
  // OAuth Account Management APIs
  BindOauthAccount = "/sys-api/oauth/bind",
  // OAuth Provider APIs
  CreateOauthProvider = "/sys-api/oauth_provider/create",
  DeleteOauthProvider = "/sys-api/oauth_provider/delete",
  GetOauthAccountList = "/sys-api/oauth_account/list",
  GetOauthProviderById = "/sys-api/oauth_provider",
  GetOauthProviderList = "/sys-api/oauth_provider/list",

  // OAuth Statistics APIs
  GetOauthStatistics = "/sys-api/oauth/statistics",
  GetUserOauthAccounts = "/sys-api/oauth/accounts",
  GetUserOauthProviders = "/sys-api/oauth/providers",

  // OAuth Login APIs
  OauthLogin = "/sys-api/oauth/login",
  OauthLoginCallback = "/sys-api/oauth/login/callback",
  TestOauthProvider = "/sys-api/oauth_provider/test",
  UnbindOauthAccount = "/sys-api/oauth/unbind",

  UpdateOauthProvider = "/sys-api/oauth_provider/update",
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
  return requestClient.post<UserOauthProviderInfo[]>(
    Api.GetUserOauthProviders,
    {
      enabledOnly,
    },
  );
};

/**
 *  @description: Bind OAuth account
 */
export const bindOauthAccount = (data: {
  authorizationCode: string;
  providerId: number;
  providerType: string;
  state: string;
  userId: string;
}) => {
  return requestClient.postWithMsg<void>(Api.BindOauthAccount, data);
};

/**
 *  @description: Unbind OAuth account
 */
export const unbindOauthAccount = (data: {
  providerId: number;
  userId: string;
}) => {
  return requestClient.postWithMsg<void>(Api.UnbindOauthAccount, data);
};

/**
 *  @description: Get user OAuth accounts
 */
export const getUserOauthAccounts = (
  params: PageQuery & { userId: string },
) => {
  return requestClient.post<PageResult<OauthAccountInfo>>(
    Api.GetUserOauthAccounts,
    params,
  );
};

/**
 *  @description: Get OAuth account list (admin)
 */
export const getOauthAccountList = (
  params: PageQuery & {
    providerId?: number;
    providerType?: string;
    userId?: string;
  },
) => {
  return requestClient.post<PageResult<OauthAccountInfo>>(
    Api.GetOauthAccountList,
    params,
  );
};

/**
 *  @description: Get OAuth statistics
 */
export const getOauthStatistics = (params: { providerId?: number } = {}) => {
  return requestClient.post<OauthStatistics>(Api.GetOauthStatistics, params);
};
