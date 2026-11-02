import { useState, useEffect, useRef, createElement } from "react";
import {
  ArrowDown,
  Books,
  ChatTeardropDots,
  HashStraight,
  Lightbulb,
  Image,
  SpeakerHigh,
  VideoCamera,
} from "@phosphor-icons/react";
import { Card, Label, H1, TeacherNote, PresSlide } from "./shared";
import MathMoment from "./MathMoment";
import { PredictGate } from "./classroom";
import { useTally } from "./useTally";
import { useGrade } from "../data/GradeContext";

const ICON_MAP = {
  L0: Books,
  L1: ChatTeardropDots,
  M: HashStraight,
};

const parts = [
  { letter: "L", word: "Large",    iconKey: "L0", reveal: "Trained on more text than you could read in 10,000 lifetimes. Books, websites, articles — all of it." },
  { letter: "L", word: "Language", iconKey: "L1", reveal: "It works specifically with words and sentences. It reads text in, and writes text back out." },
  { letter: "M", word: "Model",   iconKey: "M",  reveal: "A mathematical structure — billions of numbers arranged so that patterns in language get captured. Like a very complex recipe." },
];

const notes = [
  "'Large' is worth dwelling on. Models like GPT-4 are estimated to have trained on trillions of words. The entire English Wikipedia is about 4 billion words — so these models read the equivalent of hundreds of Wikipedias.",
  "'Language' distinguishes LLMs from other types of AI (like image AI or audio AI). Some newer models are multimodal — they handle images too — but language is core.",
  "'Model' is the trickiest concept. A useful analogy: when you hear enough songs, your brain builds a model of what music sounds like. LLMs build a mathematical model of what language looks and sounds like.",
  "After revealing all three: 'So what's the most popular thing people use LLMs for?' → chatbots, writing help, coding help, answering questions.",
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

const FREDOKA = "'Fredoka',sans-serif";

/* The three L-L-M boxes, lit left-to-right as the slides unpack each word. */
function LetterRow({ lit, color, caption }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
      {parts.map((p, i) => {
        const on = i < lit;
        const now = i === lit - 1;
        return (
          <div key={i} style={{
            textAlign: "center", padding: "10px 18px", borderRadius: 14, minWidth: 96,
            background: on ? `${color}18` : "rgba(255,255,255,.04)",
            border: `2.5px solid ${on ? color : "rgba(255,255,255,.12)"}`,
            boxShadow: now ? `0 0 24px ${color}55` : "none",
            transition: "all .35s ease",
          }}>
            <div style={{ fontFamily: FREDOKA, fontSize: 34, fontWeight: 700, color: on ? color : "rgba(255,255,255,.3)", lineHeight: 1 }}>{p.letter}</div>
            <div style={{ fontFamily: FREDOKA, fontSize: 15, color: on ? "white" : "rgba(255,255,255,.3)", marginTop: 4 }}>{p.word}</div>
          </div>
        );
      })}
    </div>
    {caption && <div style={{ fontSize: 22, color: "rgba(255,255,255,.55)", lineHeight: 1.3 }}>{caption}</div>}
    </div>
  );
}

/* Reveal body under a gate: icon + text, sized to stay on the projector with the tally above it. */
function RevealLine({ Icon, color, children, size = 22 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", maxWidth: 720, margin: "0 auto" }}>
      {createElement(Icon, { size: 34, weight: "duotone", color, style: { flexShrink: 0 } })}
      <div style={{ fontSize: size, color: "rgba(255,255,255,.78)", textAlign: "left", lineHeight: 1.4 }}>{children}</div>
    </div>
  );
}

const LARGE_OPTIONS = [
  { id: "books", label: "A few hundred books" },
  { id: "library", label: "A whole city library" },
  { id: "lifetimes", label: "More than you could read in 10,000 lifetimes" },
];
const LANGUAGE_OPTIONS = [
  { id: "words", label: "Words in → words out" },
  { id: "pictures", label: "Pictures in → pictures out" },
  { id: "sounds", label: "Sounds in → sounds out" },
];
const MODEL_OPTIONS = [
  { id: "answers", label: "A giant list of saved answers" },
  { id: "person", label: "A tiny person typing really fast" },
  { id: "numbers", label: "Billions of numbers, tuned to capture patterns" },
];
const OTHER_MEDIA = [
  { Icon: Image, label: "Pictures" },
  { Icon: SpeakerHigh, label: "Audio" },
  { Icon: VideoCamera, label: "Video" },
];

export default function SectionWhatIsLLM({ color, mode, slide: slideProp }) {
  const grade = useGrade();
  const largeVote = useTally(LARGE_OPTIONS.length);
  const languageVote = useTally(LANGUAGE_OPTIONS.length);
  const modelVote = useTally(MODEL_OPTIONS.length);
  // Presentation: one slide per word (Large / Language / Model), each a
  // predict-then-reveal so the room commits before the answer. All bands run
  // the same three slides; "not just text" and the company names ride along in
  // the Language and Model reveals.
  const slide = slideProp;
  const young = grade === "K-2";
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
    /* Slide 0: L = Large — how much did it read? */
    if (slide === 0) {
      const p = parts[0];
      return (
        <PresSlide>
          <LetterRow lit={1} color={color} caption={<>LLM stands for <strong style={{ color: "white" }}>Large Language Model</strong> — three words. First up: <strong style={{ color }}>Large</strong>.</>} />
          <PredictGate
            key="llm-large"
            prompt="To learn language, how much text did it read?"
            options={LARGE_OPTIONS}
            correct="lifetimes"
            tally={largeVote}
            color={color}
            roomId="llm-large"
            revealLabel="Show us"
            dense
          >
            {(revealed) => revealed && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: "100%", animation: "fadeUp .45s ease" }}>
                <RevealLine Icon={Books} color={color}>{p.reveal}</RevealLine>
                <MathMoment id="wikipedias" compact />
              </div>
            )}
          </PredictGate>
        </PresSlide>
      );
    }
    /* Slide 1: L = Language — what goes in and out? (+ the other kinds of AI) */
    if (slide === 1) {
      const p = parts[1];
      return (
        <PresSlide>
          <LetterRow lit={2} color={color} />
          <PredictGate
            key="llm-language"
            prompt="An LLM's job: what goes in, and what comes out?"
            options={LANGUAGE_OPTIONS}
            correct="words"
            tally={languageVote}
            color={color}
            roomId="llm-language"
            revealLabel="Show us"
            dense
          >
            {(revealed) => revealed && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: "100%", animation: "fadeUp .45s ease" }}>
                <RevealLine Icon={ChatTeardropDots} color={color}>{p.reveal}</RevealLine>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "center", maxWidth: 760 }}>
                  {OTHER_MEDIA.map(({ Icon, label }) => (
                    <div key={label} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.14)" }}>
                      {createElement(Icon, { size: 20, weight: "duotone", color: "rgba(255,255,255,.6)" })}
                      <span style={{ fontFamily: FREDOKA, fontSize: 16, color: "rgba(255,255,255,.7)" }}>{label}</span>
                    </div>
                  ))}
                  <div style={{ fontSize: 18, color: "rgba(255,255,255,.5)", lineHeight: 1.35 }}>
                    {young
                      ? "Picture AIs and voice AIs exist too. Today is all about the words one!"
                      : <>— picture, voice and video AIs exist too. Today we're on the <strong style={{ color: "white" }}>language</strong> part.</>}
                  </div>
                </div>
              </div>
            )}
          </PredictGate>
        </PresSlide>
      );
    }
    /* Slide 2: M = Model — what's inside? + the synthesis takeaway */
    if (slide === 2) {
      return (
        <PresSlide>
          <LetterRow lit={3} color={color} />
          <PredictGate
            key="llm-model"
            prompt="Open it up — what's actually inside the model?"
            options={MODEL_OPTIONS}
            correct="numbers"
            tally={modelVote}
            color={color}
            roomId="llm-model"
            revealLabel="Open it up"
            dense
          >
            {(revealed) => revealed && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: "100%", animation: "fadeUp .45s ease" }}>
                <RevealLine Icon={HashStraight} color={color}>
                  Billions of numbers, arranged so the patterns of language get captured — like a very complex recipe. No saved answers inside: it builds every reply from those patterns.
                </RevealLine>
                <div style={{
                  display: "flex", gap: 12, alignItems: "center", justifyContent: "center",
                  padding: "12px 20px", background: `${color}12`, border: `1px solid ${color}35`,
                  borderRadius: 12, maxWidth: 720,
                }}>
                  <img src={`${import.meta.env.BASE_URL}robotcomputerbrain.png`} alt="AI" style={{ width: 48, height: "auto", flexShrink: 0 }} />
                  <span style={{ fontSize: 24, color, lineHeight: 1.35, textAlign: "left" }}>
                    <strong>A massive mathematical system that learned language by reading an enormous amount of text.</strong>
                  </span>
                </div>
                <div style={{ fontSize: 18, color: "rgba(255,255,255,.5)", lineHeight: 1.4, maxWidth: 760 }}>
                  Lots of companies build their own: <strong style={{ color: "#00f5d4" }}>OpenAI</strong> (ChatGPT) ·{" "}
                  <strong style={{ color: "#fb5607" }}>Anthropic</strong> (Claude) ·{" "}
                  <strong style={{ color: "#f15bb5" }}>Google</strong> (Gemini) ·{" "}
                  <strong style={{ color: "#00bbf9" }}>Meta</strong> (Llama) — all LLMs.
                </div>
              </div>
            )}
          </PredictGate>
        </PresSlide>
      );
    }
    return null;
  }

  return (
    <div className="fade-up">
      <Label color={color} mode={mode} text="MEET THE LLMS · WHAT IS IT?" />
      <H1>What's an LLM?</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />

      {/* ── Step 0: The three letter boxes ── */}
      <div style={{ minHeight: "50vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 18, justifyContent: "center", marginBottom: 28, flexWrap: "wrap" }}>
          {parts.map((p, i) => (
            <div key={i} style={{
              textAlign: "center",
              padding: "20px 28px",
              borderRadius: 18,
              minWidth: 110,
              background: step > i ? `${color}18` : "rgba(255,255,255,.04)",
              border: `2.5px solid ${step > i ? color : "rgba(255,255,255,.12)"}`,
              transition: "all .35s ease",
            }}>
              <div style={{
                fontFamily: "'Fredoka',sans-serif",
                fontSize: 56,
                fontWeight: 700,
                color: step > i ? color : "rgba(255,255,255,.3)",
                lineHeight: 1,
              }}>
                {p.letter}
              </div>
              <div style={{
                fontFamily: "'Fredoka',sans-serif",
                fontSize: 20,
                color: step > i ? "white" : "rgba(255,255,255,.3)",
                marginTop: 6,
              }}>
                {p.word}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          fontSize: 22,
          color: "rgba(255,255,255,.65)",
          textAlign: "center",
          lineHeight: 1.55,
          maxWidth: 560,
          margin: "0 auto",
        }}>
          LLM stands for <strong style={{ color }}>Large Language Model</strong>. Three words — let's unpack them.
        </div>

        {step === 0 && (
          <ContinueButton onClick={advance} color={color} label="Unpack the first letter" />
        )}
      </div>

      {/* ── Step 1: L = Large ── */}
      {step >= 1 && (() => {
        const p = parts[0];
        const Icon = ICON_MAP[p.iconKey];
        return (
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
            <Card style={{
              background: `${color}08`,
              border: `1px solid ${color}28`,
              padding: "28px 32px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 56,
                  fontWeight: 700,
                  color,
                  minWidth: 48,
                  lineHeight: 1,
                }}>
                  {p.letter}
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 20,
                    color: "white",
                    marginBottom: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}>
                    <Icon size={24} weight="duotone" color={color} /> {p.word}
                  </div>
                  <div style={{ fontSize: 20, color: "rgba(255,255,255,.65)", lineHeight: 1.55 }}>
                    {p.reveal}
                  </div>
                </div>
              </div>
            </Card>

            {step === 1 && (
              <ContinueButton onClick={advance} color={color} label="Next letter" />
            )}
          </div>
        );
      })()}

      {/* ── Step 2: L = Language ── */}
      {step >= 2 && (() => {
        const p = parts[1];
        const Icon = ICON_MAP[p.iconKey];
        return (
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
            <Card style={{
              background: `${color}08`,
              border: `1px solid ${color}28`,
              padding: "28px 32px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 56,
                  fontWeight: 700,
                  color,
                  minWidth: 48,
                  lineHeight: 1,
                }}>
                  {p.letter}
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 20,
                    color: "white",
                    marginBottom: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}>
                    <Icon size={24} weight="duotone" color={color} /> {p.word}
                  </div>
                  <div style={{ fontSize: 20, color: "rgba(255,255,255,.65)", lineHeight: 1.55 }}>
                    {p.reveal}
                  </div>
                </div>
              </div>
            </Card>

            {step === 2 && (
              <ContinueButton onClick={advance} color={color} label="Last letter" />
            )}
          </div>
        );
      })()}

      {/* ── Step 3: M = Model + Insight ── */}
      {step >= 3 && (() => {
        const p = parts[2];
        const Icon = ICON_MAP[p.iconKey];
        return (
          <div
            ref={step3Ref}
            style={{
              animation: "fadeUp .5s ease",
              minHeight: "60vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingTop: 24,
            }}
          >
            <Card style={{
              background: `${color}08`,
              border: `1px solid ${color}28`,
              padding: "28px 32px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 56,
                  fontWeight: 700,
                  color,
                  minWidth: 48,
                  lineHeight: 1,
                }}>
                  {p.letter}
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 20,
                    color: "white",
                    marginBottom: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}>
                    <Icon size={24} weight="duotone" color={color} /> {p.word}
                  </div>
                  <div style={{ fontSize: 20, color: "rgba(255,255,255,.65)", lineHeight: 1.55 }}>
                    {p.reveal}
                  </div>
                </div>
              </div>
            </Card>

            {/* Lightbulb insight summary */}
            <div className="wow-reveal" style={{
              padding: "20px 24px",
              background: `${color}12`,
              border: `1px solid ${color}35`,
              borderRadius: 12,
              marginTop: 24,
              fontSize: 20,
              color: "rgba(255,255,255,.7)",
              lineHeight: 1.6,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}>
              <Lightbulb size={24} weight="duotone" color={color} style={{ flexShrink: 0, marginTop: 2 }} />
              <span><strong style={{ color }}>Large Language Model</strong> — a massive mathematical system that learned the patterns of human language by reading an enormous amount of text.</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
