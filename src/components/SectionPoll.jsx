// Quick poll — one predict-then-reveal check at the end of an act.
// Shown only when the lesson's Checks setting includes polls (see
// src/data/sections.js `slides`). One component, instantiated per act.

import { CheckSquare } from "@phosphor-icons/react";
import { Label, H1, PresSlide, PresText } from "./shared";
import { PredictGate } from "./classroom";
import { useTally } from "./useTally";
import { ACT_POLLS } from "../data/quiz";

export function makePoll(pollId) {
  const poll = ACT_POLLS.find(p => p.id === pollId);
  function SectionPoll({ color, mode }) {
    const tally = useTally(poll.options.length);
    const options = poll.options.map((label, i) => ({ id: String(i), label }));
    if (mode !== "presentation") {
      return (
        <div className="fade-up">
          <Label color={color} mode={mode} text={`QUICK CHECK · ${poll.act.toUpperCase()}`} />
          <H1>Quick check</H1>
          <p style={{ color: "rgba(255,255,255,.75)", fontSize: 18, lineHeight: 1.65, maxWidth: 660 }}>{poll.q}</p>
          <p style={{ color: "rgba(255,255,255,.55)", fontSize: 17, lineHeight: 1.6, maxWidth: 660 }}>{poll.why}</p>
        </div>
      );
    }
    return (
      <PresSlide>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "'Fredoka',sans-serif", fontSize: 14, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,.4)" }}>
          <CheckSquare size={18} weight="duotone" color={color} /> Quick check · {poll.act}
        </div>
        <PredictGate
          prompt={poll.q}
          options={options}
          correct={String(poll.correct)}
          tally={tally}
          color={color}
          roomId={poll.id}
          revealLabel="Reveal"
        >
          <PresText size={28} color="rgba(255,255,255,.75)">{poll.why}</PresText>
        </PredictGate>
      </PresSlide>
    );
  }
  SectionPoll.displayName = `SectionPoll(${pollId})`;
  return SectionPoll;
}
