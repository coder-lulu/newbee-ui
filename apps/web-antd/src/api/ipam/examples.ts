/**
 * IPAM API 使用示例
 *
 * 本文件展示了如何使用IPAM API进行常见的操作
 */

import {
  ActionType,
  AllocationStrategy,
  DomainApi,
  DomainType,
  IpamUtils,
  IPApi,
  IPRecordApi,
  IPStatus,
  OnlineStatus,
  Status,
  SubnetApi,
  VlanApi,
} from './index';

/**
 * 示例1: 完整的IP分配流程
 */
export async function exampleCompleteIPAllocation() {
  try {
    // 1. 创建网域
    const domainResult = await DomainApi.create({
      name: '生产环境域',
      type: DomainType.BUSINESS,
      cidrRanges: IpamUtils.stringifyCidrRanges(['192.168.1.0/24']),
      description: '生产环境网络域',
      status: Status.NORMAL,
    });
    console.log('创建网域结果:', domainResult);

    // 假设创建成功，获取到domainId为1
    const domainId = 1;

    // 2. 创建VLAN
    const vlanResult = await VlanApi.create({
      vlanId: 100,
      name: '办公VLAN',
      domainId,
      description: '办公区域VLAN',
      status: Status.NORMAL,
    });
    console.log('创建VLAN结果:', vlanResult);

    // 3. 创建网段
    const subnetResult = await SubnetApi.create({
      domainId,
      cidr: '192.168.1.0/24',
      vlanId: 100,
      name: '办公网段',
      gateway: '192.168.1.1',
      allocationStrategy: AllocationStrategy.SEQUENTIAL,
      description: '办公区域网段',
      status: Status.NORMAL,
    });
    console.log('创建网段结果:', subnetResult);

    // 假设创建成功，获取到subnetId为1
    const subnetId = 1;

    // 4. 分配IP地址
    const ipResult = await IPApi.create({
      subnetId,
      ipAddr: '192.168.1.10',
      macAddr: '00:11:22:33:44:55',
      assetId: 1001,
      ipStatus: IPStatus.ALLOCATED,
      onlineStatus: OnlineStatus.ONLINE,
      description: '服务器IP',
      status: Status.NORMAL,
    });
    console.log('分配IP结果:', ipResult);

    // 假设分配成功，获取到ipId为1
    const ipId = 1;

    // 5. 记录操作历史
    const recordResult = await IPRecordApi.create({
      ipId,
      subnetId,
      domainId,
      action: ActionType.ALLOCATE,
      operator: 'admin',
      assetId: 1001,
      remark: '分配给服务器使用',
    });
    console.log('记录操作历史结果:', recordResult);

    return {
      domainId,
      subnetId,
      ipId,
      success: true,
    };
  } catch (error) {
    console.error('IP分配流程失败:', error);
    return { success: false, error };
  }
}

/**
 * 示例2: 查询网段下的所有IP
 */
export async function exampleQuerySubnetIPs(subnetId: number) {
  try {
    const result = await IPApi.list({
      page: 1,
      pageSize: 50,
      subnetId,
      status: Status.NORMAL,
    });

    console.log('网段IP列表:', result.data.data);
    console.log('总数:', result.data.total);

    // 处理IP列表数据
    const ipList = result.data.data.map((ip) => ({
      ...ip,
      ipStatusLabel: IpamUtils.getIPStatusLabel(ip.ipStatus),
      onlineStatusLabel: IpamUtils.getOnlineStatusLabel(ip.onlineStatus),
      formattedCreatedAt: IpamUtils.formatTimestamp(ip.createdAt),
    }));

    return ipList;
  } catch (error) {
    console.error('查询网段IP失败:', error);
    throw error;
  }
}

/**
 * 示例3: 批量删除IP
 */
export async function exampleBatchDeleteIPs(ipIds: number[]) {
  try {
    const result = await IPApi.delete({ ids: ipIds });
    console.log('批量删除IP结果:', result);
    return result;
  } catch (error) {
    console.error('批量删除IP失败:', error);
    throw error;
  }
}

/**
 * 示例4: 网域管理操作
 */
export async function exampleDomainManagement() {
  try {
    // 获取网域列表
    const domainList = await DomainApi.list({
      page: 1,
      pageSize: 10,
      status: Status.NORMAL,
    });

    console.log('网域列表:', domainList.data.data);

    // 处理网域数据
    const processedDomains = domainList.data.data.map((domain) => ({
      ...domain,
      typeLabel: IpamUtils.getDomainTypeLabel(domain.type),
      statusLabel: IpamUtils.getStatusLabel(domain.status),
      cidrRangesList: IpamUtils.parseCidrRanges(domain.cidrRanges),
      formattedCreatedAt: IpamUtils.formatTimestamp(domain.createdAt),
    }));

    return processedDomains;
  } catch (error) {
    console.error('网域管理操作失败:', error);
    throw error;
  }
}

/**
 * 示例5: 网段信息分析
 */
export async function exampleSubnetAnalysis(cidr: string) {
  try {
    // 验证CIDR格式
    if (!IpamUtils.validateCIDR(cidr)) {
      throw new Error('无效的CIDR格式');
    }

    // 计算网段信息
    const networkInfo = IpamUtils.getNetworkInfo(cidr);
    const availableIPs = IpamUtils.calculateAvailableIPs(cidr);

    console.log('网段分析结果:', {
      cidr,
      networkInfo,
      availableIPs,
    });

    return {
      cidr,
      ...networkInfo,
      availableIPs,
      totalIPs: availableIPs + 2, // 包含网络地址和广播地址
    };
  } catch (error) {
    console.error('网段分析失败:', error);
    throw error;
  }
}

/**
 * 示例6: IP地址验证和格式化
 */
export async function exampleIPValidation() {
  const testIPs = [
    '192.168.1.1',
    '10.0.0.1',
    '256.1.1.1', // 无效
    '192.168.1', // 无效
  ];

  const testMACs = [
    '00:11:22:33:44:55',
    '00-11-22-33-44-55',
    'invalid-mac', // 无效
  ];

  const testCIDRs = [
    '192.168.1.0/24',
    '10.0.0.0/8',
    '192.168.1.0/33', // 无效
  ];

  console.log('IP地址验证结果:');
  testIPs.forEach((ip) => {
    console.log(`${ip}: ${IpamUtils.validateIPAddress(ip) ? '有效' : '无效'}`);
  });

  console.log('MAC地址验证结果:');
  testMACs.forEach((mac) => {
    console.log(
      `${mac}: ${IpamUtils.validateMACAddress(mac) ? '有效' : '无效'}`,
    );
  });

  console.log('CIDR验证结果:');
  testCIDRs.forEach((cidr) => {
    console.log(`${cidr}: ${IpamUtils.validateCIDR(cidr) ? '有效' : '无效'}`);
  });
}

/**
 * 示例7: 获取选项数据用于表单
 */
export function exampleGetFormOptions() {
  return {
    domainTypes: IpamUtils.getDomainTypeOptions(),
    ipStatuses: IpamUtils.getIPStatusOptions(),
    onlineStatuses: IpamUtils.getOnlineStatusOptions(),
    allocationStrategies: IpamUtils.getAllocationStrategyOptions(),
    actionTypes: IpamUtils.getActionTypeOptions(),
    statuses: IpamUtils.getStatusOptions(),
  };
}

/**
 * 示例8: 操作记录查询和分析
 */
export async function exampleIPRecordAnalysis(ipId: number) {
  try {
    const records = await IPRecordApi.list({
      page: 1,
      pageSize: 100,
      ipId,
    });

    // 处理记录数据
    const processedRecords = records.data.data.map((record) => ({
      ...record,
      actionLabel: IpamUtils.getActionTypeLabel(record.action),
      formattedCreatedAt: IpamUtils.formatTimestamp(record.createdAt),
    }));

    // 统计操作类型
    const actionStats: Record<string, number> = {};
    for (const record of processedRecords) {
      const action = record.action;
      actionStats[action] = (actionStats[action] || 0) + 1;
    }

    console.log('IP操作记录分析:', {
      totalRecords: processedRecords.length,
      actionStats,
      records: processedRecords,
    });

    return {
      records: processedRecords,
      statistics: actionStats,
    };
  } catch (error) {
    console.error('操作记录分析失败:', error);
    throw error;
  }
}
