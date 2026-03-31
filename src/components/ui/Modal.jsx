import { C } from "../../tokens/colors";
import { Ic } from "../icons/Ic";

export const Modal = ({ open, onClose, title, children, width = 480 }) => {
  if (!open) return null;
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,31,61,.55)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn .2s ease" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "white", borderRadius: 18, width: "100%", maxWidth: width, maxHeight: "90vh", overflow: "auto", boxShadow: "0 30px 100px rgba(0,0,0,.25)", animation: "fadeUp .25s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.text, fontFamily: "'Playfair Display',serif" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>
            <Ic n="x" s={15} />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
};
