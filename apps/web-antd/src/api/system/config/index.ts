import type { Config, ConfigListResp } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  configExport = '/system/config/export',
  configInfoByKey = '/system/config/configKey',
  configList = '/system/config/list',
  configRefreshCache = '/sys-api/configuration/refreshCache',
  CreateConfiguration = '/sys-api/configuration/create',
  DeleteConfiguration = '/sys-api/configuration/delete',
  GetConfigurationById = '/sys-api/configuration',
  GetConfigurationList = '/sys-api/configuration/list',
  getPublicSystemConfigurationList = '/sys-api/configuration/system/list',
  root = '/system/config',
  UpdateConfiguration = '/sys-api/configuration/update',
}

/**
 * 系统参数分页列表
 * @param params 请求参数
 * @returns 列表
 */
export function configList(params?: PageQuery) {
  return requestClient.post<PageResult<Config>>(Api.GetConfigurationList, {
    ...params,
  });
}

export function configInfo(configId: ID) {
  return requestClient.post<Config>(Api.GetConfigurationById, { id: configId });
}

/**
 * 导出
 * @param data 参数
 */
export function configExport(data: Partial<SysConfig>) {
  return commonExport(Api.configExport, data);
}

/**
 * 刷新缓存
 * @returns void
 */
export function configRefreshCache() {
  return requestClient.deleteWithMsg<void>(Api.configRefreshCache);
}

export function configUpdate(data: any) {
  return requestClient.postWithMsg<void>(Api.UpdateConfiguration, data);
}

export function configAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.CreateConfiguration, data);
}

/**
 * 删除配置
 * @param configIds ids
 */
export function configRemove(configIds: IDS) {
  return requestClient.postWithMsg<void>(Api.DeleteConfiguration, {
    ids: configIds,
  });
}

/**
 * 获取配置信息
 * @param configKey configKey
 * @returns value
 */
export function configInfoByKey(configKey: string) {
  return requestClient.get<string>(`${Api.configInfoByKey}/${configKey}`);
}

/**
 * @description: Get public system configuration list
 */

export const getPublicSystemConfigurationList = () => {
  return requestClient.get<ConfigListResp>(
    Api.getPublicSystemConfigurationList,
  );
};
