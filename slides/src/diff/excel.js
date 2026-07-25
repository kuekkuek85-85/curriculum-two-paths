// 비교 결과 → 스타일 있는 .xlsx (3시트). 1:N 확장 대비 '비교 대상 파일' 컬럼 포함.
import * as XLSX from "xlsx-js-style";

const HEADER_FILL = "1A2332"; // ink
const RED = "F6C5C0"; // 유사-상 강조(연빨강)
const RED_MID = "FBE4E0";
const GREEN = "CDE9DD"; // 차별 강조(연녹)

const headerStyle = {
  font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
  fill: { fgColor: { rgb: HEADER_FILL } },
  alignment: { vertical: "center", horizontal: "center", wrapText: true },
};
const cellStyle = {
  alignment: { vertical: "top", horizontal: "left", wrapText: true },
  font: { sz: 10 },
};

function fillFor(verdict, degree) {
  if (verdict === "차별") return GREEN;
  if (degree === "상") return RED;
  if (degree === "중") return RED_MID;
  return null;
}

function sheetFromAoa(aoa, { widths, headerRows = 1, fillMap }) {
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr];
      if (!cell) continue;
      if (r < headerRows) {
        cell.s = headerStyle;
      } else {
        const rgb = fillMap && fillMap(r, c);
        cell.s = rgb
          ? { ...cellStyle, fill: { fgColor: { rgb } } }
          : cellStyle;
      }
    }
  }
  if (widths) ws["!cols"] = widths.map((w) => ({ wch: w }));
  return ws;
}

export function buildComparisonWorkbook({ mine, others, dateStr }) {
  const wb = XLSX.utils.book_new();

  // 시트1 «비교 요약»
  const summaryAoa = [["항목", "값"], ["내 초안 파일명", mine.name]];
  others.forEach((o, i) => {
    const tag = others.length > 1 ? ` #${i + 1}` : "";
    summaryAoa.push([`비교 대상 파일명${tag}`, o.name]);
    summaryAoa.push([`전체 유사도${tag}`, o.result.overall.similarity]);
    summaryAoa.push([`총평${tag}`, o.result.overall.summary]);
  });
  summaryAoa.push(["분석 일시", dateStr]);
  const ws1 = sheetFromAoa(summaryAoa, { widths: [22, 70] });
  XLSX.utils.book_append_sheet(wb, ws1, "비교 요약");

  // 시트2 «항목별 비교»
  const head2 = [
    "순번",
    "비교 대상 파일",
    "소제목",
    "판정",
    "유사도",
    "내 초안 위치",
    "내 초안 내용",
    "비교 대상 위치",
    "비교 대상 내용",
    "비고(판단 근거)",
  ];
  const rows2 = [];
  const fillRows2 = [];
  let n = 0;
  others.forEach((o) => {
    o.result.items.forEach((it) => {
      n += 1;
      rows2.push([
        n,
        o.name,
        it.section,
        it.verdict,
        it.degree,
        it.mine.pos,
        it.mine.snippet,
        it.other.pos,
        it.other.snippet,
        it.note,
      ]);
      fillRows2.push(fillFor(it.verdict, it.degree));
    });
  });
  const ws2 = sheetFromAoa([head2, ...rows2], {
    widths: [6, 18, 12, 8, 8, 14, 34, 14, 34, 30],
    fillMap: (r) => fillRows2[r - 1], // r=1 → 첫 데이터행
  });
  XLSX.utils.book_append_sheet(wb, ws2, "항목별 비교");

  // 시트3 «차별화 전략»
  const head3 = ["순번", "비교 대상 파일", "대상 지점", "표절/유사 위험", "차별화 방향(제안)", "근거"];
  const rows3 = [];
  let m = 0;
  others.forEach((o) => {
    o.result.strategy.forEach((st) => {
      m += 1;
      rows3.push([m, o.name, st.target, st.risk, st.direction, st.basis]);
    });
  });
  const ws3 = sheetFromAoa([head3, ...rows3], {
    widths: [6, 18, 22, 34, 40, 26],
  });
  XLSX.utils.book_append_sheet(wb, ws3, "차별화 전략");

  return wb;
}

export function downloadWorkbook(wb, filename) {
  XLSX.writeFile(wb, filename);
}
