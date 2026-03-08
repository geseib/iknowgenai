import { useState } from "react";
import {
  HashStraight,
  MapTrifold,
  Flashlight,
  Brain,
  MagicWand,
} from "@phosphor-icons/react";
import { Card, Label, H1, Body, TeacherNote } from "./shared";

const STEP_ICONS = [HashStraight, MapTrifold, Flashlight, Brain, MagicWand];

const steps = [
  { step: "1", text: "Every word gets turned into a list of numbers the computer can work with." },
  { step: "2", text: "Those numbers place each word in a giant 'meaning space' where similar words cluster together." },
  { step: "3", text: "The model learns to pay attention to the right words to understand what things mean in context." },
  { step: "4", text: "It runs the information through many layers of 'thinking' to understand it more deeply." },
  { step: "5", text: "Then it predicts the most likely next word \u2014 and repeats the whole thing, word by word." },
];

const notes = [
  "This is the transition beat \u2014 use it as a dramatic pause before diving into the technical content.",
  "Good framing: 'We know what LLMs are and who makes them. Now we're going to open the hood and look at the engine. This is the part most adults don't know.'",
  "You can ask the class to predict: 'How do YOU think reading millions of books could teach a computer to write?' Take a few guesses. Don't reveal yet \u2014 let the curiosity build.",
  "The sections that follow (Numbers, Space, Attention, Thinking Layer, Predict) each answer a piece of this question. Remind kids they can hold questions and revisit.",
];

export default function SectionTheBridge({ color, mode }) {
  const [phase, setPhase] = useState(0);

  return (
    <div className="fade-up">
      <Label color={color} text="MEET THE LLMS \u00b7 THE BRIDGE" />
      <H1>The Big Question</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />
      {phase === 0 && (
        <div style={{ animation: "fadeUp .4s ease" }}>
          <Card style={{ textAlign: "center", padding: "32px 24px", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 24, color: "white", lineHeight: 1.5, marginBottom: 20 }}>
              These models read<br /><span style={{ color, fontSize: 32, fontWeight: 700 }}>billions of words...</span>
            </div>
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: "rgba(255,255,255,.5)", marginBottom: 20 }}>
              ...but HOW did reading all that text teach them to <span style={{ color: "white" }}>write and talk back?</span>
            </div>
            <button onClick={() => setPhase(1)} className="cta-btn" style={{ background: color, color: "#000", margin: "0 auto" }}>
              I want to know! &rarr;
            </button>
          </Card>
        </div>
      )}
      {phase === 1 && (
        <div style={{ animation: "fadeUp .4s ease" }}>
          <Body>Great question. Here's the short answer \u2014 then we're going to show you each piece live:</Body>
          {steps.map((s, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12, animation: `fadeUp .3s ${i * .08}s ease both` }}>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif", fontSize: 13, fontWeight: 700, color: "#000",
                  background: color, borderRadius: "50%", width: 24, height: 24,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
                }}>
                  {s.step}
                </div>
                <div style={{ fontSize: 15, color: "rgba(255,255,255,.7)", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <Icon size={20} weight="duotone" color={color} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{s.text}</span>
                </div>
              </div>
            );
          })}
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 15, color: `${color}99`, marginBottom: 10 }}>Ready to see each step in action?</div>
          </div>
        </div>
      )}
    </div>
  );
}
