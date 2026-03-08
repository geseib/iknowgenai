import { useState, useEffect, useRef, useCallback } from "react";
import {
  TextAa,
  PencilLine,
  Books,
  MaskHappy,
  PuzzlePiece,
  Sparkle,
  ArrowDown,
  ChatCircleDots,
  Brain,
  Lightning,
} from "@phosphor-icons/react";
import { Label, H1, TriviaBox, TeacherNote } from "./shared";

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

const INPUT_WORDS = ["The", "cat", "sat", "on", "the"];
const OUTPUT_WORD = "mat";

// Attention beam pairs — which words "talk" to each other
const ATTENTION_PAIRS = [
  [0, 1], [1, 2], [3, 4], [2, 0], [4, 1], [1, 3],
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

/* ─── The big animated layer visualization ─── */
function LayerAnimation({ color, onDone }) {
  const [phase, setPhase] = useState("idle"); // idle | attention | mlp | scrolling | output
  const [layerNum, setLayerNum] = useState(1);
  const [activeBeams, setActiveBeams] = useState([]);
  const [mlpNodes, setMlpNodes] = useState([]);
  const [started, setStarted] = useState(false);
  const animRef = useRef(null);
  const wordRefs = useRef([]);
  const svgRef = useRef(null);

  const start = useCallback(() => {
    if (started) return;
    setStarted(true);
    setPhase("attention");
    setLayerNum(1);
  }, [started]);

  // Run the full animation sequence
  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    let timeout;

    async function sleep(ms) {
      return new Promise(r => { timeout = setTimeout(r, ms); });
    }

    async function runAnimation() {
      // Phase 1: Show attention beams one by one
      setPhase("attention");
      for (let i = 0; i < ATTENTION_PAIRS.length; i++) {
        if (cancelled) return;
        setActiveBeams(prev => [...prev, ATTENTION_PAIRS[i]]);
        await sleep(300);
      }
      await sleep(600);

      // Phase 2: MLP thinking
      if (cancelled) return;
      setPhase("mlp");
      setActiveBeams([]);
      for (let i = 0; i < 5; i++) {
        if (cancelled) return;
        setMlpNodes(prev => [...prev, i]);
        await sleep(200);
      }
      await sleep(600);

      // Phase 3: Fast scroll through layers 2-96
      if (cancelled) return;
      setPhase("scrolling");
      setMlpNodes([]);

      // Accelerate through layers: slow at start, fast in middle, slow at end
      for (let layer = 2; layer <= 96; layer++) {
        if (cancelled) return;
        setLayerNum(layer);
        // Speed curve: slow for first 5, fast for middle, slow for last 5
        let delay;
        if (layer <= 5) delay = 200;
        else if (layer <= 10) delay = 100;
        else if (layer <= 85) delay = 30;
        else if (layer <= 92) delay = 100;
        else delay = 250;
        await sleep(delay);
      }

      await sleep(400);

      // Phase 4: Output word
      if (cancelled) return;
      setPhase("output");
      await sleep(2000);
      if (onDone) onDone();
    }

    runAnimation();
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [started, onDone]);

  // Calculate SVG beam positions from word elements
  const getWordCenter = (idx) => {
    const el = wordRefs.current[idx];
    const svg = svgRef.current;
    if (!el || !svg) return { x: 0, y: 0 };
    const elRect = el.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    return {
      x: elRect.left - svgRect.left + elRect.width / 2,
      y: elRect.top - svgRect.top + elRect.height / 2,
    };
  };

  const phaseLabel = phase === "attention" ? "Attention — words talk to each other"
    : phase === "mlp" ? "MLP — the thinking layer"
    : phase === "scrolling" ? "Processing..."
    : phase === "output" ? "Done!"
    : "Ready";

  return (
    <div
      ref={animRef}
      style={{
        background: "rgba(255,255,255,.04)",
        border: `2px solid ${color}30`,
        borderRadius: 20,
        padding: "28px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Layer counter */}
      <div style={{
        textAlign: "center",
        marginBottom: 20,
      }}>
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 16,
          color: "rgba(255,255,255,.4)",
          marginBottom: 4,
        }}>
          {phaseLabel}
        </div>
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 14,
          color: "rgba(255,255,255,.3)",
        }}>
          Layer
        </div>
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: phase === "scrolling" ? 56 : 40,
          fontWeight: 700,
          color,
          transition: "font-size .2s ease",
          lineHeight: 1.1,
        }}>
          {layerNum}
          <span style={{ fontSize: 20, fontWeight: 400, color: "rgba(255,255,255,.3)" }}> / 96</span>
        </div>
      </div>

      {/* Word row + SVG beams */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <svg
          ref={svgRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {phase === "attention" && activeBeams.map(([a, b], i) => {
            const from = getWordCenter(a);
            const to = getWordCenter(b);
            if (!from.x && !to.x) return null;
            const midY = Math.min(from.y, to.y) - 20 - (i % 3) * 12;
            return (
              <path
                key={i}
                d={`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${midY} ${to.x} ${to.y}`}
                fill="none"
                stroke={color}
                strokeWidth="2"
                opacity="0.6"
                style={{
                  animation: "fadeUp .3s ease forwards",
                }}
              >
                <animate
                  attributeName="stroke-dasharray"
                  from="0 200"
                  to="200 0"
                  dur="0.4s"
                  fill="freeze"
                />
              </path>
            );
          })}
        </svg>

        {/* Words */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          position: "relative",
          zIndex: 2,
        }}>
          {INPUT_WORDS.map((word, i) => (
            <div
              key={i}
              ref={el => wordRefs.current[i] = el}
              style={{
                fontFamily: "'Fredoka',sans-serif",
                fontSize: 22,
                fontWeight: 600,
                color: (phase === "attention" && activeBeams.some(([a, b]) => a === i || b === i))
                  ? color : "white",
                padding: "10px 16px",
                borderRadius: 12,
                background: (phase === "attention" && activeBeams.some(([a, b]) => a === i || b === i))
                  ? `${color}20` : "rgba(255,255,255,.08)",
                transition: "all .3s ease",
                border: `2px solid ${
                  (phase === "attention" && activeBeams.some(([a, b]) => a === i || b === i))
                    ? `${color}50` : "rgba(255,255,255,.1)"
                }`,
              }}
            >
              {word}
            </div>
          ))}
        </div>
      </div>

      {/* Attention visualization */}
      {phase === "attention" && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginBottom: 16,
          animation: "fadeUp .3s ease",
        }}>
          <ChatCircleDots size={24} weight="duotone" color={color} />
          <span style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 16,
            color: "rgba(255,255,255,.5)",
          }}>
            Words checking in with each other...
          </span>
        </div>
      )}

      {/* MLP visualization */}
      {phase === "mlp" && (
        <div style={{ animation: "fadeUp .3s ease" }}>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginBottom: 16,
          }}>
            <Brain size={24} weight="duotone" color={color} />
            <span style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 16,
              color: "rgba(255,255,255,.5)",
            }}>
              Thinking about what it all means...
            </span>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
          }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: mlpNodes.includes(i) ? `${color}40` : "rgba(255,255,255,.06)",
                  border: `2px solid ${mlpNodes.includes(i) ? color : "rgba(255,255,255,.1)"}`,
                  transition: "all .3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: mlpNodes.includes(i) ? "scale(1.15)" : "scale(1)",
                }}
              >
                {mlpNodes.includes(i) && (
                  <Lightning size={18} weight="fill" color={color} style={{ animation: "popIn .3s ease" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scrolling fast-forward visualization */}
      {phase === "scrolling" && (
        <div style={{ animation: "fadeUp .3s ease" }}>
          {/* Progress bar */}
          <div style={{
            height: 8,
            borderRadius: 4,
            background: "rgba(255,255,255,.08)",
            margin: "0 20px 12px",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${(layerNum / 96) * 100}%`,
              background: color,
              borderRadius: 4,
              transition: "width .05s linear",
            }} />
          </div>
          {/* Alternating attention/mlp indicators */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            opacity: 0.5,
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: layerNum % 2 === 0 ? 1 : 0.3,
              transition: "opacity .1s",
            }}>
              <ChatCircleDots size={20} weight="duotone" color={color} />
              <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 14, color: "rgba(255,255,255,.5)" }}>Attention</span>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: layerNum % 2 === 1 ? 1 : 0.3,
              transition: "opacity .1s",
            }}>
              <Brain size={20} weight="duotone" color={color} />
              <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 14, color: "rgba(255,255,255,.5)" }}>MLP</span>
            </div>
          </div>
        </div>
      )}

      {/* Output word */}
      {phase === "output" && (
        <div style={{
          textAlign: "center",
          animation: "wowReveal .6s cubic-bezier(.34,1.56,.64,1) forwards",
        }}>
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 16,
            color: "rgba(255,255,255,.4)",
            marginBottom: 8,
          }}>
            After 96 layers, the next word is...
          </div>
          <div style={{
            display: "inline-block",
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 48,
            fontWeight: 700,
            color: "#000",
            background: color,
            padding: "12px 36px",
            borderRadius: 16,
          }}>
            {OUTPUT_WORD}
          </div>
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 18,
            color: "rgba(255,255,255,.5)",
            marginTop: 12,
          }}>
            "The cat sat on the <strong style={{ color }}>{OUTPUT_WORD}</strong>"
          </div>
        </div>
      )}

      {/* Start button (if idle) */}
      {!started && (
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button
            onClick={start}
            className="cta-btn"
            style={{
              background: color,
              color: "#000",
              fontSize: 18,
              padding: "12px 28px",
            }}
          >
            Watch it think <Lightning size={18} weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function SectionLayers({ color, mode }) {
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
          <ContinueButton onClick={advance} color={color} label="Watch it in action" />
        )}
      </div>

      {/* ── Step 1: The big animation ── */}
      {step >= 1 && (
        <div
          ref={step1Ref}
          style={{
            animation: "fadeUp .5s ease",
            minHeight: "50vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 24,
          }}
        >
          <LayerAnimation color={color} onDone={() => {}} />

          {step === 1 && (
            <ContinueButton onClick={advance} color={color} label="See what each layer learns" />
          )}
        </div>
      )}

      {/* ── Step 2: Layer groups 1-3 ── */}
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
            The early layers build the basics...
          </div>

          {LAYER_CARDS.slice(0, 3).map((layer, i) => (
            <LayerCard key={i} layer={layer} color={color} />
          ))}

          {step === 2 && (
            <ContinueButton onClick={advance} color={color} label="See the deeper layers" />
          )}
        </div>
      )}

      {/* ── Step 3: Layer groups 4-6 + Trivia ── */}
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
