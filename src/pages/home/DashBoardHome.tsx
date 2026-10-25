import { Link } from 'react-router-dom';
import { AUTH_URLS } from '../../api/config';
import PageHeader from '../../common/components/PageHeader';
import useAuthStore from '../../store/useAuthStore';

export default function DashboardHome() {
  const user = useAuthStore((state) => state.user);
  return <section>
    <PageHeader title="대시보드" description="오늘의 운영을 시작하는 공간입니다." />
    <div className="welcome-panel">
      <div><div className="eyebrow mb-3">YOUR DAILY WORKSPACE</div>
        <h2>필요한 업무에, 더 가까이.</h2>
        <p>상품과 재고를 확인하고 주문을 관리하세요.<br />한곳에 모인 정보로 더 간결하게 일할 수 있습니다.</p>
      </div>
      {user ? <Link className="btn btn-primary" to="/inventories">상품·재고 확인하기 <span aria-hidden="true">↗</span></Link>
        : <a className="btn btn-primary" href={AUTH_URLS.login}>이메일 로그인 <span aria-hidden="true">→</span></a>}
    </div>
    <div className="quick-links">
      <Link className="quick-link" to="/inventories"><b aria-hidden="true">▦</b><strong>상품·재고 관리</strong><span>상품 정보를 수정하고<br />현재 재고와 입출고를 확인하세요.</span></Link>
      <Link className="quick-link" to="/orders"><b aria-hidden="true">≡</b><strong>주문 내역</strong><span>기간과 주문 번호로 검색하고<br />주문별 상세 항목을 확인하세요.</span></Link>
      <Link className="quick-link" to="/orders/new"><b aria-hidden="true">＋</b><strong>새 주문 생성</strong><span>판매 가능한 상품을 선택해<br />새로운 주문을 등록하세요.</span></Link>
    </div>
    <div className="home-note"><strong>운영 안내</strong><br />
      상품 등록·수정과 입출고, 회원 관리는 관리자 권한으로 이용할 수 있습니다.
      {!user && <><br />업무 메뉴를 이용하려면 먼저 로그인해 주세요.</>}
      <br />이 화면은 업무 바로가기를 제공합니다. 매출 통계는 아직 연동되지 않았습니다.
    </div>
  </section>;
}
