import { describe, expect, it } from 'vitest';
import { assertInternalApiPath, resolveBackendOrigin } from '../src/api/security';

describe('인증 API 경로 제한', () => {
  it.each(['/users', '/products/1', '/auth/me'])('내부 경로 %s 허용', (path) => {
    expect(() => assertInternalApiPath(path)).not.toThrow();
  });
  it.each(['https://evil.example', '//evil.example', '/../../login', '/a/../users',
    '/%2e%2e/users', '/users?q=1', '/users#hash', '/a\\b', 'users', '/ users'])(
    '외부 주소 또는 우회 경로 %s 거부', (path) => {
      expect(() => assertInternalApiPath(path)).toThrow();
    });
});

describe('환경별 백엔드 주소', () => {
  it('로컬 개발 기본 주소를 유지한다', () => {
    expect(resolveBackendOrigin(undefined, 'http://localhost:5173')).toBe('http://localhost:8080');
  });
  it('배포 환경 기본 주소는 HTTPS 동일 출처다', () => {
    expect(resolveBackendOrigin(undefined, 'https://app.example')).toBe('https://app.example');
  });
  it('명시한 HTTPS API 서버를 허용한다', () => {
    expect(resolveBackendOrigin('https://api.example/', 'https://app.example')).toBe('https://api.example');
  });
  it.each(['http://api.example', 'https://user:password@api.example',
    'https://api.example/api', 'https://api.example?key=secret', 'javascript:alert(1)'])(
    '안전하지 않거나 origin이 아닌 설정 %s 거부', (origin) => {
      expect(() => resolveBackendOrigin(origin, 'https://app.example')).toThrow();
    });
});
