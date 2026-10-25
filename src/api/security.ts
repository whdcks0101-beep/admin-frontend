// URL 검증은 CSRF 토큰을 넣기 전에 수행합니다. 인증용 클라이언트는 내부 API 전용입니다.
export function assertInternalApiPath(path: string): void {
  if (!path.startsWith('/') || path.startsWith('//') || /[\\?#%\s]/.test(path)
    || path.split('/').some((part) => part === '.' || part === '..')) {
    throw new Error('허용되지 않은 API 경로입니다.');
  }
}

export function resolveBackendOrigin(configured: string | undefined, pageOrigin: string): string {
  const page = new URL(pageOrigin);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(page.hostname);
  const backend = new URL(configured || (local ? 'http://localhost:8080' : page.origin));
  if (!['http:', 'https:'].includes(backend.protocol) || backend.username || backend.password
    || backend.pathname !== '/' || backend.search || backend.hash) {
    throw new Error('백엔드 설정에는 올바른 서버 origin만 입력해 주세요.');
  }
  if (backend.protocol !== 'https:' && (!local || !['localhost', '127.0.0.1', '[::1]'].includes(backend.hostname))) {
    throw new Error('로컬 개발 외 환경에서는 HTTPS 백엔드가 필요합니다.');
  }
  return backend.origin;
}
