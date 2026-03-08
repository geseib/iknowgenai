import { useState } from "react";
import {
  Brain,
  Lightning,
  Key,
} from "@phosphor-icons/react";
import { Card, Label, H1, Body, TriviaBox, TeacherNote } from "./shared";

const notes = [
  "Analogy that works well: attention is reading the room and figuring out who's related to whom. MLP is flipping through your entire memory to decide what it all means.",
  "The 4\u00d7 expansion in the hidden layer is worth pausing on. Ask: 'Why would you make it bigger in the middle?' Answer: more room to consider possibilities before narrowing back down.",
  "A good physical analogy: breathing in deeply before answering a hard question. The 'expand then compress' pattern gives the model room to think.",
  "After the animation: 'Every single layer of the model does Attention + MLP, then passes the result to the next layer. How many layers do you think there are?' (96)",
];

function Nodes({ count, lit, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{
          width: 16, height: 16, borderRadius: "50%",
          background: lit ? color : "rgba(255,255,255,.14)",
          border: `1.5px solid ${lit ? color : "rgba(255,255,255,.2)"}`,
          boxShadow: lit ? `0 0 8px ${color}` : "none",
          transition: "all .35s ease",
        }} />
      ))}
    </div>
  );
}

function Arrow({ lit, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{
        width: 28, height: 2,
        background: lit ? color : "rgba(255,255,255,.15)",
        transition: "background .35s ease",
        boxShadow: lit ? `0 0 6px ${color}` : "none",
      }} />
      <div style={{
        width: 0, height: 0,
        borderTop: "5px solid transparent",
        borderBottom: "5px solid transparent",
        borderLeft: `7px solid ${lit ? color : "rgba(255,255,255,.15)"}`,
        transition: "border-color .35s ease",
      }} />
    </div>
  );
}

export default function SectionMLP({ color, mode }) {
  const [phase, setPhase] = useState(0);
  const [hasRun, setHasRun] = useState(false);
  const running = phase > 0 && phase < 4;

  const run = () => {
    setPhase(1); setHasRun(true);
    setTimeout(() => setPhase(2), 700);
    setTimeout(() => setPhase(3), 1400);
    setTimeout(() => setPhase(4), 2200);
  };

  const layers = [
    { label: "Input",  nodes: 5, lit: phase >= 1, desc: "Context from Attention" },
    { label: "Hidden", nodes: 8, lit: phase >= 2, desc: "4\u00d7 bigger! Room to think" },
    { label: "Output", nodes: 5, lit: phase >= 3, desc: "Richer, smarter signal" },
  ];

  return (
    <div className="fade-up">
      <Label color={color} text="HOW AI THINKS \u00b7 STEP 4" />
      <H1>The Thinking Layer</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />
      <Body>Attention figured out <em>which words relate</em>. Now the MLP layer does the heavy thinking \u2014 connecting what it's reading to <strong style={{ color }}>everything it ever learned</strong>.</Body>
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          {layers.map((l, i, arr) => (
            <div key={l.label} style={{ display: "contents" }}>
              <div style={{ textAlign: "center", minWidth: 70 }}>
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 13, color: l.lit ? color : "rgba(255,255,255,.35)", marginBottom: 8, transition: "color .3s" }}>{l.label}</div>
                <Nodes count={l.nodes} lit={l.lit} color={color} />
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 8, maxWidth: 80, lineHeight: 1.35 }}>{l.desc}</div>
              </div>
              {i < arr.length - 1 && <Arrow lit={phase >= i + 2} color={color} />}
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center" }}>
          <button onClick={phase === 0 || phase === 4 ? run : undefined} disabled={running} className="cta-btn" style={{ background: color, color: "#000", margin: "0 auto", display: "inline-flex", alignItems: "center", gap: 6 }}>
            {running
              ? <><Lightning size={16} weight="duotone" /> Processing...</>
              : phase === 4 ? "\u25b6 Run Again" : "\u25b6 Fire it up!"}
          </button>
        </div>
      </Card>
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: "'Fredoka',sans-serif", color: "white", fontSize: 16, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <Key size={18} weight="duotone" color={color} /> Analogy
        </div>
        <p style={{ color: "rgba(255,255,255,.62)", fontSize: 14, lineHeight: 1.6 }}>
          <strong style={{ color }}>Attention</strong> is reading the room \u2014 figuring out who's talking to whom.<br />
          <strong style={{ color }}>MLP</strong> is flipping through your entire memory to decide what it all means.
        </p>
      </Card>
      <TriviaBox visible={hasRun} color={color} number="49,152" label="neurons in the hidden layer"
        fact="The MLP hidden layer is 4\u00d7 the size of the input \u2014 giving the model enormous room to think before passing signals on to the next layer." />
    </div>
  );
}
