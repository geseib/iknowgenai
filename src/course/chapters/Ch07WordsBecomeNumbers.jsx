// Chapter 7 — Words Become Numbers
// Opens Act III. Text → tokens (live tiktoken demo) → embeddings (the number
// stream). The machine never sees a word — only coordinates.
import { useEffect, useState } from "react";
import { Slide, Kicker, Heading, Lead, Prose, Card, Button, Mono, HonestNote, Recap, BlockedNote, CountUp } from "../ui/shared.jsx";
import { FONTS, COLORS, SPACE } from "../styles/theme.js";
import { tokenize } from "../lib/api.js";

const CHIP_COLORS = ["#6C9EF8", "#4FD6BE", "#E5B567", "#A78BFA", "#E58FB1"];

const TOKEN_PRESETS = [
  "Unbelievable!",
  "supercalifragilisticexpialidocious",
  "I ate 1,234,567 cookies 🍪",
  "The bat flew out of the cave at dusk.",
];

function TokenizerDemo({ accent }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const run = async (text) => {
    if (!text.trim()) return;
    setLoading(true);
    setBlocked(false);
    setResult(null);
    try {
      const data = await tokenize(text);
      if (data.blocked) setBlocked(true);
      else setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <Slide wide>
      <Kicker accent={accent}>Live — the real tokenizer</Kicker>
      <Heading size="h2">Step one: chop.</Heading>
      <Prose muted>
        This is the actual tokenizer used by GPT-4o-mini, running on your text.
        Try a long word, a number, an emoji.
      </Prose>
      <div style={{ display: "flex", gap: SPACE.xs, flexWrap: "wrap" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run(input)}
          placeholder={TOKEN_PRESETS[0]}
          style={{ flex: 1, minWidth: 240 }}
        />
        <Button accent={accent} onClick={() => run(input)} disabled={loading}>
          {loading ? "Chopping…" : "Tokenize"}
        </Button>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {TOKEN_PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => { setInput(p); run(p); }}
            style={{ fontSize: 13, color: COLORS.muted, padding: "4px 10px", border: `1px solid ${COLORS.hairline}`, borderRadius: 999 }}
          >
            {p}
          </button>
        ))}
      </div>
      {blocked && <BlockedNote />}
      {result?.error && <Prose muted>Couldn't reach the tokenizer: {result.error}</Prose>}
      {result?.tokens && (
        <Card>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "flex-start" }}>
            {result.tokens.map((t, i) => (
              <span key={i} style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <span
                  className="token-chip"
                  style={{
                    borderColor: CHIP_COLORS[i % CHIP_COLORS.length] + "88",
                    color: CHIP_COLORS[i % CHIP_COLORS.length],
                    animationDelay: `${i * 70}ms`,
                  }}
                >
                  {t.text.replace(/ /g, "␣")}
                </span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.faint }}>#{t.id}</span>
              </span>
            ))}
          </div>
          <Prose muted style={{ fontSize: 14, marginTop: 14 }}>
            {result.count} tokens from {result.charCount} characters. Each piece
            has an ID — its position in the vocabulary. (␣ marks a leading
            space; spaces belong to tokens.)
          </Prose>
        </Card>
      )}
    </Slide>
  );
}

// Deterministic pseudo-random values for the "cat" embedding stream.
function embVal(i) {
  const x = Math.sin(i * 374761.393 + 668265.263) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

function NumberStream({ accent }) {
  const [count, setCount] = useState(24);
  useEffect(() => {
    if (count >= 240) return;
    const t = setTimeout(() => setCount((c) => c + 8), 90);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <Slide wide>
      <Kicker accent={accent}>Step two: mean something</Kicker>
      <Heading size="h2">“cat”, as the machine sees it.</Heading>
      <Prose muted>
        Every token ID looks up a long list of numbers — in GPT-3, 12,288 of
        them. Here come the first few hundred:
      </Prose>
      <Card style={{ maxHeight: 240, overflow: "hidden", position: "relative" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px" }}>
          <Mono accent={accent} style={{ fontSize: 13 }}>cat →</Mono>
          {Array.from({ length: Math.min(count, 240) }, (_, i) => (
            <Mono key={i} style={{ fontSize: 13, color: i === count - 1 ? accent : COLORS.muted, opacity: 0.4 + 0.6 * Math.abs(embVal(i)) }}>
              {embVal(i).toFixed(3)}
            </Mono>
          ))}
          {count < 240 && <Mono style={{ fontSize: 13, color: accent }}>…</Mono>}
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: `linear-gradient(transparent, ${COLORS.surface})` }} />
      </Card>
      <Prose>
        <CountUp to={12288} duration={2000} style={{ color: accent, fontSize: 26 }} /> numbers,
        for one token. This list — nothing else — is what “cat” <em>is</em> to
        the model. Your brain hears “cat” and floods with fur, whiskers, a
        specific cat you once knew. The machine has this list.
      </Prose>
      <HonestNote>
        12,288 is GPT-3's embedding width; models range from a few hundred to
        several thousand. The values shown here are illustrative — real
        embedding values are learned, and look just as unreadable.
      </HonestNote>
    </Slide>
  );
}

export default function Ch07WordsBecomeNumbers({ accent, slide }) {
  switch (slide) {
    case 0:
      return (
        <Slide>
          <Kicker accent={accent}>Act III · Inside the Machine — Chapter 7</Kicker>
          <Heading>Words Become Numbers</Heading>
          <Lead>
            Time to open the box. A language model is arithmetic all the way
            down — billions of multiplications and additions. Which raises an
            awkward question: you can't multiply the word “cat.”
          </Lead>
          <Prose muted>
            Everything in this act follows from how that problem gets solved.
          </Prose>
        </Slide>
      );
    case 1:
      return (
        <Slide>
          <Kicker accent={accent}>The plan</Kicker>
          <Heading size="h2">Two steps from text to numbers.</Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
            {[
              ["1 · CHOP", "Split the text into pieces from a fixed menu — about 100,000 reusable fragments called tokens."],
              ["2 · LOOK UP", "Swap each piece for a long list of numbers that captures its meaning — an embedding."],
            ].map(([label, text], i) => (
              <div key={label} className="reveal" style={{ animationDelay: `${i * 150}ms`, display: "flex", gap: 14, alignItems: "baseline" }}>
                <Mono accent={accent} style={{ fontSize: 13, minWidth: 90 }}>{label}</Mono>
                <Prose>{text}</Prose>
              </div>
            ))}
          </div>
          <Prose muted>
            From here on, the model never touches text again. It works entirely
            on the numbers — and at the very end, turns numbers back into a
            word. Let's do both steps for real.
          </Prose>
        </Slide>
      );
    case 2:
      return <TokenizerDemo accent={accent} />;
    case 3:
      return (
        <Slide>
          <Kicker accent={accent}>Why pieces?</Kicker>
          <Heading size="h2">100,000 is a deliberate compromise.</Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
            <Card>
              <Mono style={{ fontSize: 13, color: COLORS.wrong }}>TOO SMALL — 26 letters</Mono>
              <Prose muted style={{ fontSize: 15, marginTop: 4 }}>
                A letter carries almost no meaning. Every sentence becomes a
                huge sequence of nearly meaningless steps.
              </Prose>
            </Card>
            <Card>
              <Mono style={{ fontSize: 13, color: COLORS.wrong }}>TOO BIG — every word ever</Mono>
              <Prose muted style={{ fontSize: 15, marginTop: 4 }}>
                Millions of entries, and it still breaks on the first typo, new
                slang, or invented name it meets.
              </Prose>
            </Card>
            <Card style={{ borderColor: accent + "55" }}>
              <Mono style={{ fontSize: 13, color: accent }}>JUST RIGHT — ~50,000–200,000 word-pieces</Mono>
              <Prose muted style={{ fontSize: 15, marginTop: 4 }}>
                Common words get their own token; rare words assemble from
                pieces (“un” + “believ” + “able”). Nothing is ever unspellable.
              </Prose>
            </Card>
          </div>
          <Prose muted style={{ fontSize: 15 }}>
            You saw the side effects in the demo: emojis cost several tokens,
            and numbers get chopped at odd places — one reason pure arithmetic
            is hard for language models. (That thread continues in Chapter 13.)
          </Prose>
        </Slide>
      );
    case 4:
      return (
        <Slide>
          <Kicker accent={accent}>The catch</Kicker>
          <Heading size="h2">An ID is a name, not a meaning.</Heading>
          <Card>
            <div style={{ fontFamily: FONTS.mono, fontSize: 16, lineHeight: 2.2 }}>
              <span style={{ color: COLORS.muted }}>cat → </span><span style={{ color: accent }}>#9059</span>
              <span style={{ color: COLORS.faint }}>   kitten → </span><span style={{ color: accent }}>#74076</span>
              <span style={{ color: COLORS.faint }}>   carburetor → </span><span style={{ color: accent }}>#9060</span>
            </div>
          </Card>
          <Prose>
            Token #9059 and #9060 are neighbors in the vocabulary — and have
            nothing to do with each other. The IDs are alphabetical accidents.
            If the machine is going to <em>reason</em> with these numbers,
            “cat” and “kitten” need to be numerically close, and “carburetor”
            far away.
          </Prose>
          <Prose muted>
            One number per token can't do that. So each token gets thousands.
          </Prose>
        </Slide>
      );
    case 5:
      return <NumberStream accent={accent} />;
    case 6:
      return (
        <Slide>
          <Kicker accent={accent}>Where the numbers come from</Kicker>
          <Heading size="h2">Nobody wrote this list.</Heading>
          <Prose>
            No engineer decided that position 4,721 of “cat” should be −0.113.
            The embedding table is just more weights — dials from Chapter 4 —
            set by the same loop: guess the next word, check, adjust. Meanings
            that help prediction survive; meanings that don't get nudged away.
          </Prose>
          <Prose>
            Which means the numbers are <strong>learned, not designed</strong> —
            and, honestly, largely unread. Researchers can probe them, but no
            one can tell you what most individual positions mean.
          </Prose>
          <HonestNote>
            The next chapter shows what we <em>can</em> read: not individual
            numbers, but the geometry — where words end up relative to each
            other. That turns out to be spectacular.
          </HonestNote>
        </Slide>
      );
    case 7:
    default:
      return (
        <Recap
          accent={accent}
          lines={[
            "Text is chopped into tokens — ~100,000 reusable word-pieces; spaces, emojis, and numbers all count.",
            "A token ID is just a name. Meaning comes from the embedding: thousands of learned numbers per token.",
            "Nobody wrote those numbers — the training loop grew them, because good meanings make good predictions.",
          ]}
          next="A Map of Meaning — plot the embeddings, and watch the dictionary turn into geography."
        />
      );
  }
}
