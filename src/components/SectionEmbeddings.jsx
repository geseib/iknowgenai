import { useState, useEffect, useRef } from "react";
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
  Confetti,
  ArrowDown,
} from "@phosphor-icons/react";
import { Card, Label, H1, TriviaBox, TeacherNote, PresSlide, PresText } from "./shared";
import {
  WORD_MAP,
  GROUP_COLORS as GC,
  P2_ANIMALS,
  P2_VEHICLES,
  P2_STEPS,
} from "../data/embeddings";
import { useGrade } from "../data/GradeContext";
import { GRADE_EXAMPLES } from "../data/gradeContent";

/* ── Icon mapping ─────────────────────────────────────────────────────────── */
const P2_ICONS = {
  cat: Cat, dog: Dog, bird: Bird, fish: Fish,
  plane: Airplane, train: Train, car: Car, boat: Sailboat,
};

/* ── ContinueButton ───────────────────────────────────────────────────────── */
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

/* ── DimensionExplorer ────────────────────────────────────────────────────── */
function DimensionExplorer({ color, onComplete }) {
  const [step, setStep] = useState(0);
  const explorerRef = useRef(null);
  const s = P2_STEPS[step];
  const isLast = step === P2_STEPS.length - 1;
  const advance = () => { if (isLast) onComplete(); else setStep(i => i + 1); };

  // ArrowDown keyboard support for dimension steps
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step]);

  // Auto-scroll to keep explorer centered on each step change
  useEffect(() => {
    if (explorerRef.current) {
      setTimeout(() => explorerRef.current.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
    }
  }, [step]);

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
      border: `2px solid ${focused ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.08)"}`,
      color: focused ? "white" : "rgba(255,255,255,.35)",
      transform: focused ? "scale(1.05)" : "scale(.95)",
      boxShadow: "none",
    };
    if (sc === 2) return {
      opacity: 1,
      background: `${dc}22`,
      border: `3px solid ${dc}`,
      color: "white",
      transform: "scale(1.1)",
      boxShadow: `0 0 18px ${dc}60`,
    };
    if (sc === 1) return {
      opacity: .65,
      background: `${dc}10`,
      border: `2px solid ${dc}55`,
      color: "rgba(255,255,255,.7)",
      transform: "scale(1.0)",
      boxShadow: "none",
    };
    return {
      opacity: .2,
      background: "rgba(255,255,255,.03)",
      border: "2px solid rgba(255,255,255,.08)",
      color: "rgba(255,255,255,.3)",
      transform: "scale(.92)",
      boxShadow: "none",
    };
  };

  const renderGroup = (items, groupLabel, GroupIcon) => (
    <>
      <div style={{
        fontSize: 16, fontFamily: "'Fredoka',sans-serif", letterSpacing: 2,
        color: "rgba(255,255,255,.35)", textTransform: "uppercase",
        marginBottom: 16, textAlign: "center",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>
        <GroupIcon size={18} weight="duotone" /> {groupLabel}
      </div>
      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
        {items.map(w => {
          const Icon = P2_ICONS[w];
          return (
            <div key={w} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 6, transition: "all .35s ease",
              padding: "12px 16px", borderRadius: 16,
              minWidth: 72,
              ...chipStyle(w),
            }}>
              <Icon size={40} weight="duotone" />
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 18, fontWeight: 600 }}>{w}</div>
              {s.scores !== null && (
                <div style={{
                  width: 36, height: 5, borderRadius: 3,
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
    <div ref={explorerRef} style={{ animation: "fadeUp .4s ease" }} key={step}>
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, justifyContent: "center" }}>
        {P2_STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 8, height: 8, borderRadius: 4,
            background: i <= step ? (s.dimColor || color) : "rgba(255,255,255,.15)",
            transition: "all .3s ease",
          }} />
        ))}
      </div>

      {/* Dimension label badge */}
      {s.dimLabel && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 22, fontWeight: 600,
            padding: "8px 24px", borderRadius: 24,
            background: `${s.dimColor || color}20`,
            border: `2px solid ${s.dimColor || color}60`,
            color: s.dimColor || color,
            animation: "fadeUp .35s ease",
          }}>{s.dimLabel}</div>
        </div>
      )}

      {/* Animal + Vehicle grid */}
      <Card style={{ marginBottom: 18, padding: "24px 20px" }}>
        {renderGroup(P2_ANIMALS, "Animals", PawPrint)}
        <div style={{ height: 1, background: "rgba(255,255,255,.07)", margin: "20px 0 18px" }} />
        {renderGroup(P2_VEHICLES, "Vehicles", Car)}
      </Card>

      {/* Explanation card */}
      <Card style={{ marginBottom: 20, padding: "20px 24px" }}>
        <div style={{
          fontFamily: "'Fredoka',sans-serif", fontSize: 28, color: "white",
          marginBottom: 10, lineHeight: 1.3,
        }}>{s.title}</div>
        <div style={{
          fontSize: 20, color: "rgba(255,255,255,.62)", lineHeight: 1.6,
        }}>{s.body}</div>
      </Card>

      {/* Next button */}
      <div style={{ textAlign: "center" }}>
        <button onClick={advance} className="cta-btn"
          style={{
            background: s.dimColor || color, color: "#000",
            fontSize: 20, padding: "14px 32px",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
          {isLast ? (<>Got it! <Confetti size={20} weight="duotone" /></>) : (<>Next <ArrowDown size={20} weight="bold" /></>)}
        </button>
      </div>
    </div>
  );
}

/* ── Main Section ─────────────────────────────────────────────────────────── */
export default function SectionEmbeddings({ color, mode, slide }) {
  const grade = useGrade();
  const gradeDimensions = GRADE_EXAMPLES[grade].dimensions;
  const [sel, setSel] = useState(null);
  const [step, setStep] = useState(0);
  const [part2Done, setPart2Done] = useState(false);
  const step1Ref = useRef(null);

  const selGroup = sel ? WORD_MAP.find(w => w.w === sel)?.g : null;
  const handleClick = (word) => { setSel(s => s === word ? null : word); };

  const advance = () => { if (step < 1) setStep(s => s + 1); };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (step < 1) {
          advance();
        } else if (part2Done) {
          // Only advance to next section after DimensionExplorer is complete
          window.dispatchEvent(new Event("sectionFullyRevealed"));
        }
        // Otherwise, DimensionExplorer's own handler will process the ArrowDown
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step, part2Done]);

  useEffect(() => {
    if (step === 1 && step1Ref.current) {
      setTimeout(() => step1Ref.current.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
  }, [step]);

  const notes = [
    "Part 1: Let kids tap words freely. Ask: 'Why do you think king and queen are close together but far from pizza?' The answer is that similarity in meaning = closeness in space.",
    "When a kid finds a cluster: 'What do all the words in that group have in common?' Then: 'What would you call the dimension that connects them?'",
    "Part 2 (Dimensions): Go slowly through each dimension. Let the class name the dimension BEFORE revealing it. 'What do cat and dog have in common that bird doesn't?' is a genuinely fun puzzle.",
    "The bird/plane 'Has Wings' moment usually gets a reaction — point out that AI discovered this cross-group similarity on its own from training data, nobody programmed it.",
    "The finale (12,288 dimensions) is the payoff. Ask: 'If you could measure a word along 12,288 different axes, do you think you could capture everything about what it means?'",
  ];

  const clusterLabels = [
    { g: "animals", x: 4,  y: 5,  Icon: PawPrint,   label: "Animals" },
    { g: "royalty", x: 58, y: 4,  Icon: Crown,       label: "Royalty" },
    { g: "food",    x: 30, y: 57, Icon: CookingPot,  label: "Food" },
    { g: "tech",    x: 73, y: 53, Icon: Desktop,     label: "Tech" },
    { g: "action",  x: 26, y: 16, Icon: Lightning,   label: "Actions" },
  ];

  if (mode === "presentation") {
    /* Slide 0: Dimensions first — concrete examples */
    if (slide === 0) return (
      <PresSlide>
        <PresText size={36}>
          Each of those numbers tells AI something about a word.
        </PresText>
        <PresText size={36}>
          These are called <span style={{ color }}>dimensions</span>.
        </PresText>
        <div style={{
          display: "flex", flexDirection: "column", gap: 14,
          maxWidth: 700, width: "100%",
        }}>
          {gradeDimensions.map((d, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "12px 20px", borderRadius: 14,
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.1)",
              animation: `fadeUp .4s ${i * 0.1}s ease both`,
            }}>
              <div style={{
                fontFamily: "'Fredoka',sans-serif", fontSize: 24,
                color, fontWeight: 700, minWidth: 200,
              }}>
                {d.dim}
              </div>
              <div style={{ fontSize: 20, color: "rgba(255,255,255,.5)" }}>
                <span style={{ color: "white" }}>{d.yes}</span>
                {" · "}
                <span style={{ textDecoration: "line-through", opacity: 0.5 }}>{d.no}</span>
              </div>
            </div>
          ))}
        </div>
        <PresText size={22} color="rgba(255,255,255,.35)">
          12,288 of these measurements per word!
        </PresText>
      </PresSlide>
    );
    /* Slide 1: Words in Space — the result of all those dimensions */
    if (slide === 1) return (
      <PresSlide>
        <PresText size={40} color="white">
          Similar words end up <span style={{ color }}>close together</span>
        </PresText>
        <Card style={{ padding: "18px 18px", width: "100%", maxWidth: 800 }}>
          <div style={{
            position: "relative", width: "100%", paddingTop: "65%",
            background: "rgba(255,255,255,.03)", borderRadius: 14, overflow: "hidden",
          }}>
            {clusterLabels.map(cl => (
              <div key={cl.g} style={{
                position: "absolute", left: `${cl.x}%`, top: `${cl.y}%`,
                fontSize: 18, fontFamily: "'Fredoka',sans-serif", fontWeight: 600,
                letterSpacing: .8, pointerEvents: "none", transition: "color .3s",
                color: selGroup === cl.g ? GC[cl.g] : "rgba(255,255,255,.2)",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <cl.Icon size={20} weight="duotone" /> {cl.label}
              </div>
            ))}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
              {selGroup && WORD_MAP.filter(w => w.g === selGroup && w.w !== sel).map(w => {
                const from = WORD_MAP.find(x => x.w === sel);
                return <line key={w.w} x1={`${from.x}%`} y1={`${from.y}%`} x2={`${w.x}%`} y2={`${w.y}%`} stroke={GC[selGroup]} strokeWidth={2} strokeOpacity={.5} strokeDasharray="5 4" />;
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
                  fontSize: 20, fontWeight: isMe ? 700 : 600,
                  color: (isMe || sg) ? gc : "rgba(255,255,255,.45)",
                  padding: "4px 12px", borderRadius: 24,
                  background: isMe ? `${gc}30` : sg ? `${gc}15` : "transparent",
                  border: isMe ? `2px solid ${gc}80` : "2px solid transparent",
                  cursor: "pointer", transition: "all .2s ease", whiteSpace: "nowrap",
                  zIndex: isMe ? 10 : 1,
                }}>{w.w}</div>
              );
            })}
          </div>
        </Card>
        {/* Affordance: make it obvious the scatter is tappable */}
        {sel ? (
          <PresText size={26} color="rgba(255,255,255,.7)">
            <span style={{ color: GC[selGroup], fontWeight: 700 }}>"{sel}"</span> lights up its
            {" "}<span style={{ color: GC[selGroup], fontWeight: 700 }}>{selGroup}</span> neighbors — similar meanings sit close together. Try another!
          </PresText>
        ) : (
          <PresText size={26} color={color}>
            👆 Tap any word — watch its neighbors light up
          </PresText>
        )}
      </PresSlide>
    );
    /* Slides 2-6: Key DimensionExplorer steps rendered as individual slides */
    const PRES_DIM_STEPS = [0, 2, 5, 6, 7, 8]; // Two neighbourhoods, Animal, Bird+Plane, Has Wings, Rideable, All dimensions
    const dimSlideIdx = slide - 2;
    if (dimSlideIdx >= 0 && dimSlideIdx < PRES_DIM_STEPS.length) {
      const stepIdx = PRES_DIM_STEPS[dimSlideIdx];
      const s = P2_STEPS[stepIdx];
      const dc = s.dimColor || color;

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
        if (sc === null) return {
          opacity: focused ? 1 : .25,
          background: focused ? "rgba(255,255,255,.1)" : "rgba(255,255,255,.03)",
          border: `2px solid ${focused ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.08)"}`,
          color: focused ? "white" : "rgba(255,255,255,.35)",
          transform: focused ? "scale(1.05)" : "scale(.95)",
        };
        if (sc === 2) return {
          opacity: 1, background: `${dc}22`, border: `3px solid ${dc}`,
          color: "white", transform: "scale(1.05)", boxShadow: `0 0 18px ${dc}60`,
        };
        if (sc === 1) return {
          opacity: .8, background: `${dc}10`, border: `2px solid ${dc}55`,
          color: "rgba(255,255,255,.7)", transform: "scale(1.0)",
        };
        return {
          opacity: .7, background: "rgba(255,255,255,.03)",
          border: "2px solid rgba(255,100,100,.2)", color: "rgba(255,255,255,.45)",
          transform: "scale(1.0)",
        };
      };

      /* Special case: last dim slide — show "cat" profile card */
      if (dimSlideIdx === PRES_DIM_STEPS.length - 1) {
        const catDims = [
          { label: "Animal",        value: "0.92",  high: true,  dimColor: "#fee440" },
          { label: "Has Fur",       value: "0.91",  high: true,  dimColor: "#fb5607" },
          { label: "Has 4 Legs",    value: "0.88",  high: true,  dimColor: "#9b5de5" },
          { label: "Has Wings",     value: "-0.81", high: false, dimColor: "#00bbf9" },
          { label: "You Can Ride It", value: "-0.79", high: false, dimColor: "#f15bb5" },
        ];
        return (
          <PresSlide>
            <PresText size={32} color="rgba(255,255,255,.5)">
              Every word is a mix of <strong style={{ color }}>ALL</strong> dimensions
            </PresText>

            {/* Cat profile card */}
            <div style={{
              padding: "32px 40px", borderRadius: 24,
              background: "rgba(255,255,255,.04)", border: `2px solid ${color}40`,
              maxWidth: 520, width: "100%",
            }}>
              {/* Cat header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 16,
                marginBottom: 28,
              }}>
                <Cat size={56} weight="duotone" color={color} />
                <div style={{
                  fontFamily: "'Fredoka',sans-serif", fontSize: 44, fontWeight: 700, color: "white",
                }}>cat</div>
              </div>

              {/* Dimension rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {catDims.map((d, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 14,
                  }}>
                    {/* Score */}
                    <div style={{
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      fontSize: 22, fontWeight: 700, letterSpacing: -0.5,
                      width: 70, textAlign: "right", flexShrink: 0,
                      color: d.high ? d.dimColor : "#ff6b6b",
                    }}>
                      {d.value}
                    </div>
                    {/* Bar */}
                    <div style={{
                      flex: 1, height: 10, borderRadius: 5,
                      background: "rgba(255,255,255,.06)", overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%", borderRadius: 5,
                        width: d.high ? "92%" : "0%",
                        background: d.high ? d.dimColor : "transparent",
                        transition: "width .4s ease",
                      }} />
                    </div>
                    {/* Label */}
                    <div style={{
                      fontFamily: "'Fredoka',sans-serif", fontSize: 20,
                      color: d.high ? "white" : "rgba(255,255,255,.35)",
                      minWidth: 140, flexShrink: 0,
                    }}>
                      {d.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <PresText size={22} color="rgba(255,255,255,.35)">
              ...and 12,283 more dimensions just like these!
            </PresText>
          </PresSlide>
        );
      }

      return (
        <PresSlide>
          {/* Dimension badge */}
          {s.dimLabel && (
            <div style={{
              fontFamily: "'Fredoka',sans-serif", fontSize: 24, fontWeight: 600,
              padding: "8px 28px", borderRadius: 24,
              background: `${dc}20`, border: `2px solid ${dc}60`, color: dc,
            }}>{s.dimLabel}</div>
          )}

          {/* Title + body */}
          <PresText size={32} color="white">{s.title}</PresText>
          <PresText size={22} color="rgba(255,255,255,.5)">{s.body}</PresText>

          {/* Animal + Vehicle chips */}
          <div style={{
            display: "flex", gap: 40, justifyContent: "center",
            flexWrap: "wrap", width: "100%", maxWidth: 800,
          }}>
            {/* Animals */}
            <div>
              <div style={{
                fontSize: 18, fontFamily: "'Fredoka',sans-serif", letterSpacing: 2,
                color: "rgba(255,255,255,.3)", textTransform: "uppercase",
                marginBottom: 12, textAlign: "center",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <PawPrint size={20} weight="duotone" /> Animals
              </div>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                {P2_ANIMALS.map(w => {
                  const Icon = P2_ICONS[w];
                  const sc = scoreOf(w);
                  const vec = sc === 2 ? "0.92" : sc === 1 ? "0.41" : sc === 0 ? "-0.81" : null;
                  return (
                    <div key={w} style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      gap: 5, transition: "all .35s ease",
                      padding: "10px 14px", borderRadius: 14, minWidth: 68,
                      ...chipStyle(w),
                    }}>
                      <Icon size={40} weight="duotone" />
                      <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, fontWeight: 600 }}>{w}</div>
                      {vec !== null && (
                        <div style={{
                          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                          fontSize: 16, fontWeight: 700, letterSpacing: -0.5,
                          color: sc === 2 ? dc : sc === 1 ? `${dc}aa` : "#ff6b6b",
                          background: sc === 2 ? `${dc}15` : sc === 0 ? "rgba(255,100,100,.08)" : "transparent",
                          padding: "2px 8px", borderRadius: 6,
                        }}>
                          {vec}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Vehicles */}
            <div>
              <div style={{
                fontSize: 18, fontFamily: "'Fredoka',sans-serif", letterSpacing: 2,
                color: "rgba(255,255,255,.3)", textTransform: "uppercase",
                marginBottom: 12, textAlign: "center",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <Car size={20} weight="duotone" /> Vehicles
              </div>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                {P2_VEHICLES.map(w => {
                  const Icon = P2_ICONS[w];
                  const sc = scoreOf(w);
                  const vec = sc === 2 ? "0.92" : sc === 1 ? "0.41" : sc === 0 ? "-0.81" : null;
                  return (
                    <div key={w} style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      gap: 5, transition: "all .35s ease",
                      padding: "10px 14px", borderRadius: 14, minWidth: 68,
                      ...chipStyle(w),
                    }}>
                      <Icon size={40} weight="duotone" />
                      <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, fontWeight: 600 }}>{w}</div>
                      {vec !== null && (
                        <div style={{
                          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                          fontSize: 16, fontWeight: 700, letterSpacing: -0.5,
                          color: sc === 2 ? dc : sc === 1 ? `${dc}aa` : "#ff6b6b",
                          background: sc === 2 ? `${dc}15` : sc === 0 ? "rgba(255,100,100,.08)" : "transparent",
                          padding: "2px 8px", borderRadius: 6,
                        }}>
                          {vec}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </PresSlide>
      );
    }
  }

  return (
    <div className="fade-up">
      <Label color={color} mode={mode} text="HOW AI THINKS · STEP 2" />
      <TeacherNote notes={notes} color={color} mode={mode} />

      {/* ── Step 0: Scatter plot ── */}
      <div style={{
        minHeight: "55vh", display: "flex", flexDirection: "column",
        justifyContent: "center",
      }}>
        <H1>Words in Space</H1>
        <div style={{
          fontSize: 22, color: "rgba(255,255,255,.62)", lineHeight: 1.6,
          maxWidth: 660, marginBottom: 24,
        }}>
          Those 12,288 numbers act like <strong style={{ color }}>coordinates</strong>, placing each word in a giant space. Similar words end up <em>close together</em>. Tap any word!
        </div>

        {/* Scatter plot */}
        <Card style={{ marginBottom: 14, padding: "18px 18px" }}>
          <div style={{
            position: "relative", width: "100%", paddingTop: "65%",
            background: "rgba(255,255,255,.03)", borderRadius: 14, overflow: "hidden",
          }}>
            {/* Cluster labels */}
            {clusterLabels.map(cl => (
              <div key={cl.g} style={{
                position: "absolute", left: `${cl.x}%`, top: `${cl.y}%`,
                fontSize: 15, fontFamily: "'Fredoka',sans-serif", fontWeight: 600,
                letterSpacing: .8, pointerEvents: "none", transition: "color .3s",
                color: selGroup === cl.g ? GC[cl.g] : "rgba(255,255,255,.2)",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <cl.Icon size={16} weight="duotone" /> {cl.label}
              </div>
            ))}

            {/* Connection lines */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
              {selGroup && WORD_MAP.filter(w => w.g === selGroup && w.w !== sel).map(w => {
                const from = WORD_MAP.find(x => x.w === sel);
                return <line key={w.w} x1={`${from.x}%`} y1={`${from.y}%`} x2={`${w.x}%`} y2={`${w.y}%`} stroke={GC[selGroup]} strokeWidth={2} strokeOpacity={.5} strokeDasharray="5 4" />;
              })}
            </svg>

            {/* Words */}
            {WORD_MAP.map(w => {
              const gc = GC[w.g];
              const isMe = w.w === sel;
              const sg = selGroup && w.g === selGroup;
              return (
                <div key={w.w} onClick={() => handleClick(w.w)} style={{
                  position: "absolute", left: `${w.x}%`, top: `${w.y}%`,
                  transform: "translate(-50%,-50%)", fontFamily: "'Fredoka',sans-serif",
                  fontSize: 18, fontWeight: isMe ? 700 : 600,
                  color: (isMe || sg) ? gc : "rgba(255,255,255,.45)",
                  padding: "4px 12px", borderRadius: 24,
                  background: isMe ? `${gc}30` : sg ? `${gc}15` : "transparent",
                  border: isMe ? `2px solid ${gc}80` : "2px solid transparent",
                  cursor: "pointer", transition: "all .2s ease", whiteSpace: "nowrap",
                  zIndex: isMe ? 10 : 1,
                }}>{w.w}</div>
              );
            })}
          </div>
        </Card>

        {/* Selected word info */}
        {sel && (
          <div style={{
            padding: "14px 20px", background: `${GC[selGroup]}12`,
            border: `1.5px solid ${GC[selGroup]}40`, borderRadius: 12,
            fontSize: 20, color: "rgba(255,255,255,.75)", marginBottom: 12,
            animation: "fadeUp .3s ease",
          }}>
            <span style={{ color: GC[selGroup], fontWeight: 700 }}>"{sel}"</span> is close to other <span style={{ color: GC[selGroup], fontWeight: 600 }}>{selGroup}</span> words — similar ideas cluster together in vector space!
          </div>
        )}

        {step === 0 && (
          <ContinueButton onClick={advance} color={color} label="Inside the Dimensions" />
        )}
      </div>

      {/* ── Step 1: Dimension Explorer ── */}
      {step >= 1 && (
        <div
          ref={step1Ref}
          style={{
            animation: "fadeUp .5s ease",
            minHeight: "60vh",
            display: "flex", flexDirection: "column", justifyContent: "center",
            paddingTop: 24,
          }}
        >
          <H1>Inside the Dimensions</H1>
          <div style={{
            fontSize: 22, color: "rgba(255,255,255,.62)", lineHeight: 1.6,
            maxWidth: 660, marginBottom: 28,
          }}>
            Each word is measured on <strong style={{ color }}>thousands of dimensions</strong> at once — like "animal", "has wings", "you can ride it". Let's discover them one at a time.
          </div>
          <DimensionExplorer color={color} onComplete={() => setPart2Done(true)} />
        </div>
      )}

      <TriviaBox mode={mode} visible={part2Done} color={color} number="~100,000" label="tokens in AI's vocabulary"
        fact="Large language models like Claude know around 100,000 word-pieces (tokens). That's roughly 3× more than the average adult's vocabulary of about 20,000–35,000 words — and every single token gets its own unique set of 12,288 coordinates in meaning space." />
    </div>
  );
}
