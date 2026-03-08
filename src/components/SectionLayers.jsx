import { useState, useEffect, useRef } from "react";
import {
  TextAa,
  PencilLine,
  Books,
  MaskHappy,
  PuzzlePiece,
  Sparkle,
  ArrowDown,
} from "@phosphor-icons/react";
import { Card, Label, H1, Body, TriviaBox, TeacherNote } from "./shared";

const LAYER_CARDS = [
  { range: "1–16",  label: "Letters & Spelling",    desc: "Roughly where the model starts recognizing individual letters, punctuation, and simple character patterns.", Icon: TextAa },
  { range: "17–32", label: "Words & Grammar",       desc: "Parts of speech, verb tenses, plural rules tend to emerge here — the skeleton of language.", Icon: PencilLine },
  { range: "33–48", label: "Facts & Knowledge",     desc: "Around here, facts from training start showing up — countries, history, science, names.", Icon: Books },
  { range: "49–64", label: "Context & Tone",        desc: "Is this sarcastic? Formal? A joke? Middle layers start picking up on context and mood.", Icon: MaskHappy },
  { range: "65–80", label: "Logic & Reasoning",     desc: "Deeper layers handle cause and effect, comparisons, and basic reasoning.", Icon: PuzzlePiece },
  { range: "81–96", label: "Deep Understanding",    desc: "The final layers refine nuance, metaphor, and the subtle things that are hardest to explain.", Icon: Sparkle },
];

const notes = [
  "Ask the class to guess what early vs late layers might do BEFORE revealing. 'What would you learn first if you were trying to understand language from scratch?'",
  "The progression from mechanical (letters) to abstract (wisdom) is a nice structural insight. Early layers = fast and reliable, late layers = slow and uncertain.",
  "A good discussion question: 'If you cut the model off at layer 32, what could it do? What couldn't it do?' (It could spell and do grammar, but couldn't reason or understand context.)",
  "The 96-layer count is the wow moment here. Ask: 'What do you think happens between the first and ninety-sixth layer that makes the answer so much better?'",
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

function LayerCard({ layer, color }) {
  const { Icon, label, range, desc } = layer;
  return (
    <div style={{
      background: "rgba(255,255,255,.06)",
      border: `1.5px solid ${color}30`,
      borderRadius: 16,
      padding: "20px 24px",
      marginBottom: 14,
      animation: "fadeUp .4s ease both",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <Icon size={28} weight="duotone" color={color} />
        <div>
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 20,
            color,
          }}>
            {label}
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,.4)", marginTop: 2 }}>
            Layers {range}
          </div>
        </div>
      </div>
      <div style={{
        fontSize: 18,
        color: "rgba(255,255,255,.7)",
        lineHeight: 1.5,
        paddingLeft: 40,
      }}>
        {desc}
      </div>
    </div>
  );
}

export default function SectionLayers({ color, mode }) {
  const [step, setStep] = useState(0);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);

  const advance = () => {
    if (step < 2) setStep(s => s + 1);
  };

  // Keyboard: down arrow advances steps
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (step < 2) {
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
    const target = step === 1 ? step1Ref.current : step === 2 ? step2Ref.current : null;
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [step]);

  return (
    <div className="fade-up">
      <Label color={color} text="HOW AI THINKS · STEP 5" />
      <H1>Rinse & Repeat</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />

      {/* ── Step 0: Big intro ── */}
      <div style={{ minHeight: "50vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 28,
          color: "white",
          textAlign: "center",
          lineHeight: 1.4,
          marginBottom: 16,
        }}>
          One round of Attention + MLP isn't enough.
        </div>

        <div style={{
          textAlign: "center",
          marginBottom: 20,
        }}>
          <span style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 22,
            color: "rgba(255,255,255,.6)",
          }}>
            The model does it{" "}
          </span>
          <span style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 48,
            fontWeight: 700,
            color,
          }}>
            96
          </span>
          <span style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 22,
            color: "rgba(255,255,255,.6)",
          }}>
            {" "}TIMES
          </span>
        </div>

        <div style={{
          fontSize: 20,
          color: "rgba(255,255,255,.45)",
          textAlign: "center",
          lineHeight: 1.5,
          fontStyle: "italic",
        }}>
          Each pass makes the understanding richer.
        </div>

        {step === 0 && (
          <ContinueButton onClick={advance} color={color} label="See the first layers" />
        )}
      </div>

      {/* ── Step 1: Layer groups 1-3 ── */}
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
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 22,
            color: "rgba(255,255,255,.5)",
            textAlign: "center",
            marginBottom: 20,
          }}>
            The early layers build the basics...
          </div>

          {LAYER_CARDS.slice(0, 3).map((layer, i) => (
            <LayerCard key={i} layer={layer} color={color} />
          ))}

          {step === 1 && (
            <ContinueButton onClick={advance} color={color} label="See the deeper layers" />
          )}
        </div>
      )}

      {/* ── Step 2: Layer groups 4-6 + Trivia ── */}
      {step >= 2 && (
        <div
          ref={step2Ref}
          style={{
            animation: "fadeUp .5s ease",
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 24,
          }}
        >
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 22,
            color: "rgba(255,255,255,.5)",
            textAlign: "center",
            marginBottom: 20,
          }}>
            ...then the deeper layers add meaning.
          </div>

          {LAYER_CARDS.slice(3, 6).map((layer, i) => (
            <LayerCard key={i + 3} layer={layer} color={color} />
          ))}

          <TriviaBox visible={true} color={color} number="96" label="transformer layers"
            fact="Each layer is its own full Attention + MLP block. Run 96 of them in sequence and you go from raw letters to nuanced, reasoned understanding." />
        </div>
      )}
    </div>
  );
}
