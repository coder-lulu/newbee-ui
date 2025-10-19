/**
 * CMDB统计分析仪表板组件
 * 响应式设计，支持PC和移动端，集成所有统计功能
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Button,
  Space,
  Dropdown,
  Menu,
  Tooltip,
  Badge,
  Alert,
  Spin,
  Empty,
  FloatButton,
  Drawer,
  Affix
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  ReloadOutlined,
  SettingOutlined,
  FullscreenOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  FilterOutlined,
  DashboardOutlined,
  BarChartOutlined,
  TableOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';
import { Responsive, WidthProvider, Layout as RGLLayout } from 'react-grid-layout';
import { useMediaQuery } from 'react-responsive';

// 组件导入
import DynamicFieldSelector from '../DynamicFieldSelector';
import MultiDimensionAnalysis from '../MultiDimensionAnalysis';
import ChartRenderer from '../ChartRenderer';
import FilterPanel from '../FilterPanel';

// 类型导入
import type {
  StatisticsQueryConfig,
  StatisticsQueryResult,
  CIType,
  DimensionConfig,
  MeasureConfig,
  ResponsiveLayout,
  ChartType
} from '../../types';

const { Header, Content, Sider } = Layout;
const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'table' | 'metric';
  config: StatisticsQueryConfig;
  result?: StatisticsQueryResult;
  loading: boolean;
  error?: string;
  layout: {
    w: number;
    h: number;
    x: number;
    y: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
  };
}

interface StatisticsDashboardProps {
  ciTypes: CIType[];
  onSaveConfig?: (config: StatisticsQueryConfig) => void;
  onLoadConfig?: (configId: number) => Promise<StatisticsQueryConfig>;
  onExecuteQuery?: (config: StatisticsQueryConfig) => Promise<StatisticsQueryResult>;
  className?: string;
}

const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({
  ciTypes = [],
  onSaveConfig,
  onLoadConfig,
  onExecuteQuery,
  className
}) => {
  // ============ 响应式检测 ============
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ maxWidth: 1024, minWidth: 769 });
  const isDesktop = useMediaQuery({ minWidth: 1025 });
  
  // ============ 状态管理 ============
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [siderCollapsed, setSiderCollapsed] = useState(isMobile);
  const [fullscreenWidget, setFullscreenWidget] = useState<string | null>(null);
  
  // 模态框状态
  const [fieldSelectorVisible, setFieldSelectorVisible] = useState(false);
  const [analysisDrawerVisible, setAnalysisDrawerVisible] = useState(false);
  const [filterPanelVisible, setFilterPanelVisible] = useState(false);
  
  // 配置状态
  const [currentConfig, setCurrentConfig] = useState<StatisticsQueryConfig | null>(null);
  const [selectedCiTypeIds, setSelectedCiTypeIds] = useState<number[]>([]);
  
  // ============ 响应式布局配置 ============
  const layouts = useMemo((): ResponsiveLayout => ({
    lg: { cols: 12, rows: 20, margin: [16, 16], padding: [0, 0], rowHeight: 30 },
    md: { cols: 8, rows: 20, margin: [12, 12], padding: [0, 0], rowHeight: 30 },
    sm: { cols: 6, rows: 20, margin: [8, 8], padding: [0, 0], rowHeight: 30 },
    xs: { cols: 4, rows: 20, margin: [8, 8], padding: [0, 0], rowHeight: 30 },
    xxs: { cols: 2, rows: 20, margin: [4, 4], padding: [0, 0], rowHeight: 30 }
  }), []);
  
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  
  // ============ Widget管理 ============
  
  const createWidget = useCallback((
    title: string,
    type: 'chart' | 'table' | 'metric',
    config: StatisticsQueryConfig
  ): DashboardWidget => {
    const id = `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 根据类型设置默认布局
    const defaultLayouts = {
      chart: { w: 6, h: 8, x: 0, y: 0, minW: 4, minH: 6 },
      table: { w: 12, h: 12, x: 0, y: 0, minW: 6, minH: 8 },
      metric: { w: 3, h: 4, x: 0, y: 0, minW: 2, minH: 3 }
    };
    
    return {
      id,
      title,
      type,
      config,
      loading: false,
      layout: defaultLayouts[type]
    };
  }, []);
  
  const addWidget = useCallback((widget: DashboardWidget) => {
    setWidgets(prev => {
      // 自动调整位置，避免重叠
      const newWidget = { ...widget };
      const maxY = Math.max(0, ...prev.map(w => w.layout.y + w.layout.h));
      newWidget.layout.y = maxY;
      
      return [...prev, newWidget];
    });
  }, []);
  
  const removeWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
    if (selectedWidget === widgetId) {
      setSelectedWidget(null);
    }
  }, [selectedWidget]);
  
  const updateWidget = useCallback((widgetId: string, updates: Partial<DashboardWidget>) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, ...updates } : w
    ));
  }, []);
  
  const executeWidgetQuery = useCallback(async (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget || !onExecuteQuery) return;
    
    updateWidget(widgetId, { loading: true, error: undefined });
    
    try {
      const result = await onExecuteQuery(widget.config);
      updateWidget(widgetId, { loading: false, result });
    } catch (error) {
      updateWidget(widgetId, { 
        loading: false, 
        error: error instanceof Error ? error.message : '查询失败'
      });
    }
  }, [widgets, onExecuteQuery, updateWidget]);
  
  // ============ 事件处理 ============
  
  const handleLayoutChange = useCallback((layout: RGLLayout[], layouts: any) => {
    // 更新widget布局信息
    setWidgets(prev => prev.map(widget => {
      const layoutItem = layout.find(item => item.i === widget.id);
      if (layoutItem) {
        return {
          ...widget,
          layout: {
            ...widget.layout,
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h
          }
        };
      }
      return widget;
    }));
  }, []);
  
  const handleAddChart = useCallback((config: StatisticsQueryConfig) => {
    const widget = createWidget(
      config.alias || config.name,
      config.chartType === 'table' ? 'table' : 'chart',
      config
    );
    addWidget(widget);
    
    // 自动执行查询
    setTimeout(() => {
      executeWidgetQuery(widget.id);
    }, 100);
  }, [createWidget, addWidget, executeWidgetQuery]);
  
  const handleFieldSelection = useCallback((
    dimensions: DimensionConfig[], 
    measures: MeasureConfig[]
  ) => {
    if (dimensions.length === 0 && measures.length === 0) {
      return;
    }
    
    // 创建默认配置
    const config: StatisticsQueryConfig = {
      name: '新建统计',
      alias: `统计_${Date.now()}`,
      configType: 'custom',
      ciTypeIds: selectedCiTypeIds,
      dimensions,
      measures,
      chartType: 'bar' as ChartType,
      sorts: [],
      cacheEnabled: true,
      shareLevel: 'department',
      drillDownEnabled: true
    };
    
    setCurrentConfig(config);
    setFieldSelectorVisible(false);
    setAnalysisDrawerVisible(true);
  }, [selectedCiTypeIds]);
  
  const handleAnalysisComplete = useCallback((config: StatisticsQueryConfig) => {
    handleAddChart(config);
    setAnalysisDrawerVisible(false);
    setCurrentConfig(null);
  }, [handleAddChart]);
  
  const handleRefreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all(
        widgets.map(widget => executeWidgetQuery(widget.id))
      );
    } finally {
      setLoading(false);
    }
  }, [widgets, executeWidgetQuery]);
  
  // ============ 工具栏菜单 ============
  
  const toolbarMenu = (
    <Menu>
      <Menu.Item 
        key="add-chart" 
        icon={<BarChartOutlined />}
        onClick={() => {
          if (ciTypes.length === 0) {
            return;
          }
          setSelectedCiTypeIds([ciTypes[0].id]);
          setFieldSelectorVisible(true);
        }}
      >
        添加图表
      </Menu.Item>
      <Menu.Item 
        key="add-table" 
        icon={<TableOutlined />}
        onClick={() => {
          // 添加表格逻辑
        }}
      >
        添加表格
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="save" icon={<SaveOutlined />}>
        保存仪表板
      </Menu.Item>
      <Menu.Item key="export" icon={<DownloadOutlined />}>
        导出数据
      </Menu.Item>
      <Menu.Item key="share" icon={<ShareAltOutlined />}>
        分享仪表板
      </Menu.Item>
    </Menu>
  );
  
  // ============ 渲染Widget内容 ============
  
  const renderWidgetContent = useCallback((widget: DashboardWidget) => {
    if (widget.loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Spin size="large" />
        </div>
      );
    }
    
    if (widget.error) {
      return (
        <div className="flex items-center justify-center h-full">
          <Alert
            message="查询失败"
            description={widget.error}
            type="error"
            showIcon
            action={
              <Button 
                size="small" 
                danger 
                onClick={() => executeWidgetQuery(widget.id)}
              >
                重试
              </Button>
            }
          />
        </div>
      );
    }
    
    if (!widget.result) {
      return (
        <div className="flex items-center justify-center h-full">
          <Empty description="暂无数据" />
        </div>
      );
    }
    
    return (
      <ChartRenderer
        config={widget.config}
        data={widget.result.data}
        height={widget.layout.h * layouts.lg.rowHeight - 60} // 减去标题栏高度
        responsive={true}
      />
    );
  }, [layouts.lg.rowHeight, executeWidgetQuery]);
  
  // ============ 渲染单个Widget ============
  
  const renderWidget = useCallback((widget: DashboardWidget) => {
    const isSelected = selectedWidget === widget.id;
    const isFullscreen = fullscreenWidget === widget.id;
    
    return (
      <Card
        key={widget.id}
        title={
          <div className="flex items-center justify-between">
            <span className="truncate">{widget.title}</span>
            <Space size="small">
              {widget.result && (
                <Badge 
                  count={widget.result.data.rows.length} 
                  size="small" 
                  color="blue"
                />
              )}
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'refresh',
                      label: '刷新',
                      icon: <ReloadOutlined />,
                      onClick: () => executeWidgetQuery(widget.id)
                    },
                    {
                      key: 'fullscreen',
                      label: isFullscreen ? '退出全屏' : '全屏',
                      icon: <FullscreenOutlined />,
                      onClick: () => setFullscreenWidget(isFullscreen ? null : widget.id)
                    },
                    { type: 'divider' },
                    {
                      key: 'remove',
                      label: '删除',
                      danger: true,
                      onClick: () => removeWidget(widget.id)
                    }
                  ]
                }}
                trigger={['click']}
              >
                <Button type="text" size="small" icon={<SettingOutlined />} />
              </Dropdown>
            </Space>
          </div>
        }
        size="small"
        className={`h-full ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        bodyStyle={{ 
          height: 'calc(100% - 40px)', 
          padding: '12px',
          overflow: 'hidden' 
        }}
        onClick={() => setSelectedWidget(widget.id)}
      >
        {renderWidgetContent(widget)}
      </Card>
    );
  }, [selectedWidget, fullscreenWidget, executeWidgetQuery, removeWidget, renderWidgetContent]);
  
  // ============ 主渲染 ============
  
  return (
    <Layout className={`h-full ${className}`}>
      {/* 侧边栏 */}
      <Sider
        theme="light"
        width={280}
        collapsedWidth={0}
        collapsed={siderCollapsed}
        trigger={null}
        className="shadow-lg"
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">统计分析</h3>
          
          {/* 快速操作 */}
          <Space direction="vertical" className="w-full" size="middle">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="w-full"
              onClick={() => {
                if (ciTypes.length > 0) {
                  setSelectedCiTypeIds([ciTypes[0].id]);
                  setFieldSelectorVisible(true);
                }
              }}
            >
              新建统计
            </Button>
            
            <Button
              icon={<FilterOutlined />}
              className="w-full"
              onClick={() => setFilterPanelVisible(true)}
            >
              高级筛选
            </Button>
            
            <Button
              icon={<ReloadOutlined />}
              className="w-full"
              loading={loading}
              onClick={handleRefreshAll}
            >
              刷新全部
            </Button>
          </Space>
          
          {/* 已有图表列表 */}
          {widgets.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">图表列表</h4>
              <div className="space-y-2">
                {widgets.map(widget => (
                  <div
                    key={widget.id}
                    className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                      selectedWidget === widget.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedWidget(widget.id)}
                  >
                    <div className="font-medium truncate">{widget.title}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {widget.config.chartType} • {widget.config.dimensions.length}维度
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Sider>
      
      {/* 主要内容区域 */}
      <Layout>
        {/* 顶部工具栏 */}
        <Header className="bg-white shadow-sm px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              icon={siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setSiderCollapsed(!siderCollapsed)}
            />
            <h2 className="text-xl font-semibold mb-0">CMDB统计分析</h2>
          </div>
          
          <Space>
            <Dropdown menu={toolbarMenu} trigger={['click']}>
              <Button icon={<PlusOutlined />}>
                添加组件
              </Button>
            </Dropdown>
            
            <Button 
              icon={<DashboardOutlined />}
              onClick={() => {/* 打开模板库 */}}
            >
              模板库
            </Button>
          </Space>
        </Header>
        
        {/* 内容区域 */}
        <Content className="p-4 overflow-auto">
          {widgets.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="text-center">
                    <div className="text-lg font-medium mb-2">开始创建您的统计分析</div>
                    <div className="text-gray-500 mb-4">
                      选择CI类型和字段，创建个性化的统计图表
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        if (ciTypes.length > 0) {
                          setSelectedCiTypeIds([ciTypes[0].id]);
                          setFieldSelectorVisible(true);
                        }
                      }}
                    >
                      创建第一个统计
                    </Button>
                  </div>
                }
              />
            </div>
          ) : (
            <ResponsiveGridLayout
              layouts={{
                lg: widgets.map(w => ({ ...w.layout, i: w.id })),
                md: widgets.map(w => ({ ...w.layout, i: w.id })),
                sm: widgets.map(w => ({ ...w.layout, i: w.id, w: Math.min(w.layout.w, 6) })),
                xs: widgets.map(w => ({ ...w.layout, i: w.id, w: 4 })),
                xxs: widgets.map(w => ({ ...w.layout, i: w.id, w: 2 }))
              }}
              breakpoints={breakpoints}
              cols={layouts}
              rowHeight={layouts.lg.rowHeight}
              margin={[16, 16]}
              onLayoutChange={handleLayoutChange}
              isDraggable={!isMobile}
              isResizable={!isMobile}
              compactType="vertical"
            >
              {widgets.map(renderWidget)}
            </ResponsiveGridLayout>
          )}
        </Content>
      </Layout>
      
      {/* 浮动操作按钮（移动端） */}
      {isMobile && (
        <FloatButton.Group
          trigger="click"
          type="primary"
          icon={<PlusOutlined />}
        >
          <FloatButton
            icon={<BarChartOutlined />}
            tooltip="添加图表"
            onClick={() => {
              if (ciTypes.length > 0) {
                setSelectedCiTypeIds([ciTypes[0].id]);
                setFieldSelectorVisible(true);
              }
            }}
          />
          <FloatButton
            icon={<FilterOutlined />}
            tooltip="高级筛选"
            onClick={() => setFilterPanelVisible(true)}
          />
        </FloatButton.Group>
      )}
      
      {/* 模态框和抽屉 */}
      <DynamicFieldSelector
        visible={fieldSelectorVisible}
        onCancel={() => setFieldSelectorVisible(false)}
        onConfirm={handleFieldSelection}
        ciTypes={ciTypes}
        selectedCiTypeIds={selectedCiTypeIds}
      />
      
      <Drawer
        title="多维度分析配置"
        placement="right"
        size="large"
        open={analysisDrawerVisible}
        onClose={() => setAnalysisDrawerVisible(false)}
        bodyStyle={{ padding: 0 }}
      >
        {currentConfig && (
          <MultiDimensionAnalysis
            config={currentConfig}
            ciTypes={ciTypes}
            onConfigChange={setCurrentConfig}
            onComplete={handleAnalysisComplete}
            onCancel={() => setAnalysisDrawerVisible(false)}
          />
        )}
      </Drawer>
      
      <FilterPanel
        visible={filterPanelVisible}
        onCancel={() => setFilterPanelVisible(false)}
        ciTypes={ciTypes}
        onApplyFilters={(filters) => {
          // 应用全局过滤器
          console.log('Apply filters:', filters);
          setFilterPanelVisible(false);
        }}
      />
    </Layout>
  );
};

export default StatisticsDashboard;