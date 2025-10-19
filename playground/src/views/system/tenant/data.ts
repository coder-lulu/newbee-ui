import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemTenantApi } from '#/api/system/tenant';

import { z } from '#/adapter/form';
import { $t } from '#/locales';

/**
 * 获取编辑表单的字段配置
 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.tenant.name'),
      rules: z
        .string()
        .min(2, $t('ui.formRules.minLength', [$t('system.tenant.name'), 2]))
        .max(50, $t('ui.formRules.maxLength', [$t('system.tenant.name'), 50])),
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('system.tenant.code'),
      rules: z
        .string()
        .min(2, $t('ui.formRules.minLength', [$t('system.tenant.code'), 2]))
        .max(30, $t('ui.formRules.maxLength', [$t('system.tenant.code'), 30])),
    },
    {
      component: 'Input',
      fieldName: 'domain',
      label: $t('system.tenant.domain'),
      rules: z
        .string()
        .max(100, $t('ui.formRules.maxLength', [$t('system.tenant.domain'), 100]))
        .optional(),
    },
    {
      component: 'Input',
      fieldName: 'contactPerson',
      label: $t('system.tenant.contactPerson'),
      rules: z
        .string()
        .max(50, $t('ui.formRules.maxLength', [$t('system.tenant.contactPerson'), 50]))
        .optional(),
    },
    {
      component: 'Input',
      fieldName: 'contactPhone',
      label: $t('system.tenant.contactPhone'),
      rules: z
        .string()
        .max(18, $t('ui.formRules.maxLength', [$t('system.tenant.contactPhone'), 18]))
        .optional(),
    },
    {
      component: 'Input',
      fieldName: 'contactEmail',
      label: $t('system.tenant.contactEmail'),
      rules: z
        .string()
        .email($t('ui.formRules.email'))
        .max(80, $t('ui.formRules.maxLength', [$t('system.tenant.contactEmail'), 80]))
        .optional(),
    },
    {
      component: 'DatePicker',
      componentProps: {
        format: 'YYYY-MM-DD HH:mm:ss',
        showTime: true,
        style: { width: '100%' },
        valueFormat: 'X',
      },
      fieldName: 'expireTime',
      label: $t('system.tenant.expireTime'),
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 1,
        style: { width: '100%' },
      },
      fieldName: 'maxUsers',
      label: $t('system.tenant.maxUsers'),
      rules: z.number().min(1, $t('ui.formRules.min', [$t('system.tenant.maxUsers'), 1])).optional(),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 2 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('system.tenant.status'),
    },
    {
      component: 'Textarea',
      componentProps: {
        maxLength: 200,
        rows: 3,
        showCount: true,
      },
      fieldName: 'description',
      label: $t('system.tenant.description'),
      rules: z
        .string()
        .max(200, $t('ui.formRules.maxLength', [$t('system.tenant.description'), 200]))
        .optional(),
    },
  ];
}

/**
 * 获取搜索表单的字段配置
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.tenant.name'),
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('system.tenant.code'),
    },
    {
      component: 'Input',
      fieldName: 'domain',
      label: $t('system.tenant.domain'),
    },
    {
      component: 'Input',
      fieldName: 'contactPerson',
      label: $t('system.tenant.contactPerson'),
    },
    {
      component: 'Input',
      fieldName: 'contactPhone',
      label: $t('system.tenant.contactPhone'),
    },
    {
      component: 'Input',
      fieldName: 'contactEmail',
      label: $t('system.tenant.contactEmail'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 2 },
        ],
      },
      fieldName: 'status',
      label: $t('system.tenant.status'),
    },
    {
      component: 'InputNumber',
      fieldName: 'maxUsers',
      label: $t('system.tenant.maxUsers'),
    },
    {
      component: 'DatePicker',
      componentProps: {
        format: 'YYYY-MM-DD HH:mm:ss',
        showTime: true,
        style: { width: '100%' },
        valueFormat: 'X',
      },
      fieldName: 'expireTime',
      label: $t('system.tenant.expireTime'),
    },
  ];
}

/**
 * 获取表格列配置
 */
export function useColumns<T = SystemTenantApi.SystemTenant>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'name',
      title: $t('system.tenant.name'),
      width: 150,
    },
    {
      field: 'code',
      title: $t('system.tenant.code'),
      width: 120,
    },
    {
      field: 'domain',
      title: $t('system.tenant.domain'),
      width: 150,
    },
    {
      field: 'contactPerson',
      title: $t('system.tenant.contactPerson'),
      width: 100,
    },
    {
      field: 'contactPhone',
      title: $t('system.tenant.contactPhone'),
      width: 120,
    },
    {
      field: 'contactEmail',
      title: $t('system.tenant.contactEmail'),
      width: 150,
    },
    {
      field: 'maxUsers',
      title: $t('system.tenant.maxUsers'),
      width: 100,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
      field: 'status',
      title: $t('system.tenant.status'),
      width: 80,
    },
    {
      field: 'expireTime',
      formatter: ({ row }) => {
        if (!row.expireTime) return '-';
        return new Date(row.expireTime * 1000).toLocaleString();
      },
      title: $t('system.tenant.expireTime'),
      width: 160,
    },
    {
      field: 'createTime',
      title: $t('system.tenant.createTime'),
      width: 160,
    },
    {
      field: 'description',
      minWidth: 150,
      title: $t('system.tenant.description'),
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.tenant.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          'edit',
          'delete',
          {
            code: 'init',
            text: $t('system.tenant.initData'),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.tenant.operation'),
      width: 180,
    },
  ];
}