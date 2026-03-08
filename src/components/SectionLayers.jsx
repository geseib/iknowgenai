import { useState } from "react";
import {
  TextAa,
  PencilLine,
  Books,
  MaskHappy,
  PuzzlePiece,
  Sparkle,
  CaretUp,
  CaretDown,
} from "@phosphor-icons/react";
import { Card, Label, H1, Body, TriviaBox, TeacherNote } from "./shared";

const LAYER_CARDS = [
  { range: "1\u201316",  label: "Letters & Spelling",    desc: "Recognizes individual letters, punctuation, and simple character patterns.", Icon: TextAa },
  { range: "17\u201332", label: "Words & Grammar",       desc: "Parts of speech, verb tenses, plural rules \u2014 the skeleton of language.", Icon: PencilLine },
  { range: "33\u201348", label: "Facts & Knowledge",     desc: "Countries, history, science, names \u2014 all the stuff from its training books.", Icon: Books },
  { range: "49\u201364", label: "Context & Tone",        desc: "Is this sarcastic? Formal? A joke? Emotional? Context shapes everything here.", Icon: MaskHappy },
  { range: "65\u201380", label: "Logic & Reasoning",     desc: "Cause and effect, plans, comparisons, basic math, arguments.", Icon: PuzzlePiece },
  { range: "81\u201396", label: "Deep Understanding",    desc: "Nuance, metaphor, wisdom \u2014 the things that are hardest to explain but feel right.", Icon: Sparkle },
];

const notes = [
  "Ask the class to guess what early vs late layers might do BEFORE revealing. 'What would you learn first if you were trying to understand language from scratch?'",
  "The progression from mechanical (letters) to abstract (wisdom) is a nice structural insight. Early layers = fast and reliable, late layers = slow and uncertain.",
  "A good discussion question: 'If you cut the model off at layer 32, what could it do? What couldn't it do?' (It could spell and do grammar, but couldn't reason or understand context.)",
  "The 96-layer count is the wow moment here. Ask: 'What do you think happens between the first and ninety-sixth layer that makes the answer so much better?'",
];

export default function SectionLayers({ color, mode }) {
  const [open, setOpen] = useState(null);
  const [opened, setOpened] = useState(new Set());

  const handleOpen = (i) => {
    setOpen(open === i ? null : i);
    setOpened(s => new Set([...s, i]));
  };

  return (
    <div className="fade-up">
      <Label color={color} text="HOW AI THINKS \u00b7 STEP 5" />
      <H1>Rinse & Repeat</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />
      <Body>One round of Attention + MLP isn't enough. So the model does it <strong style={{ color }}>96 times in a row</strong>. Each pass makes the understanding richer. Tap to explore what each group of layers learns.</Body>
      <div style={{ marginBottom: 16 }}>
        {LAYER_CARDS.map((l, i) => (
          <div key={i}
            className={`layer-row${open === i ? " open" : ""}`}
            onClick={() => handleOpen(i)}
            style={{ borderColor: open === i ? `${color}50` : undefined }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <l.Icon size={22} weight="duotone" color={open === i ? color : "rgba(255,255,255,.5)"} />
                <div>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 16, color: open === i ? color : "white", transition: "color .2s" }}>{l.label}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 1 }}>Layers {l.range}</div>
                </div>
              </div>
              {open === i
                ? <CaretUp size={18} weight="bold" color={color} />
                : <CaretDown size={18} weight="bold" color="rgba(255,255,255,.3)" />}
            </div>
            {open === i && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,.08)", fontSize: 14, color: "rgba(255,255,255,.68)", lineHeight: 1.5, animation: "fadeUp .2s ease" }}>{l.desc}</div>
            )}
          </div>
        ))}
      </div>
      <TriviaBox visible={opened.size >= 3} color={color} number="96" label="transformer layers"
        fact="Each layer is its own full Attention + MLP block. Run 96 of them in sequence and you go from raw letters to nuanced, reasoned understanding." />
    </div>
  );
}
