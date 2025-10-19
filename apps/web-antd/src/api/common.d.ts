export type ID = number | string;
export type IDS = (number | string)[];

export interface BaseEntity {
  createBy?: string;
  createDept?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

/**
 * 分页信息
 * @param data 结果集
 * @param total 总数
 */
export interface PageResult<T = any> {
  data: T[];
  total: number;
}

/**
 * 分页查询参数
 *
 * 排序支持的用法如下:
 * {isAsc:"asc",orderByColumn:"id"} order by id asc
 * {isAsc:"asc",orderByColumn:"id,createTime"} order by id asc,create_time asc
 * {isAsc:"desc",orderByColumn:"id,createTime"} order by id desc,create_time desc
 * {isAsc:"asc,desc",orderByColumn:"id,createTime"} order by id asc,create_time desc
 *
 * @param pageNum 当前页
 * @param pageSize 每页大小
 * @param orderByColumn 排序字段
 * @param isAsc 是否升序
 */
export interface PageQuery {
  isAsc?: string;
  orderByColumn?: string;
  pageSize?: number;
  page?: number;
  [key: string]: any;
}

// ==================== 通用响应结构 ====================

/**
 * 基础响应结构
 */
export interface BaseMsgResp {
  code: number;
  msg: string;
}

/**
 * 带数据的响应结构
 */
export interface BaseDataInfo<T = any> extends BaseMsgResp {
  data: T;
}

/**
 * 列表响应结构
 */
export interface BaseListInfo<T = any> extends BaseMsgResp {
  data: PageResult<T>;
}

// ==================== 通用请求参数 ====================

/**
 * ID请求参数
 */
export interface IDReq {
  id: ID;
}

/**
 * 批量ID请求参数
 */
export interface IDsReq {
  ids: IDS;
}

/**
 * 基础ID信息
 */
export interface BaseIDInfo {
  id: ID;
  createdAt: number;
  updatedAt: number;
}
