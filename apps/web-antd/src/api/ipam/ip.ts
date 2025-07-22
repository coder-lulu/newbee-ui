import type {
  BaseMsgResp,
  IDReq,
  IDsReq,
  IPCreateReq,
  IPDetailResp,
  IPListReq,
  IPListResp,
  IPUpdateReq,
} from './types';

import { requestClient } from '#/api/request';

// API基础配置
const API_BASE = '/ipam-api/ip';

/**
 * IP地址管理API类
 */
export const IPApi = {
  /**
   * 创建IP地址
   */
  create(data: IPCreateReq): Promise<BaseMsgResp> {
    return requestClient.post(`${API_BASE}/create`, data);
  },

  /**
   * 更新IP地址
   */
  update(data: IPUpdateReq): Promise<BaseMsgResp> {
    return requestClient.post(`${API_BASE}/update`, data);
  },

  /**
   * 删除IP地址（批量）
   */
  delete(data: IDsReq): Promise<BaseMsgResp> {
    return requestClient.post(`${API_BASE}/delete`, data);
  },

  /**
   * 获取IP地址列表
   */
  list(data: IPListReq): Promise<IPListResp> {
    return requestClient.post(`${API_BASE}/list`, data);
  },

  /**
   * 获取IP地址详情
   */
  detail(data: IDReq): Promise<IPDetailResp> {
    return requestClient.post(`${API_BASE}`, data);
  },
};

// ==================== 便捷方法 ====================

/**
 * 创建IP地址
 */
export const createIP = IPApi.create;

/**
 * 更新IP地址
 */
export const updateIP = IPApi.update;

/**
 * 删除IP地址
 */
export const deleteIP = IPApi.delete;

/**
 * 获取IP地址列表
 */
export const getIPList = IPApi.list;

/**
 * 获取IP地址详情
 */
export const getIPDetail = IPApi.detail;
