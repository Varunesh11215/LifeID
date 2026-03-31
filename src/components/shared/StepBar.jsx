export const StepBar = ({ current }) => {
  const C = { border: "#e2e8f0", text: "#0f172a", muted: "#64748b" };
  const steps = ["Officer Biometric", "Patient Biometric", "Record Editor"];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }} className="fade-up">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? "1" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 800,
                  transition: "all .3s",
                  background: done ? "#059669" : active ? "#2563eb" : "#e2e8f0",
                  color: done || active ? "white" : "#94a3b8",
                }}
              >
                {done ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: active ? C.text : C.muted, whiteSpace: "nowrap" }}>{s}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: done ? "#86efac" : C.border, margin: "0 14px", transition: "all .3s" }} />}
          </div>
        );
      })}
    </div>
  );
};
