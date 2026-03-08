import { useState, useEffect, useRef } from "react";
import {
  ArrowDown,
  BaseballCap,
  Bird,
  Lightbulb,
} from "@phosphor-icons/react";
import { Card, Label, H1, Body, TriviaBox, TeacherNote } from "./shared";
import { BAT_S1, BAT_S2, BAT_A1, BAT_A2 } from "../data/attention";

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
export default function SectionAttention({ color, mode }) {
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
        advance();
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

  return (
    <div className="fade-up">
      <Label color={color} text="HOW AI THINKS · STEP 3" />
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
            { id: "bat",    Icon: BaseballCap, label: "Baseball bat" },
            { id: "animal", Icon: Bird,        label: "Flying animal" },
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
              <opt.Icon size={52} weight="duotone" color={color} />
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
              {guess === "bat"
                ? <BaseballCap size={52} weight="duotone" color={color} />
                : <Bird size={52} weight="duotone" color={color} />}
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 16, color, marginTop: 6 }}>Your guess</div>
            </div>
            <div style={{ fontSize: 36, color: "rgba(255,255,255,.2)", alignSelf: "center" }}>+</div>
            <div style={{ textAlign: "center" }}>
              {guess === "bat"
                ? <Bird size={52} weight="duotone" color="rgba(255,255,255,.4)" />
                : <BaseballCap size={52} weight="duotone" color="rgba(255,255,255,.4)" />}
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 16, color: "rgba(255,255,255,.4)", marginTop: 6 }}>Also right!</div>
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
            <strong style={{ color }}>"bat"</strong> can mean both things! But here's the AI's problem — it only sees text. No picture, no voice. It has to figure out the right meaning from the{" "}
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
                  <BaseballCap size={48} weight="duotone" color="#fee440" />
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
                  <Bird size={48} weight="duotone" color="#9b5de5" />
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

      <TriviaBox visible={step === 4} color={color} number="96" label="attention heads at once"
        fact="Claude runs 96 different spotlights at the same time — each one looking for different types of relationships. It's like 96 readers, each hunting for something different in the same sentence." />
    </div>
  );
}
