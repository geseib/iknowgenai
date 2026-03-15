import { useState, useEffect, useRef } from "react";
import {
  ArrowDown,
  HashStraight,
  MapTrifold,
  Flashlight,
  Brain,
  MagicWand,
  Books,
  TextAa,
  Lightbulb,
  GearSix,
  ChatCircleDots,
  Lightning,
} from "@phosphor-icons/react";
import { Label, H1, TeacherNote, PresSlide, PresText } from "./shared";

const STEP_ICONS = [HashStraight, MapTrifold, Flashlight, Brain, MagicWand];

const steps = [
  { step: "1", text: "Every word gets turned into a list of numbers the computer can work with." },
  { step: "2", text: "Those numbers place each word in a giant 'meaning space' where similar words cluster together." },
  { step: "3", text: "The model learns to pay attention to the right words to understand what things mean in context." },
  { step: "4", text: "It runs the information through many layers of 'thinking' to understand it more deeply." },
  { step: "5", text: "Then it predicts the most likely next word — and repeats the whole thing, word by word." },
];

const notes = [
  "This is the transition beat — use it as a dramatic pause before diving into the technical content.",
  "Good framing: 'We know what LLMs are and who makes them. Now we're going to open the hood and look at the engine. This is the part most adults don't know.'",
  "You can ask the class to predict: 'How do YOU think reading millions of books could teach a computer to write?' Take a few guesses. Don't reveal yet — let the curiosity build.",
  "The sections that follow (Numbers, Space, Attention, Thinking Layer, Predict) each answer a piece of this question. Remind kids they can hold questions and revisit.",
];

/* ── Training pipeline rows for slide 0 ── */
const TRAINING_ROWS = [
  { icon: Books, label: "Read the entire internet", sub: "trillions of words" },
  { icon: TextAa, label: "Learned spelling & grammar", sub: "every rule of language" },
  { icon: Brain, label: "Learned facts & knowledge", sub: "history, science, everything" },
  { icon: Lightbulb, label: "Learned how to reason", sub: "cause and effect, logic" },
];

const EXAMPLE_WORDS = ["The", "cat", "sat", "on", "the"];

/* ── Questions that flash during the thinking sub-phase ── */
const OVERVIEW_QUESTIONS = [
  "Is this spelled right?", "Is this a real word?", "Is this a noun or a verb?",
  "Past tense or present?", "Does a cat have fur?", "Can a cat sit?",
  "Is a mat a real thing?", "Is this a joke or serious?", "What's the mood here?",
  "What usually comes next?", "Does this make sense?", "What rhymes with cat?",
  "Is there a pattern here?", "Which word fits best?", "How confident am I?",
  "Is 'mat' better than 'hat'?", "Does this sound natural?",
];

/* Beam patterns that rotate during the attention sub-phase */
const OVERVIEW_BEAM_PATTERNS = [
  [[0, 1], [3, 4]],
  [[1, 2], [2, 4]],
  [[0, 3], [1, 4]],
  [[1, 3], [0, 2]],
  [[2, 3], [0, 4]],
  [[0, 4], [1, 2]],
];

/* ── OverviewPipelineAnim: the animated pipeline on slide 1 ── */
function OverviewPipelineAnim({ color }) {
  // phase: "idle" | "numbers" | "layers" | "output"
  const [phase, setPhase] = useState("idle");
  const [layerNum, setLayerNum] = useState(1);
  const [subPhase, setSubPhase] = useState("attn"); // "attn" | "think"
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [activeBeams, setActiveBeams] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [sentenceDropped, setSentenceDropped] = useState(false);
  const [gearSpinning, setGearSpinning] = useState(false);
  const wordRefs = useRef([]);
  const svgRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let timeout;

    function sleep(ms) {
      return new Promise(r => { timeout = setTimeout(r, ms); });
    }

    async function run() {
      // Initial pause — sentence visible at top
      await sleep(800);
      if (cancelled) return;

      // Numbers phase — highlight "cat" with vector numbers
      setPhase("numbers");
      await sleep(1200);
      if (cancelled) return;

      // Drop sentence into the machine
      setSentenceDropped(true);
      await sleep(600);
      if (cancelled) return;

      // Start the 96-layer loop
      setPhase("layers");
      setGearSpinning(true);

      for (let layer = 1; layer <= 96; layer++) {
        if (cancelled) return;
        setLayerNum(layer);

        // Speed curve
        let delay;
        if (layer <= 4) delay = 350;
        else if (layer <= 8) delay = 250;
        else if (layer <= 15) delay = 160;
        else if (layer <= 30) delay = 100;
        else if (layer <= 70) delay = 60;
        else if (layer <= 85) delay = 100;
        else if (layer <= 92) delay = 160;
        else delay = 280;

        // Attention sub-phase
        setSubPhase("attn");
        setActiveBeams(OVERVIEW_BEAM_PATTERNS[layer % OVERVIEW_BEAM_PATTERNS.length]);
        setCurrentQuestion("");
        await sleep(delay);
        if (cancelled) return;

        // Thinking sub-phase
        setSubPhase("think");
        setActiveBeams([]);
        setCurrentQuestion(OVERVIEW_QUESTIONS[layer % OVERVIEW_QUESTIONS.length]);
        await sleep(delay);
      }

      if (cancelled) return;
      setGearSpinning(false);
      await sleep(300);
      if (cancelled) return;

      // Output
      setPhase("output");
      setSubPhase("");
      setCurrentQuestion("");
      setShowResult(true);
    }

    run();
    return () => { cancelled = true; clearTimeout(timeout); };
  }, []);

  // SVG beam positions
  const getCenter = (idx) => {
    const el = wordRefs.current[idx];
    const svg = svgRef.current;
    if (!el || !svg) return { x: 0, y: 0 };
    const er = el.getBoundingClientRect();
    const sr = svg.getBoundingClientRect();
    return { x: er.left - sr.left + er.width / 2, y: er.top - sr.top + er.height / 2 };
  };

  const isLayers = phase === "layers";
  const showBeams = isLayers && subPhase === "attn";
  const showThink = isLayers && subPhase === "think";

  // Step tracker: 0 = not started, 1 = numbers, 2 = layers, 3 = output
  const activeStep = phase === "idle" ? 0
    : phase === "numbers" ? 1
    : phase === "layers" ? 2
    : 3; // output

  const STEPS = [
    { num: 1, label: "Words → Numbers" },
    { num: 2, label: "96× Attention & Thinking" },
    { num: 3, label: "Predict!" },
  ];

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {/* ── Step tracker ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        marginBottom: 20,
      }}>
        {STEPS.map((s, i) => {
          const stepNum = i + 1;
          const isDone = activeStep > stepNum;
          const isCurrent = activeStep === stepNum;
          const isReached = activeStep >= stepNum;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              {/* Connecting line (before steps 2 and 3) */}
              {i > 0 && (
                <div style={{
                  width: 40,
                  height: 2,
                  borderRadius: 1,
                  background: isDone || isCurrent ? color : "rgba(255,255,255,.08)",
                  transition: "background .4s ease",
                  opacity: isDone ? 1 : (isCurrent ? 0.6 : 1),
                }} />
              )}
              {/* Step circle + label */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  background: isDone ? color
                    : isCurrent ? `${color}30`
                    : "rgba(255,255,255,.06)",
                  color: isDone ? "#000"
                    : isCurrent ? color
                    : "rgba(255,255,255,.2)",
                  border: `2px solid ${isReached ? color : "rgba(255,255,255,.1)"}`,
                  transition: "all .4s ease",
                  boxShadow: isCurrent ? `0 0 12px ${color}35` : "none",
                }}>
                  {isDone ? "✓" : s.num}
                </div>
                <span style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 11,
                  color: isCurrent ? "rgba(255,255,255,.8)"
                    : isDone ? `${color}99`
                    : "rgba(255,255,255,.25)",
                  transition: "color .4s ease",
                  whiteSpace: "nowrap",
                }}>
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Sentence row ── */}
      <div style={{
        position: "relative",
        marginBottom: 20,
        transition: "transform .5s ease, opacity .5s ease",
        transform: sentenceDropped ? "translateY(8px)" : "translateY(0)",
      }}>
        <svg ref={svgRef} style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          pointerEvents: "none", zIndex: 1,
        }}>
          {showBeams && activeBeams.map(([a, b], i) => {
            const from = getCenter(a);
            const to = getCenter(b);
            if (!from.x && !to.x) return null;
            const midY = Math.min(from.y, to.y) - 22 - (i % 2) * 10;
            return (
              <path
                key={`${a}-${b}`}
                d={`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${midY} ${to.x} ${to.y}`}
                fill="none"
                stroke={color}
                strokeWidth="2"
                opacity="0.55"
              >
                <animate
                  attributeName="stroke-dasharray"
                  from="0 200"
                  to="200 0"
                  dur="0.3s"
                  fill="freeze"
                />
              </path>
            );
          })}
        </svg>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", position: "relative", zIndex: 2 }}>
          {EXAMPLE_WORDS.map((w, i) => (
            <div
              key={i}
              ref={el => wordRefs.current[i] = el}
              style={{
                fontFamily: "'Fredoka',sans-serif",
                fontSize: 24,
                fontWeight: 600,
                color: (phase === "numbers" && i === 1) ? color
                  : (showBeams && activeBeams.some(([a, b]) => a === i || b === i)) ? color
                  : "white",
                padding: "6px 14px",
                borderRadius: 10,
                background: (phase === "numbers" && i === 1) ? `${color}20`
                  : (showBeams && activeBeams.some(([a, b]) => a === i || b === i)) ? `${color}12`
                  : "rgba(255,255,255,.06)",
                border: `1.5px solid ${
                  (phase === "numbers" && i === 1) ? `${color}50` : "rgba(255,255,255,.1)"
                }`,
                transition: "all .15s ease",
              }}
            >
              {w}
              {phase === "numbers" && i === 1 && (
                <span style={{
                  fontSize: 11, color: `${color}99`, marginLeft: 6,
                  fontFamily: "monospace", animation: "fadeUp .3s ease",
                }}>
                  [0.42, −0.17, …]
                </span>
              )}
            </div>
          ))}
          {/* Result slot */}
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 24,
            fontWeight: 600,
            padding: "6px 14px",
            borderRadius: 10,
            border: `2px dashed ${showResult ? color : "rgba(255,255,255,.15)"}`,
            background: showResult ? `${color}20` : "transparent",
            color: showResult ? color : "rgba(255,255,255,.2)",
            minWidth: 64,
            textAlign: "center",
            transition: "all .4s ease",
            ...(showResult ? { animation: "wowReveal .6s cubic-bezier(.34,1.56,.64,1) forwards" } : {}),
          }}>
            {showResult ? "mat" : "___"}
          </div>
        </div>
      </div>

      {/* ── Machine: robot + counter + layers ── */}
      {(isLayers || phase === "output") && (
        <div style={{
          display: "flex",
          gap: 20,
          alignItems: "center",
          animation: phase === "output" ? "none" : "fadeUp .4s ease",
        }}>
          {/* Left: robot with spinning gear + counter */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            flexShrink: 0,
            width: 90,
          }}>
            <div style={{ position: "relative", width: 56, height: 56 }}>
              <img
                src={`${import.meta.env.BASE_URL}robotcomputerbrain.png`}
                alt="AI robot"
                style={{ width: 42, height: "auto", position: "absolute", top: 0, left: 0 }}
              />
              <GearSix
                size={28}
                weight="fill"
                color={color}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  animation: gearSpinning ? "gearSpin 1s linear infinite" : "none",
                  opacity: gearSpinning ? 1 : 0.3,
                  transition: "opacity .3s ease",
                }}
              />
            </div>
            {isLayers && (
              <div style={{
                fontFamily: "'Fredoka',sans-serif",
                fontSize: 15,
                color: "rgba(255,255,255,.45)",
                textAlign: "center",
                lineHeight: 1.2,
              }}>
                <span style={{ color, fontWeight: 700, fontSize: 22 }}>{layerNum}</span>
                <br />of 96
              </div>
            )}
          </div>

          {/* Right: the two layers that bounce */}
          {isLayers && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Attention row */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                borderRadius: 12,
                background: subPhase === "attn" ? `${color}15` : "rgba(255,255,255,.03)",
                border: `2px solid ${subPhase === "attn" ? `${color}50` : "rgba(255,255,255,.06)"}`,
                transition: "all .1s ease",
                boxShadow: subPhase === "attn" ? `0 0 14px ${color}25` : "none",
              }}>
                <ChatCircleDots
                  size={22}
                  weight="duotone"
                  color={subPhase === "attn" ? color : "rgba(255,255,255,.2)"}
                  style={{ flexShrink: 0, transition: "color .1s ease" }}
                />
                <span style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 16,
                  color: subPhase === "attn" ? "rgba(255,255,255,.8)" : "rgba(255,255,255,.25)",
                  transition: "color .1s ease",
                }}>
                  Attention — words look at each other
                </span>
              </div>

              {/* Thinking row */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                borderRadius: 12,
                background: subPhase === "think" ? `${color}15` : "rgba(255,255,255,.03)",
                border: `2px solid ${subPhase === "think" ? `${color}50` : "rgba(255,255,255,.06)"}`,
                transition: "all .1s ease",
                boxShadow: subPhase === "think" ? `0 0 14px ${color}25` : "none",
                minHeight: 48,
              }}>
                <Brain
                  size={22}
                  weight="duotone"
                  color={subPhase === "think" ? color : "rgba(255,255,255,.2)"}
                  style={{ flexShrink: 0, transition: "color .1s ease" }}
                />
                <span style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 16,
                  color: subPhase === "think" ? "rgba(255,255,255,.8)" : "rgba(255,255,255,.25)",
                  transition: "color .1s ease",
                  flex: 1,
                }}>
                  {subPhase === "think" && currentQuestion
                    ? <span key={currentQuestion} style={{ animation: "fadeUp .12s ease" }}>
                        Thinking — <em style={{ color: `${color}cc` }}>"{currentQuestion}"</em>
                      </span>
                    : "Thinking — asks questions about each word"}
                </span>
                {subPhase === "think" && (
                  <Lightning size={18} weight="fill" color={color} style={{ flexShrink: 0 }} />
                )}
              </div>

              {/* Progress bar */}
              <div style={{
                height: 6,
                borderRadius: 3,
                background: "rgba(255,255,255,.06)",
                overflow: "hidden",
                marginTop: 2,
              }}>
                <div style={{
                  height: "100%",
                  width: `${(layerNum / 96) * 100}%`,
                  background: color,
                  borderRadius: 3,
                  transition: "width .03s linear",
                }} />
              </div>
            </div>
          )}

          {/* Output state */}
          {phase === "output" && (
            <div style={{ flex: 1, textAlign: "center" }} className="wow-reveal">
              <div style={{
                fontFamily: "'Fredoka',sans-serif",
                fontSize: 20,
                color: "rgba(255,255,255,.5)",
                marginBottom: 4,
              }}>
                After 96 layers...
              </div>
              <div style={{
                fontFamily: "'Fredoka',sans-serif",
                fontSize: 18,
                color: "rgba(255,255,255,.7)",
              }}>
                it predicts: <span style={{ color, fontWeight: 700, fontSize: 26 }}>"mat"</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Idle / numbers description */}
      {phase === "idle" && (
        <div style={{
          fontFamily: "'Fredoka',sans-serif", fontSize: 18,
          color: "rgba(255,255,255,.4)", textAlign: "center", marginTop: 8,
        }}>
          Watch what happens...
        </div>
      )}
      {phase === "numbers" && (
        <div style={{
          fontFamily: "'Fredoka',sans-serif", fontSize: 18,
          color: "rgba(255,255,255,.5)", textAlign: "center", marginTop: 8,
          animation: "fadeUp .3s ease",
        }}>
          Each word becomes a list of <span style={{ color }}>numbers</span>
        </div>
      )}
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

export default function SectionTheBridge({ color, mode, slide }) {
  const [step, setStep] = useState(0);
  const step1Ref = useRef(null);

  const advance = () => {
    if (step < 1) setStep(s => s + 1);
  };

  // Keyboard: down arrow advances steps
  useEffect(() => {
    if (mode === "presentation") return;
    const handleKey = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (step < 1) {
          advance();
        } else {
          window.dispatchEvent(new Event("sectionFullyRevealed"));
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step, mode]);

  // Auto-scroll to newly revealed step
  useEffect(() => {
    if (mode === "presentation") return;
    const target = step === 1 ? step1Ref.current : null;
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [step, mode]);

  /* ── Presentation mode — 3 slides ── */
  if (mode === "presentation") {
    // Slide 0: Training overview
    if (slide === 0) {
      return (
        <PresSlide>
          <PresText color="white" size={42}>
            Before AI can help you, it has to <span style={{ color }}>learn</span>
          </PresText>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16, width: "100%", maxWidth: 600 }}>
            {TRAINING_ROWS.map((row, i) => {
              const Icon = row.icon;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "14px 20px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,.05)",
                    border: "1px solid rgba(255,255,255,.1)",
                    animation: `fadeUp .45s ${i * 0.12}s ease both`,
                  }}
                >
                  <Icon size={32} weight="duotone" color={color} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 20,
                      color: "white",
                      lineHeight: 1.3,
                    }}>
                      {row.label}
                    </div>
                    <div style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 15,
                      color: `${color}bb`,
                      lineHeight: 1.3,
                    }}>
                      {row.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <PresText size={20} color="rgba(255,255,255,.45)">
            This took <span style={{ color: "white", fontWeight: 700 }}>months</span> and{" "}
            <span style={{ color: "white", fontWeight: 700 }}>thousands</span> of computers.
          </PresText>
        </PresSlide>
      );
    }

    // Slide 1: The Big Pipeline — animated walkthrough
    if (slide === 1) {
      return (
        <PresSlide>
          <PresText color="white" size={36}>
            How it uses what it learned
          </PresText>
          <div style={{ width: "100%", maxWidth: 800, marginTop: 8 }}>
            <OverviewPipelineAnim color={color} />
          </div>
        </PresSlide>
      );
    }

    // Slide 2: The punchline
    if (slide === 2) {
      return (
        <PresSlide>
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 28,
            color: "rgba(255,255,255,.5)",
            marginBottom: 8,
          }}>
            "The cat sat on the{" "}
            <span style={{
              color,
              fontWeight: 700,
              textShadow: `0 0 20px ${color}60`,
            }}>
              mat
            </span>
            "
          </div>

          <PresText color="white" size={34}>
            96 layers of attention and thinking...{"\n"}just to add <span style={{ color, fontWeight: 700 }}>one word</span>.
          </PresText>

          <PresText size={24} color="rgba(255,255,255,.55)">
            Then it does the whole thing again.{" "}
            <span style={{ color: "rgba(255,255,255,.7)" }}>And again.</span>{" "}
            <span style={{ color: "white" }}>And again.</span>
          </PresText>

          <PresText size={20} color={`${color}99`}>
            Word by word. That's how AI writes.
          </PresText>
        </PresSlide>
      );
    }

    return null;
  }

  /* ── Non-presentation modes (unchanged) ── */
  return (
    <div className="fade-up">
      <Label color={color} mode={mode} text="MEET THE LLMS · THE BRIDGE" />
      <H1>The Big Question</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />

      {/* ── Step 0: The big dramatic question ── */}
      <div style={{ minHeight: "50vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 32,
          color: "white",
          textAlign: "center",
          lineHeight: 1.5,
          marginBottom: 16,
        }}>
          These models read
        </div>

        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 40,
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
          fontSize: 28,
          color: "rgba(255,255,255,.5)",
          textAlign: "center",
          lineHeight: 1.5,
        }}>
          ...but <span style={{ color: "white" }}>HOW</span> did that teach them to{" "}
          <span style={{ color: "white" }}>write back?</span>
        </div>

        {step === 0 && (
          <ContinueButton onClick={advance} color={color} label="I want to know!" />
        )}
      </div>

      {/* ── Step 1: The 5-step overview ── */}
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
          {steps.map((s, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 18,
                  animation: `fadeUp .4s ${i * 0.1}s ease both`,
                }}
              >
                {/* Number circle */}
                <div style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#000",
                  background: color,
                  borderRadius: "50%",
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {s.step}
                </div>

                {/* Icon */}
                <Icon size={28} weight="duotone" color={color} style={{ flexShrink: 0 }} />

                {/* Text */}
                <div style={{
                  fontSize: 20,
                  color: "rgba(255,255,255,.8)",
                  lineHeight: 1.5,
                }}>
                  {s.text}
                </div>
              </div>
            );
          })}

          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 22,
            color,
            textAlign: "center",
            marginTop: 28,
            lineHeight: 1.4,
          }}>
            Ready to see each step in action?
          </div>
        </div>
      )}
    </div>
  );
}
