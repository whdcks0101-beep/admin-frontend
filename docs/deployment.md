# React Docker 실행

Node에서 React를 빌드한 뒤 `dist` 파일만 Nginx 이미지로 복사합니다. 실행 컨테이너에는 Vite 개발 서버가 필요하지 않습니다.

Dockerfile의 `verify` 단계에서 린트와 테스트를 통과해야 `build` 단계에서 React를 빌드합니다. `Jenkinsfile`도 같은 단계를 사용합니다. Jenkins 작업은 수동 시작으로 GitHub 소스 조회 → 린트·테스트 → `admin-frontend:ci-빌드번호` 이미지 생성 → Compose 배포 순서로 실행합니다.

배포 단계는 `FRONTEND_IMAGE`로 이번 빌드의 이미지를 지정하고 `--no-build --pull never`로 이미 생성한 로컬 이미지를 사용합니다. Compose 프로젝트 이름 `admin-frontend`를 유지해서 기존 화면 컨테이너를 교체하며, `--wait --wait-timeout 60`으로 상태 점검 성공을 기다립니다. 단일 컨테이너 교체 중에는 잠시 연결이 끊길 수 있습니다. 실패 시 자동 롤백은 수행하지 않습니다.

```text
브라우저 → localhost:5173 → Nginx → React 정적 파일
브라우저의 React → localhost:8080 → Kubernetes 백엔드
```

API와 로그인 요청은 기존처럼 백엔드 8080으로 직접 보냅니다. Nginx가 API를 프록시하는 구성은 아닙니다. 백엔드의 CORS·로그인 성공·로그아웃 리다이렉트와 맞추기 위해 화면 주소 `http://localhost:5173`을 유지합니다. Docker Desktop의 localhost 바인딩을 사용하는 로컬 실행 구성입니다.

## 실행

프로젝트 폴더의 PowerShell에서 실행합니다. Vite가 5173 포트를 사용 중이면 해당 개발 서버 터미널에서 Ctrl+C로 먼저 종료합니다.

```powershell
docker compose config --quiet
docker compose up -d --build
docker compose ps
```

컨테이너 `admin-frontend`가 healthy가 되면 `http://localhost:5173`에서 로그인과 목록 조회를 확인합니다. `/inventories`, `/orders/36`처럼 직접 접근하는 React 경로도 Nginx가 `index.html`로 연결합니다. 실제 주문 번호는 존재하는 값을 사용합니다. 존재하지 않는 `/assets/` 파일은 HTML 대신 404로 응답합니다.

## 변경 반영과 종료

React 소스 변경은 자동 반영되지 않습니다. `docker compose up -d --build`로 다시 빌드하고 화면을 새로고침합니다. `index.html`은 재검증하고 파일명에 해시가 붙은 `/assets/` 파일은 장기 캐시합니다.

```powershell
docker compose logs --tail=30 frontend
docker compose stop frontend
```

Vite 개발 환경으로 돌아갈 때는 Docker 프론트엔드를 중지한 뒤 `npm.cmd run dev`를 실행합니다. 백엔드·DB·Redis·Kafka 컨테이너는 이 프론트엔드 Compose와 별개입니다.

Jenkins 배포 후 기존 버전을 다시 켤 때는 `docker compose start frontend`를 사용합니다. `FRONTEND_IMAGE` 없이 `up --build`하면 로컬 소스로 만든 `admin-frontend:local` 버전으로 바뀝니다. CI 버전으로 되돌릴 때는 아래와 같이 정상 동작했던 실제 이미지 태그를 입력합니다.

```powershell
$previousFrontendImage = $env:FRONTEND_IMAGE
try {
    $env:FRONTEND_IMAGE = Read-Host 'Restore frontend image tag (admin-frontend:ci-N)'
    docker image inspect $env:FRONTEND_IMAGE --format '{{.Id}}'
    if ($LASTEXITCODE -ne 0) { throw 'The requested image is not available locally.' }
    docker compose up -d --no-build --pull never --wait --wait-timeout 60 frontend
    if ($LASTEXITCODE -ne 0) { throw 'Frontend deployment failed.' }
} finally {
    $env:FRONTEND_IMAGE = $previousFrontendImage
}
```

Jenkins 에이전트에는 Docker Compose 플러그인이 필요합니다. 백엔드 저장소의 `docker/jenkins-agent/Dockerfile`에 포함되어 있으며 에이전트 이미지를 변경하면 컨테이너를 다시 생성해야 적용됩니다.

## 빌드 설정

`compose.yaml`의 `build.args.VITE_BACKEND_ORIGIN`은 브라우저가 접근할 백엔드 주소입니다. 현재는 `http://localhost:8080`입니다. 이 값은 Vite 빌드 시 JavaScript에 포함되므로 비밀값을 넣지 않습니다. 컨테이너 실행 환경변수만 바꿔서는 이미 빌드한 주소가 바뀌지 않으며 다시 이미지 빌드가 필요합니다.

`.dockerignore`는 소스·정적 파일·빌드 설정만 허용하고 로컬 `.env`, `node_modules`, 기존 `dist`를 전송하지 않습니다. 의존성은 `package-lock.json` 기준 `npm ci`로 설치합니다. Nginx는 비특권 사용자로 8080에서 실행하며 `/healthz`로 정적 파일 서버의 기동 상태를 확인합니다. 이 상태 점검은 백엔드 로그인이나 DB 연결 검증과는 별개입니다.
