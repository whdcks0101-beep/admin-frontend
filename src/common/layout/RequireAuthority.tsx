import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import Feedback from '../components/Feedback';

interface RequireAuthorityProps {
  authority: string;
}

export default function RequireAuthority({authority,}: RequireAuthorityProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!user.authorities.includes(authority)) {
    return <Feedback kind="error">이 페이지에 접근할 권한이 없습니다.</Feedback>;
  }

  return <Outlet />;
}
