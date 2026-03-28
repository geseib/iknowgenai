import { useState } from "react";
import { ArrowLeft, CheckCircle, XCircle, ArrowCounterClockwise } from "@phosphor-icons/react";
import { Card } from "./shared";

const QUESTIONS = [
  {
    q: "What makes AI different from a regular program?",
    options: ["It runs faster", "It learns from examples instead of following written rules", "It uses more electricity", "It was invented first"],
    correct: 1,
    explanation: "Regular programs follow rules a person wrote. AI learns patterns from examples, like how you learn from experience!",
  },
  {
    q: 'What does "LLM" stand for?',
    options: ["Little Learning Machine", "Large Language Model", "Long Lasting Memory", "Live Link Module"],
    correct: 1,
    explanation: "LLM stands for Large Language Model — it's large because it learned from trillions of words!",
  },
  {
    q: "How does AI understand words?",
    options: ["It reads them like we do", "It looks at pictures of the words", "It turns them into lists of numbers", "It listens to someone say them"],
    correct: 2,
    explanation: "AI can't read like humans. It converts words into lists of numbers (called embeddings) so it can do math with them.",
  },
  {
    q: 'Why do the words "cat" and "dog" end up close together in vector space?',
    options: ["They start with different letters", "They are both short words", "They have similar meanings — both are animals and pets", "Someone placed them there by hand"],
    correct: 2,
    explanation: "Words that appear in similar sentences end up close together. Cat and dog are both animals and pets, so they're used in similar ways.",
  },
  {
    q: "What does the Attention step do?",
    options: ["Makes the AI pay attention to the user", "Helps words look at other words to understand context", "Deletes words that aren't important", "Counts how many words are in the sentence"],
    correct: 1,
    explanation: 'Attention lets each word look at all the other words to figure out context — like how "bat" means different things in different sentences.',
  },
  {
    q: 'The word "bat" can mean a baseball bat or a flying animal. How does AI figure out which one?',
    options: ["It always picks the most common meaning", "It guesses randomly", "It looks at the surrounding words for clues", "It asks the user"],
    correct: 2,
    explanation: 'AI uses context! If the sentence mentions "baseball," it knows bat means equipment. If it mentions "cave," it knows bat means the animal.',
  },
  {
    q: "What does the MLP (thinking layer) do?",
    options: ["It memorizes every sentence it has ever seen", "It takes the context from Attention and thinks more deeply about what it means", "It translates words into other languages", "It connects to the internet to search for answers"],
    correct: 1,
    explanation: "After Attention gathers context, the MLP processes that information more deeply — like flipping through everything it learned during training to figure out what something means.",
  },
  {
    q: "Why does the model run through many layers instead of just one?",
    options: ["To use more electricity", "Because one pass isn't enough — each layer builds deeper understanding", "To make the answer take longer", "Because the first layer always gets it wrong"],
    correct: 1,
    explanation: "Each layer understands a little more. Early layers get basic grammar, middle layers get meaning, and later layers get the big picture.",
  },
  {
    q: 'What does the "temperature" setting control?',
    options: ["How hot the computer gets", "How fast the AI responds", "How creative or predictable the AI's word choices are", "The color of the text"],
    correct: 2,
    explanation: "Low temperature = safe, predictable words. High temperature = more creative and surprising choices. It's like a creativity dial!",
  },
  {
    q: "How does AI write a sentence?",
    options: ["It writes the whole sentence at once", "It copies sentences from its training data", "It predicts one word at a time, then repeats", "It translates from another language"],
    correct: 2,
    explanation: "AI predicts the next word, adds it, then predicts the next word after that — one at a time, like a chain!",
  },
];

const ACCENT = "#9b5de5";
const GREEN = "#06d6a0";
const RED = "#f15bb5";

export default function KnowledgeCheck({ onBack }) {
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null));
  const [showResults, setShowResults] = useState(false);

  const answeredCount = answers.filter((a) => a !== null).length;
  const allAnswered = answeredCount === QUESTIONS.length;

  const score = showResults
    ? answers.reduce((s, a, i) => s + (a === QUESTIONS[i].correct ? 1 : 0), 0)
    : 0;

  const selectAnswer = (qIndex, optIndex) => {
    if (showResults) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = optIndex;
      return next;
    });
  };

  const reset = () => {
    setAnswers(Array(QUESTIONS.length).fill(null));
    setShowResults(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scoreColor = score >= 8 ? GREEN : score >= 5 ? "#fee440" : RED;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#050512",
      color: "white",
      fontFamily: "'Nunito',sans-serif",
      position: "relative",
    }}>
      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(5,5,18,.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
        padding: "12px 22px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <button onClick={onBack} className="ghost-btn" style={{ padding: "6px 12px" }}>
          <ArrowLeft size={18} weight="bold" /> Back
        </button>
        <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 20, fontWeight: 600 }}>
          Knowledge Check
        </span>
      </div>

      {/* Score banner */}
      {showResults && (
        <div style={{
          maxWidth: 680, margin: "0 auto", padding: "20px 24px 0",
        }}>
          <Card style={{
            textAlign: "center",
            padding: "24px 20px",
            border: `2px solid ${scoreColor}60`,
            background: `${scoreColor}10`,
          }}>
            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 32,
              fontWeight: 700,
              color: scoreColor,
              marginBottom: 4,
            }}>
              You got {score} out of {QUESTIONS.length}!
            </div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,.5)" }}>
              {score === 10 ? "Perfect score! You're an AI expert!" :
               score >= 8 ? "Great job! You really know your stuff!" :
               score >= 5 ? "Good effort! Review the explanations below." :
               "Keep learning! Check the explanations to level up."}
            </div>
            <button onClick={reset} className="cta-btn" style={{
              background: ACCENT, color: "#fff", marginTop: 16,
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <ArrowCounterClockwise size={18} weight="bold" /> Try Again
            </button>
          </Card>
        </div>
      )}

      {/* Questions */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 24px 120px" }}>
        {!showResults && (
          <p style={{ color: "rgba(255,255,255,.45)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            Answer all 10 questions, then see how you did!
          </p>
        )}

        {QUESTIONS.map((question, qi) => {
          const userAnswer = answers[qi];
          const isCorrect = showResults && userAnswer === question.correct;
          const isWrong = showResults && userAnswer !== null && userAnswer !== question.correct;

          let borderColor = "rgba(255,255,255,.09)";
          if (isCorrect) borderColor = `${GREEN}70`;
          if (isWrong) borderColor = `${RED}70`;

          return (
            <Card key={qi} style={{
              marginBottom: 16,
              border: `2px solid ${borderColor}`,
              transition: "border-color .3s ease",
            }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <span style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 15,
                  color: ACCENT,
                  flexShrink: 0,
                  marginTop: 1,
                }}>
                  {qi + 1}.
                </span>
                <span style={{
                  fontFamily: "'Fredoka',sans-serif",
                  fontSize: 17,
                  fontWeight: 600,
                  color: "white",
                  lineHeight: 1.35,
                }}>
                  {question.q}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {question.options.map((opt, oi) => {
                  const isSelected = userAnswer === oi;
                  const isCorrectOption = oi === question.correct;

                  let bg = "rgba(255,255,255,.04)";
                  let border = "1px solid rgba(255,255,255,.08)";
                  let textColor = "rgba(255,255,255,.7)";
                  let icon = null;

                  if (!showResults && isSelected) {
                    bg = `${ACCENT}18`;
                    border = `2px solid ${ACCENT}80`;
                    textColor = "white";
                  }
                  if (showResults) {
                    if (isCorrectOption) {
                      bg = `${GREEN}15`;
                      border = `2px solid ${GREEN}70`;
                      textColor = GREEN;
                      icon = <CheckCircle size={20} weight="fill" color={GREEN} style={{ flexShrink: 0 }} />;
                    } else if (isSelected && !isCorrectOption) {
                      bg = `${RED}15`;
                      border = `2px solid ${RED}70`;
                      textColor = RED;
                      icon = <XCircle size={20} weight="fill" color={RED} style={{ flexShrink: 0 }} />;
                    }
                  }

                  return (
                    <button
                      key={oi}
                      onClick={() => selectAnswer(qi, oi)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: bg,
                        border,
                        color: textColor,
                        fontSize: 15,
                        cursor: showResults ? "default" : "pointer",
                        textAlign: "left",
                        fontFamily: "'Nunito',sans-serif",
                        transition: "all .2s ease",
                        lineHeight: 1.4,
                      }}
                    >
                      {icon}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showResults && isWrong && (
                <div style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,.03)",
                  fontSize: 14,
                  color: "rgba(255,255,255,.55)",
                  lineHeight: 1.55,
                }}>
                  💡 {question.explanation}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Bottom status bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: "12px 22px",
        background: "rgba(5,5,18,.92)", backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,.06)",
        zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
      }}>
        {/* Dots */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {QUESTIONS.map((_, i) => {
            let dotColor = "rgba(255,255,255,.15)";
            if (answers[i] !== null) {
              if (showResults) {
                dotColor = answers[i] === QUESTIONS[i].correct ? GREEN : RED;
              } else {
                dotColor = ACCENT;
              }
            }
            return (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: "50%",
                background: dotColor,
                transition: "background .3s ease",
              }} />
            );
          })}
        </div>

        <span style={{
          fontFamily: "'Fredoka',sans-serif",
          fontSize: 13,
          color: "rgba(255,255,255,.4)",
        }}>
          {answeredCount} of {QUESTIONS.length}
        </span>

        {!showResults && allAnswered && (
          <button
            onClick={() => { setShowResults(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="cta-btn"
            style={{ background: ACCENT, color: "#fff", padding: "8px 18px", fontSize: 14 }}
          >
            See Results
          </button>
        )}
      </div>
    </div>
  );
}
