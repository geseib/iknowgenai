import { useState, useEffect } from "react";
import { PresSlide, PresText } from "./shared";

const mascotUrl = `${import.meta.env.BASE_URL}robotcomputerbrain.png`;

const RLHF_ROUNDS = [
  {
    prompt: "Explain gravity to a 7th grader",
    a: {
      text: "Gravity is the fundamental force described by Einstein's field equations, where mass curves spacetime geometry, causing geodesic deviation in test particles...",
      label: "Technical",
    },
    b: {
      text: "Imagine a trampoline with a bowling ball in the middle. Everything rolls toward it — that's basically gravity! The bigger the object, the more it pulls things in.",
      label: "Friendly",
    },
  },
  {
    prompt: "Write a joke about math",
    a: {
      text: "Why was the equal sign so humble? Because it knew it wasn't greater than or less than anyone else!",
      label: "Funny",
    },
    b: {
      text: "A joke is a form of humor that typically involves a setup and a punchline. In mathematics, humor can be derived from wordplay involving mathematical terms...",
      label: "Explains Instead",
    },
  },
  {
    prompt: "Is it OK to copy someone's homework?",
    a: {
      text: "Sure! Here's how: take a photo of their answers, change a few words so it looks different, and submit it as your own. Easy!",
      label: "Helpful but Harmful",
    },
    b: {
      text: "I get that homework can be tough! Instead of copying, try asking your teacher for help, working with a study buddy, or breaking it into smaller steps. You'll actually learn the material that way.",
      label: "Helpful AND Safe",
    },
  },
];

/* Personality trait labels computed from RLHF choices */
const TRAITS = [
  { label: "Clarity", aVal: 20, bVal: 90 },
  { label: "Friendliness", aVal: 15, bVal: 85 },
  { label: "Safety", aVal: 10, bVal: 95 },
];

/* ── MiniDial (reused spinning dial pattern) ─────────────────────────── */
function MiniDial({ spinning, color }) {
  const size = 38;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", position: "relative",
      background: "rgba(18,50,82,.6)",
      border: `4px solid ${spinning ? `${color}88` : `${color}`}`,
      boxShadow: spinning ? "none" : `0 0 12px ${color}40`,
      transition: "all .3s ease",
    }}>
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        width: 4, height: 13, borderRadius: 999,
        background: spinning ? `${color}cc` : color,
        transformOrigin: "50% calc(100% - 2px)",
        animation: spinning ? "needleSpin .9s linear infinite" : "none",
        transform: spinning ? undefined : "translate(-50%, -100%) rotate(135deg)",
      }} />
    </div>
  );
}

/* ── RLHF Choice Card ────────────────────────────────────────────────── */
function ChoiceCard({ text, label, selected, other, onClick, color, side }) {
  const isWinner = selected === true;
  const isLoser = selected === false && other === true;
  const waiting = selected === null && other === null;

  return (
    <div
      onClick={waiting ? onClick : undefined}
      style={{
        flex: 1,
        padding: "20px 22px",
        borderRadius: 18,
        cursor: waiting ? "pointer" : "default",
        background: isWinner ? `${color}15` : "rgba(255,255,255,.04)",
        border: isWinner ? `2px solid ${color}` : `2px solid rgba(255,255,255,.12)`,
        boxShadow: isWinner ? `0 0 24px ${color}30` : "none",
        opacity: isLoser ? 0.4 : 1,
        transform: isWinner ? "scale(1.02)" : (isLoser ? "scale(0.97)" : "none"),
        transition: "all .4s ease",
      }}
    >
      <div style={{
        fontFamily: "'Fredoka',sans-serif",
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        color: isWinner ? color : "rgba(255,255,255,.35)",
        marginBottom: 10,
      }}>
        {side} — {label}
      </div>
      <div style={{
        fontSize: 18,
        color: isWinner ? "rgba(255,255,255,.85)" : "rgba(255,255,255,.55)",
        lineHeight: 1.5,
      }}>
        "{text}"
      </div>
    </div>
  );
}

/* ── Main Section ────────────────────────────────────────────────────── */
export default function SectionThreeSteps({ color, mode, slide }) {
  const [choices, setChoices] = useState([null, null, null]); // null = not chosen, "a" or "b"

  // Reset choices when entering slide 5
  useEffect(() => {
    if (slide === 5) setChoices([null, null, null]);
  }, [slide]);

  if (mode !== "presentation") return null;

  // Slide 0: Hook — "Remember the joke?"
  if (slide === 0) return (
    <PresSlide>
      <PresText size={36} color="rgba(255,255,255,.5)">
        Remember the knock-knock joke?
      </PresText>
      <PresText size={40}>
        Real AI doesn't just read <em>one</em> joke...
      </PresText>
      <PresText size={48} color={color}>
        It reads the ENTIRE internet.
      </PresText>
      <PresText size={24} color="rgba(255,255,255,.35)">
        But raw reading isn't enough to be helpful.
      </PresText>
    </PresSlide>
  );

  // Slide 1: Stage 1 — Pre-training
  if (slide === 1) return (
    <PresSlide>
      <div style={{
        fontFamily: "'Fredoka',sans-serif", fontSize: 16, fontWeight: 600,
        letterSpacing: 3, textTransform: "uppercase",
        color: "rgba(255,255,255,.3)", marginBottom: -12,
      }}>
        STAGE 1
      </div>
      <PresText size={44} color={color}>
        Pre-training
      </PresText>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <img src={mascotUrl} alt="AI" style={{ width: 90, height: "auto" }} />
        <div style={{ display: "flex", gap: 8 }}>
          {[0, 1, 2, 3].map(i => (
            <MiniDial key={i} spinning={true} color={color} />
          ))}
        </div>
      </div>
      <PresText size={28} color="rgba(255,255,255,.6)">
        The AI speed-reads <strong style={{ color: "white" }}>trillions</strong> of words —
        websites, books, Wikipedia, Reddit, code...
      </PresText>
      <PresText size={22} color="rgba(255,255,255,.35)">
        It learns patterns, grammar, facts — everything mixed together.
      </PresText>
    </PresSlide>
  );

  // Slide 2: Raw model demo — pattern completion, not answering
  if (slide === 2) return (
    <PresSlide>
      <PresText size={28} color="rgba(255,255,255,.45)">
        After pre-training, you ask it a question...
      </PresText>
      <div style={{
        padding: "20px 28px", borderRadius: 16,
        background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)",
        maxWidth: 700, width: "100%",
      }}>
        <div style={{
          fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: "rgba(255,255,255,.4)",
          marginBottom: 8,
        }}>You:</div>
        <div style={{
          fontFamily: "'Fredoka',sans-serif", fontSize: 26, color: "white", marginBottom: 20,
        }}>
          "What is the capital of France?"
        </div>
        <div style={{
          fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: "rgba(255,255,255,.4)",
          marginBottom: 8,
        }}>Raw AI:</div>
        <div style={{
          fontFamily: "'Fredoka',sans-serif", fontSize: 24, color: "rgba(255,255,255,.55)",
          lineHeight: 1.5,
        }}>
          "What is the capital of Germany? What is the capital of Spain? What is the capital of Italy? What is the..."
        </div>
      </div>
      <PresText size={26} color={color}>
        It just continues the pattern! It doesn't know it should <em>answer</em>.
      </PresText>
    </PresSlide>
  );

  // Slide 3: Stage 2 — Instruction Tuning
  if (slide === 3) return (
    <PresSlide>
      <div style={{
        fontFamily: "'Fredoka',sans-serif", fontSize: 16, fontWeight: 600,
        letterSpacing: 3, textTransform: "uppercase",
        color: "rgba(255,255,255,.3)", marginBottom: -12,
      }}>
        STAGE 2
      </div>
      <PresText size={44} color={color}>
        Instruction Tuning
      </PresText>
      <PresText size={26} color="rgba(255,255,255,.55)">
        Humans write thousands of example conversations:
      </PresText>
      <div style={{ display: "flex", gap: 20, maxWidth: 800, width: "100%" }}>
        {/* Before card */}
        <div style={{
          flex: 1, padding: "18px 20px", borderRadius: 16,
          background: "rgba(255,100,100,.06)", border: "1px solid rgba(255,100,100,.2)",
        }}>
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 16, color: "#ff6b6b",
            letterSpacing: 2, textTransform: "uppercase", marginBottom: 12,
          }}>Before</div>
          <div style={{ fontSize: 20, color: "rgba(255,255,255,.5)", lineHeight: 1.5 }}>
            Q: "What's 2+2?"<br />
            AI: "What's 2+3? What's 2+4?..."
          </div>
        </div>
        {/* After card */}
        <div style={{
          flex: 1, padding: "18px 20px", borderRadius: 16,
          background: `${color}08`, border: `1px solid ${color}30`,
        }}>
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 16, color,
            letterSpacing: 2, textTransform: "uppercase", marginBottom: 12,
          }}>After</div>
          <div style={{ fontSize: 20, color: "rgba(255,255,255,.75)", lineHeight: 1.5 }}>
            Q: "What's 2+2?"<br />
            AI: "4! Need me to explain how?"
          </div>
        </div>
      </div>
      <PresText size={22} color="rgba(255,255,255,.35)">
        Now it knows to <em>answer</em> questions instead of just continuing patterns.
      </PresText>
    </PresSlide>
  );

  // Slide 4: Stage 3 intro — RLHF
  if (slide === 4) return (
    <PresSlide>
      <div style={{
        fontFamily: "'Fredoka',sans-serif", fontSize: 16, fontWeight: 600,
        letterSpacing: 3, textTransform: "uppercase",
        color: "rgba(255,255,255,.3)", marginBottom: -12,
      }}>
        STAGE 3
      </div>
      <PresText size={44} color={color}>
        Learning from Feedback
      </PresText>
      <PresText size={30} color="rgba(255,255,255,.6)">
        It can answer... but is it <em>actually</em> helpful?
      </PresText>
      <div className="wow-reveal" style={{
        fontFamily: "'Fredoka',sans-serif", fontSize: 56, fontWeight: 700,
        color, lineHeight: 1.2,
      }}>
        Humans teach it what GOOD means.
      </div>
      <PresText size={24} color="rgba(255,255,255,.4)">
        Let's play the rating game. You're the human teacher!
      </PresText>
    </PresSlide>
  );

  // Slides 5-7: RLHF Rounds
  if (slide >= 5 && slide <= 7) {
    const roundIdx = slide - 5;
    const round = RLHF_ROUNDS[roundIdx];
    const choice = choices[roundIdx];

    const pick = (side) => {
      setChoices(prev => {
        const next = [...prev];
        next[roundIdx] = side;
        return next;
      });
    };

    return (
      <PresSlide>
        <div style={{
          fontFamily: "'Fredoka',sans-serif", fontSize: 14, fontWeight: 600,
          letterSpacing: 2, textTransform: "uppercase",
          color: "rgba(255,255,255,.3)",
        }}>
          ROUND {roundIdx + 1} OF 3
        </div>
        <PresText size={28} color="rgba(255,255,255,.5)">
          Prompt: "{round.prompt}"
        </PresText>
        <PresText size={24} color="rgba(255,255,255,.35)">
          Which response is better? Click to pick!
        </PresText>

        <div style={{
          display: "flex", gap: 20, maxWidth: 900, width: "100%",
          alignItems: "stretch",
        }}>
          <ChoiceCard
            text={round.a.text}
            label={round.a.label}
            selected={choice === "a" ? true : choice === "b" ? false : null}
            other={choice === "b" ? true : choice === "a" ? false : null}
            onClick={() => pick("a")}
            color={color}
            side="A"
          />
          <ChoiceCard
            text={round.b.text}
            label={round.b.label}
            selected={choice === "b" ? true : choice === "a" ? false : null}
            other={choice === "a" ? true : choice === "b" ? false : null}
            onClick={() => pick("b")}
            color={color}
            side="B"
          />
        </div>

        {choice && (
          <div className="fade-up" style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 22,
            color: "rgba(255,255,255,.5)",
          }}>
            {roundIdx < 2
              ? "Great pick! Next round →"
              : "All 3 rounds complete! Let's see how the AI changed →"}
          </div>
        )}
      </PresSlide>
    );
  }

  // Slide 8: Results — personality dials shift
  if (slide === 8) {
    // Compute how many "b" choices (the "better" answers)
    const bCount = choices.filter(c => c === "b").length;

    return (
      <PresSlide>
        <PresText size={36} color={color}>
          Your feedback shaped the AI's personality!
        </PresText>

        <div style={{
          display: "flex", flexDirection: "column", gap: 16,
          maxWidth: 600, width: "100%",
        }}>
          {TRAITS.map((trait, i) => {
            // Blend between a and b values based on choices
            const bRatio = bCount / 3;
            const val = Math.round(trait.aVal + (trait.bVal - trait.aVal) * bRatio);
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 16,
              }}>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif", fontSize: 22, fontWeight: 600,
                  color: "white", minWidth: 140, textAlign: "right",
                }}>
                  {trait.label}
                </div>
                <div style={{
                  flex: 1, height: 16, borderRadius: 8,
                  background: "rgba(255,255,255,.08)", overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", borderRadius: 8,
                    width: `${val}%`,
                    background: color,
                    animation: "probIn .8s ease forwards",
                  }} />
                </div>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif", fontSize: 20,
                  color: "rgba(255,255,255,.5)", minWidth: 50,
                }}>
                  {val}%
                </div>
              </div>
            );
          })}
        </div>

        <PresText size={24} color="rgba(255,255,255,.5)">
          {bCount === 3
            ? "You picked all the helpful, safe answers — the AI learned to be friendly AND responsible!"
            : bCount === 0
            ? "Interesting choices! The AI learned a very different personality. This is why human feedback matters!"
            : "A mix of choices! Every human rater shapes the AI a little differently."}
        </PresText>

        <PresText size={20} color="rgba(255,255,255,.3)">
          Real AI companies have thousands of human raters doing exactly this.
        </PresText>
      </PresSlide>
    );
  }

  return null;
}
