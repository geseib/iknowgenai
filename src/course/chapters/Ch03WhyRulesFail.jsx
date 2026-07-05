// Chapter 3 — Why Rules Fail
// The learner tries to write rules for English and watches edge cases destroy
// them; then the pivot to learning from examples (and the bias seed).
import { useState } from "react";
import { Slide, Kicker, Heading, Lead, Prose, Card, Mono, Recap, Term } from "../ui/shared.jsx";
import { FONTS, COLORS, SPACE } from "../styles/theme.js";

// A rule and the words that break it. Learner tests each word, watches the
// rule survive or fail.
const RULE_ROUNDS = [
  {
    rule: "To make a word plural, add “-s”.",
    cases: [
      { word: "dog", result: "dogs", ok: true },
      { word: "cat", result: "cats", ok: true },
      { word: "child", result: "childs?", ok: false, fix: "children" },
      { word: "sheep", result: "sheeps?", ok: false, fix: "sheep" },
    ],
  },
  {
    rule: "Fine — add exceptions. “-s”, except a memorized list.",
    cases: [
      { word: "box", result: "boxs?", ok: false, fix: "boxes" },
      { word: "city", result: "citys?", ok: false, fix: "cities" },
      { word: "mouse", result: "mouses?", ok: false, fix: "mice" },
      { word: "die (a game cube)", result: "dies?", ok: false, fix: "dice" },
    ],
  },
];

function RuleGame({ accent, round }) {
  const { rule, cases } = RULE_ROUNDS[round];
  const [revealed, setRevealed] = useState([]);
  const failures = revealed.filter((i) => !cases[i].ok).length;
  const allRevealed = revealed.length === cases.length;

  return (
    <Slide wide>
      <Kicker accent={accent}>{round === 0 ? "Your first rule" : "Patch it and try again"}</Kicker>
      <Heading size="h2">{round === 0 ? "Write the rules of English." : "More exceptions. More patches."}</Heading>
      <Card style={{ borderColor: accent + "44" }}>
        <Mono accent={accent} style={{ fontSize: 16 }}>RULE: {rule}</Mono>
      </Card>
      <Prose muted>Test the rule — click each word:</Prose>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: SPACE.sm }}>
        {cases.map((c, i) => {
          const isRevealed = revealed.includes(i);
          return (
            <button
              key={c.word}
              onClick={() => !isRevealed && setRevealed((r) => [...r, i])}
              style={{
                background: COLORS.surface,
                border: `1px solid ${isRevealed ? (c.ok ? COLORS.correct : COLORS.wrong) + "66" : COLORS.hairline}`,
                borderRadius: 12,
                padding: SPACE.sm,
                textAlign: "left",
                cursor: isRevealed ? "default" : "pointer",
                transition: "border-color 280ms",
              }}
            >
              <div style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.text }}>{c.word}</div>
              {isRevealed ? (
                <div className="reveal" style={{ marginTop: 6, fontSize: 15 }}>
                  <span style={{ color: c.ok ? COLORS.correct : COLORS.wrong }}>
                    {c.ok ? "✓ " : "✗ "}{c.result}
                  </span>
                  {!c.ok && (
                    <span style={{ color: COLORS.muted }}> — it's <em>{c.fix}</em></span>
                  )}
                </div>
              ) : (
                <div style={{ marginTop: 6, fontSize: 14, color: COLORS.faint }}>apply the rule →</div>
              )}
            </button>
          );
        })}
      </div>
      {allRevealed && (
        <Prose className="reveal">
          {round === 0
            ? <>Two exceptions in four words. Fine — patch the rule. (Next slide.)</>
            : <>{failures} more failures. Every patch spawns new exceptions. Linguists have catalogued <em>hundreds</em> of English pluralization patterns — and plurals are the <em>easy</em> part of language.</>}
        </Prose>
      )}
    </Slide>
  );
}

export default function Ch03WhyRulesFail({ accent, slide }) {
  switch (slide) {
    case 0:
      return (
        <Slide>
          <Kicker accent={accent}>Act II · Learning Without Rules — Chapter 3</Kicker>
          <Heading>Why Rules Fail</Heading>
          <Lead>
            If a computer needs to handle language, the obvious plan is to
            program in the rules of grammar. For about forty years, that was
            the plan. Here's your chance to see why it failed.
          </Lead>
        </Slide>
      );
    case 1:
      return <RuleGame accent={accent} round={0} />;
    case 2:
      return <RuleGame accent={accent} round={1} />;
    case 3:
      return (
        <Slide>
          <Kicker accent={accent}>And it gets worse</Kicker>
          <Heading size="h2">Meaning doesn't follow rules at all.</Heading>
          <Prose>What rule tells you which “bank” this is?</Prose>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: FONTS.display, fontSize: 20, fontStyle: "italic" }}>
              <span>“She sat by the <span style={{ color: accent }}>bank</span> and watched the river.”</span>
              <span>“She sat by the <span style={{ color: accent }}>bank</span> and watched her savings.”</span>
            </div>
          </Card>
          <Prose>
            You resolved that instantly — from context, not from a rule anyone
            taught you. Add sarcasm (“Oh, <em>great</em>.”), idioms (“kick the
            bucket”), and new slang invented last month, and the rulebook
            approach collapses.
          </Prose>
          <Prose muted>
            This isn't hypothetical history. From the 1950s to the 1990s,
            researchers built translation systems and{" "}
            “<Term t="expert-systems" accent={accent}>expert systems</Term>” from
            hand-written rules. They worked in narrow demos and broke everywhere
            else. Decades of effort never produced a machine that could hold a
            fluent conversation.
          </Prose>
        </Slide>
      );
    case 4:
      return (
        <Slide>
          <Kicker accent={accent}>The pivot</Kicker>
          <Heading size="h2">Nobody taught you grammar first.</Heading>
          <Prose>
            By age four you spoke in grammatical sentences. You had never heard
            the word “grammar.” You learned from <strong>examples</strong> —
            thousands of hours of hearing people talk — and your brain extracted
            the patterns on its own.
          </Prose>
          <Prose>
            That's the alternative to rules: don't tell the machine <em>how</em>
            language works. Show it enormous amounts of language, and build a
            machine that can <strong>find the patterns itself.</strong>
          </Prose>
          <Card>
            <div style={{ display: "flex", gap: SPACE.md, flexWrap: "wrap", fontSize: 15 }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <Mono style={{ color: COLORS.wrong, fontSize: 13 }}>OLD PLAN</Mono>
                <div style={{ color: COLORS.muted, marginTop: 6 }}>Humans write the rules → machine follows them → breaks on exceptions</div>
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <Mono style={{ color: COLORS.correct, fontSize: 13 }}>NEW PLAN</Mono>
                <div style={{ color: COLORS.muted, marginTop: 6 }}>Machine reads examples → finds the patterns itself → exceptions are just more patterns</div>
              </div>
            </div>
          </Card>
        </Slide>
      );
    case 5:
      return (
        <Slide>
          <Kicker accent={accent}>The fine print</Kicker>
          <Heading size="h2">Learning from examples has a price.</Heading>
          <Prose>
            A machine that learns everything from its examples inherits
            <em> everything</em> from its examples. The patterns it finds are the
            patterns that were there — including the accidents, the gaps, and
            the prejudices of whoever wrote the text.
          </Prose>
          <Prose>
            Show it mostly one dialect, and other dialects look like “errors.”
            If old text underrepresents some groups of people, the model absorbs
            that skew as if it were a fact about the world.
          </Prose>
          <Prose muted>
            Hold onto this. It's the root of AI bias, and we'll return to it
            properly in Chapter 13 — it is a direct, unavoidable consequence of
            the design choice you just watched being made.
          </Prose>
        </Slide>
      );
    case 6:
    default:
      return (
        <Recap
          accent={accent}
          lines={[
            "Hand-written rules fail on language: every rule breeds exceptions, and meaning depends on context, not rules.",
            "The alternative — the founding move of modern AI — is learning patterns from massive amounts of examples.",
            "A machine that learns from examples inherits its examples' flaws. Bias isn't a bug that crept in; it's baked into the method.",
          ]}
          next="The Learning Loop — the actual mechanism: guess, check, adjust, a few trillion times."
        />
      );
  }
}
