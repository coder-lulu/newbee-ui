import type { VxeGridPropTypes } from '#/adapter/vxe-table';

import type { VbenFormSchema } from '@vben/common-ui';

import { $t } from '@vben/locales';

export const scriptColumns: VxeGridPropTypes.Columns = [
  {
    type: 'checkbox',
    width: 50,
  },
  {
    field: 'name',
    minWidth: 180,
    title: $t('ops.script.name'),
  },
  {
    field: 'code',
    minWidth: 150,
    title: $t('ops.script.code'),
  },
  {
    field: 'scriptType',
    slots: { default: 'scriptType' },
    title: $t('ops.script.scriptType'),
    width: 120,
  },
  {
    field: 'executor',
    title: $t('ops.script.executor'),
    width: 100,
  },
  {
    field: 'riskLevel',
    slots: { default: 'riskLevel' },
    title: $t('ops.script.riskLevel'),
    width: 100,
  },
  {
    field: 'version',
    title: $t('ops.script.versionColumn'),
    width: 100,
  },
  {
    field: 'executionCount',
    title: $t('ops.script.executionCount'),
    width: 100,
  },
  {
    field: 'successCount',
    title: $t('ops.script.successCount'),
    width: 100,
  },
  {
    field: 'failureCount',
    title: $t('ops.script.failureCount'),
    width: 100,
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: $t('common.action'),
    width: 240,
  },
];

export const scriptQuerySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('ops.script.namePlaceholder'),
    },
    fieldName: 'name',
    label: $t('ops.script.name'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('ops.script.codePlaceholder'),
    },
    fieldName: 'code',
    label: $t('ops.script.code'),
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: [
        // 脚本语言
        { label: 'Shell', value: 'shell' },
        { label: 'Bash', value: 'bash' },
        { label: 'Python', value: 'python' },
        { label: 'Perl', value: 'perl' },
        { label: 'Ruby', value: 'ruby' },
        { label: 'JavaScript', value: 'javascript' },
        { label: 'TypeScript', value: 'typescript' },
        { label: 'PowerShell', value: 'powershell' },
        { label: 'SQL', value: 'sql' },
        { label: 'Go', value: 'go' },
        // 配置文件
        { label: 'YAML', value: 'yaml' },
        { label: 'JSON', value: 'json' },
        { label: 'TOML', value: 'toml' },
        { label: 'XML', value: 'xml' },
        { label: 'INI', value: 'ini' },
        { label: 'Dockerfile', value: 'dockerfile' },
        // Web 相关
        { label: 'HTML', value: 'html' },
        { label: 'CSS', value: 'css' },
        { label: 'Markdown', value: 'markdown' },
      ],
      placeholder: $t('ops.script.scriptTypePlaceholder'),
    },
    fieldName: 'scriptType',
    label: $t('ops.script.scriptType'),
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: [
        { label: $t('ops.script.riskLevelLow'), value: 'low' },
        { label: $t('ops.script.riskLevelMedium'), value: 'medium' },
        { label: $t('ops.script.riskLevelHigh'), value: 'high' },
        { label: $t('ops.script.riskLevelCritical'), value: 'critical' },
      ],
      placeholder: $t('ops.script.riskLevelPlaceholder'),
    },
    fieldName: 'riskLevel',
    label: $t('ops.script.riskLevelLabel'),
  },
];

export const scriptBasicSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('ops.script.namePlaceholder'),
    },
    dependencies: {
      trigger(values, form) {
        if (values.name) {
          form.setValues({ code: values.name });
        }
      },
      triggerFields: ['name'],
    },
    fieldName: 'name',
    label: $t('ops.script.name'),
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('ops.script.codePlaceholder'),
    },
    fieldName: 'code',
    label: $t('ops.script.code'),
    rules: 'required',
  },
  {
    component: 'TreeSelect',
    componentProps: {
      allowClear: true,
      fieldNames: {
        children: 'children',
        label: 'name',
        value: 'id',
      },
      placeholder: $t('ops.script.categoryIdPlaceholder'),
      showSearch: true,
      treeDefaultExpandAll: true,
    },
    fieldName: 'categoryId',
    label: $t('ops.script.categoryId'),
  },
  {
    component: 'Textarea',
    componentProps: {
      placeholder: $t('ops.script.descriptionPlaceholder'),
      rows: 2,
    },
    fieldName: 'description',
    label: $t('ops.script.description'),
  },
  {
    component: 'Select',
    componentProps: {
      mode: 'tags',
      placeholder: $t('ops.script.tagsPlaceholder'),
    },
    fieldName: 'tags',
    label: $t('ops.script.tags'),
  },
  {
    component: 'Select',
    componentProps: {
      options: [
        // 脚本语言
        { label: 'Shell', value: 'shell' },
        { label: 'Bash', value: 'bash' },
        { label: 'Python', value: 'python' },
        { label: 'Perl', value: 'perl' },
        { label: 'Ruby', value: 'ruby' },
        { label: 'JavaScript', value: 'javascript' },
        { label: 'TypeScript', value: 'typescript' },
        { label: 'PowerShell', value: 'powershell' },
        { label: 'SQL', value: 'sql' },
        { label: 'Go', value: 'go' },
        // 配置文件
        { label: 'YAML', value: 'yaml' },
        { label: 'JSON', value: 'json' },
        { label: 'TOML', value: 'toml' },
        { label: 'XML', value: 'xml' },
        { label: 'INI', value: 'ini' },
        { label: 'Dockerfile', value: 'dockerfile' },
        // Web 相关
        { label: 'HTML', value: 'html' },
        { label: 'CSS', value: 'css' },
        { label: 'Markdown', value: 'markdown' },
      ],
      placeholder: $t('ops.script.scriptTypePlaceholder'),
    },
    fieldName: 'scriptType',
    label: $t('ops.script.scriptType'),
    rules: 'required',
  },
  {
    component: 'Select',
    componentProps: {
      options: [
        { label: 'Agent', value: 'agent' },
        { label: 'SSH', value: 'ssh' },
        { label: 'Telnet', value: 'telnet' },
        { label: 'RDP', value: 'rdp' },
        { label: 'HTTP', value: 'http' },
        { label: 'SNMP', value: 'snmp' },
      ],
      placeholder: $t('ops.script.executorPlaceholder'),
    },
    fieldName: 'executor',
    label: $t('ops.script.executor'),
    rules: 'required',
  },
  {
    component: 'Select',
    componentProps: {
      options: [
        { label: $t('ops.script.riskLevelLow'), value: 'low' },
        { label: $t('ops.script.riskLevelMedium'), value: 'medium' },
        { label: $t('ops.script.riskLevelHigh'), value: 'high' },
        { label: $t('ops.script.riskLevelCritical'), value: 'critical' },
      ],
      placeholder: $t('ops.script.riskLevelPlaceholder'),
    },
    defaultValue: 'low',
    fieldName: 'riskLevel',
    label: $t('ops.script.riskLevelLabel'),
  },
];

export const scriptConfigSchema: VbenFormSchema[] = [
  {
    component: 'InputNumber',
    componentProps: {
      min: 1,
      placeholder: $t('ops.script.defaultTimeoutPlaceholder'),
    },
    defaultValue: 300,
    fieldName: 'defaultTimeout',
    label: $t('ops.script.defaultTimeout'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('ops.script.defaultWorkdirPlaceholder'),
    },
    fieldName: 'defaultWorkdir',
    label: $t('ops.script.defaultWorkdir'),
  },
  {
    component: 'Switch',
    componentProps: {
      class: 'inline-flex',
      style: { width: 'auto' },
    },
    defaultValue: false,
    fieldName: 'requireConfirmation',
    label: $t('ops.script.requireConfirmation'),
  },
  {
    component: 'Switch',
    componentProps: {
      class: 'inline-flex',
      style: { width: 'auto' },
    },
    defaultValue: true,
    fieldName: 'schedulable',
    label: $t('ops.script.schedulable'),
  },
  {
    component: 'Switch',
    componentProps: {
      class: 'inline-flex',
      style: { width: 'auto' },
    },
    defaultValue: false,
    fieldName: 'isTemplate',
    label: $t('ops.script.isTemplate'),
  },
];

export function getScriptTypeColor(type?: string): string {
  const colorMap: Record<string, string> = {
    // 脚本语言
    bash: 'green',
    shell: 'green',
    python: 'blue',
    perl: 'purple',
    ruby: 'red',
    javascript: 'orange',
    typescript: 'blue',
    powershell: 'purple',
    sql: 'cyan',
    go: 'cyan',
    // 配置文件
    yaml: 'orange',
    json: 'green',
    toml: 'orange',
    xml: 'purple',
    ini: 'default',
    dockerfile: 'blue',
    // Web 相关
    html: 'orange',
    css: 'blue',
    markdown: 'default',
  };
  return colorMap[type || 'shell'] || 'default';
}

export function getRiskLevelColor(level?: string): string {
  const colorMap: Record<string, string> = {
    critical: 'red',
    high: 'orange',
    low: 'green',
    medium: 'blue',
  };
  return colorMap[level || 'low'] || 'default';
}

/**
 * 将脚本类型转换为 Monaco Editor 语言 ID
 * Monaco Editor 支持的语言列表：https://github.com/microsoft/monaco-editor/tree/main/src/basic-languages
 */
export function getLanguageFromType(type?: string): string {
  const languageMap: Record<string, string> = {
    // 脚本语言
    bash: 'shell',
    shell: 'shell',
    python: 'python',
    perl: 'perl',
    ruby: 'ruby',
    javascript: 'javascript',
    typescript: 'typescript',
    powershell: 'powershell',
    sql: 'sql',
    go: 'go',
    // 配置文件
    yaml: 'yaml',
    json: 'json',
    toml: 'ini', // Monaco 没有原生 TOML 支持，使用 ini 语法高亮
    xml: 'xml',
    ini: 'ini',
    dockerfile: 'dockerfile',
    // Web 相关
    html: 'html',
    css: 'css',
    markdown: 'markdown',
  };
  return languageMap[type || 'shell'] || 'plaintext';
}
