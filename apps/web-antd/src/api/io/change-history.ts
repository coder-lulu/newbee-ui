import { requestClient } from "#/api/request";

export interface ChangeHistoryInfo {
  id: number;
  operationId: string;
  ciId?: number;
  ciTypeId?: number;
  operationType: string;
  operationName?: string;
  operatorId?: number;
  operatorName?: string;
  source?: string;
  sourceDetail?: string;
  changeReason?: string;
  status: string;
  affectedCount: number;
  needsApproval: boolean;
  isApproved?: boolean;
  canRollback: boolean;
  createdAt: string;
}

export interface ChangeHistoryListReq {
  page: number;
  pageSize: number;
  ciId?: number;
  operationType?: string;
  operatorName?: string;
  source?: string;
  status?: string;
  needsApproval?: boolean;
}

export function getChangeHistoryList(params: ChangeHistoryListReq) {
  return requestClient.post<{ data: ChangeHistoryInfo[]; total: number }>(
    "/io-api/change-history/list",
    params,
  );
}
