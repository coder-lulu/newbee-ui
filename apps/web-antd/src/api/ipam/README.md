# IPAM API 接口定义

本目录包含了IPAM（IP地址管理）系统的完整API接口定义，基于后端提供的API文档实现。

## 文件结构

```
ipam/
├── types.ts          # 类型定义和接口
├── domain.ts         # 网域管理API
├── subnet.ts         # 网段管理API
├── ip.ts            # IP地址管理API
├── vlan.ts          # VLAN管理API
├── record.ts        # IP操作记录API
├── utils.ts         # 工具函数
├── examples.ts      # 使用示例
├── index.ts         # 统一导出
└── README.md        # 说明文档
```

## 主要特性

- **类型安全**: 完整的TypeScript类型定义
- **接口复用**: 统一的请求/响应结构
- **工具函数**: 常用的验证和转换工具
- **使用示例**: 详细的使用示例代码

## 快速开始

### 1. 导入API

```typescript
import {
  DomainApi,
  SubnetApi,
  IPApi,
  VlanApi,
  IPRecordApi,
  IpamUtils,
  DomainType,
  IPStatus,
  Status,
} from '@/api/ipam';
```

### 2. 基本使用

```typescript
// 创建网域
const domain = await DomainApi.create({
  name: '生产环境域',
  type: DomainType.BUSINESS,
  cidrRanges: IpamUtils.stringifyCidrRanges(['192.168.1.0/24']),
  description: '生产环境网络域',
  status: Status.NORMAL,
});

// 查询网域列表
const domainList = await DomainApi.list({
  page: 1,
  pageSize: 10,
  status: Status.NORMAL,
});
```

### 3. 使用工具函数

```typescript
// 验证IP地址
const isValidIP = IpamUtils.validateIPAddress('192.168.1.1');

// 计算网段可用IP数量
const availableIPs = IpamUtils.calculateAvailableIPs('192.168.1.0/24');

// 获取选项数据
const domainTypeOptions = IpamUtils.getDomainTypeOptions();
```

## API 类说明

### DomainApi - 网域管理
- `create(data)` - 创建网域
- `update(data)` - 更新网域
- `delete(data)` - 删除网域
- `list(data)` - 获取网域列表
- `detail(data)` - 获取网域详情

### SubnetApi - 网段管理
- `create(data)` - 创建网段
- `update(data)` - 更新网段
- `delete(data)` - 删除网段
- `list(data)` - 获取网段列表
- `detail(data)` - 获取网段详情

### IPApi - IP地址管理
- `create(data)` - 创建IP地址
- `update(data)` - 更新IP地址
- `delete(data)` - 删除IP地址
- `list(data)` - 获取IP地址列表
- `detail(data)` - 获取IP地址详情

### VlanApi - VLAN管理
- `create(data)` - 创建VLAN
- `update(data)` - 更新VLAN
- `delete(data)` - 删除VLAN
- `list(data)` - 获取VLAN列表
- `detail(data)` - 获取VLAN详情

### IPRecordApi - IP操作记录管理
- `create(data)` - 创建操作记录
- `update(data)` - 更新操作记录
- `delete(data)` - 删除操作记录
- `list(data)` - 获取操作记录列表
- `detail(data)` - 获取操作记录详情

## 工具函数说明

### 验证函数
- `validateIPAddress(ip)` - 验证IP地址格式
- `validateCIDR(cidr)` - 验证CIDR格式
- `validateMACAddress(mac)` - 验证MAC地址格式
- `validateVlanId(vlanId)` - 验证VLAN ID范围

### 转换函数
- `parseCidrRanges(cidrRanges)` - 解析CIDR范围字符串
- `stringifyCidrRanges(cidrRanges)` - 转换CIDR范围为字符串
- `formatTimestamp(timestamp)` - 格式化时间戳

### 计算函数
- `calculateAvailableIPs(cidr)` - 计算网段可用IP数量
- `getNetworkInfo(cidr)` - 获取网段详细信息

### 选项函数
- `getDomainTypeOptions()` - 获取网域类型选项
- `getIPStatusOptions()` - 获取IP状态选项
- `getOnlineStatusOptions()` - 获取在线状态选项
- `getAllocationStrategyOptions()` - 获取分配策略选项
- `getActionTypeOptions()` - 获取操作类型选项
- `getStatusOptions()` - 获取状态选项

### 标签函数
- `getStatusLabel(status)` - 获取状态标签
- `getIPStatusLabel(status)` - 获取IP状态标签
- `getOnlineStatusLabel(status)` - 获取在线状态标签
- `getDomainTypeLabel(type)` - 获取网域类型标签
- `getAllocationStrategyLabel(strategy)` - 获取分配策略标签
- `getActionTypeLabel(action)` - 获取操作类型标签

## 数据类型

### 枚举类型
- `DomainType` - 网域类型（安全域、业务域、自定义）
- `IPStatus` - IP状态（已分配、空闲、保留、冲突、回收中）
- `OnlineStatus` - 在线状态（在线、离线、未知）
- `AllocationStrategy` - 分配策略（顺序、随机、自定义）
- `ActionType` - 操作类型（分配、回收、批量分配、批量回收）
- `Status` - 状态（正常、禁用）

### 实体类型
- `IpamDomain` - 网域实体
- `IpamSubnet` - 网段实体
- `IpamIP` - IP地址实体
- `IpamVlan` - VLAN实体
- `IpamIPRecord` - IP操作记录实体

### 请求类型
- `CreateDomainReq` - 创建网域请求
- `UpdateDomainReq` - 更新网域请求
- `QueryDomainReq` - 查询网域请求
- 其他类似的请求类型...

### 响应类型
- `DomainResp` - 网域响应
- `DomainListResp` - 网域列表响应
- 其他类似的响应类型...

## 使用示例

详细的使用示例请参考 `examples.ts` 文件，包含：

1. 完整的IP分配流程
2. 查询网段下的所有IP
3. 批量删除IP
4. 网域管理操作
5. 网段信息分析
6. IP地址验证和格式化
7. 获取选项数据用于表单
8. 操作记录查询和分析

## 注意事项

1. **认证要求**: 所有API接口都需要在请求头中携带有效的JWT Token
2. **数据验证**: 系统会对所有输入数据进行严格验证
3. **关联关系**: 删除操作会检查关联关系
4. **状态管理**: 所有资源都支持启用/禁用状态
5. **操作审计**: 重要操作建议记录到操作记录表中

## 错误处理

API调用可能抛出异常，建议使用try-catch进行错误处理：

```typescript
try {
  const result = await DomainApi.create(domainData);
  console.log('创建成功:', result);
} catch (error) {
  console.error('创建失败:', error);
  // 处理错误
}
```

## 扩展

如需添加新的API接口，请按照现有的模式：

1. 在 `types.ts` 中添加相关类型定义
2. 创建对应的API文件
3. 在 `index.ts` 中导出
4. 在 `utils.ts` 中添加相关工具函数（如需要）
5. 在 `examples.ts` 中添加使用示例（如需要） 
