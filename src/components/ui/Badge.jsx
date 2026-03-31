import { C } from "../../tokens/colors";

export const Badge = ({ children, tone = "blue", dot }) => {
  const map = { blue: [C.blueL, C.blue], green: [C.greenL, C.green], red: [C.redL, C.red], amber: [C.amberL, C.amber], purple: [C.purpleL, C.purple], gray: ["#f1f5f9", "#475569"] };
  const [bg, fg] = map[tone] || map.blue;
  return (
    <span style={{ background: bg, color: fg, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 5 }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: fg, flexShrink: 0 }} />}
      {children}
    </span>
  );
};
