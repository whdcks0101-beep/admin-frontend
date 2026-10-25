# 관리자 UI 공통 규칙

Bootstrap 5 CSS와 `src/index.css`의 프로젝트 테마를 사용합니다. Bootstrap JavaScript는 로드하지 않습니다.
React 상태로 동작을 관리하며 모달은 네이티브 dialog를 사용합니다.

## 공통 컴포넌트

- `PageHeader`: 페이지 제목, 설명, 우측 주요 작업 버튼.
- `SearchPanel`: 검색 필드, 검색/초기화 버튼 배치. 검색 로직은 페이지가 소유합니다.
- `TablePanel`: 목록 제목/건수, 가로 스크롤, 하단 페이징. 실제 열과 행은 각 화면이 구성합니다.
- `Feedback`: 로딩, 오류, 빈 목록, 성공 안내.
- `Modal`: 제목/설명, 키보드 포커스 제한, Escape 닫기, 닫은 후 포커스 복원. 저장 중에는 busy를 전달합니다.
- `Pagination`: 이전/다음과 현재 페이지 표시.

## 스타일 규칙

- 버튼: `btn btn-primary` (주요 동작), `btn btn-light` (보조), `btn btn-outline-danger` (삭제).
- 입력: `field` 라벨 안에 `form-control` 또는 `form-select`. placeholder만으로 라벨을 대체하지 않습니다.
- 테이블: `table table-hover data-table`. 숫자는 `number-cell`, 작업 버튼 묶음은 `cell-actions`.
- 상태: `status-badge`, 부족 상태는 `warning`. 색상뿐 아니라 텍스트로도 구분합니다.
- 등록/수정: `form-stack`, `form-grid`, `form-actions`를 재사용합니다.
- 화면별 inline style을 늘리기보다 공통 테마를 수정합니다.

## 현재 화면

- 상품·재고: 실제 재고 목록 기준 요약/즉시 검색/상태 필터. 상품 등록 및 수정은 모달.
- 회원: 서버 검색, 표 안에서 수정, 회원 등록 모달.
- 주문: 검색/페이지 URL 유지, 상세 보기, 주문 생성 폼.
- 대시보드: 업무 바로가기. 기존 샘플 매출 차트는 실제 통계로 오해하지 않도록 학습용으로 보관했습니다.

## 검증

`npm run build`, `npm run lint`.
관리자 로그인 후 등록/수정 모달의 필수값, 취소/Escape/포커스, 검색/초기화, 입출고 및 주문 API를 확인합니다.
UI에서 버튼을 숨기는 것은 보안 통제가 아니며 서버 권한 검사와 CSRF 처리는 기존대로 유지합니다.
Redis 상품 캐시는 상품 단건 API에 적용됩니다. 통합 재고 목록은 기존 재고 API를 사용합니다.
