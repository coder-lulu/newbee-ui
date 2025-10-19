import type { StorageProviderInfo } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum StorageProviderApi {
  CreateStorageProvider = '/fms-api/storage_provider/create',
  DeleteStorageProvider = '/fms-api/storage_provider/delete',
  GetStorageProviderById = '/fms-api/storage_provider',
  GetStorageProviderList = '/fms-api/storage_provider/list',
  UpdateStorageProvider = '/fms-api/storage_provider/update',
}
/**
 * @description: Get storage provider list
 */

export const getStorageProviderList = (params: PageQuery) => {
  return requestClient.post<PageResult<StorageProviderInfo>>(
    StorageProviderApi.GetStorageProviderList,
    { ...params },
  );
};

/**
 *  @description: Create a new storage provider
 */
export const createStorageProvider = (data: StorageProviderInfo) => {
  return requestClient.postWithMsg<void>(
    StorageProviderApi.CreateStorageProvider,
    data,
  );
};

/**
 *  @description: Update the storage provider
 */
export const updateStorageProvider = (data: StorageProviderInfo) => {
  return requestClient.postWithMsg<void>(
    StorageProviderApi.UpdateStorageProvider,
    data,
  );
};

/**
 *  @description: Delete storage provider
 */
export const deleteStorageProvider = (ids: IDS) => {
  return requestClient.postWithMsg<void>(
    StorageProviderApi.DeleteStorageProvider,
    { ids },
  );
};

/**
 *  @description: Get storage provider By ID
 */
export const getStorageProviderById = (id: ID) => {
  return requestClient.post<StorageProviderInfo>(
    StorageProviderApi.GetStorageProviderById,
    { id },
  );
};
