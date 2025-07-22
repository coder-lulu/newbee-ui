import type { OauthLoginReq, OauthProviderInfo, RedirectInfo } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  CreateOauthProvider = '/sys-api/oauth_provider/create',
  DeleteOauthProvider = '/sys-api/oauth_provider/delete',
  GetOauthProviderById = '/sys-api/oauth_provider',
  GetOauthProviderList = '/sys-api/oauth_provider/list',
  OauthLogin = '/sys-api/oauth/login',
  OauthLoginCallback = '/sys-api/oauth/login/callback',
  UpdateOauthProvider = '/sys-api/oauth_provider/update',
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
