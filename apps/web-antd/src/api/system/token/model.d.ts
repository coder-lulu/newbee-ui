/**
 *  @description: Token info response
 */
export interface TokenInfo {
  id?: string;
  createdAt?: number;
  updatedAt?: number;
  status?: number;
  uuid?: string;
  token?: string;
  source?: string;
  expiredAt?: number;
  username?: string;
}
