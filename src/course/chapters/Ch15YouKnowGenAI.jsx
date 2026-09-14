// Chapter 15 — You Know GenAI
// The payoff: Chapter 1's story returns with the pipeline annotated live,
// the whole course in one map, a 13-question explained quiz, and the send-off.
import { useRef, useState } from "react";
import { Slide, Kicker, Heading, Lead, Prose, Card, Button, GhostButton, Mono, Recap } from "../ui/shared.jsx";
import { FONTS, COLORS, SPACE } from "../styles/theme.js";
import { generateStream } from "../lib/api.js";

// ---- Slide 1: the story returns, pipeline annotated live ------------------
const STAGES = ["TOKENIZE", "EMBED", "ATTEND ×96", "PREDICT", "SAMPLE"];
const FINALE_PROMPT =
  "Write a fun, vivid short story (4-6 sentences) about a lighthouse-keeping octopus in the last coffee shop on Mars, where gravity stops working on Tuesdays.";

function AnnotatedStory({ accent }) {
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState(0);
  const outRef = useRef(null);
  const stage = tokens % STAGES.length;

  const run = async () => {
    setLoading(true);
    setOutput("");
    setTokens(0);
    try {
      const r = await generateStream(FINALE_PROMPT, {
        temperature: 0.9, maxTokens: 220,
        onToken: (_, t) => {
          setOutput(t);
          setTokens((n) => n + 1);
          outRef.current?.scrollTo(0, outRef.current.scrollHeight);
        },
      });
      if (r.blocked) setOutput("(blocked — run it again)");
    } catch (err) {
      setOutput(`Couldn't reach the model: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <Slide wide>
      <Kicker accent={accent}>Chapter 1, revisited</Kicker>
      <Heading size="h2">The same trick. No longer magic.</Heading>
      <Prose muted>
        The octopus, the coffee shop, the broken gravity — the exact prompt
        from the first slide of this course. Watch the pipeline you now know
        fire once for every piece of the story.
      </Prose>
      {/* Pipeline ticker */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        {STAGES.map((s, i) => (
          <Mono
            key={s}
            style={{
              fontSize: 12, padding: "6px 10px", borderRadius: 8,
              border: `1px solid ${loading && i === stage ? accent : COLORS.hairline}`,
              color: loading && i === stage ? accent : COLORS.faint,
              background: loading && i === stage ? accent + "18" : "transparent",
              transition: "all 120ms",
            }}
          >
            {s}
          </Mono>
        ))}
        <Mono style={{ fontSize: 12, color: COLORS.faint }}>
          ↺ {tokens > 0 ? `${tokens} full passes` : "one full pass per piece"}
        </Mono>
      </div>
      {output !== null && (
        <Card style={{ maxHeight: 240, overflowY: "auto" }}>
          <div ref={outRef} style={{ fontFamily: FONTS.display, fontSize: 20, fontStyle: "italic", lineHeight: 1.7 }}>
            {output}{loading && <span style={{ animation: "v2Blink 1s infinite", color: accent }}>▌</span>}
          </div>
        </Card>
      )}
      <div>
        <Button accent={accent} onClick={run} disabled={loading}>
          {loading ? "Running the machine…" : output !== null ? "Run it again" : "Run the machine"}
        </Button>
      </div>
      {output && !loading && (
        <Prose muted style={{ fontSize: 15 }} className="reveal">
          In Chapter 1 this was a magic trick. Now you can narrate it: text
          chopped to tokens, tokens to coordinates on the map of meaning,
          attention pulling context, ~100 layers refining, a probability list,
          one roll of the dice — append, repeat. {tokens} times, just now.
        </Prose>
      )}
    </Slide>
  );
}

// ---- Slide 3: the quiz ------------------------------------------------------
// Every option carries its own explanation, shown when picked — right or wrong.
const QUIZ = [
  {
    q: "Underneath everything a chatbot does — answering, coding, joking — there is exactly one operation. What is it?",
    options: [
      { text: "Searching a huge database of stored answers", why: "There's no database of answers — the text is generated fresh, token by token. Nothing you read was retrieved; it was predicted." },
      { text: "Predicting the next token, over and over", correct: true, why: "That's the whole machine: score every possible next piece, pick one, append it, repeat. Everything else in the course explains how that prediction got so good." },
      { text: "Matching your question against programmed rules", why: "Rules were the pre-AI approach — and Chapter 3 showed why they collapse under real language. Nobody wrote rules for the model to follow." },
      { text: "Running a different specialized module for each task", why: "There is no poetry module or code module — one prediction loop handles all of it, which is exactly what made the mystery worth a course." },
    ],
  },
  {
    q: "A model trained on thousands of jokes can complete a joke it has never seen. What does that prove?",
    options: [
      { text: "It memorized every joke in existence", why: "It can't have — this joke wasn't in the training data. Memorization can't explain performance on genuinely new text." },
      { text: "It learned the pattern of jokes, not a list of answers", correct: true, why: "Right. Training nudged the weights until they captured the shape of jokes — setups, misdirection, puns. Patterns generalize; lookup tables don't." },
      { text: "Humans secretly wrote joke rules into it", why: "Nobody writes rules into a model — Chapter 4's loop is guess, check, adjust. The 'rules' emerge in the weights, unreadable even to its builders." },
      { text: "It searched the internet for similar jokes", why: "A model has no internet access while answering (unless given a tool) — everything comes from patterns frozen into its weights at training time." },
    ],
  },
  {
    q: "What is a “weight” in a neural network?",
    options: [
      { text: "How important the user's question is", why: "Weights have nothing to do with any single question — they're the model's permanent internals, fixed after training." },
      { text: "One of billions of adjustable numbers that training slowly tunes", correct: true, why: "Exactly — the dials from Chapter 4. Every nudge of training adjusts them slightly, and everything the model 'knows' lives nowhere else." },
      { text: "The size of the training data file", why: "Data size matters (Chapter 5), but a weight is a parameter inside the model — GPT-3 has 175 billion of them." },
      { text: "The probability assigned to a token", why: "Probabilities are the model's output, recomputed for every prediction. Weights are what compute them — the machinery, not the result." },
    ],
  },
  {
    q: "What's the difference between RLHF and verifiable rewards (RLVR)?",
    options: [
      { text: "RLHF uses human preference judgments; RLVR uses answers a program can check automatically", correct: true, why: "Yes. Humans compare responses to teach values and style; a checker verifies math and code to sharpen reasoning — no human in that loop, so it runs millions of times a day." },
      { text: "They're two names for the same technique", why: "They share the reinforcement idea but differ in the judge: human opinion (RLHF) versus automatic verification (RLVR). The difference matters — one scales with people, the other with compute." },
      { text: "RLVR uses humans; RLHF uses computers", why: "It's the reverse — the H in RLHF is 'Human' (feedback), and the V in RLVR is 'Verifiable' (a program checks the answer)." },
      { text: "RLHF happens before pretraining", why: "Both come after pretraining — first the model learns language from trillions of words, then it gets raised: instruction tuning, RLHF, and RLVR." },
    ],
  },
  {
    q: "Why do models break text into ~100,000 tokens (word-pieces) instead of using whole words?",
    options: [
      { text: "Computers can't store whole words", why: "They can — that's not the constraint. The problem is coverage: a whole-word menu breaks the moment it meets a word it's never seen." },
      { text: "A fixed menu of reusable pieces can spell anything — even words that didn't exist yesterday", correct: true, why: "Right — common words get one token, rare ones assemble from pieces ('un'+'believ'+'able'). Nothing is ever unspellable, at a manageable menu size." },
      { text: "Tokens carry more accurate meanings than words", why: "If anything the opposite — chopping 'unbelievable' into three pieces makes meaning harder, not easier. Tokens are a practical compromise about coverage, not meaning." },
      { text: "It's a marketing term for words", why: "It's a real technical unit with real consequences — you watched one word take two prediction cycles, and saw why models fumble arithmetic." },
    ],
  },
  {
    q: "In the embedding space — the “map of meaning” — what does distance between two words represent?",
    options: [
      { text: "How similar their spellings are", why: "Spelling is irrelevant on the map — 'cat' and 'kitten' share almost no letters and sit close; 'cat' and 'cart' are neighbors in spelling and far apart in meaning." },
      { text: "How similar their meanings are", correct: true, why: "That's the map's whole trick: training arranges words so that similar meanings land close together — and directions carry meaning too (king − man + woman ≈ queen)." },
      { text: "How recently the model learned them", why: "The model has no timeline of learning — all training blends into the same weights. Position encodes meaning, not history." },
      { text: "How frequently they appear in text", why: "Frequency influences training, but the geometry encodes meaning: rare and common words about the same topic cluster together." },
    ],
  },
  {
    q: "A model has ~12,288 embedding dimensions but knows millions of concepts. How do they all fit?",
    options: [
      { text: "They don't — a model can only know 12,288 things", why: "That would follow if every concept needed its own perpendicular axis — but the demo showed the escape hatch: in high dimensions, you don't need exactly perpendicular." },
      { text: "Concepts share the space as nearly-perpendicular directions — and there's exponentially more room than intuition suggests", correct: true, why: "The high-dimensional loophole you computed live: random directions in 12,288-D are all within a couple of degrees of perpendicular, so millions of almost-independent concepts fit — and the tiny overlaps are similarity itself." },
      { text: "New dimensions get added as the model learns new concepts", why: "The dimensions are fixed when the model is built — nothing grows during training except how cleverly the fixed space is used." },
      { text: "Concepts are compressed like files in a zip archive", why: "Nothing is compressed and unpacked — every concept is simultaneously present as a direction. The trick is geometric (near-orthogonality), not compression." },
    ],
  },
  {
    q: "In “I swung the bat at the ball,” what does attention do for the word “bat”?",
    options: [
      { text: "Looks up “bat” in a built-in dictionary", why: "The embedding lookup already happened — and it returned the same ambiguous vector both kinds of bat share. Dictionaries can't resolve context." },
      { text: "Mixes in information from the surrounding words, moving “bat” toward its baseball meaning", correct: true, why: "Exactly — 'swung' and 'ball' get mixed into bat's vector, sliding it across the map of meaning toward the sports cluster. Context becomes part of the word." },
      { text: "Deletes the animal meaning from the model", why: "Nothing is deleted — the model's weights still know both bats. Attention adjusts this sentence's copy of the vector, this one time." },
      { text: "Asks the user which meaning was intended", why: "No clarification happens — the sentence itself carries the answer, and attention is the mechanism that reads it, the way you do without noticing." },
    ],
  },
  {
    q: "What happens between layer 1 and layer 96 of a transformer?",
    options: [
      { text: "The same computation repeats to double-check the answer", why: "Each layer has its own learned weights doing different work — it's refinement, not repetition. Layer 40 genuinely does different things than layer 4." },
      { text: "Understanding compounds: surface patterns in the first layers, facts in the middle, meaning and reasoning in the final layers", correct: true, why: "Right — researchers probing real models find roughly this progression. Each layer's output feeds the next, so sophistication accumulates pass by pass." },
      { text: "The model gets 96 chances to guess and picks its best", why: "There's only one prediction at the end — the layers aren't separate guesses but one deepening computation that produces it." },
      { text: "Each layer handles a different language", why: "Languages aren't separated by layer — all layers process everything, and the division of labor that does emerge (syntax→facts→meaning) was discovered, not designed." },
    ],
  },
  {
    q: "You run the same prompt twice at temperature 1.4 and get different answers. Why?",
    options: [
      { text: "The model learned something between the two runs", why: "Nothing changes between runs — weights are frozen after training. Same model, same knowledge, both times." },
      { text: "Generation rolls weighted dice over the candidates, and higher temperature flattens the odds so different tokens can win", correct: true, why: "That's the dial you turned: the probabilities get reshaped, the dice get bolder, and one different early pick sends the whole text down a different path." },
      { text: "The servers were busier the second time", why: "Load affects speed, not word choice. The variation is deliberate, controlled randomness — turn temperature near 0 and the answers converge." },
      { text: "The model has moods", why: "No internal state carries between runs — what reads as mood is sampling noise plus your pattern-seeking brain (which, to be fair, is an excellent prediction machine)." },
    ],
  },
  {
    q: "A reasoning model “thinks” for 30 seconds before answering. What is actually happening?",
    options: [
      { text: "A special logic engine runs, separate from the language model", why: "No second engine exists — it's the same transformer generating tokens. The breakthrough was training, not new machinery." },
      { text: "It generates thousands of ordinary tokens of reasoning — usually hidden from you — that become context for the final answer", correct: true, why: "Exactly: the thinking is next-token prediction too, trained via verifiable rewards so that writing reasoning first makes answers better. You wait (and pay) for tokens you may never see." },
      { text: "It searches the web for the answer", why: "Thinking time is generation, not search — unless a tool is explicitly involved, no external lookup happens during those seconds." },
      { text: "It's a delay added to seem thoughtful", why: "The delay is real computation — harder questions genuinely get more thinking tokens, and the measured accuracy gains from that extra compute are why these models exist." },
    ],
  },
  {
    q: "You told a chatbot your city in message one, and twenty messages later it still knows. How?",
    options: [
      { text: "The conversation updated the model's weights", why: "Weights are frozen after training — nothing you say changes the model, ever. Millions of people use the same frozen model simultaneously." },
      { text: "The app resends the entire conversation with every message (and may inject saved notes into new chats)", correct: true, why: "That's the illusion: each turn, the full transcript goes back in and gets re-read — providers cache the repeated attention work to keep it fast — and apps keep their own notes ('lives in Portland') to paste into future prompts." },
      { text: "The model keeps a private RAM slot for each user", why: "There's no per-user state inside the model — between calls it holds nothing at all. Any continuity you experience was assembled by the app, in the prompt." },
      { text: "It only seems to remember; it's guessing your city", why: "It genuinely has your city — but from the context the app sent, not from memory. Delete the transcript and the saved notes, and the recall vanishes completely." },
    ],
  },
  {
    q: "Why does a model sometimes state false things in a perfectly confident tone?",
    options: [
      { text: "It's deliberately lying", why: "Lying requires knowing the truth and choosing otherwise — the model has no such ledger. It's doing exactly what it always does: continuing text plausibly." },
      { text: "It was trained to produce plausible text, and when plausibility and truth disagree, plausible wins — confidence is just style", correct: true, why: "That's hallucination, mechanically understood. And the fix follows from the same insight: put the truth in the context (paste it, retrieve it, or fetch it with a tool), because the model reliably continues what it's given." },
      { text: "Its memory is too small to hold the truth", why: "It's not a memory-size problem — the model may state the same fact correctly in another phrasing. The failure is in what prediction optimizes for, not storage." },
      { text: "The internet it trained on is entirely wrong", why: "Training data has errors, but hallucination happens even about things the data got right — the mechanism is plausible-continuation, which can fabricate freely when specifics are missing." },
    ],
  },
];

function Quiz({ accent }) {
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState(null);
  const [history, setHistory] = useState([]); // boolean per answered question
  const [done, setDone] = useState(false);

  const score = history.filter(Boolean).length;
  const question = QUIZ[qi];
  const correctIdx = question?.options.findIndex((o) => o.correct);

  const pick = (i) => {
    if (picked !== null) return;
    setPicked(i);
    setHistory((h) => [...h, Boolean(question.options[i].correct)]);
  };

  const next = () => {
    setPicked(null);
    if (qi + 1 >= QUIZ.length) setDone(true);
    else setQi(qi + 1);
  };

  const restart = () => { setQi(0); setPicked(null); setHistory([]); setDone(false); };

  if (done) {
    const pct = score / QUIZ.length;
    const [title, message] =
      pct >= 0.9
        ? ["You know GenAI. Officially.", "That score would hold up in a room full of engineers. You didn't memorize trivia — every one of those answers required understanding the mechanism, and you had it."]
        : pct >= 0.7
          ? ["You genuinely know how this works.", "A strong score — and look at what it covers: training, embeddings, attention, sampling, reasoning, failure modes. The ones you missed have explanations above; skim the linked chapter and they'll lock in."]
          : pct >= 0.5
            ? ["The foundation is real.", "You're answering questions most AI users can't. The chapters behind the ones you missed are short — a second pass through two or three of them will change these numbers fast."]
            : ["The map is drawn — walk it again.", "This material is genuinely deep, and the course was built for revisiting: every chapter stands alone. Pick the topics that felt shaky, replay their demos, and retake this anytime."];
    return (
      <Slide>
        <Kicker accent={accent}>Results</Kicker>
        <Heading size="h2">
          <span style={{ color: accent, fontFamily: FONTS.mono }}>{score}/{QUIZ.length}</span> — {title}
        </Heading>
        <Prose>{message}</Prose>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {history.map((ok, i) => (
            <span
              key={i}
              title={`Question ${i + 1}`}
              style={{ width: 22, height: 6, borderRadius: 3, background: ok ? COLORS.correct : COLORS.wrong + "88" }}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: SPACE.sm }}>
          <GhostButton onClick={restart}>Retake the quiz</GhostButton>
        </div>
      </Slide>
    );
  }

  return (
    <Slide wide>
      <Kicker accent={accent}>Prove it — question {qi + 1} of {QUIZ.length}{score > 0 ? ` · ${score} correct` : ""}</Kicker>
      <Heading size="h3" style={{ fontSize: 26 }}>{question.q}</Heading>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {question.options.map((o, i) => {
          const isPicked = picked === i;
          const showState = picked !== null && (isPicked || i === correctIdx);
          const good = o.correct;
          return (
            <div key={i}>
              <button
                onClick={() => pick(i)}
                style={{
                  width: "100%", textAlign: "left", padding: "14px 18px", borderRadius: 12,
                  background: COLORS.surface,
                  border: `1px solid ${showState ? (good ? COLORS.correct : COLORS.wrong) + "88" : COLORS.hairline}`,
                  cursor: picked === null ? "pointer" : "default",
                  opacity: picked !== null && !showState ? 0.45 : 1,
                  fontSize: 16, color: COLORS.text, lineHeight: 1.5,
                  transition: "border-color 250ms, opacity 300ms",
                }}
              >
                <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: showState ? (good ? COLORS.correct : COLORS.wrong) : COLORS.faint, marginRight: 12 }}>
                  {showState ? (good ? "✓" : "✗") : String.fromCharCode(65 + i)}
                </span>
                {o.text}
              </button>
              {showState && (
                <div className="reveal" style={{
                  margin: "6px 0 4px 34px", padding: "10px 14px", borderRadius: 10,
                  borderLeft: `2px solid ${good ? COLORS.correct : COLORS.wrong}`,
                  fontSize: 14.5, color: COLORS.muted, lineHeight: 1.65,
                }}>
                  {o.why}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {picked !== null && (
        <div className="reveal">
          <Button accent={accent} onClick={next}>
            {qi + 1 >= QUIZ.length ? "See your results" : "Next question"}
          </Button>
        </div>
      )}
    </Slide>
  );
}

// ---- Chapter ----------------------------------------------------------------
export default function Ch14YouKnowGenAI({ accent, slide }) {
  switch (slide) {
    case 0:
      return (
        <Slide>
          <Kicker accent={accent}>Act V · Powers and Limits — Chapter 15</Kicker>
          <Heading>You Know GenAI</Heading>
          <Lead>
            Fourteen chapters ago, a machine wrote a story one word at a time
            and we called it impossible. Time to collect on everything you've
            learned.
          </Lead>
        </Slide>
      );
    case 1:
      return <AnnotatedStory accent={accent} />;
    case 2:
      return (
        <Slide wide>
          <Kicker accent={accent}>The whole course, one breath</Kicker>
          <Heading size="h2">You can now say this — and mean every word.</Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["1-2", "Everything is next-token prediction — and prediction done well enough demands understanding."],
              ["3-4", "Nobody wrote the rules. A guess-check-adjust loop, run trillions of times, grew them into billions of weights."],
              ["5-6", "Scale made it fluent; humans made it helpful — preferences taught values, verified rewards sharpened reasoning."],
              ["7-8", "Words become tokens become points on a map of meaning — with room for millions of concepts in the near-perpendicular corners of high dimensions."],
              ["9-10", "Attention lets context reshape every word; a hundred stacked layers turn spelling into reasoning."],
              ["11-12", "Generation is weighted dice — temperature sets the daring — and “thinking” is the same prediction, given room to work."],
              ["13", "It fails exactly the way a plausibility machine must — and every fix is a smarter way to fill its context."],
            ].map(([ch, line], i) => (
              <div key={ch} className="reveal" style={{ animationDelay: `${i * 130}ms`, display: "flex", gap: 14, alignItems: "baseline" }}>
                <Mono accent={accent} style={{ fontSize: 12, minWidth: 44 }}>{ch}</Mono>
                <Prose style={{ fontSize: 16.5 }}>{line}</Prose>
              </div>
            ))}
          </div>
        </Slide>
      );
    case 3:
      return <Quiz accent={accent} />;
    case 4:
      return (
        <Slide>
          <Kicker accent={accent}>One last question</Kicker>
          <Heading size="h2">Does knowing change how you use it?</Heading>
          <Prose>
            It should — in specific, practical ways. You'll paste in the
            document instead of hoping the model knows it. You'll ask for
            step-by-step work on anything with logic in it. You'll turn the
            temperature down for facts and up for brainstorms. You'll hear a
            confident tone and remember it's a style, not a source. And when
            someone says “it's just autocomplete” — or “it's basically alive” —
            you'll know precisely what's wrong with both.
          </Prose>
          <Prose muted>
            The machine didn't change today. You did.
          </Prose>
        </Slide>
      );
    case 5:
    default:
      return (
        <Recap
          accent={accent}
          lines={[
            "The impossible machine was never magic: tokens, a map of meaning, attention, layers, dice — in a loop.",
            "Its powers and its failures come from the same design, and knowing which is which is the whole skill.",
            "Every demo you ran was the real thing. This course had no simulations — and now, no mysteries.",
          ]}
          next="That's the course. The chapter list is always here — every demo replays, and the quiz will still be waiting."
        />
      );
  }
}
