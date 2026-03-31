import { useState } from "react";
import { AUDIT_LOGS, HOSPITALS } from "../../constants";
import { PageHdr } from "../../components/ui/PageHdr";
import { Stat } from "../../components/shared/Stat";
import { Ic } from "../../components/icons/Ic";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/charts/Charts";
import { Donut } from "../../components/charts/Charts";
import { C } from "../../tokens/colors";
import { FeedItem } from "../../components/charts/Charts";

export const AdminOverview = () => {
  const regSpark = [980, 1120, 1050, 1340, 1200, 1580, 1760, 1900, 2143];
  const emergBars = [240, 310, 280, 390, 420, 380, 460, 510, 580, 720];
  const hosStatus = [
    { label: "AIIMS New Delhi", officers: 142, cap: 180 },
    { label: "PGI Chandigarh", officers: 98, cap: 120 },
    { label: "NIMHANS Bengaluru", officers: 76, cap: 100 },
    { label: "SGPGI Lucknow", officers: 54, cap: 80 },
  ];

  return (
    <div>
      <PageHdr title="Platform Overview" sub={`National Health Authority · ${new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`} />

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        <Stat label="Registered Patients" value="12,40,291" icon={<Ic n="users" s={20} />} accent="#2563eb" sub="+2,143 this month" trend={12} spark={regSpark} delay={1} />
        <Stat label="Partner Hospitals" value="47" icon={<Ic n="hospital" s={20} />} accent="#059669" sub="3 pending approval" trend={6} delay={2} />
        <Stat label="Active Officers" value="1,284" icon={<Ic n="user" s={20} />} accent="#7c3aed" sub="Doctors + Records" trend={3} delay={3} />
        <Stat label="Emergency Accesses" value="8,720" icon={<Ic n="alert" s={20} />} accent="#dc2626" sub="Last 30 days" trend={-4} bars={emergBars} delay={4} />
      </div>

      {/* Middle row: Hospital capacity + Donut breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14, marginBottom: 20 }}>
        <div style={{ background: "white", borderRadius: 14, border: `1px solid ${C.border}`, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.text }}>Hospital Capacity</h3>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>Active officers vs allocated slots</p>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.green, background: C.greenL, padding: "3px 10px", borderRadius: 6 }}>Live</span>
          </div>
          {hosStatus.map((h) => (
            <ProgressBar key={h.label} label={h.label} value={h.officers} max={h.cap} color={C.blueMid} />
          ))}
        </div>
        <div style={{ background: "white", borderRadius: 14, border: `1px solid ${C.border}`, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 800, color: C.text }}>Role Breakdown</h3>
          <p style={{ margin: "0 0 18px", fontSize: 12, color: C.muted }}>Officers by type</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              ["Medical Officers", "#2563eb", 420, 1284],
              ["Records Officers", "#059669", 614, 1284],
              ["System Admins", "#7c3aed", 250, 1284],
            ].map(([label, color, val, tot]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Donut value={val} total={tot} color={color} size={56} />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text }}>{label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted, fontFamily: "'DM Mono',monospace" }}>{val.toLocaleString()} active</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity feed + quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14 }}>
        <div style={{ background: "white", borderRadius: 14, border: `1px solid ${C.border}`, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 800, color: C.text }}>Recent Activity</h3>
          {AUDIT_LOGS.slice(0, 5).map((l) => (
            <FeedItem
              key={l.id}
              icon={l.action.includes("Emergency") ? "alert" : l.action.includes("Update") ? "edit" : "eye"}
              color={l.action.includes("Emergency") ? C.red : l.action.includes("Update") ? C.purple : C.blue}
              title={l.action}
              sub={`${l.userName} · ${l.hospitalName} · ${l.patientLid}`}
              time={l.time.split(",")[1]?.trim() || l.time}
            />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Pending Approvals", value: "3", icon: "hospital", color: C.amber, bg: C.amberL, sub: "Hospitals awaiting review" },
            { label: "System Alerts", value: "0", icon: "alert", color: C.green, bg: C.greenL, sub: "All systems nominal" },
            { label: "Today's Logins", value: "847", icon: "user", color: C.blue, bg: C.blueL, sub: "Officers active today" },
          ].map((item) => (
            <div key={item.label} style={{ background: "white", borderRadius: 14, border: `1px solid ${C.border}`, padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ic n={item.icon} s={17} c={item.color} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 900, color: C.text, fontFamily: "'DM Mono',monospace", lineHeight: 1 }}>{item.value}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: C.mutedLight }}>{item.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
