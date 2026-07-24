import { useEffect, useState } from "react";
import { Slide, BottomLine, Card, Pill, OfflineHint } from "./common.jsx";
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

// S13 — 섹션 표지 (코랄 블록)
export function S13() {
  return (
    <Slide tone="coral">
      <div className="flex h-full flex-col justify-center">
        <div className="t-eyebrow opacity-60">PART 2</div>
        <h2 className="t-display-xl mt-6">인공지능과 미래사회</h2>
        <div className="mt-12 flex items-center gap-3 flex-wrap">
          {[
            ["2022", "선택과목으로 선제 도입"],
            ["2025", "학교자율시간 도입, 정보과 하위 과목으로 전환"],
            ["지금", "계속 운영"],
          ].map(([year, label], i, arr) => (
            <div key={year} className="flex items-center gap-3">
              <div className="rounded-[50px] bg-canvas px-6 py-3">
                <span className="t-caption tabular mr-3 opacity-60">{year}</span>
                <span className="t-body-lg">{label}</span>
              </div>
              {i < arr.length - 1 && <span className="t-body-lg opacity-40">→</span>}
            </div>
          ))}
        </div>
        <div className="t-subhead mt-14 border-t border-ink/20 pt-6">
          이 과목, 제가 만들지 않았습니다. 그래도 우리 학교 과목입니다.
        </div>
      </div>
    </Slide>
  );
}

// S13-B — 교육과정 다음에 오는 것: 현실의 세 갈래
const LADDER = [
  ["인정교과서", "최선의 길. 그러나 출판사 협업이 필요해 문턱이 높다", "목요일에 들으신 교과용 도서 개발 사례가 이 길"],
  ["인쇄형 지원자료", "현실의 표준. 학습지를 한글 파일로 제작 → 디자인 업체에 맡겨 인쇄 → 교재처럼 사용", ""],
  ["오늘의 제안", "그 학습지 제작을 생성형 AI로 압축하고, 여기에 학습지원 소프트웨어까지 얹는다", ""],
];

export function S13B() {
  return (
    <Slide eyebrow={P2}>
      <h2 className="t-display-lg mb-8" style={{ fontSize: 52 }}>
        교육과정 다음에 오는 것 — 현실의 세 갈래
      </h2>
      <div className="flex flex-1 flex-col justify-center gap-4">
        {LADDER.map(([title, desc, note], i) => {
          const highlight = i === 2;
          return (
            <div
              key={i}
              className={`flex items-center gap-8 rounded-[24px] p-7 ${
                highlight ? "bg-block-lime" : "bg-surface-soft"
              }`}
            >
              <div className="flex w-[240px] shrink-0 items-baseline gap-4">
                <span className="t-caption tabular opacity-40">0{i + 1}</span>
                <span className="t-card-title">{title}</span>
              </div>
              <div>
                <p className="t-body-lg">{desc}</p>
                {note && (
                  <p className="t-caption mt-2 opacity-60">({note})</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <BottomLine>
        2번까지가 관행이라면, 오늘은 2번을 빠르게 만들고 3번까지 가는 법입니다.
      </BottomLine>
    </Slide>
  );
}

// S14 — 관점 전환: 승인 과목은 공공재다
export function S14() {
  return (
    <Slide eyebrow={P2}>
      <h2 className="t-display-lg" style={{ fontSize: 52 }}>
        개발 취지는 개발자의 것, 수업은 우리의 것
      </h2>
      <div className="mt-8 flex min-h-0 flex-1 gap-6">
        <div className="flex flex-1 flex-col justify-center gap-4">
          <Card>
            <div className="t-headline">'생성형 인공지능 제대로 뽑아먹기'</div>
            <p className="t-body-lg mt-2 opacity-70">
              프롬프트 엔지니어링 → 체육 융합 챗봇 → 나만의 사업 계획 (1학년 9차시)
            </p>
          </Card>
          <Card>
            <div className="t-headline">'착한 인공지능을 활용하기 위한 노력'</div>
            <p className="t-body-lg mt-2 opacity-70">
              인공지능으로 멧돼지·가축돼지 분류 (공개수업)
            </p>
          </Card>
          <Card>
            <div className="t-headline">스승의 날 이벤트 · 사회정서교육</div>
            <p className="t-body-lg mt-2 opacity-70">
              '우리반 마음 소포' 카드뉴스 제작 → 반별 스승의 날 발송 (정보 교과 CCL 연계)
            </p>
          </Card>
        </div>
        <div className="flex w-[38%] shrink-0 items-center justify-center overflow-hidden rounded-[24px] bg-surface-soft p-4">
          <img
            src="/img/teachers-day-event.png"
            alt="스승의 날 이벤트 — 우리반 마음 소포 카드뉴스 웹앱"
            className="max-h-full max-w-full rounded-[8px] object-contain"
          />
        </div>
      </div>
      <BottomLine>필요한 건 단 하나 — 우리 교실에 맞는 지원 자료</BottomLine>
    </Slide>
  );
}

// S14-B — [인터랙션 ②] 퀴즈 (핑크 블록)
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
    <Slide tone="pink" eyebrow={`${P2} · 퀴즈 ②`}>
      <h2 className="t-display-lg" style={{ fontSize: 48 }}>
        교육과정을 통째로 AI에 넣고,
        <br />
        1차시 학습 지원 자료 하나를 만드는 데 걸린 시간은?
      </h2>
      {live ? (
        <div className="t-caption tabular mt-4 opacity-60">
          응답 {total}명{!quizRevealed && <span className="ml-4">R = 정답 공개</span>}
        </div>
      ) : (
        <OfflineHint />
      )}
      <div className="mt-8 flex flex-1 flex-col justify-center gap-4">
        {QUIZ_OPTIONS.map((opt, i) => {
          const isAnswer = quizRevealed && i === QUIZ_ANSWER_INDEX;
          return (
            <div
              key={i}
              className={`rounded-[24px] p-4 transition-all ${
                isAnswer ? "bg-canvas ring-4 ring-accent-magenta" : "bg-canvas"
              }`}
            >
              <div className="mb-2 flex items-baseline justify-between">
                <span className="t-headline">
                  <span className="mr-3 opacity-40">{"①②③"[i]}</span>
                  {opt}
                  {isAnswer && (
                    <span className="t-caption ml-4 rounded-[50px] bg-accent-magenta px-3 py-1 text-inverse-ink">
                      정답
                    </span>
                  )}
                </span>
                {live && (
                  <span className="t-card-title tabular">{counts[i]}표</span>
                )}
              </div>
              <div className="h-6 w-full overflow-hidden rounded-[50px] bg-surface-soft">
                <div
                  className={`h-full rounded-[50px] transition-all duration-500 ${
                    isAnswer ? "bg-accent-magenta" : "bg-ink"
                  }`}
                  style={{ width: `${(counts[i] / max) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Slide>
  );
}

// S15 — 지원 자료 제작·운영 파이프라인 (라임 블록 — 이 발표의 핵심 시스템 슬라이드)
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
    <Slide tone="lime" eyebrow={`${P2} · 핵심`}>
      <h2 className="t-display-lg mb-8" style={{ fontSize: 52 }}>
        지원 자료 제작·운영 파이프라인
      </h2>
      <div className="stagger flex flex-1 flex-col justify-center">
        <div className="mb-3 grid grid-cols-7 gap-2" style={{ animationDelay: "1.6s" }}>
          <div className="col-span-3">
            <div className="rounded-t-[8px] border-x border-t border-ink bg-canvas px-3 py-2 text-center">
              <span className="t-caption">만들기 (반나절)</span>
            </div>
          </div>
          <div className="col-span-3">
            <div className="rounded-t-[8px] border-x border-t border-ink/40 bg-canvas/60 px-3 py-2 text-center">
              <span className="t-caption opacity-60">절차 (학교 일정)</span>
            </div>
          </div>
          <div />
        </div>
        <div className="grid grid-cols-7 gap-2">
          {PIPELINE.map((step, i) => (
            <div
              key={i}
              style={{ animationDelay: `${i * 0.2}s` }}
              className={`flex min-h-[190px] flex-col rounded-[8px] p-4 ${
                i === 6 ? "bg-ink text-inverse-ink" : "bg-canvas"
              }`}
            >
              <div
                className={`t-card-title tabular ${
                  i === 6 ? "opacity-100" : "opacity-30"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <p className="t-body-sm mt-3 leading-snug">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  );
}

// S15-B — 실물 증거: 반나절 만에 나온 학습지
export function S15B() {
  return (
    <Slide eyebrow={P2}>
      <h2 className="t-display-lg mb-6" style={{ fontSize: 44 }}>
        실물 증거: 반나절 만에 나온 학습지
      </h2>
      <div className="flex min-h-0 flex-1 items-center justify-center rounded-[24px] bg-surface-soft p-6">
        <img
          src={WORKSHEET_CAPTURE}
          alt="생성형 AI로 제작한 차시별 학습지 캡처"
          className="max-h-full max-w-full rounded-[8px] object-contain"
        />
      </div>
      <BottomLine>
        교육과정을 컨텍스트로 넣고, 반나절. 이 학습지가 그 증거입니다.
      </BottomLine>
    </Slide>
  );
}

// S16 — 라이브 시연
export function S16() {
  return (
    <Slide eyebrow={`${P2} · 라이브 시연`}>
      <div className="flex h-full flex-col items-center justify-center gap-7">
        {DEMO_URL ? (
          <Pill
            as="a"
            href={DEMO_URL}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="!px-14 !py-6"
            style={{ fontSize: 40, lineHeight: 1.1 }}
          >
            시연 열기 →
          </Pill>
        ) : (
          <div className="t-display-lg cursor-not-allowed rounded-[50px] bg-surface-soft px-14 py-6 opacity-60">
            시연 링크 준비 중
          </div>
        )}
        <p className="t-body-lg opacity-60">
          {DEMO_INTRO || "차시별 학습지원 소프트웨어 시연"}
        </p>
      </div>
    </Slide>
  );
}

// S17 — 시연 백업 캡처
export function S17() {
  const caps = [DEMO_CAPTURE_1, DEMO_CAPTURE_2];
  return (
    <Slide eyebrow={`${P2} · 시연 백업`}>
      <div className="flex h-full gap-5">
        {caps.map((src, i) =>
          src ? (
            <div
              key={i}
              className="flex min-w-0 flex-1 items-center justify-center rounded-[24px] bg-surface-soft p-4"
            >
              <img
                src={src}
                alt={`시연 캡처 ${i + 1}`}
                className="max-h-full max-w-full rounded-[8px] object-contain"
              />
            </div>
          ) : (
            <div
              key={i}
              className="t-body-lg flex flex-1 items-center justify-center rounded-[24px] bg-surface-soft opacity-40"
            >
              캡처 이미지 자리
            </div>
          )
        )}
      </div>
    </Slide>
  );
}
