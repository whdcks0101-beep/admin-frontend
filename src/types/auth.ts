export interface CurrentUserResponse {
  username: string;
  authorities: string[];
}

export interface CsrfTokenResponse {
  headerName: string;
  parameterName: string;
  token: string;
}