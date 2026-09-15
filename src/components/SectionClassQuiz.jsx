// Class quiz — the Knowledge Check run on the projector: one question per
// slide as a predict-then-reveal vote (hands, tablet, or phones), then the
// "in your own words" closer. Shown only when Checks includes the end quiz.
// Slide count = quizFor(grade).length + 1 (see src/data/sections.js).

import { Exam, ChatsCircle } from "@phosphor-icons/react";
import { Label, H1, PresSlide, PresText } from "./shared";
import { PredictGate } from "./classroom";
import { useTallySet } from "./useTally";
import { useGrade } from "../data/GradeContext";
import { quizFor, OWN_WORDS, QUIZ_QUESTIONS } from "../data/quiz";
import { SECTION_BY_ID } from "../data/sections";

export default function SectionClassQuiz({ color, mode, slide }) {
  const grade = useGrade();
  const questions = quizFor(grade);
  // One tally per question in the FULL bank so indexes stay stable across grade switches
  const votes = useTallySet(QUIZ_QUESTIONS.length, 4);

  if (mode !== "presentation") {
    return (
      <div className="fade-up">
        <Label color={color} mode={mode} text="YOUR TURN · CLASS QUIZ" />
        <H1>Class Quiz</H1>
        <p style={{ color: "rgba(255,255,255,.7)", fontSize: 18, lineHeight: 1.65, maxWidth: 660 }}>
          {questions.length} questions, one per slide, answered as a class. Then: {OWN_WORDS[grade]}
        </p>
      </div>
    );
  }

  /* Closer: in your own words */
  if (slide >= questions.length) {
    return (
      <PresSlide>
        <ChatsCircle size={52} weight="duotone" color={color} />
        <PresText size={24} color="rgba(255,255,255,.5)">Last one — no buttons, no bars.</PresText>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 40, color: "white", textAlign: "center", lineHeight: 1.25, maxWidth: 820 }}>
          {OWN_WORDS[grade]}
        </div>
        <PresText size={24} color="rgba(255,255,255,.6)">
          Turn and tell a neighbor. Then two volunteers say it to the room.
        </PresText>
      </PresSlide>
    );
  }

  const q = questions[slide];
  const bankIdx = QUIZ_QUESTIONS.findIndex(x => x.id === q.id);
  const options = q.options.map((label, i) => ({ id: String(i), label }));
  const sectionTitle = SECTION_BY_ID[q.section]?.title || "";

  return (
    <PresSlide>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "'Fredoka',sans-serif", fontSize: 14, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,.4)" }}>
        <Exam size={18} weight="duotone" color={color} /> Quiz {slide + 1} of {questions.length}{sectionTitle && <span style={{ color: "rgba(255,255,255,.25)" }}>· {sectionTitle}</span>}
      </div>
      <PredictGate
        key={q.id}
        prompt={q.q}
        options={options}
        correct={String(q.correct)}
        tally={votes[bankIdx]}
        color={color}
        roomId={`quiz-${q.id}`}
        revealLabel="Reveal"
        dense
      >
        <PresText size={26} color="rgba(255,255,255,.75)">{q.explanation}</PresText>
      </PredictGate>
    </PresSlide>
  );
}
