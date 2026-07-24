import { Chrome, BottomLine, CountUp } from "./common.jsx";

const P1 = "PART 1 · 만든 사람의 이야기";

// S3 — 섹션 표지
export function S3() {
  return (
    <div className="flex h-full flex-col items-start justify-center px-16">
      <div className="text-[26px] font-extrabold tracking-[0.3em] text-seal">PART 1</div>
      <h2 className="mt-4 text-[52px] font-extrabold leading-tight tracking-tight">
        디지털 시민으로 성장하기
      </h2>
      <div className="mt-2 text-[24px] font-semibold text-dim">
        Growing as a Digital Citizen
      </div>
      <div className="mt-10 border-t border-line pt-4 text-[19px] text-dim">
        2024 하반기 교육감 승인 신설과목 · 장평중학교
      </div>
    </div>
  );
}

// S4 — 왜 만들었나: 하나의 질문
export function S4() {
  return (
    <Chrome label={P1}>
      <div className="flex h-full flex-col">
        <h2 className="text-center text-[38px] font-extrabold leading-snug tracking-tight">
          "우리 아이들에게 무엇을, 어떻게 가르쳐야 할까?"
        </h2>
        <div className="mt-10 grid flex-1 grid-cols-2 gap-6">
          <div className="rounded-xl border border-line bg-white p-8">
            <div className="mb-4 text-[21px] font-bold text-seal">디지털 대전환의 빛</div>
            <ul className="space-y-3 text-[20px] leading-relaxed">
              <li>흥미·참여 증가</li>
              <li>시공간을 넘는 수업</li>
              <li>맞춤형 교육</li>
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-white p-8">
            <div className="mb-4 text-[21px] font-bold text-dim">그림자</div>
            <ul className="space-y-3 text-[20px] leading-relaxed">
              <li>기기 과의존</li>
              <li>학습 격차 극대화</li>
              <li>소통·갈등 해결 미숙</li>
              <li>공동체 의식 약화</li>
            </ul>
          </div>
        </div>
      </div>
    </Chrome>
  );
}

// S5 — 근거: 우리 학교 실태조사
export function S5() {
  return (
    <Chrome label={P1}>
      <div className="flex h-full flex-col">
        <h2 className="mb-8 text-[34px] font-extrabold tracking-tight">
          우리 학교 실태조사가 말해준 것
        </h2>
        <div className="grid flex-1 grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-white p-6 text-center">
            <div className="tabular text-[64px] font-extrabold text-seal">86%</div>
            <p className="mt-3 text-[19px] leading-snug">
              교사들이 "디지털 시민성 교육 필요"에 공감
            </p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-white p-6 text-center">
            <div className="text-[44px] font-extrabold text-ink">그러나</div>
            <p className="mt-3 text-[19px] leading-snug">
              관련 수업·연수 경험은 매우 부족
              <br />
              <span className="tabular text-dim">(경험 응답 4.8%)</span>
            </p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-white p-6 text-center">
            <div className="text-[34px] font-extrabold text-ink">최우선 요구</div>
            <p className="mt-3 text-[21px] font-semibold leading-snug">
              "시간 확보"와
              <br />
              "학습지원자료"
            </p>
          </div>
        </div>
        <BottomLine accent>→ 답은 학교자율시간 과목 개발이었습니다.</BottomLine>
      </div>
    </Chrome>
  );
}

// S6 — D·A·U·M 프로젝트
const DAUM = [
  ["D", "Discover", "'나'를 발견하고", "나다움"],
  ["A", "Act", "'우리'가 함께 행동하며", "우리다움"],
  ["U", "Unite", "'인간'을 통합하여", "인간다움"],
  ["M", "Meet", "다(多)정한 디지털 시민을 만나다", ""],
];

export function S6() {
  return (
    <Chrome label={P1}>
      <div className="flex h-full flex-col">
        <h2 className="mb-8 text-[34px] font-extrabold tracking-tight">
          D·A·U·M 프로젝트
        </h2>
        <div className="grid flex-1 grid-cols-4 gap-5">
          {DAUM.map(([letter, word, desc, tag]) => (
            <div
              key={letter}
              className="flex flex-col items-center rounded-xl border border-line bg-white p-6 text-center"
            >
              <div className="text-[72px] font-extrabold leading-none text-seal">
                {letter}
              </div>
              <div className="mt-1 text-[19px] font-bold text-dim">{word}</div>
              <p className="mt-4 text-[19px] font-semibold leading-snug">{desc}</p>
              {tag && (
                <div className="mt-auto pt-3 text-[17px] font-bold text-seal">({tag})</div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-1 border-t border-line pt-4 text-[18px] text-dim">
          <p>
            다(多)정한 = 스스로에 대한 <b className="text-ink">인정</b> · 서로에 대한{" "}
            <b className="text-ink">우정</b> · 세상에 대한 <b className="text-ink">온정</b>
          </p>
          <p>연구팀 5인: 교감 + 사회·정보·역사·영어 교사</p>
        </div>
      </div>
    </Chrome>
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
    <Chrome label={P1}>
      <div className="flex h-full flex-col">
        <h2 className="mb-10 text-[34px] font-extrabold tracking-tight">
          개발 여정 타임라인 (2024)
        </h2>
        <div className="flex flex-1 items-start">
          {TIMELINE.map(([date, label], i) => (
            <div key={i} className="relative flex-1 pr-3">
              <div className="flex items-center">
                <div className="h-4 w-4 shrink-0 rounded-full bg-seal" />
                <div className="h-[2px] flex-1 bg-line" />
              </div>
              <div className="tabular mt-3 text-[17px] font-bold text-seal">{date}</div>
              <p className="mt-1 pr-1 text-[17px] font-semibold leading-snug">{label}</p>
            </div>
          ))}
          <div className="relative flex-1">
            <div className="flex items-center">
              <div className="h-4 w-4 shrink-0 rounded-full bg-stamp" />
            </div>
            <div className="tabular mt-3 text-[17px] font-bold text-stamp">10.16.</div>
            <p className="mt-1 text-[17px] font-semibold leading-snug">심의 결과</p>
            <div className="stamp-seal mt-4 text-[40px]">적합</div>
            <p className="mt-4 text-[14px] leading-snug text-dim">
              중학교 신청 교육과정 중<br />
              유일하게 수정 요청 없이 통과
            </p>
          </div>
        </div>
      </div>
    </Chrome>
  );
}

// S8 — 교육과정 구조: 4개 영역
const AREAS = [
  [
    "1",
    "디지털 도구 활용 능력을 갖춘 시민",
    "",
    "협업·발표·영상 도구, 생성형 AI",
    "9디성01",
  ],
  [
    "2",
    "책임감과 자기 정체성을 갖춘 디지털 시민",
    "나다움",
    "디지털 발자국, 과의존 예방, 개인정보·저작권",
    "9디성02",
  ],
  [
    "3",
    "협력적 의사소통이 가능한 디지털 시민",
    "우리다움",
    "사이버폭력·가짜뉴스 판별, 디지털 격차 해소, 언어·문화 넘는 소통",
    "9디성03",
  ],
  [
    "4",
    "사회 참여에 주도적인 디지털 시민",
    "인간다움",
    "사회 문제 발견·해결, 선한 영향력 콘텐츠",
    "9디성04",
  ],
];

export function S8() {
  return (
    <Chrome label={P1}>
      <div className="flex h-full flex-col">
        <h2 className="mb-7 text-[34px] font-extrabold tracking-tight">
          교육과정 구조: 4개 영역
        </h2>
        <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-5">
          {AREAS.map(([n, title, tag, desc, code]) => (
            <div key={n} className="flex flex-col rounded-xl border border-line bg-white p-6">
              <div className="flex items-baseline gap-3">
                <span className="tabular text-[26px] font-extrabold text-seal">{n}</span>
                <span className="text-[21px] font-bold leading-tight">
                  {title}
                  {tag && <span className="ml-2 text-seal">({tag})</span>}
                </span>
              </div>
              <p className="mt-3 text-[17px] leading-relaxed text-dim">{desc}</p>
              <div className="tabular mt-auto pt-2 text-[13px] text-dim">{code}</div>
            </div>
          ))}
        </div>
      </div>
    </Chrome>
  );
}

// S9 — 설계 포인트
const POINTS = [
  [
    "모듈형",
    "학기 초 1·2영역 집중 후 3·4영역 주 1시간 등, 학교 사정대로 재구성 가능하게 설계",
  ],
  ["범교과", "기술·정보·사회·도덕과의 융합 수업을 전제로 내용 중복 회피"],
  ["1년의 수업이 곧 각론", "연구 수업 사례가 그대로 내용 체계·성취기준의 근거가 됨"],
];

export function S9() {
  return (
    <Chrome label={P1}>
      <div className="flex h-full flex-col">
        <h2 className="mb-8 text-[34px] font-extrabold tracking-tight">
          설계 포인트: 학교자율시간에 맞게 만들었다
        </h2>
        <div className="flex flex-1 flex-col justify-center gap-6">
          {POINTS.map(([title, desc]) => (
            <div key={title} className="flex items-center gap-8 rounded-xl border border-line bg-white p-7">
              <div className="w-[300px] shrink-0 text-[26px] font-extrabold text-seal">
                {title}
              </div>
              <p className="text-[20px] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Chrome>
  );
}

// S10 — 교실에서 ① 정보과 사례
export function S10() {
  return (
    <Chrome label={P1}>
      <div className="flex h-full flex-col">
        <h2 className="mb-7 text-[30px] font-extrabold tracking-tight">
          교실에서 ① — 정보과 사례
        </h2>
        <div className="flex flex-1 flex-col rounded-xl border border-line bg-white p-9">
          <div className="text-[30px] font-extrabold leading-snug">
            정보 윤리 꾸러미로 디지털 시민성 쑥쑥
          </div>
          <div className="mt-1 text-[18px] text-dim">1학년 정보 · 7차시</div>
          <ul className="mt-7 space-y-4 text-[21px] leading-relaxed">
            <li>· '털린 내 정보 찾기'로 내 개인정보 유출 직접 조회</li>
            <li>· 스미싱·보이스피싱 간접 체험</li>
            <li>· 배움을 교내 인공지능 창작대회로 연결 → 2학기 프로그래밍 단원으로 심화</li>
          </ul>
        </div>
        <BottomLine>교과 수업 → 대회 → 다음 학기 교과로 이어지는 나선형 설계</BottomLine>
      </div>
    </Chrome>
  );
}

// S11 — 교실에서 ② 팀원들의 타 교과 사례
export function S11() {
  return (
    <Chrome label={P1}>
      <div className="flex h-full flex-col">
        <h2 className="mb-7 text-[30px] font-extrabold tracking-tight">
          교실에서 ② — 팀원들의 타 교과 사례
        </h2>
        <div className="grid flex-1 grid-cols-2 gap-6">
          <div className="rounded-xl border border-line bg-white p-8">
            <div className="text-[16px] font-bold text-seal">역사</div>
            <div className="mt-1 text-[23px] font-extrabold leading-snug">
              한국–인도네시아 국제공동수업
            </div>
            <p className="mt-4 text-[19px] leading-relaxed">
              독립운동가 '양칠성=코마루딘'으로 잇는 공통의 역사, 실시간 번역 AI로 소통,
              공동 엠블럼 제작
            </p>
          </div>
          <div className="rounded-xl border border-line bg-white p-8">
            <div className="text-[16px] font-bold text-seal">사회</div>
            <div className="mt-1 text-[23px] font-extrabold leading-snug">
              콩고민주공화국 온라인 액션
            </div>
            <p className="mt-4 text-[19px] leading-relaxed">
              분쟁 자원 학습 후 국제 엠네스티 서명 참여, 캠페인 포스터를 자기 SNS에 게시
            </p>
          </div>
        </div>
        <BottomLine>정보 교과가 아니어도 굴러갑니다 — 이것이 범교과 설계의 힘</BottomLine>
      </div>
    </Chrome>
  );
}

// S12 — 1년의 검증: 숫자가 남았다 (카운트업)
export function S12() {
  return (
    <Chrome label={P1}>
      <div className="flex h-full flex-col">
        <h2 className="mb-8 text-[34px] font-extrabold tracking-tight">
          1년의 검증: 숫자가 남았다
        </h2>
        <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-5">
          <div className="flex flex-col justify-center rounded-xl border border-line bg-white px-8">
            <div className="text-[19px] font-semibold text-dim">
              학생 '나다움' 문항 긍정 응답
            </div>
            <div className="tabular mt-1 text-[52px] font-extrabold text-seal">
              +<CountUp value={8.2} />
              <span className="text-[32px]">%p</span>
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-xl border border-line bg-white px-8">
            <div className="text-[19px] font-semibold text-dim">
              학생 공감(우리다움) 문항
            </div>
            <div className="tabular mt-1 text-[52px] font-extrabold text-seal">
              +<CountUp value={6.2} />
              <span className="text-[32px]">%p</span>
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-xl border border-line bg-white px-8">
            <div className="text-[19px] font-semibold text-dim">
              교사 "매우 그렇다" 평균
            </div>
            <div className="tabular mt-1 text-[44px] font-extrabold">
              18.3% <span className="text-dim">→</span>{" "}
              <span className="text-seal">
                <CountUp value={73.8} />%
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-xl border border-line bg-white px-8">
            <div className="text-[19px] font-semibold text-dim">
              교사 시민성 수업 경험
            </div>
            <div className="tabular mt-1 text-[44px] font-extrabold">
              4.8% <span className="text-dim">→</span>{" "}
              <span className="text-seal">
                <CountUp value={50} decimals={0} />%
              </span>
            </div>
          </div>
        </div>
        <BottomLine>
          교육과정과 함께 학습지원자료도 개발해 타교 공유 — 오늘 PART 2의 재료가 됩니다
        </BottomLine>
      </div>
    </Chrome>
  );
}

// S12-B — 만든 사람이 배운 세 가지 (힌지)
const LESSONS = [
  [
    "진짜 필요해야 만든다",
    "우리 학교의 질문과 실태조사에서 출발했기에 승인까지 갔다",
  ],
  [
    "이미 있으면 만들지 않는다",
    "기존 과목과 겹치면 승인은 더 까다로워진다. 우리는 '디지털 리터러시'가 아니라 그보다 넓은 '디지털 시민성'이었다",
  ],
  [
    "그리고 요즘은, 요령이 있다",
    "AI와 디지털을 잘 쓰면 개발도 운영도 효율적으로 할 수 있다",
  ],
];

export function S12B() {
  return (
    <Chrome label={P1}>
      <div className="flex h-full flex-col">
        <h2 className="mb-8 text-[30px] font-extrabold tracking-tight">
          만든 사람이 배운 세 가지
        </h2>
        <div className="flex flex-1 flex-col justify-center gap-7">
          {LESSONS.map(([title, desc], i) => (
            <div key={i} className="flex items-start gap-6">
              <span className="tabular mt-1 text-[26px] font-extrabold text-seal">
                {i + 1}
              </span>
              <div>
                <div className="text-[30px] font-extrabold leading-snug">{title}</div>
                <p className="mt-1 text-[19px] leading-relaxed text-dim">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <BottomLine accent>그 요령이 지금부터의 이야기입니다.</BottomLine>
      </div>
    </Chrome>
  );
}
