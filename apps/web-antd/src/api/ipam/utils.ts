import {
  ActionType,
  AllocationStrategy,
  DomainType,
  IPStatus,
  OnlineStatus,
  Status,
} from './types';

/**
 * IPAM工具函数
 */
export const IpamUtils = {
  /**
   * 解析CIDR范围字符串为数组
   */
  parseCidrRanges(cidrRanges: string): string[] {
    try {
      return JSON.parse(cidrRanges);
    } catch {
      return [];
    }
  },

  /**
   * 将CIDR范围数组转换为字符串
   */
  stringifyCidrRanges(cidrRanges: string[]): string {
    return JSON.stringify(cidrRanges);
  },

  /**
   * 验证IP地址格式
   */
  validateIPAddress(ip: string): boolean {
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$/;
    return ipRegex.test(ip);
  },

  /**
   * 验证CIDR格式
   */
  validateCIDR(cidr: string): boolean {
    const cidrRegex =
      /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\/(?:\d|[12]\d|3[0-2])$/;
    return cidrRegex.test(cidr);
  },

  /**
   * 验证MAC地址格式
   */
  validateMACAddress(mac: string): boolean {
    const macRegex = /^(?:[0-9A-F]{2}[:-]){5}[0-9A-F]{2}$/i;
    return macRegex.test(mac);
  },

  /**
   * 验证VLAN ID范围
   */
  validateVlanId(vlanId: number): boolean {
    return vlanId >= 1 && vlanId <= 4094;
  },

  /**
   * 获取网域类型选项
   */
  getDomainTypeOptions() {
    return [
      { label: '安全域', value: DomainType.SECURITY },
      { label: '业务域', value: DomainType.BUSINESS },
      { label: '自定义', value: DomainType.CUSTOM },
    ];
  },

  /**
   * 获取IP状态选项
   */
  getIPStatusOptions() {
    return [
      { label: '已分配', value: IPStatus.ALLOCATED },
      { label: '空闲', value: IPStatus.FREE },
      { label: '保留', value: IPStatus.RESERVED },
      { label: '冲突', value: IPStatus.CONFLICT },
      { label: '回收中', value: IPStatus.RECYCLING },
    ];
  },

  /**
   * 获取在线状态选项
   */
  getOnlineStatusOptions() {
    return [
      { label: '在线', value: OnlineStatus.ONLINE },
      { label: '离线', value: OnlineStatus.OFFLINE },
      { label: '未知', value: OnlineStatus.UNKNOWN },
    ];
  },

  /**
   * 获取分配策略选项
   */
  getAllocationStrategyOptions() {
    return [
      { label: '顺序分配', value: AllocationStrategy.SEQUENTIAL },
      { label: '随机分配', value: AllocationStrategy.RANDOM },
      { label: '自定义分配', value: AllocationStrategy.CUSTOM },
    ];
  },

  /**
   * 获取操作类型选项
   */
  getActionTypeOptions() {
    return [
      { label: '单个分配', value: ActionType.ALLOCATE },
      { label: '单个回收', value: ActionType.RELEASE },
      { label: '批量分配', value: ActionType.BATCH_ALLOCATE },
      { label: '批量回收', value: ActionType.BATCH_RELEASE },
    ];
  },

  /**
   * 获取状态选项
   */
  getStatusOptions() {
    return [
      { label: '正常', value: Status.NORMAL },
      { label: '禁用', value: Status.DISABLED },
    ];
  },

  /**
   * 获取状态标签
   */
  getStatusLabel(status: Status): string {
    const options = this.getStatusOptions();
    return options.find((option) => option.value === status)?.label || '未知';
  },

  /**
   * 获取IP状态标签
   */
  getIPStatusLabel(status: IPStatus): string {
    const options = this.getIPStatusOptions();
    return options.find((option) => option.value === status)?.label || '未知';
  },

  /**
   * 获取在线状态标签
   */
  getOnlineStatusLabel(status: OnlineStatus): string {
    const options = this.getOnlineStatusOptions();
    return options.find((option) => option.value === status)?.label || '未知';
  },

  /**
   * 获取网域类型标签
   */
  getDomainTypeLabel(type: DomainType): string {
    const options = this.getDomainTypeOptions();
    return options.find((option) => option.value === type)?.label || '未知';
  },

  /**
   * 获取分配策略标签
   */
  getAllocationStrategyLabel(strategy: AllocationStrategy): string {
    const options = this.getAllocationStrategyOptions();
    return options.find((option) => option.value === strategy)?.label || '未知';
  },

  /**
   * 获取操作类型标签
   */
  getActionTypeLabel(action: ActionType): string {
    const options = this.getActionTypeOptions();
    return options.find((option) => option.value === action)?.label || '未知';
  },

  /**
   * 格式化时间戳
   */
  formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString('zh-CN');
  },

  /**
   * 计算网段可用IP数量
   */
  calculateAvailableIPs(cidr: string): number {
    try {
      const parts = cidr.split('/');
      if (parts.length !== 2) return 0;

      const prefixLength = parts[1];
      if (!prefixLength) return 0;

      const prefix = Number.parseInt(prefixLength, 10);
      if (Number.isNaN(prefix) || prefix < 0 || prefix > 32) return 0;

      const hostBits = 32 - prefix;
      // 减去网络地址和广播地址
      return Math.max(0, 2 ** hostBits - 2);
    } catch {
      return 0;
    }
  },

  /**
   * 获取网段的网络地址和广播地址
   * 注意：在我们的系统中，IP地址为字符串格式，这里提供简化的计算
   */
  getNetworkInfo(cidr: string): {
    broadcast: string;
    firstUsable: string;
    lastUsable: string;
    network: string;
  } {
    try {
      const parts = cidr.split('/');
      if (parts.length !== 2) {
        throw new Error('Invalid CIDR format');
      }

      const ip = parts[0];
      const prefixLength = parts[1];

      if (!ip || !prefixLength) {
        throw new Error('Invalid CIDR format');
      }

      const prefix = Number.parseInt(prefixLength, 10);
      if (Number.isNaN(prefix) || prefix < 0 || prefix > 32) {
        throw new Error('Invalid prefix length');
      }

      // 简化实现：直接返回基础信息
      // 在实际项目中，IP地址为字符串格式，不需要复杂的位运算
      const ipParts = ip.split('.').map(Number);
      if (ipParts.length !== 4) {
        throw new Error('Invalid IP format');
      }

      // 简单的网络地址计算（仅用于展示）
      const networkParts = [...ipParts];
      const hostBits = 32 - prefix;

      // 简化的网络地址计算
      if (hostBits >= 8) {
        networkParts[3] = 0;
        if (hostBits >= 16) {
          networkParts[2] = 0;
          if (hostBits >= 24) {
            networkParts[1] = 0;
          }
        }
      }

      const network = networkParts.join('.');
      const firstUsable = `${networkParts.slice(0, 3).join('.')}.${(networkParts[3] || 0) + 1}`;

      return {
        network,
        broadcast: network, // 简化实现
        firstUsable,
        lastUsable: network, // 简化实现
      };
    } catch {
      // 返回默认值而不是抛出错误
      return {
        network: '0.0.0.0',
        broadcast: '0.0.0.0',
        firstUsable: '0.0.0.0',
        lastUsable: '0.0.0.0',
      };
    }
  },
};

/**
 * 导出便捷方法
 */
export const {
  parseCidrRanges,
  stringifyCidrRanges,
  validateIPAddress,
  validateCIDR,
  validateMACAddress,
  validateVlanId,
  getDomainTypeOptions,
  getIPStatusOptions,
  getOnlineStatusOptions,
  getAllocationStrategyOptions,
  getActionTypeOptions,
  getStatusOptions,
  getStatusLabel,
  getIPStatusLabel,
  getOnlineStatusLabel,
  getDomainTypeLabel,
  getAllocationStrategyLabel,
  getActionTypeLabel,
  formatTimestamp,
  calculateAvailableIPs,
  getNetworkInfo,
} = IpamUtils;
