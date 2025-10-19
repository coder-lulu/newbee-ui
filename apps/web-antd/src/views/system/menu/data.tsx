import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h } from 'vue';

import { DictEnum } from '@vben/constants';
import { FolderIcon, MenuIcon, OkButtonIcon, VbenIcon } from '@vben/icons';
import { $t } from '@vben/locales';
import { getPopupContainer } from '@vben/utils';

import dayjs from 'dayjs';

import { z } from '#/adapter/form';
import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'name',
    label: '菜单名称 ',
  },
  // {
  //   component: 'Select',
  //   componentProps: {
  //     getPopupContainer,
  //     options: [
  //       { label: '启用', value: 1 },
  //       { label: '禁用', value: 0 },
  //     ],
  //   },
  //   fieldName: 'status',
  //   label: '菜单状态 ',
  // },
];

// 菜单类型（M目录 C菜单 F按钮）
export const menuTypeOptions = [
  { label: '目录', value: 0 },
  { label: '菜单', value: 1 },
  { label: '按钮', value: 2 },
];

export const yesNoOptions = [
  { label: '是', value: true },
  { label: '否', value: false },
];

// （M目录 C菜单 F按钮）
const menuTypes = {
  1: { icon: MenuIcon, value: '菜单' },
  2: { icon: OkButtonIcon, value: '按钮' },
  0: { icon: FolderIcon, value: '目录' },
};

// const MenuStatus = {
//   true: { value: '正常' },
//   false: { value: '禁用' },
// };

export const columns: VxeGridProps['columns'] = [
  {
    title: '菜单名称',
    field: 'name',
    treeNode: true,
    width: 160,
    slots: {
      // 需要i18n支持 否则返回原始值
      default: ({ row }) => $t(row.name),
    },
  },
  {
    title: '服务名称',
    field: 'serviceName',
    slots: {
      default: ({ row }) => {
        return renderDict(row.serviceName, DictEnum.SYS_RPC_SERVICE_LIST);
      },
    },
  },
  {
    title: '图标',
    field: 'icon',
    width: 80,
    slots: {
      default: ({ row }) => {
        if (row?.icon === '#') {
          return '';
        }
        return (
          <span class={'flex justify-center'}>
            <VbenIcon icon={row.icon} />
          </span>
        );
      },
    },
  },
  {
    title: '排序',
    field: 'sort',
    width: 80,
  },
  {
    title: '组件类型',
    field: 'menuType',
    width: 130,
    slots: {
      default: ({ row }) => {
        const current = menuTypes[row.menuType as 0 | 1 | 2];
        if (!current) {
          return '未知';
        }
        return (
          <span class="flex items-center justify-center gap-1">
            {h(current.icon, { class: 'size-[18px]' })}
            <span>{current.value}</span>
          </span>
        );
      },
    },
  },
  {
    title: '组件路径',
    field: 'component',
  },
  {
    title: '状态',
    field: 'disabled',
    width: 100,
    slots: {
      default: ({ row }) => {
        return renderDict(
          row.disabled ? '0' : '1',
          DictEnum.SYS_NORMAL_DISABLE,
        );
      },
    },
  },
  {
    title: '显示',
    field: 'visible',
    width: 100,
    slots: {
      default: ({ row }) => {
        return renderDict(
          row.hideMenu ? '0' : '1',
          DictEnum.SYS_NORMAL_DISABLE,
        );
      },
    },
  },
  {
    title: '创建时间',
    field: 'createdAt',
    // 时间戳转换
    formatter: ({ cellValue }) => {
      return cellValue ? dayjs(cellValue).format('YYYY-MM-DD') : '';
    },
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 'auto',
  },
];

export const drawerSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'id',
  },
  {
    component: 'TreeSelect',
    defaultValue: 0,
    fieldName: 'parentId',
    label: '上级菜单',
    rules: 'selectRequired',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: menuTypeOptions,
      optionType: 'button',
    },
    defaultValue: 1,
    dependencies: {
      componentProps: (_, api) => {
        // 切换时清空校验
        // 直接抄的源码 没有清空校验的方法
        Object.keys(api.errors.value).forEach((key) => {
          api.setFieldError(key, undefined);
        });
        return {};
      },
      triggerFields: ['menuType'],
    },
    fieldName: 'menuType',
    label: '菜单类型',
  },
  {
    component: 'Input',
    defaultValue: '',
    renderComponentContent: (model) => ({
      addonBefore: () => <VbenIcon icon={model.icon} />,
      addonAfter: () => (
        <a href="https://icon-sets.iconify.design/" target="_blank">
          搜索图标
        </a>
      ),
    }),
    fieldName: 'icon',
    help: '点击搜索图标跳转到iconify & 粘贴',
    label: '菜单图标',
  },
  {
    component: 'Select',
    fieldName: 'serviceName',
    label: '服务名称',
    componentProps: {
      getPopupContainer,
      options: getDictOptions(DictEnum.SYS_RPC_SERVICE_LIST),
    },
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: '菜单名称',
    help: '支持i18n写法, 如: menu.system.user',
    rules: 'required',
  },
  {
    component: 'InputNumber',
    fieldName: 'sort',
    help: '排序, 数字越小越靠前',
    label: '显示排序',
    rules: 'required',
  },
  {
    component: 'Input',
    dependencies: {
      // 类型不为按钮时显示
      show: (values) => values?.menuType !== 2,
      triggerFields: ['menuType'],
    },
    fieldName: 'path',
    help: `路由地址不带/, 如: menu, user\n 链接为http(s)://开头\n 链接默认使用内部iframe打开, 可通过{是否外链}控制打开方式`,
    label: '路由地址',
  },
  {
    component: 'Input',
    defaultValue: '',
    dependencies: {
      rules: (model) => {
        // 非链接时为必填项
        if (model.path && !/^https?:\/\//.test(model.path)) {
          return z
            .string()
            .min(1, { message: '非链接时必填组件路径' })
            .refine((val) => !val.endsWith('/'), {
              message: '组件路径开头/末尾不需要带/',
            });
        }
        // 为链接时非必填
        return z.string().optional();
      },
      // 类型为菜单时显示
      show: (values) => values.menuType === 1,
      triggerFields: ['menuType', 'path'],
    },
    fieldName: 'component',
    help: '填写./src/views下的组件路径, 如system/menu/index, 内链: InnerLink,  外链: ParentView',
    label: '组件路径',
  },
  {
    component: 'Input',
    componentProps: (model) => ({
      // 为链接时组件disabled
      disabled: /^https?:\/\//.test(model.path),
      placeholder: '必须为json字符串格式',
    }),
    dependencies: {
      // 类型为菜单时显示
      show: (values) => values.menuType === 1 && values.carryParam === true,
      triggerFields: ['menuType', 'carryParam'],
    },
    fieldName: 'params',
    help: 'vue-router中的query属性\n 如{"name": "xxx", "age": 16}',
    label: '路由参数',
  },
  {
    component: 'Input',
    dependencies: {
      // 类型为菜单/按钮时显示
      show: (values) => values.menuType !== 0,
      triggerFields: ['menuType'],
      rules: (model) => {
        // 非链接时为必填项
        if (model.permission) {
          return z
            .string()
            .refine((val) => !/\*/.test(val), {
              message: '权限标识不允许存在*',
            })
            .optional();
        }
        return z.string().optional();
      },
    },
    fieldName: 'permission',
    help: `控制器中定义的权限字符\n 如: @SaCheckPermission("system:user:import")`,
    label: '权限标识',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: '显示', value: false },
        { label: '隐藏', value: true },
      ],
      optionType: 'button',
    },
    defaultValue: false,
    dependencies: {
      // 类型不为按钮时显示
      show: (values) => values.menuType !== 2,
      triggerFields: ['menuType'],
    },
    fieldName: 'hideMenu',
    help: '隐藏后不会出现在菜单栏, 但仍然可以访问',
    label: '是否隐藏',
    formItemClass: 'col-span-1 items-baseline',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: '正常', value: false },
        { label: '禁用', value: true },
      ],
      optionType: 'button',
    },
    defaultValue: false,
    fieldName: 'disabled',
    help: '停用后不会出现在菜单栏, 也无法访问',
    label: '菜单状态',
    formItemClass: 'col-span-1 items-baseline',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: yesNoOptions,
      optionType: 'button',
    },
    defaultValue: false,
    dependencies: {
      // 类型为菜单时显示
      show: (values) => values.menuType === 1,
      triggerFields: ['menuType'],
    },
    fieldName: 'ignoreKeepAlive',
    help: '路由的keepAlive属性',
    label: '忽略缓存',
    formItemClass: 'col-span-1 items-baseline',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: yesNoOptions,
      optionType: 'button',
    },
    defaultValue: false,
    dependencies: {
      // 类型为菜单时显示
      show: (values) => values.menuType === 1,
      triggerFields: ['menuType'],
    },
    fieldName: 'hideBreadcrumb',
    help: '是否显示面包屑',
    label: '隐藏面包屑',
    formItemClass: 'col-span-1 items-baseline',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: yesNoOptions,
      optionType: 'button',
    },
    defaultValue: false,
    dependencies: {
      // 类型为菜单时显示
      show: (values) => values.menuType === 1,
      triggerFields: ['menuType'],
    },
    fieldName: 'hideTab',
    help: '隐藏Tab',
    label: '隐藏Tab',
    formItemClass: 'col-span-1 items-baseline',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: yesNoOptions,
      optionType: 'button',
    },
    defaultValue: false,
    dependencies: {
      // 类型为菜单时显示
      show: (values) => values.menuType === 1,
      triggerFields: ['menuType'],
    },
    fieldName: 'carryParam',
    help: '是否携带参数',
    label: '携带参数',
    formItemClass: 'col-span-1 items-baseline',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: yesNoOptions,
      optionType: 'button',
    },
    defaultValue: false,
    dependencies: {
      // 类型为菜单时显示
      show: (values) => values.menuType !== 2,
      triggerFields: ['menuType'],
    },
    fieldName: 'hideChildrenInMenu',
    help: '隐藏子菜单',
    label: '隐藏子菜单',
    formItemClass: 'col-span-1 items-baseline',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: yesNoOptions,
      optionType: 'button',
    },
    defaultValue: false,
    dependencies: {
      // 类型为菜单时显示
      show: (values) => values.menuType === 1,
      triggerFields: ['menuType'],
    },
    fieldName: 'affix',
    help: '固定Tab',
    label: '固定Tab',
    formItemClass: 'col-span-1 items-baseline',
  },
];
