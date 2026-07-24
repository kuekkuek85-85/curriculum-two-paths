import { useEffect, useState } from "react";
import { Chrome, BottomLine, AutoQR, OfflineHint } from "./common.jsx";
import { fbEnabled, subscribeWishes, hideWish } from "../firebase.js";

const FIN = "마무리";

// S18 — 두 경로 비교
const ROWS = [
  ["시작", "우리 학교의 질문에서", "승인 과목 목록에서"],
  ["필요한 것", "연구팀 · 1년의 수업 검증", "교육과정 문서 · 지원 자료 제작"],
  ["걸리는 시간", "1년", "한 학기 준비로 가능"],
  ["남는 것", "승인 과목 + 학교의 역량", "우리 교실에 맞는 수업"],
];

export function S18() {
  return (
    <Chrome label={FIN}>
      <div className="flex h-full flex-col">
        <h2 className="mb-7 text-[34px] font-extrabold tracking-tight">두 경로 비교</h2>
        <div className="flex-1 overflow-hidden rounded-xl border border-line bg-white">
          <table className="h-full w-full border-collapse text-[20px]">
            <thead>
              <tr className="border-b-2 border-ink text-[21px]">
                <th className="w-[180px] p-4"></th>
                <th className="p-4 text-left font-extrabold text-seal">만드는 길</th>
                <th className="p-4 text-left font-extrabold text-seal">가져다 쓰는 길</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([label, a, b]) => (
                <tr key={label} className="border-b border-line last:border-0">
                  <td className="p-4 font-bold text-dim">{label}</td>
                  <td className="p-4 font-semibold">{a}</td>
                  <td className="p-4 font-semibold">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <BottomLine accent>
          어느 길이든, 도착지는 같습니다 — 우리 학생에게 맞는 수업
        </BottomLine>
      </div>
    </Chrome>
  );
}

export const WISH_PROMPT =
  "지금 개발 중인 내 과목에 어떤 지원자료를 만들어주고 싶으신가요? (예: 기후시민 되기 — 차시별 토론 학습지)";

// S19 — [인터랙션 ③] 실습 예고: 자유 입력
export function S19() {
  const [wishes, setWishes] = useState([]);
  useEffect(() => subscribeWishes(setWishes), []);
  const visible = wishes.filter((w) => !w.hidden);

  return (
    <Chrome label={`${FIN} · 실습 예고 ③`}>
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-[32px] font-extrabold tracking-tight">
              오늘 11시, 이제 여러분 차례입니다
            </h2>
            <p className="mt-1 text-[18px] font-semibold text-dim">
              3~4교시 · 디지털 기반 과목 개발 실습 4·5 — 교수학습과 평가 개발
            </p>
          </div>
          {fbEnabled && (
            <span className="tabular text-[16px] text-dim">
              입력 {visible.length}건 · 카드 클릭 = 숨김
            </span>
          )}
        </div>
        <p className="mt-4 rounded-lg border border-line bg-white px-5 py-3 text-[19px] font-semibold text-seal">
          {WISH_PROMPT}
        </p>
        {!fbEnabled && <OfflineHint />}
        <div className="mt-4 grid min-h-0 flex-1 auto-rows-min grid-cols-3 gap-3 overflow-hidden">
          {visible.slice(0, 12).map((w) => (
            <button
              key={w.id}
              onClick={(e) => {
                e.stopPropagation();
                hideWish(w.id);
              }}
              className="rounded-lg border border-line bg-white p-4 text-left text-[18px] font-semibold leading-snug shadow-sm transition hover:border-stamp"
            >
              {w.text}
            </button>
          ))}
          {fbEnabled && visible.length === 0 && (
            <div className="col-span-3 flex items-center justify-center text-[19px] text-dim">
              입력을 기다리는 중…
            </div>
          )}
        </div>
        <BottomLine>이 화면이 오늘 오후 실습의 예고편입니다.</BottomLine>
      </div>
    </Chrome>
  );
}

// S20 — 감사
export function S20() {
  return (
    <div className="flex h-full items-center justify-between px-20">
      <div>
        <h2 className="text-[64px] font-extrabold tracking-tight">감사합니다</h2>
        <div className="mt-6 text-[24px] font-semibold">이승엽 · 장평중학교</div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <AutoQR path="" size={220} />
        <p className="text-[18px] font-semibold text-dim">슬라이드와 자료 링크는 여기서</p>
      </div>
    </div>
  );
}
