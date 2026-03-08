import { useState, useEffect, useRef } from "react";
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
  ArrowDown,
} from "@phosphor-icons/react";
import { Label, H1, TeacherNote } from "./shared";

const scenarios = [
  { Icon: Calculator,     label: "A calculator adds 2+2",              answer: "regular", why: "The rule '2+2=4' was written in by a programmer. It never learned — it just follows instructions." },
  { Icon: Cat,            label: "An app tells a cat from a dog",      answer: "ai",      why: "No one wrote 'if pointy ears and whiskers, then cat.' It looked at millions of cat and dog photos and figured it out." },
  { Icon: TrafficSignal,  label: "Traffic lights change on a timer",   answer: "regular", why: "It's just a countdown clock — the timing was programmed in. No learning, no adapting." },
  { Icon: MusicNote,      label: "Spotify picks your next song",       answer: "ai",      why: "It learned what songs you skip, replay, and like — and uses that to guess what you'll love next." },
  { Icon: DeviceMobile,   label: "Your phone screen turns off after 30s", answer: "regular", why: "A programmer set the rule: 'after 30 seconds of no touching, turn off the screen.'" },
  { Icon: Aperture,       label: "Your camera auto-focuses on a face", answer: "ai",      why: "It learned what faces look like from millions of photos. Nobody described a face in code." },
];

const notes = [
  "The key concept here: traditional programming is explicit — every rule must be written out. AI is implicit — the rules emerge from patterns in data.",
  "Use the bike analogy: you can't learn to ride a bike by reading instructions. You learn by doing — falling, adjusting, improving. That's closer to how AI learns.",
  "A great class question: 'If I showed you 1,000 pictures of cats and 1,000 pictures of dogs, could you learn to tell them apart without anyone explaining the rules?' That's exactly what AI does.",
  "Watch for the misconception that 'AI = smart = always right.' Emphasize that AI learns from examples, so if the examples are bad, the AI learns bad patterns — this is called 'bias.'",
];

function ContinueButton({ onClick, color, label }) {
  return (
    <div style={{ textAlign: "center", marginTop: 28, marginBottom: 16 }}>
      <button
        onClick={onClick}
        className="cta-btn"
        style={{
          background: color,
          color: "#000",
          fontSize: 20,
          padding: "14px 32px",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {label} <ArrowDown size={20} weight="bold" />
      </button>
    </div>
  );
}

function ScenarioCard({ scenario, color }) {
  const isAI = scenario.answer === "ai";
  return (
    <div style={{
      borderRadius: 18,
      overflow: "hidden",
      border: `2px solid ${isAI ? color : "rgba(255,255,255,.35)"}`,
      background: "rgba(255,255,255,.04)",
      padding: "24px 28px",
      display: "flex",
      flexDirection: "column",
      gap: 14,
    }}>
      {/* Icon + Label */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <scenario.Icon
          size={40}
          weight="duotone"
          color={isAI ? color : "rgba(255,255,255,.6)"}
        />
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 22,
          color: "white",
          flex: 1,
        }}>
          {scenario.label}
        </div>
        {/* Answer badge */}
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 18,
          fontWeight: 700,
          color: isAI ? color : "rgba(255,255,255,.7)",
          padding: "6px 16px",
          borderRadius: 24,
          background: isAI ? `${color}20` : "rgba(255,255,255,.08)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexShrink: 0,
        }}>
          {isAI
            ? <><Robot size={20} weight="duotone" /> AI</>
            : <><ClipboardText size={20} weight="duotone" /> Regular</>}
        </div>
      </div>
      {/* Why text */}
      <div style={{
        fontSize: 18,
        color: "rgba(255,255,255,.6)",
        lineHeight: 1.55,
        paddingLeft: 56,
      }}>
        {scenario.why}
      </div>
    </div>
  );
}

export default function SectionProgramsVsAI({ color, mode }) {
  const [step, setStep] = useState(0);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

  const advance = () => {
    if (step < 3) setStep(s => s + 1);
  };

  // Keyboard: down arrow advances steps
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowDown" && step < 3) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step]);

  // Auto-scroll to newly revealed step
  useEffect(() => {
    const refs = [null, step1Ref, step2Ref, step3Ref];
    const target = refs[step]?.current;
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [step]);

  return (
    <div className="fade-up">
      <Label color={color} text="INTRODUCTION · HOW AI IS DIFFERENT" />
      <H1>Rules vs Learning</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />

      {/* ── Step 0: Intro + first 2 scenarios ── */}
      <div style={{
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}>
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 28,
          color: "white",
          textAlign: "center",
          lineHeight: 1.4,
          marginBottom: 32,
        }}>
          Can you tell which is <strong style={{ color }}>AI</strong> and which is a <strong style={{ color: "rgba(255,255,255,.7)" }}>regular program</strong>?
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {scenarios.slice(0, 2).map((s, i) => (
            <div key={i} style={{ animation: `fadeUp .5s ${i * 0.15}s ease both` }}>
              <ScenarioCard scenario={s} color={color} />
            </div>
          ))}
        </div>

        {step === 0 && (
          <ContinueButton onClick={advance} color={color} label="Next two" />
        )}
      </div>

      {/* ── Step 1: Scenarios 3-4 (traffic lights + Spotify) ── */}
      {step >= 1 && (
        <div
          ref={step1Ref}
          style={{
            animation: "fadeUp .5s ease",
            minHeight: "50vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 24,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {scenarios.slice(2, 4).map((s, i) => (
              <div key={i} style={{ animation: `fadeUp .5s ${i * 0.15}s ease both` }}>
                <ScenarioCard scenario={s} color={color} />
              </div>
            ))}
          </div>

          {step === 1 && (
            <ContinueButton onClick={advance} color={color} label="Last two" />
          )}
        </div>
      )}

      {/* ── Step 2: Scenarios 5-6 (phone screen + camera) ── */}
      {step >= 2 && (
        <div
          ref={step2Ref}
          style={{
            animation: "fadeUp .5s ease",
            minHeight: "50vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 24,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {scenarios.slice(4, 6).map((s, i) => (
              <div key={i} style={{ animation: `fadeUp .5s ${i * 0.15}s ease both` }}>
                <ScenarioCard scenario={s} color={color} />
              </div>
            ))}
          </div>

          {step === 2 && (
            <ContinueButton onClick={advance} color={color} label="The big idea" />
          )}
        </div>
      )}

      {/* ── Step 3: The big insight ── */}
      {step >= 3 && (
        <div
          ref={step3Ref}
          style={{
            animation: "fadeUp .5s ease",
            minHeight: "50vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 24,
          }}
        >
          <div style={{
            padding: "28px 36px",
            background: `${color}12`,
            border: `2px solid ${color}35`,
            borderRadius: 20,
            maxWidth: 640,
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
          }}>
            <Lightbulb size={36} weight="duotone" color={color} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 22,
              color: "rgba(255,255,255,.8)",
              lineHeight: 1.6,
            }}>
              <strong style={{ color }}>The big difference:</strong> A regular program needs someone to write every rule. AI learns the rules itself — just by looking at enough examples.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
