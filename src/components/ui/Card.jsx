import { C } from "../../tokens/colors";

export const Card = ({ children, style: st, className }) => (
  <div className={`hover-lift ${className || ""}`} style={{ background: "white", borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(0,0,0,.04)", ...st }}>
    {children}
  </div>
);
