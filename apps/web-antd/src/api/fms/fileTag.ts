import type { TagInfo } from './model';

import type { IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum FileTagApi {
  CreateTag = '/fms-api/file_tag/create',
  DeleteTag = '/fms-api/file_tag/delete',
  GetTagById = '/fms-api/file_tag',
  GetTagList = '/fms-api/file_tag/list',
  UpdateTag = '/fms-api/file_tag/update',
}

/**
 * @description: Get tag list
 */
export const getTagList = (params: PageQuery) => {
  return requestClient.post<PageResult<TagInfo>>(FileTagApi.GetTagList, {
    ...params,
  });
};

/**
 *  @description: Create a new tag
 */
export const createTag = (params: TagInfo) => {
  return requestClient.postWithMsg<void>(FileTagApi.CreateTag, params);
};

/**
 *  @description: Update the tag
 */
export const updateTag = (params: TagInfo) => {
  return requestClient.postWithMsg<void>(FileTagApi.UpdateTag, params);
};

/**
 *  @description: Delete tags
 */
export const deleteTag = (params: IDS) => {
  return requestClient.postWithMsg<void>(FileTagApi.DeleteTag, { ids: params });
};

/**
 *  @description: Get tag By ID
 */
export const getTagById = (id: number) => {
  return requestClient.post<TagInfo>(FileTagApi.GetTagById, { id });
};
