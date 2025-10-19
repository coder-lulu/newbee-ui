import type { TokenInfo } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  CreateToken = '/sys-api/token/create',
  DeleteToken = '/sys-api/token/delete',
  GetTokenById = '/sys-api/token',
  GetTokenList = '/sys-api/token/list',
  Logout = '/sys-api/token/logout',
  UpdateToken = '/sys-api/token/update',
}

/**
 * @description: Get token list
 */

export const getTokenList = (params: PageQuery) => {
  return requestClient.post<PageResult<TokenInfo>>(Api.GetTokenList, {
    ...params,
  });
};

/**
 *  @description: Create a new token
 */
export const createToken = (params: TokenInfo) => {
  return requestClient.postWithMsg<void>(Api.CreateToken, params);
};

/**
 *  @description: Update the token
 */
export const updateToken = (params: TokenInfo) => {
  return requestClient.postWithMsg<void>(Api.UpdateToken, params);
};

/**
 *  @description: Delete tokens
 */
export const deleteToken = (ids: IDS) => {
  return requestClient.postWithMsg<void>(Api.DeleteToken, { ids });
};

/**
 *  @description: Get token By ID
 */
export const getTokenById = (id: ID) => {
  return requestClient.post<TokenInfo>(Api.GetTokenById, { id });
};

/**
 *  @description: Force user log out
 */

export const logout = (id: string) => requestClient.post(Api.Logout, { id });
