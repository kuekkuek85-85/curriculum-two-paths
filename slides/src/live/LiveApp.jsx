import { useEffect, useState } from "react";
import {
  fbEnabled,
  subscribeSession,
  submitChoice,
  submitWish,
} from "../firebase.js";
import { POLL_OPTIONS } from "../slides/intro.jsx";
import { WISH_PROMPT } from "../slides/closing.jsx";
import { buildSlides } from "../slides/index.jsx";
import { QUIZ_OPTIONS } from "../config.js";
import { DeckContext, STAGE_W, STAGE_H } from "../deck/Deck.jsx";

const ALL_SLIDES = buildSlides();

export default function LiveApp() {
  const [session, setSession] = useState({});
  const [failed, setFailed] = useState(false);
  useEffect(() => subscribeSession(setSession, () => setFailed(true)), []);

  const offline = !fbEnabled || failed;
  const isInteractive =
    !offline &&
    (session.active === "poll" ||
      session.active === "quiz" ||
      session.active === "wish");

  // 인터랙션이 없는 정적 슬라이드는 강사 화면과 똑같이 전체 화면으로 미러링한다.
  if (!offline && !isInteractive && session.slideId) {
    return <FullScreenMirror slideId={session.slideId} />;
  }

  return (
    <div className="min-h-full bg-canvas text-ink">
      <div className="mx-auto flex min-h-dvh w-full max-w-[640px] flex-col px-5 py-6">
        <header className="mb-6 border-b border-hairline pb-3">
          <div className="t-eyebrow opacity-60" style={{ fontSize: 14 }}>
            2026 학교자율시간 과목 개발 전문가 연수 · 1교시
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight">
            학교자율시간 과목 개발 및 운영 사례 — 참여 페이지
          </h1>
        </header>
        <main className="flex flex-1 flex-col justify-center pb-10">
          {offline ? (
            <Waiting text="참여 기능이 아직 열리지 않았습니다" />
          ) : session.active === "poll" ? (
            <Poll />
          ) : session.active === "quiz" ? (
            <Quiz />
          ) : session.active === "wish" ? (
            <Wish />
          ) : (
            <Waiting text="잠시 후 시작합니다" />
          )}
        </main>
      </div>
    </div>
  );
}

function Waiting({ text }) {
  return (
    <div className="rounded-[24px] bg-surface-soft p-10 text-center">
      <div className="text-4xl">⏳</div>
      <p className="mt-4 text-xl font-bold">{text}</p>
      <p className="mt-2 text-base opacity-60">
        발표가 진행되면 이 화면이 자동으로 바뀝니다 — 화면을 켜 둔 채 기다려 주세요.
      </p>
    </div>
  );
}

// 인터랙션이 없는 슬라이드는 강사 화면과 동일하게 전체 화면으로 미러링한다.
// Deck.jsx의 16:9 레터박싱과 동일한 방식(뷰포트 너비/높이 중 작은 비율)으로 스케일을 계산한다.
function FullScreenMirror({ slideId }) {
  const slide = ALL_SLIDES.find((s) => s.id === slideId);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const update = () =>
      setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H));
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  if (!slide) return null;
  const Comp = slide.comp;

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#15181f]">
      {scale > 0 && (
        <div
          style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})` }}
          className="relative shrink-0 overflow-hidden bg-canvas text-ink shadow-2xl"
        >
          <div key={slide.id} className="slide-enter absolute inset-0">
            <DeckContext.Provider value={{ quizRevealed: false }}>
              <Comp />
            </DeckContext.Provider>
          </div>
        </div>
      )}
      <div className="absolute bottom-3 right-3 rounded-[50px] bg-black/40 px-3 py-1 text-[11px] text-white/70">
        앞 화면과 동일 · 참여 시 자동 전환
      </div>
    </div>
  );
}

function ChoiceCard({ kind, question, options, storageKey, revealed, answerIndex }) {
  const [voted, setVoted] = useState(() => localStorage.getItem(storageKey));
  const [busy, setBusy] = useState(false);

  const vote = async (i) => {
    if (voted !== null || busy) return;
    setBusy(true);
    try {
      await submitChoice(kind, i);
      localStorage.setItem(storageKey, String(i));
      setVoted(String(i));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-[24px] bg-surface-soft p-6">
      <h2 className="text-2xl font-bold leading-snug">{question}</h2>
      <div className="mt-5 flex flex-col gap-3">
        {options.map((opt, i) => {
          const mine = voted === String(i);
          const isAnswer = revealed && i === answerIndex;
          return (
            <button
              key={i}
              disabled={voted !== null || busy}
              onClick={() => vote(i)}
              className={`rounded-[50px] border-2 p-4 text-left text-xl font-bold leading-snug transition ${
                isAnswer
                  ? "border-accent-magenta bg-accent-magenta/10 text-accent-magenta"
                  : mine
                    ? "border-ink bg-ink/5"
                    : "border-hairline bg-canvas"
              } ${voted === null ? "active:scale-[0.98]" : "opacity-90"}`}
            >
              <span className="mr-2">{"①②③"[i]}</span>
              {opt}
              {mine && !isAnswer && <span className="ml-2 text-base">✓ 내 선택</span>}
              {isAnswer && <span className="ml-2 text-base">← 정답!</span>}
            </button>
          );
        })}
      </div>
      {voted !== null && !revealed && (
        <p className="mt-4 text-center text-base font-semibold opacity-60">
          제출 완료! 앞 화면을 봐 주세요.
        </p>
      )}
    </div>
  );
}

function Poll() {
  return (
    <ChoiceCard
      kind="poll"
      storageKey="voted_poll"
      question="지금 개발 중인 내 과목, 완성되고 나면 — 지원자료는?"
      options={POLL_OPTIONS}
    />
  );
}

function Quiz() {
  return (
    <ChoiceCard
      kind="quiz"
      storageKey="voted_quiz"
      question="1차시 학습 지원 자료 하나를 만드는 데 걸리는 시간은?"
      options={QUIZ_OPTIONS}
    />
  );
}

function Wish() {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    try {
      await submitWish(t);
      setText("");
      setSent(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-[24px] bg-surface-soft p-6">
      <h2 className="text-2xl font-bold leading-snug">{WISH_PROMPT}</h2>
      <div className="mt-5 flex flex-col gap-3">
        <input
          type="text"
          maxLength={50}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSent(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="과목명 — 지원자료 (50자 이내)"
          className="w-full rounded-[50px] border-2 border-hairline bg-canvas px-5 py-4 text-xl font-semibold outline-none focus:border-ink"
        />
        <div className="tabular text-right text-sm opacity-50">{text.length}/50</div>
        <button
          onClick={submit}
          disabled={!text.trim() || busy}
          className="rounded-[50px] bg-ink px-6 py-4 text-xl font-bold text-inverse-ink transition active:scale-[0.98] disabled:opacity-40"
        >
          앞 화면에 띄우기
        </button>
      </div>
      {sent && (
        <p className="mt-4 text-center text-base font-semibold opacity-60">
          전송 완료! 앞 화면에 곧 나타납니다. 하나 더 보내셔도 됩니다.
        </p>
      )}
    </div>
  );
}
