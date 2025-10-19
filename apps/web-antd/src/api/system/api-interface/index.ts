import type { ApiInfo } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  CreateApi = '/sys-api/api/create',
  DeleteApi = '/sys-api/api/delete',
  GetApiById = '/sys-api/api',
  GetApiList = '/sys-api/api/list',
  UpdateApi = '/sys-api/api/update',
}

/**
 * @description: Get api list
 */

export const getApiList = (params: PageQuery) => {
  return requestClient.post<PageResult<ApiInfo>>(Api.GetApiList, { ...params });
};

/**
 *  @description: Create a new api
 */
export const createApi = (data: any) => {
  return requestClient.postWithMsg<void>(Api.CreateApi, data);
};

/**
 *  @description: Update the api
 */
export const updateApi = (data: any) => {
  return requestClient.postWithMsg<void>(Api.UpdateApi, data);
};

/**
 *  @description: Delete apis
 */
export const deleteApi = (ids: IDS) => {
  return requestClient.postWithMsg<void>(Api.DeleteApi, { ids });
};

/**
 *  @description: Get api By ID
 */
export const getApiById = (id: ID) => {
  return requestClient.post<ApiInfo>(Api.GetApiById, { id });
};
