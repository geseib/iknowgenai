import { useState } from "react";
import {
  Books,
  ChatTeardropDots,
  HashStraight,
  Lightbulb,
} from "@phosphor-icons/react";
import { Card, Label, H1, Body, TeacherNote } from "./shared";

const ICON_MAP = {
  L0: Books,
  L1: ChatTeardropDots,
  M: HashStraight,
};

const parts = [
  { letter: "L", word: "Large",    iconKey: "L0", reveal: "Trained on more text than you could read in 10,000 lifetimes. Books, websites, articles \u2014 all of it." },
  { letter: "L", word: "Language", iconKey: "L1", reveal: "It works specifically with words and sentences. It reads text in, and writes text back out." },
  { letter: "M", word: "Model",   iconKey: "M",  reveal: "A mathematical structure \u2014 billions of numbers arranged so that patterns in language get captured. Like a very complex recipe." },
];

const notes = [
  "'Large' is worth dwelling on. GPT-4 was trained on roughly 1 trillion words. The entire English Wikipedia is about 4 billion words \u2014 so GPT read the equivalent of 250 Wikipedias.",
  "'Language' distinguishes LLMs from other types of AI (like image AI or audio AI). Some newer models are multimodal \u2014 they handle images too \u2014 but language is core.",
  "'Model' is the trickiest concept. A useful analogy: when you hear enough songs, your brain builds a model of what music sounds like. LLMs build a mathematical model of what language looks and sounds like.",
  "After revealing all three: 'So what's the most popular thing people use LLMs for?' \u2192 chatbots, writing help, coding help, answering questions.",
];

export default function SectionWhatIsLLM({ color, mode }) {
  const [step, setStep] = useState(0);

  return (
    <div className="fade-up">
      <Label color={color} text="MEET THE LLMS \u00b7 WHAT IS IT?" />
      <H1>What's an LLM?</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />
      <Body>LLM stands for <strong style={{ color }}>Large Language Model</strong>. Three words \u2014 let's unpack them one at a time.</Body>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20, flexWrap: "wrap" }}>
        {parts.map((p, i) => (
          <div key={i} style={{
            textAlign: "center", padding: "14px 18px", borderRadius: 14, minWidth: 88,
            background: step > i ? `${color}18` : "rgba(255,255,255,.04)",
            border: `2px solid ${step > i ? color : "rgba(255,255,255,.12)"}`,
            transition: "all .35s ease",
          }}>
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 40, fontWeight: 700, color: step > i ? color : "rgba(255,255,255,.3)", lineHeight: 1 }}>{p.letter}</div>
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 14, color: step > i ? "white" : "rgba(255,255,255,.3)", marginTop: 4 }}>{p.word}</div>
          </div>
        ))}
      </div>
      {step > 0 && parts.slice(0, step).map((p, i) => {
        const Icon = ICON_MAP[p.iconKey];
        return (
          <Card key={i} style={{ marginBottom: 10, animation: "fadeUp .35s ease", background: `${color}08`, border: `1px solid ${color}28` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 32, fontWeight: 700, color, minWidth: 36 }}>{p.letter}</div>
              <div>
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 17, color: "white", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon size={20} weight="duotone" color={color} /> {p.word}
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,.65)", lineHeight: 1.55 }}>{p.reveal}</div>
              </div>
            </div>
          </Card>
        );
      })}
      {step < 3 && (
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button onClick={() => setStep(s => s + 1)} className="cta-btn" style={{ background: color, color: "#000" }}>
            {step === 0 ? "Unpack the first letter \u2192" : "Next letter \u2192"}
          </button>
        </div>
      )}
      {step === 3 && (
        <div className="wow-reveal" style={{ padding: "14px 18px", background: `${color}12`, border: `1px solid ${color}35`, borderRadius: 12, marginTop: 10, fontSize: 15, color: "rgba(255,255,255,.7)", lineHeight: 1.6, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Lightbulb size={22} weight="duotone" color={color} style={{ flexShrink: 0, marginTop: 2 }} />
          <span><strong style={{ color }}>Large Language Model</strong> \u2014 a massive mathematical system that learned the patterns of human language by reading an enormous amount of text.</span>
        </div>
      )}
    </div>
  );
}
