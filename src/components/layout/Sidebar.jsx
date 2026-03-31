import { C } from "../../tokens/colors";
import { MENUS, ROLE_LABELS, ROLE_COLORS } from "../../constants";
import { Ic } from "../icons/Ic";

export const Sidebar = ({ user, page, onNav }) => {
  const items = MENUS[user.role] || [];
  const accent = ROLE_COLORS[user.role];
  const roleGrad = { admin: "linear-gradient(135deg,#7c3aed,#6d28d9)", doctor: "linear-gradient(135deg,#2563eb,#1d4ed8)", records: "linear-gradient(135deg,#059669,#047857)", patient: "linear-gradient(135deg,#dc2626,#b91c1c)" }[user.role] || "linear-gradient(135deg,#2563eb,#1d4ed8)";

  return (
    <aside
      style={{
        width: 248,
        background: C.sidebar,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        flexShrink: 0,
        borderRight: "1px solid rgba(255,255,255,.06)",
      }}
    >
      <div style={{ padding: "24px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#ef4444,#dc2626)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(239,68,68,.4)" }}>
            <Ic n="shield" s={18} c="white" />
          </div>
          <div>
            <span style={{ color: "white", fontSize: 19, fontWeight: 900, letterSpacing: "-.03em" }}>
              Life<span style={{ color: "#ef4444" }}>ID</span>
            </span>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginTop: 1 }}>NHA INDIA</div>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,.05)", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: roleGrad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, color: "white", flexShrink: 0, boxShadow: `0 4px 10px ${accent}40` }}>
              {user.avatar}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: "white", fontSize: 13, fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: accent }} />
                <p style={{ color: accent,fontSize: 10.5, margin: 0, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{ROLE_LABELS[user.role]}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "4px 12px", flex: 1, overflowY: "auto" }}>
        <p style={{ fontSize: 9.5, fontWeight: 800, color: "rgba(255,255,255,.2)", textTransform: "uppercase", letterSpacing: "0.14em", padding: "8px 8px 6px", margin: 0 }}>Navigation</p>
        {items.map((item) => {
          const active = page === item.page;
          return (
            <button
              key={item.page}
              onClick={() => onNav(item.page)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                marginBottom: 2,
                fontWeight: 600,
                fontSize: 13,
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                textAlign: "left",
                transition: "all .15s",
                background: active ? `${accent}22` : "transparent",
                color: active ? "white" : "rgba(255,255,255,.45)",
                borderLeft: active ? `2.5px solid ${accent}` : "2.5px solid transparent",
              }}
            >
              <Ic n={item.icon} s={15} c={active ? accent : "rgba(255,255,255,.3)"} />
              {item.label}
              {active && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: accent }} />}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <button
          onClick={() => onNav("logout")}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 12px",
            borderRadius: 10,
            border: "none",
            background: "rgba(239,68,68,.08)",
            color: "#f87171",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            transition: "all .15s",
          }}
        >
          <Ic n="logout" s={15} c="#f87171" /> Sign Out
        </button>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,.12)", fontSize: 9.5, marginTop: 10, letterSpacing: "0.1em" }}>LifeID v2.0 · NHA INDIA</p>
      </div>
    </aside>
  );
};
