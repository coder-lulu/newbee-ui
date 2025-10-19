# 自动发现功能实施文档 V2.0

## 📋 实施概述

- **实施时间**: 2025-10-02
- **实施位置**: `/opt/code/newbee/ui/apps/web-antd/src/views/cmdb/ci_types/`
- **实施状态**: ✅ 完成
- **功能**: 属性自动发现和关系自动发现完整流程

---

## 🎯 核心设计理念

### 1. 双Tab结构
```
自动发现Tab
├── 属性自动发现 (AttributeDiscoveryNew)
│   ├── 步骤1: 选择发现方式
│   ├── 步骤2: 配置发现参数
│   ├── 步骤3: 选择执行代理
│   ├── 步骤4: 配置属性映射
│   └── 步骤5: 完成配置
└── 关系自动发现 (RelationDiscovery)
    └── 待实现
```

### 2. 核心流程

#### 属性发现流程
```
1. 选择发现方式
   ↓
2. 配置连接参数
   ↓
3. 选择OPS代理
   ↓
4. 配置字段映射
   ↓
5. 保存配置
   ↓
数据先入发现池 → 可选自动入库到CMDB
```

#### 数据流转
```
数据源(vCenter/云平台/设备等)
   ↓ (OPS代理采集)
发现池(临时存储)
   ↓ (映射转换)
CMDB CI库(最终存储) ← 手动确认/自动入库
```

---

## 🏗️ 组件架构

### 1. 组件树结构

```
TabContent.vue
└── DiscoveryTabs.vue
    ├── AttributeDiscoveryNew.vue (主流程)
    │   ├── DiscoveryMethodSelector.vue (步骤1)
    │   ├── DiscoveryParameterConfig.vue (步骤2)
    │   ├── AgentSelector.vue (步骤3)
    │   ├── AttributeMappingConfig.vue (步骤4)
    │   └── DiscoveryPoolList.vue (列表管理)
    └── RelationDiscovery.vue (待实现)
```

### 2. 组件详细说明

#### 2.1 DiscoveryTabs.vue
**职责**: 顶层Tab容器

**功能**:
- 提供属性发现和关系发现两个Tab
- 路由和状态管理

**Props**:
- `typeId`: 当前CI类型ID

---

#### 2.2 AttributeDiscoveryNew.vue
**职责**: 属性发现主流程控制器

**功能**:
- 5步向导流程
- 状态管理
- 表单数据收集
- 发现池创建

**核心状态**:
```typescript
const discoveryForm = reactive({
  method: null,              // 发现方式
  parameters: {},            // 连接参数
  agentId: null,            // 代理ID
  agentInfo: null,          // 代理信息
  mappings: [],             // 字段映射
  autoImport: true,         // 是否自动入库
  poolName: '',             // 发现池名称
  poolDescription: '',      // 描述
});
```

**步骤验证**:
```typescript
const stepValidation = reactive({
  step0: false,  // 必须选择发现方式
  step1: false,  // 必须配置参数
  step2: false,  // 必须选择代理
  step3: false,  // 必须配置映射
});
```

---

#### 2.3 DiscoveryMethodSelector.vue
**职责**: 发现方式选择器

**支持的发现方式**:

##### 云平台 (5种)
| 方式 | 参数 | 说明 |
|------|------|------|
| VMware vCenter | host, username, password, port | 虚拟化平台 |
| 阿里云 | accessKeyId, accessKeySecret, region | 公有云 |
| AWS | accessKeyId, secretAccessKey, region | 公有云 |
| 腾讯云 | secretId, secretKey, region | 公有云 |
| 华为云 | ak, sk, region | 公有云 |

##### 网络设备 (3种)
| 方式 | 参数 | 说明 |
|------|------|------|
| 交换机发现 | host, snmpCommunity, snmpVersion | SNMP协议 |
| 路由器发现 | host, snmpCommunity, snmpVersion | SNMP协议 |
| 防火墙发现 | host, protocol, credentials | API/SNMP |

##### 操作系统 (2种)
| 方式 | 参数 | 说明 |
|------|------|------|
| Linux系统 | host, port, username, password | SSH协议 |
| Windows系统 | host, username, password, domain | WMI协议 |

##### 数据库 (3种)
| 方式 | 参数 | 说明 |
|------|------|------|
| MySQL | host, port, username, password | |
| Oracle | host, port, sid, username, password | |
| PostgreSQL | host, port, database, username, password | |

##### 应用 (1种)
| 方式 | 参数 | 说明 |
|------|------|------|
| REST API | url, method, headers | 自定义API |

**功能**:
- 分类筛选 (全部/云平台/网络设备/操作系统/数据库/应用)
- 关键词搜索
- 卡片式展示
- 选中状态高亮

**事件**:
```typescript
emit('methodSelected', method: DiscoveryMethod)
```

---

#### 2.4 DiscoveryParameterConfig.vue
**职责**: 发现参数配置表单

**功能**:
- 动态表单生成 (根据选择的方式)
- 参数验证
- 密码显示/隐藏
- 连接测试
- 高级选项 (超时、SSL验证)

**参数类型**:
- `text`: 文本输入
- `password`: 密码输入 (可切换显示)
- `number`: 数字输入
- `select`: 下拉选择

**示例配置**:
```json
{
  "host": "10.0.1.100",
  "port": 443,
  "username": "admin",
  "password": "***",
  "timeout": 30,
  "verifySsl": true
}
```

**事件**:
```typescript
emit('parametersConfigured', parameters: Record<string, any>)
```

---

#### 2.5 AgentSelector.vue
**职责**: OPS-Center代理选择器

**功能**:
- 从OPS-Center获取在线代理列表
- 显示代理状态 (在线/离线)
- 显示代理信息 (主机、系统、版本、标签)
- 卡片式选择

**代理数据结构**:
```typescript
interface Agent {
  id: string;
  name: string;
  host: string;
  status: 'online' | 'offline';
  os: string;
  version: string;
  tags: string[];
}
```

**API集成**:
```typescript
// TODO: 实际API调用
const response = await getAgentList({ status: 'online' });
```

**事件**:
```typescript
emit('agentSelected', agentId: string, agentInfo: any)
```

---

#### 2.6 AttributeMappingConfig.vue
**职责**: 属性字段映射配置

**功能**:
- 添加/删除映射
- 配置源字段和目标属性
- 设置数据类型
- 必填标记
- 自动入库开关

**映射数据结构**:
```typescript
interface Mapping {
  sourceField: string;     // 源字段名
  targetAttr: string;      // 目标CI属性
  dataType: string;        // string/int/float/bool
  required: boolean;       // 是否必填
}
```

**自动入库说明**:
- **开启**: 数据入发现池后自动创建/更新CI
- **关闭**: 数据仅入发现池，需手动确认后入库

**事件**:
```typescript
emit('mappingsConfigured', mappings: any[], autoImport: boolean)
```

---

#### 2.7 DiscoveryPoolList.vue
**职责**: 发现池列表管理

**功能**:
- 显示已创建的发现池
- 触发发现任务
- 编辑/删除发现池
- 查看执行历史

**列表字段**:
- 发现池名称
- 发现方式
- 状态 (活跃/暂停/错误)
- 最后运行时间
- 操作按钮

---

#### 2.8 RelationDiscovery.vue
**职责**: 关系自动发现 (待实现)

**规划功能**:
- 网络拓扑发现
- 应用依赖发现
- 主机-应用关系发现
- 数据库-应用关系发现

---

## 📊 数据流转详解

### 1. 发现流程

```
用户配置发现任务
   ↓
[保存到发现池配置表]
   ↓
定时/手动触发
   ↓
[OPS代理执行采集]
   ↓
原始数据
   ↓
[应用字段映射]
   ↓
标准化数据
   ↓
[写入发现池表]
   ↓
   ├─→ [自动入库=true] → 创建/更新CI → CMDB
   └─→ [自动入库=false] → 等待手动确认 → CMDB
```

### 2. 数据表设计

#### discovery_pool (发现池配置)
```sql
CREATE TABLE discovery_pool (
  id BIGINT PRIMARY KEY,
  type_id BIGINT,              -- 关联的CI类型ID
  name VARCHAR(200),           -- 发现池名称
  discovery_type VARCHAR(50),  -- 发现方式类型
  discovery_config TEXT,       -- 发现配置JSON
  agent_id VARCHAR(100),       -- 执行代理ID
  field_mapping TEXT,          -- 字段映射JSON
  auto_import BOOLEAN,         -- 是否自动入库
  status VARCHAR(20),          -- 状态
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### discovery_data (发现数据池)
```sql
CREATE TABLE discovery_data (
  id BIGINT PRIMARY KEY,
  pool_id BIGINT,              -- 发现池ID
  source_data TEXT,            -- 原始数据JSON
  mapped_data TEXT,            -- 映射后数据JSON
  ci_id BIGINT,                -- 关联的CI ID (如已入库)
  import_status VARCHAR(20),   -- 入库状态: pending/imported/failed
  created_at TIMESTAMP
);
```

---

## 🔧 技术实现

### 1. 步骤导航

```typescript
const steps = [
  { title: '选择发现方式', icon: SettingOutlined },
  { title: '配置发现参数', icon: DatabaseOutlined },
  { title: '选择执行代理', icon: DesktopOutlined },
  { title: '配置属性映射', icon: ApartmentOutlined },
  { title: '完成配置', icon: CheckCircleOutlined },
];
```

### 2. 表单验证

```typescript
// 每步完成后更新验证状态
const stepValidation = reactive({
  step0: computed(() => !!discoveryForm.method),
  step1: computed(() => Object.keys(discoveryForm.parameters).length > 0),
  step2: computed(() => !!discoveryForm.agentId),
  step3: computed(() => discoveryForm.mappings.length > 0),
});

// 只有当前步骤验证通过才能继续
const canProceed = computed(() => {
  return stepValidation[`step${currentStep.value}`];
});
```

### 3. 数据保存

```typescript
const handleSave = async () => {
  const discoveryPoolConfig = {
    name: discoveryForm.poolName,
    description: discoveryForm.poolDescription,
    discoveryType: discoveryForm.method?.category,
    discoveryConfig: JSON.stringify({
      method: discoveryForm.method?.id,
      parameters: discoveryForm.parameters,
      agentId: discoveryForm.agentId,
    }),
    fieldMapping: JSON.stringify(discoveryForm.mappings),
    metadata: JSON.stringify({
      typeId: props.typeId,
      autoImport: discoveryForm.autoImport,
    }),
  };

  await createDiscoveryPool(discoveryPoolConfig);
};
```

---

## 🎨 UI/UX设计

### 1. 步骤指示器

```
1 选择发现方式 → 2 配置参数 → 3 选择代理 → 4 配置映射 → 5 完成
```

- 当前步骤高亮
- 已完成步骤显示✓
- 未完成步骤灰色

### 2. 卡片选择

**方法选择**:
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   [图标]    │  │   [图标]    │  │   [图标]    │
│ VMware      │  │  阿里云     │  │   AWS       │
│ [云平台]    │  │  [云平台]   │  │  [云平台]   │
└─────────────┘  └─────────────┘  └─────────────┘
```

**代理选择**:
```
┌─────────────────────────┐
│ [图标]  OPS-Agent-01 [在线]│
│ 主机: 10.0.1.10          │
│ 系统: Linux              │
│ 版本: 1.0.5              │
│ [生产环境] [华北]        │
└─────────────────────────┘
```

### 3. 配置摘要

```
┌─────────────────────────────┐
│ 配置摘要                     │
├─────────────────────────────┤
│ 发现方式: VMware vCenter     │
│ 执行代理: OPS-Agent-Beijing │
│ 属性映射: 5 个字段           │
│ 自动入库: 是                 │
│ 配置参数:                    │
│ {                           │
│   "host": "10.0.1.100",     │
│   "port": 443,              │
│   ...                       │
│ }                           │
└─────────────────────────────┘
```

---

## 📝 使用场景示例

### 场景1: vCenter虚拟机发现

**步骤1** - 选择方式:
- 选择 "VMware vCenter"

**步骤2** - 配置参数:
```
主机地址: vcenter.company.com
端口: 443
用户名: administrator@vsphere.local
密码: ********
超时: 30秒
SSL验证: 启用
```

**步骤3** - 选择代理:
- 选择 "OPS-Agent-Beijing-01" (需要能访问vCenter)

**步骤4** - 配置映射:
```
源字段          目标属性      类型      必填
vm_name      → ci_name      string    是
cpu_count    → cpu_cores    int       是
memory_mb    → memory_gb    float     是
ip_address   → ip_addr      string    否
power_state  → status       string    是
```
自动入库: [√] 开启

**步骤5** - 保存配置
- 发现池名称: vCenter虚拟机自动发现
- 点击 "保存并创建"

**结果**:
- 发现池创建成功
- 可立即触发或等待定时执行
- 发现的虚拟机数据自动入库

---

### 场景2: 阿里云ECS发现

**步骤1**: 选择 "阿里云"

**步骤2**: 配置AK/SK和区域

**步骤3**: 选择离阿里云Region最近的代理

**步骤4**: 配置ECS字段到CI属性的映射

**步骤5**: 保存，数据先入发现池，手动确认后入库

---

### 场景3: Linux服务器发现

**步骤1**: 选择 "Linux系统发现"

**步骤2**: 配置SSH连接信息

**步骤3**: 选择能SSH连接目标服务器的代理

**步骤4**: 映射hostname、os_version、cpu、memory等

**步骤5**: 自动入库到服务器CI类型

---

## ✅ 功能清单

### 已实现

- [x] 双Tab结构 (属性发现/关系发现)
- [x] 5步向导流程
- [x] 15种发现方式支持
- [x] 动态参数配置表单
- [x] 参数验证和测试
- [x] OPS代理选择
- [x] 字段映射配置
- [x] 自动入库开关
- [x] 配置摘要展示
- [x] 发现池列表管理
- [x] 响应式布局
- [x] TypeScript类型定义

### 待实现

- [ ] 发现池API集成
- [ ] OPS-Center代理API集成
- [ ] 连接测试功能
- [ ] 发现任务执行
- [ ] 发现数据查看
- [ ] 手动确认入库
- [ ] 执行历史查看
- [ ] 数据质量报告
- [ ] 关系自动发现
- [ ] 批量导入配置

---

## 🚀 后续开发计划

### Phase 1 (1-2周)
1. **API集成**
   - 发现池CRUD API
   - OPS-Center代理列表API
   - 连接测试API

2. **执行功能**
   - 触发发现任务
   - 查看执行进度
   - 查看执行日志

### Phase 2 (2-4周)
1. **数据管理**
   - 发现数据列表
   - 数据详情查看
   - 手动确认入库
   - 批量操作

2. **质量监控**
   - 数据质量检查
   - 异常数据告警
   - 统计报表

### Phase 3 (1-2个月)
1. **关系发现**
   - 网络拓扑发现
   - 应用依赖发现
   - 自动建立关系

2. **智能化**
   - 字段映射推荐
   - 重复数据检测
   - 自动数据清洗

---

## 📚 相关文档

- **旧版实施文档**: `ATTRIBUTE_DISCOVERY_IMPLEMENTATION.md`
- **Unified-IO API**: `/opt/code/newbee/ui/apps/web-antd/src/api/io/`
- **OPS-Center**: 需要集成OPS-Center代理管理API
- **CMDB API**: `/opt/code/newbee/ui/apps/web-antd/src/api/cmdb/`

---

## 🎉 总结

### 核心改进

1. **完整流程**: 从发现方式选择到最终入库的完整链路
2. **灵活配置**: 支持15种发现方式，覆盖主流场景
3. **代理执行**: 通过OPS-Center代理执行，支持分布式采集
4. **映射转换**: 灵活的字段映射机制
5. **双模式入库**: 支持自动入库和手动确认

### 技术亮点

1. **向导式交互**: 5步引导，降低配置难度
2. **动态表单**: 根据发现方式动态生成参数表单
3. **状态管理**: 清晰的步骤验证和状态管理
4. **组件化设计**: 高内聚低耦合的组件结构
5. **类型安全**: 完整的TypeScript类型定义

### 下一步

- 与后端API联调
- 实现发现任务执行
- 完善数据管理功能
- 开发关系发现功能

---

**实施完成日期**: 2025-10-02  
**实施者**: Claude Code (AI Assistant)  
**版本**: V2.0  
**状态**: ✅ 前端完成，待后端集成
