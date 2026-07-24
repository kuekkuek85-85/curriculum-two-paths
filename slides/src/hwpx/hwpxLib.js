// HWPX(zip 패키지) 클라이언트 처리 — unzip → 텍스트 추출 → 메모 문단 삽입 → 재패킹
// 별도 서버 없이 브라우저에서 처리하고, 원문은 절대 수정하지 않고 메모만 삽입한다.
import JSZip from "jszip";

const SECTION_PATH = "Contents/section0.xml";

// 점검 대상 소제목(정규식 매칭용)
export const SUBHEADS = [
  "성격",
  "목표",
  "핵심 아이디어",
  "내용 체계",
  "성취기준",
  "교수·학습",
  "평가",
];

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&");
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// 한 문단(<hp:p>) 내 모든 <hp:t> 런의 텍스트를 이어붙인다
function paragraphText(pBlock) {
  const runs = pBlock.match(/<hp:t>([\s\S]*?)<\/hp:t>/g) || [];
  return runs
    .map((r) => r.replace(/^<hp:t>/, "").replace(/<\/hp:t>$/, ""))
    .map((r) => r.replace(/<[^>]+>/g, "")) // 런 내부 마크업 제거
    .map(decodeEntities)
    .join("");
}

// section0.xml → 문단 배열(순서 유지)
function extractParagraphs(sectionXml) {
  const blocks = sectionXml.match(/<hp:p\b[\s\S]*?<\/hp:p>/g) || [];
  return blocks.map(paragraphText);
}

// 평문 전체 텍스트
export function plainText(sectionXml) {
  return extractParagraphs(sectionXml)
    .map((t) => t.trim())
    .filter(Boolean)
    .join("\n");
}

// HWPX 파일(ArrayBuffer) 로드 → { zip, sectionXml, text }
export async function parseHwpx(arrayBuffer) {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const secFile = zip.file(SECTION_PATH);
  if (!secFile) {
    throw new Error("HWPX 본문(Contents/section0.xml)을 찾지 못했습니다.");
  }
  const sectionXml = await secFile.async("string");
  const text = plainText(sectionXml);
  if (!text.trim()) {
    throw new Error("본문에서 텍스트를 추출하지 못했습니다.");
  }
  return { zip, sectionXml, text };
}

// 기존 문단/런의 스타일 참조를 가져와 메모 문단 템플릿을 만든다
function styleRefs(sectionXml) {
  const p = sectionXml.match(/<hp:p\b([^>]*)>/);
  const run = sectionXml.match(/<hp:run\b([^>]*)>/);
  const attr = (s, name) => {
    const m = s && s.match(new RegExp(`${name}="([^"]*)"`));
    return m ? m[1] : "0";
  };
  return {
    paraPr: attr(p && p[1], "paraPrIDRef"),
    style: attr(p && p[1], "styleIDRef"),
    charPr: attr(run && run[1], "charPrIDRef"),
  };
}

function memoParagraph(id, refs, text) {
  return (
    `<hp:p id="${id}" paraPrIDRef="${refs.paraPr}" styleIDRef="${refs.style}" pageBreak="0" columnBreak="0" merged="0">` +
    `<hp:run charPrIDRef="${refs.charPr}"><hp:t>${escapeXml(text)}</hp:t></hp:run>` +
    `</hp:p>`
  );
}

// 이슈 목록 → 메모 문단들을 본문 맨 앞에 삽입하고 재패킹한 Blob 반환
// (원문은 그대로 두고, 문서 앞에 '💬 AI 점검 메모' 블록을 얹는다)
export async function buildAnnotated({ zip, sectionXml, sections }) {
  const refs = styleRefs(sectionXml);
  let id = 2000000000;
  const memos = [];
  memos.push(memoParagraph(id++, refs, "━━━━━ 💬 AI 점검 메모 (참고용 · 최종 판단은 본인/강사) ━━━━━"));
  for (const s of sections) {
    if (!s.issues || !s.issues.length) continue;
    memos.push(memoParagraph(id++, refs, `▸ ${s.title}`));
    for (const it of s.issues) {
      const line = `💬 [AI 점검] ${it.point ? it.point + " → " : ""}${it.ask}`;
      memos.push(memoParagraph(id++, refs, line));
      if (it.basis) {
        memos.push(memoParagraph(id++, refs, `   └ 근거: ${it.basis}`));
      }
    }
  }
  memos.push(memoParagraph(id++, refs, "━━━━━ (여기까지 AI 점검 메모) ━━━━━"));

  // 첫 <hp:p> 앞에 메모 블록 삽입
  const firstP = sectionXml.search(/<hp:p\b/);
  let newXml;
  if (firstP >= 0) {
    newXml =
      sectionXml.slice(0, firstP) + memos.join("") + sectionXml.slice(firstP);
  } else {
    // 문단을 못 찾으면 그대로 반환(폴백에서 처리)
    newXml = sectionXml;
  }

  zip.file(SECTION_PATH, newXml);

  // OCF 규칙: mimetype은 압축 없이 맨 앞. 제자리 갱신으로 무압축 보장(순서 유지)
  const mimeFile = zip.file("mimetype");
  if (mimeFile) {
    const mime = await mimeFile.async("string");
    zip.file("mimetype", mime, { compression: "STORE" });
  }

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/hwp+zip",
  });
  return blob;
}

// 파일명에 _AI메모 접미사
export function annotatedName(original) {
  const base = original.replace(/\.hwpx$/i, "");
  return `${base}_AI메모.hwpx`;
}
