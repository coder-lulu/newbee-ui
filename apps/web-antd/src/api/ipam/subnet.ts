import type {
  BaseMsgResp,
  IDReq,
  IDsReq,
  SubnetCreateReq,
  SubnetDetailResp,
  SubnetListReq,
  SubnetListResp,
  SubnetUpdateReq,
} from './types';

import { requestClient } from '#/api/request';

// API基础配置
const API_BASE = '/ipam-api/subnet';

/**
 * 网段管理API类
 */
export const SubnetApi = {
  /**
   * 创建网段
   */
  create(data: SubnetCreateReq): Promise<BaseMsgResp> {
    return requestClient.post(`${API_BASE}/create`, data);
  },

  /**
   * 更新网段
   */
  update(data: SubnetUpdateReq): Promise<BaseMsgResp> {
    return requestClient.post(`${API_BASE}/update`, data);
  },

  /**
   * 删除网段（批量）
   */
  delete(data: IDsReq): Promise<BaseMsgResp> {
    return requestClient.post(`${API_BASE}/delete`, data);
  },

  /**
   * 获取网段列表
   */
  list(data: SubnetListReq): Promise<SubnetListResp> {
    return requestClient.post(`${API_BASE}/list`, data);
  },

  /**
   * 获取网段详情
   */
  detail(data: IDReq): Promise<SubnetDetailResp> {
    return requestClient.post(`${API_BASE}`, data);
  },
};

// ==================== 便捷方法 ====================

/**
 * 创建网段
 */
export const createSubnet = SubnetApi.create;

/**
 * 更新网段
 */
export const updateSubnet = SubnetApi.update;

/**
 * 删除网段
 */
export const deleteSubnet = SubnetApi.delete;

/**
 * 获取网段列表
 */
export const getSubnetList = SubnetApi.list;

/**
 * 获取网段详情
 */
export const getSubnetDetail = SubnetApi.detail;
