import { useState } from "react";
import "./index.css";
import { C } from "./tokens/colors";
import { ROLES, USERS, PATIENTS, HOSPITALS, AUDIT_LOGS, MENUS, ROLE_LABELS, ROLE_COLORS } from "./constants";
import { validateIndianPhone } from "./utils/validation";
import { Ic } from "./components/icons/Ic";
import { Badge } from "./components/ui/Badge";
import { Btn } from "./components/ui/Btn";
import { Card } from "./components/ui/Card";
import { Field, Input, Sel, PageHdr } from "./components/ui/FormElements";
import { Modal } from "./components/ui/Modal";
import { Toast } from "./components/ui/Toast";
import { Sparkline, MiniBar, Donut, ProgressBar, FeedItem } from "./components/charts/Charts";
import { BioScanner } from "./components/shared/BioScanner";
import { AuditTable } from "./components/shared/AuditTable";
import { Stat } from "./components/shared/Stat";
import { StepBar, SaveBar } from "./components/shared/index";
import { Sidebar } from "./components/layout/Sidebar";
import { Shell } from "./components/layout/Shell";

// Landing Page
const Landing = ({ onNav }) => {
  const roles = [
    { role: "System Admin", icon: "shield", color: "#7c3aed", bg: "#7c3aed20", desc: "Manage hospitals, officers, and view audit logs" },
    { role: "Medical Officer", icon: "activity", color: "#2563eb", bg: "#2563eb20", desc: "Emergency biometric patient access in critical situations" },
    { role: "Records Officer", icon: "file", color: "#059669", bg: "#05996920", desc: "Register patients and update medical records" },
    { role: "Patient", icon: "id", color: "#dc2626", bg: "#dc262620", desc: "View your LifeID, medical records, and access history" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.navy, fontFamily: "'Plus Jakarta Sans',sans-serif", overflowX: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", left: "60%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(37,99,235,.18) 0%,transparent 70%)" }} />
        <div style={{ position: "absolute", top: "40%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,.12) 0%,transparent 70%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 60px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, background: "linear-gradient(135deg,#ef4444,#dc2626)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(239,68,68,.4)" }}>
              <Ic n="shield" s={19} c="white" />
            </div>
            <span style={{ color: "white", fontSize: 22, fontWeight: 900, fontFamily: "'Sora',sans-serif", letterSpacing: "-.03em" }}>
              Life<span style={{ color: "#ef4444" }}>ID</span>
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => onNav("login")} style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 9, padding: "9px 20px", color: "white", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all .2s" }}>
              Sign In →
            </button>
          </div>
        </nav>

        <div style={{ textAlign: "center", padding: "96px 20px 72px", animation: "fadeUp .7s ease" }}>
          <h1 style={{ color: "white", fontSize: "clamp(36px,5.5vw,72px)", fontWeight: 900, lineHeight: 1.05, margin: "0 auto 24px", maxWidth: 860, fontFamily: "'Sora',sans-serif", letterSpacing: "-.03em" }}>
            Your Medical Identity,
            <br />
            <span style={{ background: "linear-gradient(135deg,#ef4444,#f87171)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Secured by Biology</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,.5)", fontSize: "clamp(15px,1.8vw,18px)", maxWidth: 580, margin: "0 auto 48px", lineHeight: 1.8 }}>
            LifeID gives hospitals instant, biometrically-verified access to critical patient data — protecting lives while protecting privacy across India.
          </p>
          <button onClick={() => onNav("login")} style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", border: "none", borderRadius: 11, padding: "14px 32px", fontSize: 15.5, fontWeight: 800, color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: "0 8px 32px rgba(239,68,68,.45)", transition: "all .2s", margin: "0 auto" }}>
            <Ic n="shield" s={18} c="white" /> Access Portal
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, maxWidth: 960, margin: "0 auto 72px", padding: "0 40px" }}>
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
    </div>
  );
};

// Login Page
const Login = ({ onLogin, onNav }) => {
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
          <p style={{ color: "rgba(255,255,255,.45)", fontSize: 15, lineHeight: 1.8, maxWidth: 340, marginBottom: 40 }}>Biometric-protected access to critical medical records. Every action verified, logged, and audited.</p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", padding: 40 }}>
        <div style={{ width: "100%", maxWidth: 420, animation: "fadeUp .45s ease" }}>
          <button onClick={() => onNav("landing")} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 13, marginBottom: 30, display: "flex", alignItems: "center", gap: 5, fontFamily: "'Plus Jakarta Sans',sans-serif", padding: 0 }}>
            ← Back to home
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
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" onKeyDown={(e) => e.key === "Enter" && submit()} style={{ width: "100%", padding: "11px 13px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, color: C.text, background: "white", fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", boxSizing: "border-box" }} />
          </div>
          <button
            disabled={loading}
            onClick={submit}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: 10,
              background: `linear-gradient(135deg,${C.navy},${C.blueMid})`,
              color: "white",
              fontWeight: 800,
              fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              opacity: loading ? 0.75 : 1,
              boxShadow: "0 4px 16px rgba(29,78,216,.3)",
              transition: "opacity .2s",
            }}
          >
            {loading ? (
              <>
                <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.35)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
                Authenticating…
              </>
            ) : (
              <>
                <Ic n="lock" s={16} c="white" /> Secure Sign In
              </>
            )}
          </button>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 20 }}>
            {roleCards.map((r) => (
              <button
                key={r.key}
                onClick={() => quick(r.key)}
                style={{
                  padding: "11px 12px",
                  border: `1.5px solid ${activeRole === r.key ? r.color : C.border}`,
                  borderRadius: 10,
                  background: activeRole === r.key ? `${r.color}08` : "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  transition: "all .18s",
                }}
              >
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

// Admin Overview
const AdminOverview = () => {
  const regSpark = [980, 1120, 1050, 1340, 1200, 1580, 1760, 1900, 2143];
  const emergBars = [240, 310, 280, 390, 420, 380, 460, 510, 580, 720];

  return (
    <div>
      <PageHdr title="Platform Overview" sub={`National Health Authority · ${new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        <Stat label="Registered Patients" value="12,40,291" icon={<Ic n="users" s={20} />} accent="#2563eb" sub="+2,143 this month" trend={12} delay={1} />
        <Stat label="Partner Hospitals" value="47" icon={<Ic n="hospital" s={20} />} accent="#059669" sub="3 pending approval" trend={6} delay={2} />
        <Stat label="Active Officers" value="1,284" icon={<Ic n="user" s={20} />} accent="#7c3aed" sub="Doctors + Records" trend={3} delay={3} />
        <Stat label="Emergency Accesses" value="8,720" icon={<Ic n="alert" s={20} />} accent="#dc2626" sub="Last 30 days" trend={-4} delay={4} />
      </div>
    </div>
  );
};

// Admin Hospitals
const AdminHospitals = ({ toast }) => {
  const [hospitals, setHospitals] = useState(HOSPITALS);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", contact: "" });
  const [ferr, setFerr] = useState({});

  const approve = (id) => {
    setHospitals((h) => h.map((x) => (x.id === id ? { ...x, status: "approved" } : x)));
    toast("Hospital approved successfully", "success");
  };

  const submit = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Hospital name required";
    if (!form.location.trim()) e.location = "Location required";
    if (!validateIndianPhone(form.contact)) e.contact = "Enter valid Indian phone: +91 XXXXXXXXXX";
    setFerr(e);
    if (Object.keys(e).length) return;
    setHospitals((h) => [...h, { id: `HOSP${Date.now()}`, name: form.name, location: form.location, officers: 0, contact: form.contact, status: "pending", applied: new Date().toISOString().slice(0, 10) }]);
    setShowAdd(false);
    setForm({ name: "", location: "", contact: "" });
    toast("Hospital added for review", "info");
  };

  return (
    <div>
      <PageHdr title="Hospital Management" sub="Review and manage partner hospitals" action={<Btn size="sm" onClick={() => setShowAdd(true)}><Ic n="plus" s={14} c="white" /> Add Hospital</Btn>} />
      <div style={{ display: "grid", gap: 14 }}>
        {hospitals.map((h) => (
          <Card key={h.id} style={{ padding: "17px 22px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ width: 44, height: 44, background: C.blueL, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: C.blueMid, flexShrink: 0 }}>
              <Ic n="hospital" s={22} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: C.text }}>{h.name}</span>
                <Badge tone={h.status === "approved" ? "green" : "amber"} dot>
                  {h.status}
                </Badge>
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: C.muted }}>{h.location} · {h.officers} officers</p>
            </div>
            {h.status === "pending" && (
              <Btn variant="success" size="sm" onClick={() => approve(h.id)}>
                <Ic n="check" s={13} c="white" /> Approve
              </Btn>
            )}
          </Card>
        ))}
      </div>
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Hospital">
        <Input label="Hospital Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. AIIMS New Delhi" error={ferr.name} required />
        <Input label="Location / City" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. New Delhi" error={ferr.location} required />
        <Input label="Contact Number (+91 format)" value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} placeholder="+91 9876543210" error={ferr.contact} required />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <Btn variant="ghost" onClick={() => setShowAdd(false)}>
            Cancel
          </Btn>
          <Btn onClick={submit}>
            <Ic n="check" s={14} c="white" /> Submit
          </Btn>
        </div>
      </Modal>
    </div>
  );
};

// Admin Users
const AdminUsers = ({ toast }) => (
  <div>
    <PageHdr title="User Management" sub="Officers, admins, and system users" />
    <div style={{ display: "grid", gap: 12 }}>
      {Object.values(USERS).map((u) => (
        <Card key={u.id} style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: `${ROLE_COLORS[u.role]}20`, display: "flex", alignItems: "center", justifyContent: "center", color: ROLE_COLORS[u.role], fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
            {u.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 800, color: C.text, fontSize: 14 }}>{u.name}</p>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted, fontFamily: "'DM Mono',monospace" }}>{u.email} · {u.id}</p>
          </div>
          <Badge tone={u.role === "admin" ? "purple" : u.role === "doctor" ? "blue" : u.role === "records" ? "green" : "red"}>{ROLE_LABELS[u.role]}</Badge>
        </Card>
      ))}
    </div>
  </div>
);

// Admin Logs
const AdminLogs = () => {
  const [q, setQ] = useState("");
  const filtered = AUDIT_LOGS.filter((l) => l.userName.toLowerCase().includes(q.toLowerCase()) || l.action.toLowerCase().includes(q.toLowerCase()) || l.patientLid.includes(q));
  return (
    <div>
      <PageHdr title="Audit Logs" sub="Complete system access history with attribution" />
      <Card style={{ padding: "14px 18px", marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
        <Ic n="search" s={17} c="#94a3b8" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by officer, action, patient LID…" style={{ flex: 1, border: "none", fontSize: 14, outline: "none", color: C.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }} />
        <Badge tone="gray">{filtered.length} records</Badge>
      </Card>
      <AuditTable logs={filtered} />
    </div>
  );
};

// Doctor Overview
const DoctorOverview = ({ user }) => (
  <div>
    <PageHdr title={`Welcome, Dr. ${user.name.replace("Dr. ", "")}`} sub={`${user.hospital} · Medical Officer`} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
      <Stat label="Emergency Accesses Today" value="7" icon={<Ic n="alert" s={20} />} accent={C.red} sub="Critical access" trend={-15} delay={1} />
      <Stat label="Patients Seen This Week" value="34" icon={<Ic n="users" s={20} />} accent={C.blue} sub="Across all departments" delay={2} />
      <Stat label="Families Notified" value="12" icon={<Ic n="bell" s={20} />} accent={C.green} sub="This month · 100% reached" trend={8} delay={3} />
    </div>
  </div>
);

// Records Overview
const RecordsOverview = ({ user }) => (
  <div>
    <PageHdr title={`Welcome, ${user.name}`} sub={`Records Officer · ${user.hospital}`} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
      <Stat label="Patients Registered" value="4,201" icon={<Ic n="users" s={20} />} accent={C.green} sub="This year" trend={18} delay={1} />
      <Stat label="Records Updated" value="387" icon={<Ic n="file" s={20} />} accent={C.blue} sub="This month" trend={7} delay={2} />
      <Stat label="Docs Uploaded" value="94" icon={<Ic n="upload" s={20} />} accent={C.purple} sub="This week" trend={12} delay={3} />
    </div>
  </div>
);

// Patient Overview
const PatientOverview = ({ user }) => {
  const patient = PATIENTS[0];
  return (
    <div>
      <Card style={{ padding: "24px 28px", marginBottom: 20, background: `linear-gradient(135deg,${C.navy},#1a3060)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: "linear-gradient(135deg,#ef4444,#dc2626)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 26, color: "white", fontFamily: "'Sora',sans-serif", flexShrink: 0, boxShadow: "0 8px 24px rgba(239,68,68,.4)" }}>
            {patient.name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "rgba(255,255,255,.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Your LifeID Profile</p>
            <h2 style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 900, color: "white", fontFamily: "'Sora',sans-serif" }}>{patient.name}</h2>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "rgba(255,255,255,.5)" }}>{patient.gender} · DOB {patient.dob} · {patient.phone}</p>
            <Badge tone="green" dot>Verified & Active</Badge>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 20 }}>
        <Card style={{ padding: "14px 18px" }}>
          <p style={{ margin: "0 0 2px", fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Blood Group</p>
          <p style={{ margin: 0, fontWeight: 700, color: C.text, fontSize: 13.5 }}>{patient.bloodGroup}</p>
        </Card>
        <Card style={{ padding: "14px 18px" }}>
          <p style={{ margin: "0 0 2px", fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Emergency Contact</p>
          <p style={{ margin: 0, fontWeight: 700, color: C.text, fontSize: 13.5, fontFamily: "'DM Mono',monospace" }}>{patient.emergencyContact}</p>
        </Card>
      </div>
    </div>
  );
};

// Root Component
export default function App() {
  const [route, setRoute] = useState("landing");
  const [user, setUser] = useState(null);
  const [sub, setSub] = useState("overview");
  const [toastData, setToastData] = useState(null);

  const toast = (msg, type = "success") => {
    setToastData({ msg, type, k: Date.now() });
  };

  const handleLogin = (u) => {
    setUser(u);
    setSub("overview");
    setRoute("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setRoute("landing");
  };

  const nav = (p) => {
    if (p === "logout") {
      handleLogout();
      return;
    }
    if (["landing", "login"].includes(p)) {
      setRoute(p);
      return;
    }
    setSub(p);
  };

  const renderDashboard = () => {
    const R = user.role;
    if (R === ROLES.ADMIN) {
      if (sub === "hospitals") return <AdminHospitals toast={toast} />;
      if (sub === "users") return <AdminUsers toast={toast} />;
      if (sub === "logs") return <AdminLogs />;
      return <AdminOverview />;
    }
    if (R === ROLES.DOCTOR) {
      return <DoctorOverview user={user} />;
    }
    if (R === ROLES.RECORDS) {
      return <RecordsOverview user={user} />;
    }
    if (R === ROLES.PATIENT) {
      return <PatientOverview user={user} />;
    }
  };

  return (
    <>
      {route === "landing" && <Landing onNav={nav} />}
      {route === "login" && <Login onLogin={handleLogin} onNav={nav} />}
      {route === "dashboard" && user && <Shell user={user} page={sub} onNav={nav}>{renderDashboard()}</Shell>}
      {toastData && <Toast key={toastData.k} msg={toastData.msg} type={toastData.type} onDone={() => setToastData(null)} />}
    </>
  );
}
