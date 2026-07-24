import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { buildSlides } from "../slides/index.jsx";
import {
  fbEnabled,
  setSessionState,
  resetAllResponses,
} from "../firebase.js";

export const STAGE_W = 1280;
export const STAGE_H = 720;
const SLIDE_KEY = "deck.slideIndex";

export const DeckContext = createContext(null);
export const useDeck = () => useContext(DeckContext);

export default function Deck() {
  const slides = useMemo(() => buildSlides(), []);
  // 발표 중 새로고침해도 보던 슬라이드로 돌아온다
  const [index, setIndex] = useState(() => {
    const saved = Number(sessionStorage.getItem(SLIDE_KEY));
    const last = buildSlides().length - 1;
    return Number.isInteger(saved) ? Math.max(0, Math.min(saved, last)) : 0;
  });
  const [overview, setOverview] = useState(false);
  const [jumpBuffer, setJumpBuffer] = useState("");
  const [quizRevealed, setQuizRevealed] = useState(false);
  const [scale, setScale] = useState(1);
  const indexRef = useRef(index);
  indexRef.current = index;

  // 16:9 스테이지 letterbox 스케일
  useEffect(() => {
    const onResize = () =>
      setScale(
        Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H)
      );
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const goto = (i) => {
    setIndex(Math.max(0, Math.min(slides.length - 1, i)));
    setOverview(false);
  };

  // 발표자 슬라이드 진입 시 /live 인터랙션 자동 활성화
  const hasActivated = useRef(false);
  useEffect(() => {
    const s = slides[index];
    setQuizRevealed(false);
    sessionStorage.setItem(SLIDE_KEY, String(index));
    if (!fbEnabled) return;

    // 아직 인터랙션을 한 번도 연 적 없는 덱은 남이 진행 중인 인터랙션을 끄지 않는다.
    // 20번 슬라이드 QR로 청중이 발표자 화면을 열거나 창을 하나 더 띄우는 경우가 여기 해당한다.
    const next = s.interaction ?? null;
    if (next === null && !hasActivated.current) return;
    if (next !== null) hasActivated.current = true;

    setSessionState({
      slideId: s.id,
      active: next,
      ...(next === "quiz" ? { quizRevealed: false } : {}),
    });
    // 세션 반영은 이 슬라이드 변경 시점의 단발 쓰기로만 한다.
    // 과거에는 Firestore 세션을 지속적으로 구독해 "어긋나면 되돌리는" 자가 치유 효과가 있었는데,
    // 발표자 화면이 두 개 이상(탭·창·기기 중복) 열리면 서로 상대방의 값을 계속 되돌리며
    // 무한 핑퐁(빠른 깜빡임)이 발생했다. 지속 구독형 보정 없이 마지막 쓰기가 이기도록 단순화한다.
  }, [index, slides]);

  const revealQuiz = () => {
    setQuizRevealed(true);
    if (fbEnabled) setSessionState({ quizRevealed: true });
  };

  // 키보드 진행
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const i = indexRef.current;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        setOverview(false);
        setIndex((v) => Math.min(slides.length - 1, v + 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setOverview(false);
        setIndex((v) => Math.max(0, v - 1));
      } else if (/^[0-9]$/.test(e.key)) {
        setJumpBuffer((b) => (b + e.key).slice(0, 3));
      } else if (e.key === "Enter" || e.key === "g" || e.key === "G") {
        setJumpBuffer((b) => {
          if (b) {
            const n = parseInt(b, 10);
            if (n >= 1 && n <= slides.length) goto(n - 1);
          }
          return "";
        });
      } else if (e.key === "o" || e.key === "O") {
        setOverview((v) => !v);
      } else if (e.key === "Escape") {
        setOverview(false);
        setJumpBuffer("");
      } else if (e.key === "r" || e.key === "R") {
        if (slides[i].interaction === "quiz") revealQuiz();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides]);

  const slide = slides[index];
  const Comp = slide.comp;
  const progress = ((index + 1) / slides.length) * 100;

  return (
    <DeckContext.Provider value={{ index, goto, quizRevealed, revealQuiz }}>
      <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#15181f]">
        <div
          style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})` }}
          className="relative shrink-0 overflow-hidden bg-canvas text-ink shadow-2xl"
          onClick={() => {
            setOverview(false);
            setIndex((v) => Math.min(slides.length - 1, v + 1));
          }}
        >
          {/* 슬라이드 본문 */}
          <div key={slide.id} className="slide-enter absolute inset-0">
            <Comp />
          </div>

          {/* 진행 표시: 섹션 라벨 + 진행바 + 페이지 번호 */}
          <div className="absolute inset-x-0 bottom-0">
            <div className="flex items-end justify-between px-6 pb-1.5 text-[13px] opacity-50">
              <span>{slide.section}</span>
              <span className="tabular">
                {jumpBuffer && (
                  <span className="mr-3 rounded bg-ink px-2 py-0.5 text-inverse-ink">
                    {jumpBuffer} ⏎
                  </span>
                )}
                {index + 1} / {slides.length}
              </span>
            </div>
            <div className="h-[3px] w-full bg-hairline">
              <div
                className="h-full bg-ink transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 오버뷰 그리드 (O) */}
          {overview && (
            <div
              className="absolute inset-0 z-20 overflow-auto bg-ink/95 p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="text-lg font-bold text-inverse-ink">
                  전체 슬라이드 <span className="opacity-50">(클릭 이동 · O 닫기)</span>
                </div>
                {fbEnabled && (
                  <button
                    className="rounded border border-accent-magenta px-3 py-1 text-sm text-accent-magenta hover:bg-accent-magenta hover:text-inverse-ink"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm("폴·퀴즈·자유입력 응답 데이터를 모두 삭제할까요?")) {
                        await resetAllResponses();
                        alert("응답 데이터를 초기화했습니다.");
                      }
                    }}
                  >
                    응답 데이터 초기화
                  </button>
                )}
              </div>
              <div className="grid grid-cols-5 gap-3">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => goto(i)}
                    className={`rounded-lg border p-3 text-left text-inverse-ink transition hover:border-block-lime hover:bg-block-lime/20 ${
                      i === index ? "border-block-lime bg-block-lime/25" : "border-white/20"
                    }`}
                  >
                    <div className="tabular text-xs text-white/50">
                      {i + 1} · {s.id}
                    </div>
                    <div className="mt-1 text-sm font-semibold leading-snug">
                      {s.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DeckContext.Provider>
  );
}
