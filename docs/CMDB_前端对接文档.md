# CMDB 系统前端对接文档

> **Version**: 2.0.0  
> **Last Update**: 2025-01-16  
> **Author**: 系统架构师  

## 概述

本文档详细介绍了CMDB系统CI列表查询接口的前端对接方法，包括传统搜索和增强搜索功能。

### 功能特性

- ✅ **基础查询**: 支持基础字段过滤
- ✅ **属性过滤**: 支持所有属性类型的复杂过滤
- ✅ **全文搜索**: 跨属性的全文检索
- ✅ **关系搜索**: 基于CI间关系的查询 *(增强功能)*
- ✅ **继承搜索**: 基于CI类型继承的查询 *(增强功能)*
- ✅ **标签搜索**: 基于CI标签的查询 *(增强功能)*
- ✅ **元数据搜索**: 基于元数据JSON路径的查询 *(增强功能)*
- ✅ **时间范围搜索**: 灵活的时间范围查询 *(增强功能)*
- ✅ **分面统计**: 多维度统计分析 *(增强功能)*

---

## 接口说明

### 基本信息

- **接口路径**: `/api/v1/cmdb/cis/list`
- **请求方法**: `POST`
- **Content-Type**: `application/json`

### 请求参数结构

```json
{
  // === 分页参数 ===
  "page": 1,
  "pageSize": 20,
  
  // === 基础字段过滤 ===
  "createdAt": 1673123456789,
  "updatedAt": 1673123456789,
  "typeId": 123,
  "status": 1,
  "updatedBy": "user-uuid",
  
  // === 属性过滤 ===
  "attributeFilters": [...],
  "filterGroups": [...],
  
  // === 全文搜索 ===
  "search": "搜索关键词",
  "searchFields": [1, 2, 3],
  
  // === 增强搜索功能 ===
  "relationFilters": [...],
  "inheritanceSearch": {...},
  "tagFilters": [...],
  "metadataFilters": [...],
  "timeRangeSearch": {...},
  "facetSearch": {...},
  
  // === 排序和聚合 ===
  "sortFields": [...],
  "withAggregations": true,
  "aggregationFields": [1, 2, 3],
  
  // === 返回字段控制 ===
  "withAttributes": true,
  "includeAttributes": [1, 2, 3],
  "excludeAttributes": [4, 5, 6],
  
  // === 搜索引擎控制 ===
  "forceEnhancedSearch": false
}
```

---

## 基础查询功能

### 1. 分页查询

```javascript
const basicQuery = {
  page: 1,
  pageSize: 20,
  withAttributes: true
};
```

### 2. 基础字段过滤

```javascript
const basicFilter = {
  typeId: 123,              // CI类型ID
  status: 1,                // CI状态
  createdAt: 1673123456789, // 创建时间（毫秒时间戳，查询此时间之后）
  updatedBy: "user-uuid"    // 创建者UUID
};
```

### 3. 全文搜索

```javascript
const fullTextSearch = {
  search: "服务器",
  searchFields: [1, 2, 3], // 可选：限制搜索范围到特定属性
  withAttributes: true
};
```

---

## 属性过滤功能

### 属性过滤操作符

| 操作符 | 适用类型 | 说明 | 示例值 |
|-------|---------|------|--------|
| `eq` | 所有类型 | 等于 | `"服务器"` |
| `ne` | 所有类型 | 不等于 | `"服务器"` |
| `like` | 文本类型 | 模糊匹配 | `"服务"` |
| `not_like` | 文本类型 | 不匹配 | `"测试"` |
| `gt` / `lt` | 数字、日期 | 大于/小于 | `"100"` |
| `gte` / `lte` | 数字、日期 | 大于等于/小于等于 | `"100"` |
| `in` | 所有类型 | 在列表中 | 使用`values`字段 |
| `not_in` | 所有类型 | 不在列表中 | 使用`values`字段 |
| `empty` | 文本类型 | 为空 | 无需value |
| `not_empty` | 文本类型 | 不为空 | 无需value |
| `today` | 日期类型 | 今天 | 无需value |
| `yesterday` | 日期类型 | 昨天 | 无需value |
| `contains` | JSON类型 | 包含 | JSON片段 |

### 1. 简单属性过滤

```javascript
const attributeFilter = {
  attributeFilters: [
    {
      attrId: 1,
      valueType: "short_text",
      operator: "like",
      value: "Web服务器"
    },
    {
      attrId: 2,
      valueType: "int",
      operator: "gte",
      value: "8"
    },
    {
      attrId: 3,
      valueType: "date_time",
      operator: "today"
    }
  ]
};
```

### 2. 复合过滤条件

```javascript
const complexFilter = {
  filterGroups: [
    {
      logic: "and",
      filters: [
        {
          attrId: 1,
          valueType: "short_text", 
          operator: "eq",
          value: "生产环境"
        },
        {
          attrId: 2,
          valueType: "int",
          operator: "in",
          values: JSON.stringify([8, 16, 32]) // CPU核数
        }
      ]
    },
    {
      logic: "or",
      filters: [
        {
          attrId: 3,
          valueType: "short_text",
          operator: "like", 
          value: "北京"
        },
        {
          attrId: 3,
          valueType: "short_text",
          operator: "like",
          value: "上海"
        }
      ]
    }
  ]
};
```

### 3. 嵌套过滤组

```javascript
const nestedFilter = {
  filterGroups: [
    {
      logic: "and",
      filters: [
        {
          attrId: 1,
          valueType: "short_text",
          operator: "eq",
          value: "服务器"
        }
      ],
      groups: [
        {
          logic: "or",
          filters: [
            {
              attrId: 2,
              valueType: "short_text",
              operator: "like",
              value: "Linux"
            },
            {
              attrId: 2,
              valueType: "short_text", 
              operator: "like",
              value: "Windows"
            }
          ]
        }
      ]
    }
  ]
};
```

---

## 增强搜索功能

### 1. 关系搜索

基于CI间关系进行搜索，支持多级关系查询。

```javascript
const relationSearch = {
  relationFilters: [
    {
      relationType: "deployed_on",  // 关系类型编码
      direction: "outgoing",        // 关系方向
      targetTypeIds: [123],         // 目标CI类型
      relationDepth: 2,             // 关系深度
      includeIndirect: true         // 包含间接关系
    }
  ]
};
```

**应用场景**：
- 查找部署在特定服务器上的应用
- 查找与某个网络设备连接的所有设备
- 查找依赖某个服务的所有应用

### 2. 继承搜索

基于CI类型继承关系进行搜索。

```javascript
const inheritanceSearch = {
  inheritanceSearch: {
    includeChildren: true,   // 包含子类型
    includeParents: false,   // 包含父类型
    typeHierarchy: [100, 101, 102] // 指定类型层级
  }
};
```

**应用场景**：
- 查询所有服务器类型（包括Web服务器、数据库服务器等子类型）
- 查询某个设备类型的所有实例

### 3. 标签搜索

基于CI标签进行搜索。

```javascript
const tagSearch = {
  tagFilters: [
    {
      key: "environment",
      operator: "eq",
      values: ["production", "staging"]
    },
    {
      key: "team", 
      operator: "in",
      values: ["backend", "frontend"]
    },
    {
      key: "monitoring",
      operator: "exists" // 检查标签是否存在
    }
  ]
};
```

**应用场景**：
- 按环境查询（生产、测试、开发）
- 按团队查询
- 按业务标签查询

### 4. 元数据搜索

基于CI元数据的JSON路径进行搜索。

```javascript
const metadataSearch = {
  metadataFilters: [
    {
      path: "system.version",
      operator: "eq",
      value: "2.1.0"
    },
    {
      path: "deployment.replicas",
      operator: "gt", 
      value: "3"
    },
    {
      path: "config.database",
      operator: "exists"
    }
  ]
};
```

**应用场景**：
- 按系统版本查询
- 按配置参数查询
- 按部署参数查询

### 5. 时间范围搜索

支持灵活的时间范围查询。

```javascript
const timeRangeSearch = {
  timeRangeSearch: {
    field: "created_at",        // 时间字段
    startTime: 1673123456789,   // 开始时间
    endTime: 1673209856789,     // 结束时间
    interval: "day"             // 时间间隔
  }
};
```

**应用场景**：
- 查询特定时间段创建的CI
- 查询最近更新的CI
- 按时间间隔统计CI数量

### 6. 分面搜索

提供多维度统计分析。

```javascript
const facetSearch = {
  facetSearch: {
    fields: ["status", "type_id", "environment"],
    size: 10 // 每个分面返回的项目数
  },
  withAggregations: true
};
```

**应用场景**：
- 统计各状态CI数量
- 统计各类型CI分布
- 多维度数据分析

---

## 排序功能

### 1. 基础字段排序

```javascript
const basicSort = {
  sortFields: [
    {
      attrId: 0,
      fieldName: "created_at",
      direction: "desc"
    }
  ]
};
```

### 2. 属性字段排序

```javascript
const attributeSort = {
  sortFields: [
    {
      attrId: 123,
      direction: "asc",
      valueType: "int"
    },
    {
      attrId: 0,
      fieldName: "updated_at", 
      direction: "desc"
    }
  ]
};
```

---

## 响应数据结构

### 成功响应

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total": 1000,
    "data": [
      {
        "id": 12345,
        "typeId": 123,
        "status": 1,
        "createdAt": 1673123456789,
        "updatedAt": 1673123456789,
        "createdBy": "user-uuid",
        "tags": ["production", "web-server"],
        "metadata": [
          {"key": "environment", "value": "production"}
        ],
        "customFields": [
          {"key": "owner", "value": "team-backend"}
        ],
        "attributes": [
          {
            "attrId": 1,
            "attrName": "hostname",
            "attrAlias": "主机名",
            "valueType": "short_text",
            "value": "web-01.example.com",
            "rawValue": "web-01.example.com"
          }
        ]
      }
    ],
    "aggregations": "{...}" // JSON格式的聚合统计数据
  }
}
```

### 聚合数据结构

使用增强搜索时，`aggregations` 字段包含丰富的统计信息：

```json
{
  "total": 1000,
  "status_stats": {
    "status_1": 800,
    "status_2": 150,
    "status_3": 50
  },
  "enhanced": {
    "searchTime": 245,
    "totalPages": 50,
    "currentPage": 1,
    "facets": {
      "type_id": [
        {"value": "123", "count": 400},
        {"value": "124", "count": 350}
      ],
      "status": [
        {"value": "1", "count": 800},
        {"value": "2", "count": 200}
      ]
    },
    "relatedCis": [
      {
        "relationId": 456,
        "relationType": "depends_on", 
        "targetCiId": 789,
        "distance": 1
      }
    ]
  }
}
```

---

## 实际应用示例

### 示例1：复合查询 - 查找生产环境的Web服务器

```javascript
const productionWebServers = {
  page: 1,
  pageSize: 20,
  withAttributes: true,
  
  // 基础过滤：只查询活跃状态
  status: 1,
  
  // 属性过滤：服务器类型
  attributeFilters: [
    {
      attrId: 1, // 设备类型属性
      valueType: "short_text",
      operator: "like",
      value: "服务器"
    }
  ],
  
  // 标签过滤：生产环境 + Web服务
  tagFilters: [
    {
      key: "environment",
      operator: "eq",
      values: ["production"]
    },
    {
      key: "service_type", 
      operator: "eq",
      values: ["web"]
    }
  ],
  
  // 排序：按创建时间倒序
  sortFields: [
    {
      attrId: 0,
      fieldName: "created_at",
      direction: "desc"
    }
  ]
};

// 发送请求
fetch('/api/v1/cmdb/cis/list', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(productionWebServers)
})
.then(response => response.json())
.then(data => {
  console.log('查询结果:', data);
});
```

### 示例2：关系查询 - 查找依赖特定数据库的应用

```javascript
const appsUsingDatabase = {
  page: 1,
  pageSize: 50,
  withAttributes: true,
  
  // 关系过滤：查找依赖数据库的应用
  relationFilters: [
    {
      relationType: "depends_on",
      direction: "incoming", // 入关系：谁依赖
      targetCiIds: [12345], // 特定数据库的CI ID
      relationDepth: 1,     // 直接依赖
      includeIndirect: false
    }
  ],
  
  // 继承搜索：包含所有应用子类型
  inheritanceSearch: {
    includeChildren: true,
    typeHierarchy: [200] // 应用类型ID
  },
  
  // 分面统计
  facetSearch: {
    fields: ["status", "environment", "team"],
    size: 10
  },
  withAggregations: true
};
```

### 示例3：时间范围查询 - 查找最近一周的变更

```javascript
const recentChanges = {
  page: 1,
  pageSize: 100,
  withAttributes: true,
  
  // 时间范围：最近7天
  timeRangeSearch: {
    field: "updated_at",
    startTime: Date.now() - (7 * 24 * 60 * 60 * 1000),
    endTime: Date.now(),
    interval: "day"
  },
  
  // 排序：按更新时间倒序
  sortFields: [
    {
      attrId: 0,
      fieldName: "updated_at",
      direction: "desc"
    }
  ],
  
  // 聚合：按日统计
  withAggregations: true,
  aggregationFields: [1, 2, 3] // 统计特定属性
};
```

---

## 前端实现建议

### 1. 搜索组件架构

```javascript
// 搜索管理器
class CmdbSearchManager {
  constructor() {
    this.searchConfig = {
      useEnhancedSearch: false,
      defaultPageSize: 20
    };
  }
  
  // 构建基础查询
  buildBasicQuery(filters) {
    const query = {
      page: filters.page || 1,
      pageSize: filters.pageSize || this.searchConfig.defaultPageSize,
      withAttributes: true
    };
    
    // 添加基础字段过滤
    if (filters.typeId) query.typeId = filters.typeId;
    if (filters.status !== undefined) query.status = filters.status;
    
    return query;
  }
  
  // 构建属性过滤
  buildAttributeFilters(attributeFilters) {
    return attributeFilters.map(filter => ({
      attrId: filter.attrId,
      valueType: filter.valueType,
      operator: filter.operator,
      value: filter.value,
      values: filter.values ? JSON.stringify(filter.values) : undefined
    }));
  }
  
  // 构建复合查询
  buildComplexQuery(searchCriteria) {
    const query = this.buildBasicQuery(searchCriteria.basic);
    
    // 属性过滤
    if (searchCriteria.attributes) {
      query.attributeFilters = this.buildAttributeFilters(searchCriteria.attributes);
    }
    
    // 关系搜索
    if (searchCriteria.relations) {
      query.relationFilters = searchCriteria.relations;
      query.forceEnhancedSearch = true;
    }
    
    // 标签搜索
    if (searchCriteria.tags) {
      query.tagFilters = searchCriteria.tags;
      query.forceEnhancedSearch = true;
    }
    
    return query;
  }
  
  // 执行搜索
  async search(query) {
    try {
      const response = await fetch('/api/v1/cmdb/cis/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(query)
      });
      
      if (!response.ok) {
        throw new Error(`搜索失败: ${response.status}`);
      }
      
      const result = await response.json();
      return this.processSearchResult(result);
    } catch (error) {
      console.error('搜索错误:', error);
      throw error;
    }
  }
  
  // 处理搜索结果
  processSearchResult(result) {
    if (result.code !== 0) {
      throw new Error(result.msg || '搜索失败');
    }
    
    const processedResult = {
      total: result.data.total,
      data: result.data.data,
      pagination: {
        total: result.data.total,
        current: 1, // 从query计算
        pageSize: 20 // 从query计算
      }
    };
    
    // 处理聚合数据
    if (result.data.aggregations) {
      try {
        processedResult.aggregations = JSON.parse(result.data.aggregations);
      } catch (e) {
        console.warn('解析聚合数据失败:', e);
      }
    }
    
    return processedResult;
  }
}
```

### 2. Vue组件示例

```vue
<template>
  <div class="cmdb-search">
    <!-- 基础搜索 -->
    <div class="search-basic">
      <el-input
        v-model="searchForm.keyword"
        placeholder="搜索关键词"
        @change="handleSearch"
      />
      <el-select v-model="searchForm.typeId" placeholder="CI类型">
        <el-option
          v-for="type in ciTypes"
          :key="type.id"
          :label="type.name"
          :value="type.id"
        />
      </el-select>
    </div>
    
    <!-- 高级搜索 -->
    <div class="search-advanced" v-if="showAdvanced">
      <!-- 属性过滤 -->
      <div class="attribute-filters">
        <div 
          v-for="(filter, index) in searchForm.attributeFilters"
          :key="index"
          class="filter-item"
        >
          <el-select v-model="filter.attrId" placeholder="选择属性">
            <el-option
              v-for="attr in attributes"
              :key="attr.id"
              :label="attr.name"
              :value="attr.id"
            />
          </el-select>
          <el-select v-model="filter.operator" placeholder="操作符">
            <el-option label="等于" value="eq" />
            <el-option label="包含" value="like" />
            <el-option label="大于" value="gt" />
          </el-select>
          <el-input v-model="filter.value" placeholder="值" />
          <el-button @click="removeFilter(index)" type="danger">删除</el-button>
        </div>
        <el-button @click="addFilter" type="primary">添加过滤条件</el-button>
      </div>
      
      <!-- 标签过滤 -->
      <div class="tag-filters">
        <el-tag
          v-for="tag in searchForm.tags"
          :key="tag"
          closable
          @close="removeTag(tag)"
        >
          {{ tag }}
        </el-tag>
        <el-input
          v-model="newTag"
          @keyup.enter="addTag"
          placeholder="添加标签"
          size="small"
          style="width: 120px"
        />
      </div>
    </div>
    
    <!-- 搜索结果 -->
    <div class="search-results">
      <el-table :data="searchResults" v-loading="loading">
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="typeName" label="类型" />
        <el-table-column label="属性">
          <template #default="{ row }">
            <div v-for="attr in row.attributes" :key="attr.attrId">
              {{ attr.attrName }}: {{ attr.value }}
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
    
    <!-- 统计信息 -->
    <div class="search-stats" v-if="aggregations">
      <el-card title="统计信息">
        <div v-if="aggregations.enhanced">
          <p>搜索耗时: {{ aggregations.enhanced.searchTime }}ms</p>
          <div v-if="aggregations.enhanced.facets">
            <h4>分面统计:</h4>
            <div v-for="(facet, key) in aggregations.enhanced.facets" :key="key">
              <strong>{{ key }}:</strong>
              <span v-for="item in facet" :key="item.value">
                {{ item.value }}({{ item.count }})
              </span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';

export default {
  name: 'CmdbSearch',
  setup() {
    const searchManager = new CmdbSearchManager();
    
    const searchForm = reactive({
      keyword: '',
      typeId: null,
      attributeFilters: [],
      tags: []
    });
    
    const searchResults = ref([]);
    const loading = ref(false);
    const aggregations = ref(null);
    
    const pagination = reactive({
      current: 1,
      pageSize: 20,
      total: 0
    });
    
    // 执行搜索
    const handleSearch = async () => {
      loading.value = true;
      try {
        const query = searchManager.buildComplexQuery({
          basic: {
            page: pagination.current,
            pageSize: pagination.pageSize,
            typeId: searchForm.typeId
          },
          attributes: searchForm.attributeFilters,
          search: searchForm.keyword
        });
        
        const result = await searchManager.search(query);
        searchResults.value = result.data;
        pagination.total = result.total;
        aggregations.value = result.aggregations;
      } catch (error) {
        console.error('搜索失败:', error);
      } finally {
        loading.value = false;
      }
    };
    
    return {
      searchForm,
      searchResults,
      loading,
      pagination,
      aggregations,
      handleSearch
    };
  }
};
</script>
```

### 3. React组件示例

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Input, Select, Button, Tag } from 'antd';

const CmdbSearch = () => {
  const [searchManager] = useState(new CmdbSearchManager());
  const [searchForm, setSearchForm] = useState({
    keyword: '',
    typeId: null,
    attributeFilters: [],
    tags: []
  });
  
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  
  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const query = searchManager.buildComplexQuery({
        basic: {
          page: pagination.current,
          pageSize: pagination.pageSize,
          typeId: searchForm.typeId
        },
        attributes: searchForm.attributeFilters,
        search: searchForm.keyword
      });
      
      const result = await searchManager.search(query);
      setSearchResults(result.data);
      setPagination(prev => ({
        ...prev,
        total: result.total
      }));
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  }, [searchManager, searchForm, pagination.current, pagination.pageSize]);
  
  return (
    <div className="cmdb-search">
      {/* 搜索表单 */}
      <div className="search-form">
        <Input
          value={searchForm.keyword}
          onChange={(e) => setSearchForm(prev => ({
            ...prev,
            keyword: e.target.value
          }))}
          placeholder="搜索关键词"
          onPressEnter={handleSearch}
        />
        <Button type="primary" onClick={handleSearch}>
          搜索
        </Button>
      </div>
      
      {/* 搜索结果 */}
      <Table
        dataSource={searchResults}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => {
            setPagination(prev => ({
              ...prev,
              current: page,
              pageSize
            }));
          }
        }}
        columns={[
          {
            title: 'ID',
            dataIndex: 'id',
            key: 'id'
          },
          {
            title: '类型',
            dataIndex: 'typeName',
            key: 'typeName'
          },
          {
            title: '属性',
            key: 'attributes',
            render: (record) => (
              <div>
                {record.attributes?.map(attr => (
                  <div key={attr.attrId}>
                    {attr.attrName}: {attr.value}
                  </div>
                ))}
              </div>
            )
          }
        ]}
      />
    </div>
  );
};

export default CmdbSearch;
```

---

## 性能优化建议

### 1. 查询优化

- **分页控制**: 合理设置 `pageSize`，推荐 20-50
- **属性选择**: 使用 `includeAttributes` 只返回需要的属性
- **搜索引擎选择**: 简单查询使用传统引擎，复杂查询使用增强引擎
- **缓存策略**: 对重复查询进行客户端缓存

### 2. 前端优化

```javascript
// 防抖搜索
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (query) => {
  await handleSearch(query);
}, 300);

// 虚拟滚动（大数据量）
const useVirtualScroll = (data, itemHeight = 50) => {
  // 实现虚拟滚动逻辑
};

// 增量加载
const useInfiniteScroll = () => {
  const [hasMore, setHasMore] = useState(true);
  
  const loadMore = async () => {
    if (!hasMore) return;
    
    const nextPage = Math.floor(searchResults.length / pageSize) + 1;
    const result = await searchManager.search({
      ...currentQuery,
      page: nextPage
    });
    
    if (result.data.length === 0) {
      setHasMore(false);
    } else {
      setSearchResults(prev => [...prev, ...result.data]);
    }
  };
  
  return { loadMore, hasMore };
};
```

---

## 错误处理

### 常见错误码

| 错误码 | 说明 | 解决方案 |
|-------|------|----------|
| `10001` | 参数验证失败 | 检查请求参数格式 |
| `10002` | 属性不存在 | 验证属性ID是否正确 |
| `10003` | 类型不匹配 | 检查valueType与实际值是否匹配 |
| `10004` | 搜索超时 | 简化搜索条件或增加超时时间 |
| `10005` | 数据库连接失败 | 联系系统管理员 |

### 错误处理示例

```javascript
const handleSearchError = (error) => {
  console.error('搜索错误:', error);
  
  // 根据错误类型提供用户友好的提示
  const errorMessages = {
    10001: '搜索参数格式错误，请检查输入',
    10002: '选择的属性不存在，请重新选择',
    10003: '属性值类型不匹配，请检查输入格式',
    10004: '搜索超时，请简化搜索条件',
    10005: '系统暂时不可用，请稍后重试'
  };
  
  const message = errorMessages[error.code] || '搜索失败，请重试';
  
  // 显示错误提示（使用你的UI库）
  showErrorMessage(message);
  
  // 记录详细错误信息用于调试
  logError({
    timestamp: new Date().toISOString(),
    error_code: error.code,
    error_message: error.message,
    request_params: error.requestParams,
    user_agent: navigator.userAgent
  });
};
```

---

## 最佳实践

### 1. 搜索体验优化

- **实时搜索**: 使用防抖控制搜索频率
- **搜索历史**: 保存用户搜索历史，提供快速选择
- **搜索建议**: 根据输入提供搜索建议
- **保存搜索**: 允许用户保存复杂的搜索条件

### 2. 数据展示优化

- **分层加载**: 先显示基础信息，点击展开显示详细属性
- **列配置**: 允许用户自定义显示列
- **导出功能**: 提供搜索结果导出功能
- **批量操作**: 基于搜索结果进行批量操作

### 3. 安全考虑

- **输入验证**: 前端验证所有用户输入
- **权限控制**: 根据用户权限限制搜索范围
- **SQL注入防护**: 后端已实现，前端需注意特殊字符处理
- **敏感信息**: 避免在日志中记录敏感搜索内容

---

## 版本更新记录

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 2.0.0 | 2025-01-16 | 新增增强搜索功能，完善API文档 |
| 1.2.0 | 2024-12-15 | 增加复合过滤条件支持 |
| 1.1.0 | 2024-11-20 | 增加全文搜索功能 |
| 1.0.0 | 2024-10-01 | 初始版本，基础查询功能 |

---

## 联系支持

如有问题请联系：
- **技术支持**: tech-support@example.com
- **API文档**: [在线文档地址]
- **问题反馈**: [GitHub Issues地址]

---

*本文档持续更新，请定期关注最新版本。* 
