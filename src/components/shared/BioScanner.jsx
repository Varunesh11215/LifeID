import { useState, useRef, useEffect } from "react";
import { C } from "../../tokens/colors";
import { Ic } from "../icons/Ic";
import { Btn } from "../ui/Btn";

export const BioScanner = ({ label = "Biometric", onSuccess, onCancel, compact }) => {
  const [phase, setPhase] = useState("idle");
  const [pct, setPct] = useState(0);
  const timerRef = useRef(null);
  const callbackRef = useRef(onSuccess);
  const didFireRef = useRef(false);

  useEffect(() => {
    callbackRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (phase === "success" && !didFireRef.current) {
      didFireRef.current = true;
      const t = setTimeout(() => {
        callbackRef.current?.();
      }, 600);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const start = () => {
    didFireRef.current = false;
    setPhase("scanning");
    setPct(0);
    let p = 0;
    timerRef.current = setInterval(() => {
      p += Math.random() * 18 + 4;
      setPct(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(timerRef.current);
        setPhase("verifying");
        setTimeout(() => setPhase("success"), 900);
      }
    }, 120);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const color = phase === "success" ? "#10b981" : phase === "failed" ? "#ef4444" : phase === "scanning" || phase === "verifying" ? "#2563eb" : "#1e3a5f";

  return (
    <div style={{ background: "#f8fafc", borderRadius: 16, border: `1px solid ${C.border}`, padding: compact ? "20px" : "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      {!compact && <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label} — Biometric Verification</p>}
      <div style={{ position: "relative", width: compact ? 110 : 140, height: compact ? 110 : 140 }}>
        {(phase === "scanning" || phase === "verifying") &&
          [1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 80 + i * 22,
                height: 80 + i * 22,
                borderRadius: "50%",
                border: `1.5px solid ${color}`,
                opacity: 0.35 - i * 0.08,
                transform: "translate(-50%,-50%)",
                animation: `ripple 1.8s ease-out infinite`,
                animationDelay: `${i * 0.35}s`,
                pointerEvents: "none",
              }}
            />
          ))}
        <div
          onClick={phase === "idle" ? start : undefined}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            cursor: phase === "idle" ? "pointer" : "default",
            background: phase === "success" ? "linear-gradient(135deg,#10b981,#059669)" : phase === "failed" ? "linear-gradient(135deg,#ef4444,#dc2626)" : phase === "scanning" || phase === "verifying" ? `linear-gradient(135deg,#1d4ed8,${C.blueMid})` : "linear-gradient(135deg,#1e3a5f,#2d5a8e)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all .4s",
            animation: phase === "scanning" ? "glow 1.5s ease-in-out infinite" : "none",
            boxShadow: `0 0 30px ${color}35`,
          }}
        >
          {phase === "success" ? <Ic n="check" s={compact ? 30 : 48} c="white" /> : phase === "failed" ? <Ic n="x" s={compact ? 30 : 48} c="white" /> : <Ic n="fp" s={compact ? 30 : 48} c="white" />}
        </div>
        {phase === "scanning" && <div style={{ position: "absolute", left: 4, right: 4, height: 2, background: `${color}80`, borderRadius: 2, animation: "scanLine 1.2s ease-in-out infinite", pointerEvents: "none" }} />}
      </div>
      {phase === "scanning" && (
        <div style={{ width: "100%", maxWidth: 260 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", letterSpacing: "0.08em" }}>SCANNING</span>
            <span style={{ fontSize: 11, color: "#2563eb", fontFamily: "'DM Mono',monospace" }}>{Math.round(pct)}%</span>
          </div>
          <div style={{ height: 5, background: "#dbeafe", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#2563eb,#1d4ed8)", transition: "width .12s", borderRadius: 10 }} />
          </div>
        </div>
      )}
      {phase === "verifying" && <p style={{ color: "#6366f1", fontSize: 13, fontWeight: 700, margin: 0, animation: "pulse 1s infinite" }}>Verifying identity…</p>}
      {phase === "success" && <p style={{ color: "#10b981", fontSize: 13, fontWeight: 800, margin: 0 }}>✓ Identity Verified</p>}
      {phase === "idle" && (
        <div style={{ textAlign: "center" }}>
          {!compact && <p style={{ color: C.muted, fontSize: 13, marginBottom: 12 }}>Place finger on sensor to begin</p>}
          <Btn size="sm" onClick={start} style={{ background: `linear-gradient(135deg,${C.navy},${C.blueMid})` }}>
            <Ic n="fp" s={14} c="white" /> Begin Scan
          </Btn>
        </div>
      )}
      {onCancel && phase === "idle" && (
        <button onClick={onCancel} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 12, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          Cancel
        </button>
      )}
    </div>
  );
};
