import { useState } from "react";
import {
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
      <div style={{ fontSize: 11, fontFamily: "'Fredoka',sans-serif", letterSpacing: 2, color: "rgba(255,255,255,.35)", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
        <LabelIcon size={14} weight="duotone" /> {label}
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
                    fontSize: clickable ? 17 : 15,
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
          <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 10, fontSize: 14, color: "rgba(255,255,255,.6)", animation: "fadeUp .25s ease" }}>
            <span style={{ color, fontWeight: 700 }}>"{words[active]}"</span> is pulling hard on the glowing words \u2014 those clues are how it knows this bat means{" "}
            <span style={{ color, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <MeaningIcon size={16} weight="duotone" /> {meaning}
            </span>!
          </div>
        )}
      </Card>
      <div style={{ display: "flex", gap: 6, marginTop: 7, flexWrap: "wrap" }}>
        {Object.keys(attnMap).map(i => (
          <div key={i} style={{
            fontSize: 11, fontFamily: "'Fredoka',sans-serif", padding: "2px 8px", borderRadius: 10,
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

/* ── Main Section ───────────────────────────────────────────────────────────── */
export default function SectionAttention({ color, mode }) {
  const [phase, setPhase] = useState(0);
  const [guess, setGuess] = useState(null);
  const [s1words, setS1words] = useState(0);
  const [s2words, setS2words] = useState(0);

  const notes = [
    "Phase 0 (The Guess): Don't tell the class the answer \u2014 genuinely ask for a show of hands. Both 'baseball bat' and 'flying bat' should get votes. Perfect.",
    "Phase 1 (Both right): The key insight is 'the AI has to figure it out without the picture in their head'. Ask: how would YOU tell someone which kind of bat you meant, using only words?",
    "Phase 2 (Sentence 1): Read the sentence aloud as the words appear. When the answer reveals, ask: which words were the clues? 'Swung', 'hit', and 'ball' are all baseball vocabulary.",
    "Phase 3 (Sentence 2): Same exercise. Ask the class to predict the clue words BEFORE tapping them. 'Flew', 'cave', and 'dusk' \u2014 all animal/nature vocabulary.",
    "Phase 4 (Explore): Let kids tap individual words and see the attention patterns. Ask: 'Does bat pay attention to the same words in sentence 1 vs sentence 2?' (It doesn't \u2014 this is the whole point.)",
  ];

  const revealSentence = (setter, total) => {
    let i = 1;
    const tick = () => { setter(i); i++; if (i <= total) setTimeout(tick, 160); };
    setTimeout(tick, 300);
  };

  const goPhase = (n) => {
    setPhase(n);
    if (n === 2) revealSentence(setS1words, BAT_S1.length);
    if (n === 3) revealSentence(setS2words, BAT_S2.length);
  };

  return (
    <div className="fade-up">
      <Label color={color} text="HOW AI THINKS \u00b7 STEP 3" />
      <H1>Attention!</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />

      {phase === 0 && (
        <div style={{ animation: "fadeUp .4s ease" }}>
          <Body>The AI just got handed one single word. What do <em>you</em> think it means?</Body>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 72, lineHeight: 1, textAlign: "center", padding: "18px 32px", background: `${color}15`, border: `2px solid ${color}40`, borderRadius: 20 }}>bat</div>
          </div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,.5)", textAlign: "center", marginBottom: 18 }}>Tap what you think it is</div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            {[
              { id: "bat",    Icon: BaseballCap, label: "Baseball bat" },
              { id: "animal", Icon: Bird,        label: "Flying animal" },
            ].map(opt => (
              <button key={opt.id} onClick={() => { setGuess(opt.id); goPhase(1); }}
                style={{
                  fontFamily: "'Fredoka',sans-serif", fontSize: 17, fontWeight: 600,
                  padding: "18px 24px", borderRadius: 16,
                  border: `2px solid ${color}50`, background: `${color}10`,
                  color: "white", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  transition: "all .15s ease", minWidth: 130,
                }}>
                <opt.Icon size={44} weight="duotone" color={color} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 1 && (
        <div style={{ animation: "fadeUp .4s ease" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 22 }}>
            <div style={{ textAlign: "center" }}>
              {guess === "bat"
                ? <BaseballCap size={52} weight="duotone" color={color} />
                : <Bird size={52} weight="duotone" color={color} />}
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 14, color, marginTop: 4 }}>Your guess</div>
            </div>
            <div style={{ fontSize: 32, color: "rgba(255,255,255,.2)", alignSelf: "center" }}>+</div>
            <div style={{ textAlign: "center" }}>
              {guess === "bat"
                ? <Bird size={52} weight="duotone" color="rgba(255,255,255,.4)" />
                : <BaseballCap size={52} weight="duotone" color="rgba(255,255,255,.4)" />}
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 14, color: "rgba(255,255,255,.4)", marginTop: 4 }}>Also right!</div>
            </div>
          </div>
          <Card style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: "white", marginBottom: 10 }}>You're right... AND wrong</div>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,.65)", lineHeight: 1.65 }}>
              <strong style={{ color }}>"bat"</strong> can mean both things! But here's the AI's problem \u2014 it only sees text. No picture, no voice. It has to figure out the right meaning from the <strong style={{ color }}>other words around it</strong>.
            </p>
          </Card>
          <div style={{ textAlign: "center" }}>
            <button onClick={() => goPhase(2)} className="cta-btn" style={{ background: color, color: "#000" }}>Show me how &rarr;</button>
          </div>
        </div>
      )}

      {phase === 2 && (
        <div style={{ animation: "fadeUp .4s ease" }}>
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 16, color: "rgba(255,255,255,.45)", marginBottom: 14 }}>Now watch what happens when we add more words...</div>
          <Card style={{ marginBottom: 20, padding: "20px 18px" }}>
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap", minHeight: 48, alignItems: "center" }}>
              {BAT_S1.map((w, i) => (
                <span key={i} style={{
                  fontFamily: "'Fredoka',sans-serif", fontSize: 22,
                  color: w === "bat" ? color : i < s1words ? "white" : "transparent",
                  fontWeight: w === "bat" ? 700 : 400,
                  background: w === "bat" ? `${color}18` : "transparent",
                  padding: w === "bat" ? "2px 8px" : "2px 0",
                  borderRadius: w === "bat" ? 8 : 0,
                  transition: "color .2s ease",
                }}>{w}</span>
              ))}
            </div>
          </Card>
          {s1words >= BAT_S1.length && (
            <div style={{ animation: "fadeUp .5s ease" }}>
              <Card style={{ marginBottom: 18, background: "#fee44010", border: "1px solid #fee44035" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <BaseballCap size={40} weight="duotone" color="#fee440" />
                  <div>
                    <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 18, color: "#fee440", marginBottom: 4 }}>Baseball bat!</div>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,.6)", lineHeight: 1.55 }}>"Swung", "hit", and "ball" are all screaming baseball. The AI's attention locked onto those words!</p>
                  </div>
                </div>
              </Card>
              <div style={{ textAlign: "center" }}>
                <button onClick={() => goPhase(3)} className="cta-btn" style={{ background: color, color: "#000" }}>Now try a different sentence &rarr;</button>
              </div>
            </div>
          )}
        </div>
      )}

      {phase === 3 && (
        <div style={{ animation: "fadeUp .4s ease" }}>
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 16, color: "rgba(255,255,255,.45)", marginBottom: 14 }}>Same word. Totally different sentence...</div>
          <Card style={{ marginBottom: 20, padding: "20px 18px" }}>
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap", minHeight: 48, alignItems: "center" }}>
              {BAT_S2.map((w, i) => (
                <span key={i} style={{
                  fontFamily: "'Fredoka',sans-serif", fontSize: 22,
                  color: w === "bat" ? color : i < s2words ? "white" : "transparent",
                  fontWeight: w === "bat" ? 700 : 400,
                  background: w === "bat" ? `${color}18` : "transparent",
                  padding: w === "bat" ? "2px 8px" : "2px 0",
                  borderRadius: w === "bat" ? 8 : 0,
                  transition: "color .2s ease",
                }}>{w}</span>
              ))}
            </div>
          </Card>
          {s2words >= BAT_S2.length && (
            <div style={{ animation: "fadeUp .5s ease" }}>
              <Card style={{ marginBottom: 18, background: "#9b5de510", border: "1px solid #9b5de535" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Bird size={40} weight="duotone" color="#9b5de5" />
                  <div>
                    <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 18, color: "#9b5de5", marginBottom: 4 }}>Flying animal!</div>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,.6)", lineHeight: 1.55 }}>"Flew", "cave", and "dusk" light up now. Same word \u2014 completely different meaning because of the context!</p>
                  </div>
                </div>
              </Card>
              <div style={{ textAlign: "center" }}>
                <button onClick={() => goPhase(4)} className="cta-btn" style={{ background: color, color: "#000" }}>Now I want to explore! &rarr;</button>
              </div>
            </div>
          )}
        </div>
      )}

      {phase === 4 && (
        <div style={{ animation: "fadeUp .4s ease" }}>
          <Body>Tap the <span style={{ color, fontWeight: 700 }}>highlighted words</span> in each sentence to see what the AI's spotlight pays attention to.</Body>
          <AttentionSentence words={BAT_S1} attnMap={BAT_A1} color="#fee440"
            label='Sentence 1 \u2014 "baseball bat"' LabelIcon={BaseballCap}
            meaning="baseball bat" MeaningIcon={BaseballCap} />
          <AttentionSentence words={BAT_S2} attnMap={BAT_A2} color="#9b5de5"
            label='Sentence 2 \u2014 "flying bat"' LabelIcon={Bird}
            meaning="flying animal" MeaningIcon={Bird} />
          <div style={{ padding: "14px 16px", background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 12, marginBottom: 6, fontSize: 14, color: "rgba(255,255,255,.65)", lineHeight: 1.6, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <Lightbulb size={22} weight="duotone" color={color} style={{ flexShrink: 0, marginTop: 2 }} />
            <span><strong style={{ color }}>That's attention!</strong> Same word, completely different meaning depending on which other words are shining their spotlight on it.</span>
          </div>
        </div>
      )}
      <TriviaBox visible={phase === 4} color={color} number="96" label="attention heads at once"
        fact="Claude runs 96 different spotlights at the same time \u2014 each one looking for different types of relationships. It's like 96 readers, each hunting for something different in the same sentence." />
    </div>
  );
}
