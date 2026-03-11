import { useState, useEffect, useRef } from "react";
import {
  SealCheck,
  Lightbulb,
  ArrowDown,
} from "@phosphor-icons/react";
import { Label, H1, TeacherNote } from "./shared";

const models = [
  {
    name: "ChatGPT", org: "OpenAI", tagline: "The one that started the chatbot craze", color: "#00f5d4",
    facts: [
      "Launched in November 2022 — 1 million users in 5 days",
      "Made by OpenAI, founded in San Francisco",
      "GPT stands for Generative Pre-trained Transformer",
    ],
  },
  {
    name: "Claude", org: "Anthropic", tagline: "The one built with safety first", color: "#fb5607",
    facts: [
      "Made by Anthropic — the company behind Claude, the AI that helped build this lesson!",
      "Founded by researchers focused on making AI safe and honest",
      "Claude is the name of the AI — Anthropic is the company",
    ],
  },
  {
    name: "Llama", org: "Meta", tagline: "The one anyone can build with", color: "#00bbf9",
    facts: [
      "Made by Meta — the company behind Facebook and Instagram",
      "It's 'open source' — like sharing the recipe, so anyone can use or modify it",
      "Named after the animal — yes, seriously",
    ],
  },
  {
    name: "Gemini", org: "Google", tagline: "The one built into Google", color: "#f15bb5",
    facts: [
      "Made by Google DeepMind",
      "Built into Google Search, Gmail, and Google Docs",
      "Named after the zodiac twins — it was designed to be multi-talented",
    ],
  },
];

const notes = [
  "Ask the class: 'Has anyone heard of any of these?' before revealing the cards. Hands will go up — great engagement moment.",
  "ChatGPT: emphasize the speed of adoption. 1 million users in 5 days was one of the fastest product launches ever. Why do you think that is?",
  "Claude: this is a great moment to tell the class they're effectively interacting with Anthropic's work right now through this app.",
  "Llama: 'open source' is worth explaining. Imagine if the recipe for your favorite food was secret vs. if the chef shared it with everyone. What are the pros and cons?",
  "Great discussion: 'If these companies are all building AI, are they competing? Why would they all make their own version?'",
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

function ModelCard({ model }) {
  return (
    <div
      style={{
        borderRadius: 16,
        overflow: "hidden",
        background: `${model.color}15`,
        border: `2px solid ${model.color}`,
        padding: "24px 20px",
        maxWidth: 480,
        width: "100%",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <SealCheck size={48} weight="duotone" color={model.color} style={{ marginBottom: 8 }} />
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 28,
          color: "white",
          marginBottom: 4,
        }}>
          {model.name}
        </div>
        <div style={{ fontSize: 16, color: "rgba(255,255,255,.4)", marginBottom: 10 }}>
          {model.org}
        </div>
        <div style={{ fontSize: 18, color: model.color, lineHeight: 1.4 }}>
          {model.tagline}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {model.facts.map((fact, fi) => (
          <div key={fi} style={{
            display: "flex",
            gap: 10,
            marginBottom: 10,
            fontSize: 18,
            color: "rgba(255,255,255,.75)",
            lineHeight: 1.5,
          }}>
            <span style={{ color: model.color, flexShrink: 0, fontSize: 18 }}>&rarr;</span>
            {fact}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SectionMeetModels({ color, mode }) {
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
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (step < 3) {
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
      <Label color={color} mode={mode} text="MEET THE LLMS · THE PLAYERS" />
      <H1>Meet the Models</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />

      {/* ── Step 0: Intro + ChatGPT ── */}
      <div style={{
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <div style={{
          fontSize: 22,
          color: "rgba(255,255,255,.7)",
          textAlign: "center",
          lineHeight: 1.6,
          marginBottom: 32,
          maxWidth: 600,
        }}>
          Several companies have built their own AI.
          Each one works a little differently — let's meet them.
        </div>

        <ModelCard model={models[0]} />

        {step === 0 && (
          <ContinueButton onClick={advance} color={color} label="Next model" />
        )}
      </div>

      {/* ── Step 1: Claude ── */}
      {step >= 1 && (
        <div
          ref={step1Ref}
          style={{
            animation: "fadeUp .5s ease",
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 24,
          }}
        >
          <ModelCard model={models[1]} />

          {step === 1 && (
            <ContinueButton onClick={advance} color={color} label="Next models" />
          )}
        </div>
      )}

      {/* ── Step 2: Llama + Gemini ── */}
      {step >= 2 && (
        <div
          ref={step2Ref}
          style={{
            animation: "fadeUp .5s ease",
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 24,
          }}
        >
          <div style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
            width: "100%",
          }}>
            <ModelCard model={models[2]} />
            <ModelCard model={models[3]} />
          </div>

          {step === 2 && (
            <ContinueButton onClick={advance} color={color} label="The big takeaway" />
          )}
        </div>
      )}

      {/* ── Step 3: Insight ── */}
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
            display: "flex",
            alignItems: "center",
            gap: 14,
            justifyContent: "center",
            marginBottom: 20,
          }}>
            <Lightbulb size={36} weight="duotone" color={color} />
            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 26,
              color: "white",
            }}>
              Here's what they all have in common...
            </div>
          </div>

          <div style={{
            fontSize: 22,
            color: "rgba(255,255,255,.7)",
            textAlign: "center",
            lineHeight: 1.6,
            maxWidth: 600,
          }}>
            All of these models learned by reading{" "}
            <strong style={{ color }}>enormous amounts of text</strong>.
            But HOW does reading teach a computer to write back?
            That's what the rest of this lesson is about!
          </div>
        </div>
      )}
    </div>
  );
}
