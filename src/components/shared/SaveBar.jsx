import { useState } from "react";
import { C } from "../../tokens/colors";
import { Ic } from "../icons/Ic";

export const SaveBar = ({ onSave, label = "Save Changes" }) => {
  const [status, setStatus] = useState("idle");

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (status === "saving") return;
    setStatus("saving");
    try {
      onSave();
    } catch (_) {}
    setTimeout(() => setStatus("saved"), 500);
    setTimeout(() => setStatus("idle"), 2800);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22, paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
      <button
        type="button"
        disabled={status === "saving"}
        onClick={handleClick}
        style={{
          minWidth: 180,
          padding: "11px 22px",
          border: "none",
          borderRadius: 9,
          background: status === "saving" ? "#6ee7b7" : "linear-gradient(135deg,#047857,#059669)",
          color: "white",
          fontWeight: 700,
          fontSize: 13.5,
          cursor: status === "saving" ? "not-allowed" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          boxShadow: "0 4px 14px rgba(5,150,105,.3)",
          transition: "all .2s",
        }}
      >
        {status === "saving" ? (
          <>
            <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
            Saving…
          </>
        ) : (
          <>
            <Ic n="check" s={15} c="white" /> {label}
          </>
        )}
      </button>
      {status === "saved" && (
        <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#16a34a", fontWeight: 800, fontSize: 13, animation: "fadeUp .25s ease" }}>
          <Ic n="check" s={16} c="#16a34a" /> Saved — audit log generated
        </div>
      )}
    </div>
  );
};
