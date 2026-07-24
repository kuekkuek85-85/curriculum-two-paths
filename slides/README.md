# 1교시 웹 슬라이드 — 설정·배포 가이드

- `/` = 발표자용 슬라이드 (총 24장, S15-B 캡처 입력 시 25장)
- `/live` = 청중용 참여 페이지 (폴·퀴즈·자유입력, 발표자 슬라이드에 따라 자동 전환)

## 로컬 실행

```bash
cd slides
npm install
npm run dev
```

## 조작키 (발표자 화면)

| 키 | 동작 |
|---|---|
| → / Space / 클릭 | 다음 |
| ← | 이전 |
| 숫자 + Enter (또는 G) | 해당 번호로 점프 |
| O | 전체 슬라이드 오버뷰 (+ 응답 데이터 초기화 버튼) |
| R | S14-B 퀴즈 정답 공개 |
| Esc | 오버뷰 닫기 / 점프 입력 취소 |

## 1) Firebase 설정 (실시간 인터랙션용 — 약 5분)

Firebase 미설정이어도 슬라이드는 완전 동작합니다(인터랙션 슬라이드에 "거수로 진행" 안내 표시).

1. https://console.firebase.google.com → **프로젝트 추가** (이름 자유, Google 애널리틱스 **끄기**)
2. 왼쪽 **빌드 > Firestore Database → 데이터베이스 만들기** → 위치 `asia-northeast3 (서울)` → **테스트 모드로 시작** (30일간 열림 — 연수용으로 충분)
3. **프로젝트 개요 ⚙ > 프로젝트 설정 > 내 앱 > 웹(`</>`) 앱 추가** → 등록 → 표시되는 `firebaseConfig`에서 4개 값 복사
4. `slides/.env.example`을 `slides/.env.local`로 복사하고 값 채우기:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_APP_ID=1:123:web:abc
```

5. dev 서버 재시작(`npm run dev`) → 슬라이드 3번(S2-B)으로 이동 → 다른 기기/탭에서 `/live` 접속해 1표 테스트

## 2) Vercel 배포

```bash
cd slides
npm i -g vercel
vercel login
vercel --prod
```

- 프레임워크는 Vite로 자동 인식되고, `/live` 라우팅용 `vercel.json`이 이미 포함되어 있습니다.
- **환경변수**: Vercel 대시보드 → 프로젝트 → Settings → Environment Variables에 위 4개 `VITE_FIREBASE_*` 값을 등록 후 **재배포** (또는 `vercel env add`로 등록).
- QR 코드는 배포된 주소를 자동으로 사용하므로 별도 설정이 필요 없습니다. 고정하려면 `src/config.js`의 `DEPLOY_URL`에 입력.

## 3) 발표 직전에 채울 값 — `src/config.js`

| 상수 | 용도 |
|---|---|
| `DEMO_URL` | S16 "시연 열기" 버튼 링크 (비우면 "시연 링크 준비 중") |
| `DEMO_CAPTURE_1/2` | S17 백업 캡처 — 이미지를 `public/`에 넣고 `"/파일명.png"` |
| `WORKSHEET_CAPTURE` | S15-B 학습지 캡처 — 입력하면 슬라이드가 나타남(25장으로) |
| `QUIZ_OPTIONS`, `QUIZ_ANSWER_INDEX` | S14-B 퀴즈 보기·정답 (기본 정답 "10분") |

값 수정 후 `vercel --prod`로 재배포하면 반영됩니다.

## 4) 발표 전 점검 (PRD 운영 메모 기준)

1. 배포 주소 `/live` 접속 → 폴 1표 테스트
2. 발표자 화면에서 `O` → **응답 데이터 초기화** 클릭
3. S1을 대기 화면으로 띄워두고 청중 입장 유도
4. 네트워크 불가 시: 폴·퀴즈는 거수, S19는 지명 발언 — 슬라이드는 그대로 진행 가능
