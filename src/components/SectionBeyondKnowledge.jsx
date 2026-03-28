import { useState, useEffect, useRef } from "react";
import {
  Brain,
  ArrowRight,
  Calculator,
  CalendarBlank,
  MagnifyingGlass,
  Lightning,
  Prohibit,
  CheckCircle,
  Robot,
  Sparkle,
  PaperPlaneTilt,
  ArrowClockwise,
  ToggleLeft,
  ToggleRight,
  FileText,
  BookOpen,
  Wrench,
  ArrowsClockwise,
  Warning,
} from "@phosphor-icons/react";
import { Card, PresSlide, PresText } from "./shared";

/* ── Shared visual: the "brain in a box" ── */
function BrainBox({ color, children, label, glow }) {
  return (
    <div style={{
      position: "relative",
      padding: "28px 24px",
      borderRadius: 20,
      background: `${color}08`,
      border: `2px solid ${color}40`,
      boxShadow: glow ? `0 0 30px ${color}20, inset 0 0 20px ${color}08` : "none",
      textAlign: "center",
      minWidth: 200,
      transition: "all .4s ease",
    }}>
      {label && (
        <div style={{
          position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
          fontFamily: "'Fredoka',sans-serif", fontSize: 11, fontWeight: 700,
          letterSpacing: 2, textTransform: "uppercase",
          color: "#000", background: color, padding: "3px 12px",
          borderRadius: 8,
        }}>
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── Tool badge ── */
function ToolBadge({ Icon, label, color, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 16px", borderRadius: 12,
        background: active ? `${color}15` : "rgba(255,255,255,.03)",
        border: `2px solid ${active ? color + "50" : "rgba(255,255,255,.08)"}`,
        cursor: onClick ? "pointer" : "default",
        transition: "all .2s ease",
        opacity: active ? 1 : 0.5,
      }}
    >
      <Icon size={22} weight="duotone" color={active ? color : "rgba(255,255,255,.3)"} />
      <span style={{
        fontFamily: "'Fredoka',sans-serif", fontSize: 15,
        color: active ? "white" : "rgba(255,255,255,.3)",
      }}>
        {label}
      </span>
    </div>
  );
}

/* ── Flow arrow ── */
function FlowArrow({ color, label }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
      padding: "0 8px",
    }}>
      <ArrowRight size={24} weight="bold" color={color || "rgba(255,255,255,.25)"} />
      {label && (
        <span style={{ fontSize: 10, color: "rgba(255,255,255,.25)", fontFamily: "'Fredoka',sans-serif" }}>
          {label}
        </span>
      )}
    </div>
  );
}

/* ── Animated step trace for the interactive ── */
function StepTrace({ steps, color }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const traceRef = useRef(null);

  useEffect(() => {
    setVisibleCount(0);
    if (steps.length === 0) return;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= steps.length) clearInterval(timer);
    }, 600);
    return () => clearInterval(timer);
  }, [steps]);

  useEffect(() => {
    if (traceRef.current) {
      traceRef.current.scrollTop = traceRef.current.scrollHeight;
    }
  }, [visibleCount]);

  if (steps.length === 0) return null;

  return (
    <div ref={traceRef} style={{
      maxHeight: 320, overflowY: "auto", padding: "12px 0",
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      {steps.slice(0, visibleCount).map((step, i) => {
        if (step.type === "tool_call") {
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 12,
              background: "#fee44010", border: "1px solid #fee44030",
              animation: "fadeUp .3s ease",
            }}>
              <Wrench size={18} weight="duotone" color="#fee440" />
              <div>
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 11, color: "#fee440", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                  Tool Call → {step.tool}
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,.5)", fontFamily: "'Nunito',monospace", marginTop: 2 }}>
                  {step.input || "(no input)"}
                </div>
              </div>
            </div>
          );
        }
        if (step.type === "tool_result") {
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 12,
              background: "#06d6a008", border: "1px solid #06d6a025",
              animation: "fadeUp .3s ease",
            }}>
              <CheckCircle size={18} weight="duotone" color="#06d6a0" />
              <div>
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 11, color: "#06d6a0", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                  Result ← {step.tool}
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,.6)", fontFamily: "'Nunito',monospace", marginTop: 2 }}>
                  {step.output.length > 120 ? step.output.slice(0, 120) + "…" : step.output}
                </div>
              </div>
            </div>
          );
        }
        if (step.type === "response") {
          return (
            <div key={i} style={{
              padding: "12px 16px", borderRadius: 12,
              background: `${color}10`, border: `1px solid ${color}30`,
              animation: "fadeUp .3s ease",
            }}>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 11, color, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                AI Response
              </div>
              <div style={{ fontSize: 16, color: "rgba(255,255,255,.8)", lineHeight: 1.55 }}>
                {step.content}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════════ */
export default function SectionBeyondKnowledge({ color, mode, slide }) {
  const [tools, setTools] = useState({ calculator: true, get_date: true, search_docs: true });
  const [query, setQuery] = useState("");
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noToolSteps, setNoToolSteps] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  const toggleTool = (key) => setTools(prev => ({ ...prev, [key]: !prev[key] }));

  const runAgent = async (withTools) => {
    if (!query.trim()) return;
    const enabledTools = withTools
      ? Object.entries(tools).filter(([, v]) => v).map(([k]) => k)
      : [];

    setLoading(true);
    if (withTools) {
      setSteps([]);
      setShowComparison(false);
    }

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query, tools: enabledTools }),
      });
      const data = await res.json();
      if (data.error) {
        const errorSteps = [{ type: "response", content: data.message || data.error }];
        if (withTools) setSteps(errorSteps);
        else setNoToolSteps(errorSteps);
      } else {
        if (withTools) {
          setSteps(data.steps);
        } else {
          setNoToolSteps(data.steps);
          setShowComparison(true);
        }
      }
    } catch {
      const errorSteps = [{ type: "response", content: "Something went wrong. Try again!" }];
      if (withTools) setSteps(errorSteps);
      else setNoToolSteps(errorSteps);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // First run without tools, then with tools
    setNoToolSteps([]);
    setShowComparison(false);
    setLoading(true);

    // Run without tools
    try {
      const res1 = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query, tools: [] }),
      });
      const data1 = await res1.json();
      setNoToolSteps(data1.steps || [{ type: "response", content: data1.message || data1.error }]);
    } catch {
      setNoToolSteps([{ type: "response", content: "Error" }]);
    }

    // Run with tools
    const enabledTools = Object.entries(tools).filter(([, v]) => v).map(([k]) => k);
    try {
      const res2 = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query, tools: enabledTools }),
      });
      const data2 = await res2.json();
      setSteps(data2.steps || [{ type: "response", content: data2.message || data2.error }]);
    } catch {
      setSteps([{ type: "response", content: "Error" }]);
    }

    setShowComparison(true);
    setLoading(false);
  };

  const reset = () => {
    setQuery("");
    setSteps([]);
    setNoToolSteps([]);
    setShowComparison(false);
  };

  if (mode !== "presentation") return null;

  const INSIDE_COLOR = "#9b5de5";
  const OUTSIDE_COLOR = "#06d6a0";
  const WINDOW_COLOR = "#fee440";

  /* ── Slide 0: The Problem ── */
  if (slide === 0) {
    const failures = [
      { q: "What day is it today?", a: "I don't know — my training ended months ago.", icon: CalendarBlank },
      { q: "What's 847 × 293?", a: "Hmm... about 248,000?  (It's actually 248,171)", icon: Calculator },
      { q: "What does this document say?", a: "I can't see attachments or files.", icon: FileText },
    ];
    return (
      <PresSlide>
        <div className="fade-up" style={{ maxWidth: 800, width: "100%" }}>
          <PresText size={40} color={color}>
            AI knows a LOT... but not everything
          </PresText>
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 22,
            color: "rgba(255,255,255,.4)", textAlign: "center", marginTop: 8, marginBottom: 28,
          }}>
            The model is stuck inside its box — it only has what it learned during training
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {failures.map((f, i) => (
              <div key={i} style={{
                display: "flex", gap: 16, alignItems: "center",
                padding: "16px 20px", borderRadius: 16,
                background: "rgba(255,100,100,.06)", border: "1px solid rgba(255,100,100,.15)",
                animation: `fadeUp .4s ${0.2 + i * 0.2}s ease both`,
              }}>
                <f.icon size={32} weight="duotone" color="#ff6b6b" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 18, color: "white", marginBottom: 4 }}>
                    "{f.q}"
                  </div>
                  <div style={{ fontSize: 16, color: "rgba(255,255,255,.45)", fontStyle: "italic" }}>
                    AI: "{f.a}"
                  </div>
                </div>
                <Prohibit size={24} weight="bold" color="#ff6b6b" style={{ flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      </PresSlide>
    );
  }

  /* ── Slide 1: Solution 1 — Give It Context ── */
  if (slide === 1) {
    return (
      <PresSlide>
        <div className="fade-up" style={{ maxWidth: 800, width: "100%" }}>
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 16, fontWeight: 600,
            letterSpacing: 3, textTransform: "uppercase",
            color: "rgba(255,255,255,.3)", textAlign: "center", marginBottom: -8,
          }}>
            SOLUTION 1
          </div>
          <PresText size={40} color={color}>
            Give It the Answer
          </PresText>

          {/* Flow diagram */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 12, marginTop: 24, marginBottom: 24, flexWrap: "wrap",
          }}>
            <Card style={{
              padding: "16px 20px", textAlign: "center",
              animation: "fadeUp .4s .2s ease both",
            }}>
              <FileText size={32} weight="duotone" color={WINDOW_COLOR} />
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 14, color: "white", marginTop: 6 }}>
                Your Document
              </div>
            </Card>

            <FlowArrow color={WINDOW_COLOR} label="paste in" />

            <BrainBox color={INSIDE_COLOR} label="Model" glow>
              <Brain size={40} weight="duotone" color={INSIDE_COLOR} />
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 13, color: "rgba(255,255,255,.5)", marginTop: 6 }}>
                Reads your doc +<br />answers the question
              </div>
            </BrainBox>

            <FlowArrow color={INSIDE_COLOR} label="answer" />

            <Card style={{
              padding: "16px 20px", textAlign: "center",
              background: `${INSIDE_COLOR}10`, borderColor: `${INSIDE_COLOR}30`,
              animation: "fadeUp .4s .6s ease both",
            }}>
              <CheckCircle size={32} weight="duotone" color={INSIDE_COLOR} />
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 14, color: "white", marginTop: 6 }}>
                Correct Answer!
              </div>
            </Card>
          </div>

          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 22,
            color: "rgba(255,255,255,.55)", textAlign: "center", lineHeight: 1.5,
            maxWidth: 600, margin: "0 auto",
          }}>
            You copy the text into your message — the AI reads it and answers.
            <br /><span style={{ color: "rgba(255,255,255,.3)", fontSize: 18 }}>
              Simple, but YOU have to find the right document.
            </span>
          </div>
        </div>
      </PresSlide>
    );
  }

  /* ── Slide 2: Solution 2 — RAG ── */
  if (slide === 2) {
    return (
      <PresSlide>
        <div className="fade-up" style={{ maxWidth: 850, width: "100%" }}>
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 16, fontWeight: 600,
            letterSpacing: 3, textTransform: "uppercase",
            color: "rgba(255,255,255,.3)", textAlign: "center", marginBottom: -8,
          }}>
            SOLUTION 2
          </div>
          <PresText size={40} color={color}>
            Give It a Librarian
          </PresText>

          {/* Flow diagram */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 10, marginTop: 24, marginBottom: 24, flexWrap: "wrap",
          }}>
            <Card style={{ padding: "14px 18px", textAlign: "center", animation: "fadeUp .4s .1s ease both" }}>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 14, color: "white" }}>Question</div>
            </Card>

            <FlowArrow color={OUTSIDE_COLOR} />

            <BrainBox color={OUTSIDE_COLOR} label="Retriever (Program)">
              <BookOpen size={36} weight="duotone" color={OUTSIDE_COLOR} />
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 12, color: "rgba(255,255,255,.5)", marginTop: 6 }}>
                Searches documents<br /><em>Rule-based — not AI</em>
              </div>
            </BrainBox>

            <FlowArrow color={WINDOW_COLOR} label="found docs" />

            <BrainBox color={INSIDE_COLOR} label="Model" glow>
              <Brain size={36} weight="duotone" color={INSIDE_COLOR} />
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 12, color: "rgba(255,255,255,.5)", marginTop: 6 }}>
                Reads docs +<br />generates answer
              </div>
            </BrainBox>

            <FlowArrow color={INSIDE_COLOR} />

            <Card style={{
              padding: "14px 18px", textAlign: "center",
              background: `${INSIDE_COLOR}10`, borderColor: `${INSIDE_COLOR}30`,
              animation: "fadeUp .4s .5s ease both",
            }}>
              <CheckCircle size={28} weight="duotone" color={INSIDE_COLOR} />
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 14, color: "white", marginTop: 4 }}>Answer</div>
            </Card>
          </div>

          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 22,
            color: "rgba(255,255,255,.55)", textAlign: "center", lineHeight: 1.5,
            maxWidth: 650, margin: "0 auto",
          }}>
            A <span style={{ color: OUTSIDE_COLOR }}>program</span> finds the right documents automatically.
            The <span style={{ color: INSIDE_COLOR }}>model</span> reads them and answers.
          </div>
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 18,
            color, textAlign: "center", marginTop: 12,
          }}>
            This is called <strong>RAG</strong> — Retrieval-Augmented Generation
          </div>
        </div>
      </PresSlide>
    );
  }

  /* ── Slide 3: Solution 3 — Tool Use ── */
  if (slide === 3) {
    return (
      <PresSlide>
        <div className="fade-up" style={{ maxWidth: 850, width: "100%" }}>
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 16, fontWeight: 600,
            letterSpacing: 3, textTransform: "uppercase",
            color: "rgba(255,255,255,.3)", textAlign: "center", marginBottom: -8,
          }}>
            SOLUTION 3
          </div>
          <PresText size={40} color={color}>
            Give It Tools
          </PresText>

          {/* Flow diagram — bidirectional */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 16, marginTop: 24, marginBottom: 24,
          }}>
            {/* Model box */}
            <BrainBox color={INSIDE_COLOR} label="Model" glow>
              <Brain size={36} weight="duotone" color={INSIDE_COLOR} />
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 14, color: "rgba(255,255,255,.5)", marginTop: 6 }}>
                "I need a calculator for this..."
              </div>
              <div style={{
                fontFamily: "'Nunito',monospace", fontSize: 13,
                color: WINDOW_COLOR, marginTop: 8,
                padding: "6px 12px", borderRadius: 8,
                background: `${WINDOW_COLOR}10`, border: `1px solid ${WINDOW_COLOR}25`,
              }}>
                use_tool: calculator(847 × 293)
              </div>
            </BrainBox>

            {/* Bidirectional arrows */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: WINDOW_COLOR, fontFamily: "'Fredoka',sans-serif", marginBottom: 4 }}>request ↓</div>
                <div style={{ width: 2, height: 20, background: `${WINDOW_COLOR}40`, margin: "0 auto" }} />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 2, height: 20, background: `${OUTSIDE_COLOR}40`, margin: "0 auto" }} />
                <div style={{ fontSize: 11, color: OUTSIDE_COLOR, fontFamily: "'Fredoka',sans-serif", marginTop: 4 }}>↑ result</div>
              </div>
            </div>

            {/* Tools */}
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { Icon: Calculator, label: "Calculator", result: "248,171" },
                { Icon: CalendarBlank, label: "Calendar", result: "March 28" },
                { Icon: MagnifyingGlass, label: "Search", result: "Found 2 docs" },
              ].map((t, i) => (
                <Card key={i} style={{
                  padding: "14px 18px", textAlign: "center",
                  background: `${OUTSIDE_COLOR}08`, borderColor: `${OUTSIDE_COLOR}25`,
                  animation: `fadeUp .4s ${0.3 + i * 0.15}s ease both`,
                }}>
                  <t.Icon size={28} weight="duotone" color={OUTSIDE_COLOR} />
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 13, color: "white", marginTop: 4 }}>
                    {t.label}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 20,
            color: "rgba(255,255,255,.55)", textAlign: "center", lineHeight: 1.5,
            maxWidth: 650, margin: "0 auto",
          }}>
            The model <span style={{ color: INSIDE_COLOR }}>learned to ASK for help</span> in a specific format.
            A <span style={{ color: OUTSIDE_COLOR }}>program</span> runs the tool and sends the result back.
          </div>
        </div>
      </PresSlide>
    );
  }

  /* ── Slide 4: The Agentic Loop ── */
  if (slide === 4) {
    const loopSteps = [
      { label: "Think", desc: "I need to figure out how many pizzas...", color: INSIDE_COLOR, icon: Brain },
      { label: "Act", desc: "calculator(23 ÷ 8) → 2.875 → 3 pizzas", color: WINDOW_COLOR, icon: Wrench },
      { label: "Observe", desc: "3 pizzas needed. Now check prices...", color: OUTSIDE_COLOR, icon: CheckCircle },
      { label: "Think", desc: "3 × $12 = $36, leaving $14 for drinks", color: INSIDE_COLOR, icon: Brain },
    ];
    return (
      <PresSlide>
        <div className="fade-up" style={{ maxWidth: 800, width: "100%" }}>
          <PresText size={40} color={color}>
            The Agent Loop
          </PresText>
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 22,
            color: "rgba(255,255,255,.4)", textAlign: "center", marginBottom: 24,
          }}>
            "Plan a pizza party for 23 kids with a $50 budget"
          </div>

          {/* Loop visualization */}
          <div style={{
            display: "flex", flexDirection: "column", gap: 10,
            maxWidth: 650, margin: "0 auto",
          }}>
            {loopSteps.map((s, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 20px", borderRadius: 14,
                background: `${s.color}08`, border: `1px solid ${s.color}25`,
                animation: `fadeUp .4s ${0.2 + i * 0.2}s ease both`,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: `${s.color}20`, border: `2px solid ${s.color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <s.icon size={18} weight="bold" color={s.color} />
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Fredoka',sans-serif", fontSize: 14, fontWeight: 700,
                    color: s.color, textTransform: "uppercase", letterSpacing: 1,
                  }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 16, color: "rgba(255,255,255,.6)", marginTop: 2 }}>
                    {s.desc}
                  </div>
                </div>
                {i < loopSteps.length - 1 && (
                  <ArrowsClockwise size={18} weight="bold" color="rgba(255,255,255,.15)" style={{ marginLeft: "auto", flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>

          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 20,
            color: "rgba(255,255,255,.55)", textAlign: "center", marginTop: 20,
            lineHeight: 1.5, maxWidth: 600, margin: "20px auto 0",
          }}>
            An <span style={{ color }}>agent</span> keeps looping —
            <span style={{ color: INSIDE_COLOR }}> think</span>,
            <span style={{ color: WINDOW_COLOR }}> act</span>,
            <span style={{ color: OUTSIDE_COLOR }}> observe</span> —
            until the job is done.
          </div>
        </div>
      </PresSlide>
    );
  }

  /* ── Slide 5: All Three Together ── */
  if (slide === 5) {
    const solutions = [
      {
        num: 1, title: "Give It Context", color: WINDOW_COLOR,
        desc: "You paste the document into your message",
        icons: [FileText, ArrowRight, Brain],
      },
      {
        num: 2, title: "Give It a Librarian", color: OUTSIDE_COLOR,
        desc: "A program finds relevant documents automatically",
        icons: [MagnifyingGlass, ArrowRight, Brain],
      },
      {
        num: 3, title: "Give It Tools", color: INSIDE_COLOR,
        desc: "The model asks for help, tools send results back",
        icons: [Brain, ArrowsClockwise, Wrench],
      },
    ];
    return (
      <PresSlide>
        <div className="fade-up" style={{ maxWidth: 800, width: "100%" }}>
          <PresText size={36} color={color}>
            Three Ways AI Gets Help
          </PresText>

          <div style={{
            display: "flex", gap: 16, marginTop: 24,
            justifyContent: "center", flexWrap: "wrap",
          }}>
            {solutions.map((s, i) => (
              <Card key={i} style={{
                flex: 1, minWidth: 220, padding: "24px 20px",
                textAlign: "center",
                background: `${s.color}08`, borderColor: `${s.color}30`,
                animation: `fadeUp .4s ${0.2 + i * 0.15}s ease both`,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: `${s.color}20`, border: `2px solid ${s.color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 12px",
                }}>
                  <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, fontWeight: 700, color: s.color }}>
                    {s.num}
                  </span>
                </div>
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, color: "white", marginBottom: 8 }}>
                  {s.title}
                </div>
                <div style={{
                  display: "flex", justifyContent: "center", gap: 8, marginBottom: 10,
                }}>
                  {s.icons.map((Icon, j) => (
                    <Icon key={j} size={22} weight="duotone" color={s.color} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,.45)", lineHeight: 1.5 }}>
                  {s.desc}
                </div>
              </Card>
            ))}
          </div>

          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 18,
            color: "rgba(255,255,255,.35)", textAlign: "center", marginTop: 20,
            fontStyle: "italic",
          }}>
            Real AI apps use all three together!
          </div>
        </div>
      </PresSlide>
    );
  }

  /* ── Slide 6: Interactive — Mission Control ── */
  if (slide === 6) {
    const suggestions = [
      "What's 847 × 293?",
      "What day is it today?",
      "Tell me about octopuses",
      "How many pizzas for 23 kids?",
    ];

    return (
      <PresSlide>
        <div className="fade-up" style={{ maxWidth: 900, width: "100%", textAlign: "left" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <PresText size={34} color={color}>
              Mission Control
            </PresText>
            <div style={{
              fontFamily: "'Fredoka',sans-serif", fontSize: 18,
              color: "rgba(255,255,255,.35)", marginTop: 4,
            }}>
              Toggle tools on/off and see how the AI's answer changes
            </div>
          </div>

          {/* Tool toggles */}
          <div style={{
            display: "flex", gap: 12, justifyContent: "center",
            marginBottom: 20, flexWrap: "wrap",
          }}>
            {[
              { key: "calculator", Icon: Calculator, label: "Calculator", c: "#00bbf9" },
              { key: "get_date", Icon: CalendarBlank, label: "Today's Date", c: "#fb5607" },
              { key: "search_docs", Icon: MagnifyingGlass, label: "Doc Search", c: "#06d6a0" },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => toggleTool(t.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 18px", borderRadius: 12,
                  background: tools[t.key] ? `${t.c}15` : "rgba(255,255,255,.03)",
                  border: `2px solid ${tools[t.key] ? t.c + "50" : "rgba(255,255,255,.1)"}`,
                  cursor: "pointer", transition: "all .2s ease",
                  fontFamily: "'Fredoka',sans-serif", fontSize: 15,
                  color: tools[t.key] ? "white" : "rgba(255,255,255,.3)",
                }}>
                {tools[t.key]
                  ? <ToggleRight size={22} weight="fill" color={t.c} />
                  : <ToggleLeft size={22} weight="bold" color="rgba(255,255,255,.2)" />}
                <t.Icon size={18} weight="duotone" color={tools[t.key] ? t.c : "rgba(255,255,255,.25)"} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !loading && handleSubmit()}
              placeholder="Ask something that needs a tool..."
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
              style={{
                flex: 1, padding: "14px 18px", borderRadius: 14,
                border: `2px solid ${color}40`, background: "rgba(0,0,0,.3)",
                color: "white", fontFamily: "'Fredoka',sans-serif", fontSize: 18,
                outline: "none",
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!query.trim() || loading}
              className="cta-btn"
              style={{
                background: query.trim() && !loading ? color : "rgba(255,255,255,.1)",
                color: query.trim() && !loading ? "#000" : "rgba(255,255,255,.3)",
                fontSize: 18, padding: "14px 24px",
              }}
            >
              {loading ? <Sparkle size={20} weight="duotone" className="spin" /> : <PaperPlaneTilt size={20} weight="bold" />}
            </button>
          </div>

          {/* Suggestion chips */}
          {!showComparison && steps.length === 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(s)}
                  style={{
                    padding: "6px 14px", borderRadius: 20,
                    border: "1px solid rgba(255,255,255,.12)",
                    background: "rgba(255,255,255,.04)",
                    color: "rgba(255,255,255,.45)",
                    fontFamily: "'Fredoka',sans-serif", fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Results: side-by-side comparison */}
          {showComparison && (
            <div style={{
              display: "flex", gap: 16, marginTop: 8,
              animation: "fadeUp .4s ease",
            }}>
              {/* Without tools */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif", fontSize: 14, fontWeight: 700,
                  color: "#ff6b6b", textTransform: "uppercase", letterSpacing: 2,
                  marginBottom: 10, textAlign: "center",
                }}>
                  Without Tools
                </div>
                <Card style={{
                  padding: "14px 16px",
                  background: "rgba(255,100,100,.04)", borderColor: "rgba(255,100,100,.15)",
                  minHeight: 100,
                }}>
                  <StepTrace steps={noToolSteps} color="#ff6b6b" />
                </Card>
              </div>

              {/* With tools */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif", fontSize: 14, fontWeight: 700,
                  color: OUTSIDE_COLOR, textTransform: "uppercase", letterSpacing: 2,
                  marginBottom: 10, textAlign: "center",
                }}>
                  With Tools
                </div>
                <Card style={{
                  padding: "14px 16px",
                  background: `${OUTSIDE_COLOR}04`, borderColor: `${OUTSIDE_COLOR}15`,
                  minHeight: 100,
                }}>
                  <StepTrace steps={steps} color={color} />
                </Card>
              </div>
            </div>
          )}

          {/* Reset */}
          {showComparison && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button
                onClick={reset}
                className="cta-btn"
                style={{
                  background: "rgba(255,255,255,.08)",
                  border: "1px solid rgba(255,255,255,.15)",
                  color: "rgba(255,255,255,.6)",
                  fontSize: 16, padding: "10px 24px",
                  display: "inline-flex", alignItems: "center", gap: 8,
                }}
              >
                <ArrowClockwise size={18} weight="bold" />
                Try Another Question
              </button>
            </div>
          )}
        </div>
      </PresSlide>
    );
  }

  return null;
}
