// Vercel Serverless Function — Gemini 프록시 (API 키 비노출)
// 초안 텍스트를 받아 '과목 개발 체크리스트'에 비추어 되묻는 조교 피드백(JSON)을 돌려준다.
// Gemini는 교육과정을 대신 작성하지 않는다 — 빠지거나 약한 부분을 '질문'으로만 짚는다.

const MODEL = "gemini-flash-latest";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// 학교자율시간 과목 개발 체크리스트 (임휘·백성혜, 2026 — 교안 원문 반영)
const CHECKLIST = `
[학교자율시간 과목 개발 체크리스트 — 임휘·백성혜(2026)]

■ 준비 단계
· 학습자 분석: 주요 학습 요구·흥미 진단 / 배경지식·학습 정도 파악 / 집단·개인 특성 파악
· 교육과정 분석: 국가 교육과정 성취기준·학습방법 숙지 / 학교급별 교과 연계성 / 범교과 학습주제·계기교육 파악
· 지역사회·환경 분석: 지역 특성·교육적 요구·학부모 기대 / 인적·물적 자원 발굴 / 실생활 관련 학습경험 발굴
· 학교 환경 분석: 학교 특색 교육활동·사업 / 교과 교사·교사학습공동체 / 학교 비전·교훈·슬로건 활용 가능성

■ 계획 단계 — 성격
· 준비: 학생 특성·흥미·수준을 고려한 필요성 도출 / 지역 환경·자원·학교 특색·비전 반영 / 교사 전문성·의지·요구 반영 / 개발 취지 명료
· 내용: [차별성] 기존 국가 교육과정 및 기승인된 고시 외 과목과의 유사성과 차별점을 명확히 서술했는가 / 교과 융합은 2개 이상 교과의 지식·태도·기능 통합 / 실생활 연관 체험활동 / 성격이 교과심화·연계·융합·지역·진로·학교특색·기초소양 등 특성에 부합
· 형식: 수업 대상 명확 지정 / 관련 교과 명시 / 주요 학습 전략 명시 / 핵심 역량 제시
· 검토: 필요성과 성격이 하나의 논리로 연결 / 타 교수자도 취지·가치 이해 가능

■ 계획 단계 — 목표
· 내용: 성격이 목표에 일관 반영 / 학년군 발달단계·수준에서 도달 가능 / 최종 도달점 종합 서술 / 2022 개정 6대 핵심역량 중 기르려는 역량 명시 / 인지·심동·정의 영역 균형
· 형식: 지식·이해/과정·기능/가치·태도별 또는 내용영역별·절차별 진술 / 추상 목표를 구체적 행동 동사로 진술
· 검토: 학습 후 평가 가능한 형태 / 미사여구·수식어 최소화

■ 계획 단계 — 과목명
· 내용·방향성 포괄 / 핵심 특성 암시 / 길이 적절 / 보편적 용어 / (융합) 의견수렴 / 영문명이 단순 직역이 아닌 고유 정체성 반영

■ 계획 단계 — 핵심 아이디어
· 핵심 개념 포함 / 영역을 아우르는 본질적 개념 / 개념 간 유의미한 관계 서술 / 학문적 용례·근거 / 진술 형식 일관

■ 계획 단계 — 내용 체계
· 지식·이해 / 과정·기능 / 가치·태도 3범주 누락 없이 포함, 어느 한쪽에 치우치지 않게 균형
· 각 범주에 적절한 서술어(지식·이해=기억·이해·적용 / 과정·기능=분석·평가·창조 / 가치·태도=인식·반응·가치화·조직화·인격화)
· 내용 요소가 추후 성취기준으로 조합되기에 충분·구체

■ 개발 단계 — 성취기준
· 형식: 두 범주 이상 결합 / "A를 B한다" 또는 "A를 B하고, C를 D한다"처럼 학습 내용과 수행 능력(행동동사)이 명확히 / 내용 체계표 요소와 누락·과잉 없이 대응
· 내용: 기존 성취기준을 그대로 쓰지 않고 새로 개발(활용 시 재구조화) / 평가 가능한 구체적 행동으로 서술 / 타 학교에도 보편 적용 / 선행학습 유의
· 검토: 34차시(또는 17차시) 시수 내 달성 가능한 분량으로 성취기준 수 조절 / 내용 영역별 고른 분포

■ 개발 단계 — 교수·학습 / 평가 방향
· 교수·학습: 단순 암기 지양 / 실생활 적용 / 과목 고유 탐구·사고 / 자기주도·참여·디지털 활용 / 실천 가능성 초점 / 안전·윤리 주의사항 명시
· 평가: 성취기준 근거 일관성 / 수업 전·중·후 평가 / 인지·기능·정의 균형 / 과정 확인·환류 / 수행평가·서논술형·참여형 등 다양화

■ 적용·평가 단계(요약): 교수·학습 자료(인정교과서/워크북) 개발, 편성·운영 시수 확보, 학생·교사 평가와 개선·환류
`;

const SYSTEM = `당신은 학교자율시간 과목 개발 실습의 보조 조교입니다.
[규칙]
- 아래 '과목 개발 체크리스트'에 비추어, 참여자 초안에서 빠졌거나 약한 부분을 '질문'으로 짚어 주세요(ask).
- 질문에 이어서, 참여자가 참고할 만한 '예시 답안/제안'(suggest)을 짧게(1~2문장) 제시하세요.
  이는 정답 강요가 아니라 방향을 잡아 주는 예시입니다. 초안을 통째로 대신 써 주지는 마세요.
- 소제목(성격/목표/핵심아이디어/내용체계/성취기준/교수학습/평가)별로 최대 3가지.
  각 항목은 (짚을 점 point → 되물음 ask → 예시 답안 suggest) 형식.
- 특히 '차별성'(기존·기승인 과목과의 차이), '성취기준 진술 공식(A를 B하고 C를 D한다)',
  '시수 내 성취기준 분량'을 우선 점검하세요.
- 각 지적에는 반드시 근거(basis)를 답니다: 어떤 체크리스트 항목에 비추어 그렇게 판단했는지.
  근거 없는 지적은 금지.
- 초안에 실제로 등장한 내용에 근거해 구체적으로 지적하세요. 일반론 금지.
- 판단이 어려우면 ask에 "강사에게 확인하세요", suggest는 빈 문자열로 두세요.

${CHECKLIST}

[출력 형식] 반드시 아래 JSON만 출력하세요(설명 문장 없이):
{"sections":[{"title":"소제목","issues":[{"point":"짚을 점","ask":"되물음(질문)","suggest":"예시 답안/제안(1~2문장)","basis":"근거가 된 체크리스트 항목"}]}]}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST만 허용됩니다." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error:
        "서버에 GEMINI_API_KEY가 설정되지 않았습니다. Vercel 환경변수에 키를 추가해 주세요.",
    });
    return;
  }

  const body = req.body || {};
  const text = (body.text || "").toString().trim();
  const scope = (body.scope || "문서 전체").toString();
  if (!text) {
    res.status(400).json({ error: "점검할 초안 텍스트가 비어 있습니다." });
    return;
  }

  // 너무 긴 초안은 앞부분 위주로 제한(토큰 보호)
  const draft = text.slice(0, 20000);
  const scopeLine =
    scope && scope !== "문서 전체"
      ? `\n[집중 점검 대상] '${scope}' 소제목을 특히 자세히 보세요.`
      : "";

  const prompt = `${SYSTEM}${scopeLine}\n\n[참여자 교육과정 초안]\n${draft}`;

  try {
    const gRes = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      }),
    });

    if (!gRes.ok) {
      const errText = await gRes.text();
      res.status(502).json({
        error: `Gemini 호출 실패 (${gRes.status})`,
        detail: errText.slice(0, 500),
      });
      return;
    }

    const data = await gRes.json();
    const raw =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // JSON 파싱 실패 시 원문에서 JSON 블록만 추출 시도
      const m = raw.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : { sections: [] };
    }

    const sections = Array.isArray(parsed?.sections) ? parsed.sections : [];
    // 규칙 위반(초안을 대신 써준 응답 등) 방어: point/ask 없는 항목 제거
    const clean = sections
      .map((s) => ({
        title: (s.title || "기타").toString(),
        issues: (Array.isArray(s.issues) ? s.issues : [])
          .filter((i) => i && (i.ask || i.point))
          .slice(0, 3)
          .map((i) => ({
            point: (i.point || "").toString(),
            ask: (i.ask || "강사에게 확인하세요").toString(),
            suggest: (i.suggest || "").toString(),
            basis: (i.basis || "").toString(),
          })),
      }))
      .filter((s) => s.issues.length > 0);

    res.status(200).json({ sections: clean });
  } catch (e) {
    res.status(500).json({ error: "점검 중 오류가 발생했습니다.", detail: String(e).slice(0, 300) });
  }
}
