// Sidequest — Where You Put It Matters
// The deep dive Chapter 9 (and Chapter 13) point at: if attention only looks
// backward, then WHERE information sits in the prompt changes the answer.
// Lost in the Middle, the causal cause, prompt-order sensitivity, the reality
// of 1M-token models, and needle-vs-reasoning. Every number on screen is
// either a documented finding (cited in the honest footnotes) or an
// illustrative curve computed live and flagged as such.
import { useState } from "react";
import {
  Slide, Kicker, Heading, Lead, Prose, Card, Button, GhostButton, Mono, HonestNote,
} from "../ui/shared.jsx";
import { FONTS, COLORS, SPACE } from "../styles/theme.js";

// ---- Slide 2: Lost in the Middle -------------------------------------------
// An illustrative U-curve shaped to Liu et al. (TACL 2024): ~75% at the ends,
// ~55% in the middle on 20-document QA. Not measured live — see the footnote.
const N_DOCS = 20;
function accAt(p) {
  const c = (N_DOCS + 1) / 2;
  const d = Math.abs(p - c) / (c - 1); // 0 at center → 1 at the ends
  const base = 55 + 20 * Math.pow(d, 1.5);
  const primacy = 2 * (1 - (p - 1) / (N_DOCS - 1)); // slight tilt: early edge a touch higher
  return Math.round(base + primacy);
}

function LostInMiddleSlide({ accent }) {
  const [gold, setGold] = useState(10); // 1-indexed position of the answer doc
  const acc = accAt(gold);

  // chart geometry
  const W = 640, H = 190, PAD = 34, LO = 45, HI = 85;
  const x = (p) => PAD + ((p - 1) / (N_DOCS - 1)) * (W - 2 * PAD);
  const y = (a) => H - PAD - ((a - LO) / (HI - LO)) * (H - 2 * PAD);
  const curve = Array.from({ length: N_DOCS }, (_, i) => `${x(i + 1)},${y(accAt(i + 1))}`).join(" ");

  return (
    <Slide wide>
      <Kicker accent={accent}>The best-known result</Kicker>
      <Heading size="h2">Lost in the middle.</Heading>
      <Prose muted>
        Give a model 20 documents and ask a question only one of them answers.
        Keep every word identical — just slide the answer to a different spot in
        the stack. Tap a slot to move it, and watch how often the model gets it
        right.
      </Prose>
      <Card>
        <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 10 }}>
          THE CONTEXT — 20 documents, the golden one is #{gold}
        </Mono>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: SPACE.md }}>
          {Array.from({ length: N_DOCS }, (_, i) => {
            const p = i + 1;
            const isGold = p === gold;
            return (
              <button
                key={p}
                onClick={() => setGold(p)}
                aria-label={`Put the answer at position ${p}`}
                style={{
                  width: 26, height: 30, padding: 0, borderRadius: 5,
                  fontFamily: FONTS.mono, fontSize: 11,
                  cursor: "pointer",
                  border: `1px solid ${isGold ? accent : "rgba(255,255,255,.14)"}`,
                  background: isGold ? accent + "33" : "transparent",
                  color: isGold ? accent : COLORS.faint,
                  transition: "all 200ms",
                }}
              >
                {isGold ? "★" : p}
              </button>
            );
          })}
        </div>
        {/* the U-curve */}
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          {[55, 65, 75].map((a) => (
            <g key={a}>
              <line x1={PAD} y1={y(a)} x2={W - PAD} y2={y(a)} stroke="rgba(255,255,255,.06)" strokeWidth="1" />
              <text x={PAD - 8} y={y(a) + 3} textAnchor="end" fontSize="9" fontFamily="'JetBrains Mono', monospace" fill={COLORS.faint}>{a}%</text>
            </g>
          ))}
          <polyline points={curve} fill="none" stroke={accent} strokeWidth="2" opacity="0.5" />
          <line x1={x(gold)} y1={y(acc)} x2={x(gold)} y2={H - PAD} stroke={accent} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          <circle cx={x(gold)} cy={y(acc)} r="5" fill={accent} style={{ transition: "cx 300ms, cy 300ms" }} />
          <text x={PAD} y={H - 8} fontSize="9.5" fontFamily="'JetBrains Mono', monospace" fill={COLORS.faint}>first</text>
          <text x={W - PAD} y={H - 8} textAnchor="end" fontSize="9.5" fontFamily="'JetBrains Mono', monospace" fill={COLORS.faint}>last</text>
        </svg>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 8 }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 34, color: accent, fontVariantNumeric: "tabular-nums" }}>{acc}%</span>
          <Prose muted style={{ fontSize: 14, margin: 0 }}>
            {gold <= 3 || gold >= N_DOCS - 2
              ? "Near an edge — the model reads it clearly."
              : gold >= 8 && gold <= 13
                ? "Buried in the middle — accuracy sags, though the text is right there."
                : "Off the edge, sliding toward the weak zone."}
          </Prose>
        </div>
      </Card>
      <Prose muted style={{ fontSize: 15 }}>
        Same documents, same question, same model. The only thing that changed
        was <em>where</em> the answer sat — and the score swung by roughly twenty
        points. The curve is a <strong>U</strong>: strong at both ends, weak
        through the middle.
      </Prose>
      <HonestNote>
        The shape is real and peer-reviewed — Liu et al., <em>“Lost in the
        Middle,”</em> TACL 2024, on multi-document QA with models including
        GPT-3.5, GPT-4, and Claude-1.3: accuracy peaked near ~75% when the gold
        document was first or last and fell to ~55% in the middle. The exact
        numbers you're dragging are an illustrative curve shaped to that
        finding, computed live — not measured from a model here.
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 4: prompt order flips the answer --------------------------------
function OrderFlipSlide({ accent }) {
  const [layout, setLayout] = useState("CQO"); // CQO good, QOC bad
  const blocks = layout === "CQO"
    ? [["Context", true], ["Question", true], ["Options", true]]
    : [["Question", true], ["Options", true], ["Context", true]];
  // In QOC, the Options come BEFORE the Context, so under causal masking their
  // tokens can't attend forward to the very text they need.
  const optionsBlind = layout === "QOC";

  return (
    <Slide wide>
      <Kicker accent={accent}>Same words, reordered</Kicker>
      <Heading size="h2">Where the options sit changes the score.</Heading>
      <Prose muted>
        A multiple-choice prompt has three parts: the context to reason over,
        the question, and the answer options. Put them in two different orders —
        the information is <em>identical</em> — and flip between them.
      </Prose>
      <Card>
        <div style={{ display: "flex", gap: SPACE.xs, marginBottom: SPACE.md }}>
          <Button accent={layout === "CQO" ? accent : "transparent"} onClick={() => setLayout("CQO")}
            style={layout === "CQO" ? {} : { border: `1px solid ${COLORS.hairline}`, color: COLORS.muted }}>
            Context → Question → Options
          </Button>
          <Button accent={layout === "QOC" ? accent : "transparent"} onClick={() => setLayout("QOC")}
            style={layout === "QOC" ? {} : { border: `1px solid ${COLORS.hairline}`, color: COLORS.muted }}>
            Question → Options → Context
          </Button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {blocks.map(([name], i) => {
            const isOptions = name === "Options";
            const blind = isOptions && optionsBlind;
            return (
              <div key={name} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 8,
                border: `1px solid ${blind ? COLORS.wrong + "88" : "rgba(255,255,255,.12)"}`,
                background: blind ? COLORS.wrong + "12" : "rgba(255,255,255,.02)",
                transition: "all 250ms",
              }}>
                <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.faint, width: 18 }}>{i + 1}</span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.text, minWidth: 92 }}>{name}</span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: blind ? COLORS.wrong : COLORS.muted }}>
                  {blind
                    ? "can't look ahead to the context it needs — causal mask blocks it"
                    : name === "Options"
                      ? "the context sits behind it — free to look back"
                      : ""}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
      <Prose muted style={{ fontSize: 15 }}>
        {layout === "CQO"
          ? "Context first: by the time the model reads the options, it has already absorbed everything it needs. It only has to look backward — and the answer is back there."
          : "Options first: under the backward-only rule from Chapter 9, the option tokens are computed before the context exists. They physically cannot attend to it. The context is technically present but effectively invisible to the choices."}
      </Prose>
      <HonestNote>
        The mechanism — causal masking making later-placed context invisible to
        earlier option tokens — follows directly from Chapter 9. The specific
        size of the effect (a reported drop of <strong>more than 14 percentage
        points</strong> from the strong order to the weak one) comes from a 2026
        preprint, <em>“Lost in the Prompt Order,”</em> that is not yet
        peer-reviewed — so treat the number as a striking early result, not a
        settled constant.
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 5: few-shot example order ---------------------------------------
// Deterministic cycle through illustrative orderings, echoing Lu et al. (2022):
// example order alone can swing accuracy from near-random to near-SOTA.
const SHUFFLES = [
  { order: "B D A C", acc: 54 },
  { order: "A B C D", acc: 88 },
  { order: "C A D B", acc: 61 },
  { order: "D C B A", acc: 83 },
  { order: "A C B D", acc: 72 },
];

function FewShotSlide({ accent }) {
  const [idx, setIdx] = useState(1);
  const cur = SHUFFLES[idx];
  const lo = Math.min(...SHUFFLES.map((s) => s.acc));
  const hi = Math.max(...SHUFFLES.map((s) => s.acc));

  return (
    <Slide wide>
      <Kicker accent={accent}>Not just retrieval</Kicker>
      <Heading size="h2">Reorder the examples, move the score.</Heading>
      <Prose muted>
        Few-shot prompting hands the model a handful of worked examples before
        the real question. The examples are the same each time. Only their order
        changes. Shuffle them.
      </Prose>
      <Card>
        <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 10 }}>
          FOUR EXAMPLES, ONE ORDER AT A TIME
        </Mono>
        <div style={{ display: "flex", gap: 8, marginBottom: SPACE.md }}>
          {cur.order.split(" ").map((label, i) => (
            <span key={i} style={{
              fontFamily: FONTS.mono, fontSize: 15, color: accent,
              border: `1px solid ${accent}66`, borderRadius: 6, padding: "8px 14px",
            }}>
              {label}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 22, background: "rgba(255,255,255,.05)", borderRadius: 5, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${cur.acc}%`,
              background: `linear-gradient(90deg, ${COLORS.wrong}, ${accent})`,
              borderRadius: 5, transition: "width 600ms cubic-bezier(.2,.7,.3,1)",
            }} />
          </div>
          <span style={{ fontFamily: FONTS.mono, fontSize: 22, color: accent, fontVariantNumeric: "tabular-nums", minWidth: 60, textAlign: "right" }}>{cur.acc}%</span>
        </div>
        <div style={{ marginTop: SPACE.md }}>
          <Button accent={accent} onClick={() => setIdx((i) => (i + 1) % SHUFFLES.length)}>Shuffle the order →</Button>
        </div>
      </Card>
      <Prose muted style={{ fontSize: 15 }}>
        Nothing about the task changed — yet the score wandered from {lo}% to
        {" "}{hi}%. The best order for one model isn't even the best order for
        another.
      </Prose>
      <HonestNote>
        The phenomenon is peer-reviewed — Lu et al., <em>“Fantastically Ordered
        Prompts and Where to Find Them,”</em> ACL 2022, showed example order
        alone can move a model between near state-of-the-art and near
        random-guessing, with no ordering that transfers across models. The
        specific percentages in this demo are illustrative, not from that paper.
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 7: needle vs reasoning ------------------------------------------
function NeedleSlide({ accent }) {
  const [len, setLen] = useState(1); // index into LENGTHS
  const LENGTHS = [1, 4, 8, 16, 32];
  const k = LENGTHS[len];
  // Illustrative: literal needle stays near-perfect; associative/multi-hop
  // collapses with length (NoLiMa-style).
  const literal = Math.round(99 - len * 0.6);
  const assoc = Math.round(97 - Math.pow(len, 1.55) * 8.5);
  const bar = (label, val, color) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <Mono style={{ fontSize: 12, color: COLORS.muted }}>{label}</Mono>
        <Mono style={{ fontSize: 12, color }}>{val}%</Mono>
      </div>
      <div style={{ height: 16, background: "rgba(255,255,255,.05)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.max(0, val)}%`, background: color, borderRadius: 4, transition: "width 500ms cubic-bezier(.2,.7,.3,1)" }} />
      </div>
    </div>
  );

  return (
    <Slide wide>
      <Kicker accent={accent}>“But my model has a huge context window”</Kicker>
      <Heading size="h2">A bigger window isn't a fix.</Heading>
      <Prose muted>
        Long-context models ace the classic test — hide one sentence in a
        haystack and ask for it back word-for-word. But that's the easy case.
        Drag the context length and watch two different tasks diverge.
      </Prose>
      <Card>
        <Mono style={{ fontSize: 11, color: COLORS.faint, display: "block", marginBottom: 14 }}>
          CONTEXT LENGTH — {k}K tokens
        </Mono>
        {bar("Literal needle — the answer shares the question's words", literal, accent)}
        {bar("Associative — the answer means the same thing, different words", assoc, COLORS.wrong)}
        <input
          type="range" min={0} max={LENGTHS.length - 1} step={1} value={len}
          onChange={(e) => setLen(Number(e.target.value))}
          style={{ width: "100%", marginTop: SPACE.sm, accentColor: accent }}
          aria-label="Context length"
        />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {LENGTHS.map((L) => <Mono key={L} style={{ fontSize: 10, color: COLORS.faint }}>{L}K</Mono>)}
        </div>
      </Card>
      <Prose muted style={{ fontSize: 15 }}>
        Literal lookup barely budges. But the moment the answer requires
        <em> associative</em> matching — no shared keywords, or facts that must
        be combined — accuracy falls off a cliff as the window fills.
      </Prose>
      <HonestNote>
        The gap is documented — <em>NoLiMa</em> (Modarressi et al., ICML 2025)
        stripped literal word overlap between question and answer and found that
        11 of 12 models claiming ≥128K context dropped below half their
        short-context score by 32K tokens; GPT-4o fell from ~99% to ~70%. The
        bars here are illustrative of that pattern, not those exact runs.
      </HonestNote>
    </Slide>
  );
}

// ---- Slide 6: the 1M-token reality -----------------------------------------
const CONTEXT_MODELS = [
  ["Gemini 1.5 Pro", "2M tokens", "the largest documented window", false],
  ["Gemini 2.5 Pro", "1M tokens", "shipped and documented", false],
  ["GPT-4.1", "1M tokens", "via the API", false],
  ["Claude Sonnet 4.x", "1M tokens", "beta, tier-gated (200K default)", false],
  ["Llama 4 Scout", "10M advertised", "trained only to 256K — a theoretical ceiling", true],
];

function ContextRealitySlide({ accent }) {
  return (
    <Slide wide>
      <Kicker accent={accent}>The numbers, honestly</Kicker>
      <Heading size="h2">A million tokens is real. Ten million is a slogan.</Heading>
      <Prose muted>
        Context windows have exploded — but “supports N tokens” and “works well
        across N tokens” are different claims. What's actually documented, as of
        mid-2026:
      </Prose>
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {CONTEXT_MODELS.map(([name, size, note, caveat], i) => (
            <div key={name} className="reveal" style={{
              display: "grid", gridTemplateColumns: "1.2fr 1fr 1.6fr", gap: 12, alignItems: "baseline",
              padding: "11px 6px", borderBottom: i < CONTEXT_MODELS.length - 1 ? `1px solid ${COLORS.hairline}` : "none",
              animationDelay: `${i * 80}ms`,
            }}>
              <Mono style={{ fontSize: 14, color: COLORS.text }}>{name}</Mono>
              <Mono style={{ fontSize: 14, color: caveat ? COLORS.wrong : accent }}>{size}</Mono>
              <Prose muted style={{ fontSize: 13, margin: 0 }}>{note}</Prose>
            </div>
          ))}
        </div>
      </Card>
      <Prose muted style={{ fontSize: 15 }}>
        Several frontier models genuinely take ~1M tokens; Gemini 1.5 Pro
        documents 2M. Llama 4 Scout's headline 10M is extrapolated — no variant
        was trained on sequences beyond 256K, and quality degrades long before
        the ceiling.
      </Prose>
      <HonestNote>
        Figures from official model docs (Google AI, OpenAI, Anthropic) and
        Meta's Llama 4 announcement, as of mid-2026. Vendors raise these
        numbers often, and a documented maximum is not a promise of even quality
        across the whole window — which is the entire point of this sidequest.
      </HonestNote>
    </Slide>
  );
}

// ---- The component ----------------------------------------------------------
export default function SqPositionBias({ accent, slide }) {
  switch (slide) {
    case 0:
      return (
        <Slide>
          <Kicker accent={accent}>Sidequest · optional deep dive</Kicker>
          <Heading>Where You Put It Matters</Heading>
          <Lead>
            Chapter 9 left you with a rule: attention only ever looks{" "}
            <em>backward</em>. This sidequest follows that rule to a surprising
            place — the <em>order</em> of what you put in a prompt can change the
            answer, even when every word stays the same.
          </Lead>
          <Prose muted>
            This opened in its own tab, so your place in the course is safe.
            About 12 minutes. When you're done, just close the tab.
          </Prose>
        </Slide>
      );
    case 1:
      return (
        <Slide>
          <Kicker accent={accent}>The premise</Kicker>
          <Heading size="h2">Same words. Different order. Different answer.</Heading>
          <Prose>
            You'd expect a model to treat a prompt like a set of facts: as long
            as the right information is <em>in there somewhere</em>, the position
            shouldn't matter. A person skims back and forth until they find it.
          </Prose>
          <Prose>
            But a model can't skim back and forth — you saw why in Chapter 9.
            Each token is computed once, looking only at what came before it. So
            the same fact, placed early, late, or in the middle, reaches the
            model's “answer position” through a different path. Researchers have
            spent the last three years measuring exactly how much that matters.
            The umbrella terms: <strong>position bias</strong>,{" "}
            <strong>prompt-order sensitivity</strong>, and the headline result —
            <strong> Lost in the Middle</strong>.
          </Prose>
        </Slide>
      );
    case 2:
      return <LostInMiddleSlide accent={accent} />;
    case 3:
      return (
        <Slide>
          <Kicker accent={accent}>Why it happens</Kicker>
          <Heading size="h2">The U-shape falls out of the architecture.</Heading>
          <Prose>
            Two forces from Chapter 9 pull in opposite directions. The{" "}
            <strong>causal mask</strong> means a word only absorbs what came
            before it — so early words get folded into more and more later
            positions, and their influence compounds (<strong>primacy</strong>).
            Meanwhile the positional signal makes each word lean hardest on its
            nearest neighbors (<strong>recency</strong>). Both ends are
            privileged. The middle is the one region neither force favors.
          </Prose>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.xs }}>
            {[
              ["primacy", "causal masking folds early tokens into every later one", "left"],
              ["the weak middle", "far from the start, far from the end — favored by neither", "center"],
              ["recency", "positional signals privilege the most recent tokens", "right"],
            ].map(([name, why, side]) => (
              <div key={name} style={{
                display: "flex", gap: 12, alignItems: "baseline",
                justifyContent: side === "right" ? "flex-end" : side === "center" ? "center" : "flex-start",
              }}>
                <Mono accent={side === "center" ? COLORS.wrong : accent} style={{ fontSize: 13, minWidth: 130 }}>{name}</Mono>
                <Prose muted style={{ fontSize: 14, margin: 0, maxWidth: "44ch" }}>{why}</Prose>
              </div>
            ))}
          </div>
          <HonestNote>
            That causal masking biases toward early positions is proved
            architecturally in Wu et al., <em>“On the Emergence of Position Bias
            in Transformers,”</em> ICML 2025. The stronger claim you may see —
            that the U-shape is visible even in an <em>untrained</em> model,
            before any data — comes from 2026 preprints and is promising but not
            yet settled. Which of primacy or recency wins in practice depends on
            components like LayerNorm and residual connections, an area of active
            2025–26 theory.
          </HonestNote>
        </Slide>
      );
    case 4:
      return <OrderFlipSlide accent={accent} />;
    case 5:
      return <FewShotSlide accent={accent} />;
    case 6:
      return <ContextRealitySlide accent={accent} />;
    case 7:
      return <NeedleSlide accent={accent} />;
    case 8:
      return (
        <Slide>
          <Kicker accent={accent}>So what</Kicker>
          <Heading size="h2">Prompt-building is ordering, not just gathering.</Heading>
          <Prose>
            This is the quiet lesson behind a lot of “prompt engineering” and
            <strong> RAG</strong> (Chapter 13). Retrieval decides <em>what</em>
            {" "}goes in the context; position bias means you also have to decide
            {" "}<em>where</em>. Two practical consequences fall straight out of
            everything you just watched:
          </Prose>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
            <Card>
              <Mono accent={accent} style={{ fontSize: 13 }}>PUT THE CRUCIAL THING AT AN EDGE</Mono>
              <Prose muted style={{ fontSize: 15, marginTop: 6 }}>
                In RAG, the most relevant retrieved document is often placed
                first or last, not buried mid-stack. Instructions tend to land at
                the very start or the very end for the same reason.
              </Prose>
            </Card>
            <Card>
              <Mono accent={accent} style={{ fontSize: 13 }}>MORE CONTEXT CAN MEAN WORSE ANSWERS</Mono>
              <Prose muted style={{ fontSize: 15, marginTop: 6 }}>
                Dumping everything into a 1M-token window pushes the signal into
                the weak middle and dilutes it. Often fewer, better-placed
                documents beat more documents.
              </Prose>
            </Card>
          </div>
          <Prose muted style={{ fontSize: 15 }}>
            None of these are hard laws — the right order depends on the model
            and the task, and it's an active research question (including whether
            RAG documents should be sorted by relevance, by time, or something
            else). The reliable part is the principle: <em>position is a
            variable, so treat it like one.</em>
          </Prose>
        </Slide>
      );
    case 9:
    default:
      return (
        <Slide>
          <Kicker accent={accent}>Sidequest complete</Kicker>
          <Heading size="h2">You followed the backward-only rule to its edge.</Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
            {[
              "Position is a variable: keep the words identical, move the answer, and accuracy traces a U — strong at the ends, weak in the middle (Lost in the Middle).",
              "It's not a bug bolted on by training — causal masking biases toward early tokens, positional signals toward recent ones, and the middle is what's left over.",
              "Order can flip an answer: put the context after the options and the causal mask hides it from the very tokens that need it; reshuffling few-shot examples alone swings the score.",
              "Bigger windows don't fix it — literal needle-in-a-haystack is near-solved, but associative and multi-hop retrieval still collapse as the context fills.",
            ].map((line, i) => (
              <div key={i} className="reveal" style={{ display: "flex", gap: 14, alignItems: "baseline", animationDelay: `${i * 120}ms` }}>
                <span style={{ color: accent, fontFamily: FONTS.mono, fontSize: 14 }}>{String(i + 1).padStart(2, "0")}</span>
                <Prose>{line}</Prose>
              </div>
            ))}
          </div>
          <Prose muted style={{ marginTop: SPACE.sm }}>
            That's the detour. Close this tab and pick the course back up — and
            the next time you build a prompt or a RAG pipeline, you'll know that
            <em> where</em> you put a fact is part of the prompt, not a detail.
          </Prose>
        </Slide>
      );
  }
}
