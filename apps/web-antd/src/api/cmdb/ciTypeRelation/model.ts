import type { PageQuery } from '#/api/common';

export interface CiTypeRelationInfo {
  id?: number;
  parentId: number;
  childId: number;
  relationTypeId: number;
  constraint?: string;
  
  // 单一属性映射字段
  parentAttrId?: number;
  childAttrId?: number;
  
  // 多属性映射字段
  parentAttrIds?: number[];
  childAttrIds?: number[];
  
  // Optional fields for display
  parentName?: string;
  childName?: string;
  relationTypeName?: string;
  constraintName?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface CiTypeRelationListReq extends PageQuery {
  parentId?: number;
  childId?: number;
  relationTypeId?: number;
  constraint?: string;
}