import type { App } from 'vue';

import {
  Button as AButton,
  Select as ASelect,
  Drawer as ADrawer,
  Descriptions as ADescriptions,
  Tag as ATag,
  Dropdown as ADropdown,
  Menu as AMenu,
  Breadcrumb as ABreadcrumb,
  Card as ACard,
  Form as AForm,
  Input as AInput,
  Space as ASpace,
  Table as ATable,
  Badge as ABadge,
  Tooltip as ATooltip,
  Popconfirm as APopconfirm,
  Modal as AModal,
  Checkbox as ACheckbox,
  Timeline as ATimeline,
  Empty as AEmpty,
  Divider as ADivider,
  Progress as AProgress,
  Switch as ASwitch,
  Radio as ARadio,
  Spin as ASpin,
  Alert as AAlert,
  DatePicker as ADatePicker,
  Upload as AUpload,
  Tabs as ATabs,
  Steps as ASteps,
  Result as AResult,
  Statistic as AStatistic,
  Collapse as ACollapse,
  Tree as ATree,
  Pagination as APagination,
  Row as ARow,
  Layout as ALayout,
  InputNumber as AInputNumber,
  Rate as ARate,
  Slider as ASlider,
  TimePicker as ATimePicker,
  Transfer as ATransfer,
  Cascader as ACascader,
  AutoComplete as AAutoComplete,
  Calendar as ACalendar,
  List as AList,
  Avatar as AAvatar,
  Image as AImage,
  Typography as ATypography,
  Skeleton as ASkeleton,
  Anchor as AAnchor,
  Affix as AAffix,
  Popover as APopover,
  ConfigProvider as AConfigProvider,
} from 'ant-design-vue';

import { GhostButton } from './button';

/**
 * 全局组件注册
 */
export function setupGlobalComponent(app: App) {
  // 基础输入组件
  app.use(AButton);
  app.use(ASelect);
  app.use(AInput);
  app.use(AInputNumber);
  app.use(ACheckbox);
  app.use(ARadio);
  app.use(ASwitch);
  app.use(ARate);
  app.use(ASlider);

  // 表单组件
  app.use(AForm);
  app.use(ADatePicker);
  app.use(ATimePicker);
  app.use(AUpload);
  app.use(ACascader);
  app.use(AAutoComplete);
  app.use(ATransfer);

  // 数据展示组件
  app.use(ATable);
  app.use(ATag);
  app.use(ABadge);
  app.use(AAvatar);
  app.use(ATimeline);
  app.use(AProgress);
  app.use(ATree);
  app.use(ACalendar);
  app.use(AList);
  app.use(ACard);
  app.use(ADescriptions);
  app.use(AEmpty);
  app.use(AStatistic);
  app.use(AImage);
  app.use(ASkeleton);

  // 反馈组件
  app.use(AModal);
  app.use(AAlert);
  app.use(ADrawer);
  app.use(APopconfirm);
  app.use(APopover);
  app.use(ASpin);
  app.use(AResult);
  app.use(ATooltip);

  // 导航组件
  app.use(AMenu);
  app.use(ADropdown);
  app.use(ABreadcrumb);
  app.use(APagination);
  app.use(ASteps);
  app.use(ATabs);
  app.use(AAnchor);
  app.use(AAffix);

  // 布局组件
  app.use(ALayout);
  app.use(ASpace);
  app.use(ADivider);
  app.use(ARow);
  app.use(ACollapse);

  // 排版组件
  app.use(ATypography);

  // 其他配置
  app.use(AConfigProvider);

  // 自定义组件
  app.component('GhostButton', GhostButton);
}
