import { WORKSHEET_CAPTURE } from "../config.js";
import { S1, S1B, S2, S2B } from "./intro.jsx";
import {
  S3,
  S4,
  S5,
  S6,
  S7,
  S8,
  S9,
  S10,
  S11,
  S12,
  S12B,
} from "./part1.jsx";
import { S13, S13B, S14, S14B, S15, S15B, S16, S17 } from "./part2.jsx";
import { S18, S19, S20 } from "./closing.jsx";

const INTRO = "도입";
const P1 = "PART 1 · 만든 사람의 이야기";
const P2 = "PART 2 · 가져다 쓴 사람의 이야기";
const FIN = "마무리";

// interaction: 해당 슬라이드 진입 시 /live에 자동 활성화되는 인터랙션
export function buildSlides() {
  const slides = [
    { id: "S1", section: INTRO, title: "타이틀 · QR 대기 화면", comp: S1 },
    { id: "S1-B", section: INTRO, title: "강사 소개", comp: S1B },
    { id: "S2", section: INTRO, title: "과목 개발의 두 가지 경로", comp: S2 },
    { id: "S2-B", section: INTRO, title: "실시간 폴 ① 지원자료", comp: S2B, interaction: "poll" },
    { id: "S3", section: P1, title: "PART 1 표지", comp: S3 },
    { id: "S4", section: P1, title: "왜 만들었나: 하나의 질문", comp: S4 },
    { id: "S5", section: P1, title: "근거: 실태조사", comp: S5 },
    { id: "S6", section: P1, title: "D·A·U·M 프로젝트", comp: S6 },
    { id: "S7", section: P1, title: "개발 타임라인 · '적합'", comp: S7 },
    { id: "S8", section: P1, title: "교육과정 구조 4영역", comp: S8 },
    { id: "S9", section: P1, title: "설계 포인트", comp: S9 },
    { id: "S10", section: P1, title: "교실에서 ① 정보과", comp: S10 },
    { id: "S11", section: P1, title: "교실에서 ② 타 교과", comp: S11 },
    { id: "S12", section: P1, title: "1년의 검증: 숫자", comp: S12 },
    { id: "S12-B", section: P1, title: "배운 세 가지 (힌지)", comp: S12B },
    { id: "S13", section: P2, title: "PART 2 표지", comp: S13 },
    { id: "S13-B", section: P2, title: "현실의 세 갈래", comp: S13B },
    { id: "S14", section: P2, title: "승인 과목은 공공재", comp: S14 },
    { id: "S14-B", section: P2, title: "퀴즈 ② 얼마나 걸렸나", comp: S14B, interaction: "quiz" },
    { id: "S15", section: P2, title: "핵심: 파이프라인", comp: S15 },
    ...(WORKSHEET_CAPTURE
      ? [{ id: "S15-B", section: P2, title: "실물 증거: 학습지", comp: S15B }]
      : []),
    { id: "S16", section: P2, title: "라이브 시연", comp: S16 },
    { id: "S17", section: P2, title: "시연 백업 캡처", comp: S17 },
    { id: "S18", section: FIN, title: "두 경로 비교", comp: S18 },
    { id: "S19", section: FIN, title: "실습 예고 ③ 자유 입력", comp: S19, interaction: "wish" },
    { id: "S20", section: FIN, title: "감사 · QR", comp: S20 },
  ];
  return slides;
}
