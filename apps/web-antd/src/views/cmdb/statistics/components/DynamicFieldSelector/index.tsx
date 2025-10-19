/**
 * 动态字段选择器组件
 * 支持EAV模式的动态属性配置，包括字段搜索、分类、质量评分展示等
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Modal,
  Input,
  Tree,
  Table,
  Tabs,
  Badge,
  Tag,
  Tooltip,
  Space,
  Button,
  Checkbox,
  Select,
  Row,
  Col,
  Card,
  Progress,
  Empty,
  Spin,
  Alert,
  Divider
} from 'antd';
import {
  SearchOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type {
  CIType,
  CIAttribute,
  FieldMetadata,
  DimensionConfig,
  MeasureConfig
} from '../../types';

interface DynamicFieldSelectorProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (dimensions: DimensionConfig[], measures: MeasureConfig[]) => void;
  ciTypes: CIType[];
  selectedCiTypeIds: number[];
  initialDimensions?: DimensionConfig[];
  initialMeasures?: MeasureConfig[];
  loading?: boolean;
}

interface FieldTreeNode {
  key: string;
  title: React.ReactNode;
  children?: FieldTreeNode[];
  selectable?: boolean;
  checkable?: boolean;
  field?: FieldMetadata;
  type?: 'citype' | 'category' | 'field';
}

const { Search } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

const DynamicFieldSelector: React.FC<DynamicFieldSelectorProps> = ({
  visible,
  onCancel,
  onConfirm,
  ciTypes,
  selectedCiTypeIds,
  initialDimensions = [],
  initialMeasures = [],
  loading = false
}) => {
  // ============ 状态管理 ============
  const [activeTab, setActiveTab] = useState<'dimensions' | 'measures'>('dimensions');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedFields, setSelectedFields] = useState<FieldMetadata[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<DimensionConfig[]>(initialDimensions);
  const [selectedMeasures, setSelectedMeasures] = useState<MeasureConfig[]>(initialMeasures);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  
  // 过滤器状态
  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [completenessFilter, setCompletenessFilter] = useState<number>(0);
  
  // ============ 计算属性 ============
  
  // 过滤后的CI类型
  const filteredCiTypes = useMemo(() => {
    return ciTypes.filter(ciType => 
      selectedCiTypeIds.length === 0 || selectedCiTypeIds.includes(ciType.id)
    );
  }, [ciTypes, selectedCiTypeIds]);
  
  // 构建字段元数据
  const fieldMetadata = useMemo((): FieldMetadata[] => {
    const fields: FieldMetadata[] = [];
    
    filteredCiTypes.forEach(ciType => {
      // 添加基础字段
      const baseFields: FieldMetadata[] = [
        {
          name: 'id',
          displayName: 'CI ID',
          type: 'base_field',
          dataType: 'number',
          ciTypeId: ciType.id,
          description: 'CI实例唯一标识'
        },
        {
          name: 'created_at',
          displayName: '创建时间',
          type: 'base_field',
          dataType: 'date',
          ciTypeId: ciType.id,
          description: 'CI创建时间'
        },
        {
          name: 'updated_at',
          displayName: '更新时间',
          type: 'base_field',
          dataType: 'date',
          ciTypeId: ciType.id,
          description: 'CI最后更新时间'
        },
        {
          name: 'status',
          displayName: '状态',
          type: 'base_field',
          dataType: 'string',
          ciTypeId: ciType.id,
          description: 'CI状态',
          allowedValues: ['active', 'inactive', 'pending', 'retired']
        }
      ];
      
      fields.push(...baseFields);
      
      // 添加动态属性
      ciType.attributes.forEach(attr => {
        fields.push({
          name: `attr_${attr.id}`,
          displayName: attr.alias || attr.name,
          type: 'attribute',
          dataType: attr.valueType,
          ciTypeId: ciType.id,
          attributeId: attr.id,
          description: attr.description,
          allowedValues: attr.options,
          statistics: {
            totalCount: 1000, // 模拟数据
            nullCount: Math.floor(Math.random() * 100),
            uniqueCount: Math.floor(Math.random() * 800),
            completenessRate: attr.qualityScore || Math.random(),
            qualityScore: attr.qualityScore || Math.random(),
            topValues: attr.options?.slice(0, 5).map((value, index) => ({
              value,
              count: Math.floor(Math.random() * 100),
              percentage: Math.random() * 100
            }))
          }
        });
      });
    });
    
    return fields;
  }, [filteredCiTypes]);
  
  // 搜索和过滤字段
  const filteredFields = useMemo(() => {
    return fieldMetadata.filter(field => {
      // 搜索关键词过滤
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        if (!field.name.toLowerCase().includes(keyword) && 
            !field.displayName.toLowerCase().includes(keyword)) {
          return false;
        }
      }
      
      // 类型过滤
      if (typeFilter !== 'all' && field.type !== typeFilter) {
        return false;
      }
      
      // 质量评分过滤
      if (qualityFilter !== 'all') {
        const score = field.statistics?.qualityScore || 0;
        switch (qualityFilter) {
          case 'high':
            if (score < 0.8) return false;
            break;
          case 'medium':
            if (score < 0.5 || score >= 0.8) return false;
            break;
          case 'low':
            if (score >= 0.5) return false;
            break;
        }
      }
      
      // 完整性过滤
      const completeness = field.statistics?.completenessRate || 0;
      if (completeness < completenessFilter / 100) {
        return false;
      }
      
      return true;
    });
  }, [fieldMetadata, searchKeyword, typeFilter, qualityFilter, completenessFilter]);
  
  // 构建树形结构
  const fieldTreeData = useMemo((): FieldTreeNode[] => {
    const treeData: FieldTreeNode[] = [];
    
    filteredCiTypes.forEach(ciType => {
      const ciTypeFields = filteredFields.filter(field => field.ciTypeId === ciType.id);
      
      if (ciTypeFields.length === 0) return;
      
      // 按类型分组
      const baseFields = ciTypeFields.filter(f => f.type === 'base_field');
      const attributeFields = ciTypeFields.filter(f => f.type === 'attribute');
      
      const children: FieldTreeNode[] = [];
      
      // 基础字段分组
      if (baseFields.length > 0) {
        children.push({
          key: `${ciType.id}_base`,
          title: (
            <Space>
              <span>基础字段</span>
              <Badge count={baseFields.length} size="small" />
            </Space>
          ),
          selectable: false,
          children: baseFields.map(field => ({
            key: `${ciType.id}_${field.name}`,
            title: renderFieldTitle(field),
            selectable: true,
            checkable: true,
            field
          }))
        });
      }
      
      // 动态属性分组
      if (attributeFields.length > 0) {
        children.push({
          key: `${ciType.id}_attributes`,
          title: (
            <Space>
              <span>动态属性</span>
              <Badge count={attributeFields.length} size="small" />
            </Space>
          ),
          selectable: false,
          children: attributeFields.map(field => ({
            key: `${ciType.id}_${field.name}`,
            title: renderFieldTitle(field),
            selectable: true,
            checkable: true,
            field
          }))
        });
      }
      
      treeData.push({
        key: `citype_${ciType.id}`,
        title: (
          <Space>
            <span style={{ fontWeight: 'bold' }}>{ciType.alias || ciType.name}</span>
            <Badge count={ciTypeFields.length} size="small" />
            <Tag color={getCiTypeColor(ciType.category)}>{ciType.category}</Tag>
          </Space>
        ),
        selectable: false,
        children,
        type: 'citype'
      });
    });
    
    return treeData;
  }, [filteredCiTypes, filteredFields]);
  
  // ============ 渲染函数 ============
  
  const renderFieldTitle = (field: FieldMetadata) => {
    const stats = field.statistics;
    const qualityScore = stats?.qualityScore || 0;
    const completeness = stats?.completenessRate || 0;
    
    return (
      <div className="flex items-center justify-between w-full">
        <Space>
          <span>{field.displayName}</span>
          <Tag color={getDataTypeColor(field.dataType)}>{field.dataType}</Tag>
          {field.type === 'attribute' && (
            <Tooltip title="动态属性">
              <Tag color="blue" size="small">动态</Tag>
            </Tooltip>
          )}
        </Space>
        <Space>
          <Tooltip title={`数据质量: ${(qualityScore * 100).toFixed(1)}%`}>
            <Progress
              type="circle"
              size={16}
              percent={qualityScore * 100}
              showInfo={false}
              strokeColor={getQualityColor(qualityScore)}
            />
          </Tooltip>
          <Tooltip title={`完整性: ${(completeness * 100).toFixed(1)}%`}>
            <Badge 
              count={`${(completeness * 100).toFixed(0)}%`} 
              color={getCompletenessColor(completeness)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                showFieldDetails(field);
              }}
            />
          </Tooltip>
        </Space>
      </div>
    );
  };
  
  // ============ 事件处理 ============
  
  const handleTreeCheck = useCallback((checkedKeysValue: any) => {
    setCheckedKeys(checkedKeysValue.checked || checkedKeysValue);
    
    // 更新选中的字段
    const selectedFieldKeys = (checkedKeysValue.checked || checkedKeysValue).filter((key: string) => 
      key.includes('_') && !key.startsWith('citype_') && !key.endsWith('_base') && !key.endsWith('_attributes')
    );
    
    const newSelectedFields: FieldMetadata[] = [];
    selectedFieldKeys.forEach((key: string) => {
      const field = fieldMetadata.find(f => 
        key === `${f.ciTypeId}_${f.name}`
      );
      if (field) {
        newSelectedFields.push(field);
      }
    });
    
    setSelectedFields(newSelectedFields);
  }, [fieldMetadata]);
  
  const handleConfirm = useCallback(() => {
    onConfirm(selectedDimensions, selectedMeasures);
  }, [selectedDimensions, selectedMeasures, onConfirm]);
  
  const addToDimensions = useCallback((field: FieldMetadata) => {
    const dimension: DimensionConfig = {
      field: field.name,
      alias: field.name,
      displayName: field.displayName,
      type: field.type,
      dataType: field.dataType,
      sortOrder: 'asc'
    };
    
    setSelectedDimensions(prev => [...prev, dimension]);
  }, []);
  
  const addToMeasures = useCallback((field: FieldMetadata) => {
    const measure: MeasureConfig = {
      field: field.name,
      function: field.dataType === 'number' ? 'sum' : 'count',
      alias: `${field.name}_${field.dataType === 'number' ? 'sum' : 'count'}`,
      displayName: `${field.displayName}(${field.dataType === 'number' ? '求和' : '计数'})`
    };
    
    setSelectedMeasures(prev => [...prev, measure]);
  }, []);
  
  const showFieldDetails = useCallback((field: FieldMetadata) => {
    // 显示字段详情模态框
    Modal.info({
      title: `字段详情: ${field.displayName}`,
      width: 600,
      content: (
        <div className="space-y-4">
          <Row gutter={16}>
            <Col span={12}>
              <div>
                <strong>字段名:</strong> {field.name}
              </div>
            </Col>
            <Col span={12}>
              <div>
                <strong>数据类型:</strong> <Tag color={getDataTypeColor(field.dataType)}>{field.dataType}</Tag>
              </div>
            </Col>
          </Row>
          
          {field.description && (
            <div>
              <strong>描述:</strong> {field.description}
            </div>
          )}
          
          {field.statistics && (
            <Card size="small" title="数据统计">
              <Row gutter={16}>
                <Col span={6}>
                  <div className="text-center">
                    <div className="text-lg font-bold">{field.statistics.totalCount}</div>
                    <div className="text-xs text-gray-500">总记录数</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-center">
                    <div className="text-lg font-bold">{field.statistics.uniqueCount}</div>
                    <div className="text-xs text-gray-500">唯一值数</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-center">
                    <div className="text-lg font-bold">{(field.statistics.completenessRate * 100).toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">完整性</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-center">
                    <div className="text-lg font-bold">{(field.statistics.qualityScore * 100).toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">质量评分</div>
                  </div>
                </Col>
              </Row>
              
              {field.statistics.topValues && field.statistics.topValues.length > 0 && (
                <div className="mt-4">
                  <strong>常用值:</strong>
                  <div className="mt-2">
                    {field.statistics.topValues.map((item, index) => (
                      <Tag key={index} className="mb-1">
                        {item.value} ({item.count})
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      )
    });
  }, []);
  
  // ============ 工具函数 ============
  
  const getCiTypeColor = (category: string) => {
    const colors: Record<string, string> = {
      infrastructure: 'blue',
      application: 'green',
      business: 'purple',
      network: 'orange',
      security: 'red'
    };
    return colors[category] || 'default';
  };
  
  const getDataTypeColor = (dataType: string) => {
    const colors: Record<string, string> = {
      text: 'default',
      integer: 'blue',
      float: 'cyan',
      datetime: 'purple',
      json: 'orange',
      boolean: 'green'
    };
    return colors[dataType] || 'default';
  };
  
  const getQualityColor = (score: number) => {
    if (score >= 0.8) return '#52c41a';
    if (score >= 0.5) return '#faad14';
    return '#ff4d4f';
  };
  
  const getCompletenessColor = (rate: number) => {
    if (rate >= 0.8) return 'green';
    if (rate >= 0.5) return 'orange';
    return 'red';
  };
  
  // ============ 渲染 ============
  
  return (
    <Modal
      title="动态字段选择器"
      visible={visible}
      onCancel={onCancel}
      onOk={handleConfirm}
      width={1200}
      bodyStyle={{ height: 600, overflow: 'hidden' }}
      okText="确认"
      cancelText="取消"
    >
      <div className="h-full flex flex-col">
        {/* 工具栏 */}
        <div className="mb-4 space-y-3">
          <Row gutter={16}>
            <Col flex="auto">
              <Search
                placeholder="搜索字段名称或描述..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                allowClear
              />
            </Col>
            <Col>
              <Space>
                <Select
                  value={typeFilter}
                  onChange={setTypeFilter}
                  style={{ width: 120 }}
                  size="middle"
                >
                  <Option value="all">所有类型</Option>
                  <Option value="base_field">基础字段</Option>
                  <Option value="attribute">动态属性</Option>
                </Select>
                <Select
                  value={qualityFilter}
                  onChange={setQualityFilter}
                  style={{ width: 120 }}
                  size="middle"
                >
                  <Option value="all">所有质量</Option>
                  <Option value="high">高质量 ≥80%</Option>
                  <Option value="medium">中质量 50-80%</Option>
                  <Option value="low">低质量 &lt;50%</Option>
                </Select>
              </Space>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Space>
                <span>完整性要求:</span>
                <Select
                  value={completenessFilter}
                  onChange={setCompletenessFilter}
                  style={{ width: 120 }}
                >
                  <Option value={0}>不限制</Option>
                  <Option value={50}>≥50%</Option>
                  <Option value={70}>≥70%</Option>
                  <Option value={90}>≥90%</Option>
                </Select>
              </Space>
            </Col>
            <Col span={12}>
              <div className="text-right">
                已选择 <Badge count={selectedFields.length} /> 个字段
              </div>
            </Col>
          </Row>
        </div>
        
        <Divider />
        
        {/* 主要内容区域 */}
        <div className="flex-1 overflow-hidden">
          <Row gutter={16} className="h-full">
            {/* 左侧字段树 */}
            <Col span={14} className="h-full">
              <Card 
                title="可用字段" 
                size="small" 
                className="h-full"
                bodyStyle={{ height: 'calc(100% - 40px)', overflow: 'auto' }}
              >
                <Spin spinning={loading}>
                  {fieldTreeData.length > 0 ? (
                    <Tree
                      checkable
                      showIcon
                      treeData={fieldTreeData}
                      checkedKeys={checkedKeys}
                      expandedKeys={expandedKeys}
                      onCheck={handleTreeCheck}
                      onExpand={setExpandedKeys}
                      height={400}
                    />
                  ) : (
                    <Empty 
                      description="没有找到匹配的字段"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </Spin>
              </Card>
            </Col>
            
            {/* 右侧配置区域 */}
            <Col span={10} className="h-full">
              <Card 
                title="统计配置"
                size="small"
                className="h-full"
                bodyStyle={{ height: 'calc(100% - 40px)', overflow: 'auto' }}
              >
                <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as any)}>
                  <TabPane tab={`维度 (${selectedDimensions.length})`} key="dimensions">
                    <div className="space-y-2">
                      {selectedFields.map(field => (
                        <div key={field.name} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium">{field.displayName}</div>
                            <div className="text-xs text-gray-500">{field.name}</div>
                          </div>
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => addToDimensions(field)}
                          >
                            添加为维度
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabPane>
                  
                  <TabPane tab={`指标 (${selectedMeasures.length})`} key="measures">
                    <div className="space-y-2">
                      {selectedFields.map(field => (
                        <div key={field.name} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium">{field.displayName}</div>
                            <div className="text-xs text-gray-500">{field.name}</div>
                          </div>
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => addToMeasures(field)}
                          >
                            添加为指标
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabPane>
                </Tabs>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </Modal>
  );
};

export default DynamicFieldSelector;