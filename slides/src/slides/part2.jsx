import { useEffect, useState } from "react";
import { Chrome, BottomLine, OfflineHint } from "./common.jsx";
import { fbEnabled, subscribeCounts } from "../firebase.js";
import { useDeck } from "../deck/Deck.jsx";
import {
  DEMO_URL,
  DEMO_INTRO,
  DEMO_CAPTURE_1,
  DEMO_CAPTURE_2,
  WORKSHEET_CAPTURE,
  QUIZ_OPTIONS,
  QUIZ_ANSWER_INDEX,
} from "../config.js";

const P2 = "PART 2 · 가져다 쓴 사람의 이야기";

// S13 — 섹션 표지 + 한 줄 히스토리
export function S13() {
  return (
    <div className="flex h-full flex-col justify-center px-16">
      <div className="text-[26px] font-extrabold tracking-[0.3em] text-seal">PART 2</div>
      <h2 className="mt-4 text-[52px] font-extrabold tracking-tight">
        인공지능과 미래사회
      </h2>
      <div className="mt-10 flex items-center gap-0 text-[18px] font-semibold">
        <div className="rounded-lg border border-line bg-white px-5 py-3">
          <span className="tabular text-seal">2022</span> 선택과목으로 선제 도입
        </div>
        <div className="h-[2px] w-10 bg-line" />
        <div className="rounded-lg border border-line bg-white px-5 py-3">
          <span className="tabular text-seal">2025</span> 학교자율시간 도입, 정보과 하위
          과목으로 전환
        </div>
        <div className="h-[2px] w-10 bg-line" />
        <div className="rounded-lg border border-line bg-white px-5 py-3">
          지금까지 계속 운영
        </div>
      </div>
      <div className="mt-12 border-t border-line pt-5 text-[24px] font-semibold">
        이 과목, 제가 만들지 않았습니다. 그래도 우리 학교 과목입니다.
      </div>
    </div>
  );
}

// S13-B — 교육과정 다음에 오는 것: 현실의 세 갈래
const LADDER = [
  [
    "인정교과서",
    "최선의 길. 그러나 출판사 협업이 필요해 문턱이 높다",
    "목요일에 들으신 교과용 도서 개발 사례가 이 길",
  ],
  [
    "인쇄형 지원자료",
    "현실의 표준. 학습지를 한글 파일로 제작 → 디자인 업체에 맡겨 인쇄 → 교재처럼 사용",
    "",
  ],
  [
    "오늘의 제안",
    "그 학습지 제작을 생성형 AI로 압축하고, 여기에 학습지원 소프트웨어까지 얹는다",
    "",
  ],
];

export function S13B() {
  return (
    <Chrome label={P2}>
      <div className="flex h-full flex-col">
        <h2 className="mb-7 text-[30px] font-extrabold tracking-tight">
          교육과정 다음에 오는 것 — 현실의 세 갈래
        </h2>
        <div className="flex flex-1 flex-col justify-center gap-4">
          {LADDER.map(([title, desc, note], i) => (
            <div
              key={i}
              className={`flex items-center gap-7 rounded-xl border p-6 ${
                i === 2 ? "border-seal bg-seal/5" : "border-line bg-white"
              }`}
            >
              <div className="flex w-[220px] shrink-0 items-center gap-3">
                <span className="tabular text-[24px] font-extrabold text-seal">{i + 1}</span>
                <span
                  className={`text-[23px] font-extrabold ${i === 2 ? "text-seal" : ""}`}
                >
                  {title}
                </span>
              </div>
              <div>
                <p className="text-[19px] leading-relaxed">{desc}</p>
                {note && <p className="mt-1 text-[16px] text-dim">({note})</p>}
              </div>
            </div>
          ))}
        </div>
        <BottomLine>
          2번까지가 지금까지의 관행이라면, 오늘은 2번을 빠르게 만들고 3번까지 가는
          법입니다.
        </BottomLine>
      </div>
    </Chrome>
  );
}

// S14 — 관점 전환: 승인 과목은 공공재다
export function S14() {
  return (
    <Chrome label={P2}>
      <div className="flex h-full flex-col">
        <h2 className="text-[40px] font-extrabold leading-snug tracking-tight">
          개발 취지는 개발자의 것,
          <br />
          수업은 우리의 것
        </h2>
        <div className="mt-9 flex flex-1 flex-col justify-center gap-5">
          <div className="rounded-xl border border-line bg-white p-6">
            <div className="text-[21px] font-bold">'생성형 인공지능 제대로 뽑아먹기'</div>
            <p className="mt-1.5 text-[18px] text-dim">
              프롬프트 엔지니어링 → 체육 융합 챗봇 → 나만의 사업 계획 (1학년 9차시)
            </p>
          </div>
          <div className="rounded-xl border border-line bg-white p-6">
            <div className="text-[21px] font-bold">
              '착한 인공지능을 활용하기 위한 노력'
            </div>
            <p className="mt-1.5 text-[18px] text-dim">
              인공지능으로 멧돼지·가축돼지 분류 (공개수업)
            </p>
          </div>
        </div>
        <BottomLine accent>
          필요한 건 단 하나 — 우리 교실에 맞는 지원 자료
        </BottomLine>
      </div>
    </Chrome>
  );
}

// S14-B — [인터랙션 ②] 퀴즈
export function S14B() {
  const { quizRevealed } = useDeck();
  const [counts, setCounts] = useState(QUIZ_OPTIONS.map(() => 0));
  const [failed, setFailed] = useState(false);
  useEffect(
    () =>
      subscribeCounts("quiz", QUIZ_OPTIONS.length, setCounts, () =>
        setFailed(true)
      ),
    []
  );
  const live = fbEnabled && !failed;
  const total = counts.reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...counts);

  return (
    <Chrome label={`${P2} · 퀴즈 ②`}>
      <div className="flex h-full flex-col">
        <h2 className="text-[32px] font-extrabold leading-snug tracking-tight">
          교육과정을 통째로 AI에 넣고,
          <br />
          1차시 학습 지원 자료 하나를 만드는 데 걸린 시간은?
        </h2>
        {live ? (
          <div className="tabular mt-2 text-[17px] text-dim">
            응답 {total}명 {!quizRevealed && <span className="ml-3">R = 정답 공개</span>}
          </div>
        ) : (
          <OfflineHint />
        )}
        <div className="mt-7 flex flex-1 flex-col justify-center gap-5">
          {QUIZ_OPTIONS.map((opt, i) => {
            const isAnswer = quizRevealed && i === QUIZ_ANSWER_INDEX;
            return (
              <div
                key={i}
                className={`rounded-xl border p-4 transition-all duration-300 ${
                  isAnswer
                    ? "border-stamp bg-white ring-2 ring-stamp"
                    : "border-line bg-white"
                }`}
              >
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[24px] font-bold">
                    <span className="mr-2 text-seal">{"①②③"[i]}</span>
                    {opt}
                    {isAnswer && (
                      <span className="ml-4 rounded bg-stamp px-2.5 py-0.5 text-[18px] font-extrabold text-white">
                        정답
                      </span>
                    )}
                  </span>
                  {live && (
                    <span className="tabular text-[19px] font-bold text-seal">
                      {counts[i]}표
                    </span>
                  )}
                </div>
                <div className="h-6 w-full overflow-hidden rounded bg-line/50">
                  <div
                    className={`h-full rounded transition-all duration-500 ${
                      isAnswer ? "bg-stamp" : "bg-seal"
                    }`}
                    style={{ width: `${(counts[i] / max) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Chrome>
  );
}

// S15 — 핵심: 지원 자료 제작·운영 파이프라인
const PIPELINE = [
  "교육과정 문서를 AI에 컨텍스트로 학습",
  "생성형 AI로 차시별 학습지 생성 (한글/워드 바로 출력)",
  "바이브 코딩으로 차시별 학습지원 소프트웨어 제작",
  "에듀테크 심의 신청·등록",
  "학교운영위원회 심의",
  "개인정보 수집 시 동의 가정통신문",
  "수업 적용",
];

export function S15() {
  return (
    <Chrome label={`${P2} · 핵심`}>
      <div className="flex h-full flex-col">
        <h2 className="mb-8 text-[32px] font-extrabold tracking-tight">
          지원 자료 제작·운영 파이프라인
        </h2>
        <div className="stagger flex flex-1 flex-col justify-center">
          {/* 브래킷 라벨 */}
          <div
            className="mb-3 grid grid-cols-7 gap-2 text-center"
            style={{ animationDelay: "1.6s" }}
          >
            <div className="col-span-3">
              <div className="rounded-t-lg border-x-2 border-t-2 border-seal px-2 pt-1.5 pb-0.5 text-[19px] font-extrabold text-seal">
                만들기 (반나절)
              </div>
            </div>
            <div className="col-span-3">
              <div className="rounded-t-lg border-x-2 border-t-2 border-dim px-2 pt-1.5 pb-0.5 text-[19px] font-extrabold text-dim">
                절차 (학교 일정)
              </div>
            </div>
            <div />
          </div>
          {/* 7단계 */}
          <div className="grid grid-cols-7 gap-2">
            {PIPELINE.map((step, i) => (
              <div
                key={i}
                style={{ animationDelay: `${i * 0.2}s` }}
                className={`flex min-h-[180px] flex-col rounded-lg border p-3 ${
                  i === 6 ? "border-seal bg-seal text-paper" : "border-line bg-white"
                }`}
              >
                <div
                  className={`tabular text-[22px] font-extrabold ${
                    i === 6 ? "text-paper" : i < 3 ? "text-seal" : "text-dim"
                  }`}
                >
                  {i + 1}
                </div>
                <p className="mt-2 text-[15.5px] font-semibold leading-snug">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Chrome>
  );
}

// S15-B — 실물 증거: 반나절 만에 나온 학습지 (WORKSHEET_CAPTURE 있을 때만 렌더)
export function S15B() {
  return (
    <Chrome label={P2}>
      <div className="flex h-full flex-col">
        <h2 className="mb-5 text-[30px] font-extrabold tracking-tight">
          실물 증거: 반나절 만에 나온 학습지
        </h2>
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <img
            src={WORKSHEET_CAPTURE}
            alt="생성형 AI로 제작한 차시별 학습지 캡처"
            className="max-h-full max-w-full rounded-lg border border-line object-contain shadow-sm"
          />
        </div>
        <BottomLine>
          교육과정을 컨텍스트로 넣고, 반나절. 이 학습지가 그 증거입니다.
        </BottomLine>
      </div>
    </Chrome>
  );
}

// S16 — 라이브 시연
export function S16() {
  return (
    <Chrome label={`${P2} · 라이브 시연`}>
      <div className="flex h-full flex-col items-center justify-center gap-6">
        {DEMO_URL ? (
          <a
            href={DEMO_URL}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="rounded-2xl bg-seal px-16 py-8 text-[40px] font-extrabold text-paper shadow-lg transition hover:brightness-110"
          >
            시연 열기 →
          </a>
        ) : (
          <div className="cursor-not-allowed rounded-2xl bg-line px-16 py-8 text-[40px] font-extrabold text-dim">
            시연 링크 준비 중
          </div>
        )}
        <p className="text-[19px] text-dim">
          {DEMO_INTRO || "차시별 학습지원 소프트웨어 시연"}
        </p>
      </div>
    </Chrome>
  );
}

// S17 — 시연 백업 캡처
export function S17() {
  const caps = [DEMO_CAPTURE_1, DEMO_CAPTURE_2];
  return (
    <Chrome label={`${P2} · 시연 백업`}>
      <div className="flex h-full gap-6 pb-2">
        {caps.map((src, i) =>
          src ? (
            <div key={i} className="flex min-w-0 flex-1 items-center justify-center">
              <img
                src={src}
                alt={`시연 캡처 ${i + 1}`}
                className="max-h-full max-w-full rounded-lg border border-line object-contain shadow-sm"
              />
            </div>
          ) : (
            <div
              key={i}
              className="flex flex-1 items-center justify-center rounded-lg border border-line bg-line/30 text-[20px] text-dim"
            >
              캡처 이미지 자리
            </div>
          )
        )}
      </div>
    </Chrome>
  );
}
