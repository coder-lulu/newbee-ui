import type { CloudFileTagInfo } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum CloudFileTagApi {
  CreateCloudFileTag = '/fms-api/cloud_file_tag/create',
  DeleteCloudFileTag = '/fms-api/cloud_file_tag/delete',
  GetCloudFileTagById = '/fms-api/cloud_file_tag',
  GetCloudFileTagList = '/fms-api/cloud_file_tag/list',
  UpdateCloudFileTag = '/fms-api/cloud_file_tag/update',
}

/**
 * @description: Get cloud file tag list
 */

export const getCloudFileTagList = (params: PageQuery) => {
  return requestClient.post<PageResult<CloudFileTagInfo>>(
    CloudFileTagApi.GetCloudFileTagList,
    { ...params },
  );
};

/**
 *  @description: Create a new cloud file tag
 */
export const createCloudFileTag = (data: CloudFileTagInfo) => {
  return requestClient.postWithMsg<void>(
    CloudFileTagApi.CreateCloudFileTag,
    data,
  );
};

/**
 *  @description: Update the cloud file tag
 */
export const updateCloudFileTag = (data: CloudFileTagInfo) => {
  return requestClient.postWithMsg<void>(
    CloudFileTagApi.UpdateCloudFileTag,
    data,
  );
};

/**
 *  @description: Delete cloud file tag
 */
export const deleteCloudFileTag = (ids: IDS) => {
  return requestClient.postWithMsg<void>(CloudFileTagApi.DeleteCloudFileTag, {
    ids,
  });
};

/**
 *  @description: Get cloud file tag By ID
 */
export const getCloudFileTagById = (id: ID) => {
  return requestClient.post<CloudFileTagInfo>(
    CloudFileTagApi.GetCloudFileTagById,
    { id },
  );
};
