import type { VxeGridPropTypes } from '#/adapter/vxe-table';

import { $t } from '@vben/locales';

export const versionColumns: VxeGridPropTypes.Columns = [
  {
    field: 'version',
    title: $t('ops.script.version.version'),
    width: 120,
  },
  {
    field: 'scriptType',
    title: $t('ops.script.version.scriptType'),
    width: 100,
  },
  {
    field: 'executor',
    title: $t('ops.script.version.executor'),
    width: 100,
  },
  {
    field: 'changeLog',
    minWidth: 200,
    title: $t('ops.script.version.changeLog'),
  },
  {
    field: 'checksum',
    minWidth: 180,
    title: $t('ops.script.version.checksum'),
  },
  {
    field: 'createdAt',
    formatter: ({ cellValue }) => {
      if (!cellValue) return '';
      return new Date(cellValue * 1000).toLocaleString();
    },
    title: $t('ops.script.version.createdAt'),
    width: 180,
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: $t('common.action'),
    width: 180,
  },
];
