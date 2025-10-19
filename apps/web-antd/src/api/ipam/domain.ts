import type {
  BaseMsgResp,
  DomainCreateReq,
  DomainDetailResp,
  DomainListReq,
  DomainUpdateReq,
  IDReq,
  IDsReq,
  IpamDomain,
  ProcessedListResp,
} from './types';

import { requestClient } from '#/api/request';

// API基础配置
const API_BASE = '/ipam-api/domain';

/**
 * 网域管理API类
 */
export const DomainApi = {
  /**
   * 创建网域
   */
  create(data: DomainCreateReq): Promise<BaseMsgResp> {
    return requestClient.post(`${API_BASE}/create`, data);
  },

  /**
   * 更新网域
   */
  update(data: DomainUpdateReq): Promise<BaseMsgResp> {
    return requestClient.post(`${API_BASE}/update`, data);
  },

  /**
   * 删除网域（批量）
   */
  delete(data: IDsReq): Promise<BaseMsgResp> {
    return requestClient.post(`${API_BASE}/delete`, data);
  },

  /**
   * 获取网域列表
   */
  list(data: DomainListReq): Promise<ProcessedListResp<IpamDomain>> {
    return requestClient.post(`${API_BASE}/list`, data);
  },

  /**
   * 获取网域详情
   */
  detail(data: IDReq): Promise<DomainDetailResp> {
    return requestClient.post(`${API_BASE}`, data);
  },
};

// ==================== 便捷方法 ====================

/**
 * 创建网域
 */
export const createDomain = DomainApi.create;

/**
 * 更新网域
 */
export const updateDomain = DomainApi.update;

/**
 * 删除网域
 */
export const deleteDomain = DomainApi.delete;

/**
 * 获取网域列表
 */
export const getDomainList = DomainApi.list;

/**
 * 获取网域详情
 */
export const getDomainDetail = DomainApi.detail;
