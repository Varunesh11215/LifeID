import { useState, useEffect } from "react";
import { C } from "../../tokens/colors";
import { Ic } from "../icons/Ic";
import { BioScanner } from "./BioScanner";

export const LockedMedicalData = ({ patientName = "Patient", onUnlock }) => {
  const [state, setState] = useState("locked"); // locked | scanning | unlocked
  const [unlockedAt, setUnlockedAt] = useState(null);

  useEffect(() => {
    if (state !== "unlocked") return;
    const timer = setTimeout(() => {
      setState("locked");
      setUnlockedAt(null);
    }, 30000);
    return () => clearTimeout(timer);
  }, [state]);

  const handleBioComplete = () => {
    setState("unlocked");
    setUnlockedAt(Date.now());
    if (onUnlock) onUnlock();
  };

  if (state === "scanning") {
    return <BioScanner onComplete={handleBioComplete} />;
  }

  const secondsLeft = unlockedAt ? Math.max(0, 30 - Math.floor((Date.now() - unlockedAt) / 1000)) : 0;

  return (
    <div
      style={{
        borderRadius: 14,
        border: `1.5px solid ${state === "locked" ? C.red : C.green}`,
        padding: 20,
        background: state === "locked" ? "#fef2f2" : "#f0fdf4",
      }}
    >
      {state === "locked" ? (
        <div style={{ textAlign: "center", py: 20 }}>
          <div style={{ marginBottom: 12 }}>
            <Ic n="lock" s={32} c={C.red} />
          </div>
          <h3 style={{ margin: "0 0 5px", color: C.text, fontWeight: 700 }}>Medical Data Locked</h3>
          <p style={{ margin: 0, fontSize: 13, color: C.muted }}>This data requires biometric verification</p>
          <button
            onClick={() => setState("scanning")}
            style={{
              marginTop: 14,
              padding: "8px 16px",
              background: C.red,
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Unlock with Biometric
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Ic n="check" s={20} c={C.green} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>Data Unlocked ({secondsLeft}s remaining)</span>
          </div>
          <div style={{ padding: 12, background: "white", borderRadius: 8, fontSize: 13, color: C.text }}>
            <p style={{ margin: "0 0 8px" }}>
              <strong>Patient:</strong> {patientName}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Status:</strong> Medical data accessible
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
