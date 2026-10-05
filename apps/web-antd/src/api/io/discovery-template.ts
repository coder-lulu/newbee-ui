import { requestClient } from "#/api/request";

export interface DiscoveryTemplateInfo {
  id: number;
  templateName: string;
  templateCode: string;
  description?: string;
  templateType: string;
  version: string;
  isPublic: boolean;
  isSystem: boolean;
  usageCount: number;
  tags?: string;
}
export interface DiscoveryTemplateListReq {
  page: number;
  pageSize: number;
  keyword?: string;
  templateType?: string;
  isPublic?: boolean;
}
export function getDiscoveryTemplateList(params: DiscoveryTemplateListReq) {
  return requestClient.post<{ data: DiscoveryTemplateInfo[]; total: number }>(
    "/io-api/discovery_template/list",
    params,
  );
}
