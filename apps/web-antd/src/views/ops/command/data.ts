import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { DictEnum } from '@vben/constants';
import { getPopupContainer } from '@vben/utils';

import dayjs from 'dayjs';

import { getDictOptions } from '#/utils/dict';

// 查询表单配置
export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'name',
    label: '命令名称',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      options: getDictOptions(DictEnum.SYS_NORMAL_DISABLE),
    },
    fieldName: 'status',
    label: '命令状态',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      options: [
        { label: '系统命令', value: 'system' },
        { label: '应用命令', value: 'application' },
        { label: '数据库命令', value: 'database' },
        { label: '部署命令', value: 'deployment' },
        { label: '监控命令', value: 'monitoring' },
        { label: '网络命令', value: 'network' },
        { label: '安全命令', value: 'security' },
        { label: '备份命令', value: 'backup' },
      ],
    },
    fieldName: 'commandType',
    label: '命令类型',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      options: [
        { label: '备份', value: 'backup' },
        { label: '部署', value: 'deployment' },
        { label: '维护', value: 'maintenance' },
        { label: '监控', value: 'monitoring' },
        { label: '优化', value: 'optimization' },
        { label: '安全', value: 'security' },
        { label: '故障排查', value: 'troubleshooting' },
      ],
    },
    fieldName: 'commandCategory',
    label: '命令分类',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      options: [
        { label: 'Bash', value: 'bash' },
        { label: 'Python', value: 'python' },
        { label: 'PowerShell', value: 'powershell' },
        { label: 'Shell', value: 'sh' },
        { label: 'CMD', value: 'cmd' },
        { label: 'Ansible', value: 'ansible' },
        { label: 'Terraform', value: 'terraform' },
      ],
    },
    fieldName: 'interpreterType',
    label: '解释器类型',
  },
];

// 命令类型选项
const commandTypeOptions = [
  { label: '命令', value: 'command' },
  { label: '脚本', value: 'script' },
  { label: 'SQL', value: 'sql' },
  { label: 'Ansible Playbook', value: 'ansible_playbook' },
  { label: 'Saltstack', value: 'saltstack' },
];

// 命令分类选项
const commandCategoryOptions = [
  { label: '系统管理', value: 'SYSTEM_MANAGEMENT' },
  { label: '数据库管理', value: 'DATABASE_MANAGEMENT' },
  { label: '网络管理', value: 'NETWORK_MANAGEMENT' },
  { label: '安全操作', value: 'SECURITY_OPERATION' },
  { label: '监控', value: 'MONITORING' },
  { label: '维护', value: 'MAINTENANCE' },
  { label: '部署', value: 'DEPLOYMENT' },
  { label: '备份恢复', value: 'BACKUP_RECOVERY' },
];

// 解释器类型选项
const interpreterTypeOptions = [
  { label: 'Bash', value: 'bash' },
  { label: 'Python', value: 'python' },
  { label: 'PowerShell', value: 'powershell' },
  { label: 'Shell', value: 'sh' },
  { label: 'CMD', value: 'cmd' },
  { label: 'Ansible', value: 'ansible' },
  { label: 'Terraform', value: 'terraform' },
];

// 访问级别选项
const accessLevelOptions = [
  { label: '公开', value: 'PUBLIC' },
  { label: '私有', value: 'PRIVATE' },
  { label: '团队', value: 'TEAM' },
];

// 输出格式选项
const outputFormatOptions = [
  { label: 'JSON', value: 'JSON' },
  { label: '文本', value: 'TEXT' },
  { label: '表格', value: 'TABLE' },
  { label: 'CSV', value: 'CSV' },
  { label: 'XML', value: 'XML' },
];

// 表格列配置
export const columns: VxeGridProps['columns'] = [
  {
    field: 'name',
    title: '命令名称',
    treeNode: true,
    width: 200,
  },
  {
    field: 'description',
    title: '命令描述',
    width: 200,
  },
  {
    field: 'version',
    title: '版本',
    width: 100,
  },
  {
    field: 'commandType',
    title: '命令类型',
    width: 120,
    slots: {
      default: ({ row }) => {
        const commandType = commandTypeOptions.find(
          (item) => item.value === row.commandType,
        );
        return commandType?.label;
      },
    },
  },
  {
    field: 'commandCategory',
    title: '命令分类',
    width: 120,
    slots: {
      default: ({ row }) => {
        const commandCategory = commandCategoryOptions.find(
          (item) => item.value === row.commandCategory,
        );
        return commandCategory?.label;
      },
    },
  },
  {
    field: 'interpreterType',
    title: '解释器',
    width: 100,
    slots: {
      default: ({ row }) => {
        const interpreterType = interpreterTypeOptions.find(
          (item) => item.value === row.interpreterType,
        );
        return interpreterType?.label;
      },
    },
  },
  {
    field: 'accessLevel',
    title: '访问级别',
    width: 100,
    slots: {
      default: ({ row }) => {
        const accessLevel = accessLevelOptions.find(
          (item) => item.value === row.accessLevel,
        );
        return accessLevel?.label;
      },
    },
  },
  {
    field: 'requireSudo',
    title: '需要Sudo',
    width: 100,
    slots: {
      default: ({ row }) => {
        return row.requireSudo ? '是' : '否';
      },
    },
  },
  {
    field: 'isApproved',
    title: '审核状态',
    width: 100,
    slots: {
      default: ({ row }) => {
        return row.isApproved ? '已审核' : '未审核';
      },
    },
  },
  {
    field: 'isDeprecated',
    title: '是否废弃',
    width: 100,
    slots: {
      default: ({ row }) => {
        return row.isDeprecated ? '已废弃' : '正常';
      },
    },
  },
  {
    field: 'tags',
    title: '标签',
    width: 200,
  },
  {
    field: 'createdAt',
    title: '创建时间',
    width: 160,
    formatter: ({ cellValue }) => {
      return cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss') : '';
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

// 编辑表单配置
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
    component: 'Input',
    fieldName: 'name',
    label: '命令名称',
    rules: 'required',
  },
  {
    component: 'Textarea',
    fieldName: 'description',
    label: '命令描述',
    rules: 'required',
    componentProps: {
      rows: 3,
    },
  },
  {
    component: 'Input',
    fieldName: 'version',
    label: '命令版本',
    rules: 'required',
    help: '语义化版本，如：1.0.0',
    defaultValue: '1.0.0',
  },
  {
    component: 'CodeMirror',
    fieldName: 'commandContent',
    label: '命令内容',
    rules: 'required',
    componentProps: {
      language: 'shell',
      placeholder: '请输入命令内容',
      class: 'w-full h-[200px] code-mirror-container',
      style: {
        width: '100%',
        height: '200px',
      },
    },
  },
  {
    component: 'Select',
    fieldName: 'commandType',
    label: '命令类型',
    rules: 'required',
    componentProps: {
      getPopupContainer,
      options: commandTypeOptions,
    },
  },
  {
    component: 'Select',
    fieldName: 'commandCategory',
    label: '命令分类',
    rules: 'required',
    componentProps: {
      getPopupContainer,
      options: commandCategoryOptions,
    },
  },
  {
    component: 'Select',
    fieldName: 'interpreterType',
    label: '解释器类型',
    rules: 'required',
    componentProps: {
      getPopupContainer,
      options: interpreterTypeOptions,
    },
  },
  {
    component: 'Select',
    fieldName: 'accessLevel',
    label: '访问级别',
    rules: 'required',
    componentProps: {
      getPopupContainer,
      options: accessLevelOptions,
    },
  },
  {
    component: 'Select',
    fieldName: 'outputFormat',
    label: '输出格式',
    rules: 'required',
    componentProps: {
      getPopupContainer,
      options: outputFormatOptions,
    },
  },
  {
    component: 'InputNumber',
    fieldName: 'defaultTimeoutSeconds',
    label: '默认超时时间(秒)',
    rules: 'required',
    componentProps: {
      min: 1,
      max: 3600,
      placeholder: '请输入超时时间',
    },
  },
  {
    component: 'Input',
    fieldName: 'workingDir',
    label: '工作目录',
    componentProps: {
      placeholder: '如：/tmp',
    },
  },
  {
    component: 'Textarea',
    fieldName: 'defaultParams',
    label: '默认参数配置',
    componentProps: {
      rows: 3,
      placeholder: 'JSON格式参数配置',
    },
  },
  {
    component: 'Textarea',
    fieldName: 'paramSchema',
    label: '参数验证规则',
    componentProps: {
      rows: 3,
      placeholder: 'JSON Schema格式验证规则',
    },
  },
  {
    component: 'Textarea',
    fieldName: 'envVars',
    label: '环境变量',
    componentProps: {
      rows: 3,
      placeholder: 'JSON格式环境变量配置',
    },
  },
  {
    component: 'Input',
    fieldName: 'allowedUsers',
    label: '允许使用的用户',
    componentProps: {
      placeholder: '用户ID列表，逗号分隔',
    },
  },
  {
    component: 'Input',
    fieldName: 'allowedRoles',
    label: '允许使用的角色',
    componentProps: {
      placeholder: '角色列表，逗号分隔',
    },
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
    fieldName: 'requireSudo',
    label: '是否需要Sudo权限',
    defaultValue: true,
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
    fieldName: 'requireConfirmation',
    label: '是否需要执行确认',
    defaultValue: true,
  },
  {
    component: 'Textarea',
    fieldName: 'usageExample',
    label: '使用示例',
    componentProps: {
      rows: 3,
      placeholder: '命令使用示例说明',
    },
  },
  {
    component: 'Textarea',
    fieldName: 'notes',
    label: '备注说明',
    componentProps: {
      rows: 3,
      placeholder: '其他备注信息',
    },
  },
  {
    component: 'Input',
    fieldName: 'icon',
    label: '图标标识',
    componentProps: {
      placeholder: '图标名称或路径',
    },
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      options: getDictOptions(DictEnum.SYS_NORMAL_DISABLE),
    },
    fieldName: 'status',
    label: '命令状态',
    rules: 'required',
    defaultValue: '1',
  },
];
