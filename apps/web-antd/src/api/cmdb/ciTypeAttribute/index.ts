import type { PageQuery, PageResult } from '#/api/common';
import { requestClient } from '#/api/request';
import type { AttributeItem } from '../ci_types/model';

enum Api {
  GetList = '/cmdb-api/ci_type_attribute/list',
}

export interface CiTypeAttributeListReq extends PageQuery {
  typeId?: number;
  attrId?: number;
  isRequired?: boolean;
  listShow?: boolean;
}

export function getCiTypeAttributeList(params: CiTypeAttributeListReq) {
  return requestClient.post<PageResult<AttributeItem>>(Api.GetList, params);
}