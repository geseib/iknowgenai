import { useState, useEffect, useRef } from "react";
import {
  ArrowDown,
  Lightbulb,
} from "@phosphor-icons/react";
import { Label, H1, TriviaBox, TeacherNote, ModelNote, PresSlide, PresText } from "./shared";
import CatIllustration from "./CatIllustration";
import { useGrade } from "../data/GradeContext";

const notes = [
  "This is one of the most powerful moments in the lesson. Start by showing 'cat' and asking: 'When you see this word, what happens in your brain?' Give kids 30–60 seconds.",
  "Kids will offer rich descriptions: fur, whiskers, purring, pointy ears, playing with yarn, sleeping in sunlight. Some will picture a specific cat they know. Write a few on the board if you can.",
  "The key pivot: 'All of that — the fur, the purring, the picture in your head — your brain does that instantly, without thinking. But AI can't do ANY of that. It can't picture a cat. It can't feel fur. It only has one tool: numbers.'",
  "When the numbers start streaming, stay quiet. Let the visual do the work. The scrolling counter drives it home.",
  "Follow-up: 'How many numbers do you think represent one word?' Let them guess before the trivia box reveals 12,288.",
];

const feelings = [
  "Soft fur",
  "Purring",
  "Cuddly",
  "Whiskers",
  "Pointy ears",
  "Playful",
  "Warm & sleepy",
  "Sneezy if allergic!",
];

function randomVector() {
  return (Math.random() * 2 - 1).toFixed(3);
}

function VectorTicker({ color, pres }) {
  const [numbers, setNumbers] = useState([]);
  const containerRef = useRef(null);
  const countRef = useRef(0);

  useEffect(() => {
    const seed = Array.from({ length: 30 }, () => randomVector());
    setNumbers(seed);
    countRef.current = 30;

    const interval = setInterval(() => {
      if (countRef.current >= 12288) {
        clearInterval(interval);
        return;
      }
      setNumbers(prev => [...prev, randomVector()]);
      countRef.current += 1;
    }, 90);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [numbers]);

  return (
    <div>
      {/* Counter */}
      <div style={{
        fontFamily: "'Fredoka',sans-serif",
        fontSize: 22,
        color,
        marginBottom: 12,
        textAlign: "center",
      }}>
        {numbers.length.toLocaleString()} of 12,288 numbers...
      </div>

      {/* Scrolling number stream */}
      <div
        ref={containerRef}
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          padding: "12px 0",
          scrollBehavior: "smooth",
          maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 88%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 88%, transparent 100%)",
        }}
      >
        {numbers.map((n, i) => (
          <span key={i} style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: pres ? 22 : 20,
            background: "rgba(255,255,255,.08)",
            borderRadius: 8,
            padding: "6px 10px",
            color: "rgba(255,255,255,.85)",
            flexShrink: 0,
            animation: "slideIn .2s ease both",
            letterSpacing: -0.5,
          }}>{n}</span>
        ))}
      </div>

      {/* Explanation */}
      <div style={{
        fontSize: 20,
        color: "rgba(255,255,255,.5)",
        textAlign: "center",
        marginTop: 14,
        lineHeight: 1.5,
      }}>
        No pictures. No feelings. Just <strong style={{ color }}>12,288 numbers</strong> for every single word — enough to cover a basketball court with tennis balls.
      </div>
    </div>
  );
}

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

export default function SectionHook({ color, mode, slide: slideProp }) {
  const grade = useGrade();
  // Band-aware presentation-slide remap. Authored slides: 0 bridge question,
  // 1 "cat" prompt, 2 your brain floods (human side), 3 "but AI can't — all it
  // sees is NUMBERS" pivot, 4 the "cat" -> 12,288 numbers ticker payoff.
  // K-2 only shows 3 slides — without a remap it would render 0-2 and end on the
  // *human* brain side (slide 2), never reaching the numbers reveal that is this
  // section's whole point. Route its 3 slides to the human/AI/numbers contrast so
  // it ends on the ticker payoff. 3-5 / 7-8 (5 slides) are unchanged.
  const K2_PRES_SLIDES = [2, 3, 4];
  const slide = grade === "K-2" ? (K2_PRES_SLIDES[slideProp] ?? slideProp) : slideProp;
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
      // Small delay to let the DOM render before scrolling
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [step]);

  if (mode === "presentation") {
    // Slide 0: The big question — bridge from training to word understanding
    if (slide === 0) return (
      <PresSlide>
        <PresText size={48} color="white">
          OK but how does AI even<br />
          <strong style={{ color }}>read and understand</strong> a word?
        </PresText>
      </PresSlide>
    );
    // Slide 1: "cat" — what happens in YOUR brain
    if (slide === 1) return (
      <PresSlide>
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 96,
          fontWeight: 700,
          lineHeight: 1,
          textAlign: "center",
          padding: "24px 48px",
          background: `${color}12`,
          border: `2px solid ${color}35`,
          borderRadius: 24,
          color: "white",
        }}>
          cat
        </div>
        <PresText size={32}>
          When you see this word, what happens in your brain?
        </PresText>
        <PresText size={22} color="rgba(255,255,255,.55)" style={{ fontStyle: "italic" }}>
          What do you picture? What do you feel?
        </PresText>
      </PresSlide>
    );
    if (slide === 2) return (
      <PresSlide>
        <CatIllustration color={color} size={200} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", maxWidth: 600 }}>
          {feelings.map((f, i) => (
            <div key={i} style={{
              padding: "10px 20px",
              borderRadius: 50,
              background: `${color}15`,
              border: `1.5px solid ${color}50`,
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 24,
              color: "white",
              whiteSpace: "nowrap",
              animation: `fadeUp .4s ${i * 0.08}s ease both`,
            }}>
              {f}
            </div>
          ))}
        </div>
        <PresText size={26} color="rgba(255,255,255,.55)">
          Your brain floods with memories, images, and feelings — all at once, instantly.
        </PresText>
      </PresSlide>
    );
    if (slide === 3) return (
      <PresSlide>
        <Lightbulb size={40} weight="duotone" color={color} />
        <PresText size={44}>
          But AI can't do ANY of that.
        </PresText>
        <PresText size={26} color="rgba(255,255,255,.55)">
          It can't picture a cat. It can't feel fur.
        </PresText>
        <PresText size={40}>
          All it sees is <strong style={{ color }}>NUMBERS</strong>
        </PresText>
      </PresSlide>
    );
    if (slide === 4) return (
      <PresSlide>
        {/* "cat" → numbers visual */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 20, marginBottom: 8,
        }}>
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 52, fontWeight: 700,
            color, background: `${color}18`, border: `2px solid ${color}50`,
            borderRadius: 14, padding: "10px 32px",
          }}>
            "cat"
          </div>
          <div style={{ fontSize: 40, color: "rgba(255,255,255,.3)" }}>→</div>
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 28,
            color: "rgba(255,255,255,.5)",
          }}>
            12,288 numbers
          </div>
        </div>

        {/* Streaming ticker */}
        <div style={{
          background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 20, padding: "24px 20px",
          width: "100%", maxWidth: 860,
        }}>
          <VectorTicker color={color} pres />
        </div>
      </PresSlide>
    );
  }

  return (
    <div className="fade-up">
      <Label color={color} mode={mode} text="HOW AI THINKS · STEP 1" />
      <H1>The Secret: Numbers</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />

      {/* ── Step 0: The big question ── */}
      <div style={{ minHeight: "50vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 28,
        }}>
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1,
            textAlign: "center",
            padding: "24px 48px",
            background: `${color}12`,
            border: `2px solid ${color}35`,
            borderRadius: 24,
            color: "white",
          }}>
            cat
          </div>
        </div>

        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 28,
          color: "white",
          textAlign: "center",
          lineHeight: 1.4,
          marginBottom: 10,
        }}>
          When you see this word, what happens in your brain?
        </div>

        <div style={{
          fontSize: 18,
          color: "rgba(255,255,255,.4)",
          textAlign: "center",
          fontStyle: "italic",
        }}>
          What do you picture? What do you feel?
        </div>

        {step === 0 && (
          <ContinueButton onClick={advance} color={color} label="Show me" />
        )}
      </div>

      {/* ── Step 1: Cat image + feelings ── */}
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
            display: "flex",
            alignItems: "center",
            gap: 32,
            marginBottom: 16,
            flexWrap: "wrap",
            justifyContent: "center",
          }}>
            {/* Cat visual */}
            <div style={{
              flex: "0 0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}>
              <CatIllustration color={color} size={200} />
              <div style={{
                fontFamily: "'Fredoka',sans-serif",
                fontSize: 18,
                color: "rgba(255,255,255,.45)",
              }}>
                Your brain sees...
              </div>
            </div>

            {/* Feeling chips */}
            <div style={{
              flex: "1 1 280px",
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "center",
            }}>
              {feelings.map((f, i) => (
                <div key={i} style={{
                  padding: "12px 24px",
                  borderRadius: 50,
                  background: `${color}15`,
                  border: `1.5px solid ${color}50`,
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 20,
                  color: "white",
                  animation: `fadeUp .4s ${i * 0.08}s ease both`,
                  whiteSpace: "nowrap",
                }}>
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div style={{
            fontSize: 20,
            color: "rgba(255,255,255,.55)",
            lineHeight: 1.6,
            textAlign: "center",
            maxWidth: 600,
            margin: "16px auto 0",
          }}>
            Your brain floods with <strong style={{ color }}>memories, images, and feelings</strong> — all at once, instantly.
          </div>

          {step === 1 && (
            <ContinueButton onClick={advance} color={color} label="What about AI?" />
          )}
        </div>
      )}

      {/* ── Step 2: AI only sees numbers ── */}
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
            display: "flex",
            alignItems: "center",
            gap: 12,
            justifyContent: "center",
            marginBottom: 20,
          }}>
            <Lightbulb size={36} weight="duotone" color={color} />
            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 30,
              color: "white",
              lineHeight: 1.3,
            }}>
              But AI can't do <em>any</em> of that.
            </div>
          </div>

          <div style={{
            fontSize: 22,
            color: "rgba(255,255,255,.55)",
            textAlign: "center",
            lineHeight: 1.5,
            marginBottom: 28,
          }}>
            It can't picture a cat. It can't feel fur. It can't hear purring.<br />
            All it sees is <strong style={{ color }}>numbers</strong>:
          </div>

          {/* Full-width ticker area */}
          <div style={{
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 20,
            padding: "28px 24px",
            marginBottom: 24,
          }}>
            {/* "cat" → numbers visual */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              marginBottom: 20,
            }}>
              <div style={{
                fontFamily: "'Fredoka',sans-serif",
                fontSize: 40,
                fontWeight: 700,
                color,
                background: `${color}18`,
                border: `2px solid ${color}50`,
                borderRadius: 14,
                padding: "10px 28px",
              }}>
                "cat"
              </div>
              <div style={{
                fontSize: 36,
                color: "rgba(255,255,255,.3)",
              }}>
                →
              </div>
              <div style={{
                fontFamily: "'Fredoka',sans-serif",
                fontSize: 22,
                color: "rgba(255,255,255,.5)",
              }}>
                12,288 numbers
              </div>
            </div>

            <VectorTicker color={color} />
          </div>

          <TriviaBox mode={mode} visible={true} color={color} number="12,288" label="numbers per word"
            fact="Imagine covering an entire basketball court with tennis balls, packed side by side. That's about 12,000 balls — almost exactly how many numbers the AI uses for a single word like 'cat'." />
          <ModelNote color={color} mode={mode}>
            The numbers in this lesson (like 12,288 and 96 layers) come from one specific large model. Every AI model uses different numbers — some smaller, some bigger. And as AI keeps getting better, these numbers keep changing! The <strong style={{ color: "rgba(255,255,255,.55)" }}>ideas</strong> stay the same though.
          </ModelNote>
        </div>
      )}
    </div>
  );
}
