import { useState, useEffect, useRef } from "react";
import {
  Brain,
  Robot,
  Handshake,
  Shuffle,
  Lightbulb,
  ArrowDown,
} from "@phosphor-icons/react";
import { Label, H1, TeacherNote, PresSlide, PresText } from "./shared";

const rows = [
  { topic: "How it learns",       brain: "From experience and practice",          ai: "From millions of training examples",     match: true },
  { topic: "Can make mistakes",   brain: "Yes — humans get things wrong",    ai: "Yes — AI gets things wrong too!",    match: true },
  { topic: "Has emotions",        brain: "Yes — fear, joy, love, boredom",   ai: "It can act like it — but doesn't actually feel",  match: false },
  { topic: "Gets tired",          brain: "Yes — needs sleep and rest",        ai: "No — it can run 24/7",               match: false },
  { topic: "Remembers everything",brain: "No — we forget lots of things",    ai: "Only what it was trained on",             match: false },
  { topic: "Understands meaning", brain: "Deeply — we live in the world",    ai: "Sort of — in a very different way",   match: false },
  { topic: "Can be creative",     brain: "Yes — art, music, stories",        ai: "Sort of — by remixing patterns",      match: true },
];

const notes = [
  "Kids often ask 'does AI think like us?' — it's worth being honest: we don't fully know. What we do know is that it processes differently from a human brain.",
  "The 'has emotions' row is tricky. AI can say 'I'm excited!' or 'That makes me sad' — and it feels real. But it learned those words from human writing. It's predicting what an emotional response looks like, not actually feeling anything. A good analogy: an actor can cry on cue without being sad.",
  "The 'can be creative' row often sparks good debate. AI combines and remixes patterns from training data. Is that 'real' creativity? Great open question for the class.",
  "Key point: AI was inspired by neurons and how brains connect, but an AI model is ultimately a giant math function — billions of multiplication operations happening in sequence.",
  "Avoid saying AI 'knows' or 'understands' things the way humans do. Safer phrasing: 'it processes' or 'it was trained on' to avoid overclaiming.",
  "Great discussion question: 'What would AI need to have before you'd say it was truly like a brain?'",
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

function ComparisonCard({ row, color, pres }) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: `1.5px solid ${row.match ? "rgba(255,255,255,.2)" : color + "60"}`,
        overflow: "hidden",
        background: "rgba(255,255,255,.03)",
      }}
    >
      {/* Topic header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          background: "rgba(255,255,255,.05)",
        }}
      >
        <div
          style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 24,
            color: "white",
          }}
        >
          {row.topic}
        </div>
        {row.match ? (
          <Handshake size={28} weight="duotone" color="rgba(255,255,255,.6)" />
        ) : (
          <Shuffle size={28} weight="duotone" color={color} />
        )}
      </div>

      {/* Brain vs AI columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
          borderTop: "1px solid rgba(255,255,255,.07)",
        }}
      >
        <div style={{ padding: "14px 18px", background: "rgba(255,255,255,.03)" }}>
          <div
            style={{
              fontSize: pres ? 18 : 14,
              color: "rgba(255,255,255,.4)",
              fontFamily: "'Fredoka',sans-serif",
              marginBottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 6,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            <Brain size={pres ? 24 : 18} weight="duotone" /> BRAIN
          </div>
          <div style={{ fontSize: 20, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>
            {row.brain}
          </div>
        </div>
        <div style={{ padding: "14px 18px", background: `${color}08` }}>
          <div
            style={{
              fontSize: pres ? 18 : 14,
              color: `${color}99`,
              fontFamily: "'Fredoka',sans-serif",
              marginBottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 6,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            <Robot size={pres ? 24 : 18} weight="duotone" /> AI
          </div>
          <div style={{ fontSize: 20, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>
            {row.ai}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SectionBrainVsAI({ color, mode, slide }) {
  const [step, setStep] = useState(0);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

  const maxStep = 3;

  const advance = () => {
    if (step < maxStep) setStep((s) => s + 1);
  };

  // Keyboard: down arrow advances steps
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (step < maxStep) {
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
    const refs = { 1: step1Ref, 2: step2Ref, 3: step3Ref };
    const target = refs[step]?.current;
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [step]);

  /* ── Presentation mode ── */
  /* Slide 0: intro
     Slides 1-14: 7 comparisons × 2 (question → reveal)
     Slide 15: insight */
  if (mode === "presentation") {
    /* Slide 0: Big intro */
    if (slide === 0) {
      return (
        <PresSlide>
          <div style={{ display: "flex", alignItems: "center", gap: 36, marginBottom: 32 }}>
            <Brain size={80} weight="duotone" color="rgba(255,255,255,.7)" />
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 44, color: "rgba(255,255,255,.3)" }}>vs</div>
            <Robot size={80} weight="duotone" color={color} />
          </div>
          <PresText size={44}>How similar are they?</PresText>
          <PresText size={26} color="rgba(255,255,255,.4)">
            Let's go through them one at a time.
          </PresText>
        </PresSlide>
      );
    }

    /* Slides 1-14: One comparison per two slides (question → reveal) */
    if (slide >= 1 && slide <= 14) {
      const rowIdx = Math.floor((slide - 1) / 2);
      const isRevealed = (slide - 1) % 2 === 1;
      const row = rows[rowIdx];

      /* Question slide — just the topic, let kids think */
      if (!isRevealed) {
        return (
          <PresSlide>
            {/* Topic as big question */}
            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 48,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.3,
              marginBottom: 12,
            }}>
              {row.topic}
            </div>

            {/* Two icons as "sides" hint */}
            <div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 20 }}>
              <Brain size={56} weight="duotone" color="rgba(255,255,255,.35)" />
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 32, color: "rgba(255,255,255,.15)" }}>vs</div>
              <Robot size={56} weight="duotone" color={`${color}55`} />
            </div>

            <PresText size={28} color="rgba(255,255,255,.4)">
              What do you think? Same or different?
            </PresText>

            {/* Skip button */}

          </PresSlide>
        );
      }

      /* Reveal slide — show both answers side by side, big and clear */
      const matchIcon = row.match
        ? <Handshake size={44} weight="duotone" color="rgba(255,255,255,.55)" />
        : <Shuffle size={44} weight="duotone" color={color} />;
      const matchLabel = row.match ? "Similar!" : "Different!";
      const matchColor = row.match ? "rgba(255,255,255,.55)" : color;

      return (
        <PresSlide>
          {/* Topic */}
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 36,
            fontWeight: 700,
            color: "white",
            marginBottom: 4,
          }}>
            {row.topic}
          </div>

          {/* Match badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            {matchIcon}
            <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 24, color: matchColor, fontWeight: 600 }}>
              {matchLabel}
            </span>
          </div>

          {/* Side by side answers */}
          <div style={{ display: "flex", gap: 24, width: "100%", maxWidth: 820 }}>
            {/* Brain side */}
            <div style={{
              flex: 1, padding: "28px 24px", borderRadius: 20,
              background: "rgba(255,255,255,.05)", border: "2px solid rgba(255,255,255,.15)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center",
            }}>
              <Brain size={56} weight="duotone" color="rgba(255,255,255,.6)" />
              <div style={{
                fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: "rgba(255,255,255,.4)",
                textTransform: "uppercase", letterSpacing: 2,
              }}>Brain</div>
              <div style={{
                fontFamily: "'Fredoka',sans-serif", fontSize: 26,
                color: "rgba(255,255,255,.85)", lineHeight: 1.4,
              }}>
                {row.brain}
              </div>
            </div>

            {/* AI side */}
            <div style={{
              flex: 1, padding: "28px 24px", borderRadius: 20,
              background: `${color}10`, border: `2px solid ${color}40`,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center",
            }}>
              <Robot size={56} weight="duotone" color={color} />
              <div style={{
                fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: `${color}99`,
                textTransform: "uppercase", letterSpacing: 2,
              }}>AI</div>
              <div style={{
                fontFamily: "'Fredoka',sans-serif", fontSize: 26,
                color: "rgba(255,255,255,.85)", lineHeight: 1.4,
              }}>
                {row.ai}
              </div>
            </div>
          </div>

        </PresSlide>
      );
    }

    /* Slide 15: Insight */
    if (slide === 15) {
      return (
        <PresSlide>
          <Lightbulb size={48} weight="duotone" color={color} />
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 40,
            color: "rgba(255,255,255,.85)", lineHeight: 1.4, maxWidth: 700, textAlign: "center",
          }}>
            AI is something genuinely <strong style={{ color }}>NEW</strong>
          </div>
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 28,
            color: "rgba(255,255,255,.4)", lineHeight: 1.5, maxWidth: 600, textAlign: "center",
          }}>
            Inspired by brains, but not a brain. A powerful new kind of tool.
          </div>
        </PresSlide>
      );
    }

    return null;
  }

  return (
    <div className="fade-up">
      <Label color={color} mode={mode} text="INTRODUCTION · BRAIN VS AI" />
      <H1>Brain vs AI</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />

      {/* ── Step 0: Big intro ── */}
      <div
        style={{
          minHeight: "50vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
            marginBottom: 28,
          }}
        >
          <Brain size={64} weight="duotone" color="rgba(255,255,255,.7)" />
          <div
            style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 36,
              color: "rgba(255,255,255,.3)",
            }}
          >
            vs
          </div>
          <Robot size={64} weight="duotone" color={color} />
        </div>

        <div
          style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 28,
            color: "white",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Brain vs AI — how similar are they?
        </div>

        {step === 0 && (
          <ContinueButton onClick={advance} color={color} label="Let's compare" />
        )}
      </div>

      {/* ── Step 1: Rows 1-3 ── */}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {rows.slice(0, 3).map((r, i) => (
              <div key={i} style={{ animation: `fadeUp .4s ${i * 0.12}s ease both` }}>
                <ComparisonCard row={r} color={color} />
              </div>
            ))}
          </div>

          {step === 1 && (
            <ContinueButton onClick={advance} color={color} label="More comparisons" />
          )}
        </div>
      )}

      {/* ── Step 2: Rows 4-5 ── */}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {rows.slice(3, 5).map((r, i) => (
              <div key={i} style={{ animation: `fadeUp .4s ${i * 0.12}s ease both` }}>
                <ComparisonCard row={r} color={color} />
              </div>
            ))}
          </div>

          {step === 2 && (
            <ContinueButton onClick={advance} color={color} label="Final comparisons" />
          )}
        </div>
      )}

      {/* ── Step 3: Rows 6-7 + insight ── */}
      {step >= 3 && (
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
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
            {rows.slice(5, 7).map((r, i) => (
              <div key={i} style={{ animation: `fadeUp .4s ${i * 0.12}s ease both` }}>
                <ComparisonCard row={r} color={color} />
              </div>
            ))}
          </div>

          {/* Insight */}
          <div
            className="wow-reveal"
            style={{
              padding: "28px 24px",
              background: `${color}12`,
              border: `1px solid ${color}35`,
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              textAlign: "center",
            }}
          >
            <Lightbulb size={36} weight="duotone" color={color} />
            <div
              style={{
                fontFamily: "'Fredoka',sans-serif",
                fontSize: 22,
                color: "rgba(255,255,255,.85)",
                lineHeight: 1.5,
                maxWidth: 560,
              }}
            >
              AI and brains have more in common than you'd expect — and more
              differences too. The truth is, AI is something genuinely{" "}
              <strong style={{ color }}>new</strong>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
