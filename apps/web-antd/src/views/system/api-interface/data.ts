import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { DictEnum } from '@vben/constants';
import { getPopupContainer } from '@vben/utils';

import dayjs from 'dayjs';

import { z } from '#/adapter/form';
import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'path',
    label: '路径',
    rules: z.string().max(200).optional(),
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      options: getDictOptions(DictEnum.SYS_RPC_SERVICE_LIST),
    },
    fieldName: 'serviceName',
    label: '服务名称',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      options: getDictOptions(DictEnum.SYS_HTTP_REQUEST_METHOD),
    },
    fieldName: 'method',
    label: '方法',
  },
  {
    component: 'Input',
    fieldName: 'description',
    label: '描述',
    rules: z.string().max(200).optional(),
  },
  {
    component: 'Input',
    fieldName: 'group',
    label: '分组',
    rules: z.string().max(80).optional(),
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '路径',
    field: 'path',
  },
  {
    title: '分组',
    field: 'group',
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
    title: '描述',
    field: 'trans',
    // 如果参数超过指定长度则省略，并且鼠标放上后气泡形式显示内容
    // 添加tooltip
    showOverflow: 'ellipsis',
  },
  {
    title: '请求方法',
    field: 'method',
    slots: {
      default: ({ row }) => {
        return renderDict(row.method, DictEnum.SYS_HTTP_REQUEST_METHOD);
      },
    },
  },
  {
    title: '必须',
    field: 'isRequired',
    slots: {
      default: ({ row }) => {
        return renderDict(row.isRequired ? '1' : '0', DictEnum.SYS_YES_NO);
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
    width: 180,
  },
];

export const modalSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'id',
    label: '参数主键',
  },
  {
    component: 'Input',
    fieldName: 'path',
    label: '路径',
    rules: 'required',
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
    formItemClass: 'col-span-1 items-baseline',
  },
  {
    component: 'Input',
    fieldName: 'group',
    label: '分组',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'description',
    label: '描述',
    rules: 'required',
  },
  {
    component: 'Select',
    fieldName: 'method',
    label: '请求方法',
    componentProps: {
      getPopupContainer,
      options: getDictOptions(DictEnum.SYS_HTTP_REQUEST_METHOD),
    },
    rules: 'required',
    formItemClass: 'col-span-1 items-baseline',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
      optionType: 'button',
    },
    defaultValue: false,
    fieldName: 'isRequired',
    help: '是否为必须接口',
    label: '是否必须',
    formItemClass: 'col-span-1 items-baseline',
  },
];
