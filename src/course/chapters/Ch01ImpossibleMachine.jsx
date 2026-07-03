// Chapter 1 — The Impossible Machine
// Hook: a live story generation, then the rug-pull (one word at a time,
// blind to its own ending), then the course's driving question.
import { useEffect, useMemo, useRef, useState } from "react";
import { Slide, Kicker, Heading, Lead, Prose, Card, Button, GhostButton, Mono, HonestNote, Recap, BlockedNote } from "../ui/shared.jsx";
import { FONTS, COLORS, SPACE } from "../styles/theme.js";
import { generateStream, annotateStory } from "../lib/api.js";

// The generated story survives slide changes (slides remount on navigation).
let lastStory = null;
let lastPrompt = null;
// One annotation (influence map) per story, cached across slide changes.
let annotationCache = { story: null, influences: null };

const FALLBACK_STORY =
  "The lighthouse keeper had never trusted the octopus, but rent was due and the creature paid in pearls. Every evening it climbed the spiral stairs, polished the great lamp with four arms, and used the other four to write letters to the sea. One night the lamp went dark, and the keeper found the octopus gone — the final letter read simply: the light was never for the ships.";

const SUGGESTIONS = [
  ["a retired pirate", "an anxious robot", "a lighthouse-keeping octopus", "a librarian who hates books"],
  ["the last coffee shop on Mars", "inside a grand piano", "a subway station in 1912", "the world's quietest library"],
  ["gravity stops working on Tuesdays", "everyone can suddenly hear thoughts", "the moon goes missing", "time runs backwards after midnight"],
];

// Matches the FALLBACK_STORY's octopus/lighthouse theme.
const DEFAULT_PROMPT = `Write a fun, vivid short story (4-6 sentences) about ${SUGGESTIONS[0][2]} in ${SUGGESTIONS[1][0]}, where ${SUGGESTIONS[2][2]}.`;

function IngredientInput({ label, value, onChange, suggestions }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontSize: 14, fontWeight: 600, color: COLORS.muted }}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={suggestions[0]}
        style={{ width: "100%" }}
      />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            style={{
              fontSize: 13, color: COLORS.muted, padding: "4px 10px",
              border: `1px solid ${COLORS.hairline}`, borderRadius: 999,
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// The system message our server (api/generate.js) actually prepends, abridged
// for display. Keep in sync with SAFE_SYSTEM_PROMPT + the length hint there.
const REAL_SYSTEM_ABRIDGED =
  "You are a helpful, encouraging, and highly appropriate AI assistant designed for K-12 school use. Your primary goal is safety. Do not generate [… safety rules …]. Keep all responses polite, simple, and encouraging. Keep responses concise (4-6 sentences max).";

function GenerateSlide({ accent }) {
  const [character, setCharacter] = useState("");
  const [place, setPlace] = useState("");
  const [twist, setTwist] = useState("");
  const [output, setOutput] = useState(lastStory || "");
  const [sentPrompt, setSentPrompt] = useState(null);
  const [showBehind, setShowBehind] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const outRef = useRef(null);

  const generate = async () => {
    const c = character.trim() || SUGGESTIONS[0][2];
    const p = place.trim() || SUGGESTIONS[1][0];
    const t = twist.trim() || SUGGESTIONS[2][2];
    setLoading(true);
    setOutput("");
    setBlocked(false);
    // Keep the prompt compact and instruction-free: the safety classifier is
    // tuned for short classroom inputs and false-positives on meta-heavy
    // prompts. It's also slightly nondeterministic, so retry once on a block.
    const prompt = `Write a fun, vivid short story (4-6 sentences) about ${c} in ${p}, where ${t}.`;
    setSentPrompt(prompt);
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        const result = await generateStream(prompt, {
          temperature: 0.9,
          maxTokens: 220,
          onToken: (_, text) => {
            setOutput(text);
            outRef.current?.scrollTo(0, outRef.current.scrollHeight);
          },
        });
        if (!result.blocked) {
          if (result.text) {
            lastStory = result.text;
            lastPrompt = prompt;
          }
          setLoading(false);
          return;
        }
      }
      setBlocked(true);
    } catch {
      setOutput((lastStory || FALLBACK_STORY) + "\n\n(Couldn't reach the model — this one's a canned example.)");
      if (!lastStory) { lastStory = FALLBACK_STORY; lastPrompt = DEFAULT_PROMPT; }
    }
    setLoading(false);
  };

  return (
    <Slide wide>
      <Kicker accent={accent}>The trick</Kicker>
      <Heading size="h2">Give the machine three ingredients.</Heading>
      <Prose muted>Make them ridiculous — it makes the point better.</Prose>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: SPACE.sm }}>
        <IngredientInput label="A character" value={character} onChange={setCharacter} suggestions={SUGGESTIONS[0].slice(0, 2)} />
        <IngredientInput label="A place" value={place} onChange={setPlace} suggestions={SUGGESTIONS[1].slice(0, 2)} />
        <IngredientInput label="A complication" value={twist} onChange={setTwist} suggestions={SUGGESTIONS[2].slice(0, 2)} />
      </div>
      <div>
        <Button accent={accent} onClick={generate} disabled={loading}>
          {loading ? "Writing…" : output ? "Write another" : "Write the story"}
        </Button>
      </div>
      {blocked && <BlockedNote />}
      {output && (
        <Card style={{ maxHeight: 260, overflowY: "auto" }} >
          <div ref={outRef} style={{ fontFamily: FONTS.display, fontSize: 20, lineHeight: 1.7, fontStyle: "italic" }}>
            {output}
            {loading && <span style={{ animation: "v2Blink 1s infinite" }}>▌</span>}
          </div>
        </Card>
      )}
      {output && !loading && sentPrompt && (
        <button
          onClick={() => setShowBehind((s) => !s)}
          style={{
            textAlign: "left", borderRadius: 12, padding: SPACE.sm, width: "100%",
            background: "transparent", border: `1px dashed ${accent}55`,
          }}
        >
          <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: accent }}>
            {showBehind ? "▾" : "▸"} BEHIND THE CURTAIN — what this page actually sent {showBehind ? "" : "(click)"}
          </span>
          {showBehind && (
            <div className="reveal" style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ borderLeft: `2px solid ${accent}88`, paddingLeft: 12 }}>
                <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: accent, display: "block" }}>SYSTEM — standing instructions the site gives the model (abridged, real)</span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 12.5, color: "rgba(231,234,242,.75)", lineHeight: 1.8, display: "block", marginTop: 4 }}>
                  {REAL_SYSTEM_ABRIDGED}
                </span>
              </div>
              <div style={{ borderLeft: "2px solid rgba(255,255,255,.25)", paddingLeft: 12 }}>
                <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: "rgba(255,255,255,.5)", display: "block" }}>USER — your ingredients, wrapped by this page</span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 12.5, color: "rgba(231,234,242,.75)", lineHeight: 1.8, display: "block", marginTop: 4 }}>
                  {sentPrompt}
                </span>
              </div>
              <span style={{ fontSize: 13.5, color: "rgba(152,162,184,1)", lineHeight: 1.7 }}>
                The story above is the model's continuation of exactly this text —
                the system rules, then your request. Every AI product works this
                way: instructions you never see, prepended to the words you type.
              </span>
            </div>
          )}
        </button>
      )}
    </Slide>
  );
}

// Slow word-by-word replay — with influence choreography: before each content
// word appears, the earlier words that most influenced it glow (an LLM's
// retrospective estimate; see the honest footnote).
function ReplaySlide({ accent }) {
  const story = lastStory || FALLBACK_STORY;
  const prompt = lastPrompt || DEFAULT_PROMPT;
  const words = useMemo(() => story.trim().split(/\s+/), [story]);
  const promptWords = useMemo(() => prompt.trim().split(/\s+/), [prompt]);

  const [shown, setShown] = useState(0);
  const [glow, setGlow] = useState([]); // refs like "P8", "S2"
  const [playing, setPlaying] = useState(false);
  const [influences, setInfluences] = useState(
    annotationCache.story === story ? annotationCache.influences : null
  );
  const runToken = useRef(0);

  // Fetch the influence map once per story (cached across slide changes).
  useEffect(() => {
    if (influences !== null) return;
    let alive = true;
    annotateStory(prompt, story)
      .then((d) => {
        const inf = d.influences || {};
        annotationCache = { story, influences: inf };
        if (alive) setInfluences(inf);
      })
      .catch(() => {
        annotationCache = { story, influences: {} };
        if (alive) setInfluences({}); // replay still works, just without glow
      });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => { runToken.current++; }, []); // cancel on unmount

  const play = async () => {
    const token = ++runToken.current;
    setPlaying(true);
    setShown(0);
    const inf = influences || {};
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    await sleep(300);
    for (let i = 0; i < words.length; i++) {
      if (runToken.current !== token) return;
      const refs = inf[i];
      setGlow(refs || []);
      if (refs) await sleep(540); // let the glances land before the word
      if (runToken.current !== token) return;
      setShown(i + 1);
      await sleep(refs ? 420 : 260);
    }
    if (runToken.current === token) { setPlaying(false); setGlow([]); }
  };

  const skip = () => { runToken.current++; setPlaying(false); setGlow([]); setShown(words.length); };

  const wordStyle = (ref, extra = {}) => ({
    borderRadius: 4,
    padding: "0 2px",
    transition: "background 250ms, color 250ms",
    background: glow.includes(ref) ? accent + "55" : "transparent",
    ...extra,
  });

  return (
    <Slide wide>
      <Kicker accent={accent}>Watch it again — slowly</Kicker>
      <Heading size="h2">It keeps glancing back.</Heading>
      <Prose muted>
        Before each word appears, watch which earlier words light up — the
        machine keeps looking back at <em>your ingredients</em> and at its own
        sentences to choose what comes next.
      </Prose>
      {/* The prompt — visible so glances can land on the learner's own words */}
      <Card style={{ padding: SPACE.sm, borderColor: accent + "33" }}>
        <Mono style={{ fontSize: 11, color: accent, display: "block", marginBottom: 6 }}>
          THE PROMPT — what the machine was reading
        </Mono>
        <div style={{ fontFamily: FONTS.mono, fontSize: 13.5, lineHeight: 1.9, color: COLORS.muted }}>
          {promptWords.map((w, i) => (
            <span key={i} style={wordStyle(`P${i}`, glow.includes(`P${i}`) ? { color: COLORS.text } : {})}>
              {w}{" "}
            </span>
          ))}
        </div>
      </Card>
      {/* The story, building word by word */}
      <Card style={{ minHeight: 150 }}>
        <div style={{ fontFamily: FONTS.display, fontSize: 20, lineHeight: 1.8, fontStyle: "italic" }}>
          {words.slice(0, shown).map((w, i) => (
            <span
              key={i}
              style={wordStyle(`S${i}`, {
                opacity: i === shown - 1 ? 1 : 0.78,
                background: i === shown - 1 ? accent + "44" : glow.includes(`S${i}`) ? accent + "55" : "transparent",
              })}
            >
              {w}{" "}
            </span>
          ))}
          {shown < words.length && playing && <span style={{ animation: "v2Blink 1s infinite", color: accent }}>▌</span>}
        </div>
      </Card>
      <div style={{ display: "flex", gap: SPACE.sm, alignItems: "center" }}>
        {!playing ? (
          <Button accent={accent} onClick={play} disabled={influences === null}>
            {influences === null ? "Choreographing…" : shown >= words.length ? "Replay" : "Play"}
          </Button>
        ) : (
          <GhostButton onClick={skip}>Skip ahead</GhostButton>
        )}
        {influences === null && (
          <Prose muted style={{ fontSize: 13 }}>
            asking a model to map the influences…
          </Prose>
        )}
      </div>
      <HonestNote>
        The highlights are an AI's own estimate of what mattered, made after
        the fact — the model's true “glances” (attention weights) live inside
        it and aren't exposed. The real machinery reads <em>every</em> earlier
        word at once, in dozens of parallel streams. You'll meet it properly in
        Chapter 9.
      </HonestNote>
    </Slide>
  );
}

export default function Ch01ImpossibleMachine({ accent, slide }) {
  switch (slide) {
    case 0:
      return (
        <Slide>
          <Kicker accent={accent}>Act I · The Mystery — Chapter 1</Kicker>
          <Heading>The Impossible Machine</Heading>
          <Lead>
            This course opens with a magic trick. You supply the ingredients; a
            machine writes the story. Then we'll spend thirteen chapters taking
            the trick apart.
          </Lead>
          <Prose muted>Use → or space to move forward. Your progress is saved.</Prose>
        </Slide>
      );
    case 1:
      return <GenerateSlide accent={accent} />;
    case 2:
      return <ReplaySlide accent={accent} />;
    case 3:
      return (
        <Slide>
          <Kicker accent={accent}>The rug-pull</Kicker>
          <Heading size="h2">It never knew how the story would end.</Heading>
          <Prose>
            When the machine wrote the first word, it had no plan, no outline, no
            idea of the ending. There is no ending stored anywhere — not until it
            gets written.
          </Prose>
          <Prose>
            Each word was chosen by looking at all the words before it and asking
            a single question: <em>given everything so far, what's a likely next
            piece of text?</em> Then that piece is added, and the question is
            asked again. And again.
          </Prose>
          <Card>
            <Mono accent={accent} style={{ fontSize: 15, display: "block", lineHeight: 2 }}>
              The lighthouse keeper had never trusted the <span style={{ background: accent + "33", borderRadius: 4, padding: "0 4px" }}>___</span>
            </Mono>
            <Prose muted style={{ fontSize: 15, marginTop: 10 }}>
              guess → append → repeat. That's the whole machine.
            </Prose>
          </Card>
        </Slide>
      );
    case 4:
      return (
        <Slide>
          <Kicker accent={accent}>The claim</Kicker>
          <Heading size="h2">Everything an AI chatbot does is this.</Heading>
          <Prose>
            Answering your question. Writing code. Composing an apology. Passing a
            law exam. Explaining a joke. Under every one of these is the same
            single mechanism: <strong>predict the next piece of text, append it,
            repeat.</strong>
          </Prose>
          <Prose>
            There is no separate "answer questions" module, no "write poetry"
            module. One loop. That's the entire repertoire.
          </Prose>
        </Slide>
      );
    case 5:
      return (
        <Slide>
          <Kicker accent={accent}>The driving question</Kicker>
          <Heading size="h2">That should bother you.</Heading>
          <Prose>
            A story has a plot. A joke has a setup that pays off. An argument
            holds together across paragraphs. How can a machine that only ever
            guesses <em>the very next word</em> — blind to its own future —
            produce any of that?
          </Prose>
          <Lead style={{ color: accent }}>
            That question is this entire course. Every chapter peels back one
            layer of the answer.
          </Lead>
        </Slide>
      );
    case 6:
    default:
      return (
        <Recap
          accent={accent}
          lines={[
            "AI text is generated one piece at a time — each piece chosen by looking at everything before it.",
            "The machine has no plan and no stored ending; the future of the text doesn't exist until it's written.",
            "Everything a chatbot does — answers, code, poetry — is one mechanism: predict, append, repeat.",
          ]}
          next="It's Only Prediction — we make the claim rigorous, and you test it against a real model."
        />
      );
  }
}
