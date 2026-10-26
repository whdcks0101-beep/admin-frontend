import { BrowserRouter, Routes, Route, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AUTH_URLS } from './api/config';
import UserManagement from './pages/user/UserManagement';
import useAuthStore from './store/useAuthStore';
import ProtectedRoute from './common/layout/ProtectedRoute';
import DashboardHome from './pages/home/DashBoardHome';
import SurveyCreate from './pages/survey/SurveyCreate';
import InventoryManagement from './pages/inventory/InventoryManagement';
import OrderCreate from './pages/order/OrderCreate';
import OrderList from './pages/order/OrderList';
import OrderDetail from './pages/order/OrderDetail';
import RequireAuthority from './common/layout/RequireAuthority';
import OrderStatistics from './pages/order/OrderStatistics';

function AdminLayout() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.authorities.includes('ROLE_ADMIN') ?? false;
  const isDemoAdmin = user?.authorities.includes('ROLE_DEMO_ADMIN') ?? false;
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const links = [
    { to: '/', label: '대시보드', mark: '◫', end: true },
    { to: '/inventories', label: '상품·재고 관리', mark: '▦' },
    { to: '/orders', label: '주문 내역', mark: '≡', end: true },
    { to: '/orders/new', label: '주문 생성', mark: '+' },
    { to: '/order-statistics', label: '주문 통계', mark: '▥' },
    ...(isAdmin ? [{ to: '/users', label: '회원 관리', mark: '♙' }] : []),
  ];
  const activeLabel = links.find((link) => link.to === location.pathname)?.label
    ?? (location.pathname.startsWith('/orders/') ? '주문 상세' : '워크스페이스');
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">본문으로 이동</a>
    {menuOpen && <button className="sidebar-scrim" aria-label="메뉴 닫기" onClick={() => setMenuOpen(false)} />}
    <aside id="app-navigation" className={`app-sidebar ${menuOpen ? 'is-open' : ''}`}>
      <NavLink to="/" className="brand" onClick={() => setMenuOpen(false)}>
        <span className="brand-symbol">a<span>·</span></span>
        <span>admin<span className="brand-sub">OPERATIONS CONSOLE</span></span>
      </NavLink>
      <div className="workspace-tag"><span className="status-dot" /> Portfolio workspace</div>
      <div className="nav-caption">WORKSPACE</div>
      <nav aria-label="주요 메뉴">
        {links.map((link) => <NavLink key={link.to} to={link.to} end={link.end}
          onClick={() => setMenuOpen(false)}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="nav-icon" aria-hidden="true">{link.mark}</span>{link.label}
        </NavLink>)}
      </nav>
      <div className="sidebar-footer"><span className="sidebar-footer-icon">?</span>
        <div>작은 개선, 더 나은 운영<small>상품부터 주문까지 한곳에서</small></div>
      </div>
    </aside>
    <div className="app-main">
      <header className="app-topbar">
        <div className="topbar-location">
          <button className="btn mobile-toggle" aria-label="메뉴 열기" aria-expanded={menuOpen}
            aria-controls="app-navigation" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          <span className="breadcrumb-root">워크스페이스</span><span className="breadcrumb-divider">/</span>
          <span>{activeLabel}</span>
        </div>
        <div className="account-area">
          {user ? <>
            <span className="account-avatar" aria-hidden="true">{user.username.slice(0, 1).toUpperCase()}</span>
            <div className="account-info"><strong>{user.username}</strong><small>{isAdmin ? '관리자' : isDemoAdmin ? '체험 관리자' : '사용자'}</small></div>
            <a className="btn btn-light btn-sm" href={AUTH_URLS.logout}>로그아웃</a>
          </> : <>
            <span className="text-secondary login-hint">로그인 후 이용해 주세요</span>
            <a className="btn btn-light btn-sm" href={AUTH_URLS.login}>이메일 로그인</a>
            <a className="btn btn-primary btn-sm" href={AUTH_URLS.sso}>SSO 로그인</a>
          </>}
        </div>
      </header>
      <main id="main-content" className="page-content">{isDemoAdmin && <div className="alert alert-info">체험 관리자 계정입니다. 상품·재고·주문 기능을 체험할 수 있으며 회원 조회·수정·삭제와 권한 변경은 제한됩니다. 공용 샘플 데이터이므로 다른 방문자의 변경이 반영될 수 있습니다.</div>}<Outlet /></main>
      <footer className="app-footer"><span>ADMIN WORKSPACE</span><span>상품 · 재고 · 주문 관리</span></footer>
    </div>
  </div>;
}
export default function App() {
  return <BrowserRouter><Routes><Route path="/" element={<AdminLayout />}>
    <Route index element={<DashboardHome />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<RequireAuthority authority="ROLE_ADMIN" />}>
        <Route path="users" element={<UserManagement />} />
      </Route>
      <Route path="products" element={<Navigate to="/inventories" replace />} />
      <Route path="/survey/create" element={<SurveyCreate />} />
      <Route path="inventories" element={<InventoryManagement />} />
      <Route path="orders/new" element={<OrderCreate />} />
      <Route path="orders" element={<OrderList />} />
      <Route path="orders/:orderId" element={<OrderDetail />} />
      <Route element={<RequireAuthority authority="ROLE_USER" />}>
        <Route path="order-statistics" element={<OrderStatistics />} />
      </Route>      
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Route></Routes></BrowserRouter>;
}
