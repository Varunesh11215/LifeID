import { useState } from "react";
import { C } from "../../tokens/colors";

export const Btn = ({ children, variant = "primary", size = "md", fullWidth, disabled, onClick, style: st, type }) => {
  const [pressed, setPressed] = useState(false);
  const sizes = { sm: { padding: "7px 14px", fontSize: 12 }, md: { padding: "10px 20px", fontSize: 13.5 }, lg: { padding: "13px 28px", fontSize: 15 } };
  const variants = {
    primary: { background: `linear-gradient(135deg, ${C.navy}, ${C.blueMid})`, color: "white", boxShadow: "0 4px 14px rgba(29,78,216,.3)" },
    danger: { background: `linear-gradient(135deg, #b91c1c, ${C.red})`, color: "white", boxShadow: "0 4px 14px rgba(220,38,38,.3)" },
    success: { background: `linear-gradient(135deg, #047857, ${C.green})`, color: "white", boxShadow: "0 4px 14px rgba(5,150,105,.25)" },
    ghost: { background: "#f1f5f9", color: "#475569", boxShadow: "none" },
    outline: { background: "white", color: C.navy, border: `1.5px solid ${C.navy}`, boxShadow: "none" },
    red: { background: `linear-gradient(135deg, ${C.red}, #b91c1c)`, color: "white", boxShadow: "0 4px 14px rgba(220,38,38,.3)" },
  };
  return (
    <button
      type={type || "button"}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{ border: "none", borderRadius: 9, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "all .18s", width: fullWidth ? "100%" : undefined, opacity: disabled ? 0.55 : 1, transform: pressed ? "scale(.97)" : "scale(1)", fontFamily: "'Plus Jakarta Sans',sans-serif", ...sizes[size], ...variants[variant], ...st }}
    >
      {children}
    </button>
  );
};
