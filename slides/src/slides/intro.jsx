import { useEffect, useState } from "react";
import { Chrome, BottomLine, AutoQR, OfflineHint } from "./common.jsx";
import { fbEnabled, subscribeCounts } from "../firebase.js";

// S1 — 타이틀 (대기 화면 겸용)
export function S1() {
  return (
    <div className="flex h-full items-center px-16">
      <div className="flex-1 pr-10">
        <div className="mb-6 border-b border-line pb-3 text-[15px] font-semibold tracking-wide text-seal">
          2026 중학교 학교자율시간 과목 개발 전문가 연수 · 1교시
        </div>
        <h1 className="text-[54px] font-extrabold leading-[1.15] tracking-tight">
          학교자율시간
          <br />
          과목 개발 및 운영 사례
        </h1>
        <p className="mt-5 text-[24px] font-semibold text-seal">
          디지털 시민으로 성장하기 · 인공지능과 미래사회
        </p>
        <div className="mt-12">
          <div className="text-[22px] font-bold">이승엽 — 장평중학교 정보 교사</div>
          <div className="mt-1 text-[15px] text-dim">서울시교육청 1호 교사 개발자</div>
        </div>
      </div>
      <div className="flex w-[360px] flex-col items-center gap-4">
        <AutoQR path="/live" size={220} />
        <p className="text-center text-[17px] leading-relaxed text-dim">
          휴대폰이나 노트북으로 접속해 두세요
          <br />
          <span className="font-semibold text-ink">
            오늘 세 번, 여러분의 답이 이 화면에 뜹니다
          </span>
        </p>
      </div>
    </div>
  );
}

// S2 — 프레임: 과목 개발의 두 가지 경로
export function S2() {
  return (
    <Chrome label="도입 · 오늘의 프레임">
      <div className="flex h-full flex-col">
        <h2 className="mb-8 text-[38px] font-extrabold tracking-tight">
          과목 개발의 두 가지 경로
        </h2>
        <div className="grid flex-1 grid-cols-2 gap-6">
          <div className="flex flex-col rounded-xl border border-line bg-white p-8">
            <div className="text-[15px] font-semibold text-dim">경로 A</div>
            <div className="mt-1 text-[30px] font-extrabold text-seal">만드는 사람</div>
            <div className="mt-5 text-[22px] font-bold">디지털 시민으로 성장하기</div>
            <p className="mt-3 text-[18px] leading-relaxed text-dim">
              2024년 우리 학교가 개발, 교육감 승인
            </p>
          </div>
          <div className="flex flex-col rounded-xl border border-line bg-white p-8">
            <div className="text-[15px] font-semibold text-dim">경로 B</div>
            <div className="mt-1 text-[30px] font-extrabold text-seal">가져다 쓰는 사람</div>
            <div className="mt-5 text-[22px] font-bold">인공지능과 미래사회</div>
            <p className="mt-3 text-[18px] leading-relaxed text-dim">
              다른 학교 선생님들이 개발한 승인 과목을 우리 학교가 운영
            </p>
          </div>
        </div>
        <BottomLine>
          개발하는 법은 이미 들으셨고, 앞으로도 들으실 겁니다. 저는 그 다음 이야기를
          하겠습니다 — 만든 과목이든 가져온 과목이든, 교실에서 굴러가게 만드는 법.
        </BottomLine>
      </div>
    </Chrome>
  );
}

export const POLL_OPTIONS = [
  "어떻게 만들지 막막하다",
  "학습지 정도는 만들 수 있을 것 같다",
  "수업용 소프트웨어까지 욕심난다",
];

// S2-B — [인터랙션 ①] 실시간 폴
export function S2B() {
  const [counts, setCounts] = useState([0, 0, 0]);
  const [failed, setFailed] = useState(false);
  useEffect(
    () => subscribeCounts("poll", 3, setCounts, () => setFailed(true)),
    []
  );
  const live = fbEnabled && !failed;
  const total = counts.reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...counts);

  return (
    <Chrome label="도입 · 실시간 폴 ①">
      <div className="flex h-full flex-col">
        <h2 className="text-[34px] font-extrabold leading-snug tracking-tight">
          지금 개발 중인 내 과목, 완성되고 나면 — 지원자료는?
        </h2>
        {live ? (
          <div className="tabular mt-2 text-[17px] text-dim">응답 {total}명</div>
        ) : (
          <OfflineHint />
        )}
        <div className="mt-8 flex flex-1 flex-col justify-center gap-6">
          {POLL_OPTIONS.map((opt, i) => (
            <div key={i}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-[22px] font-semibold">
                  <span className="mr-2 text-seal">{"①②③"[i]}</span>
                  {opt}
                </span>
                {live && (
                  <span className="tabular text-[20px] font-bold text-seal">
                    {counts[i]}표
                  </span>
                )}
              </div>
              <div className="h-8 w-full overflow-hidden rounded bg-line/50">
                <div
                  className="h-full rounded bg-seal transition-all duration-500"
                  style={{ width: `${(counts[i] / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <BottomLine accent>
          어느 쪽이든 좋습니다 — 오늘 50분이면 ③까지 가는 길이 보입니다.
        </BottomLine>
      </div>
    </Chrome>
  );
}
