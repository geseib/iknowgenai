import { useState, useEffect, useRef } from "react";
import {
  ArrowDown,
  HashStraight,
  MapTrifold,
  Flashlight,
  Brain,
  MagicWand,
} from "@phosphor-icons/react";
import { Label, H1, TeacherNote } from "./shared";

const STEP_ICONS = [HashStraight, MapTrifold, Flashlight, Brain, MagicWand];

const steps = [
  { step: "1", text: "Every word gets turned into a list of numbers the computer can work with." },
  { step: "2", text: "Those numbers place each word in a giant 'meaning space' where similar words cluster together." },
  { step: "3", text: "The model learns to pay attention to the right words to understand what things mean in context." },
  { step: "4", text: "It runs the information through many layers of 'thinking' to understand it more deeply." },
  { step: "5", text: "Then it predicts the most likely next word — and repeats the whole thing, word by word." },
];

const notes = [
  "This is the transition beat — use it as a dramatic pause before diving into the technical content.",
  "Good framing: 'We know what LLMs are and who makes them. Now we're going to open the hood and look at the engine. This is the part most adults don't know.'",
  "You can ask the class to predict: 'How do YOU think reading millions of books could teach a computer to write?' Take a few guesses. Don't reveal yet — let the curiosity build.",
  "The sections that follow (Numbers, Space, Attention, Thinking Layer, Predict) each answer a piece of this question. Remind kids they can hold questions and revisit.",
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

export default function SectionTheBridge({ color, mode }) {
  const [step, setStep] = useState(0);
  const step1Ref = useRef(null);

  const advance = () => {
    if (step < 1) setStep(s => s + 1);
  };

  // Keyboard: down arrow advances steps
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (step < 1) {
          advance();
        } else {
          window.dispatchEvent(new Event("sectionFullyRevealed"));
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step]);

  // Auto-scroll to newly revealed step
  useEffect(() => {
    const target = step === 1 ? step1Ref.current : null;
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [step]);

  return (
    <div className="fade-up">
      <Label color={color} mode={mode} text="MEET THE LLMS · THE BRIDGE" />
      <H1>The Big Question</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />

      {/* ── Step 0: The big dramatic question ── */}
      <div style={{ minHeight: "50vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 32,
          color: "white",
          textAlign: "center",
          lineHeight: 1.5,
          marginBottom: 16,
        }}>
          These models read
        </div>

        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 40,
          fontWeight: 700,
          color,
          textAlign: "center",
          lineHeight: 1.3,
          marginBottom: 24,
        }}>
          BILLIONS of words...
        </div>

        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 28,
          color: "rgba(255,255,255,.5)",
          textAlign: "center",
          lineHeight: 1.5,
        }}>
          ...but <span style={{ color: "white" }}>HOW</span> did that teach them to{" "}
          <span style={{ color: "white" }}>write back?</span>
        </div>

        {step === 0 && (
          <ContinueButton onClick={advance} color={color} label="I want to know!" />
        )}
      </div>

      {/* ── Step 1: The 5-step overview ── */}
      {step >= 1 && (
        <div
          ref={step1Ref}
          style={{
            animation: "fadeUp .5s ease",
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 24,
          }}
        >
          {steps.map((s, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 18,
                  animation: `fadeUp .4s ${i * 0.1}s ease both`,
                }}
              >
                {/* Number circle */}
                <div style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#000",
                  background: color,
                  borderRadius: "50%",
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {s.step}
                </div>

                {/* Icon */}
                <Icon size={28} weight="duotone" color={color} style={{ flexShrink: 0 }} />

                {/* Text */}
                <div style={{
                  fontSize: 20,
                  color: "rgba(255,255,255,.8)",
                  lineHeight: 1.5,
                }}>
                  {s.text}
                </div>
              </div>
            );
          })}

          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 22,
            color,
            textAlign: "center",
            marginTop: 28,
            lineHeight: 1.4,
          }}>
            Ready to see each step in action?
          </div>
        </div>
      )}
    </div>
  );
}
