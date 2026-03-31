import { Ic } from "../components/icons/Ic";
import { C } from "../tokens/colors";
import { Card } from "../components/ui/Card";

const SimplePage = ({ title, onNav, children }) => (
  <div style={{ minHeight: "100vh", background: "#f0f2f7", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
    <nav style={{ background: "white", borderBottom: `1px solid ${C.border}`, padding: "16px 40px", display: "flex", alignItems: "center", gap: 12 }}>
      <button onClick={() => onNav("landing")} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 13, fontFamily: "'Plus Jakarta Sans',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
        <Ic n="chevron" s={14} style={{ transform: "rotate(180deg)" }} /> Home
      </button>
      <span style={{ color: C.border }}>|</span>
      <span style={{ fontWeight: 800, color: C.navy, fontSize: 14 }}>{title}</span>
    </nav>
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "60px 30px" }}>{children}</div>
  </div>
);

export const About = ({ onNav }) => (
  <SimplePage title="About LifeID" onNav={onNav}>
    <h1 style={{ fontSize: 40, fontWeight: 900, color: C.text, marginBottom: 16, fontFamily: "'Playfair Display',serif" }}>About LifeID</h1>
    <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.85, marginBottom: 36 }}>LifeID is India's national biometric medical identity platform under the National Health Authority (NHA). It eliminates medical errors, prevents identity fraud, and saves lives through instant, biometrically-secured access to critical patient data across all empanelled hospitals.</p>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      {[
        ["Our Mission", "Ensure every Indian citizen's critical medical information is available at the right moment — accurate, verified, and under strict biometric control."],
        ["Our Vision", "An India where no patient suffers due to unknown allergies, wrong blood transfusion, or missing medical history in an emergency room."],
        ["Indian Standard", "All phone numbers follow the +91 standard with 10-digit validation (starting 6–9), aligned with TRAI and NHA guidelines."],
        ["Privacy First", "Patient medical data is locked by default. Even after login, sensitive data requires biometric unlock and auto-locks after inactivity."],
      ].map(([t, d]) => (
        <Card key={t} style={{ padding: 22 }}>
          <h3 style={{ margin: "0 0 8px", color: C.navy, fontWeight: 800, fontFamily: "'Playfair Display',serif" }}>{t}</h3>
          <p style={{ margin: 0, color: C.muted, lineHeight: 1.7, fontSize: 14 }}>{d}</p>
        </Card>
      ))}
    </div>
  </SimplePage>
);

export const Privacy = ({ onNav }) => (
  <SimplePage title="Privacy & Security" onNav={onNav}>
    <h1 style={{ fontSize: 40, fontWeight: 900, color: C.text, marginBottom: 16, fontFamily: "'Playfair Display',serif" }}>Privacy & Security</h1>
    {[
      [
        "Biometric Data Protection",
        "Fingerprint templates are encrypted using AES-256 before storage. Raw biometric data never leaves the secure hardware enclave. Only cryptographic templates are stored.",
      ],
      [
        "Default Data Locking",
        "Medical records are locked immediately upon patient login. The patient must explicitly verify with biometrics to view sensitive data, which auto-locks after 30 seconds of inactivity.",
      ],
      [
        "Role-Based Access Control",
        "System Admins cannot access patient data. Doctors can only view emergency critical information. Records Officers require dual biometric for updates. All roles are strictly isolated.",
      ],
      ["Indian Phone Standard", "All contact numbers must follow the +91 Indian format (10 digits, starting with 6–9) per TRAI regulations. Validation is enforced on all entry points."],
      [
        "Immutable Audit Trail",
        "Every data access event is permanently logged with officer ID, hospital ID, patient LID, timestamp, and action type. Logs cannot be modified or deleted. Patients can view their full access history.",
      ],
    ].map(([t, d]) => (
      <Card key={t} style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 10px", color: C.navy, fontWeight: 800, fontFamily: "'Playfair Display',serif" }}>{t}</h3>
        <p style={{ margin: 0, color: C.muted, lineHeight: 1.75, fontSize: 14 }}>{d}</p>
      </Card>
    ))}
  </SimplePage>
);
