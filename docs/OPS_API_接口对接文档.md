# OPS API 接口对接文档

> **Version**: 1.0  
> **Last Update**: 2024-12-20  
> **Author**: @system  

## 文档概述

本文档提供OPS运维操作系统的所有API接口的详细对接说明，包括命令管理、命令组管理、主机凭证管理和命令执行历史等模块。

## 认证说明

所有接口都需要JWT认证，在请求头中包含Authorization字段：
```
Authorization: Bearer <JWT_TOKEN>
```

## 响应格式说明

### 基础响应格式

#### 成功响应（无数据）
```json
{
    "code": 0,
    "msg": "操作成功"
}
```

#### 成功响应（有数据）
```json
{
    "code": 0,
    "msg": "操作成功",
    "data": {
        // 具体数据内容
    }
}
```

#### 列表响应格式
```json
{
    "code": 0,
    "msg": "操作成功",
    "data": {
        "total": 100,
        "data": [
            // 列表数据项
        ]
    }
}
```

#### 错误响应
```json
{
    "code": 错误代码,
    "msg": "错误信息"
}
```

### 分页参数
```json
{
    "page": 1,       // 页码，必填，大于0
    "pageSize": 20   // 每页大小，必填，小于100000
}
```

### 基础ID信息
```json
{
    "id": 1,                    // ID
    "createdAt": 1703000000,    // 创建时间戳
    "updatedAt": 1703000000     // 更新时间戳
}
```

---

## 1. 命令管理接口 (OpsCommand)

### 1.1 创建命令

**接口路径**: `POST /ops_command/create`

**请求参数**: 
```json
{
    "status": 1,                        // 状态 1:正常 2:禁用
    "name": "系统更新命令",                // 命令名称
    "description": "用于系统更新的命令",     // 命令描述
    "version": "1.0.0",                 // 命令版本（语义化版本）
    "commandContent": "sudo apt update && sudo apt upgrade -y",  // 命令内容
    "defaultParams": "{}",              // 默认参数配置（JSON格式）
    "paramSchema": "{}",                // 参数验证规则（JSON Schema）
    "interpreterType": "bash",          // 解释器类型
    "commandType": "system",            // 命令类型
    "commandCategory": "maintenance",   // 命令分类
    "defaultTimeoutSeconds": 300,       // 默认超时时间（秒）
    "requireSudo": true,                // 是否需要sudo权限
    "workingDir": "/tmp",               // 默认工作目录
    "envVars": "{}",                    // 默认环境变量（JSON格式）
    "requireConfirmation": true,        // 是否需要执行确认
    "outputFormat": "text",             // 默认输出格式
    "accessLevel": "admin",             // 访问级别
    "allowedUsers": "user1,user2",      // 允许使用的用户ID列表
    "allowedRoles": "admin,operator",   // 允许使用的角色列表
    "isApproved": false,                // 是否已审核通过
    "approvedBy": "admin_user_id",      // 审核者ID
    "approvedAt": 1703000000,           // 审核时间戳
    "contentChecksum": "sha256hash",    // 命令内容校验和
    "validationRules": "{}",            // 验证规则（JSON格式）
    "isDeprecated": false,              // 是否已废弃
    "deprecationReason": "",            // 废弃原因
    "replacementCommandId": "",         // 替代命令ID
    "groupId": 1,                       // 所属命令组ID
    "tags": [                           // 标签信息
        {
            "key": "category",
            "value": "system"
        }
    ],
    "metadata": "{}",                   // 扩展元数据（JSON格式）
    "icon": "system-update",            // 图标标识
    "usageExample": "运行系统更新命令",    // 使用示例
    "notes": "请在维护窗口期间执行",       // 备注说明
    "retryPolicy": "{}",                // 重试策略（JSON格式）
    "dependencies": "[]",               // 依赖命令（JSON数组）
    "extraParams": "{}",                // 额外参数配置（JSON格式）
    "versionHistory": [                 // 版本历史记录
        {
            "version": "1.0.0",
            "change_log": "初始版本",
            "date": 1703000000
        }
    ]
}
```

**返回结果**: 
```json
{
    "code": 0,
    "msg": "命令创建成功"
}
```

### 1.2 更新命令

**接口路径**: `POST /ops_command/update`

**请求参数**: 与创建命令相同，需要包含id字段
```json
{
    "id": 1,                           // 必填：命令ID
    // ... 其他字段与创建相同
}
```

**返回结果**: 
```json
{
    "code": 0,
    "msg": "命令更新成功"
}
```

### 1.3 删除命令

**接口路径**: `POST /ops_command/delete`

**请求参数**: 
```json
{
    "ids": [1, 2, 3]  // 要删除的命令ID数组
}
```

**返回结果**: 
```json
{
    "code": 0,
    "msg": "命令删除成功"
}
```

### 1.4 获取命令列表

**接口路径**: `POST /ops_command/list`

**请求参数**: 
```json
{
    "page": 1,                          // 页码
    "pageSize": 20,                     // 每页大小
    "createdAt": 1703000000,            // 创建时间筛选（可选）
    "updatedAt": 1703000000,            // 更新时间筛选（可选）
    "status": 1,                        // 状态筛选（可选）
    "name": "系统",                      // 名称模糊查询（可选）
    "description": "更新",               // 描述模糊查询（可选）
    "version": "1.0.0",                 // 版本筛选（可选）
    "commandType": "system",            // 命令类型筛选（可选）
    "commandCategory": "maintenance",   // 命令分类筛选（可选）
    "interpreterType": "bash",          // 解释器类型筛选（可选）
    "requireSudo": true,                // 是否需要sudo筛选（可选）
    "isApproved": true,                 // 审核状态筛选（可选）
    "isDeprecated": false,              // 废弃状态筛选（可选）
    "groupId": 1,                       // 命令组ID筛选（可选）
    "accessLevel": "admin"              // 访问级别筛选（可选）
}
```

**返回结果**: 
```json
{
    "code": 0,
    "msg": "获取成功",
    "data": {
        "total": 100,
        "data": [
            {
                "id": 1,
                "createdAt": 1703000000,
                "updatedAt": 1703000000,
                "status": 1,
                "name": "系统更新命令",
                "description": "用于系统更新的命令",
                "version": "1.0.0",
                "commandContent": "sudo apt update && sudo apt upgrade -y",
                // ... 其他所有字段
            }
        ]
    }
}
```

### 1.5 通过ID获取命令

**接口路径**: `POST /ops_command`

**请求参数**: 
```json
{
    "id": 1  // 命令ID
}
```

**返回结果**: 
```json
{
    "code": 0,
    "msg": "获取成功",
    "data": {
        "id": 1,
        "createdAt": 1703000000,
        "updatedAt": 1703000000,
        "status": 1,
        "name": "系统更新命令",
        "description": "用于系统更新的命令",
        // ... 所有命令详细信息
    }
}
```

---

## 2. 命令组管理接口 (OpsCommandGroup)

### 2.1 创建命令组

**接口路径**: `POST /ops_command_group/create`

**请求参数**: 
```json
{
    "status": 1,                        // 状态 1:正常 2:禁用
    "name": "系统管理组",                 // 命令组名称
    "description": "系统管理相关命令组",   // 命令组描述
    "category": "system",               // 命令组分类
    "createdBy": "admin_user_id",       // 创建者ID
    "accessLevel": "admin",             // 访问级别
    "allowedUsers": "user1,user2",      // 允许使用的用户ID列表
    "allowedRoles": "admin,operator",   // 允许使用的角色列表
    "tags": [                           // 标签信息
        {
            "key": "type",
            "value": "system"
        }
    ],
    "metadata": "{}",                   // 扩展元数据（JSON格式）
    "icon": "folder-system",            // 图标标识
    "sortOrder": 1                      // 排序顺序
}
```

**返回结果**: 
```json
{
    "code": 0,
    "msg": "命令组创建成功"
}
```

### 2.2 更新命令组

**接口路径**: `POST /ops_command_group/update`

**请求参数**: 与创建命令组相同，需要包含id字段

### 2.3 删除命令组

**接口路径**: `POST /ops_command_group/delete`

**请求参数**: 
```json
{
    "ids": [1, 2, 3]  // 要删除的命令组ID数组
}
```

### 2.4 获取命令组列表

**接口路径**: `POST /ops_command_group/list`

**请求参数**: 
```json
{
    "page": 1,                      // 页码
    "pageSize": 20,                 // 每页大小
    "status": 1,                    // 状态筛选（可选）
    "name": "系统",                  // 名称模糊查询（可选）
    "category": "system",           // 分类筛选（可选）
    "createdBy": "admin_user_id",   // 创建者筛选（可选）
    "accessLevel": "admin"          // 访问级别筛选（可选）
}
```

**返回结果**: 
```json
{
    "code": 0,
    "msg": "获取成功",
    "data": {
        "total": 50,
        "data": [
            {
                "id": 1,
                "createdAt": 1703000000,
                "updatedAt": 1703000000,
                "status": 1,
                "name": "系统管理组",
                "description": "系统管理相关命令组",
                "category": "system",
                // ... 其他所有字段
            }
        ]
    }
}
```

### 2.5 通过ID获取命令组

**接口路径**: `POST /ops_command_group`

**请求参数**: 
```json
{
    "id": 1  // 命令组ID
}
```

---

## 3. 主机凭证管理接口 (OpsHostCredential)

### 3.1 创建主机凭证

**接口路径**: `POST /ops_host_credential/create`

**请求参数**: 
```json
{
    "status": 1,                        // 状态 1:正常 2:禁用
    "name": "生产环境SSH凭证",            // 凭据名称
    "description": "生产环境服务器SSH访问凭证",  // 凭据描述
    "hostPattern": "192.168.1.*",       // 主机匹配模式（支持通配符）
    "username": "root",                 // 用户名
    "authType": "password",             // 认证方式：password/key/mixed
    "authData": "encrypted_password",   // 认证数据（加密存储）
    "tags": [                           // 标签
        {
            "key": "env",
            "value": "production"
        }
    ],
    "isDefault": false,                 // 是否为默认凭据
    "priority": 10                      // 优先级（数字越大优先级越高）
}
```

**返回结果**: 
```json
{
    "code": 0,
    "msg": "主机凭证创建成功"
}
```

### 3.2 更新主机凭证

**接口路径**: `POST /ops_host_credential/update`

**请求参数**: 与创建主机凭证相同，需要包含id字段

### 3.3 删除主机凭证

**接口路径**: `POST /ops_host_credential/delete`

**请求参数**: 
```json
{
    "ids": [1, 2, 3]  // 要删除的凭证ID数组
}
```

### 3.4 获取主机凭证列表

**接口路径**: `POST /ops_host_credential/list`

**请求参数**: 
```json
{
    "page": 1,                      // 页码
    "pageSize": 20,                 // 每页大小
    "status": 1,                    // 状态筛选（可选）
    "name": "SSH",                  // 名称模糊查询（可选）
    "hostPattern": "192.168.",      // 主机模式筛选（可选）
    "username": "root",             // 用户名筛选（可选）
    "authType": "password",         // 认证方式筛选（可选）
    "isDefault": false              // 是否默认筛选（可选）
}
```

**返回结果**: 
```json
{
    "code": 0,
    "msg": "获取成功",
    "data": {
        "total": 30,
        "data": [
            {
                "id": 1,
                "createdAt": 1703000000,
                "updatedAt": 1703000000,
                "status": 1,
                "name": "生产环境SSH凭证",
                "description": "生产环境服务器SSH访问凭证",
                "hostPattern": "192.168.1.*",
                "username": "root",
                "authType": "password",
                "authData": "encrypted_password",
                // ... 其他所有字段
            }
        ]
    }
}
```

### 3.5 通过ID获取主机凭证

**接口路径**: `POST /ops_host_credential`

**请求参数**: 
```json
{
    "id": 1  // 凭证ID
}
```

---

## 4. 命令执行历史接口 (OpsCommandExecHistory)

### 4.1 创建执行历史记录

**接口路径**: `POST /ops_command_exec_history/create`

**请求参数**: 
```json
{
    "status": 1,                        // 状态 1:正常 2:禁用
    "commandId": "cmd_uuid_123",        // 命令ID
    "commandName": "系统更新命令",        // 命令名称
    "commandVersion": "1.0.0",          // 命令版本
    "commandParams": "{}",              // 命令参数（JSON格式）
    "commandResult": "更新完成，共更新了15个包",  // 命令结果
    "commandStatus": "success",         // 命令状态：success/failed/running/timeout
    "userId": "user_123",               // 执行用户ID
    "sessionId": "session_456",         // 用户会话ID
    "correlationId": "trace_789",       // 跨服务追踪ID
    "workflowId": "workflow_001",       // 工作流ID
    "batchId": "batch_202312",          // 批次ID（用于批量执行）
    "hostRef": "host_cmdb_001",         // 目标主机引用（CMDB主机ID）
    "credentialRef": "cred_001",        // 使用的凭据引用ID
    "targetHost": "192.168.1.100",      // 实际目标主机IP
    "targetPort": 22                    // 实际目标端口
}
```

**返回结果**: 
```json
{
    "code": 0,
    "msg": "执行历史记录创建成功"
}
```

### 4.2 更新执行历史记录

**接口路径**: `POST /ops_command_exec_history/update`

**请求参数**: 与创建执行历史记录相同，需要包含id字段

### 4.3 删除执行历史记录

**接口路径**: `POST /ops_command_exec_history/delete`

**请求参数**: 
```json
{
    "ids": [1, 2, 3]  // 要删除的执行历史记录ID数组
}
```

### 4.4 获取执行历史列表

**接口路径**: `POST /ops_command_exec_history/list`

**请求参数**: 
```json
{
    "page": 1,                          // 页码
    "pageSize": 20,                     // 每页大小
    "createdAt": 1703000000,            // 创建时间筛选（可选）
    "status": 1,                        // 状态筛选（可选）
    "commandId": "cmd_uuid_123",        // 命令ID筛选（可选）
    "commandName": "系统更新",           // 命令名称模糊查询（可选）
    "commandStatus": "success",         // 命令状态筛选（可选）
    "userId": "user_123",               // 用户ID筛选（可选）
    "sessionId": "session_456",         // 会话ID筛选（可选）
    "workflowId": "workflow_001",       // 工作流ID筛选（可选）
    "batchId": "batch_202312",          // 批次ID筛选（可选）
    "hostRef": "host_cmdb_001",         // 主机引用筛选（可选）
    "targetHost": "192.168.1.100"       // 目标主机IP筛选（可选）
}
```

**返回结果**: 
```json
{
    "code": 0,
    "msg": "获取成功",
    "data": {
        "total": 200,
        "data": [
            {
                "id": 1,
                "createdAt": 1703000000,
                "updatedAt": 1703000000,
                "status": 1,
                "commandId": "cmd_uuid_123",
                "commandName": "系统更新命令",
                "commandVersion": "1.0.0",
                "commandParams": "{}",
                "commandResult": "更新完成，共更新了15个包",
                "commandStatus": "success",
                "userId": "user_123",
                "sessionId": "session_456",
                "correlationId": "trace_789",
                "workflowId": "workflow_001",
                "batchId": "batch_202312",
                "hostRef": "host_cmdb_001",
                "credentialRef": "cred_001",
                "targetHost": "192.168.1.100",
                "targetPort": 22
            }
        ]
    }
}
```

### 4.5 通过ID获取执行历史记录

**接口路径**: `POST /ops_command_exec_history`

**请求参数**: 
```json
{
    "id": 1  // 执行历史记录ID
}
```

---

## 5. 数据模型说明

### 5.1 OpsCommandTag 标签模型
```json
{
    "key": "标签键",      // 字符串类型
    "value": "标签值"     // 字符串类型
}
```

### 5.2 OpsCommandVersionHistory 版本历史模型
```json
{
    "version": "1.0.0",           // 版本号（字符串）
    "change_log": "版本变更说明",  // 变更日志（字符串）
    "date": 1703000000            // 变更时间戳（可选）
}
```

### 5.3 OpsCommandGroupTag 命令组标签模型
```json
{
    "key": "标签键",      // 字符串类型
    "value": "标签值"     // 字符串类型
}
```

### 5.4 OpsHostCredentialTag 主机凭证标签模型
```json
{
    "key": "标签键",      // 字符串类型
    "value": "标签值"     // 字符串类型
}
```

---

## 6. 错误代码说明

| 错误代码 | 说明 |
|---------|------|
| 0 | 操作成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（Token无效或过期） |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 1001 | 命令名称已存在 |
| 1002 | 命令组不存在 |
| 1003 | 主机凭证配置错误 |
| 1004 | 命令执行超时 |

---

## 7. 注意事项

1. **认证要求**: 所有接口都需要JWT认证
2. **权限控制**: 根据用户角色和命令配置的访问级别进行权限验证
3. **数据安全**: 敏感数据（如密码、私钥）会进行加密存储
4. **参数验证**: 所有输入参数都会进行严格验证
5. **审计日志**: 重要操作会记录到审计日志中
6. **时间戳**: 所有时间字段使用Unix时间戳（秒）
7. **分页限制**: 单次查询最大返回100000条记录

---

## 8. 使用示例

### 8.1 创建一个简单的系统命令

```bash
curl -X POST "https://api.example.com/ops_command/create" \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{
    "status": 1,
    "name": "查看磁盘使用情况",
    "description": "查看系统磁盘使用情况",
    "version": "1.0.0",
    "commandContent": "df -h",
    "interpreterType": "bash",
    "commandType": "query",
    "commandCategory": "system",
    "defaultTimeoutSeconds": 30,
    "requireSudo": false,
    "accessLevel": "user"
}'
```

### 8.2 查询命令执行历史

```bash
curl -X POST "https://api.example.com/ops_command_exec_history/list" \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{
    "page": 1,
    "pageSize": 10,
    "commandStatus": "success",
    "userId": "user_123"
}'
```

---

## 联系方式

如有疑问或需要技术支持，请联系运维团队。

文档最后更新时间：2024-12-20 