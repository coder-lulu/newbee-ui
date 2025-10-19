import type { GrantType } from '@vben/common-ui';

import { useAppConfig } from '@vben/hooks';

import { requestClient } from '#/api/request';

const { sseEnable } = useAppConfig(import.meta.env, import.meta.env.PROD);

export namespace AuthApi {
  /**
   * @description: 所有登录类型都需要用到的
   * @param clientId 客户端ID 这里为必填项 但是在loginApi内部处理了 所以为可选
   * @param grantType 授权/登录类型
   * @param tenantId 租户id
   */
  export interface BaseLoginParams {
    clientId?: string;
    grantType: GrantType;
    tenantId: number;
  }

  /**
   * @description: 验证码登录参数
   * @param captcha 验证码
   * @param captchaId 验证码ID
   * @param username 用户名
   * @param password 密码
   */
  export interface CaptchaLoginParams extends BaseLoginParams {
    username: string;
    password: string;
    captcha: string;
    captchaId: string;
    
  }

  /**
   * @description: oauth登录需要用到的参数
   * @param socialCode 第三方参数
   * @param socialState 第三方参数
   * @param source 与后端的 justauth.type.xxx的回调地址的source对应
   */
  export interface OAuthLoginParams extends BaseLoginParams {
    socialCode: string;
    socialState: string;
    source: string;
  }

  /**
   * @description: 验证码登录需要用到的参数
   * @param code 验证码 可选(未开启验证码情况)
   * @param uuid 验证码ID 可选(未开启验证码情况)
   * @param username 用户名
   * @param password 密码
   */
  export interface SimpleLoginParams extends BaseLoginParams {
    code?: string;
    uuid?: string;
    username: string;
    password: string;
  }

  export interface EmailLoginParams extends BaseLoginParams {
    email: string;
    captcha: string;
  }

  export interface SmsLoginParams extends BaseLoginParams {
    phoneNumber: string;
    captcha: string;
  }

  export type LoginParams =
    | CaptchaLoginParams
    | EmailLoginParams
    | OAuthLoginParams
    | SimpleLoginParams
    | SmsLoginParams;

  // /** 登录接口参数 */
  // export interface LoginParams {
  //   code?: string;
  //   grantType: string;
  //   password: string;
  //   tenantId: string;
  //   username: string;
  //   uuid?: string;
  // }

  /** 登录接口返回值 */
  export interface LoginResult {
    token: string;
    userId: string;
    expire: number;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>(
    '/sys-api/user/login',
    { ...data },
    {
      encrypt: false,
    },
  );
}

/**
 * @description: User login by email api
 */
export async function loginByEmail(data: AuthApi.EmailLoginParams) {
  return requestClient.post<AuthApi.LoginResult>(
    '/sys-api/user/login_by_email',
    { ...data },
    {
      encrypt: false,
    },
  );
}

/**
 * @description: User login by sms api
 */
export async function loginBySms(data: AuthApi.SmsLoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/sys-api/user/login_by_sms', {
    ...data,
  });
}

/**
 * 用户登出
 * @returns void
 */
export function doLogout() {
  return requestClient.get<void>('/sys-api/user/logout');
  
  
}
/**
 * 关闭sse连接
 * @returns void
 */
export function seeConnectionClose() {
  /**
   * 未开启sse 不需要处理
   */
  if (!sseEnable) {
    return;
  }
  return requestClient.get<void>('/resource/sse/close');
}

/**
 * @param companyName 租户/公司名称
 * @param domain 绑定域名(不带http(s)://) 可选
 * @param tenantId 租户id
 */
export interface TenantOption {
  companyName: string;
  domain?: string;
  tenantId: string;
}

/**
 * @param tenantEnabled 是否启用租户
 * @param voList 租户列表
 */
export interface TenantResp {
  tenantEnabled: boolean;
  voList: TenantOption[];
}

/**
 * @description: Register interface parameters
 */
export interface RegisterReq {
  username: string;
  password: string;
  email: string;
  captcha: string;
  captchaId: string;
}

/**
 * @description: Register by email interface parameters
 */
export interface RegisterByEmailReq {
  username: string;
  password: string;
  email: string;
  captcha: string;
}

/**
 * @description: Register by sms interface parameters
 */
export interface RegisterBySmsReq {
  username: string;
  password: string;
  phoneNumber: string;
  captcha: string;
}

/**
 * 获取租户列表 下拉框使用
 */
export function tenantList() {
  return requestClient.get<TenantResp>('/sys-api/auth/tenant/list');
}

/**
 * 获取租户选择列表（公开接口，不需要授权）
 * 仅返回租户ID和名称，用于登录页面展示
 */
export function getTenantSelectList() {
  return requestClient.get<TenantResp>('/tenant/unauth-list');
}

/**
 * vben的 先不删除
 * @returns string[]
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/sys-api/auth/codes');
}

/**
 * 绑定第三方账号
 * @param source 绑定的来源
 * @returns 跳转url
 */
export function authBinding(source: string, tenantId: string) {
  return requestClient.get<string>(`/sys-api/auth/binding/${source}`, {
    params: {
      domain: window.location.host,
      tenantId,
    },
  });
}

/**
 * 取消绑定
 * @param id id
 */
export function authUnbinding(id: string) {
  return requestClient.deleteWithMsg<void>(`/sys-api/auth/unlock/${id}`);
}

/**
 * oauth授权回调
 * @param data oauth授权
 * @returns void
 */
export function authCallback(data: AuthApi.OAuthLoginParams) {
  return requestClient.post<void>('/sys-api/auth/social/callback', data);
}

/**
 * @description: User register api
 */
export function register(data: RegisterReq) {
  return requestClient.post<void>('/sys-api/user/register', data);
}

/**
 * @description: User register by email api
 */
export function registerByEmail(data: RegisterByEmailReq) {
  return requestClient.post<void>('/sys-api/user/register_by_email', data);
}

/**
 * @description: User register by Sms api
 */
export function registerBySms(data: RegisterBySmsReq) {
  return requestClient.post<void>('/sys-api/user/register_by_sms', data);
}
