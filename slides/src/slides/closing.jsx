import { useEffect, useState } from "react";
import { Slide, BottomLine, AutoQR, Pill, OfflineHint } from "./common.jsx";
import { fbEnabled, subscribeWishes, hideWish } from "../firebase.js";
import { useDeck } from "../deck/Deck.jsx";

const FIN = "마무리";

// S18 — 두 경로 비교 (크림 블록)
const ROWS = [
  ["시작", "우리 학교의 질문에서", "승인 과목 목록에서"],
  ["필요한 것", "연구팀 · 1년의 수업 검증", "교육과정 문서 · 지원 자료 제작"],
  ["걸리는 시간", "1년", "한 학기 준비로 가능"],
  ["남는 것", "승인 과목 + 학교의 역량", "우리 교실에 맞는 수업"],
];

export function S18() {
  return (
    <Slide tone="cream" eyebrow={FIN}>
      <h2 className="t-display-lg mb-8" style={{ fontSize: 52 }}>
        두 경로 비교
      </h2>
      <div className="flex-1 overflow-hidden rounded-[24px] bg-canvas">
        <table className="h-full w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-ink">
              <th className="w-[180px] p-5"></th>
              <th className="t-headline p-5 text-left">만드는 길</th>
              <th className="t-headline p-5 text-left">가져다 쓰는 길</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([label, a, b]) => (
              <tr key={label} className="border-b border-hairline last:border-0">
                <td className="t-card-title p-5 opacity-50">{label}</td>
                <td className="t-body-lg p-5">{a}</td>
                <td className="t-body-lg p-5">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BottomLine>
        어느 길이든, 도착지는 같습니다 — 우리 학생에게 맞는 수업
      </BottomLine>
    </Slide>
  );
}

export const WISH_PROMPT =
  "지금 개발 중인 내 과목에 어떤 지원자료를 만들어주고 싶으신가요? (예: 기후시민 되기 — 차시별 토론 학습지)";

// S19 — [인터랙션 ③] 실습 예고: 자유 입력 (라임 블록 — 청중 참여)
export function S19() {
  const staticMode = useDeck()?.staticMode;
  const [wishes, setWishes] = useState([]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (staticMode) return;
    return subscribeWishes(setWishes, () => setFailed(true));
  }, [staticMode]);
  const live = fbEnabled && !failed && !staticMode;
  const visible = wishes.filter((w) => !w.hidden);

  return (
    <Slide tone="lime" eyebrow={`${FIN} · 실습 예고 ③`}>
      <div className="flex items-end justify-between">
        <div>
          <h2 className="t-display-lg" style={{ fontSize: 48 }}>
            오늘 11시, 이제 여러분 차례입니다
          </h2>
          <p className="t-body-lg mt-2 opacity-60">
            3~4교시 · 디지털 기반 과목 개발 실습 4·5 — 교수학습과 평가 개발
          </p>
        </div>
        {live && (
          <span className="t-caption tabular opacity-60">
            입력 {visible.length}건 · 카드 클릭 = 숨김
          </span>
        )}
      </div>
      <p className="t-headline mt-5 rounded-[24px] bg-canvas px-6 py-4">
        {WISH_PROMPT}
      </p>
      {!live && !staticMode && <OfflineHint />}
      {staticMode ? (
        <div className="mt-4 flex min-h-0 flex-1 items-center justify-center rounded-[24px] bg-canvas">
          <p className="t-headline text-center opacity-60">
            발표 중 청중이 실시간으로 입력에 참여합니다
          </p>
        </div>
      ) : (
        <div className="mt-4 grid min-h-0 flex-1 auto-rows-min grid-cols-3 gap-3 overflow-hidden">
          {visible.slice(0, 12).map((w) => (
            <button
              key={w.id}
              onClick={(e) => {
                e.stopPropagation();
                hideWish(w.id);
              }}
              className="t-body-lg rounded-[24px] bg-canvas p-5 text-left leading-snug transition hover:ring-2 hover:ring-accent-magenta"
            >
              {w.text}
            </button>
          ))}
          {live && visible.length === 0 && (
            <div className="t-body-lg col-span-3 flex items-center justify-center opacity-50">
              입력을 기다리는 중…
            </div>
          )}
        </div>
      )}
      <BottomLine>이 화면이 오늘 오후 실습의 예고편입니다.</BottomLine>
    </Slide>
  );
}

// S20 — 감사 (잉크/다크 블록)
export function S20() {
  return (
    <Slide tone="ink">
      <div className="flex h-full items-center justify-between">
        <div>
          <h2 className="t-display-xl">감사합니다</h2>
          <div className="t-card-title mt-8 opacity-70">
            이승엽 · 장평중학교 정보 교사
          </div>
          <a
            href="/hwpx"
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="t-button mt-10 inline-flex items-center gap-2 rounded-[50px] bg-block-lime px-7 py-3.5 text-ink transition hover:opacity-90"
          >
            🖍️ 교육과정 초안 AI 첨삭기 열기 →
          </a>
          <p className="t-body-sm mt-3 opacity-50">
            HWPX 초안을 올리면 교안 기준으로 점검 메모를 달아 드립니다
          </p>
          <a
            href="/diff"
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="t-button mt-5 inline-flex items-center gap-2 rounded-[50px] bg-block-mint px-7 py-3.5 text-ink transition hover:opacity-90"
          >
            🔍 교육과정 차별성 비교분석기 열기 →
          </a>
          <p className="t-body-sm mt-3 opacity-50">
            내 초안과 기존 교육과정을 비교해 차별화 전략을 Excel로 드립니다
          </p>
        </div>
        <div className="flex w-[330px] shrink-0 flex-col items-center gap-5">
          <div className="rounded-[24px] bg-block-lime p-8">
            <AutoQR path="/slide" size={200} />
          </div>
          <p className="t-body-lg text-center opacity-70">슬라이드 자료는 여기서</p>
        </div>
      </div>
    </Slide>
  );
}
