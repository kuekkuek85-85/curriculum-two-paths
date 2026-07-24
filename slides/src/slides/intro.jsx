import { useEffect, useState } from "react";
import { Slide, BottomLine, Card, AutoQR, OfflineHint } from "./common.jsx";
import { fbEnabled, subscribeCounts } from "../firebase.js";

// S1 — 타이틀 (대기 화면 겸용)
export function S1() {
  return (
    <Slide>
      <div className="flex h-full items-center">
        <div className="flex-1 pr-12">
          <div className="t-eyebrow mb-10 opacity-60">
            2026 학교자율시간 과목 개발 전문가 연수 · 1교시
          </div>
          <h1 className="t-display-xl">
            학교자율시간
            <br />
            과목 개발 및 운영 사례
          </h1>
          <p className="t-subhead mt-8">
            디지털 시민으로 성장하기 · 인공지능과 미래사회
          </p>
          <div className="mt-14">
            <div className="t-card-title">이승엽 — 장평중학교 정보 교사</div>
            <div className="t-caption mt-2 opacity-60">
              서울시교육청 1호 교사 개발자
            </div>
          </div>
        </div>
        <div className="flex w-[330px] shrink-0 flex-col items-center gap-5">
          <div className="rounded-[24px] bg-block-lime p-8">
            <AutoQR path="/live" size={190} />
          </div>
          <p className="t-body-lg text-center">
            휴대폰이나 노트북으로 접속해 두세요
            <br />
            <span className="t-link">오늘 세 번, 여러분의 답이 이 화면에 뜹니다</span>
          </p>
        </div>
      </div>
    </Slide>
  );
}

// S2 — 프레임: 과목 개발의 두 가지 경로
export function S2() {
  return (
    <Slide eyebrow="도입 · 오늘의 프레임">
      <h2 className="t-display-lg mb-8">과목 개발의 두 가지 경로</h2>
      <div className="grid flex-1 grid-cols-2 gap-6">
        {[
          ["경로 A", "만드는 사람", "디지털 시민으로 성장하기", "2024년 우리 학교가 개발, 교육감 승인"],
          ["경로 B", "가져다 쓰는 사람", "인공지능과 미래사회", "다른 학교 선생님들이 개발한 승인 과목을 우리 학교가 운영"],
        ].map(([tag, title, subject, desc]) => (
          <Card key={tag} className="flex flex-col">
            <div className="t-caption opacity-60">{tag}</div>
            <div className="t-display-lg mt-2" style={{ fontSize: 44 }}>
              {title}
            </div>
            <div className="t-headline mt-7">{subject}</div>
            <p className="t-body-lg mt-2">{desc}</p>
          </Card>
        ))}
      </div>
      <BottomLine>
        개발하는 법은 이미 들으셨고, 앞으로도 들으실 겁니다. 저는 그 다음 이야기를
        하겠습니다 — 만든 과목이든 가져온 과목이든, 교실에서 굴러가게 만드는 법.
      </BottomLine>
    </Slide>
  );
}

export const POLL_OPTIONS = [
  "어떻게 만들지 막막하다",
  "학습지 정도는 만들 수 있을 것 같다",
  "수업용 소프트웨어까지 욕심난다",
];

// S2-B — [인터랙션 ①] 실시간 폴 (청중 참여 = 라임 블록)
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
    <Slide tone="lime" eyebrow="도입 · 실시간 폴 ①">
      <h2 className="t-display-lg" style={{ fontSize: 52 }}>
        지금 개발 중인 내 과목, 완성되고 나면 — 지원자료는?
      </h2>
      {live ? (
        <div className="t-caption tabular mt-4 opacity-60">응답 {total}명</div>
      ) : (
        <OfflineHint />
      )}
      <div className="mt-8 flex flex-1 flex-col justify-center gap-6">
        {POLL_OPTIONS.map((opt, i) => (
          <div key={i}>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="t-headline">
                <span className="mr-3 opacity-50">{"①②③"[i]}</span>
                {opt}
              </span>
              {live && (
                <span className="t-card-title tabular">{counts[i]}표</span>
              )}
            </div>
            <div className="h-8 w-full overflow-hidden rounded-[50px] bg-canvas">
              <div
                className="h-full rounded-[50px] bg-ink transition-all duration-500"
                style={{ width: `${(counts[i] / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <BottomLine>
        어느 쪽이든 좋습니다 — 오늘 50분이면 ③까지 가는 길이 보입니다.
      </BottomLine>
    </Slide>
  );
}
