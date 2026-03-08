import { useState, useEffect, useRef } from "react";
import { Robot, Desktop, Brain, Lightbulb, ArrowDown } from "@phosphor-icons/react";
import { Card, Label, H1, TeacherNote } from "./shared";

const choices = [
  { id: "robot",   Icon: Robot,   label: "A robot",                response: "Great guess! But AI doesn't need a body. It can live entirely inside a computer — no arms, no legs required." },
  { id: "program", Icon: Desktop, label: "A really smart program", response: "You're onto something! It IS a program — but there's one important twist that makes it different from all other programs." },
  { id: "brain",   Icon: Brain,   label: "A digital brain",        response: "Interesting! AI was inspired by how brains work — but it doesn't have feelings, memories between chats, or consciousness." },
];

const notes = [
  "Ask the class to vote by raising hands for each option. Tally roughly and tap the winning answer.",
  "'Robot' is the most common misconception — great teaching opportunity. AI is software, not hardware.",
  "'Smart program' is the closest — acknowledge that. The key nuance: what makes AI different from a calculator?",
  "'Digital brain' opens a great philosophical discussion. AI was inspired by neurons, but doesn't have emotions.",
  "After the class votes and you reveal: ask 'what do you think ALL three answers are missing?'",
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

export default function SectionWhatIsAI({ color, mode }) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(null);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);

  const choice = choices.find(c => c.id === picked);

  const advance = () => {
    if (step < 2) setStep(s => s + 1);
  };

  const handlePick = (id) => {
    setPicked(id);
    setStep(1);
  };

  // Keyboard: down arrow advances steps
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (step < 2) {
          if (step === 0 && !picked) {
            // Default to first choice if none picked
            setPicked("robot");
          }
          advance();
        } else {
          window.dispatchEvent(new Event("sectionFullyRevealed"));
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step, picked]);

  // Auto-scroll to newly revealed step
  useEffect(() => {
    const target = step === 1 ? step1Ref.current : step === 2 ? step2Ref.current : null;
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [step]);

  return (
    <div className="fade-up">
      <Label color={color} text="INTRODUCTION · THE BIG QUESTION" />
      <H1>What IS AI?</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />

      {/* ── Step 0: Big question + 3 choice buttons ── */}
      <div style={{ minHeight: "50vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 28,
          color: "white",
          textAlign: "center",
          lineHeight: 1.4,
          marginBottom: 32,
        }}>
          What do you think AI is? Pick your best guess:
        </div>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          maxWidth: 480,
          margin: "0 auto",
          width: "100%",
        }}>
          {choices.map(c => (
            <button
              key={c.id}
              onClick={() => handlePick(c.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "18px 22px",
                borderRadius: 16,
                cursor: "pointer",
                transition: "all .2s ease",
                textAlign: "left",
                background: picked === c.id ? `${color}22` : "rgba(255,255,255,.05)",
                border: `2px solid ${picked === c.id ? color : "rgba(255,255,255,.12)"}`,
                boxShadow: picked === c.id ? `0 0 16px ${color}40` : "none",
                color: "white",
              }}
            >
              <c.Icon size={48} weight="duotone" color={picked === c.id ? color : "rgba(255,255,255,.5)"} />
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 22 }}>{c.label}</div>
            </button>
          ))}
        </div>

        {step === 0 && picked && (
          <ContinueButton onClick={advance} color={color} label="See answer" />
        )}
      </div>

      {/* ── Step 1: Response for chosen answer ── */}
      {step >= 1 && choice && (
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
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            justifyContent: "center",
            marginBottom: 20,
          }}>
            <choice.Icon size={44} weight="duotone" color={color} />
            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 26,
              color: "white",
            }}>
              You picked: {choice.label}
            </div>
          </div>

          <Card style={{
            background: `${color}0d`,
            border: `1px solid ${color}35`,
            maxWidth: 560,
            margin: "0 auto",
          }}>
            <p style={{
              fontSize: 20,
              color: "rgba(255,255,255,.75)",
              lineHeight: 1.65,
              textAlign: "center",
              margin: 0,
            }}>
              {choice.response}
            </p>
          </Card>

          {step === 1 && (
            <ContinueButton onClick={advance} color={color} label="The real answer" />
          )}
        </div>
      )}

      {/* ── Step 2: Insight — what makes AI special ── */}
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
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            justifyContent: "center",
            marginBottom: 24,
          }}>
            <Lightbulb size={36} weight="duotone" color={color} />
            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 28,
              color: "white",
            }}>
              Here's what makes AI special
            </div>
          </div>

          <Card style={{
            background: "rgba(255,255,255,.04)",
            maxWidth: 600,
            margin: "0 auto",
          }}>
            <p style={{
              fontSize: 21,
              color: "rgba(255,255,255,.7)",
              lineHeight: 1.7,
              margin: 0,
              textAlign: "center",
            }}>
              A normal program follows <strong style={{ color }}>rules someone wrote</strong> — like a recipe with exact steps.
            </p>
            <div style={{
              width: 60,
              height: 2,
              background: `${color}40`,
              margin: "20px auto",
              borderRadius: 2,
            }} />
            <p style={{
              fontSize: 21,
              color: "rgba(255,255,255,.7)",
              lineHeight: 1.7,
              margin: 0,
              textAlign: "center",
            }}>
              AI is different: it <strong style={{ color }}>learns from examples</strong>. Nobody wrote the rules. It figured them out by looking at millions of examples — the same way you learned to talk by hearing people talk.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
