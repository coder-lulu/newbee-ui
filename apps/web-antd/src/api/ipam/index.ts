// 导出所有API类
export { DomainApi } from './domain';
// 导出便捷方法
export {
  createDomain,
  deleteDomain,
  getDomainDetail,
  getDomainList,
  updateDomain,
} from './domain';
export { IPApi } from './ip';
export { createIP, deleteIP, getIPDetail, getIPList, updateIP } from './ip';
export { IPRecordApi } from './record';

export {
  createIPRecord,
  deleteIPRecord,
  getIPRecordDetail,
  getIPRecordList,
  updateIPRecord,
} from './record';

export { SubnetApi } from './subnet';

export {
  createSubnet,
  deleteSubnet,
  getSubnetDetail,
  getSubnetList,
  updateSubnet,
} from './subnet';

// 导出类型定义
export type * from './types';

// 导出工具函数
export { IpamUtils } from './utils';

export { VlanApi } from './vlan';

export {
  createVlan,
  deleteVlan,
  getVlanDetail,
  getVlanList,
  updateVlan,
} from './vlan';
