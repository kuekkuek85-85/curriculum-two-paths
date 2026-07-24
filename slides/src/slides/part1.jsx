import { Slide, BottomLine, Card, CountUp } from "./common.jsx";

const P1 = "PART 1 · 만든 사람의 이야기";

// S3 — 섹션 표지 (라일락 블록)
export function S3() {
  return (
    <Slide tone="lilac">
      <div className="flex h-full flex-col justify-center">
        <div className="t-eyebrow opacity-60">PART 1</div>
        <h2 className="t-display-xl mt-6">디지털 시민으로 성장하기</h2>
        <div className="t-subhead mt-4 opacity-70">
          Growing as a Digital Citizen
        </div>
        <div className="t-caption mt-14 border-t border-ink/20 pt-5">
          2024 하반기 교육감 승인 신설과목 · 장평중학교
        </div>
        <div className="mt-8">
          <a
            href="/files/디지털시민으로성장하기-교육과정.pdf"
            download="디지털 시민으로 성장하기 교육과정.pdf"
            onClick={(e) => e.stopPropagation()}
            className="t-button inline-flex items-center gap-2 rounded-[50px] bg-ink px-6 py-3 text-inverse-ink transition hover:opacity-80"
          >
            ⬇ 교육과정 문서 내려받기 (PDF)
          </a>
        </div>
      </div>
    </Slide>
  );
}

// S4 — 왜 만들었나: 하나의 질문
export function S4() {
  return (
    <Slide eyebrow={P1}>
      <h2 className="t-display-lg mb-10 max-w-[980px]">
        "우리 아이들에게 무엇을, 어떻게 가르쳐야 할까?"
      </h2>
      <div className="grid flex-1 grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <div className="t-caption opacity-60">디지털 대전환의 빛</div>
          <ul className="t-headline mt-5 space-y-3">
            <li>흥미·참여 증가</li>
            <li>시공간을 넘는 수업</li>
            <li>맞춤형 교육</li>
          </ul>
        </Card>
        <Card className="flex flex-col">
          <div className="t-caption opacity-60">그림자</div>
          <ul className="t-headline mt-5 space-y-3">
            <li>기기 과의존</li>
            <li>학습 격차 극대화</li>
            <li>소통·갈등 해결 미숙</li>
            <li>공동체 의식 약화</li>
          </ul>
        </Card>
      </div>
    </Slide>
  );
}

// S5 — 근거: 우리 학교 실태조사
export function S5() {
  return (
    <Slide eyebrow={P1}>
      <h2 className="t-display-lg mb-9">우리 학교 실태조사가 말해준 것</h2>
      <div className="grid flex-1 grid-cols-3 gap-6">
        <Card className="flex flex-col justify-center">
          <div className="t-display-xl tabular" style={{ fontSize: 76 }}>
            86%
          </div>
          <p className="t-body-lg mt-4">
            교사들이 "디지털 시민성 교육 필요"에 공감
          </p>
        </Card>
        <Card className="flex flex-col justify-center">
          <div className="t-display-lg" style={{ fontSize: 52 }}>
            그러나
          </div>
          <p className="t-body-lg mt-4">
            관련 수업·연수 경험은 매우 부족
            <br />
            <span className="tabular opacity-60">경험 응답 4.8%</span>
          </p>
        </Card>
        <Card className="flex flex-col justify-center">
          <div className="t-caption opacity-60">최우선 요구</div>
          <div className="t-headline mt-3">
            "시간 확보"와
            <br />
            "학습지원자료"
          </div>
        </Card>
      </div>
      <BottomLine>답은 학교자율시간 과목 개발이었습니다.</BottomLine>
    </Slide>
  );
}

// S6 — D·A·U·M 프로젝트 (크림 블록)
const DAUM = [
  ["D", "Discover", "'나'를 발견하고", "나다움"],
  ["A", "Act", "'우리'가 함께 행동하며", "우리다움"],
  ["U", "Unite", "'인간'을 통합하여", "인간다움"],
  ["M", "Meet", "다(多)정한 디지털 시민을 만나다", ""],
];

export function S6() {
  return (
    <Slide tone="cream" eyebrow={P1}>
      <h2 className="t-display-lg mb-8">D·A·U·M 프로젝트</h2>
      <div className="grid flex-1 grid-cols-4 gap-5">
        {DAUM.map(([letter, word, desc, tag]) => (
          <div key={letter} className="flex flex-col rounded-[24px] bg-canvas p-6">
            <div className="t-display-xl" style={{ fontSize: 68, fontWeight: 480 }}>
              {letter}
            </div>
            <div className="t-caption mt-1 opacity-60">{word}</div>
            <p className="t-headline mt-5">{desc}</p>
            {tag && <div className="t-caption mt-auto pt-4">({tag})</div>}
          </div>
        ))}
      </div>
      <div className="t-body-lg mt-7 border-t border-ink/15 pt-5">
        <p>
          다(多)정한 = 스스로에 대한 <span className="t-link">인정</span> · 서로에 대한{" "}
          <span className="t-link">우정</span> · 세상에 대한{" "}
          <span className="t-link">온정</span>
        </p>
        <p className="mt-1 opacity-60">연구팀 5인: 교감 + 사회·정보·역사·영어 교사</p>
      </div>
    </Slide>
  );
}

// S7 — 개발 여정 타임라인 (2024) + '적합' 도장
const TIMELINE = [
  ["연중", "매주 월요일 연구회의"],
  ["8.9.", "여름방학 개발 워크숍"],
  ["8.30.", "승인 신청서 제출"],
  ["9.6.", "컨설팅장학 (교수·현장교사 3인)"],
  ["9.10.", "교육과정(안) 제출"],
];

export function S7() {
  return (
    <Slide eyebrow={P1}>
      <h2 className="t-display-lg mb-12">개발 여정 타임라인 (2024)</h2>
      <div className="flex flex-1 items-start">
        {TIMELINE.map(([date, label], i) => (
          <div key={i} className="flex-1 pr-4">
            <div className="flex items-center">
              <div className="h-3 w-3 shrink-0 rounded-full bg-ink" />
              <div className="h-px flex-1 bg-hairline" />
            </div>
            <div className="t-caption mt-4 tabular">{date}</div>
            <p className="t-body-lg mt-1.5 pr-2">{label}</p>
          </div>
        ))}
        <div className="flex-1">
          <div className="flex items-center">
            <div className="h-3 w-3 shrink-0 rounded-full bg-accent-magenta" />
          </div>
          <div className="t-caption mt-4 tabular text-accent-magenta">10.16.</div>
          <p className="t-body-lg mt-1.5">심의 결과</p>
          <div className="stamp-seal mt-6 text-[38px]">적합</div>
          <p className="t-body-sm mt-6 opacity-60">
            중학교 신청 교육과정 중<br />
            유일하게 수정 요청 없이 통과
          </p>
        </div>
      </div>
    </Slide>
  );
}

// S8 — 교육과정 구조: 4개 영역
const AREAS = [
  ["1", "디지털 도구 활용 능력을 갖춘 시민", "", "협업·발표·영상 도구, 생성형 AI", "9디성01"],
  ["2", "책임감과 자기 정체성을 갖춘 디지털 시민", "나다움", "디지털 발자국, 과의존 예방, 개인정보·저작권", "9디성02"],
  ["3", "협력적 의사소통이 가능한 디지털 시민", "우리다움", "사이버폭력·가짜뉴스 판별, 디지털 격차 해소, 언어·문화 넘는 소통", "9디성03"],
  ["4", "사회 참여에 주도적인 디지털 시민", "인간다움", "사회 문제 발견·해결, 선한 영향력 콘텐츠", "9디성04"],
];

export function S8() {
  return (
    <Slide eyebrow={P1}>
      <h2 className="t-display-lg mb-8">교육과정 구조: 4개 영역</h2>
      <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-5">
        {AREAS.map(([n, title, tag, desc, code]) => (
          <Card key={n} className="flex flex-col">
            <div className="flex items-baseline gap-3">
              <span className="t-card-title tabular opacity-40">{n}</span>
              <span className="t-headline">
                {title}
                {tag && <span className="ml-2 opacity-60">({tag})</span>}
              </span>
            </div>
            <p className="t-body-lg mt-3 opacity-70">{desc}</p>
            <div className="t-caption mt-auto pt-3 opacity-50">{code}</div>
          </Card>
        ))}
      </div>
    </Slide>
  );
}

// S9 — 설계 포인트 (민트 블록)
const POINTS = [
  ["모듈형", "학기 초 1·2영역 집중 후 3·4영역 주 1시간 등, 학교 사정대로 재구성 가능하게 설계"],
  ["범교과", "기술·정보·사회·도덕과의 융합 수업을 전제로 내용 중복 회피"],
  ["1년의 수업이 곧 각론", "연구 수업 사례가 그대로 내용 체계·성취기준의 근거가 됨"],
];

export function S9() {
  return (
    <Slide tone="mint" eyebrow={P1}>
      <h2 className="t-display-lg mb-9">학교자율시간에 맞게 만들었다</h2>
      <div className="flex flex-1 flex-col justify-center gap-5">
        {POINTS.map(([title, desc]) => (
          <div
            key={title}
            className="flex items-center gap-9 rounded-[24px] bg-canvas p-7"
          >
            <div className="t-card-title w-[280px] shrink-0">{title}</div>
            <p className="t-body-lg">{desc}</p>
          </div>
        ))}
      </div>
    </Slide>
  );
}

// S10 — 교실에서 ① 정보과 사례
export function S10() {
  return (
    <Slide eyebrow={P1}>
      <h2 className="t-display-lg mb-8" style={{ fontSize: 52 }}>
        교실에서 ① 정보과 사례
      </h2>
      <div className="flex flex-1 gap-6">
        <Card className="flex flex-1 flex-col">
          <div className="t-display-lg" style={{ fontSize: 38 }}>
            정보 윤리 꾸러미로 디지털 시민성 쑥쑥
          </div>
          <div className="t-caption mt-3 opacity-60">1학년 정보 · 7차시</div>
          <ul className="t-headline mt-7 space-y-4">
            <li>'털린 내 정보 찾기'로 내 개인정보 유출 직접 조회</li>
            <li>스미싱·보이스피싱 간접 체험</li>
            <li>배움을 교내 인공지능 창작대회로 연결 → 2학기 프로그래밍 단원으로 심화</li>
          </ul>
        </Card>
        <div className="flex w-[42%] shrink-0 items-center justify-center overflow-hidden rounded-[24px] bg-surface-soft p-4">
          <img
            src="/img/voice-phishing.png"
            alt="보이스피싱 체험 활동 — 학생들이 노트북으로 실습하는 교실 모습"
            className="max-h-full max-w-full rounded-[8px] object-contain"
          />
        </div>
      </div>
      <BottomLine>교과 수업 → 대회 → 다음 학기 교과로 이어지는 나선형 설계</BottomLine>
    </Slide>
  );
}

// S11 — 교실에서 ② 팀원들의 타 교과 사례
export function S11() {
  return (
    <Slide eyebrow={P1}>
      <h2 className="t-display-lg mb-8" style={{ fontSize: 52 }}>
        교실에서 ② 팀원들의 타 교과 사례
      </h2>
      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-[minmax(0,1fr)] gap-6">
        <Card className="flex min-h-0 flex-col">
          <div className="t-caption opacity-60">역사</div>
          <div className="t-headline mt-2">한국–인도네시아 국제공동수업</div>
          <p className="t-body-lg mt-3">
            독립운동가 '양칠성=코마루딘'으로 잇는 공통의 역사, 실시간 번역 AI로 소통,
            공동 엠블럼 제작
          </p>
          <div className="mt-4 flex min-h-0 flex-1 items-center justify-center">
            <img
              src="/img/korea-indonesia.png"
              alt="한국–인도네시아 국제공동수업 활동 — Copilot 실시간 번역기로 학생 제작 엠블럼 발표"
              className="max-h-full max-w-full rounded-[8px] object-contain"
            />
          </div>
        </Card>
        <Card className="flex min-h-0 flex-col">
          <div className="t-caption opacity-60">사회</div>
          <div className="t-headline mt-2">콩고민주공화국 온라인 액션</div>
          <p className="t-body-lg mt-3">
            분쟁 자원 학습 후 국제 엠네스티 서명 참여, 캠페인 포스터를 자기 SNS에 게시
          </p>
          <div className="mt-4 flex min-h-0 flex-1 items-center justify-center">
            <img
              src="/img/congo-action.png"
              alt="콩고 온라인 액션 활동 — 온라인 캠페인 포스터 제작 및 캠페인 실천"
              className="max-h-full max-w-full rounded-[8px] object-contain"
            />
          </div>
        </Card>
      </div>
      <BottomLine>정보 교과가 아니어도 굴러갑니다 — 이것이 범교과 설계의 힘</BottomLine>
    </Slide>
  );
}

// S12 — 1년의 검증: 숫자가 남았다 (네이비 블록)
export function S12() {
  return (
    <Slide tone="navy" eyebrow={P1}>
      <h2 className="t-display-lg mb-8">1년의 검증: 숫자가 남았다</h2>
      <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-5">
        <div className="flex flex-col justify-center rounded-[24px] bg-white/10 px-8">
          <div className="t-caption opacity-70">학생 '나다움' 문항 긍정 응답</div>
          <div className="t-display-lg tabular mt-2" style={{ fontSize: 56 }}>
            +<CountUp value={8.2} />
            <span className="t-card-title">%p</span>
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-[24px] bg-white/10 px-8">
          <div className="t-caption opacity-70">학생 공감(우리다움) 문항</div>
          <div className="t-display-lg tabular mt-2" style={{ fontSize: 56 }}>
            +<CountUp value={6.2} />
            <span className="t-card-title">%p</span>
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-[24px] bg-white/10 px-8">
          <div className="t-caption opacity-70">교사 "매우 그렇다" 평균</div>
          <div className="t-display-lg tabular mt-2" style={{ fontSize: 44 }}>
            <span className="opacity-50">18.3%</span> → <CountUp value={73.8} />%
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-[24px] bg-white/10 px-8">
          <div className="t-caption opacity-70">교사 시민성 수업 경험</div>
          <div className="t-display-lg tabular mt-2" style={{ fontSize: 44 }}>
            <span className="opacity-50">4.8%</span> →{" "}
            <CountUp value={50} decimals={0} />%
          </div>
        </div>
      </div>
      <BottomLine tone="navy">
        교육과정과 함께 학습지원자료도 개발해 타교 공유 — 오늘 PART 2의 재료가 됩니다
      </BottomLine>
    </Slide>
  );
}

// S12-B — 만든 사람이 배운 세 가지 (힌지)
const LESSONS = [
  ["진짜 필요해야 만든다", "우리 학교의 질문과 실태조사에서 출발했기에 승인까지 갔다"],
  [
    "이미 있으면 만들지 않는다",
    "기존 과목과 겹치면 승인은 더 까다로워진다. 우리는 '디지털 리터러시'가 아니라 그보다 넓은 '디지털 시민성'이었다",
  ],
  ["그리고 요즘은, 요령이 있다", "AI와 디지털을 잘 쓰면 개발도 운영도 효율적으로 할 수 있다"],
];

export function S12B() {
  return (
    <Slide eyebrow={P1}>
      <h2 className="t-display-lg mb-9" style={{ fontSize: 52 }}>
        만든 사람이 배운 세 가지
      </h2>
      <div className="flex flex-1 flex-col justify-center gap-8">
        {LESSONS.map(([title, desc], i) => (
          <div key={i} className="flex items-start gap-7">
            <span className="t-caption mt-3 tabular opacity-40">0{i + 1}</span>
            <div>
              <div className="t-display-lg" style={{ fontSize: 40 }}>
                {title}
              </div>
              <p className="t-body-lg mt-2 opacity-70">{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <BottomLine>그 요령이 지금부터의 이야기입니다.</BottomLine>
    </Slide>
  );
}
