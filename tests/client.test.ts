import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
vi.mock('../src/api/config', () => ({ API_BASE_URL: 'http://localhost:8080/api' }));
import apiClient, { clearAuthentication, setCsrfToken } from '../src/api/client';
import useAuthStore from '../src/store/useAuthStore';

const success = (config: InternalAxiosRequestConfig) => ({
  data: {}, status: 200, statusText: 'OK', headers: {}, config,
});
const fail = (config: InternalAxiosRequestConfig, status: number) => {
  throw new AxiosError('요청 거부', 'ERR_BAD_REQUEST', config, undefined, {
    ...success(config), status,
  });
};
beforeEach(() => {
  clearAuthentication();
  apiClient.defaults.adapter = vi.fn(async (config) => success(config));
});
describe('인증 API 클라이언트', () => {
  it('변경 요청에만 CSRF 토큰을 넣는다', async () => {
    setCsrfToken({ headerName: 'X-CSRF-TOKEN', parameterName: '_csrf', token: 'test-token' });
    const get = await apiClient.get('/products/1');
    const post = await apiClient.post('/orders', {});
    expect(get.config.headers.get('X-CSRF-TOKEN')).toBeUndefined();
    expect(post.config.headers.get('X-CSRF-TOKEN')).toBe('test-token');
  });
  it('외부 URL이나 baseURL 변경은 전송 전에 차단한다', async () => {
    const adapter = apiClient.defaults.adapter;
    await expect(apiClient.get('https://evil.example')).rejects.toThrow();
    await expect(apiClient.get('/users', { baseURL: 'https://evil.example' })).rejects.toThrow();
    expect(adapter).not.toHaveBeenCalled();
  });
  it('401이면 로그인 상태와 기존 CSRF 토큰을 함께 삭제한다', async () => {
    useAuthStore.getState().setCurrentUser({ username: 'tester', authorities: ['ROLE_USER'] });
    setCsrfToken({ headerName: 'X-CSRF-TOKEN', parameterName: '_csrf', token: 'old-token' });
    apiClient.defaults.adapter = async (config) => fail(config, 401);
    await expect(apiClient.get('/users')).rejects.toMatchObject({ response: { status: 401 } });
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
    apiClient.defaults.adapter = async (config) => success(config);
    const result = await apiClient.post('/orders', {});
    expect(result.config.headers.get('X-CSRF-TOKEN')).toBeUndefined();
  });
  it('권한 부족 403이면 로그인은 유지하고 변경 요청을 재전송하지 않는다', async () => {
    useAuthStore.getState().setCurrentUser({ username: 'tester', authorities: ['ROLE_USER'] });
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) =>
      config.url === '/auth/me' ? success(config) : fail(config, 403));
    apiClient.defaults.adapter = adapter;
    await expect(apiClient.post('/users', {})).rejects.toMatchObject({ response: { status: 403 } });
    expect(useAuthStore.getState().isLoggedIn).toBe(true);
    expect(adapter.mock.calls.map(([config]) => config.url)).toEqual(['/users', '/auth/me']);
  });
  it('403 이후 세션 확인이 401이면 만료로 처리한다', async () => {
    useAuthStore.getState().setCurrentUser({ username: 'tester', authorities: ['ROLE_USER'] });
    apiClient.defaults.adapter = async (config) => fail(config, config.url === '/auth/me' ? 401 : 403);
    await expect(apiClient.delete('/users/1')).rejects.toMatchObject({ response: { status: 401 } });
    expect(useAuthStore.getState().user).toBeNull();
  });
  it('동시 403 응답의 세션 확인을 하나로 합친다', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
      if (config.url !== '/auth/me') return fail(config, 403);
      await gate;
      return success(config);
    });
    apiClient.defaults.adapter = adapter;
    const requests = Promise.allSettled([apiClient.get('/users'), apiClient.get('/orders')]);
    await vi.waitFor(() => expect(adapter).toHaveBeenCalledTimes(3));
    release();
    const results = await requests;
    expect(results.every((result) => result.status === 'rejected')).toBe(true);
    expect(adapter.mock.calls.filter(([config]) => config.url === '/auth/me')).toHaveLength(1);
  });
});
