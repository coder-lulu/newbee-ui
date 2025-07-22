# IPAM（IP地址管理）系统 API 文档

## 项目概述

IPAM（IP Address Management）是一个企业级IP地址管理系统，提供网域、网段、IP地址、VLAN等网络资源的全生命周期管理功能。系统基于Go语言和go-zero框架开发，采用微服务架构设计。

### 系统特性
- 支持多网域管理（安全域、业务域、自定义域）
- 完整的IP地址生命周期管理
- 网段和VLAN管理
- IP分配/回收记录追溯
- 在线状态检测和冲突检测
- 与CMDB系统集成

## 服务信息

### 基础信息
- **服务名称**: IPAM API
- **服务地址**: http://192.168.26.130:9302
- **API版本**: v1
- **认证方式**: JWT Token
- **数据格式**: JSON

### 认证配置
```yaml
Auth:
  AccessSecret: jS6VKDtsJf3z1n2VKDtsJf3z1n2
  AccessExpire: 259200  # 3天
```

### 数据库配置
```yaml
Database:
  Type: mysql
  Host: 192.168.26.130
  Port: 3306
  DBName: newbee
```

## 通用数据结构

### 基础响应结构

#### BaseMsgResp - 基础响应
```json
{
  "code": 0,        // 错误代码，0表示成功
  "msg": "success"  // 提示信息
}
```

#### BaseDataInfo - 带数据的响应
```json
{
  "code": 0,
  "msg": "success",
  "data": "..."     // 具体数据内容
}
```

#### BaseListInfo - 列表响应
```json
{
  "total": 100,     // 数据总数
  "data": [...]     // 数据列表
}
```

### 通用请求参数

#### PageInfo - 分页参数
```json
{
  "page": 1,        // 页码，从1开始
  "pageSize": 10    // 每页数据量，最大100000
}
```

#### IDReq - ID请求参数
```json
{
  "id": 1           // 资源ID
}
```

#### IDsReq - 批量ID请求参数
```json
{
  "ids": [1, 2, 3]  // 资源ID数组
}
```

### 基础数据字段

#### BaseIDInfo - 基础ID信息
```json
{
  "id": 1,                    // 资源ID
  "createdAt": 1640995200,    // 创建时间戳
  "updatedAt": 1640995200     // 更新时间戳
}
```

## API 接口详情

### 1. 网域管理 (Domain Management)

网域是IP地址管理的顶层概念，用于划分不同的网络区域（如安全域、业务域等）。

#### 1.1 创建网域

**接口地址**: `POST /ipam_domain/create`

**请求头**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**请求参数**:
```json
{
  "name": "生产环境域",                    // 网域名称，必填
  "type": "业务域",                       // 网域类型：安全域/业务域/自定义
  "cidrRanges": "[\"192.168.1.0/24\", \"10.0.0.0/8\"]",  // 网段范围，JSON格式
  "description": "生产环境网络域",          // 描述信息
  "status": 1                            // 状态：1-正常，2-禁用
}
```

**响应示例**:
```json
{
  "code": 0,
  "msg": "创建成功"
}
```

#### 1.2 更新网域

**接口地址**: `POST /ipam_domain/update`

**请求参数**:
```json
{
  "id": 1,                               // 网域ID，必填
  "name": "生产环境域-更新",
  "type": "业务域",
  "cidrRanges": "[\"192.168.1.0/24\"]",
  "description": "更新后的描述",
  "status": 1
}
```

#### 1.3 删除网域

**接口地址**: `POST /ipam_domain/delete`

**请求参数**:
```json
{
  "ids": [1, 2, 3]  // 要删除的网域ID数组
}
```

#### 1.4 获取网域列表

**接口地址**: `POST /ipam_domain/list`

**请求参数**:
```json
{
  "page": 1,
  "pageSize": 10,
  "name": "生产",          // 可选，按名称模糊查询
  "type": "业务域",        // 可选，按类型筛选
  "status": 1             // 可选，按状态筛选
}
```

**响应示例**:
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total": 5,
    "data": [
      {
        "id": 1,
        "createdAt": 1640995200,
        "updatedAt": 1640995200,
        "status": 1,
        "name": "生产环境域",
        "type": "业务域",
        "cidrRanges": "[\"192.168.1.0/24\", \"10.0.0.0/8\"]",
        "description": "生产环境网络域"
      }
    ]
  }
}
```

#### 1.5 获取网域详情

**接口地址**: `POST /ipam_domain`

**请求参数**:
```json
{
  "id": 1
}
```

**响应示例**:
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "createdAt": 1640995200,
    "updatedAt": 1640995200,
    "status": 1,
    "name": "生产环境域",
    "type": "业务域",
    "cidrRanges": "[\"192.168.1.0/24\", \"10.0.0.0/8\"]",
    "description": "生产环境网络域"
  }
}
```

### 2. 网段管理 (Subnet Management)

网段管理用于管理具体的IP网段，每个网段必须属于某个网域。

#### 2.1 创建网段

**接口地址**: `POST /ipam_subnet/create`

**请求参数**:
```json
{
  "domainId": 1,                         // 所属网域ID，必填
  "cidr": "192.168.1.0/24",             // 网段CIDR，必填
  "vlanId": 100,                        // VLAN ID
  "name": "办公网段",                    // 网段名称
  "gateway": "192.168.1.1",             // 网关地址
  "allocationStrategy": "sequential",    // 分配策略：sequential/random/custom
  "description": "办公区域网段",          // 描述
  "status": 1                           // 状态：1-正常，2-禁用
}
```

#### 2.2 更新网段

**接口地址**: `POST /ipam_subnet/update`

**请求参数**:
```json
{
  "id": 1,                              // 网段ID，必填
  "domainId": 1,
  "cidr": "192.168.1.0/24",
  "vlanId": 100,
  "name": "办公网段-更新",
  "gateway": "192.168.1.1",
  "allocationStrategy": "sequential",
  "description": "更新后的描述",
  "status": 1
}
```

#### 2.3 删除网段

**接口地址**: `POST /ipam_subnet/delete`

**请求参数**:
```json
{
  "ids": [1, 2, 3]
}
```

#### 2.4 获取网段列表

**接口地址**: `POST /ipam_subnet/list`

**请求参数**:
```json
{
  "page": 1,
  "pageSize": 10,
  "domainId": 1,                        // 可选，按网域筛选
  "cidr": "192.168.1",                  // 可选，按CIDR模糊查询
  "vlanId": 100,                        // 可选，按VLAN ID筛选
  "name": "办公",                       // 可选，按名称模糊查询
  "status": 1                           // 可选，按状态筛选
}
```

**响应示例**:
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total": 3,
    "data": [
      {
        "id": 1,
        "createdAt": 1640995200,
        "updatedAt": 1640995200,
        "status": 1,
        "domainId": 1,
        "cidr": "192.168.1.0/24",
        "vlanId": 100,
        "name": "办公网段",
        "gateway": "192.168.1.1",
        "allocationStrategy": "sequential",
        "description": "办公区域网段"
      }
    ]
  }
}
```

#### 2.5 获取网段详情

**接口地址**: `POST /ipam_subnet`

**请求参数**:
```json
{
  "id": 1
}
```

### 3. IP地址管理 (IP Management)

IP地址管理是系统的核心功能，管理具体的IP地址分配、回收和状态。

#### 3.1 创建IP地址

**接口地址**: `POST /ipam_ip/create`

**请求参数**:
```json
{
  "subnetId": 1,                        // 所属网段ID，必填
  "ipAddr": "192.168.1.10",             // IP地址，必填
  "macAddr": "00:11:22:33:44:55",       // MAC地址
  "assetId": 1001,                      // 绑定的资产ID
  "ipStatus": "allocated",              // IP状态：allocated/free/reserved/conflict/recycling
  "onlineStatus": "online",             // 在线状态：online/offline/unknown
  "description": "服务器IP",             // 描述
  "lastPingAt": 1640995200,             // 最后PING时间戳
  "status": 1                           // 状态：1-正常，2-禁用
}
```

#### 3.2 更新IP地址

**接口地址**: `POST /ipam_ip/update`

**请求参数**:
```json
{
  "id": 1,                              // IP记录ID，必填
  "subnetId": 1,
  "ipAddr": "192.168.1.10",
  "macAddr": "00:11:22:33:44:55",
  "assetId": 1001,
  "ipStatus": "allocated",
  "onlineStatus": "online",
  "description": "更新后的描述",
  "lastPingAt": 1640995200,
  "status": 1
}
```

#### 3.3 删除IP地址

**接口地址**: `POST /ipam_ip/delete`

**请求参数**:
```json
{
  "ids": [1, 2, 3]
}
```

#### 3.4 获取IP地址列表

**接口地址**: `POST /ipam_ip/list`

**请求参数**:
```json
{
  "page": 1,
  "pageSize": 10,
  "subnetId": 1,                        // 可选，按网段筛选
  "ipAddr": "192.168.1",                // 可选，按IP地址模糊查询
  "macAddr": "00:11:22",               // 可选，按MAC地址模糊查询
  "assetId": 1001,                      // 可选，按资产ID筛选
  "ipStatus": "allocated",              // 可选，按IP状态筛选
  "onlineStatus": "online",             // 可选，按在线状态筛选
  "status": 1                           // 可选，按状态筛选
}
```

**响应示例**:
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total": 10,
    "data": [
      {
        "id": 1,
        "createdAt": 1640995200,
        "updatedAt": 1640995200,
        "status": 1,
        "subnetId": 1,
        "ipAddr": "192.168.1.10",
        "macAddr": "00:11:22:33:44:55",
        "assetId": 1001,
        "ipStatus": "allocated",
        "onlineStatus": "online",
        "description": "服务器IP",
        "lastPingAt": 1640995200
      }
    ]
  }
}
```

#### 3.5 获取IP地址详情

**接口地址**: `POST /ipam_ip`

**请求参数**:
```json
{
  "id": 1
}
```

### 4. VLAN管理 (VLAN Management)

VLAN管理用于管理虚拟局域网配置。

#### 4.1 创建VLAN

**接口地址**: `POST /ipam_vlan/create`

**请求参数**:
```json
{
  "vlanId": 100,                        // VLAN ID，必填
  "name": "办公VLAN",                   // VLAN名称，必填
  "domainId": 1,                        // 所属网域ID，必填
  "description": "办公区域VLAN",         // 描述
  "status": 1                           // 状态：1-正常，2-禁用
}
```

#### 4.2 更新VLAN

**接口地址**: `POST /ipam_vlan/update`

**请求参数**:
```json
{
  "id": 1,                              // VLAN记录ID，必填
  "vlanId": 100,
  "name": "办公VLAN-更新",
  "domainId": 1,
  "description": "更新后的描述",
  "status": 1
}
```

#### 4.3 删除VLAN

**接口地址**: `POST /ipam_vlan/delete`

**请求参数**:
```json
{
  "ids": [1, 2, 3]
}
```

#### 4.4 获取VLAN列表

**接口地址**: `POST /ipam_vlan/list`

**请求参数**:
```json
{
  "page": 1,
  "pageSize": 10,
  "vlanId": 100,                        // 可选，按VLAN ID筛选
  "name": "办公",                       // 可选，按名称模糊查询
  "domainId": 1,                        // 可选，按网域筛选
  "status": 1                           // 可选，按状态筛选
}
```

**响应示例**:
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total": 5,
    "data": [
      {
        "id": 1,
        "createdAt": 1640995200,
        "updatedAt": 1640995200,
        "status": 1,
        "vlanId": 100,
        "name": "办公VLAN",
        "domainId": 1,
        "description": "办公区域VLAN"
      }
    ]
  }
}
```

#### 4.5 获取VLAN详情

**接口地址**: `POST /ipam_vlan`

**请求参数**:
```json
{
  "id": 1
}
```

### 5. IP操作记录管理 (IP Record Management)

IP操作记录用于追溯IP地址的分配、回收等操作历史。

#### 5.1 创建操作记录

**接口地址**: `POST /ipam_ip_record/create`

**请求参数**:
```json
{
  "ipId": 1,                            // IP记录ID，必填
  "subnetId": 1,                        // 网段ID，必填
  "domainId": 1,                        // 网域ID，必填
  "action": "allocate",                 // 操作类型：allocate/release/batch_allocate/batch_release
  "operator": "admin",                  // 操作人，必填
  "assetId": 1001,                      // 资产ID
  "remark": "分配给服务器使用"            // 备注
}
```

#### 5.2 更新操作记录

**接口地址**: `POST /ipam_ip_record/update`

**请求参数**:
```json
{
  "id": 1,                              // 记录ID，必填
  "ipId": 1,
  "subnetId": 1,
  "domainId": 1,
  "action": "allocate",
  "operator": "admin",
  "assetId": 1001,
  "remark": "更新后的备注"
}
```

#### 5.3 删除操作记录

**接口地址**: `POST /ipam_ip_record/delete`

**请求参数**:
```json
{
  "ids": [1, 2, 3]
}
```

#### 5.4 获取操作记录列表

**接口地址**: `POST /ipam_ip_record/list`

**请求参数**:
```json
{
  "page": 1,
  "pageSize": 10,
  "ipId": 1,                            // 可选，按IP ID筛选
  "subnetId": 1,                        // 可选，按网段筛选
  "domainId": 1,                        // 可选，按网域筛选
  "action": "allocate",                 // 可选，按操作类型筛选
  "operator": "admin",                  // 可选，按操作人筛选
  "assetId": 1001                       // 可选，按资产ID筛选
}
```

**响应示例**:
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total": 20,
    "data": [
      {
        "id": 1,
        "createdAt": 1640995200,
        "updatedAt": 1640995200,
        "ipId": 1,
        "subnetId": 1,
        "domainId": 1,
        "action": "allocate",
        "operator": "admin",
        "assetId": 1001,
        "remark": "分配给服务器使用"
      }
    ]
  }
}
```

#### 5.5 获取操作记录详情

**接口地址**: `POST /ipam_ip_record`

**请求参数**:
```json
{
  "id": 1
}
```

## 数据字典

### 网域类型 (Domain Type)
- `安全域`: 安全相关的网络区域
- `业务域`: 业务相关的网络区域  
- `自定义`: 用户自定义的网络区域

### IP状态 (IP Status)
- `allocated`: 已分配
- `free`: 空闲
- `reserved`: 保留
- `conflict`: 冲突
- `recycling`: 回收中

### 在线状态 (Online Status)
- `online`: 在线
- `offline`: 离线
- `unknown`: 未知

### 分配策略 (Allocation Strategy)
- `sequential`: 顺序分配
- `random`: 随机分配
- `custom`: 自定义分配

### 操作类型 (Action Type)
- `allocate`: 单个分配
- `release`: 单个回收
- `batch_allocate`: 批量分配
- `batch_release`: 批量回收

### 状态码 (Status Code)
- `1`: 正常
- `2`: 禁用

## 错误码说明

### 通用错误码
- `0`: 成功
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

### 业务错误码
- `10001`: 网域不存在
- `10002`: 网段不存在
- `10003`: IP地址不存在
- `10004`: VLAN不存在
- `10005`: IP地址已被分配
- `10006`: IP地址格式错误
- `10007`: CIDR格式错误
- `10008`: MAC地址格式错误
- `10009`: VLAN ID超出范围
- `10010`: 网段范围超出网域限制

## 使用示例

### 1. 完整的IP分配流程

```javascript
// 1. 创建网域
const domainResponse = await fetch('/ipam_domain/create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: '生产环境域',
    type: '业务域',
    cidrRanges: '["192.168.1.0/24"]',
    description: '生产环境网络域',
    status: 1
  })
});

// 2. 创建网段
const subnetResponse = await fetch('/ipam_subnet/create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    domainId: 1,
    cidr: '192.168.1.0/24',
    vlanId: 100,
    name: '办公网段',
    gateway: '192.168.1.1',
    allocationStrategy: 'sequential',
    description: '办公区域网段',
    status: 1
  })
});

// 3. 分配IP地址
const ipResponse = await fetch('/ipam_ip/create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    subnetId: 1,
    ipAddr: '192.168.1.10',
    macAddr: '00:11:22:33:44:55',
    assetId: 1001,
    ipStatus: 'allocated',
    onlineStatus: 'online',
    description: '服务器IP',
    status: 1
  })
});

// 4. 记录操作历史
const recordResponse = await fetch('/ipam_ip_record/create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ipId: 1,
    subnetId: 1,
    domainId: 1,
    action: 'allocate',
    operator: 'admin',
    assetId: 1001,
    remark: '分配给服务器使用'
  })
});
```

### 2. 查询网段下的所有IP

```javascript
const response = await fetch('/ipam_ip/list', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    page: 1,
    pageSize: 50,
    subnetId: 1,
    status: 1
  })
});

const data = await response.json();
console.log('网段IP列表:', data.data.data);
```

### 3. 批量删除IP

```javascript
const response = await fetch('/ipam_ip/delete', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ids: [1, 2, 3, 4, 5]
  })
});
```

## 注意事项

1. **认证要求**: 所有API接口都需要在请求头中携带有效的JWT Token
2. **数据验证**: 系统会对所有输入数据进行严格验证，包括IP地址格式、CIDR格式、MAC地址格式等
3. **关联关系**: 删除网域时会检查是否存在关联的网段，删除网段时会检查是否存在关联的IP地址
4. **状态管理**: 所有资源都支持启用/禁用状态，禁用的资源不会参与业务逻辑
5. **操作审计**: 重要操作建议记录到操作记录表中，便于后续审计追溯

## 扩展功能

系统预留了以下扩展接口，可根据业务需要进行开发：

1. **IP自动发现**: 通过网络扫描自动发现IP使用情况
2. **冲突检测**: 自动检测IP地址冲突并提供解决方案
3. **批量操作**: 支持批量IP分配和回收
4. **统计分析**: 提供网段使用率、IP分配趋势等统计功能
5. **告警通知**: 当IP资源不足或出现冲突时发送告警
6. **与CMDB集成**: 与资产管理系统深度集成，实现IP与资产的自动关联

---

**文档版本**: v1.0  
**最后更新**: 2024年12月  
**维护人员**: IPAM开发团队 