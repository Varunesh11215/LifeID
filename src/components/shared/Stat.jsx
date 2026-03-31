import { C } from "../../tokens/colors";
import { Badge } from "../ui/Badge";

export const Stat = ({ label, value, icon, accent = "#2563eb", sub, trend, spark, bars, delay = 0 }) => (
  <div
    className={`fade-up-${delay}`}
    style={{
      background: "white",
      borderRadius: 14,
      border: `1px solid ${C.border}`,
      padding: "18px 20px",
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,.04)",
    }}
  >
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${accent},${accent}66)`, borderRadius: "14px 14px 0 0" }} />
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${accent}12`, display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
        {icon}
      </div>
      {trend !== undefined && (
        <span style={{ fontSize: 11, fontWeight: 800, color: trend >= 0 ? C.green : C.red, background: trend >= 0 ? C.greenL : C.redL, padding: "2px 8px", borderRadius: 6 }}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p style={{ margin: "0 0 2px", fontSize: 10.5, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.09em" }}>{label}</p>
    <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: C.text, lineHeight: 1.1, fontFamily: "'DM Mono',monospace" }}>{value}</p>
    {sub && <p style={{ margin: "4px 0 0", fontSize: 12, color: C.mutedLight }}>{sub}</p>}
  </div>
);
