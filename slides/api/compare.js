// Vercel Serverless Function — Gemini 교육과정 차별성 비교 (API 키 비노출)
// 내 초안(A)과 비교 대상(B)의 위치표시 텍스트를 받아 소제목별 유사/차별 분석 + 차별화 전략을 JSON으로 반환.

const MODEL = "gemini-flash-latest";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const CRITERION = `
[판단 기준] 학교자율시간 신설 과목 승인 심의에서 "기존·기승인(고시 외) 과목과의 차별성"이 핵심이다.
표현만 바꾼 실질적 동일(패러프레이즈)도 유사로 강하게 본다.
두 문서 텍스트에는 【성취기준】 같은 소제목 또는 【p.12】 같은 페이지 위치 표시가 붙어 있다.
근거(pos)에는 이 위치 표시와 해당 표현(snippet)을 제시하라.
`;

const SYSTEM = `당신은 학교자율시간 신설 과목의 표절·차별성 심의를 돕는 분석가입니다.
두 교육과정(내 초안 A, 비교 대상 B)을 소제목별로 비교하세요.
[규칙]
- 각 항목을 '유사' 또는 '차별'로 분류하고, 유사도(상/중/하)를 매기세요.
- 반드시 근거를 답니다: A와 B의 어느 위치(소제목/페이지)와 어떤 표현이 비슷/다른지 원문 근거(snippet)를 제시하세요.
- 표현만 바꾼 실질적 동일(패러프레이즈)은 '유사'-'상'으로 강하게 표시하세요.
- 교육과정을 대신 작성하지 마세요. 차별화는 '방향 제안'으로만.
- 마지막에 '차별화 전략'을 제시: 어떤 지점을 어떻게 바꾸면 표절 소지를 줄이고 독자적 정체성을
  확보할 수 있는지. 단, 문장을 대신 써주지 말고 전략과 예시 방향만.
- items는 최대 12개, strategy는 최대 6개로.
${CRITERION}
[출력 형식] 반드시 아래 JSON만 출력(설명 문장 없이):
{"overall":{"similarity":"높음|보통|낮음","summary":"한 줄 총평"},
 "items":[{"no":1,"section":"소제목","verdict":"유사|차별","degree":"상|중|하",
  "mine":{"pos":"위치","snippet":"내 초안 근거"},"other":{"pos":"위치","snippet":"비교 대상 근거"},"note":"판단 이유"}],
 "strategy":[{"no":1,"target":"바꿀 지점","risk":"표절/유사 위험","direction":"차별화 방향(제안)","basis":"근거"}]}`;

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
  const mineName = (body.mineName || "내 초안").toString();
  const otherName = (body.otherName || "비교 대상").toString();
  const mineText = (body.mineText || "").toString().slice(0, 18000);
  const otherText = (body.otherText || "").toString().slice(0, 18000);
  if (!mineText.trim() || !otherText.trim()) {
    res.status(400).json({ error: "두 문서의 텍스트가 모두 필요합니다." });
    return;
  }

  const prompt =
    `${SYSTEM}\n\n[내 초안 A — ${mineName}]\n${mineText}\n\n[비교 대상 B — ${otherName}]\n${otherText}`;

  async function callGemini() {
    const gRes = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
      }),
    });
    if (!gRes.ok) {
      const t = await gRes.text();
      throw new Error(`Gemini ${gRes.status}: ${t.slice(0, 300)}`);
    }
    const data = await gRes.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    try {
      return JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      return m ? JSON.parse(m[0]) : null;
    }
  }

  try {
    let parsed;
    try {
      parsed = await callGemini();
    } catch {
      parsed = await callGemini(); // 재시도 1회
    }
    if (!parsed) {
      res.status(502).json({ error: "AI 응답을 해석하지 못했습니다. 다시 시도해 주세요." });
      return;
    }

    const s = (v) => (v == null ? "" : String(v));
    const overall = {
      similarity: s(parsed?.overall?.similarity || "보통"),
      summary: s(parsed?.overall?.summary || ""),
    };
    const items = (Array.isArray(parsed?.items) ? parsed.items : [])
      .slice(0, 12)
      .map((i, idx) => ({
        no: Number(i?.no) || idx + 1,
        section: s(i?.section),
        verdict: s(i?.verdict || "유사"),
        degree: s(i?.degree || "중"),
        mine: { pos: s(i?.mine?.pos), snippet: s(i?.mine?.snippet) },
        other: { pos: s(i?.other?.pos), snippet: s(i?.other?.snippet) },
        note: s(i?.note),
      }));
    const strategy = (Array.isArray(parsed?.strategy) ? parsed.strategy : [])
      .slice(0, 6)
      .map((i, idx) => ({
        no: Number(i?.no) || idx + 1,
        target: s(i?.target),
        risk: s(i?.risk),
        direction: s(i?.direction || "직접 작성 필요"),
        basis: s(i?.basis),
      }));

    res.status(200).json({ overall, items, strategy });
  } catch (e) {
    res.status(500).json({ error: "비교 분석 중 오류가 발생했습니다.", detail: String(e).slice(0, 300) });
  }
}
