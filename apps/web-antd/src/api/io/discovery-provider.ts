import { requestClient } from '#/api/request';

export namespace DiscoveryProviderAPI {
  // Provider元数据
  export interface ProviderMetadata {
    id: string;
    name: string;
    category: string;
    description?: string;
    version?: string;
    icon?: string;
  }

  // 参数定义
  export interface ParameterDefinition {
    name: string;
    label: string;
    type: string;
    required: boolean;
    defaultValue?: any;
    placeholder?: string;
    options?: string[];
    description?: string;
  }

  // 字段定义
  export interface FieldDefinition {
    name: string;
    label: string;
    dataType: string;
    required: boolean;
    description?: string;
    example?: string;
  }

  // Provider Schema详细信息
  export interface ProviderSchemaInfo {
    id: string;
    providerId: string;
    providerName: string;
    category: string;
    description?: string;
    version?: string;
    iconUrl?: string;
    parameterSchema: ParameterDefinition[];
    fieldSchema: FieldDefinition[];
    isActive: boolean;
    isBuiltin: boolean;
    executionMode: string;
  }

  // 连接测试请求
  export interface TestConnectionReq {
    providerId: string;
    config: Record<string, any>;
  }

  // 连接测试响应
  export interface TestConnectionData {
    success: boolean;
    message?: string;
  }

  /**
   * 获取所有发现Provider列表
   */
  export function listProviders() {
    return requestClient.post<ProviderMetadata[]>('/io-rpc/discoveryprovider/list_discovery_providers', {});
  }

  /**
   * 获取指定Provider的Schema
   */
  export function getProviderSchema(providerId: string) {
    return requestClient.post<ProviderSchemaInfo>(
      '/io-rpc/discoveryprovider/get_provider_schema',
      { provider_id: providerId }
    );
  }

  /**
   * 测试Provider连接
   */
  export function testConnection(data: TestConnectionReq) {
    return requestClient.post<TestConnectionData>(
      '/io-rpc/discoveryprovider/test_provider_connection',
      {
        provider_id: data.providerId,
        config: JSON.stringify(data.config)
      }
    );
  }
}
