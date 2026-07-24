import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { DEPLOY_URL } from "../config.js";

// 공문서식 '두문' — 좌상단 섹션 라벨 + 괘선
export function Chrome({ label, children }) {
  return (
    <div className="flex h-full flex-col px-16 pb-14 pt-9">
      <div className="mb-7 border-b border-line pb-2 text-[15px] font-semibold tracking-wide text-seal">
        {label}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

// 하단 한 줄 결론 문장
export function BottomLine({ children, accent = false }) {
  return (
    <div
      className={`mt-auto border-t border-line pt-4 text-[22px] font-semibold leading-snug ${
        accent ? "text-seal" : "text-ink"
      }`}
    >
      {children}
    </div>
  );
}

// 배포 주소 기반 QR (미설정 시 현재 origin 자동 사용)
export function AutoQR({ path = "", size = 200, caption }) {
  const base =
    DEPLOY_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const url = base ? base.replace(/\/$/, "") + path : "";
  if (!url) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-lg border border-line bg-white text-center text-sm text-dim"
      >
        배포 후 QR 표시
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-line">
        <QRCodeSVG value={url} size={size} />
      </div>
      {caption !== false && (
        <div className="tabular text-center text-xl font-bold tracking-tight">
          {url.replace(/^https?:\/\//, "")}
        </div>
      )}
    </div>
  );
}

// 카운트업 수치 (S12 전용) — prefers-reduced-motion 존중
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
    <div className="mt-3 inline-block rounded border border-line bg-white px-3 py-1.5 text-sm text-dim">
      실시간 연결 없음 — 거수로 진행합니다
    </div>
  );
}
