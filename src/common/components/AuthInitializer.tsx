import axios from 'axios';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getCurrentUser, getCsrfToken } from '../../api/auth';
import useAuthStore from '../../store/useAuthStore';
import { clearAuthentication, setCsrfToken } from '../../api/client';

interface AuthInitializerProps {
  children: ReactNode;
}

export default function AuthInitializer({
  children,
}: AuthInitializerProps) {
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let active = true;

    async function initializeAuth() {
      try {
        const user = await getCurrentUser();

        if (!active) return;

        const csrf = await getCsrfToken();

        if (!active) return;

        // 토큰은 메모리에만 보관하고, 내부 API의 변경 요청에만 첨부합니다.
        setCsrfToken(csrf);

        setCurrentUser(user);
        setStatus('ready');
      } catch (error: unknown) {
        if (!active) return;

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearAuthentication();
          setStatus('ready');
          return;
        }

        setStatus('error');
      }
    }

    void initializeAuth();

    return () => {
      active = false;
    };
  }, [setCurrentUser]);

  if (status === 'loading') {
    return <div className="auth-state"><div className="spinner-border text-primary mx-auto" role="status" /><p>로그인 상태를 확인하고 있습니다.</p></div>;
  }

  if (status === 'error') {
    return (
      <div className="auth-state">
        <p>로그인 상태를 확인하지 못했습니다. 서버 연결을 확인해 주세요.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          다시 시도
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
