import { useState } from "react";
import { Ic } from "../components/icons/Ic";
import { Btn } from "../components/ui/Btn";
import { USERS } from "../constants";
import { C } from "../tokens/colors";

export const Login = ({ onLogin, onNav }) => {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState(null);

  const quick = (role) => {
    const u = USERS[role];
    setActiveRole(role);
    setEmail(u.email);
    setPw(u.password);
    setErr("");
    setLoading(true);
    setTimeout(() => onLogin(u), 500);
  };

  const submit = () => {
    setErr("");
    setLoading(true);
    setTimeout(() => {
      const u = Object.values(USERS).find((x) => x.email === email && x.password === pw);
      if (u) onLogin(u);
      else {
        setErr("Invalid credentials. Please try again.");
        setLoading(false);
      }
    }, 700);
  };

  const roleCards = [
    { key: "admin", label: "System Admin", color: "#7c3aed", icon: "shield" },
    { key: "doctor", label: "Medical Officer", color: "#2563eb", icon: "activity" },
    { key: "records", label: "Records Officer", color: "#059669", icon: "file" },
    { key: "patient", label: "Patient", color: "#dc2626", icon: "id" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ background: `linear-gradient(160deg,${C.navy},#1a3060)`, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 64px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(37,99,235,.1)" }} />
        <div style={{ position: "absolute", bottom: -80, left: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(239,68,68,.07)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 52 }}>
            <div style={{ width: 42, height: 42, background: "linear-gradient(135deg,#ef4444,#dc2626)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(239,68,68,.4)" }}>
              <Ic n="shield" s={20} c="white" />
            </div>
            <span style={{ color: "white", fontSize: 24, fontWeight: 900, fontFamily: "'Sora',sans-serif", letterSpacing: "-.02em" }}>
              Life<span style={{ color: "#ef4444" }}>ID</span>
            </span>
          </div>
          <h2 style={{ color: "white", fontSize: 36, fontWeight: 900, margin: "0 0 12px", lineHeight: 1.15, fontFamily: "'Sora',sans-serif", letterSpacing: "-.02em" }}>
            Secure Health
            <br />
            Identity Portal
          </h2>
          <p style={{ color: "rgba(255,255,255,.45)", fontSize: 15, lineHeight: 1.8, maxWidth: 340, marginBottom: 40 }}>
            Biometric-protected access to critical medical records. Every action verified, logged, and audited.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {[
              ["fp", "Dual biometric auth", "#3b82f6"],
              ["lock", "Patient data locked by default", "#34d399"],
              ["eye", "Full audit trail", "#a78bfa"],
              ["shield", "AES-256 encryption", "#fb923c"],
            ].map(([ic, t, c]) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, background: `${c}18`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${c}28` }}>
                  <Ic n={ic} s={13} c={c} />
                </div>
                <span style={{ color: "rgba(255,255,255,.55)", fontSize: 13.5 }}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, padding: "11px 15px" }}>
            <p style={{ color: "#fca5a5", fontSize: 12, margin: 0, fontWeight: 600 }}>🇮🇳 National Health Authority — India. All numbers use +91 format.</p>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", padding: 40 }}>
        <div style={{ width: "100%", maxWidth: 420, animation: "fadeUp .45s ease" }}>
          <button onClick={() => onNav("landing")} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 13, marginBottom: 30, display: "flex", alignItems: "center", gap: 5, fontFamily: "'Plus Jakarta Sans',sans-serif", padding: 0 }}>
            <Ic n="chevron" s={14} style={{ transform: "rotate(180deg)" }} /> Back to home
          </button>
          <h2 style={{ fontSize: 25, fontWeight: 900, color: C.text, margin: "0 0 4px", fontFamily: "'Sora',sans-serif", letterSpacing: "-.02em" }}>Sign In</h2>
          <p style={{ color: C.muted, fontSize: 14, margin: "0 0 26px" }}>Access your LifeID dashboard</p>
          {err && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "11px 14px", marginBottom: 16, color: "#dc2626", fontSize: 13, display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
              <Ic n="alert" s={16} c="#dc2626" />
              {err}
            </div>
          )}
          <div style={{ marginBottom: 13 }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#374151", marginBottom: 5 }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@lifeid.gov.in" style={{ width: "100%", padding: "11px 13px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, color: C.text, background: "white", fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#374151", marginBottom: 5 }}>Password</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === "Enter" && submit()}
              style={{ width: "100%", padding: "11px 13px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, color: C.text, background: "white", fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <button disabled={loading} onClick={submit} style={{ width: "100%", padding: "13px", border: "none", borderRadius: 10, background: `linear-gradient(135deg,${C.navy},${C.blueMid})`, color: "white", fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Plus Jakarta Sans',sans-serif", opacity: loading ? 0.75 : 1, boxShadow: "0 4px 16px rgba(29,78,216,.3)", transition: "opacity .2s" }}>
            {loading ? (
              <>
                <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.35)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} /> Authenticating…
              </>
            ) : (
              <>
                <Ic n="lock" s={16} c="white" /> Secure Sign In
              </>
            )}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 13px" }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 11, color: C.mutedLight, fontWeight: 700, letterSpacing: "0.08em" }}>QUICK DEMO ACCESS</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {roleCards.map((r) => (
              <button key={r.key} onClick={() => quick(r.key)} style={{ padding: "11px 12px", border: `1.5px solid ${activeRole === r.key ? r.color : C.border}`, borderRadius: 10, background: activeRole === r.key ? `${r.color}08` : "white", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all .18s" }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: `${r.color}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Ic n={r.icon} s={13} c={r.color} />
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: activeRole === r.key ? r.color : C.textSub }}>{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
