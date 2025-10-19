import type { PositionInfo, Post, PostListResp } from './model';

import type { ID, IDS, PageQuery } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  CreatePosition = '/sys-api/position/create',
  DeletePosition = '/sys-api/position/delete',
  GetPositionById = '/sys-api/position',
  GetPositionList = '/sys-api/position/list',
  postExport = '/system/post/export',
  postList = '/system/post/list',
  postSelect = '/system/post/optionselect',
  root = '/system/post',
  UpdatePosition = '/sys-api/position/update',
}

/**
 * 获取岗位列表
 * @param params 参数
 * @returns Post[]
 */
export function postList(params?: PageQuery) {
  return requestClient.post<PostListResp>(Api.GetPositionList, { ...params });
}

/**
 * 导出岗位信息
 * @param data 请求参数
 * @returns blob
 */
export function postExport(data: Partial<Post>) {
  return commonExport(Api.postExport, data);
}

/**
 * 查询岗位信息
 * @param postId id
 * @returns 岗位信息
 */
export function postInfo(postId: ID) {
  return requestClient.post<PositionInfo>(Api.GetPositionById, { id: postId });
}

export function postAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.CreatePosition, data);
}

export function postUpdate(data: any) {
  return requestClient.postWithMsg<void>(Api.UpdatePosition, data);
}

/**
 * 岗位删除
 * @param postIds ids
 * @returns void
 */
export function postRemove(postIds: IDS) {
  return requestClient.postWithMsg<void>(Api.DeletePosition, { ids: postIds });
}

/**
 * 根据部门id获取岗位下拉列表
 * @param deptId 部门id
 * @returns 岗位
 */
export function postOptionSelect(deptId: ID) {
  return requestClient.get<Post[]>(Api.postSelect, { params: { deptId } });
}
