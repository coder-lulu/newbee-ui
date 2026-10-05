import { requestClient } from "#/api/request";

export interface DataTargetInfo {
  id: number;
  targetName: string;
  targetType: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}
export interface DataTargetListReq {
  page: number;
  pageSize: number;
  keyword?: string;
  targetType?: string;
}
export function getDataTargetList(params: DataTargetListReq) {
  return requestClient.post<{ data: DataTargetInfo[]; total: number }>(
    "/io-api/data_target/list",
    params,
  );
}
