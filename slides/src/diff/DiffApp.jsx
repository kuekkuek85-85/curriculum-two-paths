import { useRef, useState } from "react";
import { extractDoc } from "./docExtract.js";
import { buildComparisonWorkbook, downloadWorkbook } from "./excel.js";

const STEPS = {
  extracting: "문서 텍스트 추출 중…",
  comparing: "AI 비교 분석 중…",
};

function UploadBox({ label, hint, accept, file, onPick }) {
  const ref = useRef(null);
  const [drag, setDrag] = useState(false);
  return (
    <div
      className={`flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed p-6 text-center transition ${
        drag ? "border-ink bg-surface-soft" : "border-hairline"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        onPick(e.dataTransfer.files?.[0]);
      }}
      onClick={() => ref.current?.click()}
    >
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />
      <div className="t-caption opacity-60">{label}</div>
      <div className="text-3xl mt-2">📄</div>
      <p className="t-body mt-2 font-bold">{file ? file.name : "클릭 또는 드래그"}</p>
      <p className="t-body-sm mt-1 opacity-50">{hint}</p>
    </div>
  );
}

function SimBadge({ level }) {
  const map = {
    높음: "bg-accent-magenta text-inverse-ink",
    보통: "bg-block-cream text-ink",
    낮음: "bg-block-mint text-ink",
  };
  return (
    <span className={`rounded-[50px] px-4 py-1.5 text-[15px] font-bold ${map[level] || "bg-surface-soft"}`}>
      유사도 {level}
    </span>
  );
}

export default function DiffApp() {
  const [mineFile, setMineFile] = useState(null);
  const [otherFile, setOtherFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle|extracting|comparing|done|error
  const [result, setResult] = useState(null); // {mine, others:[{name,result}]}
  const [error, setError] = useState("");

  const busy = status === "extracting" || status === "comparing";

  const run = async () => {
    if (!mineFile || !otherFile || busy) return;
    setError("");
    setResult(null);
    try {
      setStatus("extracting");
      const mine = await extractDoc(mineFile, { allowPdf: true });
      const other = await extractDoc(otherFile, { allowPdf: true });

      setStatus("comparing");
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mineName: mine.name,
          otherName: other.name,
          mineText: mine.positioned,
          otherText: other.positioned,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `비교 서버 오류 (${res.status})`);

      setResult({
        mine: { name: mine.name },
        others: [{ name: other.name, result: data }],
      });
      setStatus("done");
    } catch (e) {
      setError(e.message || "분석 중 오류가 발생했습니다.");
      setStatus("error");
    }
  };

  const onExcel = () => {
    if (!result) return;
    const d = new Date();
    const dateStr = d.toISOString().slice(0, 19).replace("T", " ");
    const day = d.toISOString().slice(0, 10);
    const wb = buildComparisonWorkbook({ mine: result.mine, others: result.others, dateStr });
    downloadWorkbook(wb, `교육과정_비교분석_${day}.xlsx`);
  };

  const overall = result?.others?.[0]?.result?.overall;
  const items = result?.others?.[0]?.result?.items || [];
  const strategy = result?.others?.[0]?.result?.strategy || [];

  return (
    <div className="min-h-full bg-canvas text-ink">
      <div className="mx-auto w-full max-w-[980px] px-5 py-10">
        <div className="t-eyebrow opacity-60">학교자율시간 과목 개발 · 도구</div>
        <h1 className="t-display-lg mt-3" style={{ fontSize: 40 }}>
          교육과정 차별성 비교분석기
        </h1>
        <p className="t-body-lg mt-3 opacity-70">
          내 초안(HWPX)과 기존/기승인 교육과정(HWPX·PDF)을 올리면, 유사/차별 지점을 근거와 함께
          분석하고 <b>차별화 전략</b>을 제안해 <b>Excel</b>로 내려 드립니다.
        </p>

        {/* 업로드 2단 */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <UploadBox
            label="내 교육과정 초안 (HWPX/PDF)"
            hint=".hwpx 또는 .pdf"
            accept=".hwpx,.pdf"
            file={mineFile}
            onPick={(f) => f && setMineFile(f)}
          />
          <div className="flex flex-col gap-3">
            <UploadBox
              label="비교할 교육과정 (HWPX/PDF)"
              hint=".hwpx 또는 .pdf"
              accept=".hwpx,.pdf"
              file={otherFile}
              onPick={(f) => f && setOtherFile(f)}
            />
            <div className="t-body-sm rounded-[14px] bg-surface-soft px-4 py-2 text-center opacity-40">
              + 파일 추가 (여러 문서 비교는 추후 지원)
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={run}
            disabled={busy || !mineFile || !otherFile}
            className="rounded-[50px] bg-ink px-8 py-4 text-[18px] font-bold text-inverse-ink transition hover:opacity-80 disabled:opacity-40"
          >
            {busy ? STEPS[status] : "비교 분석 시작"}
          </button>
        </div>

        {error && (
          <div className="mt-5 rounded-[16px] bg-accent-magenta/10 px-5 py-4 text-[15px] text-accent-magenta">
            {error}
          </div>
        )}

        {/* 결과 */}
        {status === "done" && overall && (
          <div className="mt-10">
            {/* 요약 배너 */}
            <div className="flex flex-wrap items-center gap-4 rounded-[20px] bg-surface-soft p-6">
              <SimBadge level={overall.similarity} />
              <p className="t-body-lg flex-1">{overall.summary}</p>
              <button
                onClick={onExcel}
                className="rounded-[50px] bg-block-lime px-6 py-3 text-[16px] font-bold text-ink transition hover:opacity-90"
              >
                ⬇ Excel 내려받기
              </button>
            </div>

            {/* 항목별 비교표 */}
            <h2 className="t-headline mt-8">항목별 비교</h2>
            <div className="mt-3 overflow-x-auto rounded-[16px] border border-hairline">
              <table className="w-full border-collapse text-[14px]">
                <thead>
                  <tr className="bg-ink text-inverse-ink">
                    {["#", "소제목", "판정", "유사도", "내 초안", "비교 대상", "판단 근거"].map((h) => (
                      <th key={h} className="p-2 text-left font-bold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr
                      key={it.no}
                      className={`border-t border-hairline align-top ${
                        it.verdict === "차별"
                          ? "bg-block-mint/30"
                          : it.degree === "상"
                            ? "bg-accent-magenta/10"
                            : ""
                      }`}
                    >
                      <td className="p-2 tabular">{it.no}</td>
                      <td className="p-2 font-semibold">{it.section}</td>
                      <td className="p-2">{it.verdict}</td>
                      <td className="p-2 font-bold">{it.degree}</td>
                      <td className="p-2">
                        <div className="opacity-50">{it.mine.pos}</div>
                        {it.mine.snippet}
                      </td>
                      <td className="p-2">
                        <div className="opacity-50">{it.other.pos}</div>
                        {it.other.snippet}
                      </td>
                      <td className="p-2 opacity-70">{it.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 차별화 전략 카드 */}
            {strategy.length > 0 && (
              <>
                <h2 className="t-headline mt-8">차별화 전략 (제안)</h2>
                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {strategy.map((st) => (
                    <div
                      key={st.no}
                      className="rounded-[20px] bg-surface-soft p-5"
                      style={{ borderLeft: "5px solid var(--color-seal, #0F6B4F)" }}
                    >
                      <div className="t-card-title">{st.target}</div>
                      <div className="t-body-sm mt-2 text-accent-magenta">⚠ {st.risk}</div>
                      <div className="t-body mt-2">✏️ {st.direction}</div>
                      {st.basis && (
                        <div className="t-body-sm mt-2 opacity-60">└ 근거: {st.basis}</div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <p className="t-body-sm mt-12 border-t border-hairline pt-5 opacity-50">
          AI 분석은 참고용입니다. 표절·승인의 최종 판단은 심의기관과 작성자에게 있습니다. 업로드한
          파일은 서버에 저장되지 않으며, 비교를 위해 추출한 텍스트만 AI에 전달됩니다.
        </p>
      </div>
    </div>
  );
}
