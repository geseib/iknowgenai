import { useState, useRef, useCallback } from "react";
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
  Lightbulb,
  Funnel,
} from "@phosphor-icons/react";
import { Card, PresSlide, PresText } from "./shared";
import { useGrade } from "../data/GradeContext";
import { GRADE_EXAMPLES } from "../data/gradeContent";

/* ── Did You Know facts (per tab) ────────────────────────────────────── */
const PREDICT_FACTS = [
  "AI doesn't actually \"know\" the answer — it ranks every word in its vocabulary and picks the most likely one, just like you saw!",
  "At temperature 0, the AI always picks the #1 word. That's why low-temperature answers sound robotic — there's no surprise.",
  "The AI considers about 50,000 possible next tokens for every single position in a sentence. You just saw the top few!",
  "ChatGPT generates its answers one token at a time — the same predict-and-pick process you're using right now.",
  "When you click a word to continue, you're doing exactly what the AI does: pick one word, then predict the next one. Over and over.",
  "The AI doesn't read your sentence like you do — it processes all the words at once using attention, then predicts the next one.",
  "Higher temperature doesn't make the AI \"smarter\" — it just makes it more willing to pick lower-ranked words, which can seem creative or weird.",
  "The probabilities you see add up to 100%. The AI always has to pick something — even if nothing fits perfectly.",
  "Real AI models run through 96 layers of attention and thinking before producing each prediction you see here.",
  "The word the AI picks becomes part of the input for the next prediction — that's why AI can write whole paragraphs, one word at a time.",
];

const TOKENIZE_FACTS = [
  "The word \"the\" is so common it gets its own single token, but rare words like \"quintessential\" get split into pieces.",
  "Spaces count! In most tokenizers, the space before a word is part of the token — \" cat\" and \"cat\" are different tokens.",
  "Emojis often take 2-3 tokens each because they weren't common in the training data. Try typing a few to see!",
  "GPT-4o's tokenizer has about 200,000 tokens in its vocabulary — that's roughly 6x more words than the average adult knows.",
  "The same sentence in English and Japanese will use very different numbers of tokens — some languages are more \"token-efficient\" than others.",
  "Numbers are tricky for tokenizers! \"123\" might be one token, but \"12345\" could be split into \"123\" + \"45\".",
  "The tokenizer was trained on text from the internet, so common English words tend to be single tokens while rare words get split up.",
  "Every token has a unique ID number — that number is what the AI actually processes, not the letters you see.",
  "A typical English word averages about 4 characters per token. If your ratio is higher, your text has lots of short, common words!",
  "Punctuation like \"!\" and \".\" are usually their own tokens. That's why AI can learn that \"!\" means excitement.",
];

const EMBED_FACTS = [
  "The 2D plot you see squishes 1,536 dimensions down to just 2 — imagine flattening a globe into a map. Lots of detail gets lost!",
  "AI discovered that \"king\" minus \"man\" plus \"woman\" equals \"queen\" — just from reading text, nobody programmed that relationship.",
  "Words that appear in similar sentences end up close together in embedding space — that's how the AI learns meaning without a dictionary.",
  "The embedding model maps every word to a point in 1,536-dimensional space — way more than the 3 dimensions we can see.",
  "Similar words cluster together because they were used in similar contexts during training — the AI learned meaning from patterns, not definitions.",
  "Even misspelled words get embeddings! The AI has seen enough typos to roughly understand what you meant.",
  "Embeddings capture surprising connections: \"doctor\" and \"hospital\" are close together even though they're totally different types of words.",
  "The distance between words in embedding space is measured using cosine similarity — basically how much two arrows point in the same direction.",
  "These embeddings are what allow AI to understand that \"happy\" and \"joyful\" mean similar things even though they share no letters.",
  "Every one of the ~50,000 tokens in the AI's vocabulary has its own unique set of 1,536 coordinates — like a GPS position for meaning.",
];

const GENERATE_FACTS = [
  "Everything you see streaming in was generated one token at a time — the AI has no plan for the full sentence before it starts writing.",
  "The AI doesn't actually understand what it writes — it's predicting the most likely next token based on patterns from its training data.",
  "If you give the same prompt twice, you might get different answers! That's because temperature adds a bit of randomness to each pick.",
  "The AI was trained on hundreds of billions of words — roughly the equivalent of reading every book in 1,000 libraries.",
  "AI writes about 50-100 tokens per second. A human types about 40 words per minute. AI is roughly 100x faster at producing text!",
  "The AI doesn't \"think\" and then \"write\" — the writing IS the thinking. Each token choice is shaped by all 96 layers of processing.",
  "AI can write in many styles because it trained on everything from Shakespeare to Reddit comments to scientific papers.",
  "When AI writes something that seems creative, it's actually remixing patterns it saw in training — like a DJ mixing familiar songs into something new.",
  "The AI doesn't remember your previous conversations — each session starts fresh. It's predicting, not recalling.",
  "Real AI companies use human feedback (RLHF) to teach models to write helpfully and safely — exactly like the rating game from earlier!",
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ── Did You Know component ──────────────────────────────────────────── */
function DidYouKnow({ fact, color }) {
  return (
    <div className="fade-up" style={{
      display: "flex", gap: 12, alignItems: "flex-start",
      padding: "12px 16px", marginTop: 14,
      borderRadius: 12,
      background: `${color}08`,
      border: `1px solid ${color}25`,
    }}>
      <Lightbulb size={20} weight="duotone" color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{
        fontFamily: "'Fredoka',sans-serif",
        fontSize: 14,
        color: "rgba(255,255,255,.6)",
        lineHeight: 1.55,
      }}>
        <span style={{ color, fontWeight: 700 }}>Did you know? </span>
        {fact}
      </div>
    </div>
  );
}

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
  const [topP, setTopP] = useState(0.9);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [fact, setFact] = useState("");

  const tm = tempLabel(temp);
  const TempIcon = tm.icon;

  const predictWith = async (text) => {
    setLoading(true);
    setResult(null);
    setBlocked(false);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, temperature: temp }),
      });
      const data = await res.json();
      if (data.blocked) {
        setBlocked(true);
        setResult(null);
        setPrompt(defaultPrompt);
        setLoading(false);
        return;
      }
      if (data.error) throw new Error(data.error);
      setResult(data);
      setFact(pickRandom(PREDICT_FACTS));
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
        marginBottom: 8, padding: "10px 14px",
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

      {/* Top-p slider */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        marginBottom: 14, padding: "10px 14px",
        background: "rgba(255,255,255,.04)", borderRadius: 12,
        border: "1px solid rgba(255,255,255,.08)",
      }}>
        <Funnel size={20} weight="duotone" color={topP >= 0.95 ? "rgba(255,255,255,.35)" : "#00bbf9"} />
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 14, color: "rgba(255,255,255,.5)", whiteSpace: "nowrap" }}>
          Top-p: <span style={{ color: topP >= 0.95 ? "rgba(255,255,255,.6)" : "#00bbf9", fontWeight: 700 }}>{topP.toFixed(2)}</span>
        </div>
        <div style={{ flex: 1, position: "relative" }}>
          <div style={{
            position: "absolute", top: "50%", left: 0, right: 0, height: 6, borderRadius: 3,
            transform: "translateY(-50%)", pointerEvents: "none",
            background: "linear-gradient(to right, #00bbf9 0%, #00bbf9 60%, rgba(255,255,255,.15) 100%)",
          }} />
          <input
            type="range" min="0.1" max="1.0" step="0.05"
            value={topP}
            onChange={e => setTopP(parseFloat(e.target.value))}
            className="temp-slider"
          />
        </div>
        <div style={{
          fontFamily: "'Fredoka',sans-serif", fontSize: 12,
          padding: "3px 10px", borderRadius: 12,
          background: topP >= 0.95 ? "rgba(255,255,255,.06)" : "#00bbf920",
          border: `1px solid ${topP >= 0.95 ? "rgba(255,255,255,.12)" : "#00bbf950"}`,
          color: topP >= 0.95 ? "rgba(255,255,255,.4)" : "#00bbf9",
          whiteSpace: "nowrap",
        }}>
          {topP >= 0.95 ? "Off" : topP <= 0.3 ? "Tight" : topP <= 0.6 ? "Focused" : "Normal"}
        </div>
      </div>

      {/* Explanation of what these controls do */}
      <div style={{
        fontFamily: "'Fredoka',sans-serif", fontSize: 13,
        color: "rgba(255,255,255,.3)", lineHeight: 1.5,
        marginBottom: 14, padding: "0 4px",
      }}>
        <strong style={{ color: "rgba(255,255,255,.45)" }}>Temperature</strong> reshuffles how likely each word is.{" "}
        <strong style={{ color: "rgba(255,255,255,.45)" }}>Top-p</strong> filters: add up probabilities from most to least likely — once the total reaches your threshold, everything else is cut off.{" "}
        {topP < 0.95 && <>At <span style={{ color: "#00bbf9" }}>{(topP * 100).toFixed(0)}%</span>, the AI only picks from words that together make up {(topP * 100).toFixed(0)}% of the probability.</>}
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

      {blocked && <BlockedBanner />}

      {result?.candidates && (() => {
        // Compute cumulative probabilities and top-p cutoff
        const topPPct = topP * 100;
        let cumulative = 0;
        const enriched = result.candidates.map((c, i) => {
          cumulative += c.pct;
          // A candidate is "in" if the cumulative total BEFORE adding it was still below the threshold,
          // OR it's the very first candidate (always included)
          const cumulativeBefore = cumulative - c.pct;
          const included = cumulativeBefore < topPPct || i === 0;
          return { ...c, cumulative: Math.round(cumulative * 10) / 10, included };
        });
        // Find the index where the cutoff line should appear
        const lastIncludedIdx = enriched.reduce((last, e, i) => e.included ? i : last, 0);
        const showCutoff = topP < 0.95 && lastIncludedIdx < enriched.length - 1;

        return (
        <Card>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 12,
          }}>
            <div style={{
              fontSize: 12, fontFamily: "'Fredoka',sans-serif", letterSpacing: 2,
              color: "rgba(255,255,255,.35)", textTransform: "uppercase",
            }}>
              Real AI predictions:
            </div>
            {topP < 0.95 && (
              <div style={{
                fontSize: 12, fontFamily: "'Fredoka',sans-serif",
                color: "#00bbf9", fontWeight: 600,
              }}>
                top-p keeps {enriched.filter(e => e.included).length} of {enriched.length} words
              </div>
            )}
          </div>
          {enriched.map((c, i) => {
            const isChosen = c.token === result.chosen;
            const dimmed = !c.included && topP < 0.95;
            return (
              <div key={i}>
                {/* Cutoff divider line */}
                {showCutoff && i === lastIncludedIdx + 1 && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    margin: "6px 0 8px",
                    animation: "fadeUp .3s ease both",
                  }}>
                    <div style={{ flex: 1, height: 1, background: "#00bbf940" }} />
                    <div style={{
                      fontFamily: "'Fredoka',sans-serif", fontSize: 11,
                      color: "#00bbf9", whiteSpace: "nowrap", fontWeight: 600,
                      letterSpacing: 1,
                    }}>
                      FILTERED OUT (below top-p {(topP * 100).toFixed(0)}%)
                    </div>
                    <div style={{ flex: 1, height: 1, background: "#00bbf940" }} />
                  </div>
                )}
                <div onClick={() => !loading && !dimmed && pickWord(c.token)} style={{
                  display: "flex", alignItems: "center", gap: 12, marginBottom: 8,
                  animation: `fadeUp .3s ${i * 0.05}s ease both`,
                  cursor: dimmed ? "default" : "pointer",
                  borderRadius: 8, padding: "4px 6px", margin: "0 -6px",
                  transition: "all .25s ease",
                  opacity: dimmed ? 0.28 : 1,
                  filter: dimmed ? "grayscale(0.7)" : "none",
                }}
                  onMouseEnter={e => { if (!dimmed) e.currentTarget.style.background = "rgba(255,255,255,.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{
                    width: 90, fontFamily: "'Fredoka',sans-serif", fontSize: 17,
                    color: isChosen ? color : "rgba(255,255,255,.5)", flexShrink: 0,
                    display: "flex", alignItems: "center", gap: 5, fontWeight: isChosen ? 700 : 400,
                  }}>
                    {isChosen && <Star size={14} weight="fill" color={color} />}
                    {c.token}
                  </div>
                  <div style={{ flex: 1, height: 10, background: "rgba(255,255,255,.06)", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${c.pct}%`, borderRadius: 5,
                      background: isChosen ? color : (dimmed ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.18)"),
                      transition: "width .35s ease",
                    }} />
                  </div>
                  <div style={{
                    width: 50, textAlign: "right", fontSize: 15, flexShrink: 0,
                    color: isChosen ? color : "rgba(255,255,255,.4)",
                    fontWeight: isChosen ? 700 : 400,
                  }}>
                    {c.pct}%
                  </div>
                  {/* Cumulative indicator */}
                  {topP < 0.95 && (
                    <div style={{
                      width: 48, textAlign: "right", fontSize: 11, flexShrink: 0,
                      fontFamily: "'Fredoka',sans-serif",
                      color: c.included ? "#00bbf9" : "rgba(255,255,255,.15)",
                      fontWeight: 600,
                    }}>
                      Σ{c.cumulative}%
                    </div>
                  )}
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
          {fact && <DidYouKnow fact={fact} color={color} />}
        </Card>
        );
      })()}
    </div>
  );
}

/* ── Blocked banner (shared) ──────────────────────────────────────────── */
function BlockedBanner() {
  return (
    <div className="fade-up" style={{
      padding: "14px 18px", borderRadius: 12,
      background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
      fontFamily: "'Fredoka',sans-serif", fontSize: 15,
      color: "rgba(255,255,255,.5)", textAlign: "center",
      marginBottom: 14,
    }}>
      Let's try a different topic! How about animals, sports, space, or food?
    </div>
  );
}

/* ── Embed Tab ── */
function EmbedTab({ color, embedPresets }) {
  const DEFAULT_WORDS = embedPresets[0].words;
  const [input, setInput] = useState(DEFAULT_WORDS.join(", "));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [fact, setFact] = useState("");

  const embed = async () => {
    const words = input.split(",").map(w => w.trim()).filter(Boolean);
    if (words.length < 2) return;
    setLoading(true);
    setResult(null);
    setBlocked(false);
    try {
      const res = await fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words }),
      });
      const data = await res.json();
      if (data.blocked) {
        setBlocked(true);
        setInput(DEFAULT_WORDS.join(", "));
        setLoading(false);
        return;
      }
      if (data.error) throw new Error(data.error);
      setResult(data);
      setFact(pickRandom(EMBED_FACTS));
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

      {blocked && <BlockedBanner />}

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
      {fact && result?.words && <DidYouKnow fact={fact} color={color} />}
    </div>
  );
}

/* ── Generate Tab ── */
function GenerateTab({ color }) {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [fact, setFact] = useState("");
  const outputRef = useRef(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setOutput("");
    setBlocked(false);
    setFact(pickRandom(GENERATE_FACTS));
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
            if (data.blocked) {
              setBlocked(true);
              setOutput("");
              setPrompt("");
              setFact("");
              setLoading(false);
              return;
            }
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

      {blocked && <BlockedBanner />}

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
              onClick={() => { setOutput(""); setFact(""); }}
              className="ghost-btn"
              style={{ marginTop: 12, fontSize: 14, padding: "8px 16px" }}
            >
              <ArrowCounterClockwise size={14} weight="bold" /> Clear
            </button>
          )}
          {fact && !loading && output && <DidYouKnow fact={fact} color={color} />}
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
  const [blocked, setBlocked] = useState(false);
  const [fact, setFact] = useState("");

  const tokenize = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setBlocked(false);
    try {
      const res = await fetch("/api/tokenize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      if (data.blocked) {
        setBlocked(true);
        setInput("Unbelievable! The cat sat on the mat.");
        setLoading(false);
        return;
      }
      if (data.error) throw new Error(data.error);
      setResult(data);
      setFact(pickRandom(TOKENIZE_FACTS));
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

      {blocked && <BlockedBanner />}

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
          {fact && <DidYouKnow fact={fact} color={color} />}
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
