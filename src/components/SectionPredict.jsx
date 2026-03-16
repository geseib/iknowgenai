import { useState, useEffect, useRef } from "react";
import {
  Snowflake,
  Scales,
  Fire,
  Flame,
  Star,
  ArrowCounterClockwise,
  Confetti,
  ArrowDown,
  Target,
} from "@phosphor-icons/react";
import { Card, Label, H1, TriviaBox, TeacherNote, PresSlide, PresText } from "./shared";
import { P_POSITIONS, applyTemp, sampleWord, tempMeta } from "../data/predict";

const TEMP_ICONS = {
  Frozen:   Snowflake,
  Cold:     Snowflake,
  Balanced: Scales,
  Warm:     Fire,
  Wild:     Flame,
};

const notes = [
  "The temperature slider is the big payoff of this section. Generate a sentence at temp 0.1 (frozen), then reset and generate again at temp 1.5 (wild). Show the class how the same prompt gives different results.",
  "Ask: 'At temperature zero, if you asked the same question 100 times, would you always get the same answer?' Yes — and explain that some AI tools set low temperature for consistent, reliable answers (like search or coding help).",
  "Ask: 'Why would you WANT high temperature?' Brainstorming, creative writing, generating lots of different ideas. Low temperature: factual Q&A, customer support, legal docs.",
  "The 'layer passes' counter is a great physical intuition-builder. By the end of a 9-word sentence you've run 864 layer passes. A real paragraph is thousands.",
  "Final discussion: 'Now that you know how AI works under the hood — does it change how you think about using it? What does it do well? What might it struggle with?'",
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

/* ── Labels showing what each word contributes to "the" ── */
const MEANING_LABELS = [
  { word: "The", meaning: "grammar & structure" },
  { word: "cat", meaning: "it's about an animal" },
  { word: "sat", meaning: "a physical action" },
  { word: "on", meaning: "location / position" },
];

const PREDICT_CANDIDATES = [
  { word: "mat", pct: 42 },
  { word: "floor", pct: 18 },
  { word: "rug", pct: 12 },
  { word: "ground", pct: 9 },
  { word: "couch", pct: 6 },
];

/* ── MeaningLoadSlide: expanded animation of meaning → "the" → prediction ── */
function MeaningLoadSlide({ color }) {
  // phase: 0=idle, 1=beams flowing, 2=labels appear, 3=loaded, 4=candidates, 5=pick
  const [phase, setPhase] = useState(0);
  const wordRefs = useRef([]);
  const svgRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let timeout;
    function sleep(ms) { return new Promise(r => { timeout = setTimeout(r, ms); }); }

    async function run() {
      await sleep(600);
      if (cancelled) return;

      // Phase 1: beams flow from words 0-3 into word 4
      setPhase(1);
      await sleep(1400);
      if (cancelled) return;

      // Phase 2: labels appear showing what each word contributes
      setPhase(2);
      await sleep(2400);
      if (cancelled) return;

      // Phase 3: "the" fully loaded — pulse big
      setPhase(3);
      await sleep(1400);
      if (cancelled) return;

      // Phase 4: candidate list appears
      setPhase(4);
      await sleep(2000);
      if (cancelled) return;

      // Phase 5: "mat" picked
      setPhase(5);
    }

    run();
    return () => { cancelled = true; clearTimeout(timeout); };
  }, []);

  const getCenter = (idx) => {
    const el = wordRefs.current[idx];
    const svg = svgRef.current;
    if (!el || !svg) return { x: 0, y: 0 };
    const er = el.getBoundingClientRect();
    const sr = svg.getBoundingClientRect();
    return { x: er.left - sr.left + er.width / 2, y: er.top - sr.top + er.height / 2 };
  };

  const words = ["The", "cat", "sat", "on", "the"];
  const isLoading = phase >= 1 && phase <= 2;
  const isLoaded = phase >= 3;
  const showCandidates = phase >= 4;
  const isPicked = phase >= 5;

  return (
    <PresSlide>
      <div style={{ width: "100%", maxWidth: 700 }}>
        {/* Sentence row with SVG beams */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <svg ref={svgRef} style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            pointerEvents: "none", zIndex: 1,
          }}>
            {/* Beams from words 0-3 into "the" (index 4) */}
            {(phase === 1 || phase === 2) && [0, 1, 2, 3].map((srcIdx, i) => {
              const from = getCenter(srcIdx);
              const to = getCenter(4);
              if (!from.x && !to.x) return null;
              const midY = Math.min(from.y, to.y) - 32 - (i % 2) * 16;
              return (
                <path
                  key={`beam-${srcIdx}`}
                  d={`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${midY} ${to.x} ${to.y}`}
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                  opacity="0.7"
                  style={{ animation: `fadeUp .5s ${i * 0.2}s ease both` }}
                >
                  <animate
                    attributeName="stroke-dasharray"
                    from="0 400"
                    to="400 0"
                    dur={`${0.7 + i * 0.1}s`}
                    fill="freeze"
                  />
                </path>
              );
            })}
          </svg>

          <div style={{
            display: "flex", gap: 14, justifyContent: "center",
            position: "relative", zIndex: 2,
          }}>
            {words.map((w, i) => {
              const isTarget = i === 4;
              const isSource = i < 4;
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div
                    ref={el => wordRefs.current[i] = el}
                    style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: isTarget && isLoaded ? 30 : 26,
                      fontWeight: 600,
                      padding: isTarget && isLoaded ? "10px 20px" : "8px 16px",
                      borderRadius: 12,
                      color: isTarget && phase >= 1 ? color
                        : isSource && isLoading ? `${color}cc`
                        : isSource && isLoaded ? "rgba(255,255,255,.3)"
                        : "white",
                      background: isTarget && phase >= 1 ? `${color}25`
                        : isSource && isLoading ? `${color}10`
                        : "rgba(255,255,255,.06)",
                      border: `2px solid ${
                        isTarget && phase >= 1 ? color
                        : isSource && isLoading ? `${color}40`
                        : "rgba(255,255,255,.1)"
                      }`,
                      boxShadow: isTarget && isLoaded
                        ? `0 0 28px ${color}60, 0 0 56px ${color}20`
                        : (isTarget && phase >= 1 ? `0 0 14px ${color}35` : "none"),
                      transform: isTarget && isLoaded ? "scale(1.1)" : "scale(1)",
                      transition: "all .5s ease",
                    }}
                  >
                    {w}
                  </div>
                  {/* Meaning labels below source words */}
                  {isSource && phase >= 2 && (
                    <div style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 11,
                      color: phase >= 3 ? "rgba(255,255,255,.2)" : `${color}aa`,
                      textAlign: "center",
                      maxWidth: 80,
                      lineHeight: 1.2,
                      animation: "fadeUp .3s ease",
                      transition: "color .5s ease",
                    }}>
                      {MEANING_LABELS[i].meaning}
                    </div>
                  )}
                  {/* "Loaded" label under "the" */}
                  {isTarget && isLoaded && (
                    <div style={{
                      fontFamily: "'Fredoka',sans-serif",
                      fontSize: 12,
                      color,
                      fontWeight: 600,
                      animation: "fadeUp .4s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}>
                      <Target size={14} weight="fill" color={color} />
                      loaded with meaning
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Description text */}
        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 18,
          color: "rgba(255,255,255,.55)",
          textAlign: "center",
          lineHeight: 1.5,
          marginBottom: 20,
          minHeight: 52,
        }}>
          {phase === 0 && <span style={{ animation: "fadeUp .3s ease" }}>The model has processed all 96 layers...</span>}
          {phase === 1 && <span style={{ animation: "fadeUp .3s ease" }}>Each word sends its meaning into the <span style={{ color, fontWeight: 700 }}>last position</span></span>}
          {phase === 2 && <span style={{ animation: "fadeUp .3s ease" }}>Grammar, facts, context — it all flows into "<span style={{ color, fontWeight: 700 }}>the</span>"</span>}
          {phase === 3 && <span style={{ animation: "fadeUp .3s ease" }}>"<span style={{ color, fontWeight: 700 }}>the</span>" now holds the meaning of the entire sentence + everything it ever learned</span>}
          {phase >= 4 && <span style={{ animation: "fadeUp .3s ease" }}>From all that meaning, it ranks what word is most likely next:</span>}
        </div>

        {/* Candidate list */}
        {showCandidates && (
          <div style={{
            maxWidth: 400,
            margin: "0 auto",
            background: "rgba(255,255,255,.04)",
            border: `2px solid ${color}30`,
            borderRadius: 16,
            padding: "14px 18px",
            animation: "fadeUp .4s ease",
          }}>
            {PREDICT_CANDIDATES.map((c, i) => {
              const isTop = i === 0;
              const highlighted = isTop && isPicked;
              return (
                <div
                  key={c.word}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "7px 10px",
                    marginBottom: i < 4 ? 4 : 0,
                    borderRadius: 10,
                    background: highlighted ? `${color}20` : "transparent",
                    border: `2px solid ${highlighted ? `${color}60` : "transparent"}`,
                    transition: "all .4s ease",
                    animation: `fadeUp .3s ${i * 0.07}s ease both`,
                    boxShadow: highlighted ? `0 0 14px ${color}30` : "none",
                  }}
                >
                  <span style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: highlighted ? 22 : 17,
                    fontWeight: highlighted ? 700 : 400,
                    color: highlighted ? color : (isTop && !isPicked ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.4)"),
                    width: 65,
                    transition: "all .4s ease",
                  }}>
                    {c.word}
                    {highlighted && <Star size={16} weight="fill" color={color} style={{ marginLeft: 4, verticalAlign: "middle" }} />}
                  </span>
                  <div style={{
                    flex: 1,
                    height: highlighted ? 10 : 7,
                    background: "rgba(255,255,255,.06)",
                    borderRadius: 5,
                    overflow: "hidden",
                    transition: "height .4s ease",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${(c.pct / 42) * 100}%`,
                      borderRadius: 5,
                      background: highlighted ? color : "rgba(255,255,255,.18)",
                      transition: "background .4s ease",
                      animation: `probIn .5s ${i * 0.07 + 0.15}s ease both`,
                    }} />
                  </div>
                  <span style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: highlighted ? 18 : 14,
                    fontWeight: highlighted ? 700 : 400,
                    color: highlighted ? color : "rgba(255,255,255,.25)",
                    width: 40,
                    textAlign: "right",
                    transition: "all .4s ease",
                  }}>
                    {c.pct}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PresSlide>
  );
}

export default function SectionPredict({ color, mode, slide }) {
  const [temp, setTemp] = useState(.8);
  const [words, setWords] = useState([]);
  const [layerCount, setLayerCount] = useState(0);
  const [step, setStep] = useState(0);

  const step1Ref = useRef(null);

  const currentPos = words.length;
  const done = currentPos >= P_POSITIONS.length;
  const dist = done ? [] : applyTemp(P_POSITIONS[currentPos].candidates, temp);
  const tm = tempMeta(temp);
  const TempIcon = TEMP_ICONS[tm.name] || Scales;

  const pick = () => {
    if (done) return;
    setWords(w => [...w, sampleWord(dist)]);
    setLayerCount(c => c + 96);
  };

  const reset = () => { setWords([]); setLayerCount(0); };

  const advance = () => {
    if (step < 1) setStep(s => s + 1);
  };

  // Keyboard: down arrow generates next word OR advances step
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (step === 0 && !done) {
          pick();
        } else if (step === 0 && done) {
          advance();
        } else if (step >= 1) {
          window.dispatchEvent(new Event("sectionFullyRevealed"));
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step, done, dist]);

  // Auto-scroll to newly revealed step
  useEffect(() => {
    const target = step === 1 ? step1Ref.current : null;
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [step]);

  if (mode === "presentation") {
    /* Slide 0: The question — how did it pick that word? */
    if (slide === 0) {
      return (
        <PresSlide>
          <PresText color="white" size={28}>
            "The cat sat on the <span style={{ color, fontWeight: 700 }}>mat</span>"
          </PresText>
          <PresText color="white" size={48}>
            But how did it <span style={{ color }}>pick</span> that word?
          </PresText>
        </PresSlide>
      );
    }

    /* Slide 1: Animated — meaning loads into "the", then prediction emerges */
    if (slide === 1) {
      return <MeaningLoadSlide color={color} />;
    }

    /* Slide 2: Probability list — the last word carries everything */
    if (slide === 2) {
      const candidates = [
        { word: "mat",    pct: 42 },
        { word: "floor",  pct: 18 },
        { word: "rug",    pct: 12 },
        { word: "ground", pct: 9 },
        { word: "couch",  pct: 6 },
        { word: "table",  pct: 4 },
        { word: "bed",    pct: 3 },
        { word: "roof",   pct: 2 },
      ];
      return (
        <PresSlide>
          <PresText size={26} color="rgba(255,255,255,.55)">
            After 96 layers, the last position holds <em>everything</em> —
          </PresText>
          <PresText size={24} color="rgba(255,255,255,.45)">
            all the words, all the context, all the facts it gathered.
          </PresText>
          <PresText size={28} color="white">
            It turns that into a <span style={{ color, fontWeight: 700 }}>ranked list</span> of what could come next:
          </PresText>

          <div style={{
            width: "100%",
            maxWidth: 520,
            background: "rgba(255,255,255,.04)",
            border: `2px solid ${color}30`,
            borderRadius: 18,
            padding: "20px 24px",
          }}>
            {candidates.map((c, i) => {
              const isTop = i === 0;
              return (
                <div
                  key={c.word}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "10px 14px",
                    marginBottom: i < candidates.length - 1 ? 6 : 0,
                    borderRadius: 12,
                    background: isTop ? `${color}18` : "transparent",
                    border: isTop ? `2px solid ${color}50` : "2px solid transparent",
                    animation: `fadeUp .4s ${i * 0.06}s ease both`,
                  }}
                >
                  {/* Rank */}
                  <div style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 15,
                    color: isTop ? color : "rgba(255,255,255,.25)",
                    width: 22,
                    textAlign: "right",
                    flexShrink: 0,
                  }}>
                    {i + 1}.
                  </div>
                  {/* Word */}
                  <div style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: isTop ? 26 : 20,
                    fontWeight: isTop ? 700 : 400,
                    color: isTop ? color : "rgba(255,255,255,.6)",
                    width: 90,
                    flexShrink: 0,
                  }}>
                    {c.word}
                    {isTop && <Star size={18} weight="fill" color={color} style={{ marginLeft: 6, verticalAlign: "middle" }} />}
                  </div>
                  {/* Bar */}
                  <div style={{ flex: 1, height: isTop ? 14 : 10, background: "rgba(255,255,255,.06)", borderRadius: 7, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${(c.pct / candidates[0].pct) * 100}%`,
                      borderRadius: 7,
                      background: isTop ? color : "rgba(255,255,255,.18)",
                      boxShadow: isTop ? `0 0 12px ${color}40` : "none",
                      animation: `probIn .6s ${i * 0.06 + 0.2}s ease both`,
                    }} />
                  </div>
                  {/* Percent */}
                  <div style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: isTop ? 22 : 17,
                    fontWeight: isTop ? 700 : 400,
                    color: isTop ? color : "rgba(255,255,255,.35)",
                    width: 48,
                    textAlign: "right",
                    flexShrink: 0,
                  }}>
                    {c.pct}%
                  </div>
                </div>
              );
            })}
          </div>

          <PresText size={20} color="rgba(255,255,255,.4)">
            The top word wins — unless temperature adds some randomness.
          </PresText>
        </PresSlide>
      );
    }

    if (slide === 3) {
      return (
        <PresSlide>
          <div style={{ width: "100%", maxWidth: 780, margin: "0 auto" }}>
            {/* Temperature slider card */}
            <Card style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 22, color: "white", display: "flex", alignItems: "center", gap: 8 }}>
                  <TempIcon size={26} weight="duotone" color={tm.bar} /> Temperature: <span style={{ color }}>{temp.toFixed(2)}</span>
                </div>
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 18, padding: "5px 16px", borderRadius: 20, background: `${tm.bar}20`, border: `1px solid ${tm.bar}60`, color: tm.bar }}>{tm.name}</div>
              </div>
              <div style={{ position: "relative", marginBottom: 12 }}>
                <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 10, borderRadius: 5, transform: "translateY(-50%)", pointerEvents: "none", background: "linear-gradient(to right,#a0d8ef 0%,#00f5d4 20%,#fee440 50%,#fb5607 75%,#f15bb5 100%)" }} />
                <input type="range" min=".05" max="2.0" step=".05" value={temp} onChange={e => { setTemp(parseFloat(e.target.value)); reset(); }} className="temp-slider" />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, color: "rgba(255,255,255,.3)", fontFamily: "'Fredoka',sans-serif", marginBottom: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Snowflake size={16} weight="duotone" /> Frozen</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Scales size={16} weight="duotone" /> Balanced</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Flame size={16} weight="duotone" /> Wild</span>
              </div>
              <div style={{ fontSize: 18, color: "rgba(255,255,255,.5)", lineHeight: 1.5, padding: "10px 14px", background: "rgba(255,255,255,.04)", borderRadius: 8 }}>{tm.desc}</div>
            </Card>

            {/* Probability bars */}
            {!done && (
              <Card style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 16, fontFamily: "'Fredoka',sans-serif", letterSpacing: 2, color: "rgba(255,255,255,.35)", textTransform: "uppercase", marginBottom: 14 }}>Next word at temp {temp.toFixed(2)}:</div>
                {dist.map(({ word, pct: p }, i) => (
                  <div key={word} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 110, fontFamily: "'Fredoka',sans-serif", fontSize: 18, color: i === 0 ? color : "rgba(255,255,255,.5)", flexShrink: 0, display: "flex", alignItems: "center", gap: 5 }}>
                      {i === 0 && <Star size={16} weight="duotone" color={color} />} {word}
                    </div>
                    <div style={{ flex: 1, height: 12, background: "rgba(255,255,255,.07)", borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${p}%`, borderRadius: 6, background: i === 0 ? color : "rgba(255,255,255,.2)", transition: "width .35s ease" }} />
                    </div>
                    <div style={{ width: 44, textAlign: "right", fontSize: 18, color: "rgba(255,255,255,.45)", flexShrink: 0 }}>{p}%</div>
                  </div>
                ))}
              </Card>
            )}

            {/* Generated sentence */}
            <Card style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 16, fontFamily: "'Fredoka',sans-serif", letterSpacing: 2, color: "rgba(255,255,255,.35)", textTransform: "uppercase", marginBottom: 14 }}>Generated so far:</div>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 30, minHeight: 56, marginBottom: 18, lineHeight: 1.4 }}>
                {words.length === 0
                  ? <span style={{ color: "rgba(255,255,255,.18)" }}>_ _ _ _ _ _ _ _ _</span>
                  : words.map((w, i) => (
                    <span key={i} style={{
                      color: i === words.length - 1 ? color : "rgba(255,255,255,.85)",
                      marginRight: w === "." ? 0 : 6,
                      display: "inline-block",
                      animation: i === words.length - 1 ? "fadeUp .3s ease" : "none",
                    }}>{w}</span>
                  ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                {!done
                  ? <button onClick={pick} className="cta-btn" style={{ background: color, color: "#000", fontSize: 20, padding: "14px 32px" }}>
                      {words.length === 0 ? "Generate first word" : "Pick next word"}
                    </button>
                  : <button onClick={reset} className="cta-btn" style={{ background: color, color: "#000", fontSize: 20, padding: "14px 32px", display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <ArrowCounterClockwise size={20} weight="duotone" /> Try Again
                    </button>}
                {layerCount > 0 && (
                  <div style={{ fontSize: 18, fontFamily: "'Fredoka',sans-serif", color: "rgba(255,255,255,.4)" }}>
                    <span style={{ color, fontWeight: 700 }}>{layerCount.toLocaleString()}</span> layer passes used
                  </div>
                )}
              </div>
            </Card>
          </div>
        </PresSlide>
      );
    }
    if (slide === 4) {
      return (
        <PresSlide>
          <Confetti size={56} weight="duotone" color={color} />
          <PresText color={color} size={44}>Now you know how AI thinks!</PresText>
          <PresText color="white" size={28}>
            Words <span style={{ color: "rgba(255,255,255,.4)" }}>&rarr;</span> Numbers <span style={{ color: "rgba(255,255,255,.4)" }}>&rarr;</span> Space <span style={{ color: "rgba(255,255,255,.4)" }}>&rarr;</span> Attention <span style={{ color: "rgba(255,255,255,.4)" }}>&rarr;</span> Thinking <span style={{ color: "rgba(255,255,255,.4)" }}>&rarr;</span> Predict
          </PresText>
          <PresText size={22} color="rgba(255,255,255,.55)">
            And repeat. Word by word. That's it!
          </PresText>
        </PresSlide>
      );
    }
  }

  return (
    <div className="fade-up">
      <Label color={color} mode={mode} text="HOW AI THINKS · STEP 6" />
      <H1>Predict!</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />

      {/* ── Step 0: Interactive playground ── */}
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>

        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 22,
          color: "white",
          textAlign: "center",
          lineHeight: 1.4,
          marginBottom: 28,
        }}>
          All those layers — just to pick <strong style={{ color }}>one word</strong>.<br />
          But here's the twist: AI has a <strong style={{ color }}>temperature dial</strong> that controls
          how adventurous or safe it is.
        </div>

        {/* Temperature slider card */}
        <Card style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 22, color: "white", display: "flex", alignItems: "center", gap: 8 }}>
              <TempIcon size={26} weight="duotone" color={tm.bar} /> Temperature: <span style={{ color }}>{temp.toFixed(2)}</span>
            </div>
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 18, padding: "5px 16px", borderRadius: 20, background: `${tm.bar}20`, border: `1px solid ${tm.bar}60`, color: tm.bar }}>{tm.name}</div>
          </div>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 10, borderRadius: 5, transform: "translateY(-50%)", pointerEvents: "none", background: "linear-gradient(to right,#a0d8ef 0%,#00f5d4 20%,#fee440 50%,#fb5607 75%,#f15bb5 100%)" }} />
            <input type="range" min=".05" max="2.0" step=".05" value={temp} onChange={e => { setTemp(parseFloat(e.target.value)); reset(); }} className="temp-slider" />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "rgba(255,255,255,.3)", fontFamily: "'Fredoka',sans-serif", marginBottom: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Snowflake size={14} weight="duotone" /> Frozen</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Scales size={14} weight="duotone" /> Balanced</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Flame size={14} weight="duotone" /> Wild</span>
          </div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,.5)", lineHeight: 1.5, padding: "10px 14px", background: "rgba(255,255,255,.04)", borderRadius: 8 }}>{tm.desc}</div>
        </Card>

        {/* Probability bars */}
        {!done && (
          <Card style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontFamily: "'Fredoka',sans-serif", letterSpacing: 2, color: "rgba(255,255,255,.35)", textTransform: "uppercase", marginBottom: 14 }}>Next word at temp {temp.toFixed(2)}:</div>
            {dist.map(({ word, pct: p }, i) => (
              <div key={word} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 110, fontFamily: "'Fredoka',sans-serif", fontSize: 18, color: i === 0 ? color : "rgba(255,255,255,.5)", flexShrink: 0, display: "flex", alignItems: "center", gap: 5 }}>
                  {i === 0 && <Star size={16} weight="duotone" color={color} />} {word}
                </div>
                <div style={{ flex: 1, height: 12, background: "rgba(255,255,255,.07)", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${p}%`, borderRadius: 6, background: i === 0 ? color : "rgba(255,255,255,.2)", transition: "width .35s ease" }} />
                </div>
                <div style={{ width: 44, textAlign: "right", fontSize: 14, color: "rgba(255,255,255,.45)", flexShrink: 0 }}>{p}%</div>
              </div>
            ))}
            <div style={{ fontSize: 14, color: "rgba(255,255,255,.3)", fontStyle: "italic", marginTop: 6 }}>&larr; Slide temperature to see bars shift live</div>
          </Card>
        )}

        {/* Generated sentence */}
        <Card style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 14, fontFamily: "'Fredoka',sans-serif", letterSpacing: 2, color: "rgba(255,255,255,.35)", textTransform: "uppercase", marginBottom: 14 }}>Generated so far:</div>
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 30, minHeight: 56, marginBottom: 18, lineHeight: 1.4 }}>
            {words.length === 0
              ? <span style={{ color: "rgba(255,255,255,.18)" }}>_ _ _ _ _ _ _ _ _</span>
              : words.map((w, i) => (
                <span key={i} style={{
                  color: i === words.length - 1 ? color : "rgba(255,255,255,.85)",
                  marginRight: w === "." ? 0 : 6,
                  display: "inline-block",
                  animation: i === words.length - 1 ? "fadeUp .3s ease" : "none",
                }}>{w}</span>
              ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {!done
              ? <button onClick={pick} className="cta-btn" style={{ background: color, color: "#000", fontSize: 20, padding: "14px 32px" }}>
                  {words.length === 0 ? "Generate first word" : "Pick next word"}
                </button>
              : <button onClick={reset} className="cta-btn" style={{ background: color, color: "#000", fontSize: 20, padding: "14px 32px", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <ArrowCounterClockwise size={20} weight="duotone" /> Try Again
                </button>}
            {layerCount > 0 && (
              <div style={{ fontSize: 18, fontFamily: "'Fredoka',sans-serif", color: "rgba(255,255,255,.4)" }}>
                <span style={{ color, fontWeight: 700 }}>{layerCount.toLocaleString()}</span> layer passes used
              </div>
            )}
          </div>
        </Card>

        {/* Continue button appears when sentence is complete */}
        {done && step === 0 && (
          <ContinueButton onClick={advance} color={color} label="See the big picture" />
        )}
      </div>

      {/* ── Step 1: Celebration + Trivia ── */}
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
          <div style={{ textAlign: "center", padding: "28px", background: `${color}10`, border: `1px solid ${color}35`, borderRadius: 14, marginBottom: 20 }}>
            <Confetti size={48} weight="duotone" color={color} style={{ marginBottom: 10 }} />
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 22, color, marginBottom: 10 }}>Sentence complete!</div>
            <div style={{ fontSize: 16, color: "rgba(255,255,255,.6)", lineHeight: 1.65 }}>
              Change the temperature and try again — you'll get different words!<br />
              <span style={{ color: "rgba(255,255,255,.35)", fontSize: 14 }}>That's exactly why AI gives a different answer every time you ask the same question.</span>
            </div>
          </div>

          <TriviaBox mode={mode} visible={true} color={color}
            number={layerCount > 0 ? layerCount.toLocaleString() : "5,760+"}
            label="layer passes so far"
            fact="A typical 60-word paragraph means running all 96 layers 60 times — over 5,760 layer passes just to say 'good morning'!" />
        </div>
      )}
    </div>
  );
}
