import { useState } from "react";
import { Sparkle } from "@phosphor-icons/react";
import { Card, Label, H1, Body, TriviaBox, TeacherNote } from "./shared";

const nums = ["0.23", "-0.81", "0.45", "0.12", "-0.67", "0.89", "-0.34", "0.56", "0.71", "-0.22"];

const notes = [
  "The goal here is jaw-dropping surprise. Pause after 'tap to reveal' and let the numbers appear without commentary first.",
  "After the numbers appear, ask the class: 'If these numbers somehow represent the word cat, what do you think they might be measuring?' Take guesses \u2014 'cuteness', 'softness', 'smallness' are all valid intuitions.",
  "Key point: the AI doesn't process the letters C-A-T at all. It only ever sees the numbers. This is a genuinely counterintuitive fact that lands well with most people.",
  "Follow-up: 'How many numbers do you think represent one word?' Let them guess before revealing 12,288.",
];

export default function SectionHook({ color, mode }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="fade-up">
      <Label color={color} text="HOW AI THINKS \u00b7 STEP 1" />
      <H1>The Secret: Numbers</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />
      <Body>Before AI can think about words, it has to translate them into something computers understand: numbers. A <em>lot</em> of numbers.</Body>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 34, color, background: `${color}18`, border: `2px solid ${color}50`, borderRadius: 10, padding: "10px 18px" }}>"cat"</div>
          <div style={{ fontSize: 26, color: "rgba(255,255,255,.3)" }}>&rarr;</div>
          {!revealed ? (
            <button onClick={() => setRevealed(true)} style={{
              fontFamily: "'Fredoka',sans-serif", fontSize: 15, color: `${color}99`,
              background: `${color}12`, border: `1px dashed ${color}50`, borderRadius: 10,
              padding: "10px 18px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              tap to reveal <Sparkle size={16} weight="duotone" color={color} />
            </button>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, flex: 1 }}>
              {nums.map((n, i) => (
                <span key={i} style={{
                  fontFamily: "monospace", fontSize: 13, background: "rgba(255,255,255,.07)",
                  borderRadius: 6, padding: "3px 7px", color: "rgba(255,255,255,.8)",
                  animation: `slideIn .25s ${i * .04}s ease both`,
                }}>{n}</span>
              ))}
              <span style={{
                fontFamily: "monospace", fontSize: 13, background: "rgba(255,255,255,.07)",
                borderRadius: 6, padding: "3px 7px", color: `${color}99`,
                animation: `slideIn .25s ${nums.length * .04}s ease both`,
              }}>...+12,278 more</span>
            </div>
          )}
        </div>
        {revealed && (
          <p style={{ marginTop: 14, color: "rgba(255,255,255,.55)", fontSize: 14 }}>
            Every word becomes a list of numbers called a <span style={{ color, fontWeight: 700 }}>vector</span>. The AI never reads the actual letters!
          </p>
        )}
      </Card>
      <TriviaBox visible={revealed} color={color} number="12,288" label="numbers per word"
        fact="Claude turns every single word-token into 12,288 numbers. That's more numbers than seconds in a 3.5-hour movie!" />
    </div>
  );
}
