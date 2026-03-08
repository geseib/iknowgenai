import { useState } from "react";
import { Robot, Desktop, Brain, Lightbulb } from "@phosphor-icons/react";
import { Card, Label, H1, Body, TeacherNote, DiscussionGate } from "./shared";

const choices = [
  { id: "robot",   Icon: Robot,   label: "A robot",                response: "Great guess! But AI doesn't need a body. It can live entirely inside a computer \u2014 no arms, no legs required." },
  { id: "program", Icon: Desktop, label: "A really smart program", response: "You're onto something! It IS a program \u2014 but there's one important twist that makes it different from all other programs." },
  { id: "brain",   Icon: Brain,   label: "A digital brain",        response: "Interesting! AI was inspired by how brains work \u2014 but it doesn't have feelings, memories between chats, or consciousness." },
];

const notes = [
  "Ask the class to vote by raising hands for each option. Tally roughly and tap the winning answer.",
  "'Robot' is the most common misconception \u2014 great teaching opportunity. AI is software, not hardware.",
  "'Smart program' is the closest \u2014 acknowledge that. The key nuance: what makes AI different from a calculator?",
  "'Digital brain' opens a great philosophical discussion. AI was inspired by neurons, but doesn't have emotions.",
  "After the class votes and you reveal: ask 'what do you think ALL three answers are missing?'",
];

export default function SectionWhatIsAI({ color, mode }) {
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const choice = choices.find(c => c.id === picked);

  const ChoiceButton = ({ c, onClick, selected }) => (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", borderRadius: 14,
      cursor: "pointer", transition: "all .2s ease", textAlign: "left",
      background: selected ? `${color}22` : "rgba(255,255,255,.05)",
      border: `2px solid ${selected ? color : "rgba(255,255,255,.12)"}`,
      boxShadow: selected ? `0 0 16px ${color}40` : "none",
      color: "white",
    }}>
      <c.Icon size={36} weight="duotone" color={selected ? color : "rgba(255,255,255,.5)"} />
      <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 18 }}>{c.label}</div>
    </button>
  );

  const InsightCard = () => (
    <Card style={{ background: "rgba(255,255,255,.04)" }}>
      <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 18, color: "white", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <Lightbulb size={22} weight="duotone" color={color} />
        Here's what makes AI special
      </div>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,.65)", lineHeight: 1.65 }}>
        A normal program follows <strong style={{ color }}>rules someone wrote</strong> \u2014 like a recipe with exact steps.<br /><br />
        AI is different: it <strong style={{ color }}>learns from examples</strong>. Nobody wrote the rules. It figured them out by looking at millions of examples, the same way you learned to talk by hearing people talk.
      </p>
    </Card>
  );

  return (
    <div className="fade-up">
      <Label color={color} text="INTRODUCTION \u00b7 THE BIG QUESTION" />
      <H1>What IS AI?</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />

      {mode === "classroom" ? (
        <DiscussionGate question="Ask the class: what do YOU think AI is?" hint="Take a class vote \u2014 hold up fingers for 1, 2, or 3" color={color} mode={mode}>
          <Body>Three popular answers \u2014 tap the one your class voted for most:</Body>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {choices.map(c => (
              <ChoiceButton key={c.id} c={c} selected={picked === c.id}
                onClick={() => { setPicked(c.id); setRevealed(true); }} />
            ))}
          </div>
          {revealed && choice && (
            <div style={{ animation: "fadeUp .4s ease" }}>
              <Card style={{ marginBottom: 14, background: `${color}0d`, border: `1px solid ${color}35` }}>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,.7)", lineHeight: 1.65 }}>{choice.response}</p>
              </Card>
              <InsightCard />
            </div>
          )}
        </DiscussionGate>
      ) : (
        <>
          {!picked ? (
            <>
              <Body>What do you think AI is? Pick your best guess:</Body>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                {choices.map(c => (
                  <ChoiceButton key={c.id} c={c} selected={false} onClick={() => setPicked(c.id)} />
                ))}
              </div>
            </>
          ) : (
            <div style={{ animation: "fadeUp .4s ease" }}>
              <Card style={{ marginBottom: 14, background: `${color}0d`, border: `1px solid ${color}35` }}>
                <choice.Icon size={36} weight="duotone" color={color} style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 15, color: "rgba(255,255,255,.7)", lineHeight: 1.65 }}>{choice.response}</p>
              </Card>
              <InsightCard />
            </div>
          )}
        </>
      )}
    </div>
  );
}
