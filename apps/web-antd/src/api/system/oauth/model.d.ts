/**
 *  @description: OauthProvider info response
 */
export interface OauthProviderInfo {
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
