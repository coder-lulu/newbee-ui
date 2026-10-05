/**
 *  @description: OauthProvider info response
 */
export interface OauthProviderInfo {
  // 基础字段
  id?: number;
  createdAt?: number;
  updatedAt?: number;
  name?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUrl?: string;
  scopes?: string;
  authUrl?: string;
  tokenUrl?: string;
  authStyle?: number;
  infoUrl?: string;

  // 增强字段 - 重构后新增
  displayName?: string;
  type?: string;
  providerType?: string;
  enabled?: boolean;
  sort?: number;
  remark?: string;
  supportPkce?: boolean;
  iconUrl?: string;
  cacheTtl?: number;
  webhookUrl?: string;
  successCount?: number;
  failureCount?: number;
  lastUsedAt?: number;

  // 状态字段
  status?: "active" | "error" | "inactive";
  responseTime?: number;
}

/**
 *  @description: Oauth log in request parameters
 */
export interface OauthLoginReq {
  state: string;
  provider: string;
}

/**
 *  @description: redirect information
 */
export interface RedirectInfo {
  URL: string;
}

/**
 *  @description: OAuth账户信息
 */
export interface OauthAccountInfo {
  id?: number;
  createdAt?: number;
  updatedAt?: number;
  userId?: string;
  providerId?: number;
  providerType?: string;
  providerUserId?: string;
  providerUsername?: string;
  providerNickname?: string;
  providerEmail?: string;
  providerAvatar?: string;
  tokenExpiresAt?: number;
  lastLoginAt?: number;
  lastLoginIp?: string;
  loginCount?: number;
}

/**
 *  @description: 用户OAuth提供商信息
 */
export interface UserOauthProviderInfo {
  id: number;
  name: string;
  displayName: string;
  type: string;
  iconUrl?: string;
  isBound: boolean;
  boundAccount?: UserBoundAccountInfo;
}

/**
 *  @description: 用户绑定账户信息
 */
export interface UserBoundAccountInfo {
  providerUsername?: string;
  providerNickname?: string;
  providerEmail?: string;
  providerAvatar?: string;
  lastLoginAt?: number;
  loginCount: number;
}

/**
 *  @description: OAuth统计信息
 */
export interface OauthStatistics {
  totalProviders: number;
  totalUsers: number;
  totalLogins: number;
  todayLogins: number;
  avgResponseTime: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  successRate: number;
  providerStats: ProviderStatistic[];
  loginTrend: LoginTrendData[];
}
export interface ProviderStatistic {
  providerId: number;
  providerName: string;
  displayName: string;
  type: string;
  iconUrl?: string;
  totalUsage: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgResponseTime: number;
  lastUsed?: number;
}
export interface LoginTrendData {
  date: string;
  count: number;
  successCount: number;
  failureCount: number;
}

/**
 *  @description: OAuth Provider测试结果
 */
export interface OauthProviderTestResult {
  connected: boolean;
  testUrl: string;
  errorMessage?: string;
  responseTime: number;
}
