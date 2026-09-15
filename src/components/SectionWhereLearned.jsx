// "Where Did It Learn That?" — the bias beat, all grades.
// Beat 1: ask an AI to draw a doctor; the class predicts; reveal.
// Beat 2: its examples came from the internet, and the internet isn't everyone.
// Beat 3 (3-5 / 7-8): what to ask.

import { Stethoscope, Globe, Question, UsersThree } from "@phosphor-icons/react";
import { Label, H1, TeacherNote, KidNote, PresSlide, PresText } from "./shared";
import { PredictGate } from "./classroom";
import { useTally } from "./useTally";
import { useGrade } from "../data/GradeContext";

const DRAW_OPTIONS = [
  { id: "examples", label: "Whatever its example pictures showed most" },
  { id: "random", label: "A different random person each time" },
  { id: "fair", label: "A perfectly fair mix of people" },
];

const notes = [
  "The finding is real: when researchers asked picture-making AIs for 'a doctor', the results showed men far more often than real doctors are men, and skewed on skin color too. Nobody programmed that in — the training pictures leaned that way.",
  "Keep it concrete and non-accusatory: the AI copies its examples. If the examples are lopsided, the answers are lopsided. That's what 'bias' means here.",
  "Good discussion: 'Who is missing from the examples?' and 'Would a kid in another country get a different answer?' Let several students answer.",
  "End on agency: people ARE fixing this — choosing better examples and testing for fairness — and noticing it is the first step. Your class just noticed it.",
];

export default function SectionWhereLearned({ color, mode, slide }) {
  const grade = useGrade();
  const drawVote = useTally(DRAW_OPTIONS.length);
  const young = grade === "K-2";

  if (mode === "presentation") {
    /* Slide 0: draw a doctor */
    if (slide === 0) {
      return (
        <PresSlide>
          <Stethoscope size={52} weight="duotone" color={color} />
          <PresText size={40} color="white">Ask an AI: “Draw a doctor.”</PresText>
          <PredictGate
            prompt="What will it most likely draw?"
            options={DRAW_OPTIONS}
            correct="examples"
            tally={drawVote}
            color={color}
            roomId="draw-doctor"
            revealLabel="What happened"
            dense
          >
            <PresText size={30} color="white">
              In tests, picture-making AIs drew doctors as <strong style={{ color }}>men</strong> far more often than real doctors are men.
            </PresText>
            <PresText size={26} color="rgba(255,255,255,.65)">
              Nobody told it to. That's just what <strong style={{ color: "white" }}>its example pictures</strong> showed most.
            </PresText>
          </PredictGate>
        </PresSlide>
      );
    }
    /* Slide 1: where the examples came from */
    if (slide === 1) {
      return (
        <PresSlide>
          <Globe size={48} weight="duotone" color={color} />
          <PresText size={40} color="white">Its examples came from the internet.</PresText>
          <PresText size={30} color="rgba(255,255,255,.7)">
            And the internet isn't <em>everyone</em>. Some people, places and languages show up a lot. Others barely show up at all.
          </PresText>
          <div style={{ padding: "14px 24px", borderRadius: 999, border: `2px solid ${color}55`, background: `${color}12`, fontFamily: "'Fredoka',sans-serif", fontSize: 26, color: "white", maxWidth: 760, textAlign: "center" }}>
            {young
              ? <>AI copies what it saw. If it saw mostly one kind of picture, that's what it draws.</>
              : <>When answers lean one way because the examples leaned that way, that's called <strong style={{ color }}>bias</strong>.</>}
          </div>
          <KidNote color={color}>This isn't only about pictures. The same thing can happen with words, stories, and advice.</KidNote>
        </PresSlide>
      );
    }
    /* Slide 2: what to ask (3-5 / 7-8) */
    if (slide === 2) {
      const asks = [
        { Icon: UsersThree, q: "Who's missing?", tip: "Who isn't in the picture, the story, or the list?" },
        { Icon: Question, q: "Would someone else get a different answer?", tip: "A kid in another country? Someone older? Someone who speaks another language?" },
        { Icon: Globe, q: "Where did the examples come from?", tip: "Who put them there — and who didn't get to?" },
      ];
      return (
        <PresSlide>
          <PresText size={40} color="white">Three questions to keep in your pocket</PresText>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center", maxWidth: 940 }}>
            {asks.map((a, i) => (
              <div key={a.q} style={{ flex: "1 1 250px", maxWidth: 290, padding: "20px 22px", borderRadius: 18, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)", textAlign: "center", animation: `fadeUp .4s ${i * 0.12}s ease both` }}>
                <a.Icon size={40} weight="duotone" color={color} />
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 23, color: "white", margin: "10px 0 6px", lineHeight: 1.2 }}>{a.q}</div>
                <div style={{ fontSize: 16, color: "rgba(255,255,255,.6)", lineHeight: 1.45 }}>{a.tip}</div>
              </div>
            ))}
          </div>
          <PresText size={26} color={color}>People are fixing this — better examples, fairness tests. Noticing is step one. You just did it.</PresText>
        </PresSlide>
      );
    }
    return null;
  }

  /* ── Non-presentation fallback ── */
  return (
    <div className="fade-up">
      <Label color={color} mode={mode} text="YOUR TURN · WHERE DID IT LEARN THAT?" />
      <H1>Where Did It Learn That?</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />
      <p style={{ color: "rgba(255,255,255,.75)", fontSize: 18, lineHeight: 1.65, maxWidth: 660 }}>
        Ask an AI to draw a doctor. In tests, it drew men far more often than real doctors are men — not because anyone told it to, but because that's what its example pictures showed most.
      </p>
      <p style={{ color: "rgba(255,255,255,.62)", fontSize: 18, lineHeight: 1.65, maxWidth: 660 }}>
        Its examples came from the internet, and the internet isn't everyone. When answers lean one way because the examples leaned that way, that's bias. Three questions to keep handy: Who's missing? Would someone else get a different answer? Where did the examples come from?
      </p>
    </div>
  );
}
