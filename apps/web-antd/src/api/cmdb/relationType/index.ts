import type { PageQuery, PageResult } from '#/api/common';
import { requestClient } from '#/api/request';
import type { RelationTypeInfo } from './model';

enum Api {
  GetList = '/cmdb-api/relation_type/list',
}

export function getRelationTypeList(params?: PageQuery) {
  return requestClient.post<PageResult<RelationTypeInfo>>(Api.GetList, params);
}
