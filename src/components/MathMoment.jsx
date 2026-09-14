// The "Math moment" strip. Renders nothing unless the lesson's Math setting
// reaches the moment's tier and the moment has copy for the current grade.
// Copy lives in src/data/math.js; this file is only the look.

import { Calculator } from "@phosphor-icons/react";
import { useGrade } from "../data/GradeContext";
import { useLesson } from "../data/lesson";
import { resolveMathMoment } from "../data/math";

const FONT = "'Fredoka',sans-serif";
const YELLOW = "#fee440";

export default function MathMoment({ id, data, compact = false, style }) {
  const grade = useGrade();
  const { math } = useLesson();
  const m = resolveMathMoment(id, grade, math, data);
  if (!m) return null;
  return (
    <div style={{
      width: "100%", maxWidth: compact ? 560 : 680, textAlign: "left",
      background: "#0b0e1a", border: `1px solid ${YELLOW}40`, borderRadius: 14,
      padding: compact ? "10px 14px" : "14px 18px", animation: "fadeUp .4s ease",
      ...style,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT, fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: YELLOW, marginBottom: 6 }}>
        <Calculator size={14} weight="duotone" /> Math moment{m.topic && <span style={{ color: `${YELLOW}99` }}> · {m.topic}</span>}
      </div>
      <div style={{ fontFamily: FONT, fontSize: compact ? 20 : 24, fontWeight: 700, color: "white", lineHeight: 1.25, fontVariantNumeric: "tabular-nums" }}>{m.big}</div>
      {m.note && <div style={{ fontSize: compact ? 13.5 : 15, color: "rgba(255,255,255,.55)", lineHeight: 1.5, marginTop: 6 }}>{m.note}</div>}
    </div>
  );
}
