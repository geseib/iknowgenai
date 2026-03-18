import { useState, useEffect, useRef } from "react";
import {
  ArrowDown,
  CheckCircle,
  XCircle,
  Lightbulb,
  Question,
} from "@phosphor-icons/react";
import { Card, Label, H1, TeacherNote, PresSlide, PresText } from "./shared";

const JOKE_DISPLAY = [
  "Knock knock.",
  "Who's there?",
  "Lettuce.",
  "Lettuce who?",
  "Lettuce in, it's cold out here!",
];

// Each round: 3 robots guess, one is correct
const ROUNDS = [
  {
    prompt: "Knock knock.",
    robots: [
      { guess: "Banana!", correct: false },
      { guess: "Who's there?", correct: true },
      { guess: "Hello!", correct: false },
    ],
  },
  {
    prompt: "Who's there?",
    robots: [
      { guess: "Pizza.", correct: false },
      { guess: "Tacos!", correct: false },
      { guess: "Lettuce.", correct: true },
    ],
  },
  {
    prompt: "Lettuce who?",
    robots: [
      { guess: "Lettuce play outside!", correct: false },
      { guess: "Lettuce in, it's cold out here!", correct: true },
      { guess: "Lettuce eat lunch!", correct: false },
    ],
  },
];

const notes = [
  "This is a simplified model of how training works. The key concept: AI learns by guessing, being told if it's right or wrong, and adjusting its internal settings.",
  "The 'weight dials' represent the billions of numbers inside the model. When it gets something wrong, those numbers shift slightly so the next guess is better.",
  "Good question for the class: 'If the AI practiced a thousand knock knock jokes, would it get better at guessing the punchline of a NEW joke it's never seen?' (Yes — it learns the pattern, not just the answers.)",
  "Emphasize: real AI does this millions of times with millions of examples. This is one tiny, simplified version of that process.",
];

const mascotUrl = `${import.meta.env.BASE_URL}robotcomputerbrain.png`;

/* ── Mini Dial (circular gauge with spinning needle) ─────────────────── */
function MiniDial({ state, color, seed, index }) {
  // Deterministic "locked" angle from seed
  const slots = [0, 45, 90, 135, 180, 225, 270, 315];
  const angle = slots[((seed || 0) * 137 + (index || 0) * 73) % slots.length];
  const size = 48;

  const isLocked = state === "locked";
  const isStopped = state === "stopped";
  const isSpinning = state === "spinning";

  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", position: "relative",
      background: "rgba(18,50,82,.6)",
      border: `5px solid ${isLocked ? color : isStopped ? `${color}55` : `${color}88`}`,
      boxShadow: isLocked
        ? `0 0 0 2px ${color}28, 0 0 18px ${color}50, inset 0 0 12px ${color}20`
        : "inset 0 0 0 1px rgba(255,255,255,.04)",
      opacity: isStopped ? 0.45 : 1,
      transition: "all .3s ease",
    }}>
      {/* Inner ring */}
      <div style={{
        position: "absolute", inset: 8, borderRadius: "50%",
        border: `3px solid ${isLocked ? `${color}44` : `${color}18`}`,
      }} />
      {/* Needle */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        width: 5, height: 16, borderRadius: 999,
        background: isLocked ? color : isStopped ? `${color}66` : `${color}cc`,
        transformOrigin: "50% calc(100% - 2px)",
        transform: isSpinning ? undefined : `translate(-50%, -100%) rotate(${angle}deg)`,
        animation: isSpinning ? `needleSpin .9s linear infinite` : "none",
        boxShadow: isLocked ? `0 0 10px ${color}ee` : "none",
        transition: isSpinning ? "none" : "background .3s ease",
      }} />
      {/* Pulse ring for winner */}
      {isLocked && (
        <div style={{
          position: "absolute", inset: -7, borderRadius: "50%",
          border: `2px solid ${color}99`,
          animation: "dialPulse 1.6s ease-out infinite",
          pointerEvents: "none",
        }} />
      )}
    </div>
  );
}

function DialRow({ state, color, seed }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 10, minHeight: 60,
    }}>
      {[0, 1, 2].map(i => (
        <MiniDial key={i} state={state} color={color} seed={seed} index={i} />
      ))}
    </div>
  );
}

/* ── Joke Progress (big, white, readable) ─────────────────────────────── */
function JokeProgress({ completedUpTo, color, pres }) {
  const fontSize = pres ? 30 : 22;
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: pres ? 12 : 10,
      justifyContent: "center", marginBottom: pres ? 20 : 24,
    }}>
      {JOKE_DISPLAY.map((line, i) => (
        <span key={i} style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize,
          fontWeight: 700,
          color: i <= completedUpTo ? "white" : "rgba(255,255,255,.25)",
          transition: "color .4s ease",
        }}>
          {line}
        </span>
      ))}
    </div>
  );
}

/* ── Single Robot with dials + guess ──────────────────────────────────── */
function RobotGuess({ guess, correct, revealed, seed, color, animate, pres }) {
  const imgSize = pres ? 70 : 60;
  const guessSize = pres ? 26 : 20;

  const isWinner = revealed && correct;
  const isLoser = revealed && !correct;

  // Dial state: stopped while waiting, locked for winner, spinning for losers (adjusting weights)
  const dialState = !revealed ? "stopped" : correct ? "locked" : "spinning";

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 10, minWidth: pres ? 180 : 140, maxWidth: pres ? 260 : 200,
      flex: "1 1 0",
      padding: pres ? "20px 16px" : "16px 12px",
      borderRadius: 18,
      background: isWinner
        ? `${color}15`
        : "rgba(255,255,255,.04)",
      border: isWinner
        ? `2px solid ${color}`
        : `2px solid rgba(255,255,255,.1)`,
      boxShadow: isWinner
        ? `0 0 0 1px ${color}28, 0 0 22px ${color}30, 0 0 56px ${color}18`
        : "none",
      opacity: isLoser ? 0.72 : 1,
      transform: isWinner ? "translateY(-2px)" : "none",
      transition: "all .35s ease",
      animation: animate ? "fadeUp .4s ease" : "none",
    }}>
      {/* Robot image */}
      <img src={mascotUrl} alt="AI" style={{
        width: imgSize, height: "auto",
        opacity: isLoser ? 0.4 : 1,
        transition: "opacity .3s ease",
      }} />

      {/* Spinning dials */}
      <DialRow state={dialState} color={color} seed={seed} />

      {/* Guess or question mark */}
      {revealed ? (
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            justifyContent: "center", marginBottom: 4,
          }}>
            {correct
              ? <CheckCircle size={28} weight="fill" color={color} />
              : <XCircle size={28} weight="fill" color="rgba(255,255,255,.3)" />}
          </div>
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: guessSize,
            color: correct ? color : "rgba(255,255,255,.4)",
            fontWeight: correct ? 700 : 400,
            lineHeight: 1.3,
            textDecoration: !correct ? "line-through" : "none",
          }}>
            "{guess}"
          </div>
        </div>
      ) : (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 44, height: 44, borderRadius: "50%",
          background: `${color}15`, border: `2px solid ${color}40`,
        }}>
          <Question size={28} weight="bold" color={color} />
        </div>
      )}
    </div>
  );
}

/* ── ContinueButton ──────────────────────────────────────────────────── */
function ContinueButton({ onClick, color, label }) {
  return (
    <div style={{ textAlign: "center", marginTop: 28, marginBottom: 16 }}>
      <button onClick={onClick} className="cta-btn"
        style={{ background: color, color: "#000", fontSize: 20, padding: "14px 32px", display: "inline-flex", alignItems: "center", gap: 8 }}>
        {label} <ArrowDown size={20} weight="bold" />
      </button>
    </div>
  );
}

/* ── Reading Prompt (words light up left to right) ───────────────────── */
function ReadingPrompt({ text, reading, color, size = 32 }) {
  const words = text.split(" ");
  const [litCount, setLitCount] = useState(0);

  useEffect(() => {
    if (!reading) { setLitCount(words.length); return; }
    setLitCount(0);
    const delay = 1800 / words.length; // spread across first 1.8s of the wait
    const timers = words.map((_, i) =>
      setTimeout(() => setLitCount(i + 1), delay * (i + 1))
    );
    return () => timers.forEach(clearTimeout);
  }, [reading, text]);

  return (
    <div style={{
      fontSize: size, textAlign: "center", lineHeight: 1.4,
      fontFamily: "'Fredoka',sans-serif", fontWeight: 700,
    }}>
      {words.map((w, i) => (
        <span key={i} style={{
          color: i < litCount ? color : "rgba(255,255,255,.18)",
          transition: "color .3s ease",
        }}>
          {w}{i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </div>
  );
}

/* ── Presentation: single round with auto-reveal ─────────────────────── */
function RobotRoundSlide({ round, roundIdx, color }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
    const timer = setTimeout(() => setRevealed(true), 2500);
    return () => clearTimeout(timer);
  }, [roundIdx]);

  const jokeCompletedUpTo = roundIdx + (revealed ? 1 : 0);

  return (
    <PresSlide>
      <JokeProgress completedUpTo={jokeCompletedUpTo} color={color} pres />

      <ReadingPrompt
        text={round.prompt}
        reading={!revealed}
        color="white"
        size={36}
      />
      <PresText size={24} color="rgba(255,255,255,.35)">
        predict what comes next...
      </PresText>

      {/* Three robots side by side */}
      <div style={{
        display: "flex", gap: 20, justifyContent: "center",
        width: "100%", maxWidth: 860,
      }}>
        {round.robots.map((r, i) => (
          <RobotGuess
            key={i}
            guess={r.guess}
            correct={r.correct}
            revealed={revealed}
            seed={roundIdx * 30 + i * 11 + (revealed ? 50 : 0)}
            color={color}
            animate={true}
            pres
          />
        ))}
      </div>

      {revealed && (
        <PresText size={22} color="rgba(255,255,255,.4)">
          Wrong robots adjust their weights and try again next round!
        </PresText>
      )}
    </PresSlide>
  );
}

/* ── Main Section ────────────────────────────────────────────────────── */
export default function SectionHowItLearns({ color, mode, slide }) {
  const [step, setStep] = useState(0);
  const [roundRevealed, setRoundRevealed] = useState([false, false, false]);
  const stepRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  // Interactive mode steps:
  // 0: Intro
  // 1: Round 1 (auto-reveals after delay)
  // 2: Round 2 (auto-reveals after delay)
  // 3: Round 3 (auto-reveals after delay)
  // 4: Insight
  const maxStep = 4;

  const advance = () => {
    if (step < maxStep) setStep(s => s + 1);
  };

  // Auto-reveal timer for each round
  useEffect(() => {
    if (step >= 1 && step <= 3) {
      const roundIdx = step - 1;
      if (!roundRevealed[roundIdx]) {
        const timer = setTimeout(() => {
          setRoundRevealed(prev => {
            const next = [...prev];
            next[roundIdx] = true;
            return next;
          });
        }, 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [step, roundRevealed]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (step < maxStep) advance();
        else window.dispatchEvent(new Event("sectionFullyRevealed"));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step]);

  useEffect(() => {
    const ref = stepRefs[Math.min(step - 1, stepRefs.length - 1)]?.current;
    if (ref && step > 0) {
      setTimeout(() => ref.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
    }
  }, [step]);

  const completedUpTo = step >= 3 && roundRevealed[2] ? 4 : step >= 2 && roundRevealed[1] ? 2 : step >= 1 && roundRevealed[0] ? 1 : 0;

  /* ── Presentation Mode ── */
  /* Slides 0-2: Interactive joke reveal with the class
     Slide 3: Transition to robots
     Slides 4-6: Robot rounds (auto-reveal after delay × 3)
     Slide 7: Insight */
  if (mode === "presentation") {
    // Slide 0: "Knock knock!" — kids will yell "Who's there?"
    if (slide === 0) {
      return (
        <PresSlide>
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 80,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.2,
          }}>
            Knock knock!
          </div>
          <PresText size={28} color="rgba(255,255,255,.35)">
            (Go on... say it...)
          </PresText>
        </PresSlide>
      );
    }

    // Slide 1: "Lettuce." — kids will say "Lettuce who?"
    if (slide === 1) {
      return (
        <PresSlide>
          <PresText size={32} color="rgba(255,255,255,.4)">
            Who's there?
          </PresText>
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 72,
            fontWeight: 700,
            color,
            lineHeight: 1.2,
            padding: "16px 48px",
            background: `${color}12`,
            border: `2px solid ${color}35`,
            borderRadius: 24,
          }}>
            Lettuce.
          </div>
        </PresSlide>
      );
    }

    // Slide 2: Punchline!
    if (slide === 2) {
      return (
        <PresSlide>
          <PresText size={32} color="rgba(255,255,255,.4)">
            Lettuce who?
          </PresText>
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 52,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.3,
            textAlign: "center",
          }}>
            Lettuce in,<br />
            it's <span style={{ color }}>cold</span> out here!
          </div>
          <PresText size={26} color="rgba(255,255,255,.35)">
            OK, great joke. Now here's the question...
          </PresText>
        </PresSlide>
      );
    }

    // Slide 3: Transition — can robots learn this joke?
    if (slide === 3) {
      return (
        <PresSlide>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 8 }}>
            {[0, 1, 2].map(i => (
              <img key={i} src={mascotUrl} alt="AI" style={{ width: 72, height: "auto" }} />
            ))}
          </div>
          <PresText size={40} color="white">
            Can three AI robots <span style={{ color }}>learn</span> this joke?
          </PresText>
          <PresText size={26} color="rgba(255,255,255,.45)">
            They've never heard it before. They have to guess word by word — and learn from their mistakes.
          </PresText>
        </PresSlide>
      );
    }

    // Slides 4-6: Robot rounds (auto-reveal after delay)
    if (slide >= 4 && slide <= 6) {
      const roundIdx = slide - 4;
      return (
        <RobotRoundSlide
          round={ROUNDS[roundIdx]}
          roundIdx={roundIdx}
          color={color}
        />
      );
    }

    // Slide 7: Insight
    if (slide === 7) {
      return (
        <PresSlide>
          <JokeProgress completedUpTo={4} color={color} pres />
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            {[0, 1, 2].map(i => (
              <img key={i} src={mascotUrl} alt="AI" style={{ width: 64, height: "auto" }} />
            ))}
          </div>
          <PresText size={44} color={color}>
            That's how AI learns!
          </PresText>
          <PresText size={28} color="rgba(255,255,255,.65)">
            Guess → wrong → adjust weights → try again
          </PresText>
          <PresText size={26} color="rgba(255,255,255,.55)">
            Now imagine doing this with every <strong style={{ color: "white" }}>website</strong>,{" "}
            every <strong style={{ color: "white" }}>book</strong>,{" "}
            every <strong style={{ color: "white" }}>paper</strong>,{" "}
            <strong style={{ color: "white" }}>magazine</strong>,{" "}
            <strong style={{ color: "white" }}>Instagram post</strong>,{" "}
            <strong style={{ color: "white" }}>social media conversation</strong>,{" "}
            <strong style={{ color: "white" }}>email</strong>,{" "}
            <strong style={{ color: "white" }}>text</strong>...
          </PresText>
          <PresText size={28} color="rgba(255,255,255,.65)">
            Reading a word and predicting the next word.<br />
            Sentence after sentence. <strong style={{ color }}>That's training.</strong>
          </PresText>
        </PresSlide>
      );
    }

    return null;
  }

  /* ── Interactive Mode (classroom / solo / minimal) ── */
  return (
    <div className="fade-up">
      <Label color={color} mode={mode} text="HOW AI THINKS · TRAINING" />
      <H1 mode={mode}>How Does AI Learn?</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />

      {/* ── Step 0: Intro ── */}
      <div style={{
        minHeight: "50vh", display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
      }}>
        <div style={{
          fontFamily: "'Fredoka',sans-serif", fontSize: 26,
          color: "white", textAlign: "center", lineHeight: 1.5, marginBottom: 24,
        }}>
          Let's teach three AI robots a <strong style={{ color }}>knock knock joke</strong>!
        </div>

        <Card style={{ padding: "20px 24px", marginBottom: 20, maxWidth: 600, width: "100%" }}>
          <div style={{
            fontSize: 13, fontFamily: "'Fredoka',sans-serif", letterSpacing: 2,
            color: "rgba(255,255,255,.35)", textTransform: "uppercase", marginBottom: 12,
          }}>
            The joke they need to learn:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {JOKE_DISPLAY.map((line, i) => (
              <span key={i} style={{
                fontFamily: "'Fredoka',sans-serif", fontSize: 22,
                color: "white", fontWeight: 700,
              }}>{line}</span>
            ))}
          </div>
        </Card>

        <div style={{
          display: "flex", gap: 12, justifyContent: "center", marginBottom: 16,
        }}>
          {[0, 1, 2].map(i => (
            <img key={i} src={mascotUrl} alt="AI" style={{ width: 56, height: "auto" }} />
          ))}
        </div>
        <div style={{
          fontSize: 18, color: "rgba(255,255,255,.5)", textAlign: "center",
        }}>
          Each robot has its own <strong style={{ color }}>weight dials</strong>. They all guess — only one gets it right!
        </div>

        {step === 0 && (
          <ContinueButton onClick={advance} color={color} label="Let's start!" />
        )}
      </div>

      {/* ── Rounds 1-3: auto-reveal after delay ── */}
      {ROUNDS.map((round, roundIdx) => {
        const roundStep = roundIdx + 1;
        const revealed = roundRevealed[roundIdx];
        const jokeCompletedBase = roundIdx;

        return (
          <div key={roundIdx}>
            {step >= roundStep && (
              <div
                ref={stepRefs[roundIdx]}
                style={{ animation: "fadeUp .4s ease", paddingTop: 24 }}
              >
                <JokeProgress completedUpTo={jokeCompletedBase + (revealed ? 1 : 0)} color={color} />
                <div style={{ marginBottom: 16 }}>
                  <ReadingPrompt
                    text={round.prompt}
                    reading={!revealed}
                    color="white"
                    size={22}
                  />
                  <div style={{
                    fontFamily: "'Fredoka',sans-serif", fontSize: 16,
                    color: "rgba(255,255,255,.35)", textAlign: "center", marginTop: 6,
                  }}>
                    predict what comes next...
                  </div>
                </div>
                <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                  {round.robots.map((r, i) => (
                    <RobotGuess
                      key={i}
                      guess={r.guess}
                      correct={r.correct}
                      revealed={revealed}
                      seed={roundIdx * 30 + i * 11 + (revealed ? 50 : 0)}
                      color={color}
                      animate={true}
                    />
                  ))}
                </div>

                {revealed && step === roundStep && (
                  <div style={{ textAlign: "center", marginTop: 12, animation: "fadeUp .4s ease" }}>
                    <div style={{
                      fontSize: 18, color: "rgba(255,255,255,.4)", marginBottom: 8,
                    }}>
                      Wrong robots adjust their weights and try again!
                    </div>
                    {roundIdx < 2 && (
                      <ContinueButton onClick={advance} color={color} label="Next word!" />
                    )}
                    {roundIdx === 2 && (
                      <ContinueButton onClick={advance} color={color} label="The big picture" />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ── Step 4: Insight ── */}
      {step >= 4 && (
        <div
          ref={stepRefs[3]}
          style={{
            animation: "fadeUp .5s ease", paddingTop: 24,
            minHeight: "50vh", display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "center",
          }}
        >
          <JokeProgress completedUpTo={4} color={color} />
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 16 }}>
            {[0, 1, 2].map(i => (
              <img key={i} src={mascotUrl} alt="AI" style={{ width: 56, height: "auto" }} />
            ))}
          </div>
          <div style={{
            padding: "24px 28px", background: `${color}12`,
            border: `1px solid ${color}35`, borderRadius: 16,
            maxWidth: 600, textAlign: "center",
          }}>
            <Lightbulb size={36} weight="duotone" color={color} style={{ marginBottom: 10 }} />
            <div style={{
              fontFamily: "'Fredoka',sans-serif", fontSize: 24,
              color, marginBottom: 12,
            }}>
              That's how AI learns!
            </div>
            <div style={{
              fontSize: 20, color: "rgba(255,255,255,.65)", lineHeight: 1.6,
            }}>
              Guess → wrong → adjust weights → try again.
            </div>
            <div style={{
              fontSize: 18, color: "rgba(255,255,255,.5)", lineHeight: 1.7, marginTop: 12,
            }}>
              Now imagine doing this with every <strong style={{ color }}>website</strong>,{" "}
              <strong style={{ color }}>book</strong>,{" "}
              <strong style={{ color }}>paper</strong>,{" "}
              <strong style={{ color }}>magazine</strong>,{" "}
              <strong style={{ color }}>Instagram post</strong>,{" "}
              <strong style={{ color }}>social media conversation</strong>,{" "}
              <strong style={{ color }}>email</strong>, and <strong style={{ color }}>text</strong>.
              Reading a word and predicting the next word. Sentence after sentence. That's training.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
