import { useEffect, useRef, useState } from "react";
import {
  fbEnabled,
  subscribeSession,
  submitChoice,
  submitWish,
} from "../firebase.js";
import { POLL_OPTIONS } from "../slides/intro.jsx";
import { WISH_PROMPT } from "../slides/closing.jsx";
import { buildSlides } from "../slides/index.jsx";
import { QUIZ_OPTIONS, QUIZ_ANSWER_INDEX } from "../config.js";
import { DeckContext, STAGE_W, STAGE_H } from "../deck/Deck.jsx";

const ALL_SLIDES = buildSlides();

export default function LiveApp() {
  const [session, setSession] = useState({});
  const [failed, setFailed] = useState(false);
  useEffect(() => subscribeSession(setSession, () => setFailed(true)), []);

  return (
    <div className="min-h-full bg-canvas text-ink">
      <div className="mx-auto flex min-h-dvh w-full max-w-[640px] flex-col px-5 py-6">
        <header className="mb-6 border-b border-hairline pb-3">
          <div className="t-eyebrow opacity-60" style={{ fontSize: 13 }}>
            2026 학교자율시간 과목 개발 전문가 연수 · 1교시
          </div>
          <h1 className="mt-1 text-lg font-bold tracking-tight">
            학교자율시간 과목 개발 및 운영 사례 — 참여 페이지
          </h1>
        </header>
        <main className="flex flex-1 flex-col justify-center pb-10">
          {!fbEnabled || failed ? (
            <Waiting text="참여 기능이 아직 열리지 않았습니다" />
          ) : session.active === "poll" ? (
            <Poll />
          ) : session.active === "quiz" ? (
            <Quiz revealed={!!session.quizRevealed} />
          ) : session.active === "wish" ? (
            <Wish />
          ) : session.slideId ? (
            <SlideMirror slideId={session.slideId} />
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
      <p className="mt-4 text-lg font-bold">{text}</p>
      <p className="mt-2 text-sm opacity-60">
        발표가 진행되면 이 화면이 자동으로 바뀝니다 — 화면을 켜 둔 채 기다려 주세요.
      </p>
    </div>
  );
}

// 인터랙션이 없는 슬라이드는 강사 화면을 그대로 축소 미러링한다.
function SlideMirror({ slideId }) {
  const slide = ALL_SLIDES.find((s) => s.id === slideId);
  const ref = useRef(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / STAGE_W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  if (!slide) return <Waiting text="화면을 불러오는 중…" />;
  const Comp = slide.comp;

  return (
    <div>
      <div
        ref={ref}
        className="w-full overflow-hidden rounded-[24px] shadow-lg"
        style={{ aspectRatio: `${STAGE_W} / ${STAGE_H}` }}
      >
        {scale > 0 && (
          <div
            key={slide.id}
            className="slide-enter origin-top-left"
            style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})` }}
          >
            <DeckContext.Provider value={{ quizRevealed: false }}>
              <Comp />
            </DeckContext.Provider>
          </div>
        )}
      </div>
      <p className="t-caption mt-3 text-center opacity-50">
        앞 화면과 동일합니다 · 참여가 열리면 자동으로 바뀝니다
      </p>
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
      <h2 className="text-xl font-bold leading-snug">{question}</h2>
      <div className="mt-5 flex flex-col gap-3">
        {options.map((opt, i) => {
          const mine = voted === String(i);
          const isAnswer = revealed && i === answerIndex;
          return (
            <button
              key={i}
              disabled={voted !== null || busy}
              onClick={() => vote(i)}
              className={`rounded-[50px] border-2 p-4 text-left text-lg font-bold transition ${
                isAnswer
                  ? "border-accent-magenta bg-accent-magenta/10 text-accent-magenta"
                  : mine
                    ? "border-ink bg-ink/5"
                    : "border-hairline bg-canvas"
              } ${voted === null ? "active:scale-[0.98]" : "opacity-90"}`}
            >
              <span className="mr-2">{"①②③"[i]}</span>
              {opt}
              {mine && !isAnswer && <span className="ml-2 text-sm">✓ 내 선택</span>}
              {isAnswer && <span className="ml-2 text-sm">← 정답!</span>}
            </button>
          );
        })}
      </div>
      {voted !== null && !revealed && (
        <p className="mt-4 text-center text-sm font-semibold opacity-60">
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

function Quiz({ revealed }) {
  return (
    <ChoiceCard
      kind="quiz"
      storageKey="voted_quiz"
      question="교육과정을 통째로 AI에 넣고, 1차시 학습 지원 자료 하나를 만드는 데 걸린 시간은?"
      options={QUIZ_OPTIONS}
      revealed={revealed}
      answerIndex={QUIZ_ANSWER_INDEX}
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
      <h2 className="text-xl font-bold leading-snug">{WISH_PROMPT}</h2>
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
          className="w-full rounded-[50px] border-2 border-hairline bg-canvas px-5 py-4 text-lg font-semibold outline-none focus:border-ink"
        />
        <div className="tabular text-right text-xs opacity-50">{text.length}/50</div>
        <button
          onClick={submit}
          disabled={!text.trim() || busy}
          className="rounded-[50px] bg-ink px-6 py-4 text-lg font-bold text-inverse-ink transition active:scale-[0.98] disabled:opacity-40"
        >
          앞 화면에 띄우기
        </button>
      </div>
      {sent && (
        <p className="mt-4 text-center text-sm font-semibold opacity-60">
          전송 완료! 앞 화면에 곧 나타납니다. 하나 더 보내셔도 됩니다.
        </p>
      )}
    </div>
  );
}
