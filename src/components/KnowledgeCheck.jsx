// Solo Knowledge Check — the same question bank the class quiz uses
// (src/data/quiz.js), filtered to the chosen grade band, tagged by section,
// and closed with an "in your own words" prompt.

import { useState } from "react";
import { ArrowLeft, CheckCircle, XCircle, ArrowCounterClockwise, ChatsCircle } from "@phosphor-icons/react";
import { Card } from "./shared";
import RoamingCat from "./catai/cat_runner_react_component";
import { quizFor, OWN_WORDS } from "../data/quiz";
import { SECTION_BY_ID } from "../data/sections";
import { GRADES } from "../data/GradeContext";
import { GRADE_CONFIG } from "../data/gradeConfig";

const ACCENT = "#9b5de5";
const GREEN = "#06d6a0";
const RED = "#f15bb5";

const CAT_GREAT = [
  "Purr-fect score energy!",
  "You're smarter than my neural net!",
  "A+ in AI and treat identification!",
  "I knew you could do it!",
];
const CAT_ENCOURAGE = [
  "Keep going, you've got this!",
  "Even AI needs a few rounds to learn!",
  "Every expert was once a beginner. And a kitten.",
  "Try again — I believe in you!",
];

export default function KnowledgeCheck({ onBack, flags, grade: initialGrade = "3-5" }) {
  const [grade, setGrade] = useState(initialGrade);
  const questions = quizFor(grade);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const answeredCount = questions.filter(q => answers[q.id] != null).length;
  const allAnswered = answeredCount === questions.length;
  const score = showResults ? questions.reduce((s, q) => s + (answers[q.id] === q.correct ? 1 : 0), 0) : 0;
  const pctScore = questions.length ? score / questions.length : 0;

  const selectAnswer = (qid, optIndex) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qid]: optIndex }));
  };
  const reset = () => { setAnswers({}); setShowResults(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const changeGrade = (g) => { setGrade(g); setAnswers({}); setShowResults(false); };

  const scoreColor = pctScore >= 0.8 ? GREEN : pctScore >= 0.5 ? "#fee440" : RED;

  return (
    <div style={{ minHeight: "100vh", background: "#050512", color: "white", fontFamily: "'Nunito',sans-serif", position: "relative" }}>
      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(5,5,18,.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
        padding: "12px 22px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      }}>
        <button onClick={onBack} className="ghost-btn" style={{ padding: "6px 12px" }}>
          <ArrowLeft size={18} weight="bold" /> Back
        </button>
        <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, fontWeight: 600 }}>Knowledge Check</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4, background: "rgba(255,255,255,.06)", borderRadius: 10, padding: 3 }}>
          {GRADES.map(g => (
            <button key={g} onClick={() => changeGrade(g)} style={{
              fontFamily: "'Fredoka',sans-serif", fontSize: 13, fontWeight: g === grade ? 700 : 500,
              padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              background: g === grade ? "rgba(255,255,255,.14)" : "transparent",
              color: g === grade ? "white" : "rgba(255,255,255,.4)",
            }} title={GRADE_CONFIG[g].label}>{g}</button>
          ))}
        </div>
      </div>

      {/* Score banner */}
      {showResults && (
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 24px 0" }}>
          <Card style={{ textAlign: "center", padding: "24px 20px", border: `2px solid ${scoreColor}60`, background: `${scoreColor}10` }}>
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 32, fontWeight: 700, color: scoreColor, marginBottom: 4 }}>
              You got {score} out of {questions.length}!
            </div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,.5)" }}>
              {score === questions.length ? "Perfect score! You're an AI expert!" :
               pctScore >= 0.8 ? "Great job! You really know your stuff!" :
               pctScore >= 0.5 ? "Good effort! Review the explanations below." :
               "Keep learning! Check the explanations to level up."}
            </div>
            <button onClick={reset} className="cta-btn" style={{ background: ACCENT, color: "#fff", marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <ArrowCounterClockwise size={18} weight="bold" /> Try Again
            </button>
          </Card>
        </div>
      )}

      {/* Questions */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 24px 120px" }}>
        {!showResults && (
          <p style={{ color: "rgba(255,255,255,.45)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            {questions.length} questions for {GRADE_CONFIG[grade].label}. Answer them all, then see how you did!
          </p>
        )}

        {questions.map((question, qi) => {
          const userAnswer = answers[question.id];
          const isCorrect = showResults && userAnswer === question.correct;
          const isWrong = showResults && userAnswer != null && userAnswer !== question.correct;
          let borderColor = "rgba(255,255,255,.09)";
          if (isCorrect) borderColor = `${GREEN}70`;
          if (isWrong) borderColor = `${RED}70`;
          const sectionTitle = SECTION_BY_ID[question.section]?.title;

          return (
            <Card key={question.id} style={{ marginBottom: 16, border: `2px solid ${borderColor}`, transition: "border-color .3s ease" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 15, color: ACCENT, flexShrink: 0, marginTop: 1 }}>{qi + 1}.</span>
                <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 17, fontWeight: 600, color: "white", lineHeight: 1.35 }}>{question.q}</span>
              </div>
              {sectionTitle && (
                <div style={{ marginLeft: 26, marginBottom: 12, fontFamily: "'Fredoka',sans-serif", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,.3)" }}>
                  {sectionTitle}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {question.options.map((opt, oi) => {
                  const isSelected = userAnswer === oi;
                  const isCorrectOption = oi === question.correct;
                  let bg = "rgba(255,255,255,.04)";
                  let border = "1px solid rgba(255,255,255,.08)";
                  let textColor = "rgba(255,255,255,.7)";
                  let icon = null;
                  if (!showResults && isSelected) { bg = `${ACCENT}18`; border = `2px solid ${ACCENT}80`; textColor = "white"; }
                  if (showResults && isCorrectOption) { bg = `${GREEN}18`; border = `2px solid ${GREEN}80`; textColor = "white"; icon = <CheckCircle size={18} weight="fill" color={GREEN} />; }
                  if (showResults && isSelected && !isCorrectOption) { bg = `${RED}18`; border = `2px solid ${RED}80`; textColor = "white"; icon = <XCircle size={18} weight="fill" color={RED} />; }
                  return (
                    <button key={oi} onClick={() => selectAnswer(question.id, oi)} style={{
                      textAlign: "left", padding: "11px 14px", borderRadius: 12, background: bg, border, color: textColor,
                      fontSize: 15, lineHeight: 1.4, cursor: showResults ? "default" : "pointer",
                      display: "flex", alignItems: "center", gap: 10, transition: "all .2s ease", fontFamily: "'Nunito',sans-serif",
                    }}>
                      {icon}<span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {showResults && (
                <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,.04)", fontSize: 14, color: "rgba(255,255,255,.6)", lineHeight: 1.55 }}>
                  {question.explanation}
                </div>
              )}
            </Card>
          );
        })}

        {/* In your own words */}
        <Card style={{ marginBottom: 16, border: `2px solid ${ACCENT}40`, background: `${ACCENT}0c` }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <ChatsCircle size={26} weight="duotone" color={ACCENT} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: ACCENT, marginBottom: 4 }}>In your own words</div>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 18, color: "white", lineHeight: 1.35 }}>{OWN_WORDS[grade]}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.45)", marginTop: 6 }}>Say it out loud to someone, or write two sentences. No right answer key for this one.</div>
            </div>
          </div>
        </Card>

        {!showResults && (
          <div style={{ position: "sticky", bottom: 20, textAlign: "center", marginTop: 8 }}>
            <button
              onClick={() => { if (allAnswered) { setShowResults(true); window.scrollTo({ top: 0, behavior: "smooth" }); } }}
              className="cta-btn"
              style={{ background: allAnswered ? ACCENT : "rgba(255,255,255,.1)", color: allAnswered ? "#fff" : "rgba(255,255,255,.3)", cursor: allAnswered ? "pointer" : "default", padding: "14px 32px", fontSize: 17 }}
            >
              {allAnswered ? "See my results" : `${answeredCount} of ${questions.length} answered`}
            </button>
          </div>
        )}
      </div>

      {flags?.roamingCat && showResults && (
        <RoamingCat key={`quiz-${score}`} quotes={pctScore >= 0.8 ? CAT_GREAT : CAT_ENCOURAGE} />
      )}
    </div>
  );
}
