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

## 1) Firebase — 보안 규칙 적용 (**필수, 30초**)

Firebase 프로젝트(`curriculum-two-paths`)는 이미 연결되어 있습니다. 다만 Firestore가
**잠금 모드**로 생성되어 있어 규칙을 열기 전에는 실시간 인터랙션이 동작하지 않습니다
(이 상태에서도 슬라이드는 정상 진행되며 "거수로 진행" 안내만 표시됩니다).

1. https://console.firebase.google.com → `curriculum-two-paths` → **Firestore Database → 규칙** 탭
2. 편집기 내용을 이 저장소의 [`firestore.rules`](firestore.rules) 파일 내용으로 통째로 교체
3. **게시** 클릭

규칙은 앱이 쓰는 4개 경로(`session`, `responses_poll`, `responses_quiz`, `wishes`)만 열고
2026-08-31 이후 자동으로 닫히도록 되어 있습니다.

> Firebase 웹 config 값은 비밀키가 아니라 클라이언트 번들에 그대로 실리는 공개 식별자이므로
> `src/firebase.js`에 기본값으로 커밋되어 있습니다. 실제 보호는 위 보안 규칙이 담당합니다.
> 다른 프로젝트로 바꾸려면 `.env.local`에 `VITE_FIREBASE_*`를 넣으면 그쪽이 우선합니다.

## 2) Vercel 배포 (GitHub 연동 자동 배포)

저장소: https://github.com/kuekkuek85-85/curriculum-two-paths — **main 브랜치에 푸시하면 자동 배포**됩니다.

Vercel에서 처음 Import할 때 한 가지만 주의하세요:

- **Root Directory를 `slides`로 지정** (앱 코드가 하위 폴더에 있습니다)
- 프레임워크는 Vite로 자동 인식되고, `/live` 라우팅용 `vercel.json`이 포함되어 있습니다
- 환경변수 등록은 필요 없습니다 (Firebase config가 코드에 기본값으로 있음)
- QR 코드는 배포된 주소를 자동으로 사용합니다. 고정하려면 `src/config.js`의 `DEPLOY_URL`에 입력

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
