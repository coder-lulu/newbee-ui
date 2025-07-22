import type {
  BaseMsgResp,
  IDReq,
  IDsReq,
  VlanCreateReq,
  VlanDetailResp,
  VlanListReq,
  VlanListResp,
  VlanUpdateReq,
} from './types';

import { requestClient } from '#/api/request';

// API基础配置
const API_BASE = '/ipam-api/vlan';

/**
 * VLAN管理API类
 */
export const VlanApi = {
  /**
   * 创建VLAN
   */
  create(data: VlanCreateReq): Promise<BaseMsgResp> {
    return requestClient.post(`${API_BASE}/create`, data);
  },

  /**
   * 更新VLAN
   */
  update(data: VlanUpdateReq): Promise<BaseMsgResp> {
    return requestClient.post(`${API_BASE}/update`, data);
  },

  /**
   * 删除VLAN（批量）
   */
  delete(data: IDsReq): Promise<BaseMsgResp> {
    return requestClient.post(`${API_BASE}/delete`, data);
  },

  /**
   * 获取VLAN列表
   */
  list(data: VlanListReq): Promise<VlanListResp> {
    return requestClient.post(`${API_BASE}/list`, data);
  },

  /**
   * 获取VLAN详情
   */
  detail(data: IDReq): Promise<VlanDetailResp> {
    return requestClient.post(`${API_BASE}`, data);
  },
};

// ==================== 便捷方法 ====================

/**
 * 创建VLAN
 */
export const createVlan = VlanApi.create;

/**
 * 更新VLAN
 */
export const updateVlan = VlanApi.update;

/**
 * 删除VLAN
 */
export const deleteVlan = VlanApi.delete;

/**
 * 获取VLAN列表
 */
export const getVlanList = VlanApi.list;

/**
 * 获取VLAN详情
 */
export const getVlanDetail = VlanApi.detail;
