import type {
  BaseMsgResp,
  IDReq,
  IDsReq,
  IPRecordCreateReq,
  IPRecordDetailResp,
  IPRecordListReq,
  IPRecordUpdateReq,
  ProcessedIPRecordListResp,
} from './types';

import { requestClient } from '#/api/request';

// API基础配置
const API_BASE = '/ipam-api/record';

/**
 * IP操作记录管理API类
 */
export const IPRecordApi = {
  /**
   * 创建操作记录
   */
  create(data: IPRecordCreateReq): Promise<BaseMsgResp> {
    return requestClient.post(`${API_BASE}/create`, data);
  },

  /**
   * 更新操作记录
   */
  update(data: IPRecordUpdateReq): Promise<BaseMsgResp> {
    return requestClient.post(`${API_BASE}/update`, data);
  },

  /**
   * 删除操作记录（批量）
   */
  delete(data: IDsReq): Promise<BaseMsgResp> {
    return requestClient.post(`${API_BASE}/delete`, data);
  },

  /**
   * 获取操作记录列表
   */
  list(data: IPRecordListReq): Promise<ProcessedIPRecordListResp> {
    return requestClient.post(`${API_BASE}/list`, data);
  },

  /**
   * 获取操作记录详情
   */
  detail(data: IDReq): Promise<IPRecordDetailResp> {
    return requestClient.post(`${API_BASE}`, data);
  },
};

// ==================== 便捷方法 ====================

/**
 * 创建操作记录
 */
export const createIPRecord = IPRecordApi.create;

/**
 * 更新操作记录
 */
export const updateIPRecord = IPRecordApi.update;

/**
 * 删除操作记录
 */
export const deleteIPRecord = IPRecordApi.delete;

/**
 * 获取操作记录列表
 */
export const getIPRecordList = IPRecordApi.list;

/**
 * 获取操作记录详情
 */
export const getIPRecordDetail = IPRecordApi.detail;
