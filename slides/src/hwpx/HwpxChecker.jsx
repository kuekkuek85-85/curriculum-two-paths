import { useRef, useState } from "react";
import { parseHwpx, buildAnnotated, annotatedName, SUBHEADS } from "./hwpxLib.js";

const SCOPES = ["문서 전체", ...SUBHEADS];

const STEPS = {
  parsing: "HWPX 파싱 중…",
  ai: "AI 점검 중…",
  annotating: "메모 삽입 중…",
};

export default function HwpxChecker() {
  const [file, setFile] = useState(null);
  const [scope, setScope] = useState("문서 전체");
  const [status, setStatus] = useState("idle"); // idle|parsing|ai|annotating|done|error
  const [sections, setSections] = useState([]);
  const [error, setError] = useState("");
  const [download, setDownload] = useState(null); // {url, name}
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const busy = status === "parsing" || status === "ai" || status === "annotating";

  const pickFile = (f) => {
    if (!f) return;
    if (!/\.hwpx$/i.test(f.name)) {
      setError("HWPX(.hwpx) 파일만 올릴 수 있습니다.");
      return;
    }
    setError("");
    setFile(f);
    setSections([]);
    setDownload(null);
    setStatus("idle");
  };

  async function callGemini(text) {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, scope }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `점검 서버 오류 (${res.status})`);
    }
    return Array.isArray(data.sections) ? data.sections : [];
  }

  const runFromFile = async () => {
    if (!file || busy) return;
    setError("");
    setSections([]);
    setDownload(null);
    try {
      setStatus("parsing");
      const buf = await file.arrayBuffer();
      let parsed;
      try {
        parsed = await parseHwpx(buf);
      } catch (e) {
        // 파싱 실패 → 붙여넣기 모드로 폴백
        setStatus("idle");
        setPasteMode(true);
        setError(
          "이 파일은 자동 파싱이 어렵습니다. 아래에 초안 텍스트를 붙여넣어 점검해 주세요. (" +
            e.message +
            ")"
        );
        return;
      }

      setStatus("ai");
      const secs = await callGemini(parsed.text);
      setSections(secs);

      if (secs.length > 0) {
        setStatus("annotating");
        try {
          const blob = await buildAnnotated({
            zip: parsed.zip,
            sectionXml: parsed.sectionXml,
            sections: secs,
          });
          setDownload({
            url: URL.createObjectURL(blob),
            name: annotatedName(file.name),
          });
        } catch {
          // 재패킹 실패해도 화면 피드백은 유지
          setDownload(null);
        }
      }
      setStatus("done");
    } catch (e) {
      setError(e.message || "점검 중 오류가 발생했습니다.");
      setStatus("error");
    }
  };

  const runFromPaste = async () => {
    const t = pasteText.trim();
    if (!t || busy) return;
    setError("");
    setSections([]);
    setDownload(null);
    try {
      setStatus("ai");
      const secs = await callGemini(t);
      setSections(secs);
      setStatus("done");
    } catch (e) {
      setError(e.message || "점검 중 오류가 발생했습니다.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-full bg-canvas text-ink">
      <div className="mx-auto w-full max-w-[860px] px-5 py-10">
        {/* 헤더 */}
        <div className="t-eyebrow opacity-60">학교자율시간 과목 개발 실습 · 도구</div>
        <h1 className="t-display-lg mt-3" style={{ fontSize: 40 }}>
          교육과정 초안 AI 첨삭기
        </h1>
        <p className="t-body-lg mt-3 opacity-70">
          교육과정 초안(HWPX)을 올리면, 교안(체크리스트) 기준으로 점검 메모를 달아 드립니다.
          <br />
          AI는 <b>대신 써 주지 않고</b>, 빠지거나 약한 부분을 <b>질문</b>으로만 짚습니다.
        </p>

        {/* 업로드 */}
        {!pasteMode && (
          <div
            className={`mt-8 rounded-[24px] border-2 border-dashed p-10 text-center transition ${
              dragging ? "border-ink bg-surface-soft" : "border-hairline"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              pickFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
            role="button"
          >
            <input
              ref={inputRef}
              type="file"
              accept=".hwpx"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            <div className="text-4xl">📄</div>
            <p className="t-headline mt-4">
              {file ? file.name : "여기로 .hwpx 파일을 끌어다 놓거나 클릭해 선택"}
            </p>
            <p className="t-body mt-2 opacity-60">교육과정 초안 파일 (.hwpx)</p>
          </div>
        )}

        {/* 붙여넣기 폴백 */}
        {pasteMode && (
          <div className="mt-8">
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="교육과정 초안 텍스트를 붙여넣어 주세요"
              className="h-56 w-full rounded-[16px] border-2 border-hairline bg-surface-soft p-4 text-[16px] outline-none focus:border-ink"
            />
            <button
              onClick={() => {
                setPasteMode(false);
                setPasteText("");
                setError("");
              }}
              className="t-body mt-2 underline opacity-60"
            >
              파일 업로드로 돌아가기
            </button>
          </div>
        )}

        {/* 단계 선택 */}
        <div className="mt-6">
          <div className="t-caption opacity-60">집중 점검 범위</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {SCOPES.map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={`rounded-[50px] px-4 py-2 text-[15px] font-medium transition ${
                  scope === s
                    ? "bg-ink text-inverse-ink"
                    : "bg-surface-soft hover:bg-hairline"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 실행 버튼 */}
        <div className="mt-6">
          <button
            onClick={pasteMode ? runFromPaste : runFromFile}
            disabled={busy || (pasteMode ? !pasteText.trim() : !file)}
            className="rounded-[50px] bg-ink px-8 py-4 text-[18px] font-bold text-inverse-ink transition hover:opacity-80 disabled:opacity-40"
          >
            {busy ? STEPS[status] || "처리 중…" : "AI 점검 시작"}
          </button>
        </div>

        {/* 오류 */}
        {error && (
          <div className="mt-5 rounded-[16px] bg-accent-magenta/10 px-5 py-4 text-[15px] text-accent-magenta">
            {error}
          </div>
        )}

        {/* 결과 */}
        {status === "done" && (
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="t-headline">점검 결과</h2>
              {download ? (
                <a
                  href={download.url}
                  download={download.name}
                  className="rounded-[50px] bg-ink px-5 py-2.5 text-[15px] font-bold text-inverse-ink transition hover:opacity-80"
                >
                  ⬇ 메모 달린 HWPX 내려받기
                </a>
              ) : (
                <span className="t-body opacity-50">
                  {pasteMode ? "붙여넣기 모드 — 화면 피드백만 제공" : "메모 파일 생성 생략"}
                </span>
              )}
            </div>

            {sections.length === 0 ? (
              <p className="t-body-lg mt-5 rounded-[16px] bg-surface-soft px-5 py-4 opacity-70">
                크게 지적할 점이 발견되지 않았습니다. 초안이 잘 짜여 있거나, 더 구체적인
                점검이 필요하면 범위를 좁혀 다시 실행해 보세요.
              </p>
            ) : (
              <div className="mt-5 flex flex-col gap-5">
                {sections.map((sec, si) => (
                  <div key={si} className="rounded-[24px] bg-surface-soft p-6">
                    <div className="t-card-title">{sec.title}</div>
                    <div className="mt-4 flex flex-col gap-4">
                      {sec.issues.map((it, ii) => (
                        <div
                          key={ii}
                          className="rounded-[16px] bg-canvas p-4"
                          style={{ borderLeft: "5px solid var(--color-accent-magenta)" }}
                        >
                          {it.point && (
                            <div className="t-body-sm font-bold opacity-60">
                              {it.point}
                            </div>
                          )}
                          <div className="t-body-lg mt-1">💬 {it.ask}</div>
                          {it.basis && (
                            <div className="t-body-sm mt-2 opacity-60">
                              └ 근거: {it.basis}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 고지 */}
        <p className="t-body-sm mt-12 border-t border-hairline pt-5 opacity-50">
          AI 점검은 참고용입니다. 최종 판단은 강사·본인이 합니다. 업로드한 파일은 서버에
          저장되지 않으며, 점검을 위해 초안 텍스트만 AI에 전달됩니다.
        </p>
      </div>
    </div>
  );
}
