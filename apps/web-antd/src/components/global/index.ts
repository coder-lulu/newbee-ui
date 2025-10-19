import type { App } from 'vue';

import { 
  Button as AButton,
  Select as ASelect,
  Drawer as ADrawer,
  Descriptions as ADescriptions,
  DescriptionsItem as ADescriptionsItem,
  Tag as ATag,
  Dropdown as ADropdown,
  Menu as AMenu,
  MenuItem as AMenuItem,
  Breadcrumb as ABreadcrumb,
  BreadcrumbItem as ABreadcrumbItem,
  Card as ACard,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  SelectOption as ASelectOption,
  Space as ASpace,
  Table as ATable,
  TableColumn as ATableColumn,
  Badge as ABadge,
  Tooltip as ATooltip,
  Popconfirm as APopconfirm
} from 'ant-design-vue';

import { GhostButton } from './button';

/**
 * 全局组件注册
 */
export function setupGlobalComponent(app: App) {
  app.use(AButton);
  app.use(ASelect);
  app.use(ADrawer);
  app.use(ADescriptions);
  app.use(ADescriptionsItem);
  app.use(ATag);
  app.use(ADropdown);
  app.use(AMenu);
  app.use(AMenuItem);
  app.use(ABreadcrumb);
  app.use(ABreadcrumbItem);
  app.use(ACard);
  app.use(AForm);
  app.use(AFormItem);
  app.use(AInput);
  app.use(ASelectOption);
  app.use(ASpace);
  app.use(ATable);
  app.use(ATableColumn);
  app.use(ABadge);
  app.use(ATooltip);
  app.use(APopconfirm);
  // 表格操作列专用按钮
  app.component('GhostButton', GhostButton);
}
