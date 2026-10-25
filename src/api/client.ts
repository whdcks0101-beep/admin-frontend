import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { API_BASE_URL } from './config';
import { assertInternalApiPath } from './security';
import type { CsrfTokenResponse } from '../types/auth';

let csrfToken: CsrfTokenResponse | null = null;
export function setCsrfToken(token: CsrfTokenResponse | null) {
  csrfToken = token;
}

export function clearAuthentication() {
  csrfToken = null;
  useAuthStore.getState().setCurrentUser(null);
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, 
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  assertInternalApiPath(config.url ?? '');
  if (config.baseURL !== API_BASE_URL) throw new Error('API 서버 주소 변경은 허용되지 않습니다.');
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() ?? '')) {
    config.headers.set(csrfToken.headerName, csrfToken.token);
  }
  return config;
});

let authCheck: Promise<unknown> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;

    if (status === 401) {
      clearAuthentication();
      return Promise.reject(error);
    }

    if (
      status === 403 &&
      error.config?.url !== '/auth/me'
    ) {
      try {
        // 여러 403이 동시에 도착해도 세션 확인은 한 번만 수행합니다.
        authCheck ??= apiClient.get('/auth/me').finally(() => { authCheck = null; });
        await authCheck;
      } catch (authError: unknown) {
        if (
          axios.isAxiosError(authError) &&
          authError.response?.status === 401
        ) {
          return Promise.reject(authError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
