# 发现配置后端存储分析

## 概述

当前端创建发现配置时,数据会存储在**统一输入输出平台(unified-io)**的两个核心表中:
1. **`io_discovery_pools`** - 发现池主表
2. **`io_field_mappings`** - 字段映射表

## 一、发现池表 (io_discovery_pools)

### 1.1 表结构

```sql
CREATE TABLE `io_discovery_pools` (
  -- 基础字段(来自Mixin)
  `id` bigint unsigned PRIMARY KEY AUTO_INCREMENT,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` tinyint NOT NULL DEFAULT 1,
  `tenant_id` bigint unsigned NOT NULL,      -- 租户ID(多租户隔离)
  `department_id` bigint unsigned,            -- 部门ID(数据权限)
  `user_id` bigint unsigned,                  -- 创建者ID
  
  -- 基础信息
  `name` varchar(100) NOT NULL,               -- 发现池名称
  `description` varchar(500),                  -- 描述
  `discovery_type` ENUM('file', 'api', 'sdk', 'builtin') DEFAULT 'file',
  `pool_status` ENUM('active', 'inactive', 'error', 'maintain') DEFAULT 'inactive',
  
  -- 配置信息(JSON格式)
  `discovery_config` JSON,                     -- 发现配置(包含method、parameters、agentId等)
  `field_mapping` JSON,                        -- 字段映射配置
  
  -- 调度配置
  `schedule` varchar(50),                      -- cron表达式
  `batch_size` int DEFAULT 100,
  `concurrent_limit` int DEFAULT 10,
  
  -- 重试配置
  `max_retry` int DEFAULT 3,
  `retry_interval` int DEFAULT 30,
  
  -- 运行统计
  `total_runs` bigint DEFAULT 0,
  `success_runs` bigint DEFAULT 0,
  `failed_runs` bigint DEFAULT 0,
  `last_run_at` timestamp NULL,
  `last_success_at` timestamp NULL,
  `last_error` varchar(1000),
  
  -- 审核流程
  `approval_status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `approved_by` bigint unsigned,
  `approved_at` timestamp NULL,
  `rejection_reason` varchar(500),
  
  -- 模板关联
  `template_id` bigint unsigned,
  
  -- 扩展元数据
  `metadata` JSON,
  
  -- 索引
  UNIQUE KEY `idx_tenant_name` (`tenant_id`, `name`),
  KEY `idx_pool_status` (`pool_status`),
  KEY `idx_discovery_type` (`discovery_type`),
  KEY `idx_approval_status` (`approval_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.2 核心字段说明

#### discovery_config (JSON)
存储发现方式的详细配置,前端配置向导中收集的信息:

```json
{
  "method": "vmware_vcenter",           // 发现方式ID
  "parameters": {                        // 连接参数
    "host": "192.168.1.100",
    "username": "admin",
    "password": "******",
    "port": 443,
    "verifySsl": true,
    "timeout": 30
  },
  "agentId": "agent-001",               // 执行代理ID
  "agentInfo": {                         // 代理详细信息
    "name": "OPS-Agent-01",
    "host": "192.168.1.50",
    "status": "online"
  }
}
```

#### field_mapping (JSON)
存储字段映射关系,支持两种存储方式:

**方式1: 简化存储(直接JSON数组)**
```json
[
  {
    "ciAttributeId": 1,
    "ciAttributeName": "hostname",
    "discoveryFieldName": "name",
    "discoveryFieldLabel": "虚拟机名称",
    "dataType": "string"
  },
  {
    "ciAttributeId": 2,
    "ciAttributeName": "ip_address",
    "discoveryFieldName": "ipAddress",
    "discoveryFieldLabel": "IP地址",
    "dataType": "string"
  }
]
```

**方式2: 关联存储(通过FieldMapping表)**
- 如果映射规则复杂(需要转换、验证),创建独立的FieldMapping记录
- discovery_pool表的field_mapping字段只存储映射ID数组
- 实际映射规则存储在`io_field_mappings`表

#### metadata (JSON)
扩展元数据,存储额外信息:

```json
{
  "typeId": 123,                         // 关联的CI类型ID
  "autoImport": true,                    // 是否自动入库到CMDB
  "createdFrom": "ui",                   // 创建来源
  "importRules": {                       // 入库规则
    "deduplication": true,
    "updateExisting": false
  },
  "notificationConfig": {                // 通知配置
    "onSuccess": ["admin@example.com"],
    "onError": ["ops@example.com"]
  }
}
```

### 1.3 数据流程

```
前端配置向导
    ↓
创建DiscoveryPool记录
    ↓
存储到 io_discovery_pools 表
    ↓
状态: pool_status = 'inactive'
审核: approval_status = 'pending'
    ↓
管理员审核
    ↓
approval_status = 'approved'
    ↓
启用: pool_status = 'active'
    ↓
执行发现任务
    ↓
创建 InputTask 记录
    ↓
数据入发现池
    ↓
(可选) 自动入库到CMDB
```

## 二、字段映射表 (io_field_mappings)

### 2.1 使用场景

当字段映射需要复杂转换时使用独立表存储:

1. **数据类型转换**: string → int, MB → GB
2. **格式转换**: "2024-01-01" → timestamp
3. **值映射**: "Running" → "运行中"
4. **条件映射**: if cpu > 8 then "高配" else "标准"
5. **数据清洗**: trim, normalize, sanitize

### 2.2 表结构核心字段

```sql
CREATE TABLE `io_field_mappings` (
  `id` bigint unsigned PRIMARY KEY,
  `tenant_id` bigint unsigned NOT NULL,
  
  -- 基础信息
  `mapping_name` varchar(100) NOT NULL,
  `mapping_type` ENUM('input', 'output', 'transform', 'validation') DEFAULT 'transform',
  `is_active` boolean DEFAULT true,
  
  -- 源字段
  `source_field` varchar(100) NOT NULL,        -- 源字段名
  `source_field_path` varchar(500),             -- 支持嵌套: "vm.config.hardware.numCPU"
  `source_data_type` ENUM(...) DEFAULT 'string',
  
  -- 目标字段
  `target_field` varchar(100) NOT NULL,        -- 目标字段名
  `target_field_path` varchar(500),
  `target_data_type` ENUM(...) DEFAULT 'string',
  
  -- 转换规则
  `transform_type` ENUM('direct', 'format', 'calculate', 'lookup', 'conditional', 'custom'),
  `transform_config` JSON,                      -- 转换配置
  
  -- 验证规则
  `validation_rules` JSON,
  `validation_regex` varchar(500),
  
  -- 查找表(枚举转换)
  `lookup_table` JSON,
  
  -- 关联
  `discovery_pool_id` bigint unsigned,
  `execution_order` int DEFAULT 100,
  `priority` int DEFAULT 100,
  
  -- 索引
  KEY `idx_discovery_pool` (`discovery_pool_id`, `is_active`, `sort_order`)
);
```

### 2.3 映射示例

#### 示例1: 内存单位转换
```json
{
  "mapping_name": "内存MB转GB",
  "source_field": "memoryMB",
  "source_data_type": "int",
  "target_field": "memory_gb",
  "target_data_type": "float",
  "transform_type": "calculate",
  "transform_config": {
    "formula": "source / 1024",
    "precision": 2
  }
}
```

#### 示例2: 状态值映射
```json
{
  "mapping_name": "电源状态映射",
  "source_field": "powerState",
  "target_field": "status",
  "transform_type": "lookup",
  "lookup_table": {
    "poweredOn": "运行中",
    "poweredOff": "已关机",
    "suspended": "已暂停"
  }
}
```

## 三、API接口分析

### 3.1 创建发现池接口

**端点**: `POST /api/discovery_pool/create`

**请求体**:
```json
{
  "name": "VMware_发现池_1234567890",
  "description": "VMware vCenter自动发现",
  "discoveryType": "api",
  "discoveryConfig": "{\"method\":\"vmware_vcenter\",\"parameters\":{...},\"agentId\":\"agent-001\"}",
  "fieldMapping": "[{\"ciAttributeId\":1,\"discoveryFieldName\":\"name\"}]",
  "batchSize": 100,
  "concurrentLimit": 5,
  "maxRetry": 3,
  "retryInterval": 60,
  "metadata": "{\"typeId\":123,\"autoImport\":true}"
}
```

**响应**:
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1001,
    "name": "VMware_发现池_1234567890",
    "discoveryType": "api",
    "poolStatus": "inactive",
    "approvalStatus": "pending",
    "createdAt": 1234567890,
    ...
  }
}
```

### 3.2 获取发现池列表

**端点**: `POST /api/discovery_pool/list`

**请求体**:
```json
{
  "page": 1,
  "pageSize": 10,
  "poolStatus": "active",
  "discoveryType": "api"
}
```

### 3.3 其他关键接口

- `POST /api/discovery_pool/enable` - 启用发现池
- `POST /api/discovery_pool/disable` - 禁用发现池
- `POST /api/discovery_pool/trigger` - 手动触发执行
- `POST /api/discovery_pool/approve` - 审核发现池
- `GET /api/discovery_pool/stats/:id` - 获取统计信息

## 四、前后端数据映射

### 4.1 前端配置 → 后端存储

| 前端字段 | 后端字段 | 说明 |
|---------|---------|------|
| discoveryForm.method | discovery_config.method | 发现方式ID |
| discoveryForm.parameters | discovery_config.parameters | 连接参数 |
| discoveryForm.agentId | discovery_config.agentId | 代理ID |
| discoveryForm.agentInfo | discovery_config.agentInfo | 代理信息 |
| discoveryForm.mappings | field_mapping | 字段映射数组 |
| discoveryForm.autoImport | metadata.autoImport | 自动入库标志 |
| discoveryForm.poolName | name | 发现池名称 |
| discoveryForm.poolDescription | description | 描述 |
| props.typeId | metadata.typeId | CI类型ID |

### 4.2 JSON序列化说明

前端需要将以下对象序列化为JSON字符串:

```javascript
// 1. discoveryConfig
const discoveryConfigStr = JSON.stringify({
  method: discoveryForm.method?.id,
  parameters: discoveryForm.parameters,
  agentId: discoveryForm.agentId,
  agentInfo: discoveryForm.agentInfo,
});

// 2. fieldMapping
const fieldMappingStr = JSON.stringify(discoveryForm.mappings);

// 3. metadata
const metadataStr = JSON.stringify({
  typeId: props.typeId,
  autoImport: discoveryForm.autoImport,
  createdFrom: 'ui',
});
```

## 五、多租户与权限

### 5.1 多租户隔离

- **tenant_id**: 自动从JWT中提取,确保数据隔离
- **唯一性约束**: 同一租户下,发现池名称必须唯一

### 5.2 数据权限

- **department_id**: 支持部门级数据权限控制
- **user_id**: 记录创建者,用于审计和权限判断

### 5.3 审核流程

1. 创建时: `approval_status = 'pending'`
2. 需要管理员审核才能启用
3. 审核通过: `approval_status = 'approved'`
4. 拒绝: `approval_status = 'rejected'`, 记录拒绝原因

## 六、最佳实践建议

### 6.1 前端调用

```typescript
// 创建发现池
const createDiscoveryPool = async () => {
  const payload = {
    name: discoveryForm.poolName,
    description: discoveryForm.poolDescription,
    discoveryType: discoveryForm.method?.category || 'api',
    discoveryConfig: JSON.stringify({
      method: discoveryForm.method?.id,
      parameters: discoveryForm.parameters,
      agentId: discoveryForm.agentId,
      agentInfo: discoveryForm.agentInfo,
    }),
    fieldMapping: JSON.stringify(discoveryForm.mappings),
    batchSize: 100,
    concurrentLimit: 5,
    maxRetry: 3,
    retryInterval: 60,
    metadata: JSON.stringify({
      typeId: props.typeId,
      autoImport: discoveryForm.autoImport,
      createdFrom: 'ui',
    }),
  };
  
  const response = await fetch('/api/discovery_pool/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  return response.json();
};
```

### 6.2 数据验证

前端应验证:
1. 必填字段完整性
2. JSON格式正确性
3. 数值范围合理性(batchSize > 0, maxRetry >= 0)

### 6.3 错误处理

```typescript
try {
  await createDiscoveryPool();
  message.success('发现池创建成功,等待审核');
} catch (error) {
  if (error.code === 'DUPLICATE_NAME') {
    message.error('发现池名称已存在');
  } else if (error.code === 'INVALID_CONFIG') {
    message.error('配置参数无效');
  } else {
    message.error('创建失败,请重试');
  }
}
```

## 七、总结

**存储位置**: 
- 主表: `io_discovery_pools` (统一输入输出平台)
- 辅助表: `io_field_mappings` (复杂映射规则)

**存储方式**:
- 核心配置: JSON格式存储在`discovery_config`字段
- 字段映射: JSON数组存储在`field_mapping`字段
- 扩展信息: JSON格式存储在`metadata`字段

**关键特性**:
- ✅ 多租户隔离 (tenant_id)
- ✅ 数据权限控制 (department_id)
- ✅ 审核流程 (approval_status)
- ✅ 运行统计 (success_runs, failed_runs)
- ✅ 调度支持 (schedule - cron)
- ✅ 灵活扩展 (metadata JSON)
