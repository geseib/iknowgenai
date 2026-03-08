import { useState } from "react";
import {
  Brain,
  Robot,
  Handshake,
  Shuffle,
  Lightbulb,
} from "@phosphor-icons/react";
import { Card, Label, H1, Body, TeacherNote } from "./shared";

const rows = [
  { topic: "How it learns",       brain: "From experience and practice",          ai: "From millions of training examples",     match: true },
  { topic: "Can make mistakes",   brain: "Yes \u2014 humans get things wrong",    ai: "Yes \u2014 AI gets things wrong too!",    match: true },
  { topic: "Has emotions",        brain: "Yes \u2014 fear, joy, love, boredom",   ai: "No \u2014 it just processes text",         match: false },
  { topic: "Gets tired",          brain: "Yes \u2014 needs sleep and rest",        ai: "No \u2014 it can run 24/7",               match: false },
  { topic: "Remembers everything",brain: "No \u2014 we forget lots of things",    ai: "Only what it was trained on",             match: false },
  { topic: "Understands meaning", brain: "Deeply \u2014 we live in the world",    ai: "Sort of \u2014 in a very different way",   match: false },
  { topic: "Can be creative",     brain: "Yes \u2014 art, music, stories",        ai: "Sort of \u2014 by remixing patterns",      match: true },
];

const notes = [
  "Kids often ask 'does AI think like us?' \u2014 it's worth being honest: we don't fully know. What we do know is that it processes differently from a human brain.",
  "The 'can be creative' row often sparks good debate. AI combines and remixes patterns from training data. Is that 'real' creativity? Great open question for the class.",
  "Key point: AI was inspired by neurons and how brains connect, but an AI model is ultimately a giant math function \u2014 billions of multiplication operations happening in sequence.",
  "Avoid saying AI 'knows' or 'understands' things the way humans do. Safer phrasing: 'it processes' or 'it was trained on' to avoid overclaiming.",
  "Great discussion question: 'What would AI need to have before you'd say it was truly like a brain?'",
];

export default function SectionBrainVsAI({ color, mode }) {
  const [revealed, setRevealed] = useState(new Set());
  const allDone = revealed.size === rows.length;

  return (
    <div className="fade-up">
      <Label color={color} text="INTRODUCTION \u00b7 BRAIN VS AI" />
      <H1>Brain vs AI</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />
      <Body>AI was inspired by the brain \u2014 but how similar are they really? Tap each row to find out.</Body>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {rows.map((r, i) => {
          const rev = revealed.has(i);
          return (
            <div key={i}
              onClick={() => !rev && setRevealed(p => new Set([...p, i]))}
              style={{
                borderRadius: 12,
                border: `1.5px solid ${rev ? (r.match ? "rgba(255,255,255,.2)" : color + "60") : "rgba(255,255,255,.1)"}`,
                cursor: rev ? "default" : "pointer",
                transition: "all .2s ease",
                overflow: "hidden",
              }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(255,255,255,.04)" }}>
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 15, color: "white" }}>{r.topic}</div>
                {!rev && <span style={{ fontSize: 12, color, fontFamily: "'Fredoka',sans-serif" }}>tap to compare &darr;</span>}
                {rev && (
                  r.match
                    ? <Handshake size={20} weight="duotone" color="rgba(255,255,255,.6)" />
                    : <Shuffle size={20} weight="duotone" color={color} />
                )}
              </div>
              {rev && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, borderTop: "1px solid rgba(255,255,255,.07)" }}>
                  <div style={{ padding: "10px 14px", background: "rgba(255,255,255,.03)" }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontFamily: "'Fredoka',sans-serif", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                      <Brain size={14} weight="duotone" /> BRAIN
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,.75)", lineHeight: 1.5 }}>{r.brain}</div>
                  </div>
                  <div style={{ padding: "10px 14px", background: `${color}08` }}>
                    <div style={{ fontSize: 11, color: `${color}99`, fontFamily: "'Fredoka',sans-serif", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                      <Robot size={14} weight="duotone" /> AI
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,.75)", lineHeight: 1.5 }}>{r.ai}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {allDone && (
        <div className="wow-reveal" style={{ padding: "14px 18px", background: `${color}12`, border: `1px solid ${color}35`, borderRadius: 12, fontSize: 15, color: "rgba(255,255,255,.7)", lineHeight: 1.6, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Lightbulb size={22} weight="duotone" color={color} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>AI and brains have more in common than you'd expect \u2014 and more differences too. The truth is, AI is something genuinely <strong style={{ color }}>new</strong>.</span>
        </div>
      )}
    </div>
  );
}
