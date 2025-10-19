# OPS API 模块

本模块提供OPS运维操作系统的前端API接口，包含命令管理、命令组管理、主机凭证管理和命令执行历史等功能。

## 模块结构

```
ops/
├── command/                # 命令管理
│   ├── index.ts           # API接口
│   └── model.ts           # 数据模型
├── command-group/          # 命令组管理
│   ├── index.ts           # API接口
│   └── model.ts           # 数据模型
├── host-credential/        # 主机凭证管理
│   ├── index.ts           # API接口
│   └── model.ts           # 数据模型
├── exec-history/           # 命令执行历史
│   ├── index.ts           # API接口
│   └── model.ts           # 数据模型
├── index.ts               # 统一导出
└── README.md              # 说明文档
```

## 技术规范

本模块严格遵循项目编码规范：

- ✅ 使用统一的 `ID`, `IDS`, `PageQuery`, `PageResult` 类型
- ✅ API枚举按字母顺序排列
- ✅ 分页查询使用 `PageQuery` + 筛选条件的组合方式
- ✅ 响应统一使用 `PageResult<T>` 类型
- ✅ 函数注释遵循规范格式，参数标明 `(必须)` 或 `(可选)`

## 使用示例

### 1. 命令管理 (OpsCommand)

```typescript
import {
  createOpsCommand,
  getOpsCommandList,
  getOpsCommandById,
  updateOpsCommand,
  deleteOpsCommand,
  searchOpsCommands,
  type CreateOpsCommandRequest,
  type OpsCommandListQuery,
} from '#/api/ops';

import type { PageQuery, PageResult } from '#/api/common';

// 创建命令
const createCommand = async () => {
  const commandData: CreateOpsCommandRequest = {
    status: 1,
    name: '系统更新命令',
    description: '用于系统更新的命令',
    version: '1.0.0',
    commandContent: 'sudo apt update && sudo apt upgrade -y',
    defaultParams: '{}',
    paramSchema: '{}',
    interpreterType: 'bash',
    commandType: 'system',
    commandCategory: 'maintenance',
    defaultTimeoutSeconds: 300,
    requireSudo: true,
    workingDir: '/tmp',
    envVars: '{}',
    requireConfirmation: true,
    outputFormat: 'text',
    accessLevel: 'admin',
    allowedUsers: 'user1,user2',
    allowedRoles: 'admin,operator',
    isApproved: false,
    approvedBy: 'admin_user_id',
    contentChecksum: 'sha256hash',
    validationRules: '{}',
    isDeprecated: false,
    deprecationReason: '',
    replacementCommandId: '',
    groupId: 1,
    tags: [{ key: 'category', value: 'system' }],
    metadata: '{}',
    icon: 'system-update',
    usageExample: '运行系统更新命令',
    notes: '请在维护窗口期间执行',
    retryPolicy: '{}',
    dependencies: '[]',
    extraParams: '{}',
    versionHistory: [
      {
        version: '1.0.0',
        change_log: '初始版本',
        date: Date.now(),
      },
    ],
  };

  await createOpsCommand(commandData);
};

// 分页查询命令列表
const getCommands = async () => {
  const params: PageQuery & OpsCommandListQuery = {
    page: 1,
    pageSize: 20,
    status: 1,
    name: '系统', // 模糊查询
  };

  const response: PageResult<OpsCommand> = await getOpsCommandList(params);
  console.log(response.list);
};

// 搜索命令
const searchCommands = async () => {
  const result = await searchOpsCommands('系统更新');
  console.log(result.list);
};
```

### 2. 命令组管理 (OpsCommandGroup)

```typescript
import {
  createOpsCommandGroup,
  getOpsCommandGroupList,
  getAllActiveOpsCommandGroups,
  type CreateOpsCommandGroupRequest,
  type OpsCommandGroupListQuery,
} from '#/api/ops';

// 创建命令组
const createCommandGroup = async () => {
  const groupData: CreateOpsCommandGroupRequest = {
    status: 1,
    name: '系统管理组',
    description: '系统管理相关命令组',
    category: 'system',
    createdBy: 'admin_user_id',
    accessLevel: 'admin',
    allowedUsers: 'user1,user2',
    allowedRoles: 'admin,operator',
    tags: [{ key: 'type', value: 'system' }],
    metadata: '{}',
    icon: 'folder-system',
    sortOrder: 1,
  };

  await createOpsCommandGroup(groupData);
};

// 分页查询命令组列表
const getGroups = async () => {
  const params: PageQuery & OpsCommandGroupListQuery = {
    page: 1,
    pageSize: 20,
    status: 1,
    category: 'system',
  };

  const response = await getOpsCommandGroupList(params);
  console.log(response.list);
};
```

### 3. 主机凭证管理 (OpsHostCredential)

```typescript
import {
  createOpsHostCredential,
  getOpsHostCredentialList,
  testOpsHostCredential,
  type CreateOpsHostCredentialRequest,
  type OpsHostCredentialTestData,
  type OpsHostCredentialListQuery,
} from '#/api/ops';

// 创建主机凭证
const createCredential = async () => {
  const credentialData: CreateOpsHostCredentialRequest = {
    status: 1,
    name: '生产环境SSH凭证',
    description: '生产环境服务器SSH访问凭证',
    hostPattern: '192.168.1.*',
    username: 'root',
    authType: 'password',
    authData: 'encrypted_password',
    tags: [{ key: 'env', value: 'production' }],
    isDefault: false,
    priority: 10,
  };

  await createOpsHostCredential(credentialData);
};

// 分页查询凭证列表
const getCredentials = async () => {
  const params: PageQuery & OpsHostCredentialListQuery = {
    page: 1,
    pageSize: 20,
    status: 1,
    authType: 'password',
  };

  const response = await getOpsHostCredentialList(params);
  console.log(response.list);
};

// 测试凭证连接
const testCredential = async () => {
  const testData: OpsHostCredentialTestData = {
    hostPattern: '192.168.1.*',
    username: 'root',
    authType: 'password',
    authData: 'encrypted_password',
    testHost: '192.168.1.100',
    testPort: 22,
  };

  await testOpsHostCredential(testData);
};
```

### 4. 命令执行历史 (OpsCommandExecHistory)

```typescript
import {
  getOpsCommandExecHistoryList,
  getOpsCommandExecHistoryStats,
  getOpsCommandExecHistoryByCommandId,
  type OpsCommandExecHistoryListQuery,
} from '#/api/ops';

// 分页查询执行历史列表
const getExecHistory = async () => {
  const params: PageQuery & OpsCommandExecHistoryListQuery = {
    page: 1,
    pageSize: 20,
    commandStatus: 'success',
    userId: 'user_123',
  };

  const response = await getOpsCommandExecHistoryList(params);
  console.log(response.list);
};

// 获取统计信息
const getStats = async () => {
  const stats = await getOpsCommandExecHistoryStats({
    startTime: Date.now() - 7 * 24 * 60 * 60 * 1000, // 最近7天
    endTime: Date.now(),
  });
  
  console.log(`总执行次数: ${stats.totalCount}`);
  console.log(`成功率: ${stats.successRate}%`);
};

// 根据命令ID获取执行历史
const getHistoryByCommand = async () => {
  const response = await getOpsCommandExecHistoryByCommandId('cmd_uuid_123');
  console.log(response.list);
};
```

## 类型定义

### 核心类型

```typescript
import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

// ID: 字符串或数字类型的ID
// IDS: ID数组类型
// PageQuery: 分页查询参数 { page?: number; pageSize?: number }
// PageResult<T>: 分页响应结果 { list: T[]; total: number }
```

### 枚举类型

#### 命令状态
```typescript
import { OpsCommandStatus } from '#/api/ops';

OpsCommandStatus.NORMAL    // 1: 正常
OpsCommandStatus.DISABLED  // 2: 禁用
```

#### 访问级别
```typescript
import { OpsCommandAccessLevel } from '#/api/ops';

OpsCommandAccessLevel.ADMIN     // 'admin'
OpsCommandAccessLevel.OPERATOR  // 'operator'
OpsCommandAccessLevel.USER      // 'user'
```

#### 命令类型
```typescript
import { OpsCommandType } from '#/api/ops';

OpsCommandType.SYSTEM       // 'system'
OpsCommandType.APPLICATION  // 'application'
OpsCommandType.DATABASE     // 'database'
// ... 等等
```

#### 解释器类型
```typescript
import { InterpreterType } from '#/api/ops';

InterpreterType.BASH        // 'bash'
InterpreterType.PYTHON      // 'python'
InterpreterType.POWERSHELL  // 'powershell'
// ... 等等
```

#### 执行状态
```typescript
import { OpsCommandExecStatus } from '#/api/ops';

OpsCommandExecStatus.SUCCESS    // 'success'
OpsCommandExecStatus.FAILED     // 'failed'
OpsCommandExecStatus.RUNNING    // 'running'
OpsCommandExecStatus.TIMEOUT    // 'timeout'
OpsCommandExecStatus.CANCELLED  // 'cancelled'
OpsCommandExecStatus.PENDING    // 'pending'
```

## API规范说明

### 1. 分页查询模式
```typescript
// 使用 PageQuery & XxxListQuery 组合方式
function getXxxList(
  params?: PageQuery & XxxListQuery
): Promise<PageResult<Xxx>>

// 示例
const result = await getOpsCommandList({
  page: 1,
  pageSize: 20,
  status: 1,
  name: 'keyword'
});
```

### 2. API枚举排序
```typescript
enum Api {
  createXxx = '/xxx/create',        // 按字母顺序
  deleteXxx = '/xxx/delete',
  getXxxById = '/xxx',
  getXxxList = '/xxx/list',
  updateXxx = '/xxx/update',
}
```

### 3. 函数注释规范
```typescript
/**
 * 函数说明
 * @param param1 参数1说明 (必须)
 * @param param2 参数2说明 (可选)
 * @returns 返回值说明
 */
export function functionName(param1: Type1, param2?: Type2): ReturnType
```

## 错误处理

所有API调用都使用统一的错误处理机制：

```typescript
try {
  const result = await createOpsCommand(commandData);
  console.log('创建成功');
} catch (error) {
  console.error('创建失败:', error.message);
}
```

## 注意事项

1. 所有接口都需要JWT认证
2. 敏感数据（如密码）在传输前需要加密
3. 分页查询的pageSize建议范围：1-1000
4. 时间字段使用Unix时间戳（秒）
5. JSON字段需要使用字符串格式传输
6. ID字段统一使用 `ID` 类型（支持字符串或数字）
7. 批量操作的ID列表使用 `IDS` 类型
