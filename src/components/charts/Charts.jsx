import { C } from "../../tokens/colors";
import { Ic } from "../icons/Ic";

export const Sparkline = ({ data, color="#2563eb", height=40, width=100 }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v,i) => {
    const x = (i/(data.length-1))*width;
    const y = height - ((v-min)/range)*(height-8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const ptsStr = pts.join(" ");
  const lastPt = pts[pts.length-1].split(",");
  return (
    <svg width={width} height={height} style={{ overflow:"visible", display:"block" }}>
      <defs>
        <linearGradient id={`sg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${ptsStr} ${width},${height}`} fill={`url(#sg${color.replace("#","")})`}/>
      <polyline points={ptsStr} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={lastPt[0]} cy={lastPt[1]} r="3" fill={color} stroke="white" strokeWidth="1.5"/>
    </svg>
  );
};

export const MiniBar = ({ data, color="#2563eb", height=36, width=80 }) => {
  const max = Math.max(...data, 1);
  const n = data.length;
  const bw = Math.max(4, (width/n) - 3);
  return (
    <svg width={width} height={height}>
      {data.map((v,i) => {
        const bh = Math.max(3, (v/max)*(height-2));
        return <rect key={i} x={i*((width)/n)+1} y={height-bh} width={bw} height={bh} rx="2"
          fill={color} opacity={i===n-1?1:0.35}/>;
      })}
    </svg>
  );
};

export const Donut = ({ value, total, color="#2563eb", size=68 }) => {
  const r=(size-10)/2, cx=size/2, cy=size/2;
  const circ=2*Math.PI*r, pct=total>0?Math.min(value/total,1):0;
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="8"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"/>
      </svg>
      <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
        <span style={{ fontSize:12,fontWeight:900,color,fontFamily:"'DM Mono',monospace" }}>{Math.round(pct*100)}%</span>
      </div>
    </div>
  );
};

export const ProgressBar = ({ label, value, max, color="#2563eb" }) => (
  <div style={{ marginBottom:13 }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
      <span style={{ fontSize:12.5, fontWeight:600, color:C.textSub }}>{label}</span>
      <span style={{ fontSize:11.5, fontWeight:700, color, fontFamily:"'DM Mono',monospace" }}>{value}<span style={{ color:C.mutedLight }}>/{max}</span></span>
    </div>
    <div style={{ height:5, background:"#f1f5f9", borderRadius:10, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${Math.min((value/max)*100,100)}%`, background:color, borderRadius:10, transition:"width .6s ease" }}/>
    </div>
  </div>
);

export const FeedItem = ({ icon, color="#2563eb", title, sub, time }) => (
  <div style={{ display:"flex", gap:11, alignItems:"flex-start", padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
    <div style={{ width:32, height:32, borderRadius:8, background:`${color}12`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <Ic n={icon} s={14} c={color}/>
    </div>
    <div style={{ flex:1, minWidth:0 }}>
      <p style={{ margin:0, fontSize:12.5, fontWeight:700, color:C.text }}>{title}</p>
      <p style={{ margin:"2px 0 0", fontSize:11.5, color:C.muted }}>{sub}</p>
    </div>
    <span style={{ fontSize:11, color:C.mutedLight, whiteSpace:"nowrap" }}>{time}</span>
  </div>
);
