import { C } from "../../tokens/colors";
import { MENUS, ROLE_COLORS } from "../../constants";
import { Ic } from "../icons/Ic";
import { Sidebar } from "./Sidebar";

export const Shell = ({ user, page, onNav, children }) => {
  const accent = ROLE_COLORS[user.role];
  const pageLabel = [...Object.values(MENUS)].flat().find((m) => m.page === page)?.label || "Dashboard";
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
      <Sidebar user={user} page={page} onNav={onNav} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header
          style={{
            height: 56,
            background: "white",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            flexShrink: 0,
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "0 1px 3px rgba(0,0,0,.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: C.muted }}>LifeID</span>
            <Ic n="chevron" s={13} c={C.muted} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{pageLabel}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.slate, borderRadius: 8, padding: "5px 12px", border: `1px solid ${C.border}` }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: C.textSub }}>System Online</span>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `${accent}15`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: accent }}>
              {user.avatar}
            </div>
          </div>
        </header>
        <main style={{ flex: 1, overflow: "auto", padding: "28px 28px" }}>{children}</main>
      </div>
    </div>
  );
};
