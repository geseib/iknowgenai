import { useState, useRef } from "react";
import {
  Lightning,
  MagnifyingGlass,
  PencilSimple,
  ArrowRight,
  ArrowCounterClockwise,
  Star,
  Spinner,
  Snowflake,
  Scales,
  Flame,
} from "@phosphor-icons/react";
import { Card, PresSlide, PresText } from "./shared";

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

function PredictTab({ color }) {
  const [prompt, setPrompt] = useState("The cat sat on the");
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
                <div style={{ width: 40, textAlign: "right", fontSize: 15, color: isTop ? color : "rgba(255,255,255,.4)", fontWeight: isTop ? 700 : 400, flexShrink: 0 }}>
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
const DEFAULT_WORDS = ["cat", "dog", "fish", "car", "truck", "bicycle", "king", "queen", "pizza", "hamburger", "happy", "sad"];

function EmbedTab({ color }) {
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
        Enter words separated by commas — see where AI places them in "meaning space"!
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
            if (data.done || data.error) break;
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

/* ── Main Section ── */
export default function SectionTryIt({ color, mode, slide }) {
  const [tab, setTab] = useState("predict");

  if (mode === "presentation") {
    if (slide === 0) {
      return (
        <PresSlide>
          <PresText color={color} size={48}>Try It Yourself!</PresText>
          <PresText size={26} color="rgba(255,255,255,.55)">
            Now let's use <span style={{ color: "white" }}>real AI</span> — predict words, explore embeddings, and generate text.
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
        <Tab active={tab === "embed"} label="Word Space" Icon={MagnifyingGlass} color={color} onClick={() => setTab("embed")} />
        <Tab active={tab === "generate"} label="Generate" Icon={PencilSimple} color={color} onClick={() => setTab("generate")} />
      </div>

      {/* Active tab */}
      {tab === "predict" && <PredictTab color={color} />}
      {tab === "embed" && <EmbedTab color={color} />}
      {tab === "generate" && <GenerateTab color={color} />}
    </div>
  );
}
