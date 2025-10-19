import type {
  ValidationResult,
  ValidationRule,
  ValidationRuleParam,
} from './types';

import dayjs from 'dayjs';

/**
 * 验证引擎类
 */
export class Validator {
  private customValidators: Map<
    string,
    (
      value: any,
      params: Record<string, any>,
    ) => null | Promise<null | string> | string
  > = new Map();
  private patternCache: Map<string, RegExp> = new Map();

  /**
   * 注册自定义验证函数
   */
  registerCustomValidator(
    name: string,
    fn: (
      value: any,
      params: Record<string, any>,
    ) => null | Promise<null | string> | string,
  ) {
    this.customValidators.set(name, fn);
  }

  /**
   * 执行验证
   */
  async validate(
    value: any,
    rules: ValidationRule[],
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      failedRules: [],
    };

    if (!rules || rules.length === 0) {
      return result;
    }

    for (const rule of rules) {
      if (!rule.enabled) {
        continue;
      }

      try {
        const error = await this.validateRule(value, rule);
        if (error) {
          result.valid = false;
          result.errors = result.errors || [];
          result.failedRules = result.failedRules || [];
          result.errors.push(rule.message || error);
          result.failedRules.push(rule);
        }
      } catch {
        result.valid = false;
        result.errors = result.errors || [];
        result.failedRules = result.failedRules || [];
        result.errors.push(rule.message || `验证规则 ${rule.type} 执行失败`);
        result.failedRules.push(rule);
      }
    }

    return result;
  }

  /**
   * 转换参数数组为对象
   */
  private convertParamsToRecord(
    params?: ValidationRuleParam[],
  ): Record<string, any> {
    if (!params) return {};

    const record: Record<string, any> = {};
    params.forEach((param) => {
      record[param.key] = param.value;
    });
    return record;
  }

  /**
   * 自定义验证
   */
  private async validateCustom(
    value: any,
    rule: ValidationRule,
  ): Promise<null | string> {
    if (!rule.customValidator) {
      return '自定义验证器名称不能为空';
    }

    const validator = this.customValidators.get(rule.customValidator);
    if (!validator) {
      return `自定义验证器 ${rule.customValidator} 未找到`;
    }

    try {
      const params = this.convertParamsToRecord(rule.params);
      const result = await validator(value, params);
      return result;
    } catch (error) {
      return `自定义验证器执行失败: ${error}`;
    }
  }

  /**
   * 日期验证
   */
  private validateDate(value: any, params: Record<string, any>): null | string {
    if (!value) return null;

    const date = dayjs(value);
    if (!date.isValid()) {
      return '请输入有效的日期';
    }

    const minDate = params.minDate;
    const maxDate = params.maxDate;

    if (minDate) {
      const min = dayjs(minDate);
      if (min.isValid() && date.isBefore(min)) {
        return `日期不能早于 ${min.format('YYYY-MM-DD')}`;
      }
    }

    if (maxDate) {
      const max = dayjs(maxDate);
      if (max.isValid() && date.isAfter(max)) {
        return `日期不能晚于 ${max.format('YYYY-MM-DD')}`;
      }
    }

    return null;
  }

  /**
   * 日期时间验证
   */
  private validateDateTime(
    value: any,
    params: Record<string, any>,
  ): null | string {
    if (!value) return null;

    const datetime = dayjs(value);
    if (!datetime.isValid()) {
      return '请输入有效的日期时间';
    }

    const minDateTime = params.minDateTime;
    const maxDateTime = params.maxDateTime;

    if (minDateTime) {
      const min = dayjs(minDateTime);
      if (min.isValid() && datetime.isBefore(min)) {
        return `日期时间不能早于 ${min.format('YYYY-MM-DD HH:mm:ss')}`;
      }
    }

    if (maxDateTime) {
      const max = dayjs(maxDateTime);
      if (max.isValid() && datetime.isAfter(max)) {
        return `日期时间不能晚于 ${max.format('YYYY-MM-DD HH:mm:ss')}`;
      }
    }

    return null;
  }

  /**
   * 邮箱验证
   */
  private validateEmail(value: any): null | string {
    if (!value) return null;

    const emailRegex = /^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(String(value))) {
      return '请输入有效的邮箱地址';
    }

    return null;
  }

  /**
   * 枚举验证
   */
  private validateEnum(value: any, params: Record<string, any>): null | string {
    if (value === null || value === undefined) return null;

    const options = params.options;
    if (!Array.isArray(options)) {
      return '枚举选项必须是数组';
    }

    if (!options.includes(value)) {
      return `值必须是以下选项之一: ${options.join(', ')}`;
    }

    return null;
  }

  /**
   * 最大值验证
   */
  private validateMax(value: any, params: Record<string, any>): null | string {
    if (value === null || value === undefined) return null;

    const max = params.value;
    if (typeof max !== 'number') {
      return '最大值参数必须是数字';
    }

    if (typeof value === 'number') {
      return value <= max ? null : `值不能大于 ${max}`;
    }

    if (typeof value === 'string') {
      return value.length <= max ? null : `长度不能超过 ${max} 个字符`;
    }

    if (Array.isArray(value)) {
      return value.length <= max ? null : `最多只能有 ${max} 个项目`;
    }

    return null;
  }

  /**
   * 最小值验证
   */
  private validateMin(value: any, params: Record<string, any>): null | string {
    if (value === null || value === undefined) return null;

    const min = params.value;
    if (typeof min !== 'number') {
      return '最小值参数必须是数字';
    }

    if (typeof value === 'number') {
      return value >= min ? null : `值不能小于 ${min}`;
    }

    if (typeof value === 'string') {
      return value.length >= min ? null : `长度不能少于 ${min} 个字符`;
    }

    if (Array.isArray(value)) {
      return value.length >= min ? null : `至少需要 ${min} 个项目`;
    }

    return null;
  }

  /**
   * 数字验证
   */
  private validateNumber(
    value: any,
    params: Record<string, any>,
  ): null | string {
    if (value === null || value === undefined || value === '') {
      return null; // 空值由required规则处理
    }

    let num: number;

    if (typeof value === 'number') {
      num = value;
    } else if (typeof value === 'string') {
      num = Number(value);
      if (Number.isNaN(num)) {
        return '值必须是数字类型';
      }
    } else {
      return '值必须是数字类型';
    }

    const min = params.min;
    const max = params.max;
    const integer = params.integer;

    if (integer && !Number.isInteger(num)) {
      return '值必须是整数';
    }

    if (typeof min === 'number' && num < min) {
      return `数值不能小于 ${min}`;
    }

    if (typeof max === 'number' && num > max) {
      return `数值不能大于 ${max}`;
    }

    return null;
  }

  /**
   * 正则表达式验证
   */
  private validatePattern(
    value: any,
    params: Record<string, any>,
  ): null | string {
    if (!value) return null;

    const pattern = params.pattern;
    if (!pattern) {
      return '正则表达式不能为空';
    }

    let regex: RegExp;

    // 使用缓存提高性能
    if (this.patternCache.has(pattern)) {
      regex = this.patternCache.get(pattern)!;
    } else {
      try {
        regex = new RegExp(pattern);
        this.patternCache.set(pattern, regex);
      } catch {
        return '正则表达式格式错误';
      }
    }

    if (!regex.test(String(value))) {
      return '输入格式不正确';
    }

    return null;
  }

  /**
   * 范围验证
   */
  private validateRange(
    value: any,
    params: Record<string, any>,
  ): null | string {
    if (value === null || value === undefined) return null;

    const min = params.min;
    const max = params.max;

    if (typeof min !== 'number' || typeof max !== 'number') {
      return '范围参数必须是数字';
    }

    if (typeof value === 'number') {
      if (value < min || value > max) {
        return `值必须在 ${min} 到 ${max} 之间`;
      }
    } else if (typeof value === 'string') {
      const len = value.length;
      if (len < min || len > max) {
        return `长度必须在 ${min} 到 ${max} 个字符之间`;
      }
    }

    return null;
  }

  /**
   * 必填验证
   */
  private validateRequired(value: any): null | string {
    if (value === null || value === undefined) {
      return '此字段为必填项';
    }

    if (typeof value === 'string' && value.trim() === '') {
      return '此字段为必填项';
    }

    if (Array.isArray(value) && value.length === 0) {
      return '此字段为必填项';
    }

    return null;
  }

  /**
   * 验证单个规则
   */
  private async validateRule(
    value: any,
    rule: ValidationRule,
  ): Promise<null | string> {
    const params = this.convertParamsToRecord(rule.params);

    switch (rule.type) {
      case 'custom': {
        return await this.validateCustom(value, rule);
      }
      case 'date': {
        return this.validateDate(value, params);
      }
      case 'datetime': {
        return this.validateDateTime(value, params);
      }
      case 'email': {
        return this.validateEmail(value);
      }
      case 'enum': {
        return this.validateEnum(value, params);
      }
      case 'max': {
        return this.validateMax(value, params);
      }
      case 'min': {
        return this.validateMin(value, params);
      }
      case 'number': {
        return this.validateNumber(value, params);
      }
      case 'pattern': {
        return this.validatePattern(value, params);
      }
      case 'range': {
        return this.validateRange(value, params);
      }
      case 'required': {
        return this.validateRequired(value);
      }
      case 'string': {
        return this.validateString(value, params);
      }
      case 'url': {
        return this.validateURL(value);
      }
      default: {
        return `未知的验证规则类型: ${rule.type}`;
      }
    }
  }

  /**
   * 字符串验证
   */
  private validateString(
    value: any,
    params: Record<string, any>,
  ): null | string {
    if (value === null || value === undefined) {
      return null; // 空值由required规则处理
    }

    const str = String(value);
    const minLength = params.minLength;
    const maxLength = params.maxLength;

    if (typeof minLength === 'number' && str.length < minLength) {
      return `字符串长度不能少于 ${minLength} 个字符`;
    }

    if (typeof maxLength === 'number' && str.length > maxLength) {
      return `字符串长度不能超过 ${maxLength} 个字符`;
    }

    return null;
  }

  /**
   * URL验证
   */
  private validateURL(value: any): null | string {
    if (!value) return null;

    try {
      new URL(String(value));
      return null;
    } catch {
      return '请输入有效的URL地址';
    }
  }
}

// 创建全局验证器实例
export const validator = new Validator();
