import { useState, useEffect, useRef } from "react";
import {
  SealCheck,
  Lightbulb,
  ArrowDown,
} from "@phosphor-icons/react";
import { Label, H1, TeacherNote, PresSlide, PresText } from "./shared";

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

function ModelCard({ model, pres, compact }) {
  return (
    <div
      style={{
        borderRadius: 16,
        overflow: "hidden",
        background: `${model.color}15`,
        border: `2px solid ${model.color}`,
        padding: compact ? "18px 16px" : "24px 20px",
        width: compact ? 340 : "100%",
        maxWidth: 480,
        flexShrink: 0,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: compact ? 10 : 16 }}>
        <SealCheck size={compact ? 36 : 48} weight="duotone" color={model.color} style={{ marginBottom: 6 }} />
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: compact ? 22 : 28,
          color: "white",
          marginBottom: 2,
        }}>
          {model.name}
        </div>
        <div style={{ fontSize: compact ? 14 : (pres ? 18 : 16), color: "rgba(255,255,255,.4)", marginBottom: 6 }}>
          {model.org}
        </div>
        <div style={{ fontSize: compact ? 14 : 18, color: model.color, lineHeight: 1.4 }}>
          {model.tagline}
        </div>
      </div>

      <div style={{ marginTop: compact ? 10 : 16 }}>
        {model.facts.map((fact, fi) => (
          <div key={fi} style={{
            display: "flex",
            gap: 8,
            marginBottom: compact ? 6 : 10,
            fontSize: compact ? 14 : (pres ? 22 : 18),
            color: "rgba(255,255,255,.75)",
            lineHeight: 1.45,
          }}>
            <span style={{ color: model.color, flexShrink: 0 }}>&rarr;</span>
            {fact}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Carousel: cards drift right-to-left in a continuous loop ── */
function ModelCarousel() {
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf;
    let pos = 0;
    const speed = 0.4; // pixels per frame

    const animate = () => {
      pos += speed;
      // Each card is ~356px (340 + 16 gap). Total for 4 cards = ~1424px
      const singleSet = el.scrollWidth / 2;
      if (pos >= singleSet) pos -= singleSet;
      el.scrollLeft = pos;
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Duplicate the cards so the loop is seamless
  const allModels = [...models, ...models];

  return (
    <div
      ref={scrollRef}
      style={{
        display: "flex",
        gap: 16,
        overflow: "hidden",
        width: "100%",
        padding: "8px 0",
      }}
    >
      {allModels.map((m, i) => (
        <ModelCard key={i} model={m} compact />
      ))}
    </div>
  );
}

export default function SectionMeetModels({ color, mode, slide }) {
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

  /* ── Presentation mode ── */
  if (mode === "presentation") {
    /* Slide 0: All models in a scrolling carousel */
    if (slide === 0) {
      return (
        <PresSlide>
          <div className="fade-up" style={{ width: "100%", maxWidth: 960 }}>
            <PresText size={32} color="rgba(255,255,255,.55)">
              Several companies have built their own AI
            </PresText>
            <div style={{ marginTop: 28 }}>
              <ModelCarousel />
            </div>
          </div>
        </PresSlide>
      );
    }
    /* Slide 1: What they all have in common + dramatic bridge */
    if (slide === 1) {
      return (
        <PresSlide>
          <Lightbulb size={36} weight="duotone" color={color} style={{ display: "block", margin: "0 auto 16px" }} />
          <div style={{ fontSize: 32, color: "white", textAlign: "center", marginBottom: 16, fontFamily: "'Fredoka',sans-serif" }}>
            What they all have in common...
          </div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,.55)", textAlign: "center", lineHeight: 1.5, maxWidth: 700, margin: "0 auto", marginBottom: 20 }}>
            All of these models learned by reading
          </div>
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 52,
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
            fontSize: 32,
            color: "rgba(255,255,255,.5)",
            textAlign: "center",
            lineHeight: 1.5,
          }}>
            ...but <span style={{ color: "white" }}>HOW</span> did that teach them to{" "}
            <span style={{ color: "white" }}>write back?</span>
          </div>
        </PresSlide>
      );
    }
  }

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
