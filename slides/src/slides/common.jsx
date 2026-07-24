import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { DEPLOY_URL } from "../config.js";

// design.md 컬러 블록 — 한 슬라이드에 하나만, 나머지는 흰 캔버스로 되돌린다
const TONES = {
  canvas: { bg: "bg-canvas", ink: "text-ink", soft: "bg-surface-soft" },
  lime: { bg: "bg-block-lime", ink: "text-ink", soft: "bg-canvas" },
  lilac: { bg: "bg-block-lilac", ink: "text-ink", soft: "bg-canvas" },
  cream: { bg: "bg-block-cream", ink: "text-ink", soft: "bg-canvas" },
  mint: { bg: "bg-block-mint", ink: "text-ink", soft: "bg-canvas" },
  pink: { bg: "bg-block-pink", ink: "text-ink", soft: "bg-canvas" },
  coral: { bg: "bg-block-coral", ink: "text-ink", soft: "bg-canvas" },
  navy: { bg: "bg-block-navy", ink: "text-inverse-ink", soft: "bg-white/10" },
  ink: { bg: "bg-inverse-canvas", ink: "text-inverse-ink", soft: "bg-white/10" },
};

export const toneOf = (t) => TONES[t] ?? TONES.canvas;
export const isDark = (t) => t === "navy" || t === "ink";

/**
 * 한 장의 슬라이드.
 * tone="canvas"면 흰 캔버스, 그 외에는 캔버스 위에 얹힌 라운드 컬러 블록으로 렌더된다.
 */
export function Slide({ tone = "canvas", eyebrow, children, pad = "p-12" }) {
  const t = toneOf(tone);
  const block = tone !== "canvas";
  return (
    <div className={`h-full w-full bg-canvas ${block ? "p-8" : ""}`}>
      <div
        className={`flex h-full flex-col ${t.bg} ${t.ink} ${
          block ? `rounded-[24px] ${pad}` : "px-16 py-12"
        }`}
      >
        {eyebrow && (
          <div
            className={`t-eyebrow mb-8 ${
              isDark(tone) ? "opacity-70" : "opacity-60"
            }`}
          >
            {eyebrow}
          </div>
        )}
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

// 예전 API 호환 — label만 넘기면 흰 캔버스 슬라이드
export function Chrome({ label, tone = "canvas", children }) {
  return (
    <Slide tone={tone} eyebrow={label}>
      {children}
    </Slide>
  );
}

// 하단 한 줄 결론
export function BottomLine({ children, tone = "canvas" }) {
  return (
    <div
      className={`t-subhead mt-auto border-t pt-5 ${
        isDark(tone) ? "border-white/25" : "border-hairline"
      }`}
    >
      {children}
    </div>
  );
}

// 카드 — 컬러 블록 위에서는 흰 카드, 흰 캔버스 위에서는 surface-soft 타일
export function Card({ tone = "canvas", className = "", children }) {
  const t = toneOf(tone);
  return (
    <div className={`rounded-[24px] p-7 ${t.soft} ${className}`}>{children}</div>
  );
}

// 알약 버튼 — design.md의 유일한 버튼 형태
export function Pill({ as = "button", variant = "primary", className = "", ...rest }) {
  const Tag = as;
  const styles = {
    primary: "bg-ink text-inverse-ink",
    secondary: "bg-canvas text-ink",
    magenta: "bg-accent-magenta text-inverse-ink",
  }[variant];
  return (
    <Tag
      className={`t-button inline-block rounded-[50px] px-6 py-2.5 ${styles} ${className}`}
      {...rest}
    />
  );
}

// 배포 주소 기반 QR (미설정 시 현재 origin 자동 사용)
export function AutoQR({ path = "", size = 200, tone = "canvas" }) {
  const base =
    DEPLOY_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const url = base ? base.replace(/\/$/, "") + path : "";
  if (!url) {
    return (
      <div
        style={{ width: size, height: size }}
        className="t-body-sm flex items-center justify-center rounded-[8px] bg-surface-soft text-center"
      >
        배포 후 QR 표시
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-[8px] bg-canvas p-4">
        <QRCodeSVG value={url} size={size} fgColor="#000000" />
      </div>
      <div
        className={`t-body-lg tabular text-center ${
          isDark(tone) ? "text-inverse-ink" : "text-ink"
        }`}
      >
        {url.replace(/^https?:\/\//, "")}
      </div>
    </div>
  );
}

// 카운트업 (S12 전용)
export function CountUp({ value, decimals = 1, duration = 1100 }) {
  const [n, setN] = useState(0);
  const ref = useRef();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(value);
      return;
    }
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      setN(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);
  return <span className="tabular">{n.toFixed(decimals)}</span>;
}

// 인터랙션 미연결 안내 (거수 폴백)
export function OfflineHint() {
  return (
    <div className="t-caption mt-3 inline-block rounded-[50px] bg-canvas px-4 py-2">
      실시간 연결 없음 — 거수로 진행합니다
    </div>
  );
}
