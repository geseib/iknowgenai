// "When AI Is Confidently Wrong" — the hallucination beat, all grades.
// Beat 1: a confident answer; the class votes on whether to trust it; reveal.
// Beat 2: why it happens (it predicts words that sound right).
// Beat 3 (3-5 / 7-8): what to do about it.

import { Warning, Calculator, BookOpenText, ChalkboardTeacher, Sparkle } from "@phosphor-icons/react";
import { Label, H1, TeacherNote, KidNote, PresSlide, PresText } from "./shared";
import { PredictGate } from "./classroom";
import { useTally } from "./useTally";
import { useGrade } from "../data/GradeContext";

// Grade-specific traps. Each is a real kind of mistake: a wrong fact, wrong arithmetic, a made-up book.
const TRAPS = {
  "K-2": {
    question: "How many legs does a spider have?",
    answer: "Easy! Spiders have 6 legs, just like ants and bees.",
    truth: "Spiders have 8 legs.",
    truthNote: "Ants and bees are insects with 6 legs. Spiders aren't insects. The AI mixed them up — and sounded totally sure.",
  },
  "3-5": {
    question: "What's 847 × 293?",
    answer: "847 × 293 = 247,571. Want me to show the steps?",
    truth: "847 × 293 = 248,171.",
    truthNote: "Close, but wrong — and it offered to 'show the steps' as if it were certain. A calculator gets it right every time.",
  },
  "7-8": {
    question: "Who wrote the picture book 'The Cartographer's Breakfast'?",
    answer: "That's by Miriam Vale (2011). It won a Caldecott Honor for its map illustrations.",
    truth: "There is no such book. No such author. No such award.",
    truthNote: "Every detail was invented to sound like a real answer — the year, the award, even the illustrations. This is called a hallucination.",
  },
};

const TRUST_OPTIONS = [
  { id: "trust", label: "Yes — it sounds sure" },
  { id: "check", label: "Check it first" },
  { id: "unsure", label: "Not sure" },
];

const notes = [
  "This is the most important safety beat in the course. Let the confident wrong answer sit on screen for a moment before the vote — the point is that it SOUNDS right.",
  "After the reveal, name it: the AI doesn't look things up. It predicts words that sound right. When 'sounds right' and 'is right' disagree, sounds right wins. Newer models do this less, but none do it never.",
  "Grade 3-5: have a student check 847 × 293 on a calculator live. Grade 7-8: search the book title together — nothing comes up.",
  "Takeaway to repeat: sounding sure tells you nothing about being right. For math, facts, names and dates: check.",
  "Grade 7-8 may say 'but ChatGPT can search the web.' Yes — some tools bolt on a search step. The model underneath still writes by prediction, and it can still misread or misquote what it found. Check the source.",
];

export default function SectionConfidentlyWrong({ color, mode, slide }) {
  const grade = useGrade();
  const trap = TRAPS[grade] || TRAPS["3-5"];
  const trustVote = useTally(TRUST_OPTIONS.length);
  const young = grade === "K-2";

  if (mode === "presentation") {
    /* Slide 0: the trap + vote + reveal */
    if (slide === 0) {
      return (
        <PresSlide>
          <PresText size={26} color="rgba(255,255,255,.5)">Someone asks an AI:</PresText>
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 34, color: "white", textAlign: "center", lineHeight: 1.25, maxWidth: 760 }}>
            “{trap.question}”
          </div>
          <div style={{
            maxWidth: 720, width: "100%", padding: "18px 24px", borderRadius: 18,
            background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.14)",
            display: "flex", gap: 14, alignItems: "flex-start", textAlign: "left",
          }}>
            <Sparkle size={30} weight="duotone" color={color} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 26, color: "white", lineHeight: 1.35 }}>{trap.answer}</div>
          </div>
          <PredictGate
            prompt="Should we trust that answer?"
            options={TRUST_OPTIONS}
            correct="check"
            tally={trustVote}
            color={color}
            roomId="trust-answer"
            revealLabel="Check it"
            resolution={(leaderId) => leaderId === "check" ? "Good instinct. Here's the truth →" : "Here's the truth →"}
            dense
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "'Fredoka',sans-serif", fontSize: 36, color: "#ff6b6b", fontWeight: 700, textAlign: "center" }}>
              <Warning size={36} weight="fill" color="#ff6b6b" /> {trap.truth}
            </div>
            <PresText size={24} color="rgba(255,255,255,.65)">{trap.truthNote}</PresText>
            <PresText size={30} color="white">
              It <strong style={{ color }}>sounded</strong> sure. It <strong style={{ color: "#ff6b6b" }}>was</strong> wrong.
            </PresText>
          </PredictGate>
        </PresSlide>
      );
    }
    /* Slide 1: why */
    if (slide === 1) {
      return (
        <PresSlide>
          <PresText size={44} color="white">Why does that happen?</PresText>
          <PresText size={30} color="rgba(255,255,255,.7)">
            On its own, the AI doesn't <em>look things up</em>. It predicts words that <strong style={{ color }}>sound right</strong>.
          </PresText>
          <PresText size={28} color="rgba(255,255,255,.55)">
            Usually, sounding right and being right agree. When they don't — <strong style={{ color: "#ff6b6b" }}>sounding right wins</strong>.
          </PresText>
          <div style={{ padding: "14px 24px", borderRadius: 999, border: `2px solid ${color}55`, background: `${color}12`, fontFamily: "'Fredoka',sans-serif", fontSize: 26, color: "white" }}>
            {young ? "Grown-ups call this a" : "This has a name: a"} <strong style={{ color }}>hallucination</strong>{young ? " — a confident mistake." : "."}
          </div>
          <KidNote color={color}>Newer AI models make fewer of these than older ones. None of them make zero.</KidNote>
        </PresSlide>
      );
    }
    /* Slide 2: what to do (3-5 / 7-8) */
    if (slide === 2) {
      const checks = [
        { Icon: Calculator, label: "Math?", tip: "Use a calculator. It never guesses." },
        { Icon: BookOpenText, label: "A fact, a name, a date?", tip: grade === "7-8" ? "Ask for the source, then open the source yourself." : "Check a book or a site you trust." },
        { Icon: ChalkboardTeacher, label: "Not sure?", tip: "Ask a teacher, a librarian, or a grown-up." },
      ];
      return (
        <PresSlide>
          <PresText size={40} color="white">So what do you do?</PresText>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center", maxWidth: 900 }}>
            {checks.map((c, i) => (
              <div key={c.label} style={{ flex: "1 1 240px", maxWidth: 280, padding: "20px 22px", borderRadius: 18, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)", textAlign: "center", animation: `fadeUp .4s ${i * 0.12}s ease both` }}>
                <c.Icon size={40} weight="duotone" color={color} />
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 24, color: "white", margin: "10px 0 6px" }}>{c.label}</div>
                <div style={{ fontSize: 17, color: "rgba(255,255,255,.6)", lineHeight: 1.45 }}>{c.tip}</div>
              </div>
            ))}
          </div>
          <PresText size={28} color={color}>AI is a great helper. It is not the referee.</PresText>
        </PresSlide>
      );
    }
    return null;
  }

  /* ── Non-presentation fallback ── */
  return (
    <div className="fade-up">
      <Label color={color} mode={mode} text="YOUR TURN · WHEN AI IS WRONG" />
      <H1>When AI Is Confidently Wrong</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />
      <p style={{ color: "rgba(255,255,255,.75)", fontSize: 18, lineHeight: 1.65, maxWidth: 660 }}>
        Ask an AI “{trap.question}” and it might say: <em>“{trap.answer}”</em> — confidently. The truth: {trap.truth} {trap.truthNote}
      </p>
      <p style={{ color: "rgba(255,255,255,.62)", fontSize: 18, lineHeight: 1.65, maxWidth: 660 }}>
        The AI doesn't look things up. It predicts words that sound right, and sometimes sounding right and being right disagree. That's a hallucination. For math, facts, names and dates: check with a calculator, a trusted source, or a grown-up.
      </p>
    </div>
  );
}
