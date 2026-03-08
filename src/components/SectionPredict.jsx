import { useState } from "react";
import {
  Snowflake,
  Scales,
  Fire,
  Flame,
  Star,
  ArrowCounterClockwise,
  Confetti,
  Lightbulb,
} from "@phosphor-icons/react";
import { Card, Label, H1, Body, TriviaBox, TeacherNote } from "./shared";
import { P_POSITIONS, applyTemp, sampleWord, tempMeta } from "../data/predict";

const TEMP_ICONS = {
  Frozen:   Snowflake,
  Cold:     Snowflake,
  Balanced: Scales,
  Warm:     Fire,
  Wild:     Flame,
};

const notes = [
  "The temperature slider is the big payoff of this section. Generate a sentence at temp 0.1 (frozen), then reset and generate again at temp 1.5 (wild). Show the class how the same prompt gives different results.",
  "Ask: 'At temperature zero, if you asked the same question 100 times, would you always get the same answer?' Yes \u2014 and explain that some AI tools set low temperature for consistent, reliable answers (like search or coding help).",
  "Ask: 'Why would you WANT high temperature?' Brainstorming, creative writing, generating lots of different ideas. Low temperature: factual Q&A, customer support, legal docs.",
  "The 'layer passes' counter is a great physical intuition-builder. By the end of a 9-word sentence you've run 864 layer passes. A real paragraph is thousands.",
  "Final discussion: 'Now that you know how AI works under the hood \u2014 does it change how you think about using it? What does it do well? What might it struggle with?'",
];

export default function SectionPredict({ color, mode }) {
  const [temp, setTemp] = useState(.8);
  const [words, setWords] = useState([]);
  const [layerCount, setLayerCount] = useState(0);

  const currentPos = words.length;
  const done = currentPos >= P_POSITIONS.length;
  const dist = done ? [] : applyTemp(P_POSITIONS[currentPos].candidates, temp);
  const tm = tempMeta(temp);
  const TempIcon = TEMP_ICONS[tm.name] || Scales;

  const pick = () => {
    if (done) return;
    setWords(w => [...w, sampleWord(dist)]);
    setLayerCount(c => c + 96);
  };

  const reset = () => { setWords([]); setLayerCount(0); };

  return (
    <div className="fade-up">
      <Label color={color} text="HOW AI THINKS \u00b7 STEP 6" />
      <H1>Predict!</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />
      <Body>All those layers \u2014 just to pick <strong style={{ color }}>one word</strong>. But here's the twist: AI has a <strong style={{ color }}>temperature dial</strong> that controls how adventurous or safe it is. Move it and watch the probabilities change!</Body>

      {/* Temperature slider card */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 19, color: "white", display: "flex", alignItems: "center", gap: 6 }}>
            <TempIcon size={22} weight="duotone" color={tm.bar} /> Temperature: <span style={{ color }}>{temp.toFixed(2)}</span>
          </div>
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 14, padding: "4px 14px", borderRadius: 20, background: `${tm.bar}20`, border: `1px solid ${tm.bar}60`, color: tm.bar }}>{tm.name}</div>
        </div>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 8, borderRadius: 4, transform: "translateY(-50%)", pointerEvents: "none", background: "linear-gradient(to right,#a0d8ef 0%,#00f5d4 20%,#fee440 50%,#fb5607 75%,#f15bb5 100%)" }} />
          <input type="range" min=".05" max="2.0" step=".05" value={temp} onChange={e => { setTemp(parseFloat(e.target.value)); reset(); }} className="temp-slider" />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,.3)", fontFamily: "'Fredoka',sans-serif", marginBottom: 10 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Snowflake size={12} weight="duotone" /> Frozen</span>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Scales size={12} weight="duotone" /> Balanced</span>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Flame size={12} weight="duotone" /> Wild</span>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.5, padding: "8px 12px", background: "rgba(255,255,255,.04)", borderRadius: 8 }}>{tm.desc}</div>
      </Card>

      {/* Probability bars */}
      {!done && (
        <Card style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontFamily: "'Fredoka',sans-serif", letterSpacing: 2, color: "rgba(255,255,255,.35)", textTransform: "uppercase", marginBottom: 12 }}>Next word at temp {temp.toFixed(2)}:</div>
          {dist.map(({ word, pct: p }, i) => (
            <div key={word} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
              <div style={{ width: 90, fontFamily: "'Fredoka',sans-serif", fontSize: 15, color: i === 0 ? color : "rgba(255,255,255,.5)", flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
                {i === 0 && <Star size={14} weight="duotone" color={color} />} {word}
              </div>
              <div style={{ flex: 1, height: 10, background: "rgba(255,255,255,.07)", borderRadius: 5, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${p}%`, borderRadius: 5, background: i === 0 ? color : "rgba(255,255,255,.2)", transition: "width .35s ease" }} />
              </div>
              <div style={{ width: 38, textAlign: "right", fontSize: 12, color: "rgba(255,255,255,.45)", flexShrink: 0 }}>{p}%</div>
            </div>
          ))}
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)", fontStyle: "italic", marginTop: 4 }}>&larr; Slide temperature to see bars shift live</div>
        </Card>
      )}

      {/* Generated sentence */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontFamily: "'Fredoka',sans-serif", letterSpacing: 2, color: "rgba(255,255,255,.35)", textTransform: "uppercase", marginBottom: 12 }}>Generated so far:</div>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 26, minHeight: 48, marginBottom: 16, lineHeight: 1.4 }}>
          {words.length === 0
            ? <span style={{ color: "rgba(255,255,255,.18)" }}>_ _ _ _ _ _ _ _ _</span>
            : words.map((w, i) => (
              <span key={i} style={{
                color: i === words.length - 1 ? color : "rgba(255,255,255,.85)",
                marginRight: w === "." ? 0 : 6,
                display: "inline-block",
                animation: i === words.length - 1 ? "fadeUp .3s ease" : "none",
              }}>{w}</span>
            ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          {!done
            ? <button onClick={pick} className="cta-btn" style={{ background: color, color: "#000" }}>
                {words.length === 0 ? "\u25b6 Generate first word" : "Pick next word \u2192"}
              </button>
            : <button onClick={reset} className="cta-btn" style={{ background: color, color: "#000", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <ArrowCounterClockwise size={16} weight="duotone" /> Try Again
              </button>}
          {layerCount > 0 && (
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>
              <span style={{ color, fontWeight: 700 }}>{layerCount.toLocaleString()}</span> layer passes used
            </div>
          )}
        </div>
      </Card>

      {/* Completion celebration */}
      {done && (
        <div style={{ textAlign: "center", padding: "22px", background: `${color}10`, border: `1px solid ${color}35`, borderRadius: 14, marginBottom: 14 }}>
          <Confetti size={40} weight="duotone" color={color} style={{ marginBottom: 8 }} />
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color, marginBottom: 8 }}>Sentence complete!</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,.6)", lineHeight: 1.65 }}>
            Change the temperature and try again \u2014 you'll get different words!<br />
            <span style={{ color: "rgba(255,255,255,.35)", fontSize: 13 }}>That's exactly why AI gives a different answer every time you ask the same question.</span>
          </div>
        </div>
      )}

      <TriviaBox visible={words.length > 0} color={color}
        number={layerCount > 0 ? layerCount.toLocaleString() : "5,760+"}
        label="layer passes so far"
        fact="A typical 60-word paragraph means running all 96 layers 60 times \u2014 over 5,760 layer passes just to say 'good morning'!" />
    </div>
  );
}
