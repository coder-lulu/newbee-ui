
## 1. 创建CI实例

### 接口信息
- **URL**: `POST /cis/create`
- **功能**: 创建新的CI实例

### TypeScript接口定义
```typescript
interface CiAttributeValue {
  attrId: number;
  attrName: string;
  attrAlias: string;
  valueType: string;
  value: string;
  rawValue?: any;
}

interface CisInfo {
  id?: number;
  createdAt?: number;
  updatedAt?: number;
  typeId?: number;
  status?: number;
  heartbeat?: number;
  available?: boolean;
  updatedBy?: string;
  attributes?: CiAttributeValue[];
}

interface CreateCisRequest {
  typeId: number;
  status?: number;
  available?: boolean;
  updatedBy?: string;
  attributes: CiAttributeValue[];
}
```

### 前端调用示例
```javascript
// 创建服务器CI实例
async function createServerCi() {
  const requestData = {
    typeId: 1,
    status: 1,
    available: true,
    updatedBy: "admin",
    attributes: [
      {
        attrId: 1,
        attrName: "hostname",
        attrAlias: "主机名",
        valueType: "text",
        value: "web-server-01"
      },
      {
        attrId: 2,
        attrName: "ip_address",
        attrAlias: "IP地址",
        valueType: "text",
        value: "192.168.1.100"
      },
      {
        attrId: 3,
        attrName: "cpu_cores",
        attrAlias: "CPU核数",
        valueType: "int",
        value: "8"
      },
      {
        attrId: 4,
        attrName: "memory_gb",
        attrAlias: "内存(GB)",
        valueType: "float",
        value: "16.0"
      },
      {
        attrId: 5,
        attrName: "install_date",
        attrAlias: "安装日期",
        valueType: "datetime",
        value: "2024-01-15T10:30:00Z"
      },
      {
        attrId: 6,
        attrName: "environment",
        attrAlias: "环境",
        valueType: "text",
        value: "production"
      },
      {
        attrId: 7,
        attrName: "is_virtual",
        attrAlias: "是否虚拟机",
        valueType: "bool",
        value: "false"
      }
    ]
  };

  try {
    const response = await fetch('/cis/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    
    if (result.code === 0) {
      console.log('创建成功:', result.msg);
      return true;
    } else {
      console.error('创建失败:', result.msg);
      return false;
    }
  } catch (error) {
    console.error('请求失败:', error);
    return false;
  }
}
```

### 响应示例
```json
{
  "code": 0,
  "msg": "创建成功"
}
```

## 2. 更新CI实例

### 接口信息
- **URL**: `POST /cis/update`
- **功能**: 更新现有CI实例

### 前端调用示例
```javascript
// 更新CI实例
async function updateCi(ciId) {
  const requestData = {
    id: ciId,
    status: 2,
    available: true,
    updatedBy: "admin",
    attributes: [
      {
        attrId: 1,
        attrName: "hostname",
        attrAlias: "主机名",
        valueType: "text",
        value: "web-server-01-updated"
      },
      {
        attrId: 4,
        attrName: "memory_gb",
        attrAlias: "内存(GB)",
        valueType: "float",
        value: "32.0"
      }
    ]
  };

  try {
    const response = await fetch('/cis/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('更新失败:', error);
    throw error;
  }
}
```

### 响应示例
```json
{
  "code": 0,
  "msg": "更新成功"
}
```

## 3. 根据ID获取CI实例

### 接口信息
- **URL**: `POST /cis`
- **功能**: 根据ID获取单个CI实例详情

### TypeScript接口定义
```typescript
interface GetCiByIdRequest {
  id: number;
}

interface CisInfoResponse {
  code: number;
  msg: string;
  data: CisInfo;
}
```

### 前端调用示例
```javascript
// 获取CI实例详情
async function getCiById(ciId) {
  const requestData = {
    id: ciId
  };

  try {
    const response = await fetch('/cis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    
    if (result.code === 0) {
      console.log('CI实例详情:', result.data);
      return result.data;
    } else {
      console.error('获取失败:', result.msg);
      return null;
    }
  } catch (error) {
    console.error('请求失败:', error);
    return null;
  }
}
```

### 响应示例
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "createdAt": 1706169000000,
    "updatedAt": 1706169000000,
    "typeId": 1,
    "status": 2,
    "heartbeat": 1706169000000,
    "available": true,
    "updatedBy": "admin",
    "attributes": [
      {
        "attrId": 1,
        "attrName": "hostname",
        "attrAlias": "主机名",
        "valueType": "text",
        "value": "web-server-01-updated",
        "rawValue": "web-server-01-updated"
      },
      {
        "attrId": 2,
        "attrName": "ip_address",
        "attrAlias": "IP地址",
        "valueType": "text",
        "value": "192.168.1.100",
        "rawValue": "192.168.1.100"
      },
      {
        "attrId": 3,
        "attrName": "cpu_cores",
        "attrAlias": "CPU核数",
        "valueType": "int",
        "value": "8",
        "rawValue": 8
      },
      {
        "attrId": 4,
        "attrName": "memory_gb",
        "attrAlias": "内存(GB)",
        "valueType": "float",
        "value": "32.0",
        "rawValue": 32.0
      }
    ]
  }
}
```

## 4. 获取CI实例详情（包含类型信息）

### 接口信息
- **URL**: `POST /cis/detail`
- **功能**: 获取CI实例详情，包含CI类型信息

### TypeScript接口定义
```typescript
interface CisDetailInfo {
  ciInfo: CisInfo;
  ciTypeName: string;
  ciTypeAlias: string;
}

interface CisDetailResponse {
  code: number;
  msg: string;
  data: CisDetailInfo;
}
```

### 前端调用示例
```javascript
// 获取CI实例详情（包含类型信息）
async function getCisDetailById(ciId) {
  const requestData = {
    id: ciId
  };

  try {
    const response = await fetch('/cis/detail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
}
```

### 响应示例
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "ciInfo": {
      "id": 1,
      "createdAt": 1706169000000,
      "updatedAt": 1706169000000,
      "typeId": 1,
      "status": 2,
      "heartbeat": 1706169000000,
      "available": true,
      "updatedBy": "admin",
      "attributes": [...]
    },
    "ciTypeName": "服务器",
    "ciTypeAlias": "Server"
  }
}
```

## 5. 获取CI实例列表（复杂查询）

### 接口信息
- **URL**: `POST /cis/list`
- **功能**: 获取CI实例列表，支持复杂过滤、搜索、排序

### TypeScript接口定义
```typescript
interface CiAttributeFilter {
  attrId: number;
  attrName?: string;
  valueType: string;
  operator: string;
  value?: any;
  values?: any[];
  listMode?: string;
}

interface CiFilterGroup {
  logic: string;
  filters?: CiAttributeFilter[];
  groups?: CiFilterGroup[];
}

interface CiSortField {
  attrId: number;
  fieldName?: string;
  direction: string;
  valueType?: string;
}

interface CisListRequest {
  page: number;
  pageSize: number;
  // 基础字段过滤
  createdAt?: number;
  updatedAt?: number;
  typeId?: number;
  status?: number;
  available?: boolean;
  updatedBy?: string;
  // 高级过滤
  attributeFilters?: CiAttributeFilter[];
  filterGroups?: CiFilterGroup[];
  search?: string;
  searchFields?: number[];
  // 排序和聚合
  sortFields?: CiSortField[];
  withAggregations?: boolean;
  aggregationFields?: number[];
  // 字段控制
  includeAttributes?: number[];
  excludeAttributes?: number[];
  withAttributes?: boolean;
}

interface CisListInfo {
  total: number;
  data: CisInfo[];
  aggregations?: Record<string, any>;
}

interface CisListResponse {
  code: number;
  msg: string;
  data: CisListInfo;
}
```

### 前端调用示例

#### 5.1 基础分页查询
```javascript
// 基础分页查询
async function getCisListBasic(page = 1, pageSize = 20) {
  const requestData = {
    page: page,
    pageSize: pageSize,
    typeId: 1,
    status: 1,
    available: true,
    withAttributes: true
  };

  try {
    const response = await fetch('/cis/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
}
```

#### 5.2 属性过滤查询
```javascript
// 属性过滤查询
async function getCisListWithFilters() {
  const requestData = {
    page: 1,
    pageSize: 20,
    attributeFilters: [
      {
        attrId: 1,
        valueType: "text",
        operator: "like",
        value: "web-server"
      },
      {
        attrId: 3,
        valueType: "int",
        operator: "gte",
        value: "4"
      },
      {
        attrId: 6,
        valueType: "text",
        operator: "in",
        values: ["production", "staging"]
      }
    ],
    withAttributes: true
  };

  try {
    const response = await fetch('/cis/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
}
```

#### 5.3 复合过滤查询
```javascript
// 复合过滤查询
async function getCisListWithComplexFilters() {
  const requestData = {
    page: 1,
    pageSize: 20,
    filterGroups: [
      {
        logic: "and",
        filters: [
          {
            attrId: 6,
            valueType: "text",
            operator: "eq",
            value: "production"
          }
        ],
        groups: [
          {
            logic: "or",
            filters: [
              {
                attrId: 1,
                valueType: "text",
                operator: "like",
                value: "web%"
              },
              {
                attrId: 1,
                valueType: "text",
                operator: "like",
                value: "api%"
              }
            ]
          }
        ]
      }
    ],
    withAttributes: true
  };

  try {
    const response = await fetch('/cis/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
}
```

#### 5.4 全文搜索
```javascript
// 全文搜索
async function searchCis(searchText) {
  const requestData = {
    page: 1,
    pageSize: 20,
    search: searchText,
    searchFields: [1, 2], // 在主机名和IP地址中搜索
    withAttributes: true
  };

  try {
    const response = await fetch('/cis/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
}
```

#### 5.5 排序查询
```javascript
// 排序查询
async function getCisListWithSort() {
  const requestData = {
    page: 1,
    pageSize: 20,
    sortFields: [
      {
        attrId: 0,
        fieldName: "created_at",
        direction: "desc"
      },
      {
        attrId: 3,
        direction: "asc",
        valueType: "int"
      }
    ],
    withAttributes: true
  };

  try {
    const response = await fetch('/cis/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
}
```

### 响应示例
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total": 150,
    "data": [
      {
        "id": 1,
        "createdAt": 1706169000000,
        "updatedAt": 1706169000000,
        "typeId": 1,
        "status": 1,
        "heartbeat": 1706169000000,
        "available": true,
        "updatedBy": "admin",
        "attributes": [
          {
            "attrId": 1,
            "attrName": "hostname",
            "attrAlias": "主机名",
            "valueType": "text",
            "value": "web-server-01",
            "rawValue": "web-server-01"
          },
          {
            "attrId": 2,
            "attrName": "ip_address",
            "attrAlias": "IP地址",
            "valueType": "text",
            "value": "192.168.1.100",
            "rawValue": "192.168.1.100"
          }
        ]
      }
    ],
    "aggregations": {
      "total": 150,
      "status_stats": {
        "status_1": 120,
        "status_2": 30
      },
      "environment_stats": {
        "production": 80,
        "staging": 40,
        "development": 30
      }
    }
  }
}
```

## 6. 删除CI实例

### 接口信息
- **URL**: `POST /cis/delete`
- **功能**: 删除一个或多个CI实例

### TypeScript接口定义
```typescript
interface DeleteCisRequest {
  ids: number[];
}
```

### 前端调用示例
```javascript
// 删除CI实例
async function deleteCis(ciIds) {
  const requestData = {
    ids: Array.isArray(ciIds) ? ciIds : [ciIds]
  };

  try {
    const response = await fetch('/cis/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    
    if (result.code === 0) {
      console.log('删除成功:', result.msg);
      return true;
    } else {
      console.error('删除失败:', result.msg);
      return false;
    }
  } catch (error) {
    console.error('请求失败:', error);
    return false;
  }
}

// 使用示例
// 删除单个CI实例
await deleteCis(1);

// 删除多个CI实例
await deleteCis([1, 2, 3]);
```

### 响应示例
```json
{
  "code": 0,
  "msg": "删除成功"
}
```

## 7. 批量操作

### 接口信息
- **URL**: `POST /cis/batch`
- **功能**: 对多个CI实例执行批量操作

### TypeScript接口定义
```typescript
interface CisBatchOperationRequest {
  operation: string;
  ciIds: number[];
  params?: Record<string, any>;
}
```

### 前端调用示例

#### 7.1 批量删除
```javascript
// 批量删除
async function batchDeleteCis(ciIds) {
  const requestData = {
    operation: "delete",
    ciIds: ciIds
  };

  try {
    const response = await fetch('/cis/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('批量删除失败:', error);
    throw error;
  }
}
```

#### 7.2 批量更新状态
```javascript
// 批量更新状态
async function batchUpdateStatus(ciIds, status) {
  const requestData = {
    operation: "update_status",
    ciIds: ciIds,
    params: {
      status: status
    }
  };

  try {
    const response = await fetch('/cis/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('批量更新状态失败:', error);
    throw error;
  }
}
```

#### 7.3 批量更新属性
```javascript
// 批量更新属性
async function batchUpdateAttributes(ciIds, attributes) {
  const requestData = {
    operation: "update_attributes",
    ciIds: ciIds,
    params: {
      attributes: attributes
    }
  };

  try {
    const response = await fetch('/cis/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('批量更新属性失败:', error);
    throw error;
  }
}
```

### 响应示例
```json
{
  "code": 0,
  "msg": "批量操作成功"
}
```

## 8. 属性验证

### 接口信息
- **URL**: `POST /cis/validate`
- **功能**: 验证CI实例的属性值是否符合规则

### TypeScript接口定义
```typescript
interface CisAttributeValidateRequest {
  typeId: number;
  attributes: CiAttributeValue[];
}

interface CiAttributeError {
  attrId: number;
  attrName: string;
  errorType: string;
  message: string;
}

interface CisAttributeValidateResponse {
  code: number;
  msg: string;
  valid: boolean;
  errors?: CiAttributeError[];
}
```

### 前端调用示例
```javascript
// 属性验证
async function validateCisAttributes(typeId, attributes) {
  const requestData = {
    typeId: typeId,
    attributes: attributes
  };

  try {
    const response = await fetch('/cis/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    
    if (result.code === 0) {
      if (result.valid) {
        console.log('属性验证通过');
        return { valid: true, errors: [] };
      } else {
        console.log('属性验证失败:', result.errors);
        return { valid: false, errors: result.errors };
      }
    } else {
      console.error('验证请求失败:', result.msg);
      throw new Error(result.msg);
    }
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
}

// 使用示例
const attributes = [
  {
    attrId: 1,
    attrName: "hostname",
    attrAlias: "主机名",
    valueType: "text",
    value: "web-server-01"
  },
  {
    attrId: 3,
    attrName: "cpu_cores",
    attrAlias: "CPU核数",
    valueType: "int",
    value: "invalid_number" // 故意输入错误值
  }
];

const validationResult = await validateCisAttributes(1, attributes);
```

### 响应示例

#### 验证成功
```json
{
  "code": 0,
  "msg": "success",
  "valid": true,
  "errors": []
}
```

#### 验证失败
```json
{
  "code": 0,
  "msg": "success",
  "valid": false,
  "errors": [
    {
      "attrId": 3,
      "attrName": "cpu_cores",
      "errorType": "validation_error",
      "message": "属性 cpu_cores 的值 'invalid_number' 不是有效的整数"
    }
  ]
}
```

## 错误处理

### 常见错误码
```typescript
enum ErrorCode {
  SUCCESS = 0,
  INVALID_PARAMS = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500
}
```

### 统一错误处理函数
```javascript
// 统一错误处理
function handleApiError(result) {
  switch (result.code) {
    case 0:
      return result;
    case 400:
      throw new Error(`参数错误: ${result.msg}`);
    case 401:
      // 重新登录
      redirectToLogin();
      throw new Error('未授权访问，请重新登录');
    case 403:
      throw new Error(`权限不足: ${result.msg}`);
    case 404:
      throw new Error(`资源不存在: ${result.msg}`);
    case 500:
      throw new Error(`服务器错误: ${result.msg}`);
    default:
      throw new Error(`未知错误: ${result.msg}`);
  }
}

// 封装API调用
async function apiCall(url, data) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return handleApiError(result);
  } catch (error) {
    console.error('API调用失败:', error);
    throw error;
  }
}
```

## 实用工具函数

### 1. 数据转换工具
```javascript
// 时间戳转换
function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString();
}

// 属性值格式化
function formatAttributeValue(attr) {
  switch (attr.valueType) {
    case 'datetime':
      return formatTimestamp(new Date(attr.value).getTime());
    case 'bool':
      return attr.value === 'true' ? '是' : '否';
    case 'float':
      return parseFloat(attr.value).toFixed(2);
    case 'int':
      return parseInt(attr.value).toLocaleString();
    default:
      return attr.value;
  }
}

// 状态转换
const statusMap = {
  1: '运行中',
  2: '已停止',
  3: '维护中',
  4: '故障'
};

function getStatusText(status) {
  return statusMap[status] || '未知';
}
```

### 2. 查询构建器
```javascript
class CisQueryBuilder {
  constructor() {
    this.query = {
      page: 1,
      pageSize: 20,
      withAttributes: true
    };
  }

  // 设置分页
  pagination(page, pageSize) {
    this.query.page = page;
    this.query.pageSize = pageSize;
    return this;
  }

  // 添加基础过滤
  filterByType(typeId) {
    this.query.typeId = typeId;
    return this;
  }

  filterByStatus(status) {
    this.query.status = status;
    return this;
  }

  filterByAvailable(available) {
    this.query.available = available;
    return this;
  }

  // 添加属性过滤
  filterByAttribute(attrId, operator, value, valueType = 'text') {
    if (!this.query.attributeFilters) {
      this.query.attributeFilters = [];
    }
    
    this.query.attributeFilters.push({
      attrId,
      valueType,
      operator,
      value
    });
    return this;
  }

  // 添加搜索
  search(text, fields = []) {
    this.query.search = text;
    if (fields.length > 0) {
      this.query.searchFields = fields;
    }
    return this;
  }

  // 添加排序
  sortBy(attrId, direction = 'asc', valueType = 'text', fieldName = null) {
    if (!this.query.sortFields) {
      this.query.sortFields = [];
    }
    
    const sortField = {
      attrId,
      direction,
      valueType
    };
    
    if (fieldName) {
      sortField.fieldName = fieldName;
    }
    
    this.query.sortFields.push(sortField);
    return this;
  }

  // 构建查询
  build() {
    return this.query;
  }
}
