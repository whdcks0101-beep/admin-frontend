# Admin Portfolio | React 운영 관리 화면

Spring Boot 주문·재고 시스템을 사용하는 React + TypeScript 관리 화면입니다. 공통 검색 폼·테이블·페이징, 로그인 상태 관리와 오류 안내, 반응형 레이아웃을 구현했습니다.

**[실행 서비스](https://13-124-81-142.sslip.io) · [백엔드 및 전체 포트폴리오](https://github.com/whdcks0101-beep/admin-api) · [PDF](https://github.com/whdcks0101-beep/admin-api/blob/main/output/pdf/admin-portfolio.pdf)**

공개 체험 계정은 [체험 안내](https://github.com/whdcks0101-beep/admin-api/blob/main/docs/portfolio/demo-access.md)를 참고하세요. 체험 관리자는 상품·재고를 변경할 수 있지만 회원 관리·권한 변경은 제한됩니다. 운영 관리자 계정은 공개하지 않습니다.

## 화면과 주요 동작

- 상품·재고: 검색, 등록·수정, 안전재고 상태, 입출고
- 주문: 생성, 조건 검색·페이징, 상세 조회, 목록 검색 조건 유지
- 통계: 기간별 주문 건수 조회
- 인증: 이메일 로그인, Keycloak SSO, 로그인 만료·권한 오류 안내
- 공통: API 모듈 분리, CSRF 처리, 요청 중 중복 동작 방지

## 실행

```powershell
npm ci
npm run dev
```

기본 화면 주소는 `http://localhost:5173`이며 로컬 백엔드는 `http://localhost:8080`을 사용합니다. 백엔드와 MySQL·Redis·Kafka·Keycloak 준비는 백엔드 저장소의 실행 안내를 참고합니다.

```powershell
npm run lint
npm test
npm run build
```

PowerShell 실행 정책 때문에 npm 명령이 차단되면 `npm.cmd`를 사용합니다.

## 배포

Jenkins에서 수동 빌드를 시작하면 검증 후 Docker 이미지를 생성하고 SSH로 AWS Lightsail에 배포합니다. 클라우드 이미지는 `VITE_BACKEND_ORIGIN`을 빈 문자열로 빌드해 화면과 API가 같은 HTTPS 출처를 사용합니다. Caddy가 API·SSO 요청을 분기하고 Nginx는 React 정적 파일을 제공합니다.

- [Docker 실행 및 Jenkins 배포](docs/deployment.md)
- [화면 공통 구성](docs/UI-GUIDE.md)
- [전체 구성도](https://github.com/whdcks0101-beep/admin-api/blob/main/docs/portfolio/architecture.md)
- [핵심 구현 사례](https://github.com/whdcks0101-beep/admin-api/blob/main/docs/portfolio/case-studies.md)