import { C } from "../../tokens/colors";

export const Field = ({ label, error, children, required }) => (
  <div style={{ marginBottom: 16 }}>
    {label && (
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#374151", marginBottom: 5, letterSpacing: "0.02em" }}>
        {label}
        {required && <span style={{ color: C.red }}> *</span>}
      </label>
    )}
    {children}
    {error && <p style={{ marginTop: 5, fontSize: 11.5, color: C.red, fontWeight: 600 }}>{error}</p>}
  </div>
);

export const Input = ({ label, error, required, ...props }) => (
  <Field label={label} error={error} required={required}>
    <input {...props} style={{ width: "100%", padding: "10px 13px", border: `1.5px solid ${error ? C.red : C.border}`, borderRadius: 9, fontSize: 14, color: C.text, background: "white", fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "border .15s", ...props.style }} />
  </Field>
);

export const Sel = ({ label, error, required, children, ...props }) => (
  <Field label={label} error={error} required={required}>
    <select {...props} style={{ width: "100%", padding: "10px 13px", border: `1.5px solid ${error ? C.red : C.border}`, borderRadius: 9, fontSize: 14, color: C.text, background: "white", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      {children}
    </select>
  </Field>
);

export const Divider = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
    <div style={{ flex: 1, height: 1, background: C.border }} />
    {label && <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>}
    <div style={{ flex: 1, height: 1, background: C.border }} />
  </div>
);

export const PageHdr = ({ title, sub, action }) => (
  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 12, flexWrap: "wrap" }} className="fade-up">
    <div>
      <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: C.text, margin: 0, letterSpacing: "-.02em" }}>{title}</h1>
      {sub && <p style={{ margin: "5px 0 0", color: C.muted, fontSize: 13.5, lineHeight: 1.5 }}>{sub}</p>}
    </div>
    {action && <div style={{ flexShrink: 0 }}>{action}</div>}
  </div>
);
