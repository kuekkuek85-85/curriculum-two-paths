// Vercel Serverless Function — Gemini 프록시 (API 키 비노출)
// 초안 텍스트를 받아 '과목 개발 체크리스트'에 비추어 되묻는 조교 피드백(JSON)을 돌려준다.
// Gemini는 교육과정을 대신 작성하지 않는다 — 빠지거나 약한 부분을 '질문'으로만 짚는다.

const MODEL = "gemini-flash-latest";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// 과목 개발 체크리스트 요약(준비/계획/개발/적용/평가) — 교안 기반 점검 기준
const CHECKLIST = `
[과목 개발 체크리스트 요약]
1. 준비 단계
   - 학교의 실제 요구·실태에서 출발했는가? (개발 동기의 타당성)
   - 학생 수준·학교 여건에 맞는 범위인가?
2. 계획 단계
   - 과목의 성격이 한 문장으로 분명한가?
   - 목표가 학습자 행동(무엇을 할 수 있게 되는가)으로 진술되었는가?
3. 개발 단계 (가장 중요)
   - 차별성: 기존·기승인(고시 외) 과목과 무엇이 다른지 명확히 서술했는가?
     (예: '디지털 리터러시'가 아니라 그보다 넓은 '디지털 시민성'처럼)
   - 핵심 아이디어가 영역을 관통하는 빅 아이디어로 진술되었는가?
   - 내용 체계(지식·이해 / 과정·기능 / 가치·태도)가 균형 있게 채워졌는가?
   - 성취기준 진술 공식: "A(내용)를 B(기능)하고 C(내용)를 D(기능)한다" 형태인가?
   - 시수 대비 성취기준 분량이 과다/과소하지 않은가? (1성취기준 ≈ 2~4차시 목안)
4. 적용 단계
   - 교수·학습 방법이 성취기준과 연결되는가? (활동이 목표를 달성하는가)
   - 차시별 운영이 학교자율시간(모듈형)에 맞게 재구성 가능한가?
5. 평가 단계
   - 평가가 성취기준에 근거하는가? (무엇을, 어떻게 확인하는지)
   - 과정 중심 평가 요소가 있는가?
`;

const SYSTEM = `당신은 학교자율시간 과목 개발 실습의 보조 조교입니다.
[규칙]
- 교육과정을 대신 작성하지 마세요. 문장을 완성해 주지 마세요.
- 아래 '과목 개발 체크리스트'에 비추어, 참여자 초안에서 빠졌거나 약한 부분을 '질문'으로 짚어 주세요.
- 소제목(성격/목표/핵심아이디어/내용체계/성취기준/교수학습/평가)별로 최대 3가지.
  각 항목은 (짚을 점 point → 되물음 ask) 형식. 단정 대신 질문으로.
- 특히 '차별성'(기존·기승인 과목과의 차이), '성취기준 진술 공식(A를 B하고 C를 D한다)',
  '시수 내 성취기준 분량'을 우선 점검하세요.
- 각 지적에는 반드시 근거(basis)를 답니다: 어떤 체크리스트 항목에 비추어 그렇게 판단했는지.
  근거 없는 지적은 금지.
- 답을 모르면 ask에 "강사에게 확인하세요"로 넘기세요.
- 초안에 실제로 등장한 내용에 근거해 구체적으로 지적하세요. 일반론 금지.

${CHECKLIST}

[출력 형식] 반드시 아래 JSON만 출력하세요(설명 문장 없이):
{"sections":[{"title":"소제목","issues":[{"point":"짚을 점","ask":"되물음(질문)","basis":"근거가 된 체크리스트 항목"}]}]}`;

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
            basis: (i.basis || "").toString(),
          })),
      }))
      .filter((s) => s.issues.length > 0);

    res.status(200).json({ sections: clean });
  } catch (e) {
    res.status(500).json({ error: "점검 중 오류가 발생했습니다.", detail: String(e).slice(0, 300) });
  }
}
