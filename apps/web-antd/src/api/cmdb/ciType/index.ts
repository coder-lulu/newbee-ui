import type { PageQuery, PageResult } from '#/api/common';
import { requestClient } from '#/api/request';
import type { CiTypeInfo } from './model';

enum Api {
  GetList = '/cmdb-api/ci_type/list',
}

export function getCiTypeList(params?: PageQuery) {
  return requestClient.post<PageResult<CiTypeInfo>>(Api.GetList, params);
}
