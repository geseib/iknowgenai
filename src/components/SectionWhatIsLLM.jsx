import { useState, useEffect, useRef } from "react";
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
import { Card, Label, H1, TeacherNote, PresSlide, PresText } from "./shared";
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

export default function SectionWhatIsLLM({ color, mode, slide: slideProp }) {
  const grade = useGrade();
  // Band-aware presentation-slide remap. Authored slides: 0 intro (shows all
  // three L-L-M boxes), 1 L=Large, 2 L=Language, 3 M=Model + the "massive
  // mathematical system" synthesis takeaway, 4 bonus (not just text).
  // K-2 only shows 3 slides — without a remap it would render 0-2 and end on
  // "Language" (slide 2), never reaching the Model synthesis. Route its 3 slides
  // to intro + Large + the Model takeaway (the intro already names all three
  // words). 3-5 / 7-8 (5 slides) are unchanged.
  const K2_PRES_SLIDES = [0, 1, 3];
  const slide = grade === "K-2" ? (K2_PRES_SLIDES[slideProp] ?? slideProp) : slideProp;
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
    /* Slide 0: All three letter boxes — muted / unlit */
    if (slide === 0) {
      return (
        <PresSlide>
          <div style={{ display: "flex", gap: 18, justifyContent: "center", marginBottom: 32, flexWrap: "wrap" }}>
            {parts.map((p, i) => (
              <div key={i} style={{
                textAlign: "center",
                padding: "20px 28px",
                borderRadius: 18,
                minWidth: 110,
                background: "rgba(255,255,255,.04)",
                border: "2.5px solid rgba(255,255,255,.12)",
              }}>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 56,
                  fontWeight: 700,
                  color: "rgba(255,255,255,.3)",
                  lineHeight: 1,
                }}>
                  {p.letter}
                </div>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 20,
                  color: "rgba(255,255,255,.3)",
                  marginTop: 6,
                }}>
                  {p.word}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 32, color: "white", textAlign: "center", lineHeight: 1.5, marginBottom: 12 }}>
            LLM stands for <strong style={{ color }}>Large Language Model</strong>
          </div>
          <div style={{ fontSize: 24, color: "rgba(255,255,255,.45)", textAlign: "center" }}>
            Three words — let's unpack them.
          </div>
        </PresSlide>
      );
    }
    /* Slide 1: L = Large */
    if (slide === 1) {
      const p = parts[0];
      return (
        <PresSlide>
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 64,
            fontWeight: 700,
            color,
            textAlign: "center",
            lineHeight: 1,
            marginBottom: 16,
          }}>
            {p.letter}
          </div>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <Books size={28} weight="duotone" color={color} />
          </div>
          <div style={{ fontSize: 28, color: "white", textAlign: "center", marginBottom: 12 }}>
            {p.word}
          </div>
          <div style={{ fontSize: 26, color: "rgba(255,255,255,.55)", textAlign: "center", lineHeight: 1.5, maxWidth: 700, margin: "0 auto" }}>
            {p.reveal}
          </div>
        </PresSlide>
      );
    }
    /* Slide 2: L = Language */
    if (slide === 2) {
      const p = parts[1];
      return (
        <PresSlide>
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 64,
            fontWeight: 700,
            color,
            textAlign: "center",
            lineHeight: 1,
            marginBottom: 16,
          }}>
            {p.letter}
          </div>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <ChatTeardropDots size={28} weight="duotone" color={color} />
          </div>
          <div style={{ fontSize: 28, color: "white", textAlign: "center", marginBottom: 12 }}>
            {p.word}
          </div>
          <div style={{ fontSize: 26, color: "rgba(255,255,255,.55)", textAlign: "center", lineHeight: 1.5, maxWidth: 700, margin: "0 auto" }}>
            {p.reveal}
          </div>
        </PresSlide>
      );
    }
    /* Slide 3: M = Model + Lightbulb insight */
    if (slide === 3) {
      const p = parts[2];
      return (
        <PresSlide>
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 64,
            fontWeight: 700,
            color,
            textAlign: "center",
            lineHeight: 1,
            marginBottom: 16,
          }}>
            {p.letter}
          </div>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <HashStraight size={28} weight="duotone" color={color} />
          </div>
          <div style={{ fontSize: 28, color: "white", textAlign: "center", marginBottom: 12 }}>
            {p.word}
          </div>
          <div style={{ fontSize: 26, color: "rgba(255,255,255,.55)", textAlign: "center", lineHeight: 1.5, maxWidth: 700, margin: "0 auto", marginBottom: 28 }}>
            {p.reveal}
          </div>
          <div style={{
            display: "flex", gap: 12, alignItems: "flex-start", justifyContent: "center",
            padding: "20px 24px", background: `${color}12`, border: `1px solid ${color}35`,
            borderRadius: 12, maxWidth: 700, margin: "0 auto",
          }}>
            <img src={`${import.meta.env.BASE_URL}robotcomputerbrain.png`} alt="AI" style={{ width: 56, height: "auto", flexShrink: 0 }} />
            <span style={{ fontSize: 28, color, lineHeight: 1.5 }}>
              <strong>A massive mathematical system that learned language by reading an enormous amount of text</strong>
            </span>
          </div>
          <div style={{ fontSize: 22, color: "rgba(255,255,255,.5)", textAlign: "center", lineHeight: 1.5, maxWidth: 720, margin: "22px auto 0" }}>
            Lots of companies build their own: <strong style={{ color: "#00f5d4" }}>OpenAI</strong> makes ChatGPT,{" "}
            <strong style={{ color: "#fb5607" }}>Anthropic</strong> makes Claude,{" "}
            <strong style={{ color: "#f15bb5" }}>Google</strong> makes Gemini,{" "}
            <strong style={{ color: "#00bbf9" }}>Meta</strong> makes Llama — all LLMs.
          </div>
        </PresSlide>
      );
    }
    /* Slide 4: Not just text — pictures & audio too */
    if (slide === 4) {
      return (
        <PresSlide>
          <PresText size={40} color="white">
            But it's not <em>just</em> words...
          </PresText>
          <div style={{
            display: "flex", gap: 28, justifyContent: "center", marginTop: 8, marginBottom: 8,
          }}>
            {[
              { Icon: Image, label: "Pictures" },
              { Icon: SpeakerHigh, label: "Audio" },
              { Icon: VideoCamera, label: "Video" },
            ].map(({ Icon, label }) => (
              <div key={label} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                padding: "20px 28px", borderRadius: 18,
                background: `${color}10`, border: `2px solid ${color}30`,
              }}>
                <Icon size={48} weight="duotone" color={color} />
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 24, color: "white" }}>{label}</div>
              </div>
            ))}
          </div>
          <PresText size={26} color="rgba(255,255,255,.55)">
            AI can also generate images, understand speech, and even create video — using a very similar approach.
          </PresText>
          <PresText size={28} color={color}>
            But that's a lesson for another day!
          </PresText>
          <PresText size={24} color="rgba(255,255,255,.35)">
            Today we're focusing on the <strong style={{ color: "white" }}>language</strong> part.
          </PresText>
        </PresSlide>
      );
    }
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
