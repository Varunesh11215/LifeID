import { useEffect } from "react";
import { C } from "../../tokens/colors";
import { Ic } from "../icons/Ic";

export const Toast = ({ msg, type = "success", onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, []);
  const cfg = {
    success: { bg: "#dcfce7", border: "#86efac", color: "#166534", icon: "check" },
    error: { bg: "#fee2e2", border: "#fca5a5", color: "#991b1b", icon: "alert" },
    info: { bg: "#dbeafe", border: "#93c5fd", color: "#1e40af", icon: "info" },
  };
  const { bg, border, color, icon } = cfg[type] || cfg.info;
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 2000, background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: "13px 18px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 30px rgba(0,0,0,.12)", animation: "fadeUp .3s ease", maxWidth: 340 }}>
      <Ic n={icon} s={18} c={color} />
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{msg}</span>
    </div>
  );
};
