// 验证规则参数类型
export interface ValidationRuleParam {
  key: string;
  value: any;
}

// 验证规则结构
export interface ValidationRule {
  type: string;
  params?: ValidationRuleParam[];
  message: string;
  enabled: boolean;
  customValidator?: string;
}

// 验证结果
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  failedRules?: ValidationRule[];
}

// 支持的验证类型
export const VALIDATION_TYPES = {
  REQUIRED: 'required',
  STRING: 'string',
  NUMBER: 'number',
  EMAIL: 'email',
  URL: 'url',
  PATTERN: 'pattern',
  MIN: 'min',
  MAX: 'max',
  RANGE: 'range',
  DATE: 'date',
  DATETIME: 'datetime',
  ENUM: 'enum',
  CUSTOM: 'custom',
} as const;

export type ValidationType =
  (typeof VALIDATION_TYPES)[keyof typeof VALIDATION_TYPES];

// 验证规则配置
export interface ValidationRuleConfig {
  type: ValidationType;
  label: string;
  description: string;
  params?: {
    defaultValue?: any;
    key: string;
    label: string;
    required?: boolean;
    type: 'array' | 'boolean' | 'number' | 'string';
  }[];
}

// 预设验证规则配置
export const VALIDATION_RULE_CONFIGS: ValidationRuleConfig[] = [
  {
    type: VALIDATION_TYPES.REQUIRED,
    label: '必填验证',
    description: '验证字段不能为空',
  },
  {
    type: VALIDATION_TYPES.STRING,
    label: '字符串验证',
    description: '验证字符串长度',
    params: [
      { key: 'minLength', label: '最小长度', type: 'number' },
      { key: 'maxLength', label: '最大长度', type: 'number' },
    ],
  },
  {
    type: VALIDATION_TYPES.NUMBER,
    label: '数值验证',
    description: '验证数值范围',
    params: [
      { key: 'min', label: '最小值', type: 'number' },
      { key: 'max', label: '最大值', type: 'number' },
    ],
  },
  {
    type: VALIDATION_TYPES.EMAIL,
    label: '邮箱验证',
    description: '验证邮箱格式',
  },
  {
    type: VALIDATION_TYPES.URL,
    label: 'URL验证',
    description: '验证URL格式',
  },
  {
    type: VALIDATION_TYPES.PATTERN,
    label: '正则验证',
    description: '使用正则表达式验证格式',
    params: [
      { key: 'pattern', label: '正则表达式', type: 'string', required: true },
    ],
  },
  {
    type: VALIDATION_TYPES.MIN,
    label: '最小值验证',
    description: '验证最小值或最小长度',
    params: [{ key: 'min', label: '最小值', type: 'number', required: true }],
  },
  {
    type: VALIDATION_TYPES.MAX,
    label: '最大值验证',
    description: '验证最大值或最大长度',
    params: [{ key: 'max', label: '最大值', type: 'number', required: true }],
  },
  {
    type: VALIDATION_TYPES.RANGE,
    label: '范围验证',
    description: '验证值在指定范围内',
    params: [
      { key: 'min', label: '最小值', type: 'number', required: true },
      { key: 'max', label: '最大值', type: 'number', required: true },
    ],
  },
  {
    type: VALIDATION_TYPES.DATE,
    label: '日期验证',
    description: '验证日期格式',
    params: [
      {
        key: 'layout',
        label: '日期格式',
        type: 'string',
        defaultValue: 'YYYY-MM-DD',
      },
    ],
  },
  {
    type: VALIDATION_TYPES.DATETIME,
    label: '日期时间验证',
    description: '验证日期时间格式',
    params: [
      {
        key: 'layout',
        label: '日期时间格式',
        type: 'string',
        defaultValue: 'YYYY-MM-DD HH:mm:ss',
      },
    ],
  },
  {
    type: VALIDATION_TYPES.ENUM,
    label: '枚举验证',
    description: '验证值在枚举列表中',
    params: [{ key: 'values', label: '枚举值', type: 'array', required: true }],
  },
  {
    type: VALIDATION_TYPES.CUSTOM,
    label: '自定义验证',
    description: '使用自定义验证函数',
    params: [
      { key: 'validator', label: '验证函数名', type: 'string', required: true },
    ],
  },
];
