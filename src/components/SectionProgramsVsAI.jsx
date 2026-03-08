import { useState } from "react";
import {
  Calculator,
  Cat,
  TrafficSignal,
  MusicNote,
  DeviceMobile,
  Aperture,
  Lightbulb,
  Robot,
  ClipboardText,
} from "@phosphor-icons/react";
import { Card, Label, H1, Body, TeacherNote } from "./shared";

const scenarios = [
  { Icon: Calculator,     label: "A calculator adds 2+2",              answer: "regular", why: "The rule '2+2=4' was written in by a programmer. It never learned \u2014 it just follows instructions." },
  { Icon: Cat,        label: "An app tells a cat from a dog",      answer: "ai",      why: "No one wrote 'if pointy ears and whiskers, then cat.' It looked at millions of cat and dog photos and figured it out." },
  { Icon: TrafficSignal,  label: "Traffic lights change on a timer",   answer: "regular", why: "It's just a countdown clock \u2014 the timing was programmed in. No learning, no adapting." },
  { Icon: MusicNote,      label: "Spotify picks your next song",       answer: "ai",      why: "It learned what songs you skip, replay, and like \u2014 and uses that to guess what you'll love next." },
  { Icon: DeviceMobile,   label: "Your phone screen turns off after 30s", answer: "regular", why: "A programmer set the rule: 'after 30 seconds of no touching, turn off the screen.'" },
  { Icon: Aperture,       label: "Your camera auto-focuses on a face", answer: "ai",      why: "It learned what faces look like from millions of photos. Nobody described a face in code." },
];

const notes = [
  "The key concept here: traditional programming is explicit \u2014 every rule must be written out. AI is implicit \u2014 the rules emerge from patterns in data.",
  "Use the bike analogy: you can't learn to ride a bike by reading instructions. You learn by doing \u2014 falling, adjusting, improving. That's closer to how AI learns.",
  "A great class question: 'If I showed you 1,000 pictures of cats and 1,000 pictures of dogs, could you learn to tell them apart without anyone explaining the rules?' That's exactly what AI does.",
  "Watch for the misconception that 'AI = smart = always right.' Emphasize that AI learns from examples, so if the examples are bad, the AI learns bad patterns \u2014 this is called 'bias.'",
];

export default function SectionProgramsVsAI({ color, mode }) {
  const [revealed, setRevealed] = useState(new Set());
  const allRevealed = revealed.size === scenarios.length;

  return (
    <div className="fade-up">
      <Label color={color} text="INTRODUCTION \u00b7 HOW AI IS DIFFERENT" />
      <H1>Rules vs Learning</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />
      <Body>Tap each scenario \u2014 is it a regular program following rules, or AI that learned from examples?</Body>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {scenarios.map((s, i) => {
          const r = revealed.has(i);
          return (
            <div key={i} style={{
              borderRadius: 14, overflow: "hidden",
              border: `1.5px solid ${r ? (s.answer === "ai" ? color : "rgba(255,255,255,.35)") : "rgba(255,255,255,.1)"}`,
              transition: "border-color .3s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "rgba(255,255,255,.04)" }}>
                <s.Icon size={28} weight="duotone" color={r ? (s.answer === "ai" ? color : "rgba(255,255,255,.6)") : "rgba(255,255,255,.5)"} />
                <div style={{ flex: 1, fontFamily: "'Fredoka',sans-serif", fontSize: 15, color: "white" }}>{s.label}</div>
                {!r && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setRevealed(p => new Set([...p, i]))}
                      style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 13, padding: "5px 12px", borderRadius: 20, cursor: "pointer", background: `${color}20`, border: `1px solid ${color}50`, color }}>
                      Regular?
                    </button>
                    <button onClick={() => setRevealed(p => new Set([...p, i]))}
                      style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 13, padding: "5px 12px", borderRadius: 20, cursor: "pointer", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.2)", color: "white" }}>
                      AI?
                    </button>
                  </div>
                )}
                {r && (
                  <div style={{
                    fontFamily: "'Fredoka',sans-serif", fontSize: 14, fontWeight: 700,
                    color: s.answer === "ai" ? color : "rgba(255,255,255,.7)",
                    padding: "4px 12px", borderRadius: 20,
                    background: s.answer === "ai" ? `${color}20` : "rgba(255,255,255,.08)",
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    {s.answer === "ai"
                      ? <><Robot size={16} weight="duotone" /> AI</>
                      : <><ClipboardText size={16} weight="duotone" /> Regular</>}
                  </div>
                )}
              </div>
              {r && (
                <div style={{ padding: "10px 16px", background: `${color}08`, fontSize: 13, color: "rgba(255,255,255,.6)", lineHeight: 1.55, borderTop: "1px solid rgba(255,255,255,.06)" }}>
                  {s.why}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {allRevealed && (
        <div className="wow-reveal" style={{ padding: "14px 18px", background: `${color}12`, border: `1px solid ${color}35`, borderRadius: 12, fontSize: 15, color: "rgba(255,255,255,.7)", lineHeight: 1.6, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Lightbulb size={22} weight="duotone" color={color} style={{ flexShrink: 0, marginTop: 2 }} />
          <span><strong style={{ color }}>The big difference:</strong> A regular program needs someone to write every rule. AI learns the rules itself \u2014 just by looking at enough examples.</span>
        </div>
      )}
    </div>
  );
}
