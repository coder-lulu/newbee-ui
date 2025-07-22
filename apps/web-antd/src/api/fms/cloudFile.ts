import type { CloudFileInfo } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum CloudFileApi {
  CreateCloudFile = '/fms-api/cloud_file/create',
  DeleteCloudFile = '/fms-api/cloud_file/delete',
  GetCloudFileById = '/fms-api/cloud_file',
  GetCloudFileList = '/fms-api/cloud_file/list',
  UpdateCloudFile = '/fms-api/cloud_file/update',
  uploadFile = '/fms-api/cloud_file/upload',
}

/**
 * @description: Get cloud file list
 */

export const getCloudFileList = (params: PageQuery) => {
  return requestClient.post<PageResult<CloudFileInfo>>(
    CloudFileApi.GetCloudFileList,
    { ...params },
  );
};

/**
 *  @description: Create a new cloud file
 */
export const createCloudFile = (data: CloudFileInfo) => {
  return requestClient.postWithMsg<void>(CloudFileApi.CreateCloudFile, data);
};

/**
 *  @description: Update the cloud file
 */
export const updateCloudFile = (data: CloudFileInfo) => {
  return requestClient.postWithMsg<void>(CloudFileApi.UpdateCloudFile, data);
};

/**
 *  @description: Delete cloud file
 */
export const deleteCloudFile = (ids: IDS) => {
  return requestClient.postWithMsg<void>(CloudFileApi.DeleteCloudFile, { ids });
};

/**
 *  @description: Get cloud file By ID
 */
export const getCloudFileById = (id: ID) => {
  return requestClient.post<CloudFileInfo>(CloudFileApi.GetCloudFileById, {
    id,
  });
};

export function uploadCloudFile(file: File, provider: string = '') {
  return requestClient.upload(CloudFileApi.uploadFile, { file, provider });
}
