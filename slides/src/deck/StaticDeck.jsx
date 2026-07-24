import { useEffect, useMemo, useRef, useState } from "react";
import { buildSlides } from "../slides/index.jsx";
import { DeckContext, STAGE_W, STAGE_H } from "./Deck.jsx";

// /slide — 인터랙션 없는 정적 슬라이드 뷰어.
// 좌/우 클릭·화살표키로만 이동하며, Firebase 세션에 쓰지 않는다(발표 제어와 완전 분리).
export default function StaticDeck() {
  const slides = useMemo(() => buildSlides(), []);
  const [index, setIndex] = useState(0);
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
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  // 키보드: 좌/우 이동만
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        setIndex((v) => Math.min(slides.length - 1, v + 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setIndex((v) => Math.max(0, v - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides]);

  const slide = slides[index];
  const Comp = slide.comp;
  const progress = ((index + 1) / slides.length) * 100;

  return (
    <DeckContext.Provider value={{ staticMode: true, quizRevealed: false }}>
      <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#15181f]">
        <div
          style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})` }}
          className="relative shrink-0 overflow-hidden bg-canvas text-ink shadow-2xl"
          onClick={(e) => {
            // 화면 왼쪽 절반 = 이전, 오른쪽 절반 = 다음
            const rect = e.currentTarget.getBoundingClientRect();
            if (e.clientX - rect.left < rect.width / 2) {
              setIndex((v) => Math.max(0, v - 1));
            } else {
              setIndex((v) => Math.min(slides.length - 1, v + 1));
            }
          }}
        >
          <div key={slide.id} className="slide-enter absolute inset-0">
            <Comp />
          </div>

          <div className="absolute inset-x-0 bottom-0">
            <div className="flex items-end justify-between px-6 pb-1.5 text-[13px] opacity-50">
              <span>{slide.section}</span>
              <span className="tabular">
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
        </div>
      </div>
    </DeckContext.Provider>
  );
}
