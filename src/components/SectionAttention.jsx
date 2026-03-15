import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowDown,
  BaseballCap,
  Bird,
  Lightbulb,
} from "@phosphor-icons/react";
import { Card, Label, H1, Body, TriviaBox, TeacherNote, ModelNote, PresSlide, PresText } from "./shared";
import { BAT_S1, BAT_S2, BAT_A1, BAT_A2 } from "../data/attention";

const BAT_IMG_BASE = `${import.meta.env.BASE_URL}bat-baseball.png`;
const BAT_IMG_ANIMAL = `${import.meta.env.BASE_URL}bat-animal.png`;
const BAT_IMG_HYBRID = `${import.meta.env.BASE_URL}bat-hybrid.png`;

/* ── BatAttentionAnim: animated attention beams from "bat" to each word ─── */
function BatAttentionAnim({ words, batIdx, clueIndices, winImg, winLabel, winColor, loseImg, loseLabel, color }) {
  const [scanning, setScanning] = useState(-1);     // which word index beam is currently on
  const [foundClues, setFoundClues] = useState([]);  // clue indices found so far
  const [done, setDone] = useState(false);
  const wordRefs = useRef([]);
  const svgRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const order = words.map((_, i) => i).filter(i => i !== batIdx);

    async function run() {
      await new Promise(r => setTimeout(r, 600));
      for (const idx of order) {
        if (cancelled) return;
        setScanning(idx);
        const isClue = clueIndices.includes(idx);
        await new Promise(r => setTimeout(r, isClue ? 700 : 350));
        if (isClue) {
          setFoundClues(prev => [...prev, idx]);
        }
      }
      if (!cancelled) {
        setScanning(-1);
        setDone(true);
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  const getCenter = (idx) => {
    const el = wordRefs.current[idx];
    const svg = svgRef.current;
    if (!el || !svg) return { x: 0, y: 0 };
    const er = el.getBoundingClientRect();
    const sr = svg.getBoundingClientRect();
    return { x: er.left - sr.left + er.width / 2, y: er.top - sr.top + er.height / 2 };
  };

  const clueCount = foundClues.length;
  const fadeProgress = Math.min(clueCount / clueIndices.length, 1);
  const loseOpacity = done ? 0.08 : Math.max(0.12, 1 - fadeProgress * 0.9);

  return (
    <div>
      {/* Sentence with SVG beams */}
      <div style={{ position: "relative", marginBottom: 28 }}>
        <svg ref={svgRef} style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          pointerEvents: "none", zIndex: 1,
        }}>
          {scanning >= 0 && (() => {
            const from = getCenter(batIdx);
            const to = getCenter(scanning);
            if (!from.x && !to.x) return null;
            const isClue = clueIndices.includes(scanning);
            const midY = Math.min(from.y, to.y) - 28;
            return (
              <path
                d={`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${midY} ${to.x} ${to.y}`}
                fill="none"
                stroke={isClue ? winColor : "rgba(255,255,255,.15)"}
                strokeWidth={isClue ? 3 : 2}
                opacity={isClue ? 0.8 : 0.4}
              >
                <animate attributeName="stroke-dasharray" from="0 300" to="300 0" dur="0.3s" fill="freeze" />
              </path>
            );
          })()}
          {/* Persistent beams to found clues */}
          {foundClues.map(ci => {
            const from = getCenter(batIdx);
            const to = getCenter(ci);
            if (!from.x && !to.x) return null;
            const midY = Math.min(from.y, to.y) - 28;
            return (
              <path key={ci}
                d={`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${midY} ${to.x} ${to.y}`}
                fill="none" stroke={winColor} strokeWidth={2} opacity={0.35}
                strokeDasharray="5 4"
              />
            );
          })}
        </svg>

        {/* Words */}
        <div style={{
          display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center",
          position: "relative", zIndex: 2,
        }}>
          {words.map((w, i) => {
            const isBat = i === batIdx;
            const isScanning = i === scanning;
            const isClue = clueIndices.includes(i);
            const isFound = foundClues.includes(i);
            const lit = isScanning && isClue;
            return (
              <div key={i} ref={el => wordRefs.current[i] = el} style={{
                fontFamily: "'Fredoka',sans-serif", fontSize: 28, fontWeight: isBat || isFound ? 700 : 400,
                color: isBat ? color : lit ? winColor : isFound ? winColor : isScanning ? "rgba(255,255,255,.6)" : "white",
                background: isBat ? `${color}18` : lit ? `${winColor}25` : isFound ? `${winColor}10` : "transparent",
                padding: "6px 14px", borderRadius: 10,
                border: isBat ? `2px solid ${color}50` : lit ? `2px solid ${winColor}60` : "2px solid transparent",
                boxShadow: lit ? `0 0 16px ${winColor}50` : "none",
                transition: "all .25s ease",
              }}>
                {w}
              </div>
            );
          })}
        </div>
      </div>

      {/* Two bat images */}
      <div style={{ display: "flex", gap: 36, justifyContent: "center", alignItems: "center" }}>
        {/* Winner */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          padding: "18px 24px", borderRadius: 20,
          background: done ? `${winColor}12` : "transparent",
          border: done ? `2px solid ${winColor}50` : "2px solid transparent",
          opacity: done ? 1 : 0.5 + fadeProgress * 0.5,
          transition: "all .5s ease",
        }}>
          <img src={winImg} alt={winLabel} style={{ width: 100, height: "auto" }} />
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 22,
            color: done ? winColor : "rgba(255,255,255,.5)",
            fontWeight: done ? 700 : 400,
            transition: "all .5s ease",
          }}>
            {done ? `${winLabel}!` : winLabel}
          </div>
        </div>

        {/* Loser — fades as clues are found */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          padding: "18px 24px", borderRadius: 20,
          opacity: loseOpacity,
          filter: done ? "grayscale(1)" : `grayscale(${fadeProgress * 0.8})`,
          transition: "all .6s ease",
        }}>
          <img src={loseImg} alt={loseLabel} style={{ width: 100, height: "auto" }} />
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 22,
            color: "rgba(255,255,255,.4)", transition: "all .5s ease",
          }}>
            {loseLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── AttentionSentence sub-component ────────────────────────────────────────── */
function AttentionSentence({ words, attnMap, color, label, LabelIcon, meaning, MeaningIcon }) {
  const [active, setActive] = useState(null);
  const [explored, setExplored] = useState(new Set());
  const weights = active !== null ? (attnMap[active] ?? null) : null;

  const handleClick = (i) => {
    if (!(i in attnMap)) return;
    setActive(a => a === i ? null : i);
    setExplored(s => new Set([...s, i]));
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontFamily: "'Fredoka',sans-serif", letterSpacing: 2, color: "rgba(255,255,255,.35)", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
        <LabelIcon size={16} weight="duotone" /> {label}
      </div>
      <Card style={{ padding: "16px 16px" }}>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: active !== null ? 14 : 0 }}>
          {words.map((w, i) => {
            const clickable = i in attnMap;
            const isActive = i === active;
            const wt = weights ? (weights[i] ?? 0) : 0;
            const isLit = active !== null && i !== active && wt > .3;
            const isPunct = w === "!" || w === ".";
            return (
              <div key={i} style={{ textAlign: "center" }}>
                <div
                  className={`word-chip${isActive ? " active" : ""}${isLit ? " lit" : ""}`}
                  onClick={() => handleClick(i)}
                  style={{
                    padding: isPunct ? "8px 8px" : undefined,
                    background: isActive ? color : isLit ? `${color}22` : undefined,
                    borderColor: isActive ? color : isLit ? `${color}${Math.round(wt * 200).toString(16).padStart(2, "0")}` : clickable ? `${color}45` : "rgba(255,255,255,.1)",
                    boxShadow: isActive ? `0 0 16px ${color}70` : isLit ? `0 0 ${Math.round(wt * 10)}px ${color}55` : undefined,
                    cursor: clickable ? "pointer" : "default",
                    opacity: !clickable && active !== null ? .3 : 1,
                    fontSize: clickable ? 20 : 18,
                    color: isActive ? "#000" : undefined,
                  }}
                >{w}</div>
                {weights && wt > .3 && i !== active && (
                  <div style={{
                    height: 3, background: color, opacity: Math.min(wt, 1),
                    width: `${Math.min(wt, 1) * 100}%`, margin: "5px auto 0",
                    borderRadius: 2, animation: "probIn .4s ease",
                  }} />
                )}
              </div>
            );
          })}
        </div>
        {active !== null && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 10, fontSize: 18, color: "rgba(255,255,255,.6)", animation: "fadeUp .25s ease" }}>
            <span style={{ color, fontWeight: 700 }}>"{words[active]}"</span> is pulling hard on the glowing words — those clues are how it knows this bat means{" "}
            <span style={{ color, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <MeaningIcon size={18} weight="duotone" /> {meaning}
            </span>!
          </div>
        )}
      </Card>
      <div style={{ display: "flex", gap: 6, marginTop: 7, flexWrap: "wrap" }}>
        {Object.keys(attnMap).map(i => (
          <div key={i} style={{
            fontSize: 13, fontFamily: "'Fredoka',sans-serif", padding: "2px 8px", borderRadius: 10,
            background: explored.has(parseInt(i)) ? `${color}20` : "rgba(255,255,255,.05)",
            border: `1px solid ${explored.has(parseInt(i)) ? color + "50" : "rgba(255,255,255,.1)"}`,
            color: explored.has(parseInt(i)) ? color : "rgba(255,255,255,.3)",
            transition: "all .2s ease",
          }}>tap "{words[i]}"</div>
        ))}
      </div>
    </div>
  );
}

/* ── ContinueButton ─────────────────────────────────────────────────────────── */
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

/* ── Main Section ───────────────────────────────────────────────────────────── */
export default function SectionAttention({ color, mode, slide }) {
  const [step, setStep] = useState(0);
  const [guess, setGuess] = useState(null);
  const [s1words, setS1words] = useState(0);
  const [s2words, setS2words] = useState(0);

  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  const step4Ref = useRef(null);

  const notes = [
    "Phase 0 (The Guess): Don't tell the class the answer — genuinely ask for a show of hands. Both 'baseball bat' and 'flying bat' should get votes. Perfect.",
    "Phase 1 (Both right): The key insight is 'the AI has to figure it out without the picture in their head'. Ask: how would YOU tell someone which kind of bat you meant, using only words?",
    "Phase 2 (Sentence 1): Read the sentence aloud as the words appear. When the answer reveals, ask: which words were the clues? 'Swung', 'hit', and 'ball' are all baseball vocabulary.",
    "Phase 3 (Sentence 2): Same exercise. Ask the class to predict the clue words BEFORE tapping them. 'Flew', 'cave', and 'dusk' — all animal/nature vocabulary.",
    "Phase 4 (Explore): Let kids tap individual words and see the attention patterns. Ask: 'Does bat pay attention to the same words in sentence 1 vs sentence 2?' (It doesn't — this is the whole point.)",
  ];

  const revealSentence = (setter, total) => {
    let i = 1;
    const tick = () => { setter(i); i++; if (i <= total) setTimeout(tick, 160); };
    setTimeout(tick, 300);
  };

  const canAdvance = () => {
    if (step === 2 && s1words < BAT_S1.length) return false;
    if (step === 3 && s2words < BAT_S2.length) return false;
    if (step >= 4) return false;
    return true;
  };

  const advance = () => {
    if (!canAdvance()) return;
    const next = step + 1;
    setStep(next);
    if (next === 2) revealSentence(setS1words, BAT_S1.length);
    if (next === 3) revealSentence(setS2words, BAT_S2.length);
  };

  // Keyboard: down arrow advances steps
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (canAdvance()) {
          advance();
        } else if (step >= 4) {
          window.dispatchEvent(new Event("sectionFullyRevealed"));
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step, s1words, s2words]);

  // Auto-scroll to newly revealed step
  useEffect(() => {
    const refs = [null, step1Ref, step2Ref, step3Ref, step4Ref];
    const target = refs[step]?.current;
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [step]);

  if (mode === "presentation") {
    /* Slide 0: Big "bat" — just the word, like the "cat" reveal */
    if (slide === 0) return (
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
          bat
        </div>
        <PresText size={36}>
          When you see this word — what do you picture?
        </PresText>
      </PresSlide>
    );

    /* Slide 1: Reveal — it means TWO things! */
    if (slide === 1) return (
      <PresSlide>
        <PresText size={36} color="white">
          It could be...
        </PresText>
        <div style={{ display: "flex", gap: 28, justifyContent: "center" }}>
          {[
            { img: BAT_IMG_BASE, label: "A baseball bat", clr: "#fee440" },
            { img: BAT_IMG_ANIMAL, label: "A flying animal", clr: "#9b5de5" },
          ].map(opt => (
            <div key={opt.label} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              padding: "18px 28px", borderRadius: 20,
              background: `${opt.clr}10`, border: `2px solid ${opt.clr}40`,
              minWidth: 180,
            }}>
              <img src={opt.img} alt={opt.label} style={{ width: 100, height: "auto" }} />
              <div style={{
                fontFamily: "'Fredoka',sans-serif", fontSize: 26, fontWeight: 600,
                color: "white",
              }}>
                {opt.label}
              </div>
            </div>
          ))}
        </div>
        <PresText size={28} color="rgba(255,255,255,.4)">
          Both are right! One word, two completely different meanings.
        </PresText>
      </PresSlide>
    );

    /* Slide 2: AI sees BOTH at once */
    if (slide === 2) return (
      <PresSlide>
        <img src={BAT_IMG_HYBRID} alt="Both meanings at once" style={{ width: 180, height: "auto" }} />
        <PresText size={36} color="white">
          AI sees <strong style={{ color }}>BOTH</strong> meanings at once
        </PresText>
        <PresText size={28} color="rgba(255,255,255,.4)">
          It doesn't know which one you mean... <strong style={{ color }}>unless...</strong>
        </PresText>
      </PresSlide>
    );

    /* Slide 3: Title only — "it looks at the other words" */
    if (slide === 3) return (
      <PresSlide>
        <PresText size={48} color="white">
          ...it looks at the <strong style={{ color }}>other words</strong>
        </PresText>
      </PresSlide>
    );

    /* Slide 4: Sentence 1 — animated attention from bat, baseball wins */
    if (slide === 4) return (
      <PresSlide>
        <BatAttentionAnim
          words={BAT_S1}
          batIdx={3}
          clueIndices={[1, 5, 7]}
          winImg={BAT_IMG_BASE}
          winLabel="Baseball bat"
          winColor="#fee440"
          loseImg={BAT_IMG_ANIMAL}
          loseLabel="Flying animal"
          color={color}
        />
      </PresSlide>
    );

    /* Slide 5: Sentence 2 — animated attention from bat, animal wins */
    if (slide === 5) return (
      <PresSlide>
        <BatAttentionAnim
          words={BAT_S2}
          batIdx={1}
          clueIndices={[2, 6, 8]}
          winImg={BAT_IMG_ANIMAL}
          winLabel="Flying animal"
          winColor="#9b5de5"
          loseImg={BAT_IMG_BASE}
          loseLabel="Baseball bat"
          color={color}
        />
      </PresSlide>
    );

    /* Slide 6: That's ATTENTION! */
    if (slide === 6) return (
      <PresSlide>
        <Lightbulb size={44} weight="duotone" color={color} />
        <div style={{
          fontSize: 48, textAlign: "center", fontFamily: "'Fredoka',sans-serif",
          color: "white", marginBottom: 8,
        }}>
          That's <span style={{ color }}>ATTENTION</span>!
        </div>
        <PresText size={28} color="rgba(255,255,255,.55)">
          Same word, completely different meaning — depending on which other words shine their spotlight on it.
        </PresText>
      </PresSlide>
    );
  }

  return (
    <div className="fade-up">
      <Label color={color} mode={mode} text="HOW AI THINKS · STEP 3" />
      <H1>Attention!</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />

      {/* ── Step 0: The big question — what does "bat" mean? ── */}
      <div style={{ minHeight: "50vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 1,
            textAlign: "center",
            padding: "24px 48px",
            background: `${color}12`,
            border: `2px solid ${color}35`,
            borderRadius: 24,
            color: "white",
          }}>
            bat
          </div>
        </div>

        <div style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 28,
          color: "white",
          textAlign: "center",
          lineHeight: 1.4,
          marginBottom: 24,
        }}>
          What does this word mean?
        </div>

        <div style={{
          fontSize: 20,
          color: "rgba(255,255,255,.45)",
          textAlign: "center",
          marginBottom: 20,
        }}>
          Tap what you think it is
        </div>

        <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
          {[
            { id: "bat",    img: BAT_IMG_BASE,   label: "Baseball bat" },
            { id: "animal", img: BAT_IMG_ANIMAL, label: "Flying animal" },
          ].map(opt => (
            <button key={opt.id} onClick={() => { setGuess(opt.id); advance(); }}
              style={{
                fontFamily: "'Fredoka',sans-serif", fontSize: 20, fontWeight: 600,
                padding: "22px 28px", borderRadius: 18,
                border: `2px solid ${color}50`, background: `${color}10`,
                color: "white", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                transition: "all .15s ease", minWidth: 150,
              }}>
              <img src={opt.img} alt={opt.label} style={{ width: 80, height: "auto" }} />
              {opt.label}
            </button>
          ))}
        </div>

        {step === 0 && (
          <ContinueButton onClick={advance} color={color} label="Show me" />
        )}
      </div>

      {/* ── Step 1: You're right AND wrong! ── */}
      {step >= 1 && (
        <div
          ref={step1Ref}
          style={{
            animation: "fadeUp .4s ease",
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 24,
          }}
        >
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 32,
            color: "white",
            textAlign: "center",
            marginBottom: 28,
          }}>
            You're right... <em>AND</em> wrong!
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 28, marginBottom: 28 }}>
            <div style={{ textAlign: "center" }}>
              <img src={guess === "bat" ? BAT_IMG_BASE : BAT_IMG_ANIMAL} alt="Your guess" style={{ width: 80, height: "auto" }} />
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 16, color, marginTop: 6 }}>Your guess</div>
            </div>
            <div style={{ fontSize: 36, color: "rgba(255,255,255,.2)", alignSelf: "center" }}>+</div>
            <div style={{ textAlign: "center" }}>
              <img src={guess === "bat" ? BAT_IMG_ANIMAL : BAT_IMG_BASE} alt="Also right" style={{ width: 80, height: "auto", opacity: 0.4 }} />
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 16, color: "rgba(255,255,255,.4)", marginTop: 6 }}>Also right!</div>
            </div>
          </div>

          {/* Bat hybrid — embedding = all meanings at once */}
          <div style={{ textAlign: "center", margin: "24px 0 8px" }}>
            <img src={BAT_IMG_HYBRID} alt="Both meanings at once" style={{ width: 180, height: "auto" }} />
            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 17,
              color: `${color}bb`,
              marginTop: 8,
              lineHeight: 1.4,
            }}>
              Before context, the AI's "bat" is <em>everything at once</em> —<br />
              a baseball bat... with wings and fangs!
            </div>
          </div>

          <div style={{
            fontSize: 22,
            color: "rgba(255,255,255,.65)",
            lineHeight: 1.65,
            textAlign: "center",
            maxWidth: 600,
            margin: "0 auto",
          }}>
            <strong style={{ color }}>"bat"</strong> can mean both things! When the AI first turns it into numbers, it captures <em>all</em> the meanings jumbled together. It has to figure out the right one from the{" "}
            <strong style={{ color }}>other words around it</strong>.
          </div>

          {step === 1 && (
            <ContinueButton onClick={advance} color={color} label="Show me how" />
          )}
        </div>
      )}

      {/* ── Step 2: Sentence 1 reveals word by word ── */}
      {step >= 2 && (
        <div
          ref={step2Ref}
          style={{
            animation: "fadeUp .4s ease",
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
            color: "rgba(255,255,255,.45)",
            textAlign: "center",
            marginBottom: 18,
          }}>
            Now watch what happens when we add more words...
          </div>

          <Card style={{ marginBottom: 24, padding: "24px 20px" }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", minHeight: 56, alignItems: "center", justifyContent: "center" }}>
              {BAT_S1.map((w, i) => (
                <span key={i} style={{
                  fontFamily: "'Fredoka',sans-serif", fontSize: 24,
                  color: w === "bat" ? color : i < s1words ? "white" : "transparent",
                  fontWeight: w === "bat" ? 700 : 400,
                  background: w === "bat" ? `${color}18` : "transparent",
                  padding: w === "bat" ? "2px 10px" : "2px 0",
                  borderRadius: w === "bat" ? 8 : 0,
                  transition: "color .2s ease",
                }}>{w}</span>
              ))}
            </div>
          </Card>

          {s1words >= BAT_S1.length && (
            <div style={{ animation: "fadeUp .5s ease" }}>
              <Card style={{ marginBottom: 20, background: "#fee44010", border: "1px solid #fee44035" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <img src={BAT_IMG_BASE} alt="Baseball bat" style={{ width: 56, height: "auto" }} />
                  <div>
                    <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 22, color: "#fee440", marginBottom: 6 }}>Baseball bat!</div>
                    <p style={{ fontSize: 20, color: "rgba(255,255,255,.6)", lineHeight: 1.55 }}>"Swung", "hit", and "ball" are all screaming baseball. The AI's attention locked onto those words!</p>
                  </div>
                </div>
              </Card>

              {step === 2 && (
                <ContinueButton onClick={advance} color={color} label="Now try a different sentence" />
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Sentence 2 reveals word by word ── */}
      {step >= 3 && (
        <div
          ref={step3Ref}
          style={{
            animation: "fadeUp .4s ease",
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
            color: "rgba(255,255,255,.45)",
            textAlign: "center",
            marginBottom: 18,
          }}>
            Same word. Totally different sentence...
          </div>

          <Card style={{ marginBottom: 24, padding: "24px 20px" }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", minHeight: 56, alignItems: "center", justifyContent: "center" }}>
              {BAT_S2.map((w, i) => (
                <span key={i} style={{
                  fontFamily: "'Fredoka',sans-serif", fontSize: 24,
                  color: w === "bat" ? color : i < s2words ? "white" : "transparent",
                  fontWeight: w === "bat" ? 700 : 400,
                  background: w === "bat" ? `${color}18` : "transparent",
                  padding: w === "bat" ? "2px 10px" : "2px 0",
                  borderRadius: w === "bat" ? 8 : 0,
                  transition: "color .2s ease",
                }}>{w}</span>
              ))}
            </div>
          </Card>

          {s2words >= BAT_S2.length && (
            <div style={{ animation: "fadeUp .5s ease" }}>
              <Card style={{ marginBottom: 20, background: "#9b5de510", border: "1px solid #9b5de535" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <img src={BAT_IMG_ANIMAL} alt="Flying bat" style={{ width: 56, height: "auto" }} />
                  <div>
                    <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 22, color: "#9b5de5", marginBottom: 6 }}>Flying animal!</div>
                    <p style={{ fontSize: 20, color: "rgba(255,255,255,.6)", lineHeight: 1.55 }}>"Flew", "cave", and "dusk" light up now. Same word — completely different meaning because of the context!</p>
                  </div>
                </div>
              </Card>

              {step === 3 && (
                <ContinueButton onClick={advance} color={color} label="Now I want to explore" />
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Step 4: Interactive explore phase ── */}
      {step >= 4 && (
        <div
          ref={step4Ref}
          style={{
            animation: "fadeUp .4s ease",
            paddingTop: 24,
          }}
        >
          <Body style={{ fontSize: 22 }}>
            Tap the <span style={{ color, fontWeight: 700 }}>highlighted words</span> in each sentence to see what the AI's spotlight pays attention to.
          </Body>
          <AttentionSentence words={BAT_S1} attnMap={BAT_A1} color="#fee440"
            label='Sentence 1 — "baseball bat"' LabelIcon={BaseballCap}
            meaning="baseball bat" MeaningIcon={BaseballCap} />
          <AttentionSentence words={BAT_S2} attnMap={BAT_A2} color="#9b5de5"
            label='Sentence 2 — "flying bat"' LabelIcon={Bird}
            meaning="flying animal" MeaningIcon={Bird} />
          <div style={{ padding: "16px 18px", background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 12, marginBottom: 6, fontSize: 20, color: "rgba(255,255,255,.65)", lineHeight: 1.6, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Lightbulb size={26} weight="duotone" color={color} style={{ flexShrink: 0, marginTop: 2 }} />
            <span><strong style={{ color }}>That's attention!</strong> Same word, completely different meaning depending on which other words are shining their spotlight on it.</span>
          </div>
        </div>
      )}

      <TriviaBox mode={mode} visible={step === 4} color={color} number="96" label="attention heads at once"
        fact="Claude runs 96 different spotlights at the same time — each one looking for different types of relationships. It's like 96 readers, each hunting for something different in the same sentence." />
      {step === 4 && (
        <ModelNote color={color} mode={mode}>
          Different models use different numbers of attention heads — some use 32, some 96, some even more. The idea is the same: multiple spotlights working together.
        </ModelNote>
      )}
    </div>
  );
}
