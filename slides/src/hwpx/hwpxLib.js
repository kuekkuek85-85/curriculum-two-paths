// HWPX(zip 패키지) 클라이언트 처리 — unzip → 텍스트 추출 → '한글 메모'(MEMO 필드) 삽입 → 재패킹
// 원문은 절대 수정하지 않고, 소제목 텍스트에 실제 한글 메모(주석)를 달아 준다.
import JSZip from "jszip";

const SECTION_PATH = "Contents/section0.xml";
const HEADER_PATH = "Contents/header.xml";
const MEMO_PT = 8; // 메모 글자 크기(pt)

// 점검 대상 소제목
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

function paragraphText(pBlock) {
  const runs = pBlock.match(/<hp:t>([\s\S]*?)<\/hp:t>/g) || [];
  return runs
    .map((r) => r.replace(/^<hp:t>/, "").replace(/<\/hp:t>$/, ""))
    .map((r) => r.replace(/<[^>]+>/g, ""))
    .map(decodeEntities)
    .join("");
}

function extractParagraphs(sectionXml) {
  const blocks = sectionXml.match(/<hp:p\b[\s\S]*?<\/hp:p>/g) || [];
  return blocks.map(paragraphText);
}

export function plainText(sectionXml) {
  return extractParagraphs(sectionXml)
    .map((t) => t.trim())
    .filter(Boolean)
    .join("\n");
}

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

// 기존 문단/런의 스타일 참조(메모 내부 문단이 유효한 ID를 참조하도록)
function styleRefs(sectionXml) {
  const p = sectionXml.match(/<hp:p\b([^>]*)>/);
  const run = sectionXml.match(/<hp:run\b([^>]*)>/);
  const attr = (s, name) => {
    const mm = s && s.match(new RegExp(`${name}="([^"]*)"`));
    return mm ? mm[1] : "0";
  };
  return {
    paraPr: attr(p && p[1], "paraPrIDRef"),
    charPr: attr(run && run[1], "charPrIDRef"),
  };
}

// MEMO 필드(fieldBegin) — 메모 내용을 subList 문단으로 담는다
function memoFieldXml({ beginId, fieldId, number, author, dateTime, lines, refs, memoCharPr }) {
  const contentCharPr = memoCharPr != null ? memoCharPr : refs.charPr;
  const params =
    `<hp:parameters cnt="7" name="">` +
    `<hp:integerParam name="Prop">0</hp:integerParam>` +
    `<hp:stringParam name="Command">MEMO/65535/${number}/2679222272/31267793/${escapeXml(author)}/\\;;</hp:stringParam>` +
    `<hp:stringParam name="ID">memo${number}</hp:stringParam>` +
    `<hp:integerParam name="Number">${number}</hp:integerParam>` +
    `<hp:stringParam name="Author">${escapeXml(author)}</hp:stringParam>` +
    `<hp:stringParam name="MemoShapeIDRef">65535</hp:stringParam>` +
    `<hp:stringParam name="CreateDateTime">${dateTime}</hp:stringParam>` +
    `</hp:parameters>`;
  const paras = lines
    .map(
      (t) =>
        `<hp:p id="0" paraPrIDRef="${refs.paraPr}" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">` +
        `<hp:run charPrIDRef="${contentCharPr}"><hp:t>${escapeXml(t)}</hp:t></hp:run></hp:p>`
    )
    .join("");
  const sub =
    `<hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="TOP" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">` +
    paras +
    `</hp:subList>`;
  return (
    `<hp:ctrl><hp:fieldBegin id="${beginId}" type="MEMO" name="" editable="1" dirty="1" zorder="${number}" fieldid="${fieldId}">` +
    params +
    sub +
    `</hp:fieldBegin></hp:ctrl>`
  );
}

// 단순 텍스트 런(<hp:run ..><hp:t>텍스트</hp:t></hp:run>) 목록
function collectSimpleRuns(xml) {
  const re = /<hp:run\b([^>]*)>(<hp:t>)([\s\S]*?)(<\/hp:t>)<\/hp:run>/g;
  const out = [];
  let m;
  while ((m = re.exec(xml))) {
    out.push({
      start: m.index,
      end: m.index + m[0].length,
      attrs: m[1],
      encText: m[3],
      decText: decodeEntities(m[3]),
    });
  }
  return out;
}

const norm = (s) => (s || "").replace(/[\s·]/g, "");

// 소제목에 가장 잘 맞는 앵커 런 인덱스(사용된 런 제외)
function findHeadingRun(runs, title, used) {
  const nt = norm(title);
  if (!nt) return -1;
  let best = -1;
  let bestScore = Infinity;
  runs.forEach((r, i) => {
    if (used.has(i)) return;
    const t = r.decText.trim();
    if (!t) return;
    const nr = norm(t);
    let score;
    // 같은 유형이면 더 짧은(헤딩에 가까운) 런을 우선하도록 길이를 소수점 가중
    if (nr === nt) score = 0 + t.length * 0.001;
    else if (nr.startsWith(nt)) score = 1 + t.length * 0.001;
    else if (nr.includes(nt) && t.length <= title.length + 10) score = 2 + t.length * 0.001;
    else return;
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  });
  return best;
}

function firstNonEmptyRun(runs, used) {
  return runs.findIndex((r, i) => !used.has(i) && r.decText.trim().length >= 1);
}

function removeLineSegArrays(xml) {
  return xml
    .replace(/<hp:linesegarray\b[^>]*\/>/g, "")
    .replace(/<hp:linesegarray\b[\s\S]*?<\/hp:linesegarray>/g, "");
}

// header.xml에 메모용 charPr(8pt)을 추가하고 그 새 id를 돌려준다.
// 기존 charPr을 복제해 height만 800(8pt)으로 바꿔 유효성을 보장한다.
async function ensureMemoCharPr(zip) {
  const hFile = zip.file(HEADER_PATH);
  if (!hFile) return null;
  let header = await hFile.async("string");
  const listM = header.match(/<hh:charProperties\b[^>]*itemCnt="(\d+)"[^>]*>/);
  if (!listM) return null;
  const itemCnt = parseInt(listM[1], 10);
  const ids = [...header.matchAll(/<hh:charPr\b[^>]*\bid="(\d+)"/g)].map((m) =>
    parseInt(m[1], 10)
  );
  const newId = (ids.length ? Math.max(...ids) : 0) + 1;
  const height = String(MEMO_PT * 100); // 8pt → 800

  const tplM = header.match(/<hh:charPr\b[\s\S]*?<\/hh:charPr>/);
  let newCharPr;
  if (tplM) {
    newCharPr = tplM[0]
      .replace(/\bid="\d+"/, `id="${newId}"`)
      .replace(/\bheight="\d+"/, `height="${height}"`);
    if (!new RegExp(`height="${height}"`).test(newCharPr)) {
      newCharPr = newCharPr.replace(/<hh:charPr\b/, `<hh:charPr height="${height}"`);
    }
  } else {
    newCharPr =
      `<hh:charPr id="${newId}" height="${height}" textColor="#000000" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="2">` +
      `<hh:fontRef hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>` +
      `<hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>` +
      `<hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>` +
      `<hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>` +
      `<hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>` +
      `</hh:charPr>`;
  }

  header = header.replace(
    /(<hh:charProperties\b[^>]*itemCnt=")\d+(")/,
    `$1${itemCnt + 1}$2`
  );
  header = header.replace(
    /<\/hh:charProperties>/,
    newCharPr + `</hh:charProperties>`
  );
  zip.file(HEADER_PATH, header);
  return newId;
}

async function repack(zip) {
  const mimeFile = zip.file("mimetype");
  if (mimeFile) {
    const mime = await mimeFile.async("string");
    zip.file("mimetype", mime, { compression: "STORE" });
  }
  return zip.generateAsync({ type: "blob", mimeType: "application/hwp+zip" });
}

// 폴백: 소제목 앵커를 못 찾으면 문서 맨 앞에 메모 문단 블록을 얹는다(옛 방식)
async function legacyAnnotate({ zip, sectionXml, sections }) {
  const refs = styleRefs(sectionXml);
  let id = 2000000000;
  const memoP = (text) =>
    `<hp:p id="${id++}" paraPrIDRef="${refs.paraPr}" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">` +
    `<hp:run charPrIDRef="${refs.charPr}"><hp:t>${escapeXml(text)}</hp:t></hp:run></hp:p>`;
  const blocks = [memoP("━━ 💬 AI 점검 메모 (참고용) ━━")];
  for (const s of sections) {
    if (!s.issues || !s.issues.length) continue;
    blocks.push(memoP(`▸ ${s.title}`));
    for (const it of s.issues) {
      blocks.push(memoP(`💬 ${it.point ? it.point + " → " : ""}${it.ask}`));
      if (it.basis) blocks.push(memoP(`   └ 근거: ${it.basis}`));
    }
  }
  const firstP = sectionXml.search(/<hp:p\b/);
  const newXml =
    firstP >= 0
      ? sectionXml.slice(0, firstP) + blocks.join("") + sectionXml.slice(firstP)
      : sectionXml;
  zip.file(SECTION_PATH, removeLineSegArrays(newXml));
  return repack(zip);
}

// 이슈 목록 → 소제목마다 실제 한글 메모(MEMO 필드)를 달아 재패킹한 Blob 반환
export async function buildAnnotated({ zip, sectionXml, sections }) {
  const refs = styleRefs(sectionXml);
  const author = "AI 점검";
  const dateTime = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  // 메모 글자용 8pt charPr을 header.xml에 추가
  const memoCharPr = await ensureMemoCharPr(zip);

  const runs = collectSimpleRuns(sectionXml);
  const used = new Set();
  const plan = [];
  let number = 0;

  for (const sec of sections) {
    if (!sec.issues || !sec.issues.length) continue;
    let idx = findHeadingRun(runs, sec.title, used);
    if (idx < 0) idx = firstNonEmptyRun(runs, used);
    if (idx < 0) continue;
    used.add(idx);
    number += 1;
    const lines = [];
    for (const it of sec.issues) {
      lines.push(`💬 ${it.point ? it.point + " — " : ""}${it.ask}`);
      if (it.suggest) lines.push(`제안: ${it.suggest}`);
      if (it.basis) lines.push(`근거: ${it.basis}`);
    }
    plan.push({ runIndex: idx, lines, number });
  }

  if (plan.length === 0) {
    return legacyAnnotate({ zip, sectionXml, sections });
  }

  // 뒤에서부터 치환(문자열 인덱스 보존)
  plan.sort((a, b) => runs[b.runIndex].start - runs[a.runIndex].start);
  let xml = sectionXml;
  let beginId = 2100000000;
  let fieldId = 620000000;
  for (const p of plan) {
    const r = runs[p.runIndex];
    const bId = beginId++;
    const fId = fieldId++;
    const field = memoFieldXml({
      beginId: bId,
      fieldId: fId,
      number: p.number,
      author,
      dateTime,
      lines: p.lines,
      refs,
      memoCharPr,
    });
    const fieldEnd = `<hp:ctrl><hp:fieldEnd beginIDRef="${bId}" fieldid="${fId}"/></hp:ctrl>`;
    const newRun =
      `<hp:run${r.attrs}>` +
      field +
      `<hp:t>${r.encText}</hp:t>` +
      fieldEnd +
      `<hp:t/></hp:run>`;
    xml = xml.slice(0, r.start) + newRun + xml.slice(r.end);
  }

  xml = removeLineSegArrays(xml);
  zip.file(SECTION_PATH, xml);
  return repack(zip);
}

export function annotatedName(original) {
  const base = original.replace(/\.hwpx$/i, "");
  return `${base}_AI메모.hwpx`;
}
