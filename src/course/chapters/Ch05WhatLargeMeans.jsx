// Chapter 5 — What "Large" Means
// The scale chapter: data, parameters, compute — then the name (LLM) and the
// model families, placed here so "model" already means something.
import { Slide, Kicker, Heading, Lead, Prose, Card, Mono, HonestNote, Recap, CountUp, Term } from "../ui/shared.jsx";
import { FONTS, COLORS, SPACE } from "../styles/theme.js";

function ScaleRow({ label, value, sub, accent, big }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 14, color: COLORS.muted }}>{label}</span>
      <span style={{ fontFamily: FONTS.mono, fontSize: big ? 34 : 24, color: accent, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: 13, color: COLORS.faint }}>{sub}</span>}
    </div>
  );
}

const FAMILIES = [
  { name: "GPT", org: "OpenAI", note: "The series behind ChatGPT — the launch that made LLMs famous.", open: false },
  { name: "Claude", org: "Anthropic", note: "Built with a heavy research focus on safety and reliability.", open: false },
  { name: "Gemini", org: "Google", note: "Woven into Search, Android, and Google's products.", open: false },
  { name: "Llama", org: "Meta", note: "Weights published for anyone to download, run, and modify.", open: true },
];

export default function Ch05WhatLargeMeans({ accent, slide }) {
  switch (slide) {
    case 0:
      return (
        <Slide>
          <Kicker accent={accent}>Act II · Learning Without Rules — Chapter 5</Kicker>
          <Heading>What “Large” Means</Heading>
          <Lead>
            The learning loop is simple. What's not simple is the scale it runs
            at. This chapter is three numbers — each one worth sitting with.
          </Lead>
        </Slide>
      );
    case 1:
      return (
        <Slide wide>
          <Kicker accent={accent}>Number one — the data</Kicker>
          <Heading size="h2">Your lifetime of reading, times seventy thousand.</Heading>
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: SPACE.md }}>
              <ScaleRow
                label="A devoted reader's lifetime (≈2,000 books)"
                value={<CountUp to={160} duration={1200} format={(n) => `~${n}M words`} />}
                accent={COLORS.muted}
              />
              <ScaleRow
                label="English Wikipedia, all of it"
                value={<CountUp to={45} duration={1400} format={(n) => `~${(n / 10).toFixed(1)}B words`} />}
                accent={COLORS.text}
              />
              <ScaleRow
                label="Frontier model training data"
                value={<CountUp to={11} duration={1800} format={(n) => `~${n}T words`} />}
                sub="Meta's Llama 3, publicly documented"
                accent={accent}
                big
              />
            </div>
          </Card>
          <Prose>
            Eleven trillion words is roughly <strong>seventy thousand lifetimes
            of devoted reading</strong> — or about two and a half thousand
            copies of all of English Wikipedia. The loop from last chapter ran
            over all of it.
          </Prose>
          <HonestNote>
            AI labs actually count in “tokens” — word-pieces, a bit smaller than
            words. Llama 3's documented figure is 15 trillion tokens, which is
            roughly 11 trillion words. What a token is, and why models use them,
            gets its own treatment in Chapter 7.
          </HonestNote>
        </Slide>
      );
    case 2:
      return (
        <Slide>
          <Kicker accent={accent}>Number two — the dials</Kicker>
          <Heading size="h2">
            <CountUp to={175000000000} duration={2200} format={(n) => n.toLocaleString()} style={{ color: accent, fontSize: 38 }} />
            <span style={{ display: "block", marginTop: 8 }}>weights.</span>
          </Heading>
          <Prose>
            GPT-3, the 2020 model that started the modern era, had 175 billion
            of the dials you trained in Chapter 4. If you turned one per second,
            you'd finish in about <strong>5,500 years</strong>.
          </Prose>
          <Prose muted>
            All the patterns of language — grammar, facts, joke shapes, coding
            styles — live nowhere except in the settings of these numbers.
          </Prose>
          <HonestNote>
            Model sizes vary hugely and newer frontier models don't disclose
            theirs. Some modern models are far larger than GPT-3; some
            surprisingly capable ones are far smaller. "Billions of weights" is
            the honest general statement.
          </HonestNote>
        </Slide>
      );
    case 3:
      return (
        <Slide>
          <Kicker accent={accent}>Number three — the compute</Kicker>
          <Heading size="h2">Months of warehouse-scale arithmetic.</Heading>
          <Prose>
            Training a frontier model means running the guess-check-adjust loop
            on <strong>tens of thousands of specialized chips
            (<Term t="gpu" accent={accent}>GPUs</Term>) running in
            parallel for months</strong>, in data centers drawing as much power
            as a small town. Training runs are estimated to cost from tens to
            hundreds of millions of dollars.
          </Prose>
          <Prose muted>
            This is why the loop wasn't enough on its own for decades. The idea
            is from the 1980s; the scale only became possible recently. One of
            the strangest findings in AI: the same simple recipe, made bigger,
            keeps getting <em>smarter</em> — abilities appear at scale that
            smaller versions simply don't have.
          </Prose>
        </Slide>
      );
    case 4:
      return (
        <Slide>
          <Kicker accent={accent}>Name it</Kicker>
          <Heading size="h2">Large Language Model.</Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
            {[
              ["Large", "Trillions of words of training data, billions of weights, warehouse-scale compute."],
              ["Language", "Trained on text, to predict text. (Newer models also handle images and audio — “multimodal.”)"],
              ["Model", "A mathematical object that captures the patterns of the thing it was trained on — the way a weather model captures the atmosphere."],
            ].map(([word, def], i) => (
              <div key={word} className="reveal" style={{ animationDelay: `${i * 200}ms`, display: "flex", gap: 16, alignItems: "baseline" }}>
                <span style={{ fontFamily: FONTS.display, fontSize: 30, color: accent, minWidth: 150 }}>{word}</span>
                <Prose muted>{def}</Prose>
              </div>
            ))}
          </div>
          <Prose style={{ marginTop: SPACE.sm }}>
            Three ordinary words, and now you know precisely what each one is
            doing. When someone says “LLM,” this — all of Act II — is what they
            mean.
          </Prose>
        </Slide>
      );
    case 5:
      return (
        <Slide wide>
          <Kicker accent={accent}>The players</Kicker>
          <Heading size="h2">Same recipe, different kitchens.</Heading>
          <Prose muted>
            Every major AI assistant is a large language model built on the
            ideas you now know. The differences are in data, scale, and the
            "raising" — next chapter.
          </Prose>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: SPACE.sm }}>
            {FAMILIES.map((f, i) => (
              <Card key={f.name} style={{ animationDelay: `${i * 100}ms` }} className="reveal">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: FONTS.display, fontSize: 24 }}>{f.name}</span>
                  <Mono style={{ fontSize: 12, color: f.open ? COLORS.correct : COLORS.faint }}>
                    {f.open ? "OPEN WEIGHTS" : "CLOSED"}
                  </Mono>
                </div>
                <div style={{ fontSize: 13, color: accent, marginTop: 2 }}>{f.org}</div>
                <div style={{ fontSize: 14, color: COLORS.muted, marginTop: 8, lineHeight: 1.6 }}>{f.note}</div>
              </Card>
            ))}
          </div>
          <Prose muted style={{ fontSize: 15 }}>
            “Open weights” means the trained dials are published — anyone can run
            or modify the model. “Closed” means you can only use it through the
            company's service. (People say “open source,” but the training data
            and code usually stay private — the honest term is open weights.)
          </Prose>
        </Slide>
      );
    case 6:
    default:
      return (
        <Recap
          accent={accent}
          lines={[
            "Training data: trillions of words — tens of thousands of human reading-lifetimes.",
            "The learned patterns live in billions of weights; nothing else is stored. Compute at warehouse scale makes it possible.",
            "That's the whole name: Large Language Model. GPT, Claude, Gemini, and Llama are all this same recipe.",
          ]}
          next="Raised by Humans — why raw pretraining gives you a wild autocomplete, and how humans civilize it."
        />
      );
  }
}
