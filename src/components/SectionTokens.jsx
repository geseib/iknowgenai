import { useState, useEffect } from "react";
import { PresSlide, PresText } from "./shared";

/* ── Simple token lookup ─────────────────────────────────────────────── */
const TOKEN_MAP = {
  "unbelievable": ["Un", "believ", "able"],
  "basketball": ["basket", "ball"],
  "incredible": ["In", "cred", "ible"],
  "understanding": ["under", "stand", "ing"],
  "hamburger": ["ham", "burger"],
  "butterfly": ["butter", "fly"],
  "homework": ["home", "work"],
  "sunflower": ["sun", "flower"],
  "playground": ["play", "ground"],
  "strawberry": ["straw", "berry"],
  "sometimes": ["some", "times"],
  "unhelpful": ["Un", "help", "ful"],
  "teacher": ["teach", "er"],
  "running": ["run", "ning"],
  "beautiful": ["beauti", "ful"],
  "impossible": ["im", "possible"],
  "computer": ["com", "put", "er"],
  "elephant": ["ele", "phant"],
  "happiness": ["hap", "pi", "ness"],
  "everything": ["every", "thing"],
};

function tokenize(word) {
  const lower = word.toLowerCase().trim();
  if (TOKEN_MAP[lower]) return TOKEN_MAP[lower];
  // Fallback: split into 3-char chunks
  const chunks = [];
  for (let i = 0; i < word.length; i += 3) {
    chunks.push(word.slice(i, i + 3));
  }
  return chunks.length > 0 ? chunks : [word];
}

const CHIP_COLORS = ["#00f5d4", "#fee440", "#f15bb5", "#9b5de5", "#00bbf9", "#fb5607"];

/* ── Main Section ────────────────────────────────────────────────────── */
export default function SectionTokens({ color, mode, slide }) {
  const [exploded, setExploded] = useState(false);
  const [split, setSplit] = useState(false);
  const [userWord, setUserWord] = useState("");

  // Slide 2: auto-explode after delay
  useEffect(() => {
    if (slide === 2) {
      setExploded(false);
      const timer = setTimeout(() => setExploded(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [slide]);

  // Slide 4: auto-split after delay
  useEffect(() => {
    if (slide === 4) {
      setSplit(false);
      const timer = setTimeout(() => setSplit(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [slide]);

  if (mode !== "presentation") return null;

  // Slide 0: Hook
  if (slide === 0) return (
    <PresSlide>
      <PresText size={36} color="rgba(255,255,255,.5)">
        You think in words.
      </PresText>
      <PresText size={36} color="rgba(255,255,255,.5)">
        AI thinks in...
      </PresText>
      <div className="wow-reveal" style={{
        fontFamily: "'Fredoka',sans-serif", fontSize: 72, fontWeight: 700,
        color, lineHeight: 1.1,
      }}>
        TOKENS
      </div>
      <PresText size={24} color="rgba(255,255,255,.35)">
        Not quite words. Not quite letters. Something in between.
      </PresText>
    </PresSlide>
  );

  // Slide 1: Vocab size spectrum
  if (slide === 1) {
    const markers = [
      { pos: 5, label: "95", desc: "Individual characters", delay: 0 },
      { pos: 50, label: "50,000", desc: "Sweet spot ✓", delay: 0.15 },
      { pos: 95, label: "1,000,000+", desc: "Every word ever", delay: 0.3 },
    ];
    return (
      <PresSlide>
        <PresText size={32} color="rgba(255,255,255,.6)">
          How big should AI's vocabulary be?
        </PresText>
        <div style={{ maxWidth: 750, width: "100%", padding: "0 20px" }}>
          {/* Line */}
          <div style={{
            height: 6, borderRadius: 3, width: "100%",
            background: "rgba(255,255,255,.1)", position: "relative",
            margin: "60px 0 40px",
          }}>
            <div style={{
              height: "100%", borderRadius: 3, width: "50%",
              background: `linear-gradient(90deg, rgba(255,255,255,.1), ${color})`,
            }} />
            {markers.map((m, i) => (
              <div key={i} style={{
                position: "absolute", left: `${m.pos}%`, top: -50,
                transform: "translateX(-50%)",
                textAlign: "center",
                animation: `fadeUp .5s ${m.delay}s ease both`,
              }}>
                <div style={{
                  fontFamily: "'Fredoka',sans-serif", fontSize: 28, fontWeight: 700,
                  color: i === 1 ? color : "rgba(255,255,255,.6)",
                }}>
                  {m.label}
                </div>
                <div style={{
                  fontSize: 14, color: "rgba(255,255,255,.35)", marginTop: 4,
                }}>
                  {m.desc}
                </div>
                <div style={{
                  width: 3, height: 20, background: i === 1 ? color : "rgba(255,255,255,.2)",
                  margin: "8px auto 0", borderRadius: 2,
                }} />
              </div>
            ))}
          </div>
        </div>
        <PresText size={22} color="rgba(255,255,255,.35)">
          Too few → too many pieces. Too many → too much to learn. Let's see why.
        </PresText>
      </PresSlide>
    );
  }

  // Slide 2: At 95 — characters explode
  if (slide === 2) {
    const chars = "The cat sat".split("");
    return (
      <PresSlide>
        <PresText size={28} color="rgba(255,255,255,.45)">
          With only 95 tokens (individual characters)...
        </PresText>
        <div style={{
          display: "flex", gap: exploded ? 10 : 0, justifyContent: "center",
          flexWrap: "wrap", transition: "gap .6s ease",
        }}>
          {chars.map((ch, i) => (
            <div key={i} style={{
              fontFamily: "'Fredoka',sans-serif", fontSize: exploded ? 40 : 48,
              fontWeight: 700, color: "white",
              padding: exploded ? "8px 12px" : "0",
              borderRadius: exploded ? 12 : 0,
              background: exploded ? `${CHIP_COLORS[i % CHIP_COLORS.length]}20` : "transparent",
              border: exploded ? `2px solid ${CHIP_COLORS[i % CHIP_COLORS.length]}60` : "2px solid transparent",
              animation: exploded ? `popIn .3s ${i * 0.05}s ease both` : "none",
              transition: "all .4s ease",
              minWidth: ch === " " ? (exploded ? 20 : 14) : undefined,
            }}>
              {ch === " " ? (exploded ? "⎵" : " ") : ch}
            </div>
          ))}
        </div>
        <PresText size={24} color={color}>
          {exploded ? '11 tokens for just three words! Way too many pieces.' : 'Watch what happens...'}
        </PresText>
      </PresSlide>
    );
  }

  // Slide 3: At 1M+ — overwhelming
  if (slide === 3) return (
    <PresSlide>
      <PresText size={28} color="rgba(255,255,255,.45)">
        With 1,000,000+ tokens (every word is its own token)...
      </PresText>
      <div style={{
        display: "flex", gap: 12, justifyContent: "center",
      }}>
        {["The", "cat", "sat"].map((w, i) => (
          <div key={i} style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 36, fontWeight: 700,
            color: "white", padding: "10px 24px", borderRadius: 14,
            background: `${color}15`, border: `2px solid ${color}50`,
            animation: `popIn .4s ${i * 0.1}s ease both`,
          }}>
            {w}
          </div>
        ))}
      </div>
      <PresText size={22} color="rgba(255,255,255,.4)">
        Only 3 tokens! But the AI needs to memorize...
      </PresText>
      {/* Overwhelming grid */}
      <div style={{
        maxWidth: 700, width: "100%", padding: "16px",
        borderRadius: 16, background: "rgba(255,255,255,.03)",
        border: "1px solid rgba(255,255,255,.08)",
        maxHeight: 180, overflow: "hidden", position: "relative",
        perspective: "600px",
      }}>
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center",
          transform: "rotateX(12deg)", transformOrigin: "top center",
          fontSize: 11, color: "rgba(255,255,255,.15)", fontFamily: "monospace",
          lineHeight: 1.8,
        }}>
          {Array.from({ length: 200 }, (_, i) =>
            ["aardvark","abandon","abbey","abbot","abbreviate","abdomen","abide","ability","ablaze","able","aboard","abolish","about","above","abroad","abrupt","absence","absorb","abstract","absurd","abuse","academy","accept","access","account","accuse","achieve","acid","acoustic","acquire","across","act","action","actor","actual","adapt","add","addict","address","adjust","admit","adopt","adult","advance","advice","afford","afraid","again","age","agent","agree","ahead","aim","air","airport","aisle","alarm","album","alcohol","alert","alien","all","alley","allow","almost","alone"][i % 64]
          ).join(" ")}
        </div>
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
          background: "linear-gradient(transparent, rgba(5,5,18,1))",
        }} />
      </div>
      <PresText size={24} color={color}>
        Over a million unique entries. That's too much to learn well!
      </PresText>
    </PresSlide>
  );

  // Slide 4: Sweet spot 50K — snap split
  if (slide === 4) {
    const chunks = ["Un", "believ", "able"];
    return (
      <PresSlide>
        <PresText size={28} color="rgba(255,255,255,.45)">
          The sweet spot: ~50,000 tokens
        </PresText>
        <div style={{
          display: "flex", gap: split ? 16 : 0, justifyContent: "center",
          alignItems: "center", transition: "gap .5s ease",
        }}>
          {split ? chunks.map((chunk, i) => (
            <div key={i} style={{
              fontFamily: "'Fredoka',sans-serif", fontSize: 44, fontWeight: 700,
              color: "white", padding: "12px 24px", borderRadius: 14,
              background: `${CHIP_COLORS[i]}20`,
              border: `3px solid ${CHIP_COLORS[i]}`,
              animation: `snapSplit .4s ${i * 0.1}s ease both`,
            }}>
              {chunk}
            </div>
          )) : (
            <div style={{
              fontFamily: "'Fredoka',sans-serif", fontSize: 52, fontWeight: 700,
              color: "white",
            }}>
              Unbelievable
            </div>
          )}
        </div>
        {split && (
          <div className="fade-up">
            <PresText size={26} color={color}>
              3 reusable pieces — each one shows up in other words too!
            </PresText>
            <PresText size={20} color="rgba(255,255,255,.35)">
              "Un" → unfair, undo, unlock &nbsp;&nbsp;|&nbsp;&nbsp; "able" → capable, available, comfortable
            </PresText>
          </div>
        )}
      </PresSlide>
    );
  }

  // Slide 5: Interactive — type a word, see it tokenized
  if (slide === 5) {
    const chunks = userWord.trim() ? tokenize(userWord) : [];
    return (
      <PresSlide>
        <PresText size={32} color="rgba(255,255,255,.6)">
          Try it! Type a word to see its tokens:
        </PresText>
        <input
          type="text"
          value={userWord}
          onChange={e => setUserWord(e.target.value)}
          placeholder="Type a word..."
          autoFocus
          style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: 36, fontWeight: 600,
            padding: "14px 28px", borderRadius: 16,
            background: "rgba(255,255,255,.08)", border: `2px solid ${color}50`,
            color: "white", textAlign: "center", outline: "none",
            width: "100%", maxWidth: 500,
          }}
        />
        {chunks.length > 0 && (
          <div style={{
            display: "flex", gap: 12, justifyContent: "center",
            flexWrap: "wrap", animation: "fadeUp .3s ease",
          }}>
            {chunks.map((chunk, i) => (
              <div key={`${userWord}-${i}`} style={{
                fontFamily: "'Fredoka',sans-serif", fontSize: 32, fontWeight: 700,
                color: "white", padding: "10px 22px", borderRadius: 14,
                background: `${CHIP_COLORS[i % CHIP_COLORS.length]}20`,
                border: `3px solid ${CHIP_COLORS[i % CHIP_COLORS.length]}`,
                animation: `popIn .3s ${i * 0.08}s ease both`,
              }}>
                {chunk}
              </div>
            ))}
          </div>
        )}
        {chunks.length > 0 && (
          <PresText size={20} color="rgba(255,255,255,.35)">
            {chunks.length} token{chunks.length !== 1 ? "s" : ""} — each one is a number the AI processes
          </PresText>
        )}
        <PresText size={16} color="rgba(255,255,255,.2)">
          Try: unbelievable, basketball, homework, butterfly, impossible
        </PresText>
      </PresSlide>
    );
  }

  // Slide 6: Stadium visual — 50,000 choices
  if (slide === 6) return (
    <PresSlide>
      <PresText size={32} color="rgba(255,255,255,.6)">
        50,000 tokens means...
      </PresText>
      <PresText size={40} color={color}>
        One student in a packed stadium
      </PresText>
      {/* Stadium visual */}
      <div style={{
        width: 320, height: 320, borderRadius: "50%",
        background: "rgba(255,255,255,.03)", border: "2px solid rgba(255,255,255,.1)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Crowd dots */}
        {Array.from({ length: 300 }, (_, i) => {
          const angle = (i / 300) * Math.PI * 2;
          const r = 30 + (i % 7) * 18 + Math.sin(i * 0.7) * 10;
          const x = 160 + Math.cos(angle) * r;
          const y = 160 + Math.sin(angle) * r;
          return (
            <div key={i} style={{
              position: "absolute", left: x, top: y,
              width: 4, height: 4, borderRadius: "50%",
              background: "rgba(255,255,255,.12)",
            }} />
          );
        })}
        {/* Highlighted dot */}
        <div style={{
          position: "absolute", left: 158, top: 90,
          width: 10, height: 10, borderRadius: "50%",
          background: color,
          boxShadow: `0 0 12px ${color}, 0 0 24px ${color}80`,
          animation: "dialPulse 1.6s ease-out infinite",
        }} />
        <div style={{
          position: "absolute", left: 130, top: 60,
          fontFamily: "'Fredoka',sans-serif", fontSize: 14, fontWeight: 600,
          color, whiteSpace: "nowrap",
        }}>
          ← This one!
        </div>
      </div>
      <PresText size={24} color="rgba(255,255,255,.45)">
        For every single position in a sentence, AI chooses from all 50,000 tokens.
      </PresText>
    </PresSlide>
  );

  return null;
}
