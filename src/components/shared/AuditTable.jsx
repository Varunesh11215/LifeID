import { C } from "../../tokens/colors";
import { Badge } from "../ui/Badge";
import { Ic } from "../icons/Ic";

export const AuditTable = ({ logs, showPatient = true }) => (
  <div style={{ background: "white", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
        <thead>
          <tr style={{ background: "#f8fafc", borderBottom: `1px solid ${C.border}` }}>
            {["Timestamp", "Officer", "Role", showPatient && "Patient LID", "Hospital", "Action", "Status"]
              .filter(Boolean)
              .map((h) => (
                <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 10.5, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {logs.map((l, i) => (
            <tr key={l.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? "white" : "#fafafa", transition: "background .15s" }}>
              <td style={{ padding: "11px 16px", color: C.muted, fontFamily: "'DM Mono',monospace", fontSize: 11.5, whiteSpace: "nowrap" }}>{l.time}</td>
              <td style={{ padding: "11px 16px" }}>
                <div style={{ fontWeight: 700, color: C.text, fontSize: 13 }}>{l.userName}</div>
                <div style={{ fontSize: 11, color: C.mutedLight, fontFamily: "'DM Mono',monospace" }}>{l.userId}</div>
              </td>
              <td style={{ padding: "11px 16px" }}>
                <Badge tone={l.role === "System Admin" ? "purple" : l.role === "Medical Officer" ? "blue" : l.role === "Records Officer" ? "green" : "red"}>{l.role}</Badge>
              </td>
              {showPatient && <td style={{ padding: "11px 16px", fontFamily: "'DM Mono',monospace", fontSize: 12, color: C.blue, fontWeight: 600 }}>{l.patientLid}</td>}
              <td style={{ padding: "11px 16px", fontSize: 12, color: C.textSub }}>{l.hospitalName}</td>
              <td style={{ padding: "11px 16px", fontWeight: 600, color: C.text }}>{l.action}</td>
              <td style={{ padding: "11px 16px" }}>
                <Badge tone="green" dot>
                  {l.status}
                </Badge>
              </td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={7} style={{ padding: "36px", textAlign: "center", color: C.mutedLight, fontSize: 13 }}>
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
