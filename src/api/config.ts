import { resolveBackendOrigin } from './security';

export const BACKEND_ORIGIN = resolveBackendOrigin(import.meta.env.VITE_BACKEND_ORIGIN, window.location.origin);
export const API_BASE_URL = `${BACKEND_ORIGIN}/api`;
export const AUTH_URLS = {
  login: `${BACKEND_ORIGIN}/login`,
  logout: `${BACKEND_ORIGIN}/logout`,
  sso: `${BACKEND_ORIGIN}/oauth2/authorization/keycloak`,
} as const;
