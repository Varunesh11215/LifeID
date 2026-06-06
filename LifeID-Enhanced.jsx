import React, { useState, useEffect, useRef, useCallback } from "react";
import { getEmergencyAccessBaseUrl, getSavedEmergencyAccessToken, submitEmergencyAccess } from "./frontend/src/services/emergencyAccess.js";
import { clearAuthToken, getApiBaseUrl, getSavedAuthToken, loginWithBackend, saveAuthToken } from "./frontend/src/services/auth.js";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f0f2f7; color: #0f172a; }
  ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes ripple { 0%{transform:translate(-50%,-50%) scale(0);opacity:.5}100%{transform:translate(-50%,-50%) scale(4);opacity:0} }
  @keyframes scanLine { 0%,100%{top:10%}50%{top:85%} }
  @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(59,130,246,.3)}50%{box-shadow:0 0 40px rgba(59,130,246,.7)} }
  @keyframes alertPulse { 0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.4)}70%{box-shadow:0 0 0 8px rgba(220,38,38,0)} }
  @keyframes slideRight { from{transform:translateX(-8px);opacity:0}to{transform:translateX(0);opacity:1} }
  .fade-up{animation:fadeUp .4s ease both} .fade-up-1{animation:fadeUp .4s .05s ease both} .fade-up-2{animation:fadeUp .4s .1s ease both} .fade-up-3{animation:fadeUp .4s .15s ease both} .fade-up-4{animation:fadeUp .4s .2s ease both}
  .hover-lift{transition:transform .2s,box-shadow .2s} .hover-lift:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.1)!important}
  input:focus,select:focus,textarea:focus{outline:none;border-color:#2563eb!important;box-shadow:0 0 0 3px rgba(37,99,235,.12)}
  button{font-family:'Plus Jakarta Sans',sans-serif}
`;

// ── Roles & mock data ─────────────────────────────────────────────────────────
const ROLES = { ADMIN:"admin", DOCTOR:"doctor", RECORDS:"records", PATIENT:"patient" };
const USERS = {
  admin:   { id:"USR001", name:"Rajesh Kumar",    role:ROLES.ADMIN,    email:"admin@lifeid.gov.in",   password:"admin123",  avatar:"RK" },
  doctor:  { id:"USR002", name:"Dr. Priya Nair",  role:ROLES.DOCTOR,   email:"doctor@lifeid.gov.in",  password:"doc123",    avatar:"PN", hospital:"AIIMS New Delhi" },
  records: { id:"USR003", name:"Sanjay Mehta",    role:ROLES.RECORDS,  email:"records@lifeid.gov.in", password:"rec123",    avatar:"SM", hospital:"AIIMS New Delhi" },
  patient: { id:"USR004", name:"Arjun Sharma",    role:ROLES.PATIENT,  email:"patient@lifeid.gov.in", password:"pat123",    avatar:"AS", lifeId:"LID-IN-2024-00291" },
};
const PATIENTS = [
  { id:"P001", lifeId:"LID-IN-2024-00291", name:"Arjun Sharma",   dob:"1985-03-12", gender:"Male",   phone:"+91 9876543210", bloodGroup:"O+",  allergies:["Penicillin","NSAIDs"], chronicDiseases:["Hypertension","Type 2 Diabetes"], medications:["Metformin 500mg BD","Lisinopril 10mg OD","Ibuprofen 400mg PRN"], emergencyContact:"+91 9988776655", address:"42, MG Road, Bengaluru", lastUpdated:"2024-11-20", prescriptions:["Rx-2024-11-20.pdf"], reports:["Blood-Report-Oct.pdf"] },
  { id:"P002", lifeId:"LID-IN-2024-00147", name:"Sneha Iyer",     dob:"1992-07-25", gender:"Female", phone:"+91 8765432109", bloodGroup:"A+",  allergies:["Sulfa drugs"],           chronicDiseases:["Asthma"],                medications:["Salbutamol inhaler PRN","Aspirin 75mg OD"], emergencyContact:"+91 9876001234", address:"7, Anna Nagar, Chennai",    lastUpdated:"2024-10-08", prescriptions:[], reports:[] },
  { id:"P003", lifeId:"LID-IN-2024-00388", name:"Rahul Verma",    dob:"1970-01-15", gender:"Male",   phone:"+91 7654321098", bloodGroup:"B-",  allergies:["Aspirin"],               chronicDiseases:["Coronary Artery Disease"],medications:["Aspirin 81mg OD","Atorvastatin 40mg","Bisoprolol 5mg OD"], emergencyContact:"+91 9765432100", address:"23, Civil Lines, Lucknow",  lastUpdated:"2024-12-01", prescriptions:[], reports:[] },
  { id:"P004", lifeId:"LID-IN-2024-00512", name:"Deepa Krishnan", dob:"2001-09-30", gender:"Female", phone:"+91 6543210987", bloodGroup:"AB+", allergies:[],                        chronicDiseases:[],                medications:["Folic Acid 5mg OD"], emergencyContact:"+91 9870001234", address:"8, Salt Lake, Kolkata",     lastUpdated:"2024-09-15", prescriptions:[], reports:[] },
];
const AUDIT_LOGS = [
  { id:"AL001", time:"2024-12-02 14:32:07", userId:"USR002", userName:"Dr. Priya Nair",  role:"Doctor",          hospitalName:"AIIMS New Delhi", patientLid:"LID-IN-2024-00291", action:"Emergency Access",    status:"Authorized" },
  { id:"AL002", time:"2024-12-02 11:15:44", userId:"USR003", userName:"Sanjay Mehta",   role:"Records Officer", hospitalName:"AIIMS New Delhi", patientLid:"LID-IN-2024-00147", action:"Record Update",       status:"Authorized" },
  { id:"AL003", time:"2024-12-01 09:04:22", userId:"USR004", userName:"Arjun Sharma",   role:"Patient",         hospitalName:"—",               patientLid:"LID-IN-2024-00291", action:"Profile View",        status:"Authorized" },
  { id:"AL004", time:"2024-11-30 16:50:11", userId:"USR005", userName:"Dr. Amit Gupta", role:"Doctor",          hospitalName:"Safdarjung Hosp", patientLid:"LID-IN-2024-00388", action:"Emergency Access",    status:"Authorized" },
  { id:"AL005", time:"2024-11-29 08:22:33", userId:"UNKNOWN",userName:"Unknown",        role:"—",               hospitalName:"—",               patientLid:"—",                 action:"Failed Login",        status:"Denied" },
];
const HOSPITALS = [
  { id:"H1", name:"AIIMS New Delhi",   location:"New Delhi",  status:"approved", officers:42 },
  { id:"H2", name:"KEM Hospital",      location:"Mumbai",     status:"pending",  officers:35 },
  { id:"H3", name:"NIMHANS Bengaluru", location:"Bengaluru",  status:"pending",  officers:0  },
];

// ═══════════════════════════════════════════════════════════════════
//  AI RISK ALERT ENGINE
// ═══════════════════════════════════════════════════════════════════
const ALLERGY_CROSS_REACT = {
  "Penicillin":   { drugs:["amoxicillin","ampicillin","augmentin","amoxicillin-clavulanate","piperacillin","tazobactam","oxacillin","nafcillin","dicloxacillin"], note:"Penicillin-class (beta-lactam) cross-reactivity", action:"Use non-beta-lactam alternative (e.g. Azithromycin, Clindamycin)" },
  "Sulfa drugs":  { drugs:["sulfamethoxazole","trimethoprim","bactrim","septra","co-trimoxazole","sulfadiazine","sulfasalazine"], note:"Sulfonamide class cross-reactivity", action:"Avoid all sulfonamide antibiotics" },
  "Aspirin":      { drugs:["aspirin","ibuprofen","naproxen","diclofenac","indomethacin","meloxicam","celecoxib","ketorolac","piroxicam"], note:"NSAID hypersensitivity — cross-reactive with aspirin-sensitive patients", action:"Use paracetamol/acetaminophen as analgesic alternative" },
  "NSAIDs":       { drugs:["ibuprofen","naproxen","aspirin","diclofenac","indomethacin","meloxicam","celecoxib","ketorolac","piroxicam"], note:"NSAID class allergy — all NSAIDs contraindicated", action:"Paracetamol only. Avoid all COX-1/COX-2 inhibitors" },
  "Codeine":      { drugs:["codeine","morphine","oxycodone","hydrocodone","tramadol","fentanyl","hydromorphone"], note:"Opioid cross-sensitivity", action:"Avoid opioid class. Use non-opioid analgesics" },
  "Latex":        { drugs:[], note:"Latex allergy — relevant to any procedure", action:"Latex-free gloves and equipment mandatory for all procedures" },
  "Contrast dye": { drugs:["iodinated contrast","gadolinium","omnipaque","visipaque"], note:"Prior contrast reaction", action:"Pre-medicate with corticosteroids + antihistamines. Notify radiology" },
};

const CONDITION_DRUG_RISKS = {
  "Type 2 Diabetes": [
    { kw:["corticosteroid","prednisone","dexamethasone","methylprednisolone","hydrocortisone"], level:"HIGH",   msg:"Corticosteroids cause severe hyperglycemia in diabetics — insulin adjustment likely required" },
    { kw:["olanzapine","quetiapine","clozapine","risperidone"],                                level:"MEDIUM", msg:"Atypical antipsychotics — glucose dysregulation risk; monitor HbA1c" },
    { kw:["thiazide","hydrochlorothiazide","chlorothiazide"],                                  level:"MEDIUM", msg:"Thiazide diuretics worsen glycaemic control — monitor blood glucose" },
  ],
  "Hypertension": [
    { kw:["ibuprofen","naproxen","diclofenac","indomethacin","meloxicam","nsaid","celecoxib","ketorolac"], level:"HIGH", msg:"NSAIDs elevate blood pressure and reduce antihypertensive efficacy — avoid" },
    { kw:["pseudoephedrine","ephedrine","phenylephrine","oxymetazoline"],                                   level:"HIGH", msg:"Sympathomimetics cause significant BP elevation — contraindicated in hypertension" },
    { kw:["venlafaxine","duloxetine","desvenlafaxine"],                                                     level:"MEDIUM", msg:"SNRIs cause dose-dependent BP elevation — monitor blood pressure closely" },
  ],
  "Coronary Artery Disease": [
    { kw:["nsaid","ibuprofen","naproxen","diclofenac","celecoxib","indomethacin","meloxicam"], level:"HIGH", msg:"NSAIDs increase cardiovascular event risk — elevated MI and stroke risk in CAD patients" },
    { kw:["sildenafil","tadalafil","vardenafil","avanafil"],                                   level:"HIGH", msg:"PDE-5 inhibitors contraindicated with nitrates — severe hypotension and syncope risk" },
    { kw:["ergotamine","dihydroergotamine"],                                                   level:"HIGH", msg:"Ergot alkaloids cause coronary vasospasm — absolute contraindication in CAD" },
    { kw:["cocaine"],                                                                          level:"HIGH", msg:"Absolute contraindication — coronary vasospasm, acute MI, and sudden death risk" },
  ],
  "Asthma": [
    { kw:["aspirin","ibuprofen","naproxen","diclofenac","nsaid","indomethacin","meloxicam","celecoxib"], level:"HIGH", msg:"NSAIDs/Aspirin trigger life-threatening bronchospasm in aspirin-exacerbated respiratory disease" },
    { kw:["propranolol","atenolol","metoprolol","carvedilol","bisoprolol","labetalol","beta-blocker"],   level:"HIGH", msg:"Beta-blockers block bronchodilatory receptors — may precipitate acute severe asthma attack" },
    { kw:["adenosine"],                                                                                  level:"MEDIUM", msg:"Adenosine may cause bronchospasm in asthmatic patients — have bronchodilator ready" },
    { kw:["ace inhibitor","lisinopril","enalapril","ramipril","perindopril"],                           level:"MEDIUM", msg:"ACE inhibitors can cause cough that exacerbates asthma — monitor respiratory symptoms" },
  ],
  "Chronic Kidney Disease": [
    { kw:["metformin"],                                                          level:"HIGH",   msg:"Metformin contraindicated in significant CKD (eGFR<30) — fatal lactic acidosis risk" },
    { kw:["nsaid","ibuprofen","naproxen","diclofenac","indomethacin","meloxicam"],level:"HIGH",  msg:"NSAIDs reduce renal perfusion — may precipitate acute kidney injury on CKD" },
    { kw:["gentamicin","tobramycin","amikacin","streptomycin"],                 level:"HIGH",   msg:"Aminoglycosides nephrotoxic — requires dose adjustment; monitor renal function daily" },
    { kw:["spironolactone","eplerenone","amiloride"],                           level:"MEDIUM", msg:"Potassium-sparing diuretics — hyperkalemia risk in CKD; monitor electrolytes" },
  ],
};

const analyzeRisks = (allergies = [], conditions = [], medications = [], proposedDrug = "") => {
  const alerts = [];
  const drugLower = proposedDrug.toLowerCase().trim();

  // 1. Check proposed drug against allergies
  if (drugLower) {
    allergies.forEach(allergy => {
      const info = ALLERGY_CROSS_REACT[allergy];
      if (!info) return;
      const hit = info.drugs.find(d => drugLower.includes(d) || d.includes(drugLower));
      if (hit) alerts.push({ level:"HIGH", type:"ALLERGY_CONFLICT", drug: proposedDrug, title:`Allergy conflict — ${allergy}`, body:`${proposedDrug} is cross-reactive with ${allergy} allergy (${info.note}).`, action: info.action });
    });
    // Check proposed drug against conditions
    conditions.forEach(cond => {
      const risks = CONDITION_DRUG_RISKS[cond] || [];
      risks.forEach(r => {
        if (r.kw.some(k => drugLower.includes(k) || k.includes(drugLower)))
          alerts.push({ level: r.level, type:"CONDITION_CONFLICT", drug: proposedDrug, title:`${cond} contraindication`, body: r.msg, action:"Consult specialist before administering" });
      });
    });
  }

  // 2. Auto-check existing medications against allergies (critical: may catch pre-existing conflicts)
  medications.forEach(med => {
    const medL = med.toLowerCase();
    allergies.forEach(allergy => {
      const info = ALLERGY_CROSS_REACT[allergy];
      if (!info) return;
      const hit = info.drugs.find(d => medL.includes(d) || d.split("-").some(p => medL.includes(p)));
      if (hit) alerts.push({ level:"HIGH", type:"CURRENT_MED_ALLERGY", drug: med, title:`Critical: current medication conflict`, body:`Patient is on "${med}" but is allergic to ${allergy} (${info.note}).`, action:`Immediate medication review required. ${info.action}` });
    });
    // Check current meds against conditions
    conditions.forEach(cond => {
      const risks = CONDITION_DRUG_RISKS[cond] || [];
      risks.forEach(r => {
        if (r.kw.some(k => medL.includes(k))) {
          const exists = alerts.some(a => a.type === "CURRENT_MED_CONDITION" && a.drug === med && a.title.includes(cond));
          if (!exists) alerts.push({ level: r.level, type:"CURRENT_MED_CONDITION", drug: med, title:`${cond} — medication warning`, body: r.msg, action:"Review medication appropriateness with prescriber" });
        }
      });
    });
  });

  return alerts.sort((a, b) => { const o = {HIGH:0,MEDIUM:1,SAFE:2}; return o[a.level]-o[b.level]; });
};

const overallRisk = (alerts) => {
  if (!alerts.length) return "SAFE";
  if (alerts.some(a => a.level === "HIGH")) return "HIGH";
  return "MEDIUM";
};

// ── Validation ─────────────────────────────────────────────────────────────
const validateIndianPhone = (v) => /^\+91\s[6-9]\d{9}$/.test(v.trim());

// ── Tokens ─────────────────────────────────────────────────────────────────
const C = { navy:"#0a1628",blueMid:"#2563eb",blueL:"#dbeafe",red:"#dc2626",redL:"#fee2e2",green:"#059669",greenL:"#dcfce7",amber:"#d97706",amberL:"#fef9c3",purple:"#7c3aed",purpleL:"#ede9fe",border:"#e2e8f0",muted:"#64748b",mutedLight:"#94a3b8",text:"#0f172a",textSub:"#334155",sidebar:"#0a1628" };

// ── Icon component ────────────────────────────────────────────────────────
const PATHS = {
  shield:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",fp:"M12 22C9 22 2 17 2 12 2 7 6.5 2 12 2s10 5 10 10M12 18c-2.5 0-5-2.5-5-6s2.5-6 5-6M12 14c-.5 0-2-1-2-2s1.5-2 2-2 2 1 2 2M12 22v-4M17 22c0-3-2-5-5-5M22 17c-1.5 0-3-1-4-3",
  lock:"M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",unlock:"M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 9.9-1",
  user:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",users:"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  hospital:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10M12 7v4M10 9h4",activity:"M22 12h-4l-3 9L9 3l-3 9H2",
  alert:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",check:"M20 6L9 17l-5-5",x:"M18 6L6 18M6 6l12 12",search:"M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z",logout:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  file:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",qr:"M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 14h2v2h-2zM17 17v2h2M19 19h2v2h-2z",
  bell:"M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",phone:"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6 6l.9-1.4a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
  drop:"M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z",pill:"M10.5 20.5L3.5 13.5a5 5 0 0 1 7.07-7.07l7 7a5 5 0 0 1-7.07 7.07zM8.5 8.5l7 7",heart:"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  plus:"M12 5v14M5 12h14",upload:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",download:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  eye:"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",edit:"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  clock:"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",info:"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8h.01M12 12v4",
  chevron:"M9 18l6-6-6-6",id:"M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 19l4-4 2 2 4-4 6 6",
  send:"M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",brain:"M9.5 2a4 4 0 0 1 5 0M12 6v2M15 2.5C17.5 3.5 20 6 20 9.5c0 4-3.5 7-8 7s-8-3-8-7c0-3.5 2.5-6 5-7M9 14c0 2 1.3 3.5 3 4M15 14c0 2-1.3 3.5-3 4",
  zap:"M13 2L3 14h9l-1 8 10-12h-9l1-8z",
};
const Ic = ({ n, s=18, c="currentColor", style:st }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={st}>
    {(PATHS[n]||"").split("M").filter(Boolean).map((d,i) => <path key={i} d={"M"+d}/>)}
  </svg>
);

// ═══════════════════════════════════════════════════════════════════
//  RISK ALERT COMPONENTS
// ═══════════════════════════════════════════════════════════════════
const RISK_CONFIG = {
  HIGH:   { bg:"#fff1f0", border:"#ffa39e", headerBg:"#dc2626", label:"HIGH RISK", icon:"alert", textColor:"#dc2626" },
  MEDIUM: { bg:"#fffbe6", border:"#ffe58f", headerBg:"#d97706", label:"CAUTION",   icon:"alert", textColor:"#d97706" },
  SAFE:   { bg:"#f0fdf4", border:"#86efac", headerBg:"#059669", label:"SAFE",      icon:"check", textColor:"#059669" },
};

const RiskAlertCard = ({ alert }) => {
  const cfg = RISK_CONFIG[alert.level] || RISK_CONFIG.MEDIUM;
  return (
    <div style={{ background:cfg.bg, border:`1.5px solid ${cfg.border}`, borderRadius:12, overflow:"hidden", marginBottom:10, animation:"slideRight .3s ease" }}>
      <div style={{ background:cfg.headerBg, padding:"8px 14px", display:"flex", alignItems:"center", gap:8 }}>
        <Ic n={cfg.icon} s={14} c="white"/>
        <span style={{ color:"white", fontSize:11, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase" }}>{cfg.label} — {alert.title}</span>
        <span style={{ marginLeft:"auto", fontSize:10, color:"rgba(255,255,255,.7)", fontWeight:700, textTransform:"uppercase" }}>{alert.type.replace(/_/g," ")}</span>
      </div>
      <div style={{ padding:"12px 14px" }}>
        <p style={{ margin:"0 0 6px", fontSize:13.5, color:C.text, fontWeight:600, lineHeight:1.5 }}>{alert.body}</p>
        {alert.action && (
          <div style={{ display:"flex", alignItems:"flex-start", gap:6, background:"rgba(0,0,0,.04)", borderRadius:8, padding:"7px 10px", marginTop:6 }}>
            <Ic n="zap" s={13} c={cfg.textColor} style={{ flexShrink:0, marginTop:1 }}/>
            <span style={{ fontSize:12, color:C.textSub, fontWeight:600, lineHeight:1.5 }}><strong style={{ color:cfg.textColor }}>Recommended action:</strong> {alert.action}</span>
          </div>
        )}
        {alert.drug && <span style={{ display:"inline-block", marginTop:7, background:`${cfg.textColor}18`, color:cfg.textColor, borderRadius:6, padding:"2px 10px", fontSize:11, fontWeight:700, fontFamily:"'DM Mono',monospace" }}>Drug: {alert.drug}</span>}
      </div>
    </div>
  );
};

const RiskSummaryBanner = ({ alerts }) => {
  const level = overallRisk(alerts);
  const cfg   = RISK_CONFIG[level];
  const high  = alerts.filter(a=>a.level==="HIGH").length;
  const med   = alerts.filter(a=>a.level==="MEDIUM").length;
  if (level === "SAFE") return (
    <div style={{ background:cfg.bg, border:`1.5px solid ${cfg.border}`, borderRadius:12, padding:"13px 18px", display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
      <div style={{ width:36, height:36, borderRadius:"50%", background:"#059669", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Ic n="check" s={18} c="white"/></div>
      <div><p style={{ margin:0, fontSize:14, fontWeight:800, color:"#059669" }}>No risk conflicts detected</p><p style={{ margin:"2px 0 0", fontSize:12, color:C.muted }}>AI analysis: current medications and allergies show no critical interactions</p></div>
    </div>
  );
  return (
    <div style={{ background:level==="HIGH"?"#fff1f0":cfg.bg, border:`2px solid ${cfg.headerBg}`, borderRadius:12, padding:"13px 18px", display:"flex", alignItems:"center", gap:12, marginBottom:16, animation:level==="HIGH"?"alertPulse 2s ease infinite":undefined }}>
      <div style={{ width:40, height:40, borderRadius:"50%", background:cfg.headerBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Ic n="alert" s={20} c="white"/></div>
      <div style={{ flex:1 }}>
        <p style={{ margin:0, fontSize:15, fontWeight:800, color:cfg.headerBg }}>{level==="HIGH"?"⚠️ HIGH RISK PATIENT":"⚠️ Clinical Warnings Detected"}</p>
        <p style={{ margin:"2px 0 0", fontSize:12.5, color:C.muted }}>
          AI analysis: {high>0?`${high} critical allergy/drug conflict${high>1?"s":""}`:""}
          {med>0?`${high>0?", ":""}${med} condition warning${med>1?"s":""}`:""}
        </p>
      </div>
      <div style={{ background:cfg.headerBg, borderRadius:9, padding:"5px 12px" }}>
        <span style={{ color:"white", fontSize:12, fontWeight:800 }}>{alerts.length} alert{alerts.length>1?"s":""}</span>
      </div>
    </div>
  );
};

const DrugRiskChecker = ({ allergies, conditions, medications }) => {
  const [drug, setDrug]     = useState("");
  const [result, setResult] = useState(null);
  const [checked, setChecked] = useState(false);

  const check = () => {
    if (!drug.trim()) return;
    const r = analyzeRisks(allergies, conditions, [], drug);
    setResult(r);
    setChecked(true);
  };

  const level   = checked ? overallRisk(result) : null;
  const cfg     = level ? RISK_CONFIG[level] : null;

  return (
    <div style={{ background:"white", border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 20px", marginTop:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
        <div style={{ width:32, height:32, borderRadius:9, background:"#0a162812", display:"flex", alignItems:"center", justifyContent:"center" }}><Ic n="brain" s={15} c={C.navy}/></div>
        <div>
          <p style={{ margin:0, fontSize:13, fontWeight:800, color:C.text }}>Drug Risk Checker</p>
          <p style={{ margin:0, fontSize:11.5, color:C.muted }}>Enter a drug name to instantly check contraindications</p>
        </div>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <input value={drug} onChange={e=>{setDrug(e.target.value);setChecked(false);}} onKeyDown={e=>e.key==="Enter"&&check()}
          placeholder="e.g. amoxicillin, ibuprofen, prednisone…"
          style={{ flex:1, padding:"10px 14px", border:`1.5px solid ${C.border}`, borderRadius:9, fontSize:14, fontFamily:"'Plus Jakarta Sans',sans-serif", color:C.text }} />
        <button onClick={check} style={{ padding:"10px 18px", border:"none", borderRadius:9, background:`linear-gradient(135deg,${C.navy},${C.blueMid})`, color:"white", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", display:"flex", alignItems:"center", gap:7, whiteSpace:"nowrap" }}>
          <Ic n="zap" s={14} c="white"/> Analyze Risk
        </button>
      </div>

      {checked && (
        <div style={{ marginTop:14, animation:"fadeUp .3s ease" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:cfg.headerBg }}/>
            <span style={{ fontSize:12, fontWeight:800, color:cfg.textColor, textTransform:"uppercase", letterSpacing:"0.08em" }}>
              {level === "SAFE" ? `No conflicts found for "${drug}"` : `${result.length} risk${result.length>1?"s":""} detected for "${drug}"`}
            </span>
          </div>
          {result.length === 0
            ? <div style={{ background:RISK_CONFIG.SAFE.bg, border:`1px solid ${RISK_CONFIG.SAFE.border}`, borderRadius:10, padding:"12px 16px", display:"flex", gap:10 }}>
                <Ic n="check" s={16} c="#059669"/>
                <span style={{ fontSize:13, color:"#059669", fontWeight:600 }}>No allergy conflicts or condition contraindications found for this patient.</span>
              </div>
            : result.map((a,i) => <RiskAlertCard key={i} alert={a}/>)
          }
        </div>
      )}

      {/* Quick risk buttons */}
      <div style={{ marginTop:12, display:"flex", gap:6, flexWrap:"wrap" }}>
        <span style={{ fontSize:11, color:C.mutedLight, alignSelf:"center" }}>Quick check:</span>
        {["amoxicillin","ibuprofen","prednisone","aspirin","metformin"].map(d => (
          <button key={d} onClick={()=>{setDrug(d);setChecked(false);}} style={{ background:"#f1f5f9", border:`1px solid ${C.border}`, borderRadius:6, padding:"3px 10px", fontSize:11.5, cursor:"pointer", color:C.textSub, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600 }}>{d}</button>
        ))}
      </div>
    </div>
  );
};

const RiskAlertPanel = ({ patient, medRecord, showDrugChecker=true }) => {
  const allergies   = patient?.allergies   || [];
  const conditions  = patient?.chronicDiseases || [];
  const medications = medRecord?.medications || patient?.medications || [];
  const autoAlerts  = analyzeRisks(allergies, conditions, medications);

  return (
    <div style={{ marginBottom:20 }}>
      {/* AI header */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${C.navy},${C.blueMid})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Ic n="brain" s={17} c="white"/>
        </div>
        <div>
          <p style={{ margin:0, fontSize:13.5, fontWeight:800, color:C.text }}>AI Clinical Decision Support</p>
          <p style={{ margin:"1px 0 0", fontSize:11.5, color:C.muted }}>Automated drug-allergy & condition-contraindication analysis</p>
        </div>
        <div style={{ marginLeft:"auto", background:`${C.navy}12`, borderRadius:8, padding:"4px 12px" }}>
          <span style={{ fontSize:10.5, fontWeight:800, color:C.navy, textTransform:"uppercase", letterSpacing:"0.06em" }}>Live Analysis</span>
        </div>
      </div>

      <RiskSummaryBanner alerts={autoAlerts}/>

      {autoAlerts.length > 0 && (
        <div style={{ marginBottom:8 }}>
          {autoAlerts.map((a,i) => <RiskAlertCard key={i} alert={a}/>)}
        </div>
      )}

      {showDrugChecker && (
        <DrugRiskChecker allergies={allergies} conditions={conditions} medications={medications}/>
      )}
    </div>
  );
};

// ── Primitive UI ──────────────────────────────────────────────────
const Badge = ({ children, tone="blue", dot }) => {
  const m = { blue:[C.blueL,C.blueMid], green:[C.greenL,C.green], red:[C.redL,C.red], amber:[C.amberL,C.amber], purple:[C.purpleL,C.purple], gray:["#f1f5f9","#475569"] };
  const [bg,fg] = m[tone]||m.blue;
  return <span style={{ background:bg, color:fg, borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", display:"inline-flex", alignItems:"center", gap:5 }}>{dot&&<span style={{ width:6,height:6,borderRadius:"50%",background:fg,flexShrink:0 }}/>}{children}</span>;
};

const Card = ({ children, style:st, className }) => (
  <div className={`hover-lift ${className||""}`} style={{ background:"white", borderRadius:16, border:`1px solid ${C.border}`, boxShadow:"0 2px 12px rgba(0,0,0,.04)", ...st }}>{children}</div>
);

const Btn = ({ children, variant="primary", size="md", fullWidth, disabled, onClick, style:st }) => {
  const [p,setP] = useState(false);
  const sz = { sm:{padding:"7px 14px",fontSize:12}, md:{padding:"10px 20px",fontSize:13.5}, lg:{padding:"13px 28px",fontSize:15} };
  const v  = { primary:{background:`linear-gradient(135deg,${C.navy},${C.blueMid})`,color:"white",boxShadow:"0 4px 14px rgba(29,78,216,.3)"}, danger:{background:`linear-gradient(135deg,#b91c1c,${C.red})`,color:"white",boxShadow:"0 4px 14px rgba(220,38,38,.3)"}, success:{background:`linear-gradient(135deg,#047857,${C.green})`,color:"white",boxShadow:"0 4px 14px rgba(5,150,105,.25)"}, ghost:{background:"#f1f5f9",color:"#475569",boxShadow:"none"} };
  return <button disabled={disabled} onClick={onClick} onMouseDown={()=>setP(true)} onMouseUp={()=>setP(false)} onMouseLeave={()=>setP(false)} style={{ border:"none", borderRadius:9, fontWeight:700, cursor:disabled?"not-allowed":"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7, transition:"all .18s", width:fullWidth?"100%":undefined, opacity:disabled?.55:1, transform:p?"scale(.97)":"scale(1)", fontFamily:"'Plus Jakarta Sans',sans-serif", ...sz[size], ...v[variant], ...st }}>{children}</button>;
};

const Field = ({ label, error, children, required }) => (
  <div style={{ marginBottom:16 }}>
    {label&&<label style={{ display:"block",fontSize:12.5,fontWeight:700,color:"#374151",marginBottom:5 }}>{label}{required&&<span style={{ color:C.red }}> *</span>}</label>}
    {children}
    {error&&<p style={{ marginTop:5,fontSize:11.5,color:C.red,fontWeight:600 }}>{error}</p>}
  </div>
);

const Input = ({ label, error, required, ...p }) => <Field label={label} error={error} required={required}><input {...p} style={{ width:"100%",padding:"10px 13px",border:`1.5px solid ${error?C.red:C.border}`,borderRadius:9,fontSize:14,color:C.text,background:"white",fontFamily:"'Plus Jakarta Sans',sans-serif",...p.style }}/></Field>;
const Sel = ({ label, error, required, children, ...p }) => <Field label={label} error={error} required={required}><select {...p} style={{ width:"100%",padding:"10px 13px",border:`1.5px solid ${error?C.red:C.border}`,borderRadius:9,fontSize:14,color:C.text,background:"white",fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{children}</select></Field>;

const PageHdr = ({ title, sub, action }) => (
  <div className="fade-up" style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24,gap:12,flexWrap:"wrap" }}>
    <div>
      <h1 style={{ fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:C.text,margin:0,letterSpacing:"-.02em" }}>{title}</h1>
      {sub&&<p style={{ margin:"5px 0 0",color:C.muted,fontSize:13.5,lineHeight:1.5 }}>{sub}</p>}
    </div>
    {action&&<div style={{ flexShrink:0 }}>{action}</div>}
  </div>
);

// ── Charts ────────────────────────────────────────────────────────
const Sparkline = ({ data, color="#2563eb", height=40, width=100 }) => {
  if (!data||data.length<2) return null;
  const min=Math.min(...data),max=Math.max(...data),range=max-min||1;
  const pts=data.map((v,i)=>`${((i/(data.length-1))*width).toFixed(1)},${(height-((v-min)/range)*(height-8)-4).toFixed(1)}`);
  const lp=pts[pts.length-1].split(",");
  return <svg width={width} height={height} style={{ overflow:"visible",display:"block" }}><defs><linearGradient id={`sg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".2"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs><polygon points={`0,${height} ${pts.join(" ")} ${width},${height}`} fill={`url(#sg${color.replace("#","")})`}/><polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx={lp[0]} cy={lp[1]} r="3" fill={color} stroke="white" strokeWidth="1.5"/></svg>;
};

const ProgressBar = ({ label, value, max, color="#2563eb" }) => (
  <div style={{ marginBottom:13 }}>
    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}><span style={{ fontSize:12.5,fontWeight:600,color:C.textSub }}>{label}</span><span style={{ fontSize:11.5,fontWeight:700,color,fontFamily:"'DM Mono',monospace" }}>{value}/{max}</span></div>
    <div style={{ height:5,background:"#f1f5f9",borderRadius:10,overflow:"hidden" }}><div style={{ height:"100%",width:`${Math.min((value/max)*100,100)}%`,background:color,borderRadius:10,transition:"width .6s ease" }}/></div>
  </div>
);

const Stat = ({ label, value, icon, accent="#2563eb", sub, trend, spark, delay=0 }) => (
  <div className={`fade-up-${delay}`} style={{ background:"white",borderRadius:14,border:`1px solid ${C.border}`,padding:"18px 20px",position:"relative",overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,.04)" }}>
    <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${accent},${accent}66)`,borderRadius:"14px 14px 0 0" }}/>
    <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10 }}>
      <div style={{ width:38,height:38,borderRadius:10,background:`${accent}12`,display:"flex",alignItems:"center",justifyContent:"center",color:accent }}>{icon}</div>
      {trend!==undefined&&<span style={{ fontSize:11,fontWeight:800,color:trend>=0?C.green:C.red,background:trend>=0?C.greenL:C.redL,padding:"2px 8px",borderRadius:6 }}>{trend>=0?"↑":"↓"} {Math.abs(trend)}%</span>}
    </div>
    <p style={{ margin:"0 0 2px",fontSize:10.5,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.09em" }}>{label}</p>
    <p style={{ margin:0,fontSize:28,fontWeight:900,color:C.text,lineHeight:1.1,fontFamily:"'DM Mono',monospace" }}>{value}</p>
    {sub&&<p style={{ margin:"4px 0 0",fontSize:12,color:C.mutedLight }}>{sub}</p>}
    {spark&&<div style={{ marginTop:10 }}><Sparkline data={spark} color={accent} width={100} height={34}/></div>}
  </div>
);

const FeedItem = ({ icon, color="#2563eb", title, sub, time }) => (
  <div style={{ display:"flex",gap:11,alignItems:"flex-start",padding:"10px 0",borderBottom:`1px solid ${C.border}` }}>
    <div style={{ width:32,height:32,borderRadius:8,background:`${color}12`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Ic n={icon} s={14} c={color}/></div>
    <div style={{ flex:1,minWidth:0 }}><p style={{ margin:0,fontSize:12.5,fontWeight:700,color:C.text }}>{title}</p><p style={{ margin:"2px 0 0",fontSize:11.5,color:C.muted }}>{sub}</p></div>
    <span style={{ fontSize:11,color:C.mutedLight,whiteSpace:"nowrap" }}>{time}</span>
  </div>
);

// ── BioScanner ────────────────────────────────────────────────────
const BioScanner = ({ label="Biometric", onSuccess, onCancel, compact }) => {
  const [phase, setPhase] = useState("idle");
  const [pct,   setPct]   = useState(0);
  const timerRef    = useRef(null);
  const callbackRef = useRef(onSuccess);
  const didFireRef  = useRef(false);
  useEffect(()=>{ callbackRef.current=onSuccess; },[onSuccess]);
  useEffect(()=>{
    if (phase==="success"&&!didFireRef.current) {
      didFireRef.current=true;
      const t=setTimeout(()=>{ callbackRef.current?.(); },600);
      return ()=>clearTimeout(t);
    }
  },[phase]);
  const start = () => {
    didFireRef.current=false; setPhase("scanning"); setPct(0);
    let p=0;
    timerRef.current=setInterval(()=>{ p+=Math.random()*18+4; setPct(Math.min(p,100)); if(p>=100){ clearInterval(timerRef.current); setPhase("verifying"); setTimeout(()=>setPhase("success"),900); } },120);
  };
  useEffect(()=>()=>clearInterval(timerRef.current),[]);
  const color=phase==="success"?"#10b981":phase==="failed"?"#ef4444":phase==="scanning"||phase==="verifying"?"#2563eb":"#1e3a5f";
  return (
    <div style={{ background:"#f8fafc",borderRadius:16,border:`1px solid ${C.border}`,padding:compact?"20px":"32px 24px",display:"flex",flexDirection:"column",alignItems:"center",gap:18 }}>
      {!compact&&<p style={{ margin:0,fontSize:12,fontWeight:700,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase" }}>{label} — Biometric Verification</p>}
      <div style={{ position:"relative",width:compact?110:140,height:compact?110:140 }}>
        {(phase==="scanning"||phase==="verifying")&&[1,2,3].map(i=>(
          <div key={i} style={{ position:"absolute",top:"50%",left:"50%",width:80+i*22,height:80+i*22,borderRadius:"50%",border:`1.5px solid ${color}`,opacity:.35-i*.08,transform:"translate(-50%,-50%)",animation:"ripple 1.8s ease-out infinite",animationDelay:`${i*.35}s`,pointerEvents:"none" }}/>
        ))}
        <div onClick={phase==="idle"?start:undefined} style={{ width:"100%",height:"100%",borderRadius:"50%",cursor:phase==="idle"?"pointer":"default",background:phase==="success"?"linear-gradient(135deg,#10b981,#059669)":phase==="failed"?"linear-gradient(135deg,#ef4444,#dc2626)":phase==="scanning"||phase==="verifying"?`linear-gradient(135deg,#1d4ed8,${C.blueMid})`:"linear-gradient(135deg,#1e3a5f,#2d5a8e)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .4s",animation:phase==="scanning"?"glow 1.5s ease-in-out infinite":"none",boxShadow:`0 0 30px ${color}35` }}>
          {phase==="success"?<Ic n="check" s={compact?30:48} c="white"/>:phase==="failed"?<Ic n="x" s={compact?30:48} c="white"/>:<Ic n="fp" s={compact?30:48} c="white"/>}
        </div>
        {phase==="scanning"&&<div style={{ position:"absolute",left:4,right:4,height:2,background:`${color}80`,borderRadius:2,animation:"scanLine 1.2s ease-in-out infinite",pointerEvents:"none" }}/>}
      </div>
      {phase==="scanning"&&<div style={{ width:"100%",maxWidth:260 }}><div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}><span style={{ fontSize:11,fontWeight:700,color:"#2563eb",letterSpacing:"0.08em" }}>SCANNING</span><span style={{ fontSize:11,color:"#2563eb",fontFamily:"'DM Mono',monospace" }}>{Math.round(pct)}%</span></div><div style={{ height:5,background:"#dbeafe",borderRadius:10,overflow:"hidden" }}><div style={{ height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#2563eb,#1d4ed8)",transition:"width .12s",borderRadius:10 }}/></div></div>}
      {phase==="verifying"&&<p style={{ color:"#6366f1",fontSize:13,fontWeight:700,margin:0,animation:"pulse 1s infinite" }}>Verifying identity…</p>}
      {phase==="success"&&<p style={{ color:"#10b981",fontSize:13,fontWeight:800,margin:0 }}>✓ Identity Verified</p>}
      {phase==="idle"&&<div style={{ textAlign:"center" }}>{!compact&&<p style={{ color:C.muted,fontSize:13,marginBottom:12 }}>Place finger on sensor to begin</p>}<Btn size="sm" onClick={start} style={{ background:`linear-gradient(135deg,${C.navy},${C.blueMid})` }}><Ic n="fp" s={14} c="white"/> Begin Scan</Btn></div>}
      {onCancel&&phase==="idle"&&<button onClick={onCancel} style={{ background:"none",border:"none",color:"#94a3b8",fontSize:12,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Cancel</button>}
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, width=480 }) => {
  if (!open) return null;
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{ position:"fixed",inset:0,background:"rgba(15,31,61,.55)",backdropFilter:"blur(6px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn .2s ease" }}>
      <div style={{ background:"white",borderRadius:18,width:"100%",maxWidth:width,maxHeight:"90vh",overflow:"auto",boxShadow:"0 30px 100px rgba(0,0,0,.25)",animation:"fadeUp .25s ease" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px",borderBottom:`1px solid ${C.border}` }}>
          <h3 style={{ margin:0,fontSize:17,fontWeight:800,color:C.text }}>{title}</h3>
          <button onClick={onClose} style={{ background:"#f1f5f9",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.muted }}><Ic n="x" s={15}/></button>
        </div>
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  );
};

// ── Toast ─────────────────────────────────────────────────────────
const Toast = ({ msg, type="success", onDone }) => {
  useEffect(()=>{ const t=setTimeout(onDone,3200); return ()=>clearTimeout(t); },[]);
  const cfg={success:{bg:"#dcfce7",border:"#86efac",color:"#166534",icon:"check"},error:{bg:"#fee2e2",border:"#fca5a5",color:"#991b1b",icon:"alert"},info:{bg:"#dbeafe",border:"#93c5fd",color:"#1e40af",icon:"info"}};
  const {bg,border,color,icon}=cfg[type]||cfg.info;
  return <div style={{ position:"fixed",bottom:28,right:28,zIndex:2000,background:bg,border:`1.5px solid ${border}`,borderRadius:12,padding:"13px 18px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 8px 30px rgba(0,0,0,.12)",animation:"fadeUp .3s ease",maxWidth:340 }}><Ic n={icon} s={18} c={color}/><span style={{ fontSize:13,fontWeight:700,color }}>{msg}</span></div>;
};

// ── Audit table ───────────────────────────────────────────────────
const AuditTable = ({ logs }) => (
  <div style={{ background:"white",borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden" }}>
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12.5 }}>
        <thead><tr style={{ background:"#f8fafc",borderBottom:`1px solid ${C.border}` }}>
          {["Timestamp","Officer","Role","Patient LID","Hospital","Action","Status"].map(h=><th key={h} style={{ padding:"11px 16px",textAlign:"left",fontSize:10.5,fontWeight:800,color:C.muted,textTransform:"uppercase",letterSpacing:"0.08em",whiteSpace:"nowrap" }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {logs.map((l,i)=>(
            <tr key={l.id} style={{ borderBottom:`1px solid ${C.border}`,background:i%2===0?"white":"#fafafa" }}>
              <td style={{ padding:"11px 16px",color:C.muted,fontFamily:"'DM Mono',monospace",fontSize:11.5,whiteSpace:"nowrap" }}>{l.time}</td>
              <td style={{ padding:"11px 16px" }}><div style={{ fontWeight:700,color:C.text,fontSize:13 }}>{l.userName}</div><div style={{ fontSize:11,color:C.mutedLight,fontFamily:"'DM Mono',monospace" }}>{l.userId}</div></td>
              <td style={{ padding:"11px 16px" }}><Badge tone={l.role==="Doctor"?"blue":l.role==="Records Officer"?"green":l.role==="Patient"?"red":"purple"}>{l.role}</Badge></td>
              <td style={{ padding:"11px 16px",fontFamily:"'DM Mono',monospace",fontSize:12,color:C.blueMid,fontWeight:600 }}>{l.patientLid}</td>
              <td style={{ padding:"11px 16px",fontSize:12,color:C.textSub }}>{l.hospitalName}</td>
              <td style={{ padding:"11px 16px",fontWeight:600,color:C.text }}>{l.action}</td>
              <td style={{ padding:"11px 16px" }}><Badge tone={l.status==="Authorized"?"green":"red"} dot>{l.status}</Badge></td>
            </tr>
          ))}
          {logs.length===0&&<tr><td colSpan={7} style={{ padding:"36px",textAlign:"center",color:C.mutedLight,fontSize:13 }}>No records found</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
);

// ── Sidebar ───────────────────────────────────────────────────────
const MENUS = {
  admin:   [{icon:"activity",label:"Overview",page:"overview"},{icon:"hospital",label:"Hospitals",page:"hospitals"},{icon:"users",label:"Users",page:"users"},{icon:"file",label:"Audit Logs",page:"logs"}],
  doctor:  [{icon:"activity",label:"Dashboard",page:"overview"},{icon:"alert",label:"Emergency Access",page:"emergency"},{icon:"bell",label:"Notifications",page:"notif"}],
  records: [{icon:"activity",label:"Dashboard",page:"overview"},{icon:"plus",label:"Register Patient",page:"register"},{icon:"search",label:"Search Records",page:"search"},{icon:"edit",label:"Update Records",page:"update"}],
  patient: [{icon:"id",label:"My Profile",page:"overview"},{icon:"lock",label:"Medical Records",page:"medical"},{icon:"qr",label:"LifeID Card",page:"qrcard"},{icon:"clock",label:"Access History",page:"history"},{icon:"phone",label:"Update Contact",page:"contact"}],
};
const ROLE_LABELS = {admin:"System Admin",doctor:"Medical Officer",records:"Records Officer",patient:"Patient"};
const ROLE_COLORS = {admin:"#7c3aed",doctor:"#2563eb",records:"#059669",patient:"#dc2626"};
const ROLE_GRADS  = {admin:"linear-gradient(135deg,#7c3aed,#6d28d9)",doctor:"linear-gradient(135deg,#2563eb,#1d4ed8)",records:"linear-gradient(135deg,#059669,#047857)",patient:"linear-gradient(135deg,#dc2626,#b91c1c)"};

const Sidebar = ({ user, page, onNav }) => {
  const items=MENUS[user.role]||[], accent=ROLE_COLORS[user.role];
  return (
    <aside style={{ width:248,background:C.sidebar,display:"flex",flexDirection:"column",height:"100vh",position:"sticky",top:0,flexShrink:0,borderRight:"1px solid rgba(255,255,255,.06)" }}>
      <div style={{ padding:"24px 20px 16px" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:20 }}>
          <div style={{ width:36,height:36,background:"linear-gradient(135deg,#ef4444,#dc2626)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 12px rgba(239,68,68,.4)" }}><Ic n="shield" s={18} c="white"/></div>
          <div><span style={{ color:"white",fontSize:19,fontWeight:900,letterSpacing:"-.03em" }}>Life<span style={{ color:"#ef4444" }}>ID</span></span><div style={{ fontSize:9,color:"rgba(255,255,255,.3)",letterSpacing:"0.14em",fontWeight:700,textTransform:"uppercase",marginTop:1 }}>NHA INDIA</div></div>
        </div>
        <div style={{ background:"rgba(255,255,255,.05)",borderRadius:12,padding:"12px 14px",border:"1px solid rgba(255,255,255,.07)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:ROLE_GRADS[user.role],display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:"white",flexShrink:0 }}>{user.avatar}</div>
            <div style={{ minWidth:0 }}>
              <p style={{ color:"white",fontSize:13,fontWeight:700,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user.name}</p>
              <div style={{ display:"flex",alignItems:"center",gap:5,marginTop:3 }}>
                <div style={{ width:5,height:5,borderRadius:"50%",background:accent }}/>
                <p style={{ color:accent,fontSize:10.5,margin:0,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em" }}>{ROLE_LABELS[user.role]}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding:"4px 12px",flex:1,overflowY:"auto" }}>
        <p style={{ fontSize:9.5,fontWeight:800,color:"rgba(255,255,255,.2)",textTransform:"uppercase",letterSpacing:"0.14em",padding:"8px 8px 6px",margin:0 }}>Navigation</p>
        {items.map(item=>{ const active=page===item.page; return (
          <button key={item.page} onClick={()=>onNav(item.page)} style={{ width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,border:"none",cursor:"pointer",marginBottom:2,fontWeight:600,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",textAlign:"left",transition:"all .15s",background:active?`${accent}22`:"transparent",color:active?"white":"rgba(255,255,255,.45)",borderLeft:active?`2.5px solid ${accent}`:"2.5px solid transparent" }}>
            <Ic n={item.icon} s={15} c={active?accent:"rgba(255,255,255,.3)"}/>{item.label}
            {active&&<div style={{ marginLeft:"auto",width:5,height:5,borderRadius:"50%",background:accent }}/>}
          </button>
        );})}
      </div>
      <div style={{ padding:"12px",borderTop:"1px solid rgba(255,255,255,.06)" }}>
        <button onClick={()=>onNav("logout")} style={{ width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,border:"none",background:"rgba(239,68,68,.08)",color:"#f87171",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Plus Jakarta Sans',sans-serif" }}><Ic n="logout" s={15} c="#f87171"/> Sign Out</button>
        <p style={{ textAlign:"center",color:"rgba(255,255,255,.12)",fontSize:9.5,marginTop:10,letterSpacing:"0.1em" }}>LifeID v2.1 · NHA INDIA</p>
      </div>
    </aside>
  );
};

const Shell = ({ user, page, onNav, children }) => {
  const accent=ROLE_COLORS[user.role];
  const pageLabel=[...Object.values(MENUS)].flat().find(m=>m.page===page)?.label||"Dashboard";
  return (
    <div style={{ display:"flex",minHeight:"100vh",background:"#f1f5f9" }}>
      <Sidebar user={user} page={page} onNav={onNav}/>
      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
        <header style={{ height:56,background:"white",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",flexShrink:0,position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 3px rgba(0,0,0,.04)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}><span style={{ fontSize:12,color:C.muted }}>LifeID</span><Ic n="chevron" s={13} c={C.muted}/><span style={{ fontSize:13,fontWeight:700,color:C.text }}>{pageLabel}</span></div>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ display:"flex",alignItems:"center",gap:6,background:"#f8fafc",borderRadius:8,padding:"5px 12px",border:`1px solid ${C.border}` }}><div style={{ width:7,height:7,borderRadius:"50%",background:C.green }}/><span style={{ fontSize:11.5,fontWeight:700,color:C.textSub }}>System Online</span></div>
            <div style={{ width:32,height:32,borderRadius:9,background:`${accent}15`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,color:accent }}>{user.avatar}</div>
          </div>
        </header>
        <main style={{ flex:1,overflow:"auto",padding:"28px" }}>{children}</main>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  PAGES
// ═══════════════════════════════════════════════════════════════════

// ── Landing ────────────────────────────────────────────────────────
const Landing = ({ onNav }) => (
  <div style={{ minHeight:"100vh",background:C.navy,fontFamily:"'Plus Jakarta Sans',sans-serif",overflowX:"hidden" }}>
    <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0 }}>
      <div style={{ position:"absolute",top:"-20%",left:"60%",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(37,99,235,.18) 0%,transparent 70%)" }}/>
      <div style={{ position:"absolute",top:"40%",left:"-10%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,237,.12) 0%,transparent 70%)" }}/>
    </div>
    <div style={{ position:"relative",zIndex:1 }}>
      <nav style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 60px",borderBottom:"1px solid rgba(255,255,255,.06)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:38,height:38,background:"linear-gradient(135deg,#ef4444,#dc2626)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(239,68,68,.4)" }}><Ic n="shield" s={19} c="white"/></div>
          <span style={{ color:"white",fontSize:22,fontWeight:900,fontFamily:"'Sora',sans-serif",letterSpacing:"-.03em" }}>Life<span style={{ color:"#ef4444" }}>ID</span></span>
        </div>
        <button onClick={()=>onNav("login")} style={{ background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.14)",borderRadius:9,padding:"9px 20px",color:"white",fontWeight:700,fontSize:13.5,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Sign In →</button>
      </nav>
      <div style={{ textAlign:"center",padding:"96px 20px 72px",animation:"fadeUp .7s ease" }}>
        <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.25)",borderRadius:100,padding:"6px 18px",marginBottom:32 }}>
          <span style={{ width:6,height:6,borderRadius:"50%",background:"#ef4444",display:"block",animation:"pulse 1.5s infinite" }}/>
          <span style={{ color:"#fca5a5",fontSize:11.5,fontWeight:700,letterSpacing:"0.12em" }}>NATIONAL HEALTH AUTHORITY · GOVERNMENT OF INDIA</span>
        </div>
        <h1 style={{ color:"white",fontSize:"clamp(36px,5.5vw,68px)",fontWeight:900,lineHeight:1.05,margin:"0 auto 24px",maxWidth:860,fontFamily:"'Sora',sans-serif",letterSpacing:"-.03em" }}>
          Your Medical Identity,<br/><span style={{ background:"linear-gradient(135deg,#ef4444,#f87171)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Secured by Biology</span>
        </h1>
        <p style={{ color:"rgba(255,255,255,.5)",fontSize:17,maxWidth:560,margin:"0 auto 40px",lineHeight:1.8 }}>Biometric-protected emergency medical records with AI-powered clinical decision support. Protecting lives while protecting privacy.</p>
        <div style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:60 }}>
          <button onClick={()=>onNav("login")} style={{ background:"linear-gradient(135deg,#ef4444,#dc2626)",border:"none",borderRadius:11,padding:"14px 32px",fontSize:15.5,fontWeight:800,color:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:9,fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:"0 8px 32px rgba(239,68,68,.45)" }}><Ic n="shield" s={18} c="white"/> Access Portal</button>
        </div>
        {/* New AI feature callout */}
        <div style={{ maxWidth:700,margin:"0 auto",background:"rgba(37,99,235,.12)",border:"1px solid rgba(37,99,235,.25)",borderRadius:16,padding:"20px 24px",display:"flex",gap:16,alignItems:"flex-start" }}>
          <div style={{ width:44,height:44,borderRadius:12,background:"rgba(37,99,235,.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Ic n="brain" s={22} c="#60a5fa"/></div>
          <div style={{ textAlign:"left" }}>
            <p style={{ color:"#93c5fd",fontWeight:800,fontSize:14,margin:"0 0 4px" }}>NEW — AI Clinical Decision Support</p>
            <p style={{ color:"rgba(255,255,255,.5)",fontSize:13,margin:0,lineHeight:1.65 }}>Real-time drug-allergy conflict detection, condition contraindication alerts, and medication safety analysis during every emergency access and record review.</p>
          </div>
        </div>
      </div>
      {/* Stats */}
      <div style={{ display:"flex",justifyContent:"center",gap:0,flexWrap:"wrap",maxWidth:860,margin:"0 auto 72px",background:"rgba(255,255,255,.04)",borderRadius:16,border:"1px solid rgba(255,255,255,.07)",overflow:"hidden" }}>
        {[["1.2 Cr+","Registered Patients","#3b82f6"],["47","Partner Hospitals","#34d399"],["99.97%","Uptime SLA","#a78bfa"],["0","Data Breaches","#f87171"]].map(([v,l,c],i)=>(
          <div key={l} style={{ flex:1,minWidth:160,textAlign:"center",padding:"24px 20px",borderRight:i<3?"1px solid rgba(255,255,255,.07)":"none" }}>
            <div style={{ color:c,fontSize:28,fontWeight:900,fontFamily:"'DM Mono',monospace",marginBottom:4 }}>{v}</div>
            <div style={{ color:"rgba(255,255,255,.35)",fontSize:12.5,fontWeight:600 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ borderTop:"1px solid rgba(255,255,255,.06)",padding:"22px 60px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <span style={{ color:"rgba(255,255,255,.2)",fontSize:12 }}>© 2025 National Health Authority, Government of India</span>
        <div style={{ display:"flex",gap:6 }}><div style={{ width:6,height:6,borderRadius:"50%",background:"#34d399" }}/><span style={{ color:"rgba(255,255,255,.3)",fontSize:12 }}>All systems operational</span></div>
      </div>
    </div>
  </div>
);

// ── Login ──────────────────────────────────────────────────────────
const Login = ({ onLogin, onNav }) => {
  const [email,setEmail]=useState(""); const [pw,setPw]=useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false); const [active,setActive]=useState(null);
  const authenticate = async (nextEmail, nextPassword, role) => {
    setErr("");
    setLoading(true);

    try {
      const payload = await loginWithBackend(nextEmail, nextPassword);
      if (!payload?.user || !payload?.token) {
        throw new Error("Login response missing token or user data");
      }

      setActive(role || payload.user.role || null);
      saveAuthToken(payload.token);
      onLogin(payload.user, payload.token);
    } catch (error) {
      setErr(error.message || "Invalid credentials.");
      setLoading(false);
    }
  };
  const quick = role => { const u=USERS[role]; setActive(role); setEmail(u.email); setPw(u.password); authenticate(u.email, u.password, role); };
  const submit = () => authenticate(email, pw);
  const roles=[{key:"admin",label:"System Admin",color:"#7c3aed",icon:"shield"},{key:"doctor",label:"Medical Officer",color:"#2563eb",icon:"activity"},{key:"records",label:"Records Officer",color:"#059669",icon:"file"},{key:"patient",label:"Patient",color:"#dc2626",icon:"id"}];
  return (
    <div style={{ minHeight:"100vh",display:"grid",gridTemplateColumns:"1fr 1fr",fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ background:`linear-gradient(160deg,${C.navy},#1a3060)`,display:"flex",flexDirection:"column",justifyContent:"center",padding:"60px 64px",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:-100,right:-100,width:400,height:400,borderRadius:"50%",background:"rgba(37,99,235,.1)" }}/>
        <div style={{ position:"relative" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:52 }}>
            <div style={{ width:42,height:42,background:"linear-gradient(135deg,#ef4444,#dc2626)",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 6px 18px rgba(239,68,68,.4)" }}><Ic n="shield" s={20} c="white"/></div>
            <span style={{ color:"white",fontSize:24,fontWeight:900,fontFamily:"'Sora',sans-serif" }}>Life<span style={{ color:"#ef4444" }}>ID</span></span>
          </div>
          <h2 style={{ color:"white",fontSize:36,fontWeight:900,margin:"0 0 12px",lineHeight:1.15,fontFamily:"'Sora',sans-serif" }}>Secure Health<br/>Identity Portal</h2>
          <p style={{ color:"rgba(255,255,255,.45)",fontSize:15,lineHeight:1.8,maxWidth:340,marginBottom:32 }}>Every access verified, logged, and audited. AI-powered clinical decision support on every emergency access.</p>
          {/* AI feature highlight */}
          <div style={{ background:"rgba(37,99,235,.15)",border:"1px solid rgba(37,99,235,.3)",borderRadius:12,padding:"14px 16px",marginBottom:24 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}><Ic n="brain" s={15} c="#60a5fa"/><span style={{ color:"#93c5fd",fontSize:12,fontWeight:800 }}>AI RISK ALERT SYSTEM</span></div>
            <p style={{ color:"rgba(255,255,255,.5)",fontSize:12,margin:0,lineHeight:1.6 }}>Automatically detects drug-allergy conflicts, condition contraindications, and medication safety issues during emergency access.</p>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {[["fp","Dual biometric auth","#3b82f6"],["brain","AI clinical decision support","#a78bfa"],["lock","Default data lock","#34d399"],["eye","Full audit trail","#fb923c"]].map(([ic,t,c])=>(
              <div key={t} style={{ display:"flex",alignItems:"center",gap:10 }}><div style={{ width:28,height:28,background:`${c}18`,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${c}28` }}><Ic n={ic} s={13} c={c}/></div><span style={{ color:"rgba(255,255,255,.55)",fontSize:13.5 }}>{t}</span></div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"center",background:"#f1f5f9",padding:40 }}>
        <div style={{ width:"100%",maxWidth:420,animation:"fadeUp .45s ease" }}>
          <button onClick={()=>onNav("landing")} style={{ background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,marginBottom:30,display:"flex",alignItems:"center",gap:5,fontFamily:"'Plus Jakarta Sans',sans-serif",padding:0 }}>← Back to home</button>
          <h2 style={{ fontSize:25,fontWeight:900,color:C.text,margin:"0 0 4px",fontFamily:"'Sora',sans-serif" }}>Sign In</h2>
          <p style={{ color:C.muted,fontSize:14,margin:"0 0 26px" }}>Access your LifeID dashboard</p>
          {err&&<div style={{ background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"11px 14px",marginBottom:16,color:"#dc2626",fontSize:13,display:"flex",alignItems:"center",gap:8,fontWeight:600 }}><Ic n="alert" s={16} c="#dc2626"/>{err}</div>}
          <div style={{ marginBottom:13 }}><label style={{ display:"block",fontSize:12.5,fontWeight:700,color:"#374151",marginBottom:5 }}>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@lifeid.gov.in" style={{ width:"100%",padding:"11px 13px",border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:14,color:C.text,background:"white",fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",boxSizing:"border-box" }}/></div>
          <div style={{ marginBottom:20 }}><label style={{ display:"block",fontSize:12.5,fontWeight:700,color:"#374151",marginBottom:5 }}>Password</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="••••••••" style={{ width:"100%",padding:"11px 13px",border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:14,color:C.text,background:"white",fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",boxSizing:"border-box" }}/></div>
          <button disabled={loading} onClick={submit} style={{ width:"100%",padding:"13px",border:"none",borderRadius:10,background:`linear-gradient(135deg,${C.navy},${C.blueMid})`,color:"white",fontWeight:800,fontSize:15,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"'Plus Jakarta Sans',sans-serif",opacity:loading?.75:1,boxShadow:"0 4px 16px rgba(29,78,216,.3)" }}>
            {loading?<><span style={{ width:16,height:16,border:"2px solid rgba(255,255,255,.35)",borderTopColor:"white",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite" }}/> Authenticating…</>:<><Ic n="lock" s={16} c="white"/> Secure Sign In</>}
          </button>
          <div style={{ display:"flex",alignItems:"center",gap:10,margin:"20px 0 13px" }}><div style={{ flex:1,height:1,background:C.border }}/><span style={{ fontSize:11,color:C.mutedLight,fontWeight:700,letterSpacing:"0.08em" }}>QUICK DEMO ACCESS</span><div style={{ flex:1,height:1,background:C.border }}/></div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
            {roles.map(r=>(
              <button key={r.key} onClick={()=>quick(r.key)} style={{ padding:"11px 12px",border:`1.5px solid ${active===r.key?r.color:C.border}`,borderRadius:10,background:active===r.key?`${r.color}08`:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:9,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                <div style={{ width:28,height:28,borderRadius:7,background:`${r.color}14`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Ic n={r.icon} s={13} c={r.color}/></div>
                <span style={{ fontSize:12.5,fontWeight:700,color:active===r.key?r.color:C.textSub }}>{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Admin ──────────────────────────────────────────────────────────
const AdminOverview = () => {
  const spark=[980,1120,1050,1340,1200,1580,1760,1900,2143];
  return (
    <div>
      <PageHdr title="Platform Overview" sub={`National Health Authority · ${new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}`}/>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20 }}>
        <Stat label="Registered Patients" value="12,40,291" icon={<Ic n="users" s={20}/>} accent="#2563eb" sub="+2,143 this month" trend={12} spark={spark} delay={1}/>
        <Stat label="Partner Hospitals"   value="47"         icon={<Ic n="hospital" s={20}/>} accent="#059669" sub="3 pending" trend={6} delay={2}/>
        <Stat label="Active Officers"     value="1,284"      icon={<Ic n="user" s={20}/>} accent="#7c3aed" sub="Doctors + Records" trend={3} delay={3}/>
        <Stat label="Risk Alerts Fired"   value="847"        icon={<Ic n="brain" s={20}/>} accent="#dc2626" sub="Last 30 days (AI)" trend={-4} delay={4}/>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 320px",gap:14,marginBottom:20 }}>
        <div style={{ background:"white",borderRadius:14,border:`1px solid ${C.border}`,padding:"20px 22px" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18 }}>
            <div><h3 style={{ margin:0,fontSize:14,fontWeight:800,color:C.text }}>Hospital Capacity</h3><p style={{ margin:"3px 0 0",fontSize:12,color:C.muted }}>Active officers vs allocated slots</p></div>
            <span style={{ fontSize:11,fontWeight:700,color:C.green,background:C.greenL,padding:"3px 10px",borderRadius:6 }}>Live</span>
          </div>
          {[{label:"AIIMS New Delhi",officers:142,cap:180},{label:"PGI Chandigarh",officers:98,cap:120},{label:"NIMHANS Bengaluru",officers:76,cap:100},{label:"SGPGI Lucknow",officers:54,cap:80}].map(h=><ProgressBar key={h.label} label={h.label} value={h.officers} max={h.cap} color={C.blueMid}/>)}
        </div>
        <div style={{ background:"white",borderRadius:14,border:`1px solid ${C.border}`,padding:"20px 22px" }}>
          <h3 style={{ margin:"0 0 14px",fontSize:14,fontWeight:800,color:C.text }}>Recent Activity</h3>
          {AUDIT_LOGS.slice(0,4).map(l=><FeedItem key={l.id} icon={l.action.includes("Emergency")?"alert":l.action.includes("Update")?"edit":"eye"} color={l.action.includes("Emergency")?C.red:l.action.includes("Update")?C.purple:C.blueMid} title={l.action} sub={`${l.userName} · ${l.patientLid}`} time={l.time.split(" ")[1]||""}/>)}
        </div>
      </div>
    </div>
  );
};

const AdminHospitals = ({ toast }) => {
  const [hospitals,setHospitals]=useState(HOSPITALS);
  const approve = id=>{ setHospitals(h=>h.map(x=>x.id===id?{...x,status:"approved"}:x)); toast("Hospital approved","success"); };
  const reject  = id=>{ setHospitals(h=>h.filter(x=>x.id!==id)); toast("Hospital rejected","error"); };
  return (
    <div>
      <PageHdr title="Hospital Management" sub="Review and manage partner hospitals" action={<Btn size="sm"><Ic n="plus" s={14} c="white"/> Add Hospital</Btn>}/>
      <div style={{ display:"grid",gap:14 }}>
        {hospitals.map(h=>(
          <Card key={h.id} style={{ padding:"17px 22px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap" }}>
            <div style={{ width:44,height:44,background:C.blueL,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",color:C.blueMid,flexShrink:0 }}><Ic n="hospital" s={22}/></div>
            <div style={{ flex:1,minWidth:200 }}>
              <div style={{ display:"flex",alignItems:"center",gap:9,marginBottom:4 }}><span style={{ fontWeight:800,fontSize:15,color:C.text }}>{h.name}</span><Badge tone={h.status==="approved"?"green":"amber"} dot>{h.status}</Badge></div>
              <p style={{ margin:0,fontSize:12.5,color:C.muted }}>{h.location} · {h.officers} officers</p>
            </div>
            {h.status==="pending"&&<div style={{ display:"flex",gap:8 }}><Btn variant="success" size="sm" onClick={()=>approve(h.id)}><Ic n="check" s={13} c="white"/> Approve</Btn><Btn variant="danger" size="sm" onClick={()=>reject(h.id)}><Ic n="x" s={13} c="white"/> Reject</Btn></div>}
          </Card>
        ))}
      </div>
    </div>
  );
};

const AdminUsers = () => (
  <div>
    <PageHdr title="User Management" sub="Officers, admins, and system users" action={<Btn size="sm"><Ic n="plus" s={14} c="white"/> Add User</Btn>}/>
    <div style={{ display:"grid",gap:12 }}>
      {Object.values(USERS).map(u=>(
        <Card key={u.id} style={{ padding:"14px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap" }}>
          <div style={{ width:42,height:42,borderRadius:"50%",background:`${ROLE_COLORS[u.role]}20`,display:"flex",alignItems:"center",justifyContent:"center",color:ROLE_COLORS[u.role],fontWeight:800,fontSize:14,flexShrink:0 }}>{u.avatar}</div>
          <div style={{ flex:1 }}><p style={{ margin:0,fontWeight:800,color:C.text,fontSize:14 }}>{u.name}</p><p style={{ margin:"3px 0 0",fontSize:12,color:C.muted,fontFamily:"'DM Mono',monospace" }}>{u.email} · {u.id}</p></div>
          <Badge tone={u.role==="admin"?"purple":u.role==="doctor"?"blue":u.role==="records"?"green":"red"}>{ROLE_LABELS[u.role]}</Badge>
          <Btn variant="ghost" size="sm">Manage</Btn>
        </Card>
      ))}
    </div>
  </div>
);

const AdminLogs = () => {
  const [q,setQ]=useState("");
  const filtered=AUDIT_LOGS.filter(l=>l.userName.toLowerCase().includes(q.toLowerCase())||l.action.toLowerCase().includes(q.toLowerCase())||l.patientLid.includes(q));
  return (
    <div>
      <PageHdr title="Audit Logs" sub="Complete system access history"/>
      <Card style={{ padding:"14px 18px",marginBottom:16,display:"flex",gap:12,alignItems:"center" }}>
        <Ic n="search" s={17} c="#94a3b8"/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by officer, action, patient LID…" style={{ flex:1,border:"none",fontSize:14,outline:"none",color:C.text,fontFamily:"'Plus Jakarta Sans',sans-serif" }}/>
        <Badge tone="gray">{filtered.length} records</Badge>
      </Card>
      <AuditTable logs={filtered}/>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  EMERGENCY ACCESS — backend-backed minimal payload
// ═══════════════════════════════════════════════════════════════════
const EmergencyAccess = ({ user }) => {
  const [step, setStep] = useState("doc-bio");
  const [notified, setNotified] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [lifeId, setLifeId] = useState(PATIENTS[0].lifeId);
  const [token, setToken] = useState(() => getSavedEmergencyAccessToken());
  const [accessState, setAccessState] = useState({ loading: false, error: "", data: null });
  const patient = PATIENTS.find((entry) => entry.lifeId === lifeId.trim()) || PATIENTS[0];
  const medRecord = { medications: patient.medications };
  const autoAlerts = analyzeRisks(patient.allergies, patient.chronicDiseases, patient.medications);
  const level = overallRisk(autoAlerts);
  const steps = ["Doctor Auth", "Patient Scan", "Live Backend Response"];
  const stepIdx = { "doc-bio": 0, "pat-bio": 1, results: 2 }[step] ?? 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("lifeid.emergency.token", token);
  }, [token]);

  useEffect(() => {
    setAccessState({ loading: false, error: "", data: null });
    setNotified(false);
    setAcknowledged(false);
  }, [lifeId]);

  const handleFetchEmergencyAccess = async () => {
    if (!lifeId.trim()) {
      setAccessState({ loading: false, error: "Enter a valid LifeID before requesting emergency access.", data: null });
      return;
    }

    setAccessState({ loading: true, error: "", data: null });

    try {
      const payload = await submitEmergencyAccess({
        lifeId: lifeId.trim(),
        officerBiometric: { valid: true },
        patientBiometric: { valid: true },
        token: token.trim(),
      });

      setAccessState({ loading: false, error: "", data: payload });
    } catch (error) {
      setAccessState({ loading: false, error: error.message || "Emergency access request failed", data: null });
    }
  };

  return (
    <div>
      <div style={{ background:"linear-gradient(135deg,#7f1d1d,#991b1b)",borderRadius:13,padding:"14px 20px",marginBottom:22,display:"flex",alignItems:"center",gap:12 }}>
        <span style={{ width:8,height:8,borderRadius:"50%",background:"#fca5a5",display:"block",animation:"pulse 1s infinite",flexShrink:0 }}/>
        <div><p style={{ margin:0,fontSize:13.5,fontWeight:800,color:"white" }}>🚨 Emergency Patient Access — All actions permanently logged</p><p style={{ margin:"2px 0 0",fontSize:12,color:"rgba(255,255,255,.5)" }}>Officer: {user.name} · {user.hospital} · {new Date().toLocaleString("en-IN")}</p></div>
      </div>
      <div style={{ display:"flex",alignItems:"center",marginBottom:26,background:"white",borderRadius:12,padding:"14px 20px",border:`1px solid ${C.border}` }}>
        {steps.map((s,i)=>{ const active=i===stepIdx,done=i<stepIdx; return (
          <div key={s} style={{ display:"flex",alignItems:"center",flex:i<2?"1":"none" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <div style={{ width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,background:done?"#059669":active?"#dc2626":"#f1f5f9",color:done||active?"white":C.muted,flexShrink:0 }}>{done?<Ic n="check" s={13} c="white"/>:i+1}</div>
              <span style={{ fontSize:12.5,fontWeight:700,color:active?C.text:C.muted,whiteSpace:"nowrap" }}>{s}</span>
            </div>
            {i<2&&<div style={{ flex:1,height:2,background:done?"#86efac":"#f1f5f9",margin:"0 14px",transition:"background .4s" }}/>
            }
          </div>
        );})}
      </div>

      <div style={{ display:step==="doc-bio"?"block":"none" }}>
        <div style={{ maxWidth:520,margin:"0 auto" }}>
          <div style={{ background:"white",borderRadius:14,border:`1px solid ${C.border}`,padding:28 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:20 }}>
              <span style={{ width:7,height:7,borderRadius:"50%",background:"#ef4444",animation:"pulse 1s infinite",display:"block" }}/>
              <span style={{ fontSize:11.5,fontWeight:800,color:"#dc2626",textTransform:"uppercase",letterSpacing:"0.1em" }}>Step 1 — Officer Biometric</span>
            </div>
            <BioScanner label={`Officer: ${user.name}`} onSuccess={()=>setStep("pat-bio")}/>
          </div>
        </div>
      </div>
      <div style={{ display:step==="pat-bio"?"block":"none" }}>
        <div style={{ maxWidth:520,margin:"0 auto" }}>
          <div style={{ background:"white",borderRadius:14,border:`1px solid ${C.border}`,padding:28 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:20 }}>
              <span style={{ width:7,height:7,borderRadius:"50%",background:"#f59e0b",animation:"pulse 1s infinite",display:"block" }}/>
              <span style={{ fontSize:11.5,fontWeight:800,color:"#d97706",textTransform:"uppercase",letterSpacing:"0.1em" }}>Step 2 — Patient Biometric</span>
            </div>
            <BioScanner label="Patient — place finger on sensor" onSuccess={()=>setStep("results")}/>
          </div>
        </div>
      </div>

      {step==="results" && (
        <div className="fade-up">
          <div style={{ background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:12,padding:"12px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:10 }}>
            <Ic n="check" s={18} c="#16a34a"/>
            <span style={{ color:"#15803d",fontWeight:800,fontSize:14 }}>Dual Biometric Authorized — {patient.name} · <span style={{ fontFamily:"'DM Mono',monospace" }}>{patient.lifeId}</span></span>
            <span style={{ marginLeft:"auto",fontSize:11,color:"#16a34a",fontFamily:"'DM Mono',monospace" }}>{new Date().toLocaleString("en-IN")}</span>
          </div>

          <div style={{ background:"white",borderRadius:14,border:`2px solid ${level==="HIGH"?C.red:level==="MEDIUM"?C.amber:C.green}`,padding:"20px 22px",marginBottom:20 }}>
            <RiskAlertPanel patient={patient} medRecord={medRecord} showDrugChecker={true}/>
            {level==="HIGH" && !acknowledged && (
              <div style={{ background:"#fff1f0",border:"1.5px solid #ffa39e",borderRadius:10,padding:"14px 18px",display:"flex",alignItems:"center",gap:12,marginTop:8 }}>
                <Ic n="alert" s={20} c="#dc2626"/>
                <div style={{ flex:1 }}>
                  <p style={{ margin:0,fontSize:13,fontWeight:800,color:"#dc2626" }}>Acknowledgement required</p>
                  <p style={{ margin:"3px 0 0",fontSize:12,color:C.muted }}>You must acknowledge the high-risk alerts before viewing patient data.</p>
                </div>
                <button onClick={()=>setAcknowledged(true)} style={{ padding:"9px 16px",border:"none",borderRadius:9,background:"#dc2626",color:"white",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",whiteSpace:"nowrap" }}>I Acknowledge</button>
              </div>
            )}
            {(level!=="HIGH"||acknowledged) && (
              <div style={{ display:"flex",alignItems:"center",gap:8,background:C.greenL,borderRadius:8,padding:"8px 12px" }}>
                <Ic n="check" s={14} c={C.green}/>
                <span style={{ fontSize:12.5,fontWeight:700,color:C.green }}>Risk analysis complete — proceeding to patient data</span>
              </div>
            )}
          </div>

          <div style={{ background:"white",borderRadius:14,border:`1px solid ${C.border}`,padding:"18px 20px",marginBottom:16 }}>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12 }}>
              <label style={{ display:"grid",gap:6 }}>
                <span style={{ fontSize:12,fontWeight:800,color:C.text }}>Patient LifeID</span>
                <input value={lifeId} onChange={(event) => setLifeId(event.target.value)} style={{ width:"100%",border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 12px",fontSize:14,color:C.text,fontFamily:"'Plus Jakarta Sans',sans-serif" }} />
              </label>
              <label style={{ display:"grid",gap:6 }}>
                <span style={{ fontSize:12,fontWeight:800,color:C.text }}>Bearer token</span>
                <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Required for backend auth" style={{ width:"100%",border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 12px",fontSize:14,color:C.text,fontFamily:"'Plus Jakarta Sans',sans-serif" }} />
              </label>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginTop:16,flexWrap:"wrap" }}>
              <button onClick={handleFetchEmergencyAccess} disabled={accessState.loading} style={{ background:C.red,border:"none",borderRadius:10,padding:"11px 18px",color:"white",fontWeight:800,fontSize:13.5,cursor:accessState.loading?"wait":"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{accessState.loading ? "Requesting..." : "Fetch Emergency Record"}</button>
              <span style={{ fontSize:12.5,color:C.muted }}>Calls {getEmergencyAccessBaseUrl()}/patients/{lifeId.trim() || "..."}/emergency-access</span>
            </div>
            {accessState.error && <div style={{ marginTop:14,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"10px 12px",color:"#b91c1c",fontSize:13,fontWeight:600 }}>{accessState.error}</div>}
          </div>

          {(level !== "HIGH" || acknowledged) && (
            <div>
              {accessState.data ? (
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:14,marginBottom:16 }}>
                  <div style={{ background:"#fef2f2",border:"1.5px solid #fecaca",borderRadius:14,padding:22 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}><div style={{ width:34,height:34,background:"white",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center" }}><Ic n="user" s={17} c="#dc2626"/></div><span style={{ fontWeight:800,color:C.text,fontSize:14 }}>Patient Info</span></div>
                    <p style={{ margin:"0 0 8px",fontSize:18,fontWeight:900,color:C.text }}>{accessState.data.patient_info?.name || patient.name}</p>
                    <p style={{ margin:"0 0 4px",fontSize:13,color:C.muted }}>Age: {accessState.data.patient_info?.age ?? "—"}</p>
                    <p style={{ margin:0,fontSize:13,color:C.muted }}>Gender: {accessState.data.patient_info?.gender ?? "—"}</p>
                  </div>
                  <div style={{ background:"#fffbeb",border:"1.5px solid #fde68a",borderRadius:14,padding:22 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}><div style={{ width:34,height:34,background:"white",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center" }}><Ic n="alert" s={17} c="#d97706"/></div><span style={{ fontWeight:800,color:C.text,fontSize:14 }}>Critical Data</span></div>
                    <p style={{ margin:"0 0 8px",fontSize:13,color:C.textSub,display:"flex",justifyContent:"space-between",gap:10 }}><strong>Blood Group</strong><span>{accessState.data.critical_data?.blood_group || "—"}</span></p>
                    <p style={{ margin:"0 0 8px",fontSize:13,color:C.textSub }}><strong>Allergies</strong></p>
                    <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:10 }}>
                      {(accessState.data.critical_data?.allergies || []).length > 0
                        ? accessState.data.critical_data.allergies.map((allergy) => <span key={allergy} style={{ background:C.amberL,borderRadius:6,padding:"3px 9px",fontSize:12.5,fontWeight:700,color:"#92400e" }}>{allergy}</span>)
                        : <span style={{ color:C.muted,fontSize:13 }}>None recorded</span>}
                    </div>
                    <p style={{ margin:"0 0 8px",fontSize:13,color:C.textSub }}><strong>Conditions</strong></p>
                    <div style={{ display:"grid",gap:4 }}>
                      {(accessState.data.critical_data?.conditions || []).length > 0
                        ? accessState.data.critical_data.conditions.map((condition) => <p key={condition} style={{ margin:0,fontSize:13,color:C.muted }}>• {condition}</p>)
                        : <p style={{ margin:0,fontSize:13,color:C.muted }}>None recorded</p>}
                    </div>
                  </div>
                  <div style={{ background:"#ecfdf5",border:"1.5px solid #a7f3d0",borderRadius:14,padding:22 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}><div style={{ width:34,height:34,background:"white",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center" }}><Ic n="phone" s={17} c="#059669"/></div><span style={{ fontWeight:800,color:C.text,fontSize:14 }}>Emergency Contact</span></div>
                    <p style={{ margin:0,fontSize:18,fontWeight:900,color:C.text,fontFamily:"'DM Mono',monospace" }}>{accessState.data.emergency_contact || "—"}</p>
                    <p style={{ margin:"10px 0 0",fontSize:13,color:C.muted }}>Only the minimum emergency payload is rendered.</p>
                  </div>
                </div>
              ) : (
                <div style={{ background:"#f8fafc",border:"1px dashed #cbd5e1",borderRadius:14,padding:"16px 18px",marginBottom:16 }}>
                  <p style={{ margin:0,fontSize:13.5,color:C.muted }}>Request the backend emergency record to reveal the minimal patient payload.</p>
                </div>
              )}
              {notified && <div style={{ display:"flex",alignItems:"center",gap:8,color:"#16a34a",fontWeight:800,fontSize:14,marginBottom:12 }}><Ic n="check" s={18} c="#16a34a"/> Notification flagged locally at {new Date().toLocaleTimeString("en-IN")}</div>}
              <button onClick={()=>{setStep("doc-bio");setNotified(false);setAcknowledged(false);}} style={{ background:"#f1f5f9",border:"none",borderRadius:9,padding:"9px 18px",fontSize:13,fontWeight:700,color:C.textSub,cursor:"pointer",display:"flex",alignItems:"center",gap:7,fontFamily:"'Plus Jakarta Sans',sans-serif" }}><Ic n="x" s={14}/> End Session</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Doctor overview ────────────────────────────────────────────────
const DoctorOverview = ({ user }) => (
  <div>
    <div style={{ background:`linear-gradient(135deg,${C.navy},#162d52)`,borderRadius:16,padding:"24px 28px",marginBottom:20,position:"relative",overflow:"hidden" }}>
      <div style={{ position:"absolute",top:-30,right:-30,width:180,height:180,borderRadius:"50%",background:"rgba(59,130,246,.08)" }}/>
      <p style={{ margin:"0 0 6px",fontSize:12,color:"rgba(255,255,255,.4)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em" }}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</p>
      <h2 style={{ margin:"0 0 4px",fontSize:22,fontWeight:900,color:"white",fontFamily:"'Sora',sans-serif" }}>Good day, {user.name}</h2>
      <p style={{ margin:"0 0 18px",fontSize:13.5,color:"rgba(255,255,255,.5)" }}>{user.hospital} · Medical Officer · AI Clinical Decision Support Active</p>
      <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
        <div style={{ background:"rgba(255,255,255,.08)",borderRadius:9,padding:"8px 14px",border:"1px solid rgba(255,255,255,.1)" }}><span style={{ fontSize:11,color:"rgba(255,255,255,.5)",fontWeight:700 }}>OFFICER ID</span><p style={{ margin:"2px 0 0",fontSize:13,color:"white",fontFamily:"'DM Mono',monospace",fontWeight:700 }}>{user.id}</p></div>
        <div style={{ background:"rgba(255,255,255,.08)",borderRadius:9,padding:"8px 14px",border:"1px solid rgba(255,255,255,.1)" }}><span style={{ fontSize:11,color:"rgba(255,255,255,.5)",fontWeight:700 }}>AI ALERTS TODAY</span><p style={{ margin:"2px 0 0",fontSize:13,color:"#f87171",fontFamily:"'DM Mono',monospace",fontWeight:700 }}>12 conflicts detected</p></div>
        <div style={{ background:"rgba(74,222,128,.15)",borderRadius:9,padding:"8px 14px",border:"1px solid rgba(74,222,128,.2)" }}><span style={{ fontSize:11.5,color:"#4ade80",fontWeight:700 }}>● On Duty</span></div>
      </div>
    </div>
    <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20 }}>
      <Stat label="Emergency Accesses Today" value="7"  icon={<Ic n="alert" s={20}/>} accent={C.red}   sub="2 critical, 5 routine" trend={-15} delay={1}/>
      <Stat label="AI Risk Alerts Triggered" value="12" icon={<Ic n="brain" s={20}/>} accent="#7c3aed" sub="5 HIGH, 7 MEDIUM" trend={8} delay={2}/>
      <Stat label="Patients Seen"           value="34" icon={<Ic n="users" s={20}/>} accent={C.blue}  sub="This week" delay={3}/>
    </div>
    <Card style={{ padding:"20px 22px" }}>
      <h3 style={{ margin:"0 0 6px",fontSize:14,fontWeight:800,color:C.text }}>Emergency Access with AI Risk Analysis</h3>
      <p style={{ margin:"0 0 16px",fontSize:13,color:C.muted }}>Biometric-gated access automatically runs clinical risk analysis on patient data</p>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10 }}>
        {[["HIGH RISK — Allergy Conflict","Penicillin allergy × Amoxicillin on record","#dc2626",C.redL],["MEDIUM — Condition Warning","NSAIDs prescribed for hypertensive patient","#d97706",C.amberL],["SAFE — No Conflicts","No drug-allergy interactions detected","#059669",C.greenL]].map(([t,d,c,bg])=>(
          <div key={t} style={{ background:bg,borderRadius:11,padding:"14px 16px" }}>
            <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:6 }}><Ic n="brain" s={13} c={c}/><span style={{ fontSize:10.5,fontWeight:800,color:c,textTransform:"uppercase",letterSpacing:"0.07em" }}>Example</span></div>
            <p style={{ margin:"0 0 3px",fontSize:12.5,fontWeight:700,color:C.text }}>{t}</p>
            <p style={{ margin:0,fontSize:11.5,color:C.muted }}>{d}</p>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const DoctorNotifications = () => {
  const [filter, setFilter] = useState("all");
  const notifications = [
    {
      id: "N001",
      severity: "high",
      title: "Critical allergy conflict",
      message: "Arjun Sharma: Penicillin allergy conflict detected with current medication list.",
      time: "2 min ago",
      action: "Review patient medications",
      icon: "alert",
    },
    {
      id: "N002",
      severity: "medium",
      title: "Condition contraindication",
      message: "Rahul Verma: NSAID warning for Coronary Artery Disease.",
      time: "11 min ago",
      action: "Open risk panel",
      icon: "brain",
    },
    {
      id: "N003",
      severity: "info",
      title: "Emergency access completed",
      message: "Emergency session for LID-IN-2024-00291 closed and logged.",
      time: "29 min ago",
      action: "View audit log",
      icon: "check",
    },
    {
      id: "N004",
      severity: "info",
      title: "Family notified",
      message: "Emergency contact was notified successfully for active case.",
      time: "46 min ago",
      action: "Open communication history",
      icon: "send",
    },
  ];

  const tone = {
    high: { bg: C.redL, border: "#fecaca", fg: C.red, label: "High" },
    medium: { bg: C.amberL, border: "#fde68a", fg: C.amber, label: "Medium" },
    info: { bg: C.blueL, border: "#bfdbfe", fg: C.blueMid, label: "Info" },
  };

  const list = notifications.filter((n) => filter === "all" || n.severity === filter);

  return (
    <div>
      <PageHdr
        title="Doctor Notifications"
        sub="Clinical alerts, emergency updates, and AI risk events"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant={filter === "all" ? "primary" : "ghost"} size="sm" onClick={() => setFilter("all")}>All</Btn>
            <Btn variant={filter === "high" ? "primary" : "ghost"} size="sm" onClick={() => setFilter("high")}>High</Btn>
            <Btn variant={filter === "medium" ? "primary" : "ghost"} size="sm" onClick={() => setFilter("medium")}>Medium</Btn>
            <Btn variant={filter === "info" ? "primary" : "ghost"} size="sm" onClick={() => setFilter("info")}>Info</Btn>
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
        <Stat label="Total Alerts" value={String(notifications.length)} icon={<Ic n="bell" s={20}/>} accent={C.blueMid} delay={1}/>
        <Stat label="High Priority" value={String(notifications.filter(n => n.severity === "high").length)} icon={<Ic n="alert" s={20}/>} accent={C.red} delay={2}/>
        <Stat label="AI Clinical" value={String(notifications.filter(n => n.icon === "brain").length)} icon={<Ic n="brain" s={20}/>} accent={C.purple} delay={3}/>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {list.map((n) => {
          const t = tone[n.severity];
          return (
            <Card key={n.id} style={{ padding: "16px 18px", borderColor: t.border, background: "white" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Ic n={n.icon} s={17} c={t.fg}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.text }}>{n.title}</p>
                    <Badge tone={n.severity === "high" ? "red" : n.severity === "medium" ? "amber" : "blue"}>{t.label}</Badge>
                  </div>
                  <p style={{ margin: "0 0 7px", fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>{n.message}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11.5, color: C.mutedLight, fontFamily: "'DM Mono',monospace" }}>{n.time}</span>
                    <Btn size="sm" variant="ghost">{n.action}</Btn>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  RECORDS PAGES — FIXED WORKFLOW
// ═══════════════════════════════════════════════════════════════════
const RecordsOverview = ({ user }) => (
  <div>
    <PageHdr title={`Welcome, ${user.name}`} sub={`Records Officer · ${user.hospital}`}/>
    <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20 }}>
      <Stat label="Patients Registered" value="4,201" icon={<Ic n="users" s={20}/>} accent={C.green}  sub="This year" trend={18} delay={1}/>
      <Stat label="Records Updated"     value="387"   icon={<Ic n="file" s={20}/>}  accent={C.blue}   sub="This month" trend={7} delay={2}/>
      <Stat label="Risk Alerts Cleared" value="94"    icon={<Ic n="brain" s={20}/>} accent={C.purple} sub="This week" trend={12} delay={3}/>
    </div>
    <div style={{ background:"white",borderRadius:14,border:`1px solid ${C.border}`,padding:"20px 22px" }}>
      <h3 style={{ margin:"0 0 16px",fontSize:14,fontWeight:800,color:C.text }}>Recently Registered Patients</h3>
      {PATIENTS.map(p=>{
        const autoAlerts=analyzeRisks(p.allergies,p.chronicDiseases,p.medications);
        const lvl=overallRisk(autoAlerts);
        return (
          <div key={p.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.border}` }}>
            <div style={{ width:36,height:36,borderRadius:10,background:C.blueL,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:C.blueMid,fontSize:14,flexShrink:0 }}>{p.name[0]}</div>
            <div style={{ flex:1 }}><p style={{ margin:0,fontSize:13.5,fontWeight:700,color:C.text }}>{p.name}</p><p style={{ margin:"2px 0 0",fontSize:11.5,color:C.muted,fontFamily:"'DM Mono',monospace" }}>{p.lifeId} · {p.gender}</p></div>
            <Badge tone="red">{p.bloodGroup}</Badge>
            {autoAlerts.length>0 && <div style={{ display:"flex",alignItems:"center",gap:5,background:lvl==="HIGH"?C.redL:C.amberL,borderRadius:7,padding:"3px 9px" }}><Ic n="brain" s={12} c={lvl==="HIGH"?C.red:C.amber}/><span style={{ fontSize:11,fontWeight:700,color:lvl==="HIGH"?C.red:C.amber }}>{autoAlerts.length} AI alert{autoAlerts.length>1?"s":""}</span></div>}
          </div>
        );
      })}
    </div>
  </div>
);

const PatientRegistration = ({ toast }) => {
  const [step,setStep]=useState("bio");
  const [form,setForm]=useState({ name:"",dob:"",gender:"Male",phone:"",bloodGroup:"O+",allergies:"",emergencyContact:"",address:"" });
  const [ferr,setFerr]=useState({});
  const [registrationState,setRegistrationState]=useState({ loading:false, error:"", message:"" });
  const generateLifeId = () => "LID-IN-2025-"+String(10000+Math.floor(Math.random()*90000));
  const lifeId=useRef("LID-IN-2025-"+String(10000+Math.floor(Math.random()*90000)));
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const validateForm=()=>{
    const e={};
    if(!form.name.trim())e.name="Full name required";
    if(!form.dob)e.dob="Date of birth required";
    if(!validateIndianPhone(form.phone))e.phone="Enter valid Indian phone: +91 XXXXXXXXXX";
    if(!validateIndianPhone(form.emergencyContact))e.emergencyContact="Enter valid Indian phone: +91 XXXXXXXXXX";
    if(!form.address.trim())e.address="Address required";
    setFerr(e); return Object.keys(e).length===0;
  };
  const registerPatientInBackend = async () => {
    const token = getSavedAuthToken();
    if (!token) {
      setRegistrationState({ loading: false, error: "Your session expired. Please login again.", message: "" });
      return;
    }

    setRegistrationState({ loading: true, error: "", message: "" });

    try {
      const allergies = form.allergies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const response = await fetch(`${getApiBaseUrl()}/records/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          officerBiometric: { valid: true },
          lifeId: lifeId.current,
          name: form.name,
          dateOfBirth: form.dob,
          gender: form.gender,
          bloodGroup: form.bloodGroup,
          emergencyContact: form.emergencyContact,
          medicalData: {
            allergies,
            conditions: [],
            diagnoses: [],
            medications: [],
            notes: `Phone: ${form.phone}. Address: ${form.address}`,
          },
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || "Patient registration failed");
      }

      setRegistrationState({ loading: false, error: "", message: payload?.message || "Patient registered successfully" });
      setStep("complete");
      toast("Patient registered successfully", "success");
    } catch (error) {
      setRegistrationState({ loading: false, error: error.message || "Patient registration failed", message: "" });
    }
  };

  const resetRegistration = () => {
    lifeId.current = generateLifeId();
    setForm({ name:"",dob:"",gender:"Male",phone:"",bloodGroup:"O+",allergies:"",emergencyContact:"",address:"" });
    setFerr({});
    setRegistrationState({ loading:false, error:"", message:"" });
    setStep("bio");
  };

  const steps=["Verify Officer","Patient Details","Capture Biometric","Complete"];
  const si=step==="bio"?0:step==="form"?1:step==="capture"?2:3;
  return (
    <div>
      <PageHdr title="Register New Patient" sub="Officer biometric required · stored in backend record system"/>
      <div style={{ display:"flex",alignItems:"center",marginBottom:28 }} className="fade-up">
        {steps.map((s,i)=>{ const done=i<si,active=i===si; return (
          <div key={s} style={{ display:"flex",alignItems:"center",flex:i<3?"1":"none" }}>
            <div style={{ display:"flex",alignItems:"center",gap:7 }}>
              <div style={{ width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,background:done?"#059669":active?C.blueMid:"#e2e8f0",color:done||active?"white":"#94a3b8" }}>{done?<Ic n="check" s={12} c="white"/>:i+1}</div>
              <span style={{ fontSize:12,fontWeight:700,color:active?C.text:C.muted,whiteSpace:"nowrap" }}>{s}</span>
            </div>
            {i<3&&<div style={{ flex:1,height:2,background:done?"#86efac":C.border,margin:"0 12px" }}/>}
          </div>
        );})}
      </div>
      {step==="bio"&&<div style={{ maxWidth:520,margin:"0 auto" }} className="fade-up-1"><Card style={{ padding:28 }}><BioScanner label="Records Officer Verification" onSuccess={()=>setStep("form")}/></Card></div>}
      {step==="form"&&(
        <Card style={{ padding:28 }} className="fade-up-1">
          <h3 style={{ margin:"0 0 22px",fontSize:16,fontWeight:800,color:C.text }}>Patient Information</h3>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 22px" }}>
            <Input label="Full Name" value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Patient full name" error={ferr.name} required/>
            <Input label="Date of Birth" type="date" value={form.dob} onChange={e=>set("dob",e.target.value)} error={ferr.dob} required/>
            <Sel label="Gender" value={form.gender} onChange={e=>set("gender",e.target.value)}><option>Male</option><option>Female</option><option>Other</option></Sel>
            <Sel label="Blood Group" value={form.bloodGroup} onChange={e=>set("bloodGroup",e.target.value)}>{["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(b=><option key={b}>{b}</option>)}</Sel>
            <Input label="Phone (+91 format)" value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+91 9876543210" error={ferr.phone} required/>
            <Input label="Emergency Contact (+91)" value={form.emergencyContact} onChange={e=>set("emergencyContact",e.target.value)} placeholder="+91 9876543210" error={ferr.emergencyContact} required/>
          </div>
          <Input label="Known Allergies (comma-separated)" value={form.allergies} onChange={e=>set("allergies",e.target.value)} placeholder="e.g. Penicillin, NSAIDs, Latex"/>
          <Input label="Residential Address" value={form.address} onChange={e=>set("address",e.target.value)} placeholder="Street, City, State, PIN" error={ferr.address} required/>
          <div style={{ display:"flex",gap:10,justifyContent:"flex-end",marginTop:8 }}><Btn variant="ghost" onClick={()=>setStep("bio")}>Back</Btn><Btn onClick={()=>{ if(validateForm()) setStep("capture"); }}><Ic n="fp" s={15} c="white"/> Next: Capture Biometric</Btn></div>
        </Card>
      )}
      {step==="capture"&&<div style={{ maxWidth:520,margin:"0 auto" }} className="fade-up-1"><Card style={{ padding:28 }}><BioScanner label="Patient Fingerprint Capture" onSuccess={registerPatientInBackend}/>{registrationState.loading&&<p style={{ marginTop:12,fontSize:12.5,color:C.blueMid,fontWeight:700 }}>Saving patient record in backend...</p>}{registrationState.error&&<p style={{ marginTop:12,fontSize:12.5,color:C.red,fontWeight:700 }}>{registrationState.error}</p>}</Card></div>}
      {step==="complete"&&(
        <div style={{ maxWidth:520,margin:"0 auto",textAlign:"center" }} className="fade-up-1">
          <Card style={{ padding:40,borderColor:"#86efac",borderWidth:2 }}>
            <div style={{ width:64,height:64,background:C.greenL,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px" }}><Ic n="check" s={30} c="#059669"/></div>
            <h3 style={{ margin:"0 0 10px",fontSize:22,fontWeight:900,color:C.text }}>Patient Registered Successfully</h3>
            <p style={{ color:C.muted,fontSize:14,marginBottom:24 }}>{registrationState.message || "Biometrics captured and patient record stored in backend."}</p>
            <div style={{ background:"#f8fafc",borderRadius:12,padding:"16px 24px",marginBottom:24 }}>
              <p style={{ margin:"0 0 4px",fontSize:11,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.1em" }}>LifeID Number</p>
              <p style={{ margin:0,fontSize:22,fontWeight:900,color:C.navy,fontFamily:"'DM Mono',monospace" }}>{lifeId.current}</p>
            </div>
            <div style={{ display:"flex",gap:10,justifyContent:"center" }}><Btn><Ic n="qr" s={16} c="white"/> Download QR Card</Btn><Btn variant="ghost" onClick={resetRegistration}>Register Another</Btn></div>
          </Card>
        </div>
      )}
    </div>
  );
};

const RecordSearch = () => {
  const [q,setQ]=useState("");
  const filtered=PATIENTS.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())||p.lifeId.includes(q)||p.phone.includes(q));
  return (
    <div>
      <PageHdr title="Patient Search" sub="Search by name, LifeID, or phone number"/>
      <Card style={{ padding:"14px 18px",marginBottom:18,display:"flex",gap:12,alignItems:"center" }}>
        <Ic n="search" s={17} c="#94a3b8"/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…" style={{ flex:1,border:"none",fontSize:14,outline:"none",color:C.text,fontFamily:"'Plus Jakarta Sans',sans-serif" }}/>
      </Card>
      <div style={{ display:"grid",gap:12 }}>
        {filtered.map(p=>{ const alerts=analyzeRisks(p.allergies,p.chronicDiseases,p.medications); const lvl=overallRisk(alerts); return (
          <Card key={p.id} style={{ padding:"16px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap" }}>
            <div style={{ width:44,height:44,borderRadius:"50%",background:C.blueL,display:"flex",alignItems:"center",justifyContent:"center",color:C.blueMid,fontWeight:800 }}>{p.name[0]}</div>
            <div style={{ flex:1 }}><p style={{ margin:0,fontWeight:800,color:C.text,fontSize:15 }}>{p.name}</p><p style={{ margin:"3px 0 0",fontSize:12,color:C.muted,fontFamily:"'DM Mono',monospace" }}>{p.lifeId} · {p.phone}</p></div>
            <Badge tone="red">{p.bloodGroup}</Badge>
            {alerts.length>0&&<div style={{ display:"flex",alignItems:"center",gap:5,background:lvl==="HIGH"?C.redL:C.amberL,borderRadius:7,padding:"4px 10px" }}><Ic n="brain" s={12} c={lvl==="HIGH"?C.red:C.amber}/><span style={{ fontSize:11,fontWeight:700,color:lvl==="HIGH"?C.red:C.amber }}>{lvl} RISK</span></div>}
            <Btn variant="ghost" size="sm"><Ic n="eye" s={13}/> View</Btn>
          </Card>
        );})}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  RECORD UPDATE — FIXED WORKFLOW + AI RISK PANEL
// ═══════════════════════════════════════════════════════════════════
const SaveBar = ({ onSave, label="Save Changes" }) => {
  const [status,setStatus]=useState("idle");
  const [saveError, setSaveError] = useState("");
  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (status === "saving") return;

    setStatus("saving");
    setSaveError("");

    try {
      await onSave?.();
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2800);
    } catch (error) {
      setStatus("idle");
      setSaveError(error?.message || "Save failed");
      setTimeout(() => setSaveError(""), 3200);
    }
  };
  return (
    <div style={{ display:"flex",alignItems:"center",gap:14,marginTop:22,paddingTop:18,borderTop:`1px solid ${C.border}` }}>
      <button type="button" disabled={status==="saving"} onClick={handleClick} style={{ minWidth:180,padding:"11px 22px",border:"none",borderRadius:9,background:status==="saving"?"#6ee7b7":"linear-gradient(135deg,#047857,#059669)",color:"white",fontWeight:700,fontSize:13.5,cursor:status==="saving"?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",gap:8,fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:"0 4px 14px rgba(5,150,105,.3)" }}>
        {status==="saving"?<><span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"white",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite" }}/> Saving…</>:<><Ic n="check" s={15} c="white"/> {label}</>}
      </button>
      {status==="saved"&&<div style={{ display:"flex",alignItems:"center",gap:7,color:"#16a34a",fontWeight:800,fontSize:13,animation:"fadeUp .25s ease" }}><Ic n="check" s={16} c="#16a34a"/> Saved and synced to backend</div>}
      {saveError&&<div style={{ display:"flex",alignItems:"center",gap:7,color:"#b91c1c",fontWeight:800,fontSize:13,animation:"fadeUp .25s ease" }}><Ic n="alert" s={16} c="#b91c1c"/> {saveError}</div>}
    </div>
  );
};

const RecordUpdate = ({ user }) => {
  const [step, setStep]         = useState("off-bio");
  const [patient, setPatient]   = useState(null);
  const [tab, setTab]           = useState("risk");    // default to risk tab
  const [auditLogs, setAuditLogs] = useState([]);
  const [form, setForm] = useState({ bloodGroup:"", allergies:[], chronicDiseases:[], medications:[], newDiagnosis:"", newAllergy:"", newCondition:"", newMed:"", prescriptions:[], reports:[], newRx:"", newReport:"" });
  const [updateState, setUpdateState] = useState({ loading: false, error: "", message: "" });

  const onOfficerVerified = useCallback(() => setStep("pat-bio"), []);

  // ── FIXED: transition to edit reliably ───────────────────────────
  const onPatientVerified = useCallback(() => {
    setStep("fetching");
    setTimeout(() => {
      const p = PATIENTS[0];
      setPatient(p);
      setForm({
        bloodGroup:      p.bloodGroup,
        allergies:       [...p.allergies],
        chronicDiseases: [...p.chronicDiseases],
        medications:     [...p.medications],
        prescriptions:   [...p.prescriptions],
        reports:         [...p.reports],
        newDiagnosis:"", newAllergy:"", newCondition:"", newMed:"", newRx:"", newReport:"",
      });
      setTab("risk");    // always open risk tab first
      setStep("edit");   // transition to editor
    }, 900);
  }, []);

  const addAuditLog = (action) => setAuditLogs(l=>[{ id:`AL${Date.now()}`,time:new Date().toLocaleString("en-IN"),userId:user.id,userName:user.name,role:"Records Officer",hospitalName:"AIIMS New Delhi",patientLid:patient?.lifeId||"—",action,status:"Authorized" },...l]);
  const addToList = (field,vf) => { const v=form[vf]?.trim(); if(!v)return; setForm(f=>({...f,[field]:[...f[field],v],[vf]:""})); };
  const removeFromList = (field,idx) => setForm(f=>({...f,[field]:f[field].filter((_,i)=>i!==idx)}));
  const stepIndex={"off-bio":0,"pat-bio":1,fetching:2,edit:2}[step]??0;

  const submitBackendUpdate = async ({ suppressAuditLog = false, successMessage = "" } = {}) => {
    if (!patient) {
      throw new Error("Patient context is missing");
    }

    const token = getSavedAuthToken();
    if (!token) {
      const message = "Your session token is missing. Please login again and retry updation.";
      setUpdateState({ loading: false, error: message, message: "" });
      throw new Error(message);
    }

    setUpdateState({ loading: true, error: "", message: "" });

    try {
      const response = await fetch(`${getApiBaseUrl()}/records/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lifeId: patient.lifeId,
          officerBiometric: { valid: true },
          consentConfirmed: true,
          updatePayload: {
            bloodGroup: form.bloodGroup,
            allergies: form.allergies,
            chronicDiseases: form.chronicDiseases,
            medications: form.medications,
            prescriptions: form.prescriptions,
            reports: form.reports,
            diagnosis: form.newDiagnosis?.trim() || undefined,
            notes: "Updated from Records Updation screen",
          },
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || "Record update failed");
      }

      setPatient((previous) => previous ? ({
        ...previous,
        bloodGroup: form.bloodGroup,
        allergies: [...form.allergies],
        chronicDiseases: [...form.chronicDiseases],
        medications: [...form.medications],
        prescriptions: [...form.prescriptions],
        reports: [...form.reports],
        lastUpdated: new Date().toISOString().split("T")[0],
      }) : previous);

      if (!suppressAuditLog) {
        addAuditLog("Record Update (Backend Sync)");
      }

      setUpdateState({ loading: false, error: "", message: successMessage || payload?.message || "Record updation synced with backend update endpoint." });
      return payload;
    } catch (error) {
      const message = error?.message || "Record update failed";
      setUpdateState({ loading: false, error: message, message: "" });
      throw new Error(message);
    }
  };

  const saveAndSync = async (action, options = {}) => {
    if (options.requireDiagnosis && !form.newDiagnosis.trim()) {
      throw new Error("Please enter diagnosis details before saving.");
    }

    addAuditLog(action);
    await submitBackendUpdate({
      suppressAuditLog: true,
      successMessage: `${action} saved and synced with backend update endpoint.`,
    });

    if (options.clearDiagnosis) {
      setForm((previous) => ({ ...previous, newDiagnosis: "" }));
    }
  };

  const TABS=[
    {key:"risk",       label:"AI Risk Analysis",  icon:"brain"},
    {key:"vitals",     label:"Blood & Allergies", icon:"drop"},
    {key:"conditions", label:"Conditions",        icon:"heart"},
    {key:"medications",label:"Medications",       icon:"pill"},
    {key:"documents",  label:"Documents",         icon:"file"},
    {key:"diagnosis",  label:"Add Diagnosis",     icon:"edit"},
  ];

  return (
    <div>
      <PageHdr
        title={step==="edit"&&patient?`Editing: ${patient.name}`:"Update Medical Records"}
        sub={step==="edit"&&patient?<span style={{ fontFamily:"'DM Mono',monospace",fontSize:13 }}>{patient.lifeId}</span>:step==="off-bio"?"Step 1 — Officer biometric authentication":step==="pat-bio"?"Step 2 — Patient biometric verification":"Retrieving patient record…"}
        action={step==="edit"?<Btn variant="ghost" size="sm" onClick={()=>{setStep("off-bio");setPatient(null);setAuditLogs([]);}}><Ic n="x" s={14}/> End Session</Btn>:null}
      />
      {/* Step bar */}
      <div style={{ display:"flex",alignItems:"center",marginBottom:28 }}>
        {["Officer Biometric","Patient Biometric","Record Editor"].map((s,i)=>{ const done=i<stepIndex,active=i===stepIndex; return (
          <div key={s} style={{ display:"flex",alignItems:"center",flex:i<2?"1":"none" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <div style={{ width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,background:done?"#059669":active?C.blueMid:"#e2e8f0",color:done||active?"white":"#94a3b8" }}>{done?<Ic n="check" s={13} c="white"/>:i+1}</div>
              <span style={{ fontSize:12.5,fontWeight:700,color:active?C.text:C.muted,whiteSpace:"nowrap" }}>{s}</span>
            </div>
            {i<2&&<div style={{ flex:1,height:2,background:done?"#86efac":C.border,margin:"0 14px",transition:"all .3s" }}/>}
          </div>
        );})}
      </div>

      {step !== "edit" && (
        <Card style={{ padding:"14px 16px", marginBottom:16, borderColor:C.border }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap" }}>
            <div>
              <p style={{ margin:0,fontSize:13.5,fontWeight:800,color:C.text }}>Backend Updation Sync</p>
              <p style={{ margin:"4px 0 0",fontSize:12,color:C.muted }}>This feature unlocks after officer + patient biometric verification in this screen.</p>
            </div>
            <button disabled style={{ border:"none",borderRadius:9,padding:"10px 16px",background:"#cbd5e1",color:"#475569",fontWeight:800,fontSize:13,cursor:"not-allowed",fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              Apply Backend Update
            </button>
          </div>
        </Card>
      )}

      {/* Step 1 */}
      <div style={{ display:step==="off-bio"?"block":"none" }}>
        <div style={{ maxWidth:520,margin:"0 auto" }}><Card style={{ padding:28 }}><BioScanner label={`Officer: ${user.name}`} onSuccess={onOfficerVerified}/></Card></div>
      </div>
      {/* Step 2 */}
      <div style={{ display:step==="pat-bio"?"block":"none" }}>
        <div style={{ maxWidth:520,margin:"0 auto" }}><Card style={{ padding:28 }}><BioScanner label="Patient — place finger on sensor" onSuccess={onPatientVerified}/></Card></div>
      </div>
      {/* Fetching */}
      {step==="fetching"&&(
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:320,gap:22 }}>
          <div style={{ width:56,height:56,border:`4px solid ${C.blueL}`,borderTopColor:C.blueMid,borderRadius:"50%",animation:"spin .8s linear infinite" }}/>
          <p style={{ fontWeight:800,color:C.text,fontSize:16,margin:0 }}>Fetching Patient Record…</p>
        </div>
      )}

      {/* Editor */}
      {step==="edit" && patient && (
        <div className="fade-up">
          <div style={{ background:C.greenL,border:"1.5px solid #86efac",borderRadius:12,padding:"12px 18px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <Ic n="check" s={17} c="#16a34a"/>
              <span style={{ color:"#15803d",fontWeight:800,fontSize:13.5 }}>Dual biometric verified — {patient.name} · <span style={{ fontFamily:"'DM Mono',monospace" }}>{patient.lifeId}</span></span>
            </div>
            <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
              <Badge tone="green" dot>Officer: {user.name}</Badge>
              <Badge tone="blue">AIIMS New Delhi</Badge>
              <span style={{ fontSize:11.5,color:"#16a34a",fontFamily:"'DM Mono',monospace" }}>{new Date().toLocaleString("en-IN")}</span>
            </div>
          </div>

          <Card style={{ padding:"14px 16px", marginBottom:16, borderColor:updateState.error?"#fecaca":updateState.message?"#86efac":C.border }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap" }}>
              <div>
                <p style={{ margin:0,fontSize:13.5,fontWeight:800,color:C.text }}>Backend Updation Sync</p>
                <p style={{ margin:"4px 0 0",fontSize:12,color:C.muted }}>Pushes current form values to /records/update with consent fallback and no risk analysis.</p>
              </div>
              <button onClick={submitBackendUpdate} disabled={updateState.loading} style={{ border:"none",borderRadius:9,padding:"10px 16px",background:"linear-gradient(135deg,#2563eb,#1d4ed8)",color:"white",fontWeight:800,fontSize:13,cursor:updateState.loading?"wait":"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                {updateState.loading ? "Submitting..." : "Apply Backend Update"}
              </button>
            </div>
            {updateState.error && <p style={{ margin:"10px 0 0",fontSize:12.5,color:"#b91c1c",fontWeight:700 }}>{updateState.error}</p>}
            {updateState.message && <p style={{ margin:"10px 0 0",fontSize:12.5,color:"#15803d",fontWeight:700 }}>{updateState.message}</p>}
          </Card>

          {/* Tab bar */}
          <div style={{ display:"flex",gap:3,marginBottom:20,background:"white",borderRadius:12,border:`1px solid ${C.border}`,padding:5,overflowX:"auto" }}>
            {TABS.map(t=>{
              const isRisk=t.key==="risk"; const isActive=tab===t.key;
              const alerts=analyzeRisks(form.allergies,form.chronicDiseases,form.medications);
              const lvl=overallRisk(alerts);
              return (
                <button key={t.key} onClick={()=>setTab(t.key)} style={{ flex:1,minWidth:110,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"9px 10px",border:"none",borderRadius:9,background:isActive?C.navy:"transparent",color:isActive?"white":C.muted,fontWeight:700,fontSize:11.5,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",whiteSpace:"nowrap",position:"relative" }}>
                  <Ic n={t.icon} s={13} c={isActive?"white":C.muted}/>
                  {t.label}
                  {isRisk&&alerts.length>0&&<span style={{ position:"absolute",top:5,right:5,width:7,height:7,borderRadius:"50%",background:lvl==="HIGH"?C.red:C.amber }}/>}
                </button>
              );
            })}
          </div>

          {/* ── AI RISK TAB ── */}
          {tab==="risk" && (
            <Card style={{ padding:28 }}>
              <RiskAlertPanel patient={{ ...patient, allergies:form.allergies, chronicDiseases:form.chronicDiseases, medications:form.medications }} medRecord={{ medications:form.medications }} showDrugChecker={true}/>
            </Card>
          )}

          {/* ── VITALS TAB ── */}
          {tab==="vitals" && (
            <Card style={{ padding:28 }}>
              <h4 style={{ margin:"0 0 22px",fontWeight:800,color:C.text,fontSize:17 }}>Blood Group &amp; Allergies</h4>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 28px" }}>
                <div>
                  <label style={{ display:"block",fontSize:12.5,fontWeight:700,color:"#374151",marginBottom:6 }}>Blood Group</label>
                  <select value={form.bloodGroup} onChange={e=>setForm(f=>({...f,bloodGroup:e.target.value}))} style={{ width:"100%",padding:"10px 13px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:14,fontFamily:"'Plus Jakarta Sans',sans-serif",marginBottom:18 }}>
                    {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(b=><option key={b}>{b}</option>)}
                  </select>
                  <div style={{ background:C.redL,borderRadius:12,padding:"18px 20px",textAlign:"center" }}><p style={{ margin:"0 0 4px",fontSize:11,color:"#94a3b8",textTransform:"uppercase" }}>Current</p><p style={{ margin:0,fontSize:48,fontWeight:900,color:"#dc2626",lineHeight:1 }}>{form.bloodGroup}</p></div>
                </div>
                <div>
                  <label style={{ display:"block",fontSize:12.5,fontWeight:700,color:"#374151",marginBottom:6 }}>Known Allergies</label>
                  <div style={{ display:"flex",gap:8,marginBottom:12 }}>
                    <input value={form.newAllergy} onChange={e=>setForm(f=>({...f,newAllergy:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addToList("allergies","newAllergy")} placeholder="e.g. Penicillin" style={{ flex:1,padding:"9px 13px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:13.5,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none" }}/>
                    <Btn size="sm" onClick={()=>addToList("allergies","newAllergy")}><Ic n="plus" s={14} c="white"/></Btn>
                  </div>
                  <div style={{ minHeight:80 }}>
                    {form.allergies.length===0?<p style={{ color:"#94a3b8",fontSize:13,fontStyle:"italic" }}>No allergies recorded</p>:form.allergies.map((a,i)=>(
                      <div key={i} style={{ display:"inline-flex",alignItems:"center",gap:6,background:C.amberL,borderRadius:7,padding:"5px 10px",marginRight:7,marginBottom:7 }}>
                        <span style={{ fontSize:12.5,fontWeight:700,color:"#92400e" }}>{a}</span>
                        <button onClick={()=>removeFromList("allergies",i)} style={{ background:"none",border:"none",cursor:"pointer",padding:0,display:"flex" }}><Ic n="x" s={12} c="#d97706"/></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <SaveBar onSave={() => saveAndSync("Blood Group & Allergies Updated")}/>
            </Card>
          )}

          {/* ── CONDITIONS TAB ── */}
          {tab==="conditions" && (
            <Card style={{ padding:28 }}>
              <h4 style={{ margin:"0 0 20px",fontWeight:800,color:C.text,fontSize:17 }}>Chronic Conditions</h4>
              <div style={{ display:"flex",gap:8,marginBottom:16 }}>
                <input value={form.newCondition} onChange={e=>setForm(f=>({...f,newCondition:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addToList("chronicDiseases","newCondition")} placeholder="e.g. Type 2 Diabetes" style={{ flex:1,padding:"10px 13px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:14,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none" }}/>
                <Btn size="sm" onClick={()=>addToList("chronicDiseases","newCondition")}><Ic n="plus" s={14} c="white"/> Add</Btn>
              </div>
              {form.chronicDiseases.length===0?<div style={{ border:`2px dashed ${C.border}`,borderRadius:12,padding:"32px 20px",textAlign:"center",color:"#94a3b8",fontSize:13 }}>No chronic conditions recorded.</div>:form.chronicDiseases.map((c,i)=>(
                <div key={i} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"#f8fafc",borderRadius:10,marginBottom:8,border:`1px solid ${C.border}` }}>
                  <div style={{ width:8,height:8,borderRadius:"50%",background:C.blueMid,flexShrink:0 }}/>
                  <span style={{ flex:1,fontSize:14,color:C.text,fontWeight:600 }}>{c}</span>
                  <button onClick={()=>removeFromList("chronicDiseases",i)} style={{ background:"#fee2e2",border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer",display:"flex" }}><Ic n="x" s={13} c="#dc2626"/></button>
                </div>
              ))}
              <SaveBar onSave={() => saveAndSync("Chronic Conditions Updated")}/>
            </Card>
          )}

          {/* ── MEDICATIONS TAB ── */}
          {tab==="medications" && (
            <Card style={{ padding:28 }}>
              <h4 style={{ margin:"0 0 20px",fontWeight:800,color:C.text,fontSize:17 }}>Current Medications</h4>
              <div style={{ display:"flex",gap:8,marginBottom:16 }}>
                <input value={form.newMed} onChange={e=>setForm(f=>({...f,newMed:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addToList("medications","newMed")} placeholder="e.g. Metformin 500mg twice daily" style={{ flex:1,padding:"10px 13px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:14,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none" }}/>
                <Btn size="sm" onClick={()=>addToList("medications","newMed")}><Ic n="plus" s={14} c="white"/> Add</Btn>
              </div>
              {form.medications.map((m,i)=>{
                const mAlerts=analyzeRisks(form.allergies,form.chronicDiseases,[],m);
                const hasConflict=mAlerts.some(a=>a.level==="HIGH");
                return (
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:hasConflict?"#fff1f0":"#f8fafc",borderRadius:10,marginBottom:8,border:`1px solid ${hasConflict?"#ffa39e":C.border}` }}>
                    <Ic n="pill" s={17} c={hasConflict?C.red:"#7c3aed"}/>
                    <span style={{ flex:1,fontSize:14,color:C.text }}>{m}</span>
                    {hasConflict&&<div style={{ display:"flex",alignItems:"center",gap:5,background:C.redL,borderRadius:6,padding:"2px 8px" }}><Ic n="alert" s={11} c={C.red}/><span style={{ fontSize:11,fontWeight:700,color:C.red }}>Allergy conflict</span></div>}
                    <button onClick={()=>removeFromList("medications",i)} style={{ background:"#fee2e2",border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer",display:"flex" }}><Ic n="x" s={13} c="#dc2626"/></button>
                  </div>
                );
              })}
              <SaveBar onSave={() => saveAndSync("Medications Updated")}/>
            </Card>
          )}

          {/* ── DOCUMENTS TAB ── */}
          {tab==="documents" && (
            <Card style={{ padding:28 }}>
              <h4 style={{ margin:"0 0 18px",fontWeight:800,color:C.text,fontSize:17 }}>Prescriptions & Reports</h4>
              <p style={{ margin:"0 0 16px",fontSize:13,color:C.muted,lineHeight:1.6 }}>Upload references and append document entries for this patient. Entries are audit-logged.</p>

              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18 }}>
                <div style={{ background:"#f8fafc",border:`1px solid ${C.border}`,borderRadius:11,padding:"14px 14px 10px" }}>
                  <p style={{ margin:"0 0 10px",fontSize:12,fontWeight:800,color:C.text,letterSpacing:"0.06em",textTransform:"uppercase" }}>Prescriptions</p>
                  <div style={{ display:"flex",gap:8,marginBottom:10 }}>
                    <input value={form.newRx} onChange={e=>setForm(f=>({...f,newRx:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addToList("prescriptions","newRx")} placeholder="e.g. Rx-2026-04-15.pdf" style={{ flex:1,padding:"8px 10px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none" }}/>
                    <Btn size="sm" onClick={()=>addToList("prescriptions","newRx")}><Ic n="plus" s={13} c="white"/></Btn>
                  </div>
                  {form.prescriptions.length===0
                    ? <p style={{ margin:0,fontSize:12.5,color:C.mutedLight }}>No prescriptions added.</p>
                    : form.prescriptions.map((d,i)=>(
                        <div key={`${d}-${i}`} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 9px",background:"white",border:`1px solid ${C.border}`,borderRadius:8,marginBottom:7 }}>
                          <Ic n="file" s={14} c={C.blueMid}/>
                          <span style={{ flex:1,fontSize:12.5,color:C.text }}>{d}</span>
                          <button onClick={()=>removeFromList("prescriptions",i)} style={{ background:"none",border:"none",cursor:"pointer",padding:0,display:"flex" }}><Ic n="x" s={12} c={C.red}/></button>
                        </div>
                      ))
                  }
                </div>

                <div style={{ background:"#f8fafc",border:`1px solid ${C.border}`,borderRadius:11,padding:"14px 14px 10px" }}>
                  <p style={{ margin:"0 0 10px",fontSize:12,fontWeight:800,color:C.text,letterSpacing:"0.06em",textTransform:"uppercase" }}>Reports</p>
                  <div style={{ display:"flex",gap:8,marginBottom:10 }}>
                    <input value={form.newReport} onChange={e=>setForm(f=>({...f,newReport:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addToList("reports","newReport")} placeholder="e.g. Blood-Panel-Apr-2026.pdf" style={{ flex:1,padding:"8px 10px",border:`1.5px solid ${C.border}`,borderRadius:8,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none" }}/>
                    <Btn size="sm" onClick={()=>addToList("reports","newReport")}><Ic n="plus" s={13} c="white"/></Btn>
                  </div>
                  {form.reports.length===0
                    ? <p style={{ margin:0,fontSize:12.5,color:C.mutedLight }}>No reports added.</p>
                    : form.reports.map((d,i)=>(
                        <div key={`${d}-${i}`} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 9px",background:"white",border:`1px solid ${C.border}`,borderRadius:8,marginBottom:7 }}>
                          <Ic n="file" s={14} c={C.purple}/>
                          <span style={{ flex:1,fontSize:12.5,color:C.text }}>{d}</span>
                          <button onClick={()=>removeFromList("reports",i)} style={{ background:"none",border:"none",cursor:"pointer",padding:0,display:"flex" }}><Ic n="x" s={12} c={C.red}/></button>
                        </div>
                      ))
                  }
                </div>
              </div>

              <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
                <Btn variant="ghost" size="sm"><Ic n="upload" s={13}/> Simulate Upload</Btn>
                <Btn variant="ghost" size="sm"><Ic n="download" s={13}/> Export Summary</Btn>
              </div>

              <SaveBar onSave={() => saveAndSync("Documents Updated")}/>
            </Card>
          )}

          {/* ── DIAGNOSIS TAB ── */}
          {tab==="diagnosis" && (
            <Card style={{ padding:28 }}>
              <h4 style={{ margin:"0 0 8px",fontWeight:800,color:C.text,fontSize:17 }}>Add New Diagnosis</h4>
              <p style={{ margin:"0 0 18px",color:C.muted,fontSize:13,lineHeight:1.65 }}>ICD-10 codes, clinical observations, and treatment plan. Append-only — cannot be deleted.</p>
              <textarea value={form.newDiagnosis} onChange={e=>setForm(f=>({...f,newDiagnosis:e.target.value}))} placeholder={"ICD-10: E11.9 — Type 2 Diabetes Mellitus\n\nFindings: FBS 186 mg/dL, HbA1c 8.2%.\n\nTreatment: Increase Metformin to 1000mg BD."} style={{ width:"100%",minHeight:180,padding:14,border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:13.5,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"'Plus Jakarta Sans',sans-serif",color:C.text,lineHeight:1.7 }}/>
              <SaveBar label="Save Diagnosis Entry" onSave={() => saveAndSync("New Diagnosis Added", { requireDiagnosis: true, clearDiagnosis: true })}/>
            </Card>
          )}

          {/* Session audit trail */}
          {auditLogs.length>0&&(
            <div style={{ marginTop:28 }}>
              <p style={{ margin:"0 0 14px",fontSize:12,fontWeight:800,color:C.muted,textTransform:"uppercase",letterSpacing:"0.08em" }}>Session Audit Trail ({auditLogs.length} actions)</p>
              <AuditTable logs={auditLogs}/>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  PATIENT PAGES
// ═══════════════════════════════════════════════════════════════════
const LockedMedicalData = ({ patient }) => {
  const [locked,setLocked]=useState(true); const [scanning,setScanning]=useState(false); const [countdown,setCountdown]=useState(30);
  const timerRef=useRef(null);
  const clearLock=()=>{ if(timerRef.current)clearInterval(timerRef.current); };
  const startLock=()=>{ clearLock(); let s=30; setCountdown(s); timerRef.current=setInterval(()=>{ s--; setCountdown(s); if(s<=0){clearLock();setLocked(true);} },1000); };
  const onBioSuccess=()=>{ setScanning(false); setLocked(false); startLock(); };
  const lockNow=()=>{ clearLock(); setLocked(true); };
  useEffect(()=>()=>clearLock(),[]);
  const autoAlerts=locked?[]:analyzeRisks(patient.allergies,patient.chronicDiseases,patient.medications);

  return (
    <div style={{ marginTop:24 }}>
      <div style={{ display:locked&&!scanning?"block":"none" }}>
        <Card style={{ padding:36,textAlign:"center",border:`2px dashed ${C.border}` }}>
          <div style={{ width:72,height:72,background:"linear-gradient(135deg,#f1f5f9,#e2e8f0)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px" }}><Ic n="lock" s={32} c="#475569"/></div>
          <h3 style={{ margin:"0 0 10px",fontSize:18,fontWeight:900,color:C.text }}>Medical Records Locked</h3>
          <p style={{ color:C.muted,fontSize:14,margin:"0 0 22px",lineHeight:1.65 }}>Your blood group, allergies, medications, prescriptions and reports are protected.</p>
          <button onClick={()=>setScanning(true)} style={{ padding:"13px 28px",border:"none",borderRadius:9,background:`linear-gradient(135deg,${C.navy},${C.blueMid})`,color:"white",fontWeight:700,fontSize:15,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:10,fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:"0 4px 18px rgba(29,78,216,.35)" }}>
            <Ic n="fp" s={18} c="white"/> Unlock with Biometric
          </button>
        </Card>
      </div>
      <div style={{ display:scanning?"block":"none" }}>
        <Card style={{ padding:28 }}><BioScanner label="Patient Identity Verification" onSuccess={onBioSuccess} onCancel={()=>setScanning(false)}/></Card>
      </div>
      <div style={{ display:!locked?"block":"none" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}><Ic n="unlock" s={18} c="#059669"/><span style={{ fontSize:13.5,fontWeight:800,color:"#059669" }}>Medical Records Unlocked</span><Badge tone="green" dot>Active</Badge></div>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <span style={{ fontSize:12,fontWeight:700,color:countdown<=10?"#dc2626":"#94a3b8",fontFamily:"'DM Mono',monospace" }}>Auto-lock in {countdown}s</span>
            <div style={{ width:80,height:5,background:"#e2e8f0",borderRadius:10,overflow:"hidden" }}><div style={{ height:"100%",width:`${(countdown/30)*100}%`,background:countdown<=10?"#ef4444":"#059669",transition:"width 1s linear",borderRadius:10 }}/></div>
            <button onClick={lockNow} style={{ background:"none",border:"none",color:C.red,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",display:"flex",alignItems:"center",gap:5 }}><Ic n="lock" s={14} c={C.red}/> Lock Now</button>
          </div>
        </div>

        {/* AI Risk Panel for patient view */}
        {autoAlerts.length>0&&(
          <div style={{ background:"white",borderRadius:14,border:`2px solid ${overallRisk(autoAlerts)==="HIGH"?C.red:C.amber}`,padding:"18px 20px",marginBottom:16 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
              <Ic n="brain" s={16} c={C.navy}/>
              <span style={{ fontSize:13,fontWeight:800,color:C.text }}>AI Medication Safety Review</span>
              <Badge tone={overallRisk(autoAlerts)==="HIGH"?"red":"amber"}>{autoAlerts.length} alert{autoAlerts.length>1?"s":""}</Badge>
            </div>
            <p style={{ margin:"0 0 12px",fontSize:12.5,color:C.muted }}>Issues detected in your current medications — please discuss with your doctor.</p>
            {autoAlerts.slice(0,3).map((a,i)=><RiskAlertCard key={i} alert={a}/>)}
          </div>
        )}

        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14 }}>
          {[
            {title:"Blood Group",body:<p style={{ fontSize:44,fontWeight:900,color:"#dc2626",margin:0,lineHeight:1 }}>{patient.bloodGroup}</p>,borderColor:"#fecaca"},
            {title:"Allergies",body:patient.allergies.length===0?<p style={{ color:"#94a3b8" }}>None recorded</p>:patient.allergies.map(a=><div key={a} style={{ display:"inline-block",background:C.amberL,borderRadius:6,padding:"4px 10px",marginRight:6,marginBottom:6,fontSize:13,fontWeight:700,color:"#92400e" }}>{a}</div>),borderColor:"#fde68a"},
            {title:"Chronic Conditions",body:patient.chronicDiseases.length===0?<p style={{ color:"#94a3b8" }}>None</p>:patient.chronicDiseases.map(c=><p key={c} style={{ margin:"0 0 5px",fontSize:13.5,color:"#374151" }}>• {c}</p>),borderColor:"#bfdbfe"},
            {title:"Current Medications",body:patient.medications.map(m=>{ const mA=analyzeRisks(patient.allergies,[],[],m); return <p key={m} style={{ margin:"0 0 5px",fontSize:13,color:mA.some(a=>a.level==="HIGH")?"#dc2626":"#374151",fontWeight:mA.some(a=>a.level==="HIGH")?700:400 }}>{mA.some(a=>a.level==="HIGH")?"⚠ ":""}{m}</p>; }),borderColor:"#ddd6fe"},
          ].map(c=>(
            <Card key={c.title} style={{ padding:20,borderColor:c.borderColor }}>
              <p style={{ margin:"0 0 10px",fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em" }}>{c.title}</p>
              {c.body}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const PatientOverview = ({ user }) => {
  const patient=PATIENTS[0];
  return (
    <div>
      <div style={{ background:`linear-gradient(135deg,${C.navy},#1a3060)`,borderRadius:16,padding:"24px 28px",marginBottom:20,display:"flex",alignItems:"center",gap:24 }}>
        <div style={{ width:72,height:72,borderRadius:18,background:"linear-gradient(135deg,#ef4444,#dc2626)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:26,color:"white",flexShrink:0,boxShadow:"0 8px 24px rgba(239,68,68,.4)" }}>{patient.name[0]}</div>
        <div style={{ flex:1 }}>
          <p style={{ margin:"0 0 4px",fontSize:11,color:"rgba(255,255,255,.4)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em" }}>Your LifeID Profile</p>
          <h2 style={{ margin:"0 0 2px",fontSize:22,fontWeight:900,color:"white",fontFamily:"'Sora',sans-serif" }}>{patient.name}</h2>
          <p style={{ margin:"0 0 12px",fontSize:13,color:"rgba(255,255,255,.5)" }}>{patient.gender} · DOB {patient.dob} · {patient.phone}</p>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            <div style={{ background:"rgba(255,255,255,.08)",borderRadius:8,padding:"5px 12px",border:"1px solid rgba(255,255,255,.1)" }}><span style={{ fontSize:10,color:"rgba(255,255,255,.4)",display:"block",fontWeight:700 }}>LIFEID</span><span style={{ fontSize:12.5,color:"white",fontFamily:"'DM Mono',monospace",fontWeight:700 }}>{patient.lifeId}</span></div>
            <div style={{ background:"rgba(255,255,255,.08)",borderRadius:8,padding:"5px 12px",border:"1px solid rgba(255,255,255,.1)" }}><span style={{ fontSize:10,color:"rgba(255,255,255,.4)",display:"block",fontWeight:700 }}>BLOOD</span><span style={{ fontSize:12.5,color:"#f87171",fontFamily:"'DM Mono',monospace",fontWeight:900 }}>{patient.bloodGroup}</span></div>
            <div style={{ background:"rgba(74,222,128,.15)",borderRadius:8,padding:"5px 12px",border:"1px solid rgba(74,222,128,.2)" }}><span style={{ fontSize:11.5,color:"#4ade80",fontWeight:700 }}>● Verified & Active</span></div>
          </div>
        </div>
      </div>
      <div style={{ background:"white",borderRadius:14,border:`1px solid ${C.border}`,padding:"20px 22px" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:4 }}>
          <Ic n="lock" s={16} c={C.muted}/>
          <h3 style={{ margin:0,fontSize:14,fontWeight:800,color:C.text }}>Medical Records</h3>
          <span style={{ fontSize:11,fontWeight:700,color:"#92400e",background:C.amberL,padding:"2px 8px",borderRadius:6 }}>Biometric Protected</span>
          <span style={{ fontSize:11,fontWeight:700,color:C.navy,background:C.blueL,padding:"2px 8px",borderRadius:6,display:"flex",alignItems:"center",gap:4 }}><Ic n="brain" s={11} c={C.navy}/>AI Risk Active</span>
        </div>
        <LockedMedicalData patient={patient}/>
      </div>
    </div>
  );
};

const QRCard = ({ user }) => {
  const patient=PATIENTS[0];
  const cells=[];
  for(let r=0;r<23;r++) for(let c=0;c<23;c++){
    const inner=(r>1&&r<6&&c>1&&c<6)||(r>1&&r<6&&c>16&&c<21)||(r>16&&r<21&&c>1&&c<6);
    const ob=(r===0||r===7||c===0||c===7)&&r<8&&c<8;
    const ob2=(r===0||r===7||c===15||c===22)&&r<8&&c>14;
    const ob3=(r===15||r===22||c===0||c===7)&&r>14&&c<8;
    if(inner||ob||ob2||ob3||(Math.sin(r*7+c*13)>.1))cells.push({r,c});
  }
  return (
    <div>
      <PageHdr title="My LifeID Card" sub="QR contains encrypted emergency data only — blood group, allergies, emergency contact"/>
      <div style={{ display:"grid",gridTemplateColumns:"420px 1fr",gap:24,alignItems:"start" }}>
        <div style={{ background:`linear-gradient(160deg,${C.navy},#1a3566)`,borderRadius:22,padding:28,boxShadow:"0 28px 80px rgba(10,22,40,.5)" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}><div style={{ width:30,height:30,background:"linear-gradient(135deg,#ef4444,#dc2626)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center" }}><Ic n="shield" s={15} c="white"/></div><span style={{ color:"white",fontSize:18,fontWeight:900,fontFamily:"'Sora',sans-serif" }}>Life<span style={{ color:"#ef4444" }}>ID</span></span></div>
            <Badge tone="green" dot>ACTIVE</Badge>
          </div>
          <div style={{ background:"white",borderRadius:14,padding:16,marginBottom:18,display:"flex",justifyContent:"center" }}>
            <svg width={180} height={180} viewBox="0 0 23 23">{cells.map((cell,i)=><rect key={i} x={cell.c} y={cell.r} width={0.88} height={0.88} fill={C.navy}/>)}</svg>
          </div>
          <div style={{ textAlign:"center",marginBottom:16 }}><p style={{ margin:"0 0 3px",fontSize:10,color:"#94a3b8",letterSpacing:"0.14em",textTransform:"uppercase" }}>LifeID Number</p><p style={{ margin:0,fontWeight:900,fontSize:17,color:"white",fontFamily:"'DM Mono',monospace" }}>{patient.lifeId}</p></div>
          <div style={{ background:"rgba(255,255,255,.06)",borderRadius:11,padding:"13px 16px",marginBottom:14 }}>
            <p style={{ margin:"0 0 2px",fontSize:10,color:"#94a3b8" }}>Full Name</p><p style={{ margin:"0 0 10px",fontWeight:800,fontSize:15,color:"white" }}>{patient.name}</p>
            <div style={{ display:"flex",gap:20 }}>
              <div><p style={{ margin:"0 0 2px",fontSize:10,color:"#94a3b8" }}>Blood</p><p style={{ margin:0,fontWeight:900,color:"#f87171",fontSize:18,fontFamily:"'DM Mono',monospace" }}>{patient.bloodGroup}</p></div>
              <div><p style={{ margin:"0 0 2px",fontSize:10,color:"#94a3b8" }}>DOB</p><p style={{ margin:0,fontWeight:700,color:"white",fontSize:12 }}>{patient.dob}</p></div>
            </div>
          </div>
          {/* QR data info */}
          <div style={{ background:"rgba(59,130,246,.15)",borderRadius:9,padding:"10px 14px",marginBottom:14 }}>
            <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4 }}><Ic n="lock" s={12} c="#60a5fa"/><span style={{ fontSize:10.5,fontWeight:800,color:"#93c5fd",textTransform:"uppercase" }}>Encrypted Emergency Data</span></div>
            <p style={{ margin:0,fontSize:11.5,color:"rgba(255,255,255,.5)",lineHeight:1.6 }}>Blood group · Allergies · Emergency contact · Critical conditions. Full records NOT stored in QR.</p>
          </div>
          <button style={{ width:"100%",padding:"12px",border:"none",borderRadius:10,background:"linear-gradient(135deg,#ef4444,#dc2626)",color:"white",fontWeight:800,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:"0 4px 18px rgba(239,68,68,.4)" }}>
            <Ic n="download" s={16} c="white"/> Download Card
          </button>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div style={{ background:"white",borderRadius:14,border:`1px solid ${C.border}`,padding:"20px 22px" }}>
            <h3 style={{ margin:"0 0 14px",fontSize:14,fontWeight:800,color:C.text }}>Emergency Info (in QR)</h3>
            {[["Blood Group",patient.bloodGroup,"#dc2626",C.redL],["Allergies",patient.allergies.join(", ")||"None","#d97706",C.amberL]].map(([label,val,c,bg])=>(
              <div key={label} style={{ background:bg,borderRadius:10,padding:"12px 14px",marginBottom:10 }}>
                <p style={{ margin:"0 0 3px",fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase" }}>{label}</p>
                <p style={{ margin:0,fontSize:15,fontWeight:900,color:c,fontFamily:"'DM Mono',monospace" }}>{val}</p>
              </div>
            ))}
            <div style={{ background:"#f0fdf4",border:"1px solid #86efac",borderRadius:10,padding:"12px 14px" }}>
              <p style={{ margin:"0 0 3px",fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase" }}>Emergency Contact</p>
              <p style={{ margin:0,fontSize:15,fontWeight:900,color:C.green,fontFamily:"'DM Mono',monospace" }}>{patient.emergencyContact}</p>
            </div>
          </div>
          <div style={{ background:"white",borderRadius:14,border:`1px solid ${C.border}`,padding:"20px 22px" }}>
            <h3 style={{ margin:"0 0 14px",fontSize:14,fontWeight:800,color:C.text }}>QR Security</h3>
            {[["AES-256 Encrypted","Emergency data inside QR is encrypted — cannot be read without LifeID system","lock","#059669"],["Minimal Data Only","Full medical records never stored in QR — only critical emergency info","shield","#2563eb"],["AI Risk Aware","Scanning triggers AI risk analysis on emergency data","brain","#7c3aed"]].map(([t,d,ic,c])=>(
              <div key={t} style={{ display:"flex",gap:12,alignItems:"flex-start",marginBottom:14 }}>
                <div style={{ width:30,height:30,borderRadius:8,background:`${c}12`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Ic n={ic} s={14} c={c}/></div>
                <div><p style={{ margin:0,fontSize:13,fontWeight:700,color:C.text }}>{t}</p><p style={{ margin:"2px 0 0",fontSize:12,color:C.muted }}>{d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AccessHistory = () => {
  const myLogs=AUDIT_LOGS.filter(l=>l.patientLid==="LID-IN-2024-00291");
  const riskTone=a=>a.includes("Emergency")?"red":a.includes("Update")?"amber":"blue";
  const riskLabel=a=>a.includes("Emergency")?"High Risk":a.includes("Update")?"Data Change":"Read Only";
  return (
    <div>
      <PageHdr title="Access History" sub="Full transparency — every access to your records"/>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20 }}>
        {[["Total Accesses",myLogs.length,"eye","#2563eb"],["Emergency Accesses",myLogs.filter(l=>l.action.includes("Emergency")).length,"alert","#dc2626"],["Data Changes",myLogs.filter(l=>l.action.includes("Update")).length,"edit","#7c3aed"]].map(([label,val,ic,c])=>(
          <div key={label} style={{ background:"white",borderRadius:12,border:`1px solid ${C.border}`,padding:"16px 18px",display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:38,height:38,borderRadius:10,background:`${c}12`,display:"flex",alignItems:"center",justifyContent:"center" }}><Ic n={ic} s={18} c={c}/></div>
            <div><p style={{ margin:0,fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase" }}>{label}</p><p style={{ margin:"2px 0 0",fontSize:24,fontWeight:900,color:C.text,fontFamily:"'DM Mono',monospace" }}>{val}</p></div>
          </div>
        ))}
      </div>
      <div style={{ position:"relative" }}>
        <div style={{ position:"absolute",left:19,top:0,bottom:0,width:2,background:C.border,zIndex:0 }}/>
        {myLogs.map((l,i)=>(
          <div key={l.id} style={{ position:"relative",paddingLeft:50,marginBottom:14 }}>
            <div style={{ position:"absolute",left:0,top:14,width:38,height:38,borderRadius:"50%",background:l.action.includes("Emergency")?C.redL:C.blueL,display:"flex",alignItems:"center",justifyContent:"center",border:"2.5px solid white",zIndex:1 }}>
              <Ic n={l.action.includes("Emergency")?"alert":"eye"} s={16} c={l.action.includes("Emergency")?C.red:C.blueMid}/>
            </div>
            <div style={{ background:"white",borderRadius:13,border:`1px solid ${C.border}`,padding:"14px 18px" }}>
              <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6,gap:10,flexWrap:"wrap" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}><span style={{ fontSize:14,fontWeight:800,color:C.text }}>{l.action}</span><Badge tone={riskTone(l.action)}>{riskLabel(l.action)}</Badge></div>
                <span style={{ fontSize:11.5,color:C.mutedLight,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap" }}>{l.time}</span>
              </div>
              <p style={{ margin:0,fontSize:12.5,color:C.muted }}><span style={{ fontWeight:700,color:C.textSub }}>{l.userName}</span> · {l.role} · {l.hospitalName}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const UpdateContact = ({ toast }) => {
  const [phone,setPhone]=useState(PATIENTS[0].phone); const [ec,setEc]=useState(PATIENTS[0].emergencyContact); const [ferr,setFerr]=useState({}); const [saved,setSaved]=useState(false);
  const save=()=>{ const e={}; if(!validateIndianPhone(phone))e.phone="Enter valid Indian phone: +91 XXXXXXXXXX"; if(!validateIndianPhone(ec))e.ec="Enter valid Indian phone: +91 XXXXXXXXXX"; setFerr(e); if(Object.keys(e).length)return; setSaved(true); toast("Contact updated","success"); setTimeout(()=>setSaved(false),3000); };
  return (
    <div>
      <PageHdr title="Update Contact Info" sub="Self-service phone number update"/>
      <div style={{ maxWidth:560 }}>
        <div style={{ background:C.amberL,border:`1px solid #fde68a`,borderRadius:12,padding:"12px 16px",marginBottom:22,display:"flex",gap:10 }}>
          <Ic n="alert" s={16} c="#d97706" style={{ flexShrink:0,marginTop:1 }}/><p style={{ margin:0,fontSize:13,color:"#92400e",fontWeight:600,lineHeight:1.6 }}>Only phone and emergency contact may be self-updated. Medical record changes require officer biometric verification.</p>
        </div>
        <div style={{ background:"white",borderRadius:14,border:`1px solid ${C.border}`,padding:28 }}>
          <div style={{ marginBottom:20 }}><label style={{ display:"block",fontSize:12.5,fontWeight:700,color:"#374151",marginBottom:5 }}>Phone Number <span style={{ color:C.red }}>*</span></label><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 9876543210" style={{ width:"100%",padding:"11px 13px",border:`1.5px solid ${ferr.phone?C.red:C.border}`,borderRadius:10,fontSize:14,color:C.text,background:"white",fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",boxSizing:"border-box" }}/>{ferr.phone&&<p style={{ margin:"5px 0 0",fontSize:12,color:C.red,fontWeight:600 }}>{ferr.phone}</p>}</div>
          <div style={{ marginBottom:24 }}><label style={{ display:"block",fontSize:12.5,fontWeight:700,color:"#374151",marginBottom:5 }}>Emergency Contact <span style={{ color:C.red }}>*</span></label><input value={ec} onChange={e=>setEc(e.target.value)} placeholder="+91 9876543210" style={{ width:"100%",padding:"11px 13px",border:`1.5px solid ${ferr.ec?C.red:C.border}`,borderRadius:10,fontSize:14,color:C.text,background:"white",fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",boxSizing:"border-box" }}/>{ferr.ec&&<p style={{ margin:"5px 0 0",fontSize:12,color:C.red,fontWeight:600 }}>{ferr.ec}</p>}</div>
          <div style={{ display:"flex",gap:12,alignItems:"center" }}>
            <button onClick={save} style={{ padding:"11px 24px",border:"none",borderRadius:10,background:"linear-gradient(135deg,#047857,#059669)",color:"white",fontWeight:800,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:"0 4px 12px rgba(5,150,105,.3)" }}><Ic n="check" s={15} c="white"/> Save Changes</button>
            {saved&&<div style={{ display:"flex",alignItems:"center",gap:7,color:"#16a34a",fontWeight:800,fontSize:13 }}><Ic n="check" s={15} c="#16a34a"/> Updated successfully</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  ROOT APP
// ═══════════════════════════════════════════════════════════════════
const SESSION_KEY = "lifeid.session.v1";

const ROLE_PAGES = {
  [ROLES.ADMIN]: ["overview", "hospitals", "users", "logs"],
  [ROLES.DOCTOR]: ["overview", "emergency", "notif"],
  [ROLES.RECORDS]: ["overview", "register", "search", "update"],
  [ROLES.PATIENT]: ["overview", "medical", "qrcard", "history", "contact"],
};

const isValidSubRoute = (role, sub) => {
  if (!role) return false;
  return ROLE_PAGES[role]?.includes(sub);
};

const getDefaultSubRoute = (role) => ROLE_PAGES[role]?.[0] || "overview";

const parseHashRoute = () => {
  if (typeof window === "undefined") return { route: null, sub: null };

  const raw = window.location.hash.replace(/^#\/?/, "");
  if (!raw) return { route: null, sub: null };

  const [route, sub] = raw.split("/");
  if (route === "landing" || route === "login") return { route, sub: null };
  if (route === "dashboard") return { route, sub: sub || "overview" };

  return { route: null, sub: null };
};

const getInitialState = () => {
  let state = {
    route: "landing",
    user: null,
    sub: "overview",
  };

  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const nextUser = saved?.user?.role ? USERS[saved.user.role] : null;
        const nextSub = nextUser && isValidSubRoute(nextUser.role, saved?.sub)
          ? saved.sub
          : getDefaultSubRoute(nextUser?.role);

        if (nextUser) {
          if (saved?.token) {
            saveAuthToken(saved.token);
          }
          state = {
            route: "dashboard",
            user: nextUser,
            sub: nextSub,
          };
        }
      }
    } catch (error) {
      console.warn("Failed to restore session state:", error);
    }

    const hashState = parseHashRoute();
    if (hashState.route === "landing" || hashState.route === "login") {
      state = {
        route: hashState.route,
        user: null,
        sub: "overview",
      };
    }

    if (hashState.route === "dashboard") {
      if (state.user) {
        state = {
          ...state,
          route: "dashboard",
          sub: isValidSubRoute(state.user.role, hashState.sub)
            ? hashState.sub
            : getDefaultSubRoute(state.user.role),
        };
      } else {
        state = {
          route: "login",
          user: null,
          sub: "overview",
        };
      }
    }
  }

  return state;
};

export default function App() {
  const initial = getInitialState();
  const [route,setRoute]=useState(initial.route); const [user,setUser]=useState(initial.user); const [sub,setSub]=useState(initial.sub); const [toastData,setToastData]=useState(null);

  const syncHash = useCallback((nextRoute, nextUser, nextSub) => {
    if (typeof window === "undefined") return;

    let hash = "#/landing";
    if (nextRoute === "login") hash = "#/login";
    if (nextRoute === "dashboard" && nextUser) hash = `#/dashboard/${nextSub}`;

    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", hash);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const payload = user
      ? { user: { role: user.role, id: user.id }, sub: isValidSubRoute(user.role, sub) ? sub : getDefaultSubRoute(user.role), token: getSavedAuthToken() }
      : { user: null, sub: "overview", token: "" };

    window.localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    syncHash(route, user, sub);
  }, [route, user, sub, syncHash]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onHashChange = () => {
      const { route: hashRoute, sub: hashSub } = parseHashRoute();

      if (hashRoute === "landing" || hashRoute === "login") {
        setRoute(hashRoute);
        setUser(null);
        setSub("overview");
        return;
      }

      if (hashRoute === "dashboard") {
        if (!user) {
          setRoute("login");
          return;
        }

        const safeSub = isValidSubRoute(user.role, hashSub)
          ? hashSub
          : getDefaultSubRoute(user.role);

        setRoute("dashboard");
        setSub(safeSub);
      }
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [user]);

  const toast=(msg,type="success")=>setToastData({msg,type,k:Date.now()});
  const handleLogin=(u, token)=>{ if(token) saveAuthToken(token); setUser(u); setSub(getDefaultSubRoute(u.role)); setRoute("dashboard"); };
  const handleLogout=()=>{ clearAuthToken(); setUser(null); setSub("overview"); setRoute("landing"); };
  const nav=p=>{ if(p==="logout"){handleLogout();return;} if(["landing","login"].includes(p)){setRoute(p);return;} if(user&&isValidSubRoute(user.role,p)){setSub(p);} };

  const renderDashboard=()=>{
    const R=user.role;
    if(R===ROLES.ADMIN){ if(sub==="hospitals")return <AdminHospitals toast={toast}/>; if(sub==="users")return <AdminUsers/>; if(sub==="logs")return <AdminLogs/>; return <AdminOverview/>; }
    if(R===ROLES.DOCTOR){ if(sub==="emergency")return <EmergencyAccess user={user}/>; if(sub==="notif")return <DoctorNotifications/>; return <DoctorOverview user={user}/>; }
    if(R===ROLES.RECORDS){ if(sub==="register")return <PatientRegistration toast={toast}/>; if(sub==="search")return <RecordSearch/>; if(sub==="update")return <RecordUpdate user={user}/>; return <RecordsOverview user={user}/>; }
    if(R===ROLES.PATIENT){ if(sub==="medical")return <MedicalRecords user={user}/>; if(sub==="qrcard")return <QRCard user={user}/>; if(sub==="history")return <AccessHistory/>; if(sub==="contact")return <UpdateContact toast={toast}/>; return <PatientOverview user={user}/>; }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {route==="landing"   && <Landing onNav={nav}/>}
      {route==="login"     && <Login   onLogin={handleLogin} onNav={nav}/>}
      {route==="dashboard" && user && <Shell user={user} page={sub} onNav={nav}>{renderDashboard()}</Shell>}
      {toastData&&<Toast key={toastData.k} msg={toastData.msg} type={toastData.type} onDone={()=>setToastData(null)}/>}
    </>
  );
}
