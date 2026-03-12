import { ArrowLeft } from "@phosphor-icons/react";
import { Card } from "./shared";

const GLOSSARY_GROUPS = [
  {
    name: "Introduction",
    color: "#00f5d4",
    terms: [
      { term: "AI (Artificial Intelligence)", def: "A computer program that learns from examples instead of following rules someone wrote." },
      { term: "LLM (Large Language Model)", def: "An AI that learned language by reading trillions of words." },
      { term: "Model", def: "A giant math structure made of billions of numbers that captures patterns in language." },
      { term: "Training", def: "How an AI learns — by reading huge amounts of text and finding patterns." },
      { term: "Open Source", def: "When AI makers share their model's recipe so anyone can use and improve it." },
    ],
  },
  {
    name: "Words & Numbers",
    color: "#00bbf9",
    terms: [
      { term: "Token", def: "A word-piece that AI uses — like a word or part of a word." },
      { term: "Embedding", def: "A list of numbers (like coordinates) that represents what a word means." },
      { term: "Vector Space", def: "The giant space where words live — similar words end up close together." },
      { term: "Dimension", def: 'One axis of measurement, like "is it an animal?" or "does it have wings?"' },
    ],
  },
  {
    name: "How AI Thinks",
    color: "#9b5de5",
    terms: [
      { term: "Attention", def: "The step where words look at other words to understand context." },
      { term: "Context", def: "The surrounding words that help figure out what a word means." },
      { term: "MLP (Multi-Layer Perceptron)", def: 'The "thinking layer" that processes meaning after attention.' },
      { term: "Layer", def: "One full round of attention + MLP. Models stack many of these — some have 32, some have 96 or more — to build deeper understanding." },
    ],
  },
  {
    name: "Output & Beyond",
    color: "#f15bb5",
    terms: [
      { term: "Prediction", def: "How AI writes — it picks the most likely next word, then repeats." },
      { term: "Temperature", def: "A dial that controls how creative or predictable the AI's word choices are." },
      { term: "Probability", def: "The chance (as a percentage) that a word comes next." },
      { term: "Multimodal", def: "An AI that can work with images and other things, not just text." },
      { term: "Bias", def: "Bad patterns an AI learns if its training data has bad examples." },
    ],
  },
];

export default function Glossary({ onBack }) {
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
          Glossary
        </span>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 24px 48px" }}>
        <p style={{ color: "rgba(255,255,255,.45)", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
          Key terms from the lesson, explained in kid-friendly language.
        </p>

        {GLOSSARY_GROUPS.map((group) => (
          <div key={group.name} style={{ marginBottom: 32 }}>
            <div style={{
              fontFamily: "'Fredoka',sans-serif",
              fontSize: 13,
              color: `${group.color}99`,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 12,
            }}>
              {group.name}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {group.terms.map((t) => (
                <Card key={t.term}>
                  <span style={{
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: 17,
                    fontWeight: 600,
                    color: group.color,
                  }}>
                    {t.term}
                  </span>
                  <div style={{
                    fontSize: 15,
                    color: "rgba(255,255,255,.62)",
                    lineHeight: 1.55,
                    marginTop: 6,
                  }}>
                    {t.def}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
