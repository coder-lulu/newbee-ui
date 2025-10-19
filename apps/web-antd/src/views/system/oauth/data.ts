import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import dayjs from 'dayjs';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'name',
    label: '提供商名称',
  },
  {
    component: 'Select',
    fieldName: 'type',
    label: '提供商类型',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: 'Google', value: 'google' },
        { label: 'GitHub', value: 'github' },
        { label: 'Facebook', value: 'facebook' },
        { label: '微信', value: 'wechat' },
        { label: 'QQ', value: 'qq' },
        { label: '飞书', value: 'feishu' },
        { label: '钉钉', value: 'dingtalk' },
      ],
      allowClear: true,
    },
  },
  {
    component: 'Select',
    fieldName: 'enabled',
    label: '状态',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '启用', value: true },
        { label: '禁用', value: false },
      ],
      allowClear: true,
    },
  },
  {
    component: 'Select',
    fieldName: 'providerType',
    label: '协议类型',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: 'OAuth 2.0', value: 'oauth2' },
        { label: 'OpenID Connect', value: 'oidc' },
        { label: 'SAML', value: 'saml' },
      ],
      allowClear: true,
    },
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '提供商',
    field: 'displayName',
    minWidth: 150,
    slots: { default: 'provider-info' },
  },
  {
    title: '类型',
    field: 'type',
    width: 100,
    slots: { default: 'provider-type' },
  },
  {
    title: '协议',
    field: 'providerType',
    width: 80,
    formatter: ({ cellValue }) => {
      const typeMap: Record<string, string> = {
        oauth2: 'OAuth 2.0',
        oidc: 'OIDC',
        saml: 'SAML',
      };
      return typeMap[cellValue] || cellValue;
    },
  },
  {
    title: '状态',
    field: 'enabled',
    width: 80,
    slots: { default: 'status' },
  },
  {
    title: '成功/失败',
    field: 'statistics',
    width: 120,
    slots: { default: 'statistics' },
  },
  {
    title: '最后使用',
    field: 'lastUsedAt',
    width: 150,
    formatter: ({ cellValue }) => {
      return cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm') : '从未使用';
    },
  },
  {
    title: '创建时间',
    field: 'createdAt',
    width: 150,
    formatter: ({ cellValue }) => {
      return cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm') : '';
    },
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 200,
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
  
  // 基础信息
  {
    component: 'Divider',
    fieldName: 'basic-divider',
    componentProps: { 
      orientation: 'left', 
      style: { margin: '16px 0 8px 0', fontSize: '14px', fontWeight: '500' }
    },
    formItemProps: { class: 'col-span-full' },
    hideLabel: true,
    renderComponentContent: () => ({
      default: () => '基础信息',
    }),
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: '提供商名称',
    rules: 'required',
    componentProps: {
      placeholder: '如: google, github, wechat',
    },
  },
  {
    component: 'Input',
    fieldName: 'displayName',
    label: '显示名称',
    rules: 'required',
    componentProps: {
      placeholder: '如: Google, GitHub, 微信',
    },
  },
  {
    component: 'Select',
    fieldName: 'type',
    label: '提供商类型',
    rules: 'required',
    componentProps: {
      options: [
        { label: 'Google', value: 'google' },
        { label: 'GitHub', value: 'github' },
        { label: 'Facebook', value: 'facebook' },
        { label: '微信', value: 'wechat' },
        { label: 'QQ', value: 'qq' },
        { label: '飞书', value: 'feishu' },
        { label: '钉钉', value: 'dingtalk' },
        { label: '自定义', value: 'custom' },
      ],
    },
  },
  {
    component: 'Select',
    fieldName: 'providerType',
    label: '协议类型',
    rules: 'required',
    componentProps: {
      options: [
        { label: 'OAuth 2.0', value: 'oauth2' },
        { label: 'OpenID Connect', value: 'oidc' },
        { label: 'SAML', value: 'saml' },
        { label: '自定义', value: 'custom' },
      ],
    },
    defaultValue: 'oauth2',
  },
  {
    component: 'Switch',
    fieldName: 'enabled',
    label: '是否启用',
    defaultValue: true,
    componentProps: {
      style: { 
        minWidth: '44px',
        width: '44px',
        maxWidth: '44px',
        display: 'inline-block'
      }
    },
    formItemProps: { 
      class: 'col-span-1',
      style: { 
        display: 'flex',
        alignItems: 'center'
      }
    },
  },
  {
    component: 'InputNumber',
    fieldName: 'sort',
    label: '排序',
    componentProps: {
      min: 0,
      placeholder: '数字越小排序越靠前',
    },
    defaultValue: 0,
  },
  
  // OAuth配置
  {
    component: 'Divider',
    fieldName: 'oauth-divider',
    componentProps: { 
      orientation: 'left', 
      style: { margin: '16px 0 8px 0', fontSize: '14px', fontWeight: '500' }
    },
    formItemProps: { class: 'col-span-full' },
    hideLabel: true,
    renderComponentContent: () => ({
      default: () => 'OAuth配置',
    }),
  },
  {
    component: 'Input',
    fieldName: 'clientId',
    label: '客户端ID',
    rules: 'required',
  },
  {
    component: 'InputPassword',
    fieldName: 'clientSecret',
    label: '客户端密钥',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'redirectUrl',
    label: '重定向地址',
    rules: 'required',
    componentProps: {
      placeholder: 'https://example.com/oauth/callback',
    },
    formItemProps: { class: 'col-span-full' },
  },
  {
    component: 'Input',
    fieldName: 'scopes',
    label: '权限范围',
    rules: 'required',
    componentProps: {
      placeholder: '如: openid profile email',
    },
  },
  {
    component: 'Input',
    fieldName: 'authUrl',
    label: '授权地址',
    rules: 'required',
    componentProps: {
      placeholder: 'OAuth授权端点URL',
    },
    formItemProps: { class: 'col-span-full' },
  },
  {
    component: 'Input',
    fieldName: 'tokenUrl',
    label: '获取Token地址',
    rules: 'required',
    componentProps: {
      placeholder: 'OAuth Token端点URL',
    },
    formItemProps: { class: 'col-span-full' },
  },
  {
    component: 'Input',
    fieldName: 'infoUrl',
    label: '用户信息地址',
    rules: 'required',
    componentProps: {
      placeholder: '获取用户信息的API端点',
    },
    formItemProps: { class: 'col-span-full' },
  },
  {
    component: 'Select',
    fieldName: 'authStyle',
    label: '鉴权方式',
    rules: 'required',
    componentProps: {
      options: [
        { label: '参数模式', value: 1 },
        { label: 'Header模式', value: 2 },
      ],
    },
    defaultValue: 2,
  },
  
  // 高级设置
  {
    component: 'Divider',
    fieldName: 'advanced-divider',
    componentProps: {
      orientation: 'left', 
      style: { margin: '16px 0 8px 0', fontSize: '14px', fontWeight: '500' }
    },
    formItemProps: { class: 'col-span-full' },
    hideLabel: true,
    renderComponentContent: () => ({
      default: () => '高级设置',
    }),
  },
  {
    component: 'Switch',
    fieldName: 'supportPkce',
    label: '支持PKCE',
    componentProps: {
      checkedChildren: '是',
      unCheckedChildren: '否',
      style: { 
        minWidth: '44px',
        width: '44px',
        maxWidth: '44px',
        display: 'inline-block'
      }
    },
    defaultValue: false,
    formItemProps: { 
      class: 'col-span-1',
      style: { 
        display: 'flex',
        alignItems: 'center'
      }
    },
  },
  {
    component: 'Input',
    fieldName: 'iconUrl',
    label: '图标地址',
    componentProps: {
      placeholder: '提供商图标的URL地址',
    },
    formItemProps: { class: 'col-span-full' },
  },
  {
    component: 'InputNumber',
    fieldName: 'cacheTtl',
    label: '缓存TTL(秒)',
    componentProps: {
      min: 0,
      placeholder: '缓存时间，0表示不缓存',
    },
    defaultValue: 3600,
  },
  {
    component: 'Input',
    fieldName: 'webhookUrl',
    label: '回调URL',
    componentProps: {
      placeholder: '可选的Webhook通知地址',
    },
    formItemProps: { class: 'col-span-full' },
  },
  {
    component: 'Textarea',
    fieldName: 'remark',
    label: '备注',
    componentProps: {
      rows: 3,
      placeholder: '提供商的详细说明或备注信息',
    },
    formItemProps: { class: 'col-span-full' },
  },
  {
    component: 'Textarea',
    fieldName: 'extraConfig',
    label: '额外配置',
    componentProps: {
      rows: 4,
      placeholder: '额外的JSON配置信息',
    },
    formItemProps: { class: 'col-span-full' },
  },
];
