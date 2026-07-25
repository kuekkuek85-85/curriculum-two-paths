// 문서 → 위치표시 텍스트 추출
// HWPX: 소제목(성격/목표/…) 구간으로 나눠 【소제목】 마커, PDF: 페이지별 【p.N】 마커.
import { parseHwpx, plainText, SUBHEADS } from "../hwpx/hwpxLib.js";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const norm = (s) => (s || "").replace(/[\s·]/g, "");

// 평문 라인들을 소제목 기준으로 구간 분할 → 위치표시 텍스트
function sectionize(text) {
  const heads = SUBHEADS.map((h) => norm(h));
  const lines = text.split("\n");
  let current = "머리말";
  const buckets = new Map();
  const push = (sec, line) => {
    if (!buckets.has(sec)) buckets.set(sec, []);
    buckets.get(sec).push(line);
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const nl = norm(line);
    const hitIdx = heads.findIndex(
      (h) => h && (nl === h || nl.startsWith(h)) && line.length <= SUBHEADS[heads.indexOf(h)].length + 12
    );
    if (hitIdx >= 0) {
      current = SUBHEADS[hitIdx];
    }
    push(current, line);
  }
  let out = "";
  for (const [sec, arr] of buckets) {
    out += `【${sec}】\n${arr.join("\n")}\n\n`;
  }
  return out.trim();
}

export async function extractHwpx(file) {
  const buf = await file.arrayBuffer();
  const { sectionXml } = await parseHwpx(buf);
  const text = plainText(sectionXml);
  return { name: file.name, kind: "hwpx", positioned: sectionize(text), chars: text.length };
}

export async function extractPdf(file) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
  let out = "";
  let total = 0;
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((it) => (it.str != null ? it.str : ""))
      .join("")
      .replace(/\s+/g, " ")
      .trim();
    total += pageText.length;
    if (pageText) out += `【p.${p}】\n${pageText}\n\n`;
  }
  if (total < 30) {
    throw new Error(
      "텍스트 추출 불가 — 스캔 PDF로 보입니다. 텍스트 기반 PDF나 HWPX로 올려 주세요."
    );
  }
  return { name: file.name, kind: "pdf", positioned: out.trim(), chars: total };
}

// 확장자에 따라 자동 추출
export async function extractDoc(file, { allowPdf }) {
  if (/\.hwpx$/i.test(file.name)) return extractHwpx(file);
  if (allowPdf && /\.pdf$/i.test(file.name)) return extractPdf(file);
  throw new Error(
    allowPdf ? "HWPX 또는 PDF만 올릴 수 있습니다." : "HWPX 파일만 올릴 수 있습니다."
  );
}
