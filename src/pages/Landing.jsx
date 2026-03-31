import { Ic } from "../components/icons/Ic";
import { C } from "../tokens/colors";
import { Btn } from "../components/ui/Btn";

export const Landing = ({ onNav }) => {
  const roles = [
    {
      role: "System Admin",
      icon: "shield",
      color: "#7c3aed",
      bg: "#7c3aed20",
      desc: "Manage hospitals, officers, and view audit logs",
    },
    {
      role: "Medical Officer",
      icon: "activity",
      color: "#2563eb",
      bg: "#2563eb20",
      desc: "Emergency biometric patient access in critical situations",
    },
    {
      role: "Records Officer",
      icon: "file",
      color: "#059669",
      bg: "#05996920",
      desc: "Register patients and update medical records",
    },
    {
      role: "Patient",
      icon: "id",
      color: "#dc2626",
      bg: "#dc262620",
      desc: "View your LifeID, medical records, and access history",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.navy, fontFamily: "'Plus Jakarta Sans',sans-serif", overflowX: "hidden" }}>
      {/* Mesh background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "60%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(37,99,235,.18) 0%,transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "-10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(124,58,237,.12) 0%,transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "0%",
            right: "20%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(239,68,68,.1) 0%,transparent 70%)",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Nav */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 60px",
            borderBottom: "1px solid rgba(255,255,255,.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                background: "linear-gradient(135deg,#ef4444,#dc2626)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(239,68,68,.4)",
              }}
            >
              <Ic n="shield" s={19} c="white" />
            </div>
            <span style={{ color: "white", fontSize: 22, fontWeight: 900, fontFamily: "'Sora',sans-serif", letterSpacing: "-.03em" }}>
              Life<span style={{ color: "#ef4444" }}>ID</span>
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {[
              ["About", "about"],
              ["Privacy", "privacy"],
            ].map(([l, p]) => (
              <button key={p} onClick={() => onNav(p)} style={{ background: "none", border: "none", color: "rgba(255,255,255,.5)", fontSize: 13.5, cursor: "pointer", fontWeight: 600, fontFamily: "'Plus Jakarta Sans',sans-serif", padding: "8px 14px", borderRadius: 8 }}>
                {l}
              </button>
            ))}
            <button onClick={() => onNav("login")} style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 9, padding: "9px 20px", color: "white", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all .2s" }}>
              Sign In →
            </button>
          </div>
        </nav>

        {/* Hero */}
        <div style={{ textAlign: "center", padding: "96px 20px 72px", animation: "fadeUp .7s ease" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 100, padding: "6px 18px", marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "block", animation: "pulse 1.5s infinite" }} />
            <span style={{ color: "#fca5a5", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em" }}>NATIONAL HEALTH AUTHORITY · GOVERNMENT OF INDIA</span>
          </div>
          <h1
            style={{
              color: "white",
              fontSize: "clamp(36px,5.5vw,72px)",
              fontWeight: 900,
              lineHeight: 1.05,
              margin: "0 auto 24px",
              maxWidth: 860,
              fontFamily: "'Sora',sans-serif",
              letterSpacing: "-.03em",
            }}
          >
            Your Medical Identity,<br />
            <span style={{ background: "linear-gradient(135deg,#ef4444,#f87171)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Secured by Biology</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,.5)", fontSize: "clamp(15px,1.8vw,18px)", maxWidth: 580, margin: "0 auto 48px", lineHeight: 1.8 }}>
            LifeID gives hospitals instant, biometrically-verified access to critical patient data — protecting lives while protecting privacy across India.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => onNav("login")} style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", border: "none", borderRadius: 11, padding: "14px 32px", fontSize: 15.5, fontWeight: 800, color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: "0 8px 32px rgba(239,68,68,.45)", transition: "all .2s" }}>
              <Ic n="shield" s={18} c="white" /> Access Portal
            </button>
            <button onClick={() => onNav("about")} style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 11, padding: "14px 28px", fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,.8)", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all .2s" }}>
              Learn More
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 0,
            flexWrap: "wrap",
            maxWidth: 860,
            margin: "0 auto 72px",
            background: "rgba(255,255,255,.04)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,.07)",
            overflow: "hidden",
          }}
        >
          {[
            ["1.2 Cr+", "Registered Patients", "#3b82f6"],
            ["47", "Partner Hospitals", "#34d399"],
            ["99.97%", "Uptime SLA", "#a78bfa"],
            ["0", "Data Breaches", "#f87171"],
          ].map(([v, l, c], i) => (
            <div key={l} style={{ flex: 1, minWidth: 160, textAlign: "center", padding: "24px 20px", borderRight: i < 3 ? "1px solid rgba(255,255,255,.07)" : "none" }}>
              <div style={{ color: c, fontSize: 28, fontWeight: 900, fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>{v}</div>
              <div style={{ color: "rgba(255,255,255,.35)", fontSize: 12.5, fontWeight: 600 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Role cards */}
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 40px 32px" }}>
          <p style={{ textAlign: "center", color: "rgba(255,255,255,.3)", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 20 }}>Role-Based Access Control</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {roles.map((r, i) => (
              <div key={r.role} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "20px 18px", backdropFilter: "blur(10px)", animation: `fadeUp .5s ${i * 0.08}s both`, cursor: "default" }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: r.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, border: `1px solid ${r.color}30` }}>
                  <Ic n={r.icon} s={20} c={r.color} />
                </div>
                <h3 style={{ color: "white", margin: "0 0 6px", fontSize: 14, fontWeight: 800, fontFamily: "'Sora',sans-serif" }}>{r.role}</h3>
                <p style={{ color: "rgba(255,255,255,.4)", margin: 0, fontSize: 12.5, lineHeight: 1.6 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature grid */}
        <div style={{ maxWidth: 960, margin: "0 auto 80px", padding: "0 40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            {[
              { icon: "fp", color: "#3b82f6", title: "Dual Biometric Auth", desc: "Officer + patient fingerprint required for every sensitive operation — no exceptions, no bypass." },
              { icon: "shield", color: "#a78bfa", title: "AES-256 Encryption", desc: "All biometric templates and medical data encrypted at rest and in transit across NHA infrastructure." },
              { icon: "lock", color: "#34d399", title: "Default Data Lock", desc: "Patient records locked on every login — only the patient's own biometric unlocks their data." },
              { icon: "clock", color: "#fb923c", title: "Immutable Audit Trail", desc: "Every access event is timestamped, attributed to an officer, and permanently visible to the patient." },
            ].map((f) => (
              <div key={f.title} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "22px 24px", display: "flex", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${f.color}25` }}>
                  <Ic n={f.icon} s={20} c={f.color} />
                </div>
                <div>
                  <h3 style={{ color: "white", margin: "0 0 6px", fontSize: 14.5, fontWeight: 800 }}>{f.title}</h3>
                  <p style={{ color: "rgba(255,255,255,.4)", margin: 0, fontSize: 13, lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", padding: "22px 60px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ color: "rgba(255,255,255,.2)", fontSize: 12 }}>© 2025 National Health Authority, Government of India</span>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }} />
            <span style={{ color: "rgba(255,255,255,.3)", fontSize: 12 }}>All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};
