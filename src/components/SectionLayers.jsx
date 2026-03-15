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
import { Label, H1, TriviaBox, TeacherNote, ModelNote, PresSlide, PresText } from "./shared";

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

// Different beam patterns for variety during fast scroll
const BEAM_PATTERNS = [
  [[0, 1], [2, 4]],
  [[1, 3], [0, 4]],
  [[2, 3], [1, 0]],
  [[4, 2], [3, 1]],
  [[0, 3], [1, 4]],
  [[3, 0], [4, 2]],
  [[1, 2], [3, 4]],
  [[0, 2], [1, 3]],
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
// Questions the MLP "asks" at each layer range — shown during scrolling
const LAYER_QUESTIONS = {
  // Layers 1–16: Letters & Spelling
  early: [
    "Is this spelled right?",
    "Is this a real word?",
    "Where does this word end?",
    "Is this uppercase or lowercase?",
    "Is there a period here?",
  ],
  // Layers 17–32: Words & Grammar
  grammar: [
    "Is this a noun or a verb?",
    "Past tense or present?",
    "Does the subject match the verb?",
    "Is this plural?",
    "What part of speech is this?",
  ],
  // Layers 33–48: Facts & Knowledge
  facts: [
    "Does a cat have fur?",
    "Can a cat sit?",
    "Is a mat a real thing?",
    "Do cats go outdoors?",
    "Is this something alive?",
  ],
  // Layers 49–64: Context & Tone
  context: [
    "Is this a joke or serious?",
    "Is someone being sarcastic?",
    "What's the mood here?",
    "Is this formal or casual?",
    "Who is speaking?",
  ],
  // Layers 65–80: Logic & Reasoning
  logic: [
    "What usually comes next?",
    "Does this make sense so far?",
    "What rhymes with 'cat'?",
    "Is there a pattern here?",
    "What would fit logically?",
  ],
  // Layers 81–96: Deep Understanding
  deep: [
    "Which word fits best?",
    "How confident am I?",
    "Is 'mat' better than 'hat'?",
    "Does this sound natural?",
    "Final answer?",
  ],
};

function getLayerQuestion(layer) {
  let bucket;
  if (layer <= 16) bucket = LAYER_QUESTIONS.early;
  else if (layer <= 32) bucket = LAYER_QUESTIONS.grammar;
  else if (layer <= 48) bucket = LAYER_QUESTIONS.facts;
  else if (layer <= 64) bucket = LAYER_QUESTIONS.context;
  else if (layer <= 80) bucket = LAYER_QUESTIONS.logic;
  else bucket = LAYER_QUESTIONS.deep;
  return bucket[layer % bucket.length];
}

function LayerAnimation({ color, onDone, pres }) {
  // scrollSub: "attn" or "mlp" — which half of the layer we're showing during scroll
  const [phase, setPhase] = useState("idle"); // idle | attention | mlp | scrolling | output
  const [layerNum, setLayerNum] = useState(1);
  const [activeBeams, setActiveBeams] = useState([]);
  const [mlpNodes, setMlpNodes] = useState([]);
  const [scrollSub, setScrollSub] = useState("attn"); // which sub-phase during scrolling
  const [currentQuestion, setCurrentQuestion] = useState("");
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
      // Phase 1: Show attention beams one by one (layer 1)
      setPhase("attention");
      for (let i = 0; i < ATTENTION_PAIRS.length; i++) {
        if (cancelled) return;
        setActiveBeams(prev => [...prev, ATTENTION_PAIRS[i]]);
        await sleep(300);
      }
      await sleep(600);

      // Phase 2: MLP thinking (layer 1)
      if (cancelled) return;
      setPhase("mlp");
      setActiveBeams([]);
      for (let i = 0; i < 5; i++) {
        if (cancelled) return;
        setMlpNodes(prev => [...prev, i]);
        await sleep(200);
      }
      await sleep(600);

      // Phase 3: Fast scroll through layers 2-96 with visible attention/MLP alternation
      if (cancelled) return;
      setPhase("scrolling");

      for (let layer = 2; layer <= 96; layer++) {
        if (cancelled) return;
        setLayerNum(layer);

        // Speed curve — each value is time per sub-phase (attn or mlp)
        // so total time per layer = delay * 2
        let delay;
        if (layer <= 4) delay = 400;       // slow start — let kids see the pattern
        else if (layer <= 8) delay = 300;
        else if (layer <= 15) delay = 200;
        else if (layer <= 30) delay = 120;
        else if (layer <= 70) delay = 80;   // cruising speed — still readable
        else if (layer <= 85) delay = 120;
        else if (layer <= 92) delay = 200;
        else delay = 350;                   // slow finish

        // Attention sub-phase: show beams
        const beamPattern = BEAM_PATTERNS[layer % BEAM_PATTERNS.length];
        setScrollSub("attn");
        setActiveBeams(beamPattern);
        setMlpNodes([]);
        setCurrentQuestion("");
        await sleep(delay);
        if (cancelled) return;

        // MLP sub-phase: show nodes + question
        const nodesForLayer = [0, 1, 2, 3, 4].filter((_, idx) => ((layer + idx) % 3) !== 0);
        setScrollSub("mlp");
        setActiveBeams([]);
        setMlpNodes(nodesForLayer);
        setCurrentQuestion(getLayerQuestion(layer));
        await sleep(delay);
      }

      await sleep(400);

      // Phase 4: Output word
      if (cancelled) return;
      setActiveBeams([]);
      setMlpNodes([]);
      setCurrentQuestion("");
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

  const showBeams = phase === "attention" || (phase === "scrolling" && scrollSub === "attn");
  const showMlp = phase === "mlp" || (phase === "scrolling" && scrollSub === "mlp");

  const phaseLabel = phase === "attention" ? "Attention — words talk to each other"
    : phase === "mlp" ? "MLP — the thinking layer"
    : phase === "scrolling" && scrollSub === "attn" ? "Attention"
    : phase === "scrolling" && scrollSub === "mlp" ? "MLP"
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
          fontSize: pres ? 20 : 16,
          color: "rgba(255,255,255,.4)",
          marginBottom: 4,
        }}>
          {phaseLabel}
        </div>
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: pres ? 18 : 14,
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
          {showBeams && activeBeams.map(([a, b], i) => {
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
                color: (showBeams && activeBeams.some(([a, b]) => a === i || b === i))
                  ? color : "white",
                padding: "10px 16px",
                borderRadius: 12,
                background: (showBeams && activeBeams.some(([a, b]) => a === i || b === i))
                  ? `${color}20` : "rgba(255,255,255,.08)",
                transition: "all .3s ease",
                border: `2px solid ${
                  (showBeams && activeBeams.some(([a, b]) => a === i || b === i))
                    ? `${color}50` : "rgba(255,255,255,.1)"
                }`,
              }}
            >
              {word}
            </div>
          ))}
        </div>
      </div>

      {/* Attention label (initial slow phase only) */}
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

      {/* MLP nodes — visible during mlp phase AND scrolling mlp sub-phase */}
      {showMlp && (
        <div>
          {phase === "mlp" && (
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
          )}
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
                  transition: "all .08s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: mlpNodes.includes(i) ? "scale(1.15)" : "scale(1)",
                }}
              >
                {mlpNodes.includes(i) && (
                  <Lightning size={18} weight="fill" color={color} />
                )}
              </div>
            ))}
          </div>
          {/* Flashing question during MLP sub-phase of scrolling */}
          {currentQuestion && phase === "scrolling" && scrollSub === "mlp" && (
            <div
              key={currentQuestion}
              style={{
                fontFamily: "'Fredoka',sans-serif",
                fontSize: pres ? 18 : 15,
                color: `${color}cc`,
                textAlign: "center",
                marginTop: 10,
                fontStyle: "italic",
                animation: "fadeUp .15s ease",
              }}
            >
              "{currentQuestion}"
            </div>
          )}
        </div>
      )}

      {/* Progress bar — during scrolling phase */}
      {phase === "scrolling" && (
        <div style={{ marginTop: 16 }}>
          <div style={{
            height: 8,
            borderRadius: 4,
            background: "rgba(255,255,255,.08)",
            margin: "0 20px 8px",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${(layerNum / 96) * 100}%`,
              background: color,
              borderRadius: 4,
              transition: "width .03s linear",
            }} />
          </div>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: scrollSub === "attn" ? 1 : 0.25,
              transition: "opacity .08s",
            }}>
              <ChatCircleDots size={20} weight="duotone" color={color} />
              <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: pres ? 18 : 14, color: "rgba(255,255,255,.5)" }}>Attention</span>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: scrollSub === "mlp" ? 1 : 0.25,
              transition: "opacity .08s",
            }}>
              <Brain size={20} weight="duotone" color={color} />
              <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: pres ? 18 : 14, color: "rgba(255,255,255,.5)" }}>MLP</span>
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

export default function SectionLayers({ color, mode, slide }) {
  const [step, setStep] = useState(0);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

  if (mode === "presentation") {
    if (slide === 0) {
      return (
        <PresSlide>
          <PresText color="white" size={36}>One round isn't enough.</PresText>
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 72, fontWeight: 700, color, lineHeight: 1 }}>96</div>
          <PresText size={28}>TIMES</PresText>
          <PresText size={24}>
            <em>Each pass makes the understanding richer.</em>
          </PresText>
        </PresSlide>
      );
    }
    if (slide === 1) {
      return (
        <PresSlide>
          <LayerAnimation color={color} onDone={() => {}} pres />
        </PresSlide>
      );
    }
  }

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
      <Label color={color} mode={mode} text="HOW AI THINKS · STEP 5" />
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

          <TriviaBox mode={mode} visible={true} color={color} number="96" label="transformer layers"
            fact="Each layer is its own full Attention + MLP block. Run 96 of them in sequence and you go from raw letters to nuanced, reasoned understanding." />

          <div style={{ height: 16 }} />

          <TriviaBox mode={mode} visible={true} color={color} number="400,000,000,000" label="calculations per word"
            fact="The biggest AI models perform over 400 billion math calculations just to predict a single word. A person doing one calculation per second would need over 12,000 years to do what the model does in a fraction of a second." />

          <ModelNote color={color} mode={mode}>
            Some models have 32 layers, some have 96, some have even more. The exact number changes as researchers find better designs — it's not always bigger! But the idea of stacking layers to build deeper understanding is how all these models work.
          </ModelNote>
        </div>
      )}
    </div>
  );
}
