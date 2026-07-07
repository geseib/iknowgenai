// Speaker notes for presentation mode — the 14+ course's answer to the K-8
// teacher notes. Keyed by chapter slug → slide index. Every field is optional;
// the panel renders only what's present.
//
//   time    — rough time to spend on the slide (string, shown in the header)
//   say     — the narration: what the speaker says out loud (string)
//   points  — key beats to hit (string[])
//   demo    — what to DO on screen: which button to click, what to point at
//   ask     — questions to put to the room (string[])
//   caveat  — the honest footnote, spoken aloud (keeps the honesty contract
//             even though the footnote is hidden on the projected slide)
//
// Populated for Chapters 1–2 as the first experiment; other chapters fall back
// to "no notes yet."

export const SPEAKER_NOTES = {
  "impossible-machine": {
    0: {
      time: "1 min",
      say: "Open cold, no definitions. Tell them the course starts with a magic trick: they hand a machine three ingredients, it writes a real story — and then we spend thirteen chapters taking the trick apart until there's no magic left, only mechanism.",
      points: [
        "Set the tone: curiosity, not jargon.",
        "Promise a payoff — by Chapter 14 they'll narrate every step themselves.",
      ],
      ask: ["Who's used ChatGPT or a similar tool? Keep that experience in mind — we're about to explain what it was actually doing."],
    },
    1: {
      time: "4 min",
      say: "This is the hook. Get the room to shout out a character, a place, and a complication — the more absurd, the better, because it proves the machine isn't reciting something memorized. Run it, let the story stream in, and just enjoy the reaction before explaining anything.",
      demo: "Type (or take from the room) three ridiculous ingredients → \"Write the story.\" Then open \"Behind the curtain\" to reveal the hidden system prompt + your wrapped request — every AI product prepends instructions you never see.",
      points: [
        "Absurd inputs = proof it's generating, not retrieving.",
        "\"Behind the curtain\" is the real system message our server sends, abridged.",
      ],
      ask: ["Could you have written a story from those three ingredients? How would yours differ?"],
      caveat: "Say it plainly: the model isn't understanding the story the way you do — it's continuing text. We'll earn that claim over the next chapters.",
    },
    2: {
      time: "3 min",
      say: "Slow the trick down. Replay the same story word by word; before each new word, earlier words light up. The message: the machine keeps glancing back at everything so far — the ingredients and its own sentences — to choose what's next.",
      demo: "Press Play. Point out a glance landing on one of the audience's own ingredient words, and a place where the story reuses an earlier word.",
      points: ["Generation always looks backward at the context.", "This foreshadows attention (Chapter 9)."],
      caveat: "Be honest: those highlights are a reconstruction — an AI's after-the-fact estimate plus literal word reuse — not the model's true attention weights, which aren't exposed. The real machinery reads every earlier word at once, in parallel.",
    },
    3: {
      time: "2 min",
      say: "The rug-pull. When it wrote the first word, there was no plan, no outline, no stored ending. Each word was picked by asking one question — given everything so far, what's a likely next piece of text? — then appending and asking again.",
      points: [
        "No plan, no stored ending: the future of the text doesn't exist until written.",
        "The whole machine: guess → append → repeat.",
      ],
      ask: ["If it has no ending in mind, how does the story still hang together? (Hold the question — it's the whole course.)"],
    },
    4: {
      time: "2 min",
      say: "State the central claim boldly: everything a chatbot does — answering, coding, apologizing, passing an exam — is that one loop. There's no separate 'write poetry' module or 'answer questions' module. One mechanism, the entire repertoire.",
      points: ["One loop underlies every capability.", "This is the claim Chapter 2 makes rigorous and tests live."],
    },
    5: {
      time: "2 min",
      say: "Now plant the doubt on purpose: this sounds far too simple. A plot has structure, a joke pays off, an argument coheres across paragraphs. How can next-word guessing — blind to its own future — produce any of that? That question IS the course.",
      points: ["Name the paradox; don't resolve it yet.", "Every later chapter peels back one layer."],
    },
    6: {
      time: "1 min",
      say: "Recap the three takeaways and hand off to Chapter 2, where the claim stops being a claim: they'll query a real model, watch it rank next words, and run the loop themselves.",
      points: ["One piece at a time; no stored ending; one mechanism for everything."],
    },
  },

  "only-prediction": {
    0: {
      time: "1 min",
      say: "Frame the chapter as evidence-gathering. Last chapter made a big claim; big claims need proof. This chapter they collect it themselves against a real model.",
      points: ["Shift from 'trust me' to 'test it.'"],
    },
    1: {
      time: "2 min",
      say: "Disarm the 'it just predicts words' dismissiveness by showing they do it too. Have them finish 'Better late than ___' without thinking — the word arrives before they ask for it. Surprise, you point out, is just a failed prediction.",
      demo: "Let the room call out the ending in unison. That instant agreement is the point.",
      points: ["Human cognition constantly predicts what's next.", "So the real question isn't 'is it prediction' — it's how good the prediction is."],
      ask: ["When does your own prediction fail? (typos jumping out, a punchline landing)"],
    },
    2: {
      time: "4 min",
      say: "Go live against a real model. Type the start of a sentence; it returns ranked next-word candidates with confidence. Try one where the answer is obvious and one where it's genuinely open, and contrast how peaked vs. flat the bars are.",
      demo: "Use a preset or take a sentence from the room → Predict. Read the top few candidates and their percentages aloud.",
      points: ["The model scores next words and assigns probabilities — this is prediction, made concrete."],
      caveat: "Flag it: those percentages are renormalized among just the few candidates shown. The model actually scores its entire vocabulary — on the order of a hundred thousand options — every single step.",
    },
    3: {
      time: "3 min",
      say: "Make it a game: they guess the next word, then see the model's pick and its live candidates. Whether they match or not, the takeaway is that they just did the model's job — next-word prediction.",
      demo: "Take a one-word guess from the room, Lock it in, compare to the model's word and its candidate bars.",
      points: ["Human and model are doing the same task.", "Set up the next question: how did both get so good at it?"],
      caveat: "If the word arrives in pieces, point it out: the model predicts word-PIECES (tokens), not whole words, and assembles them. That's Chapter 7 — don't rabbit-hole here.",
    },
    4: {
      time: "3 min",
      say: "Now they become the generation loop. Each click appends a candidate and the model re-predicts. Doing it by hand makes 'generation = prediction in a loop' something they felt, not just heard.",
      demo: "Click candidates to extend the sentence a few times. Note the ␣ marker means 'start a new word'; pieces without one glue onto the previous word.",
      points: ["Generation is prediction on repeat — they ARE the sampling algorithm.", "Foreshadows Chapter 11 (temperature = how the pick is made)."],
    },
    5: {
      time: "3 min",
      say: "Deliver the depth argument — the resolution of Chapter 1's paradox. To predict the last word of a mystery novel ('the murderer is ___') well, you'd have to have followed every alibi, motive, and planted clue. Predicting the next word, done well enough, forces you to model everything that makes it likely.",
      points: [
        "'Just predicting' isn't a cheap trick that mimics understanding.",
        "At sufficient quality, prediction DEMANDS understanding.",
      ],
      ask: ["What would you need to know to predict that last word? (the whole plot)"],
    },
    6: {
      time: "1 min",
      say: "Recap: real probabilities, generation as a loop they ran, and prediction-demands-understanding. Tease Chapter 3 — before machines learned language, people tried to hand-write its rules, and it went badly.",
      caveat: "We've kept saying 'word.' The true unit is a slightly smaller word-piece, a token — it changes nothing about the logic and gets its own chapter (7).",
    },
  },
};

export function getSpeakerNotes(slug, slide) {
  return SPEAKER_NOTES[slug]?.[slide] || null;
}
