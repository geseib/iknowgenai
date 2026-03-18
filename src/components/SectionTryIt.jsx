import { useState, useRef } from "react";
import {
  Lightning,
  MagnifyingGlass,
  PencilSimple,
  Scissors,
  ArrowRight,
  ArrowCounterClockwise,
  Star,
  Spinner,
  Snowflake,
  Scales,
  Flame,
} from "@phosphor-icons/react";
import { Card, PresSlide, PresText } from "./shared";
import { useGrade } from "../data/GradeContext";
import { GRADE_EXAMPLES } from "../data/gradeContent";

/* ── Tab button ── */
function Tab({ active, label, Icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'Fredoka',sans-serif",
        fontSize: 16,
        fontWeight: 600,
        padding: "10px 20px",
        borderRadius: 12,
        border: `2px solid ${active ? color : "rgba(255,255,255,.1)"}`,
        background: active ? `${color}18` : "rgba(255,255,255,.04)",
        color: active ? color : "rgba(255,255,255,.45)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        transition: "all .2s ease",
      }}
    >
      <Icon size={20} weight="duotone" />
      {label}
    </button>
  );
}

/* ── Predict Tab ── */
function tempLabel(t) {
  if (t <= 0.15) return { name: "Frozen", icon: Snowflake, clr: "#a0d8ef" };
  if (t <= 0.5)  return { name: "Cold", icon: Snowflake, clr: "#00f5d4" };
  if (t <= 1.0)  return { name: "Balanced", icon: Scales, clr: "#fee440" };
  if (t <= 1.5)  return { name: "Warm", icon: Flame, clr: "#fb5607" };
  return { name: "Wild", icon: Flame, clr: "#f15bb5" };
}

function PredictTab({ color, defaultPrompt }) {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [temp, setTemp] = useState(1.0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const tm = tempLabel(temp);
  const TempIcon = tm.icon;

  const predictWith = async (text) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, temperature: temp }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  const predict = () => predictWith(prompt);

  const pickWord = (token) => {
    const next = prompt + " " + token;
    setPrompt(next);
    predictWith(next);
  };

  return (
    <div>
      <div style={{
        fontFamily: "'Fredoka',sans-serif",
        fontSize: 16,
        color: "rgba(255,255,255,.55)",
        marginBottom: 14,
        lineHeight: 1.5,
      }}>
        Type a sentence and see what the AI thinks comes next — with real probabilities!
      </div>

      {/* Temperature slider */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        marginBottom: 14, padding: "10px 14px",
        background: "rgba(255,255,255,.04)", borderRadius: 12,
        border: "1px solid rgba(255,255,255,.08)",
      }}>
        <TempIcon size={20} weight="duotone" color={tm.clr} />
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 14, color: "rgba(255,255,255,.5)", whiteSpace: "nowrap" }}>
          Temp: <span style={{ color: tm.clr, fontWeight: 700 }}>{temp.toFixed(2)}</span>
        </div>
        <div style={{ flex: 1, position: "relative" }}>
          <div style={{
            position: "absolute", top: "50%", left: 0, right: 0, height: 6, borderRadius: 3,
            transform: "translateY(-50%)", pointerEvents: "none",
            background: "linear-gradient(to right,#a0d8ef 0%,#00f5d4 20%,#fee440 50%,#fb5607 75%,#f15bb5 100%)",
          }} />
          <input
            type="range" min="0.05" max="2.0" step="0.05"
            value={temp}
            onChange={e => setTemp(parseFloat(e.target.value))}
            className="temp-slider"
          />
        </div>
        <div style={{
          fontFamily: "'Fredoka',sans-serif", fontSize: 12,
          padding: "3px 10px", borderRadius: 12,
          background: `${tm.clr}20`, border: `1px solid ${tm.clr}50`,
          color: tm.clr, whiteSpace: "nowrap",
        }}>
          {tm.name}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <input
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === "Enter" && predict()}
          placeholder="Type a sentence..."
          style={{
            flex: 1,
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 18,
            padding: "12px 16px",
            borderRadius: 12,
            border: `2px solid ${color}40`,
            background: "rgba(255,255,255,.06)",
            color: "white",
            outline: "none",
          }}
        />
        <button
          onClick={predict}
          disabled={loading || !prompt.trim()}
          className="cta-btn"
          style={{ background: color, color: "#000", fontSize: 16, padding: "12px 22px" }}
        >
          {loading ? <Spinner size={18} className="spin" /> : <>Predict <ArrowRight size={16} weight="bold" /></>}
        </button>
      </div>

      {result?.error && (
        <div style={{ color: "#f15bb5", fontSize: 14, marginBottom: 12 }}>Error: {result.error}</div>
      )}

      {result?.candidates && (
        <Card>
          <div style={{
            fontSize: 12, fontFamily: "'Fredoka',sans-serif", letterSpacing: 2,
            color: "rgba(255,255,255,.35)", textTransform: "uppercase", marginBottom: 12,
          }}>
            Real AI predictions:
          </div>
          {result.candidates.map((c, i) => {
            const isTop = i === 0;
            return (
              <div key={i} onClick={() => !loading && pickWord(c.token)} style={{
                display: "flex", alignItems: "center", gap: 12, marginBottom: 8,
                animation: `fadeUp .3s ${i * 0.05}s ease both`,
                cursor: "pointer", borderRadius: 8, padding: "4px 6px", margin: "0 -6px",
                transition: "background .15s ease",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{
                  width: 90, fontFamily: "'Fredoka',sans-serif", fontSize: 17,
                  color: isTop ? color : "rgba(255,255,255,.5)", flexShrink: 0,
                  display: "flex", alignItems: "center", gap: 5, fontWeight: isTop ? 700 : 400,
                }}>
                  {isTop && <Star size={14} weight="fill" color={color} />}
                  {c.token}
                </div>
                <div style={{ flex: 1, height: 10, background: "rgba(255,255,255,.06)", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${c.pct}%`, borderRadius: 5,
                    background: isTop ? color : "rgba(255,255,255,.18)",
                    transition: "width .35s ease",
                  }} />
                </div>
                <div style={{ width: 50, textAlign: "right", fontSize: 15, color: isTop ? color : "rgba(255,255,255,.4)", fontWeight: isTop ? 700 : 400, flexShrink: 0 }}>
                  {c.pct}%
                </div>
              </div>
            );
          })}
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 16, marginTop: 14,
            color: "rgba(255,255,255,.7)",
          }}>
            "{prompt} <span style={{ color, fontWeight: 700 }}>{result.chosen}</span>"
          </div>
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 13,
            color: "rgba(255,255,255,.3)", marginTop: 8, fontStyle: "italic",
          }}>
            Click any word above to add it and predict the next one!
          </div>
        </Card>
      )}
    </div>
  );
}

/* ── Embed Tab ── */
function EmbedTab({ color, embedPresets }) {
  const DEFAULT_WORDS = embedPresets[0].words;
  const [input, setInput] = useState(DEFAULT_WORDS.join(", "));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const embed = async () => {
    const words = input.split(",").map(w => w.trim()).filter(Boolean);
    if (words.length < 2) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  // Color palette for word dots
  const dotColors = ["#00f5d4", "#00bbf9", "#fee440", "#f15bb5", "#9b5de5", "#fb5607", "#06d6a0", "#ff6b6b", "#4ecdc4", "#ffe66d", "#a8e6cf", "#ff8a5c"];

  return (
    <div>
      <div style={{
        fontFamily: "'Fredoka',sans-serif",
        fontSize: 16,
        color: "rgba(255,255,255,.55)",
        marginBottom: 14,
        lineHeight: 1.5,
      }}>
        Enter words separated by commas — or pick a category to get started!
      </div>

      {/* Preset buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {embedPresets.map(p => (
          <button
            key={p.label}
            onClick={() => { setInput(p.words.join(", ")); setResult(null); }}
            className="ghost-btn"
            style={{
              fontSize: 13,
              padding: "6px 14px",
              borderColor: input === p.words.join(", ") ? `${color}60` : undefined,
              color: input === p.words.join(", ") ? color : undefined,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && embed()}
          placeholder="cat, dog, fish, car..."
          style={{
            flex: 1,
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 16,
            padding: "12px 16px",
            borderRadius: 12,
            border: `2px solid ${color}40`,
            background: "rgba(255,255,255,.06)",
            color: "white",
            outline: "none",
          }}
        />
        <button
          onClick={embed}
          disabled={loading}
          className="cta-btn"
          style={{ background: color, color: "#000", fontSize: 16, padding: "12px 22px" }}
        >
          {loading ? <Spinner size={18} className="spin" /> : <>Map It <MagnifyingGlass size={16} weight="bold" /></>}
        </button>
      </div>

      {result?.error && (
        <div style={{ color: "#f15bb5", fontSize: 14, marginBottom: 12 }}>Error: {result.error}</div>
      )}

      {result?.words && (
        <Card style={{ position: "relative", height: 320, overflow: "hidden" }}>
          <div style={{
            fontSize: 11, fontFamily: "'Fredoka',sans-serif",
            color: "rgba(255,255,255,.25)", marginBottom: 8,
          }}>
            {result.dimensions}-dimensional embeddings → reduced to 2D
          </div>
          {result.words.map((w, i) => (
            <div
              key={w.word}
              style={{
                position: "absolute",
                left: `${w.x}%`,
                top: `${w.y * 0.85 + 12}%`,
                transform: "translate(-50%, -50%)",
                animation: `popIn .4s ${i * 0.05}s cubic-bezier(.34,1.56,.64,1) both`,
              }}
            >
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: dotColors[i % dotColors.length],
                boxShadow: `0 0 8px ${dotColors[i % dotColors.length]}60`,
                margin: "0 auto 3px",
              }} />
              <div style={{
                fontFamily: "'Fredoka',sans-serif",
                fontSize: 13,
                color: dotColors[i % dotColors.length],
                textAlign: "center",
                whiteSpace: "nowrap",
                textShadow: "0 0 8px rgba(0,0,0,.8)",
              }}>
                {w.word}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

/* ── Generate Tab ── */
function GenerateTab({ color }) {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const outputRef = useRef(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setOutput("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, temperature: 0.8 }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (data.token) {
              setOutput(prev => prev + data.token);
            }
            if (data.error) {
              setOutput(data.error);
              break;
            }
            if (data.done) break;
          }
        }
      }
    } catch (err) {
      setOutput(prev => prev + `\n[Error: ${err.message}]`);
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{
        fontFamily: "'Fredoka',sans-serif",
        fontSize: 16,
        color: "rgba(255,255,255,.55)",
        marginBottom: 14,
        lineHeight: 1.5,
      }}>
        Give the AI a prompt and watch it write — one word at a time!
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <input
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          placeholder="Write a short story about..."
          style={{
            flex: 1,
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 16,
            padding: "12px 16px",
            borderRadius: 12,
            border: `2px solid ${color}40`,
            background: "rgba(255,255,255,.06)",
            color: "white",
            outline: "none",
          }}
        />
        <button
          onClick={generate}
          disabled={loading || !prompt.trim()}
          className="cta-btn"
          style={{ background: color, color: "#000", fontSize: 16, padding: "12px 22px" }}
        >
          {loading ? <Spinner size={18} className="spin" /> : <>Write <PencilSimple size={16} weight="bold" /></>}
        </button>
      </div>

      {output && (
        <Card>
          <div style={{
            fontSize: 12, fontFamily: "'Fredoka',sans-serif", letterSpacing: 2,
            color: "rgba(255,255,255,.35)", textTransform: "uppercase", marginBottom: 10,
          }}>
            AI output:
          </div>
          <div
            ref={outputRef}
            style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 20,
              color: "rgba(255,255,255,.85)",
              lineHeight: 1.6,
              minHeight: 60,
            }}
          >
            {output}
            {loading && (
              <span style={{
                display: "inline-block",
                width: 8, height: 20,
                background: color,
                marginLeft: 2,
                animation: "dialSpin .6s ease-in-out infinite",
                verticalAlign: "middle",
                borderRadius: 2,
              }} />
            )}
          </div>
          {!loading && output && (
            <button
              onClick={() => { setOutput(""); }}
              className="ghost-btn"
              style={{ marginTop: 12, fontSize: 14, padding: "8px 16px" }}
            >
              <ArrowCounterClockwise size={14} weight="bold" /> Clear
            </button>
          )}
        </Card>
      )}
    </div>
  );
}

/* ── Tokenize Tab ── */
const CHIP_COLORS = ["#00f5d4", "#00bbf9", "#fee440", "#f15bb5", "#9b5de5", "#fb5607", "#06d6a0", "#ff6b6b"];

function TokenizeTab({ color }) {
  const [input, setInput] = useState("Unbelievable! The cat sat on the mat.");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const tokenize = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/tokenize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  const presets = [
    "Unbelievable! The cat sat on the mat.",
    "The quick brown fox jumps over the lazy dog.",
    "Supercalifragilisticexpialidocious",
    "AI is really really really cool!!!",
    "🎉 Hello World! 🌍",
  ];

  return (
    <div>
      <div style={{
        fontFamily: "'Fredoka',sans-serif",
        fontSize: 16,
        color: "rgba(255,255,255,.55)",
        marginBottom: 14,
        lineHeight: 1.5,
      }}>
        Type any text and see exactly how AI splits it into tokens — the actual pieces it processes!
      </div>

      {/* Preset buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {presets.map((p, i) => (
          <button
            key={i}
            onClick={() => { setInput(p); setResult(null); }}
            className="ghost-btn"
            style={{
              fontSize: 12,
              padding: "5px 12px",
              borderColor: input === p ? `${color}60` : undefined,
              color: input === p ? color : undefined,
            }}
          >
            {p.length > 25 ? p.slice(0, 25) + "…" : p}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && tokenize()}
          placeholder="Type anything..."
          style={{
            flex: 1,
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 16,
            padding: "12px 16px",
            borderRadius: 12,
            border: `2px solid ${color}40`,
            background: "rgba(255,255,255,.06)",
            color: "white",
            outline: "none",
          }}
        />
        <button
          onClick={tokenize}
          disabled={loading || !input.trim()}
          className="cta-btn"
          style={{ background: color, color: "#000", fontSize: 16, padding: "12px 22px" }}
        >
          {loading ? <Spinner size={18} className="spin" /> : <>Tokenize <Scissors size={16} weight="bold" /></>}
        </button>
      </div>

      {result?.error && (
        <div style={{ color: "#f15bb5", fontSize: 14, marginBottom: 12 }}>Error: {result.error}</div>
      )}

      {result?.tokens && (
        <Card>
          {/* Stats bar */}
          <div style={{
            display: "flex", gap: 20, marginBottom: 16,
            fontSize: 14, fontFamily: "'Fredoka',sans-serif",
          }}>
            <div style={{ color: "rgba(255,255,255,.4)" }}>
              Characters: <span style={{ color: "white", fontWeight: 700 }}>{result.charCount}</span>
            </div>
            <div style={{ color: "rgba(255,255,255,.4)" }}>
              Tokens: <span style={{ color, fontWeight: 700 }}>{result.count}</span>
            </div>
            <div style={{ color: "rgba(255,255,255,.4)" }}>
              Ratio: <span style={{ color: "rgba(255,255,255,.7)", fontWeight: 600 }}>
                {(result.charCount / result.count).toFixed(1)} chars/token
              </span>
            </div>
          </div>

          {/* Token chips */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16,
          }}>
            {result.tokens.map((t, i) => {
              const chipColor = CHIP_COLORS[i % CHIP_COLORS.length];
              // Show spaces visually
              const display = t.text.replace(/ /g, "⎵").replace(/\n/g, "↵");
              return (
                <div key={i} style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  animation: `popIn .3s ${i * 0.03}s ease both`,
                }}>
                  <div style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 16, fontWeight: 600,
                    padding: "6px 12px",
                    borderRadius: 10,
                    background: `${chipColor}18`,
                    border: `2px solid ${chipColor}60`,
                    color: "white",
                    whiteSpace: "pre",
                  }}>
                    {display}
                  </div>
                  <div style={{
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontSize: 10,
                    color: `${chipColor}88`,
                    marginTop: 3,
                  }}>
                    {t.id}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Original text with token boundaries highlighted */}
          <div style={{
            fontSize: 12, fontFamily: "'Fredoka',sans-serif", letterSpacing: 2,
            color: "rgba(255,255,255,.35)", textTransform: "uppercase", marginBottom: 8,
          }}>
            Token boundaries:
          </div>
          <div style={{
            fontFamily: "'Fredoka',sans-serif",
            fontSize: 18,
            lineHeight: 1.6,
            color: "rgba(255,255,255,.85)",
          }}>
            {result.tokens.map((t, i) => (
              <span key={i} style={{
                borderBottom: `2px solid ${CHIP_COLORS[i % CHIP_COLORS.length]}60`,
                paddingBottom: 2,
                marginRight: 0,
              }}>
                {t.text}
              </span>
            ))}
          </div>

          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 13,
            color: "rgba(255,255,255,.3)", marginTop: 14, fontStyle: "italic",
          }}>
            These are the actual tokens GPT-4o-mini uses — the same tokenizer as ChatGPT!
          </div>
        </Card>
      )}
    </div>
  );
}

/* ── Main Section ── */
export default function SectionTryIt({ color, mode, slide }) {
  const grade = useGrade();
  const tryItContent = GRADE_EXAMPLES[grade].tryIt;
  const [tab, setTab] = useState("predict");

  if (mode === "presentation") {
    if (slide === 0) {
      return (
        <PresSlide>
          <PresText color={color} size={48}>Try It Yourself!</PresText>
          <PresText size={26} color="rgba(255,255,255,.55)">
            Now let's use <span style={{ color: "white" }}>real AI</span> — predict words, tokenize text, explore embeddings, and generate.
          </PresText>
        </PresSlide>
      );
    }
    // Slide 1: interactive playground (all three tabs)
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", width: "100%" }}>
      {/* Tab selector */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}>
        <Tab active={tab === "predict"} label="Predict" Icon={Lightning} color={color} onClick={() => setTab("predict")} />
        <Tab active={tab === "tokenize"} label="Tokenize" Icon={Scissors} color={color} onClick={() => setTab("tokenize")} />
        <Tab active={tab === "embed"} label="Word Space" Icon={MagnifyingGlass} color={color} onClick={() => setTab("embed")} />
        <Tab active={tab === "generate"} label="Generate" Icon={PencilSimple} color={color} onClick={() => setTab("generate")} />
      </div>

      {/* Active tab */}
      {tab === "predict" && <PredictTab color={color} defaultPrompt={tryItContent.defaultPrompt} />}
      {tab === "tokenize" && <TokenizeTab color={color} />}
      {tab === "embed" && <EmbedTab color={color} embedPresets={tryItContent.embedPresets} />}
      {tab === "generate" && <GenerateTab color={color} />}
    </div>
  );
}
