import { requestClient } from "#/api/request";

export interface LifecycleStateInfo {
  id: number;
  stateId: string;
  ciId?: number;
  ciTypeId?: number;
  stateName: string;
  stateType: string;
  previousState?: string;
  enteredAt: string;
  exitedAt?: string;
  durationSeconds: number;
  triggerType: string;
  triggeredBy?: number;
  triggeredByName?: string;
  isCurrent: boolean;
  isFinal: boolean;
  isTimeout: boolean;
  hasError: boolean;
  errorMessage?: string;
  canRetry: boolean;
}

export interface LifecycleStateListReq {
  page: number;
  pageSize: number;
  ciId?: number;
  stateType?: string;
  triggerType?: string;
  isCurrent?: boolean;
  isTimeout?: boolean;
  hasError?: boolean;
}

export function getLifecycleStateList(params: LifecycleStateListReq) {
  return requestClient.post<{ data: LifecycleStateInfo[]; total: number }>(
    "/io-api/lifecycle-state/list",
    params,
  );
}
