// Chapter 9 — Attention
// The ambiguity problem ("bat"), a find-the-clues game with attention beams,
// context moving a word across the meaning map, heads, and the Transformer.
import { useState } from "react";
import { Slide, Kicker, Heading, Lead, Prose, Card, Button, Mono, HonestNote, Recap } from "../ui/shared.jsx";
import { FONTS, COLORS, SPACE } from "../styles/theme.js";

const SENTENCES = [
  {
    words: ["I", "swung", "the", "bat", "and", "hit", "the", "ball"],
    focus: 3,
    clues: [1, 5, 7],
    meaning: "a baseball bat",
  },
  {
    words: ["The", "bat", "flew", "out", "of", "the", "cave", "at", "dusk"],
    focus: 1,
    clues: [2, 6, 8],
    meaning: "the flying animal",
  },
];

// Lay the sentence out in one SVG so beams can be drawn between words.
function BeamSentence({ sentence, accent, picked, onPick }) {
  const { words, focus, clues } = sentence;
  const CHAR_W = 7.4, GAP = 14, H = 150, BASE = 118;
  const pos = words.reduce((acc, w) => {
    const x = acc.length ? acc[acc.length - 1].x + acc[acc.length - 1].width + GAP : 10;
    const width = w.length * CHAR_W;
    acc.push({ x, cx: x + width / 2, width });
    return acc;
  }, []);
  const last = pos[pos.length - 1];
  const total = last.x + last.width + GAP + 4;
  const found = clues.filter((c) => picked.includes(c)).length;

  return (
    <div>
      <svg viewBox={`0 0 ${total} ${H}`} style={{ width: "100%", maxWidth: total * 1.6, display: "block" }}>
        {/* beams from the focus word to picked words */}
        {picked.map((i) => {
          const isClue = clues.includes(i);
          const from = pos[sentence.focus].cx;
          const to = pos[i].cx;
          const mid = (from + to) / 2;
          const lift = Math.min(90, Math.abs(to - from) * 0.55);
          return (
            <path
              key={i}
              d={`M ${from} ${BASE - 22} Q ${mid} ${BASE - 22 - lift} ${to} ${BASE - 22}`}
              fill="none"
              stroke={isClue ? accent : COLORS.faint}
              strokeWidth={isClue ? 2 : 1}
              strokeDasharray={isClue ? "none" : "3 4"}
              opacity={isClue ? 0.9 : 0.35}
              style={{ strokeDashoffset: 0 }}
            />
          );
        })}
        {/* words */}
        {words.map((w, i) => {
          const isFocus = i === focus;
          const isPicked = picked.includes(i);
          const isClue = clues.includes(i);
          return (
            <g key={i} onClick={() => !isFocus && onPick(i)} style={{ cursor: isFocus ? "default" : "pointer" }}>
              <rect
                x={pos[i].x - 4} y={BASE - 18} width={pos[i].width + 8} height={26} rx={6}
                fill={isFocus ? accent + "33" : isPicked && isClue ? accent + "22" : "transparent"}
                stroke={isFocus ? accent : isPicked ? (isClue ? accent : COLORS.faint) : "rgba(255,255,255,.12)"}
                strokeWidth={isFocus ? 1.5 : 1}
              />
              <text
                x={pos[i].cx} y={BASE}
                textAnchor="middle" fontSize="13" fontFamily="'JetBrains Mono', monospace"
                fill={isFocus ? "#E7EAF2" : isPicked ? (isClue ? accent : COLORS.faint) : "#98A2B8"}
              >
                {w}
              </text>
            </g>
          );
        })}
      </svg>
      <Prose muted style={{ fontSize: 14 }}>
        {found === clues.length
          ? <>All clues found — this “bat” is <span style={{ color: accent }}>{sentence.meaning}</span>.</>
          : `Click the words that reveal which “bat” this is. ${found}/${clues.length} clues found.`}
      </Prose>
    </div>
  );
}

function ClueGame({ accent }) {
  const [picked0, setPicked0] = useState([]);
  const [picked1, setPicked1] = useState([]);
  const pick = (setter) => (i) => setter((p) => (p.includes(i) ? p : [...p, i]));

  return (
    <Slide wide>
      <Kicker accent={accent}>You already do this</Kicker>
      <Heading size="h2">Find the clues.</Heading>
      <Prose muted>
        Same word, two sentences. In each one, click the words that tell you
        which “bat” it is.
      </Prose>
      <Card><BeamSentence sentence={SENTENCES[0]} accent={accent} picked={picked0} onPick={pick(setPicked0)} /></Card>
      <Card><BeamSentence sentence={SENTENCES[1]} accent={accent} picked={picked1} onPick={pick(setPicked1)} /></Card>
      <Prose muted style={{ fontSize: 15 }}>
        The beams you just drew — word reaching out to word for context — are a
        picture of exactly what the model computes. It's called attention.
      </Prose>
    </Slide>
  );
}

// Context slides "bat" across the meaning map.
function MapSlide({ accent }) {
  const [context, setContext] = useState(null); // null | "sport" | "animal"
  const batPos = context === "sport" ? { x: 30, y: 34 } : context === "animal" ? { x: 74, y: 30 } : { x: 52, y: 52 };

  return (
    <Slide wide>
      <Kicker accent={accent}>What attention does to the map</Kicker>
      <Heading size="h2">Context moves the word.</Heading>
      <Prose muted>
        After the embedding lookup, both “bat”s start at the same point — the
        ambiguous middle. Attention mixes in the neighbors, and the vector
        <em> moves</em>.
      </Prose>
      <Card style={{ padding: SPACE.sm }}>
        <svg viewBox="0 0 100 62" style={{ width: "100%", display: "block" }}>
          {/* sports cluster */}
          {[["ball", 22, 26], ["swing", 34, 22], ["glove", 26, 40]].map(([w, x, y]) => (
            <g key={w}>
              <circle cx={x} cy={y} r="1.3" fill={DOTC(0)} opacity=".8" />
              <text x={x} y={y - 2.4} textAnchor="middle" fontSize="3" fill="#98A2B8" fontFamily="Inter">{w}</text>
            </g>
          ))}
          {/* animal cluster */}
          {[["owl", 70, 22], ["moth", 82, 28], ["cave", 76, 40]].map(([w, x, y]) => (
            <g key={w}>
              <circle cx={x} cy={y} r="1.3" fill={DOTC(1)} opacity=".8" />
              <text x={x} y={y - 2.4} textAnchor="middle" fontSize="3" fill="#98A2B8" fontFamily="Inter">{w}</text>
            </g>
          ))}
          {/* bat */}
          <g style={{ transition: "transform 700ms cubic-bezier(.2,.7,.3,1)", transform: `translate(${batPos.x}px, ${batPos.y}px)` }}>
            <circle r="1.9" fill={accent} />
            <text y="-3" textAnchor="middle" fontSize="3.6" fill="#E7EAF2" fontFamily="Inter" fontWeight="600">bat</text>
          </g>
        </svg>
      </Card>
      <div style={{ display: "flex", gap: SPACE.xs, flexWrap: "wrap" }}>
        <Button accent={accent} onClick={() => setContext("sport")}>“swung the bat at the ball”</Button>
        <Button accent={accent} onClick={() => setContext("animal")}>“the bat flew into the cave”</Button>
        <Button accent="transparent" style={{ border: `1px solid ${COLORS.hairline}`, color: COLORS.muted }} onClick={() => setContext(null)}>
          No context
        </Button>
      </div>
      <Prose muted style={{ fontSize: 15 }}>
        {context
          ? "Attention added a weighted mix of the neighbors' vectors into “bat” — and it slid toward the right cluster. Same starting token, different final meaning."
          : "Without context, “bat” sits between its meanings. Give it a sentence."}
      </Prose>
    </Slide>
  );
}

function DOTC(i) {
  return ["#6C9EF8", "#4FD6BE", "#E5B567", "#A78BFA"][i % 4];
}

export default function Ch09Attention({ accent, slide }) {
  switch (slide) {
    case 0:
      return (
        <Slide>
          <Kicker accent={accent}>Act III · Inside the Machine — Chapter 9</Kicker>
          <Heading>Attention</Heading>
          <Lead>
            The map from last chapter has a flaw: “bat” gets <em>one</em> point
            on it. But a bat in a dugout and a bat in a cave are different
            things. The fix is a 2017 idea that created the modern AI era.
          </Lead>
        </Slide>
      );
    case 1:
      return (
        <Slide>
          <Kicker accent={accent}>The flaw</Kicker>
          <Heading size="h2">The lookup table can't see the sentence.</Heading>
          <Card>
            <div style={{ fontFamily: FONTS.mono, fontSize: 15, lineHeight: 2.1 }}>
              <div><span style={{ color: COLORS.muted }}>“I swung the </span><span style={{ color: accent }}>bat</span><span style={{ color: COLORS.muted }}>…”</span> → embedding <span style={{ color: accent }}>#42871</span></div>
              <div><span style={{ color: COLORS.muted }}>“The </span><span style={{ color: accent }}>bat</span><span style={{ color: COLORS.muted }}> flew…”</span> → embedding <span style={{ color: accent }}>#42871</span></div>
            </div>
          </Card>
          <Prose>
            Same token, same lookup, <strong>identical numbers</strong>. Step
            two of Chapter 7 hands the model a vector that means “bat, some
            kind of.” If the meaning is going to sharpen, information has to
            flow in from the <em>other words in the sentence</em>.
          </Prose>
          <Prose muted>
            You resolve this so fast you can't feel yourself doing it. Next
            slide: do it slowly.
          </Prose>
        </Slide>
      );
    case 2:
      return <ClueGame accent={accent} />;
    case 3:
      return <MapSlide accent={accent} />;
    case 4:
      return (
        <Slide>
          <Kicker accent={accent}>Not one spotlight — dozens</Kicker>
          <Heading size="h2">Attention heads work in parallel.</Heading>
          <Prose>
            One pass of attention isn't a single beam — it's many independent
            <strong> heads</strong>, each free to learn its own kind of
            relationship. In practice, researchers have found heads that track
            things like:
          </Prose>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.xs }}>
            {[
              ["a grammar head", "which noun does this verb belong to?"],
              ["a reference head", "who does “she” refer to?"],
              ["a copying head", "has this exact phrase appeared earlier?"],
              ["a disambiguation head", "which meaning of “bat” fits here?"],
            ].map(([name, q], i) => (
              <div key={name} className="reveal" style={{ animationDelay: `${i * 120}ms`, display: "flex", gap: 12, alignItems: "baseline" }}>
                <Mono accent={accent} style={{ fontSize: 13, minWidth: 170 }}>{name}</Mono>
                <Prose muted style={{ fontSize: 15 }}><em>{q}</em></Prose>
              </div>
            ))}
          </div>
          <Prose muted>
            GPT-3 runs 96 heads per layer. Every word consults every head's
            findings at once — and this all happens in parallel, which is why
            these models train so well on modern chips.
          </Prose>
        </Slide>
      );
    case 5:
      return (
        <Slide>
          <Kicker accent={accent}>Name it</Kicker>
          <Heading size="h2">The T in GPT.</Heading>
          <Prose>
            This mechanism is <strong>attention</strong>, and the architecture
            built around it is the <strong>Transformer</strong> — the T in GPT
            (Generative Pre-trained Transformer). It arrived in a 2017 paper
            with a title that turned out to be a prophecy:
            <em> “Attention Is All You Need.”</em>
          </Prose>
          <Prose>
            One detail worth getting right: in GPT-style models, attention is
            <strong> causal</strong> — each word can only look at the words
            <em> before</em> it, never ahead. The machine writing your answer
            genuinely cannot peek at its own future. (Chapter 1's blindfold,
            explained.)
          </Prose>
          <HonestNote>
            Our beams are the honest cartoon. In the real computation, every
            word emits a query (“what am I looking for?”), a key (“what am I?”),
            and a value (“what do I offer?”) — all learned — and attention
            scores every query against every key simultaneously. Weighted sums
            of values do the mixing. Same idea, industrial form.
          </HonestNote>
        </Slide>
      );
    case 6:
    default:
      return (
        <Recap
          accent={accent}
          lines={[
            "The embedding lookup gives “bat” identical numbers in every sentence — context has to fix it.",
            "Attention lets each word pull in a weighted mix of the words before it, moving its vector to the right meaning.",
            "Many heads run in parallel, each tracking its own relationship. This is the Transformer — the T in GPT.",
          ]}
          next="Layers of Thought — attention runs once per layer, and there are ~100 layers. Time to stack."
        />
      );
  }
}
