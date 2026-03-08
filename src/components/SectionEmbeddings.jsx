import { useState } from "react";
import {
  Cat,
  Dog,
  Bird,
  Fish,
  Airplane,
  Train,
  Car,
  Sailboat,
  PawPrint,
  Crown,
  CookingPot,
  Desktop,
  Lightning,
  Lightbulb,
  Confetti,
} from "@phosphor-icons/react";
import { Card, Label, H1, Body, TriviaBox, TeacherNote } from "./shared";
import {
  WORD_MAP,
  GROUP_COLORS as GC,
  P2_ANIMALS,
  P2_VEHICLES,
  P2_STEPS,
} from "../data/embeddings";

/* ── Icon mapping for DimensionExplorer ─────────────────────────────────────── */
const P2_ICONS = {
  cat:   Cat,
  dog:   Dog,
  bird:  Bird,
  fish:  Fish,
  plane: Airplane,
  train: Train,
  car:   Car,
  boat:  Sailboat,
};

/* ── Cluster label icons ────────────────────────────────────────────────────── */
const CLUSTER_ICONS = {
  animals: PawPrint,
  royalty: Crown,
  food:    CookingPot,
  tech:    Desktop,
  action:  Lightning,
};

/* ── DimensionExplorer sub-component ────────────────────────────────────────── */
function DimensionExplorer({ color, onComplete }) {
  const [step, setStep] = useState(0);
  const s = P2_STEPS[step];
  const isLast = step === P2_STEPS.length - 1;
  const advance = () => { if (isLast) onComplete(); else setStep(i => i + 1); };

  const inFocus = (w) => {
    if (!s.focusGroup) return true;
    if (s.focusGroup === "cd") return w === "cat" || w === "dog";
    if (s.focusGroup === "bp") return w === "bird" || w === "plane";
    if (s.focusGroup === "veh") return P2_VEHICLES.includes(w);
    return true;
  };

  const scoreOf = (w) => s.scores ? (s.scores[w] ?? 0) : null;

  const chipStyle = (w) => {
    const sc = scoreOf(w);
    const focused = inFocus(w);
    const dc = s.dimColor || color;
    if (sc === null) return {
      opacity: focused ? 1 : .25,
      background: focused ? "rgba(255,255,255,.1)" : "rgba(255,255,255,.03)",
      border: `1.5px solid ${focused ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.08)"}`,
      color: focused ? "white" : "rgba(255,255,255,.35)",
      transform: focused ? "scale(1.05)" : "scale(.97)",
      boxShadow: "none",
    };
    if (sc === 2) return {
      opacity: 1,
      background: `${dc}22`,
      border: `2px solid ${dc}`,
      color: "white",
      transform: "scale(1.08)",
      boxShadow: `0 0 14px ${dc}60`,
    };
    if (sc === 1) return {
      opacity: .65,
      background: `${dc}10`,
      border: `1.5px solid ${dc}55`,
      color: "rgba(255,255,255,.7)",
      transform: "scale(1.0)",
      boxShadow: "none",
    };
    return {
      opacity: .2,
      background: "rgba(255,255,255,.03)",
      border: "1.5px solid rgba(255,255,255,.08)",
      color: "rgba(255,255,255,.3)",
      transform: "scale(.95)",
      boxShadow: "none",
    };
  };

  const renderGroup = (items, groupLabel, GroupIcon) => (
    <>
      <div style={{ fontSize: 11, fontFamily: "'Fredoka',sans-serif", letterSpacing: 2, color: "rgba(255,255,255,.3)", textTransform: "uppercase", marginBottom: 12, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
        <GroupIcon size={14} weight="duotone" /> {groupLabel}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {items.map(w => {
          const Icon = P2_ICONS[w];
          return (
            <div key={w} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, transition: "all .35s ease", ...chipStyle(w) }}>
              <Icon size={26} weight="duotone" />
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 14 }}>{w}</div>
              {s.scores !== null && (
                <div style={{
                  width: 28, height: 4, borderRadius: 2,
                  background: scoreOf(w) === 2 ? (s.dimColor || color) : scoreOf(w) === 1 ? `${s.dimColor || color}60` : "rgba(255,255,255,.1)",
                  transition: "background .4s ease",
                }} />
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <div style={{ animation: "fadeUp .4s ease" }} key={step}>
      <div style={{ display: "flex", gap: 5, marginBottom: 16, justifyContent: "center" }}>
        {P2_STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 20 : 6, height: 6, borderRadius: 3,
            background: i <= step ? (s.dimColor || color) : "rgba(255,255,255,.15)",
            transition: "all .3s ease",
          }} />
        ))}
      </div>
      {s.dimLabel && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 15, fontWeight: 600,
            padding: "6px 18px", borderRadius: 20,
            background: `${s.dimColor || color}20`,
            border: `1.5px solid ${s.dimColor || color}60`,
            color: s.dimColor || color,
            animation: "fadeUp .35s ease",
          }}>{s.dimLabel}</div>
        </div>
      )}
      <Card style={{ marginBottom: 14, padding: "18px 16px" }}>
        {renderGroup(P2_ANIMALS, "Animals", PawPrint)}
        <div style={{ height: 1, background: "rgba(255,255,255,.07)", margin: "18px 0 16px" }} />
        {renderGroup(P2_VEHICLES, "Vehicles", Car)}
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: "white", marginBottom: 8, lineHeight: 1.3 }}>{s.title}</div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,.62)", lineHeight: 1.6 }}>{s.body}</div>
      </Card>
      <div style={{ textAlign: "center" }}>
        <button onClick={advance} className="cta-btn" style={{ background: s.dimColor || color, color: "#000", display: "inline-flex", alignItems: "center", gap: 6 }}>
          {isLast ? (<>Got it! <Confetti size={18} weight="duotone" /></>) : "Next \u2192"}
        </button>
      </div>
    </div>
  );
}

/* ── Main Section ───────────────────────────────────────────────────────────── */
export default function SectionEmbeddings({ color, mode }) {
  const [sel, setSel] = useState(null);
  const [hasClicked, setHasClicked] = useState(false);
  const [showPart2, setShowPart2] = useState(false);
  const [part2Done, setPart2Done] = useState(false);

  const selGroup = sel ? WORD_MAP.find(w => w.w === sel)?.g : null;
  const handleClick = (word) => { setSel(s => s === word ? null : word); setHasClicked(true); };

  const notes = [
    "Part 1: Let kids tap words freely. Ask: 'Why do you think king and queen are close together but far from pizza?' The answer is that similarity in meaning = closeness in space.",
    "When a kid finds a cluster: 'What do all the words in that group have in common?' Then: 'What would you call the dimension that connects them?'",
    "Part 2 (Dimensions): Go slowly through each dimension. Let the class name the dimension BEFORE revealing it. 'What do cat and dog have in common that bird doesn't?' is a genuinely fun puzzle.",
    "The bird/plane 'Has Wings' moment usually gets a reaction \u2014 point out that AI discovered this cross-group similarity on its own from training data, nobody programmed it.",
    "The finale (12,288 dimensions) is the payoff. Ask: 'If you could measure a word along 12,288 different axes, do you think you could capture everything about what it means?'",
  ];

  const clusterLabels = [
    { g: "animals", x: 4,  y: 5,  Icon: PawPrint, label: "Animals" },
    { g: "royalty", x: 58, y: 4,  Icon: Crown,    label: "Royalty" },
    { g: "food",    x: 30, y: 57, Icon: CookingPot, label: "Food" },
    { g: "tech",    x: 73, y: 53, Icon: Desktop,  label: "Tech" },
    { g: "action",  x: 26, y: 16, Icon: Lightning, label: "Actions" },
  ];

  return (
    <div className="fade-up">
      <Label color={color} text="HOW AI THINKS \u00b7 STEP 2" />
      <TeacherNote notes={notes} color={color} mode={mode} />
      {!showPart2 ? (
        <>
          <H1>Words in Space</H1>
          <Body>Those 12,288 numbers act like <strong style={{ color }}>coordinates</strong>, placing each word in a giant space. Similar words end up <em>close together</em>. Tap any word to see its neighbours!</Body>
          <Card style={{ marginBottom: 10, padding: "14px 14px" }}>
            <div style={{ position: "relative", width: "100%", paddingTop: "52%", background: "rgba(255,255,255,.03)", borderRadius: 10, overflow: "hidden" }}>
              {clusterLabels.map(cl => (
                <div key={cl.g} style={{
                  position: "absolute", left: `${cl.x}%`, top: `${cl.y}%`,
                  fontSize: 11, fontFamily: "'Fredoka',sans-serif", fontWeight: 600,
                  letterSpacing: .8, pointerEvents: "none", transition: "color .3s",
                  color: selGroup === cl.g ? GC[cl.g] : "rgba(255,255,255,.25)",
                  display: "flex", alignItems: "center", gap: 3,
                }}>
                  <cl.Icon size={13} weight="duotone" /> {cl.label}
                </div>
              ))}
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                {selGroup && WORD_MAP.filter(w => w.g === selGroup && w.w !== sel).map(w => {
                  const from = WORD_MAP.find(x => x.w === sel);
                  return <line key={w.w} x1={`${from.x}%`} y1={`${from.y}%`} x2={`${w.x}%`} y2={`${w.y}%`} stroke={GC[selGroup]} strokeWidth={1.5} strokeOpacity={.45} strokeDasharray="4 3" />;
                })}
              </svg>
              {WORD_MAP.map(w => {
                const gc = GC[w.g];
                const isMe = w.w === sel;
                const sg = selGroup && w.g === selGroup;
                return (
                  <div key={w.w} onClick={() => handleClick(w.w)} style={{
                    position: "absolute", left: `${w.x}%`, top: `${w.y}%`,
                    transform: "translate(-50%,-50%)", fontFamily: "'Fredoka',sans-serif",
                    fontSize: 13, fontWeight: isMe ? 700 : 500,
                    color: (isMe || sg) ? gc : "rgba(255,255,255,.45)",
                    padding: "2px 7px", borderRadius: 20,
                    background: isMe ? `${gc}28` : sg ? `${gc}12` : "transparent",
                    border: isMe ? `1px solid ${gc}70` : "1px solid transparent",
                    cursor: "pointer", transition: "all .2s ease", whiteSpace: "nowrap",
                    zIndex: isMe ? 10 : 1,
                  }}>{w.w}</div>
                );
              })}
            </div>
          </Card>
          {sel && (
            <div style={{ padding: "10px 14px", background: `${GC[selGroup]}12`, border: `1px solid ${GC[selGroup]}35`, borderRadius: 10, fontSize: 14, color: "rgba(255,255,255,.75)", marginBottom: 10 }}>
              <span style={{ color: GC[selGroup], fontWeight: 700 }}>"{sel}"</span> is close to other <span style={{ color: GC[selGroup] }}>{selGroup}</span> words \u2014 similar ideas cluster together in vector space!
            </div>
          )}
          {hasClicked && (
            <div style={{ textAlign: "center", marginTop: 16, animation: "fadeUp .4s ease" }}>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,.4)", marginBottom: 10 }}>But <em>why</em> are similar words close? Ready to find out?</div>
              <button onClick={() => setShowPart2(true)} className="cta-btn" style={{ background: color, color: "#000" }}>Part 2: Inside the Dimensions &rarr;</button>
            </div>
          )}
        </>
      ) : (
        <>
          <H1>Inside the Dimensions</H1>
          <Body>Each word is measured on <strong style={{ color }}>thousands of dimensions</strong> at once \u2014 like "animal", "has wings", "you can ride it". Let's discover them one at a time.</Body>
          <DimensionExplorer color={color} onComplete={() => setPart2Done(true)} />
        </>
      )}
      <TriviaBox visible={part2Done} color={color} number="50,257" label="tokens in vocabulary"
        fact="Claude knows over 50,000 word-pieces (tokens). Every one has its own unique set of 12,288 coordinates \u2014 one per dimension \u2014 in meaning space." />
    </div>
  );
}
