// Knowledge Check questions — section-tagged and grade-aware.
//
// Each question: { id, section, grades, q, options, correct, explanation }
//   section  the section id it checks (src/data/sections.js) — shown as a tag
//   grades   which bands see it; wording is pitched at the youngest band listed
// Used three ways: the solo Knowledge Check (landing page), the in-lesson
// class quiz (one vote per question on the projector / phones), and the
// "in your own words" closer. Quick polls between acts live below too.

export const QUIZ_QUESTIONS = [
  /* ── Act 1 · AI is all around you ─────────────────────────────────── */
  {
    id: "rules-vs-learn", section: "rules-vs-learning", grades: ["K-2", "3-5", "7-8"],
    q: "What makes AI different from a regular program?",
    options: ["It runs faster", "It learns from examples instead of following written rules", "It never makes mistakes", "It was invented first"],
    correct: 1,
    explanation: "Regular programs follow rules a person wrote. AI learns patterns from examples, like how you learn from experience!",
  },
  /* ── Act 2 · How AI learns ─────────────────────────────────────────── */
  {
    id: "guess-check-adjust", section: "how-it-learns", grades: ["K-2", "3-5", "7-8"],
    q: "How did the robots learn to finish the knock-knock joke?",
    options: ["Someone typed the answer in for them", "They guessed, got told if they were wrong, and adjusted — again and again", "They already knew every joke", "They looked it up on the internet"],
    correct: 1,
    explanation: "Guess → check → adjust. That loop, repeated trillions of times on real text, is training. Nobody types the answers in.",
  },
  {
    id: "new-joke", section: "how-it-learns", grades: ["3-5", "7-8"],
    q: "After practicing lots of knock-knock jokes, could the AI finish a NEW one it has never seen?",
    options: ["No — it only knows the exact jokes it practiced", "Yes — it learned the pattern, not just the answers", "Only if the joke is very short", "Only if someone tells it the punchline first"],
    correct: 1,
    explanation: "That's the whole point of learning from examples: it picks up the pattern (knock knock → who's there → …), so it can handle jokes it never saw.",
  },
  {
    id: "human-feedback", section: "three-steps", grades: ["7-8"],
    q: "In the 'learning from human feedback' step, what did the humans actually do?",
    options: ["Rated which of two answers was better, over and over", "Typed in all the facts the AI should know", "Wrote the rules for good behavior in code", "Deleted the AI's mistakes by hand"],
    correct: 0,
    explanation: "People compared pairs of answers and picked the better one. Those ratings taught the model what 'helpful, safe and friendly' looks like — the same thing your class did in the A/B rounds.",
  },
  {
    id: "feelings", section: "brain-vs-ai", grades: ["K-2", "3-5", "7-8"],
    q: "An AI says 'I'm so excited to help!' What's really going on?",
    options: ["It is definitely feeling excited", "It is pretending on purpose to trick you", "It is predicting what a friendly person would say", "It read your mind"],
    correct: 2,
    explanation: "It learned those words from millions of examples of people talking. Whether there's any feeling behind them is a question scientists still argue about — but the words come from prediction.",
  },
  /* ── Act 3 · What's an LLM ─────────────────────────────────────────── */
  {
    id: "llm", section: "what-is-llm", grades: ["K-2", "3-5", "7-8"],
    q: 'What does "LLM" stand for?',
    options: ["Little Learning Machine", "Lots of Loud Meowing", "Large Language Model", "Long Lasting Memory"],
    correct: 2,
    explanation: "LLM stands for Large Language Model — large because the model is huge (billions of dials) and it learned from trillions of words. (Sorry, cat.)",
  },
  /* ── Act 4 · Inside the machine ────────────────────────────────────── */
  {
    id: "words-numbers", section: "numbers-words", grades: ["K-2", "3-5", "7-8"],
    q: 'You type "pizza". What does the AI actually see?',
    options: ["A long list of numbers", "The letters p-i-z-z-a", "A picture of a pizza", "The smell of pizza"],
    correct: 0,
    explanation: "AI can't read like humans. It turns each word into a long list of numbers (an embedding) so it can do math with it.",
  },
  {
    id: "token", section: "tokens", grades: ["7-8"],
    q: "What is a token?",
    options: ["A whole sentence", "A coin the AI earns for right answers", "A piece of text from a fixed menu — sometimes a word, sometimes part of one", "A picture of a word"],
    correct: 2,
    explanation: "Text gets chopped into pieces from a menu of about 100,000. Common words are one token; long or rare words are built from several (un + believ + able).",
  },
  {
    id: "cat-dog", section: "embeddings", grades: ["3-5", "7-8"],
    q: 'Why do the words "cat" and "dog" end up close together in the word map?',
    options: ["They start with different letters", "They are both short words", "They have similar meanings — both are animals and pets", "Someone placed them there by hand"],
    correct: 2,
    explanation: "Words that appear in similar sentences end up close together. Cat and dog are both animals and pets, so they're used in similar ways.",
  },
  {
    id: "attention", section: "attention", grades: ["3-5", "7-8"],
    q: "What does the Attention step do?",
    options: ["Makes the AI pay attention to the user", "Deletes words that aren't important", "Counts how many words are in the sentence", "Helps words look at other words to understand context"],
    correct: 3,
    explanation: 'Attention lets each word look at all the other words to figure out context — like how "bat" means different things in different sentences.',
  },
  {
    id: "bat", section: "attention", grades: ["K-2", "3-5", "7-8"],
    q: 'The word "bat" can mean a baseball bat or a flying animal. How does AI figure out which one?',
    options: ["It looks at the other words in the sentence for clues", "It always picks the most common meaning", "It guesses randomly", "It asks the user"],
    correct: 0,
    explanation: 'Clues! "Swung" and "ball" point to baseball. "Cave" and "flew" point to the animal. The other words decide.',
  },
  {
    id: "mlp", section: "mlp", grades: ["3-5", "7-8"],
    q: "What does the MLP (thinking layer) do?",
    options: ["It takes the context from Attention and asks questions about it — spelling, grammar, facts, meaning", "It memorizes every sentence it has ever seen", "It translates words into other languages", "It connects to the internet"],
    correct: 0,
    explanation: "After Attention gathers context, the MLP is where stored knowledge gets used — like knowing Michael Jordan played basketball even though none of those words mean basketball.",
  },
  {
    id: "layers", section: "layers", grades: ["3-5", "7-8"],
    q: "Why does the AI 'rinse and repeat' through 96 layers instead of just one?",
    options: ["To use more electricity", "To make the answer take longer", "Because the first layer always gets it wrong", "Because one look-then-think isn't enough — each layer builds deeper understanding"],
    correct: 3,
    explanation: "Each layer understands a little more. Early layers handle spelling and grammar, later ones facts and meaning. Big models do it 50–100 times for every word.",
  },
  /* ── Act 5 · How AI writes ─────────────────────────────────────────── */
  {
    id: "one-word", section: "predict", grades: ["K-2", "3-5", "7-8"],
    q: "How does AI write a sentence?",
    options: ["It predicts one word at a time, then repeats", "It writes the whole sentence at once", "It copies sentences from its training data", "It translates from another language"],
    correct: 0,
    explanation: "AI predicts the next word, adds it, then predicts the next word after that — one at a time, like a chain!",
  },
  {
    id: "percent", section: "predict", grades: ["3-5", "7-8"],
    q: 'The AI\'s list says "mat: 42%". What does that mean?',
    options: ["Mat is definitely the next word", "The AI gives mat about a 42-out-of-100 chance of being next", "Mat is 42 letters long", "42 people voted for mat"],
    correct: 1,
    explanation: "Percent means 'out of 100.' 42% is a chance, not a promise. At low temperature the top word almost always wins; turn temperature up and the other words get their turns.",
  },
  {
    id: "temperature", section: "predict", grades: ["3-5", "7-8"],
    q: 'What does the "temperature" setting control?',
    options: ["How hot the computer gets", "How fast the AI responds", "How surprising or predictable the AI's word choices are", "The color of the text"],
    correct: 2,
    explanation: "Low temperature = safe, predictable words. High temperature = more surprising choices. It's a dice-loading dial, not a smartness dial.",
  },
  /* ── Act 6 · Your turn ─────────────────────────────────────────────── */
  {
    id: "sounds-sure", section: "confidently-wrong", grades: ["K-2", "3-5", "7-8"],
    q: "An AI answer sounds very, very sure. What does that tell you about whether it's right?",
    options: ["It must be right if it sounds sure", "It's more likely to be wrong", "Nothing — sounding sure and being right are different things", "It's right if it uses big words"],
    correct: 2,
    explanation: "AI predicts words that sound right. It can be confident and wrong at the same time. For math, facts and names: check.",
  },
  {
    id: "bias", section: "where-learned", grades: ["3-5", "7-8"],
    q: "Why might an AI draw a 'doctor' as a man almost every time?",
    options: ["Someone told it doctors are men", "It flips a coin", "Doctors really are almost all men", "Most of its example pictures showed men as doctors, so that's the pattern it learned"],
    correct: 3,
    explanation: "AI learns from its examples. If the examples lean one way, the answers lean that way too. That's called bias — and it happens without anyone meaning it to.",
  },
];

/** The reflection prompt that closes the quiz, per grade. */
export const OWN_WORDS = {
  "K-2": "Tell a friend: how does AI learn new things?",
  "3-5": "In your own words: why can AI sound sure and still be wrong?",
  "7-8": "Explain to a younger kid how the word 'bat' gets its meaning from the other words around it.",
};

/** Questions for a grade band, in course order. */
export function quizFor(grade) {
  return QUIZ_QUESTIONS.filter(q => q.grades.includes(grade));
}

/* ── Quick polls: one predict-then-reveal check per act ─────────────── */
export const ACT_POLLS = [
  {
    id: "poll-1", after: "rules-vs-learning", act: "AI Is All Around You",
    q: "True or false: someone typed out every rule an AI uses to answer you.",
    options: ["True", "False"], correct: 1,
    why: "False. A person writes every rule for a calculator. An AI's rules were found by the AI itself, from millions of examples — nobody typed them in.",
  },
  {
    id: "poll-2", after: "brain-vs-ai", act: "How AI Learns",
    q: "How did the robots get better at the knock-knock joke?",
    options: ["Guess, check, adjust — again and again", "Someone typed in the answer", "They already knew it"], correct: 0,
    why: "Guess → check → adjust. Wrong guesses nudge the dials; that's training.",
  },
  {
    id: "poll-3", after: "the-bridge", act: "What's an LLM?",
    q: "What does the L-L-M in LLM stand for?",
    options: ["Little Learning Machine", "Large Language Model", "Long List of Memories"], correct: 1,
    why: "Large (a giant model with billions of dials, trained on trillions of words), Language (it works with words), Model (a giant math structure).",
  },
  {
    id: "poll-4", after: "layers", act: "Inside the Machine",
    q: "How does AI know which 'bat' you mean?",
    options: ["It always picks the animal", "It asks you", "It looks at the other words in the sentence"], correct: 2,
    why: "Attention: every word looks at the other words. 'Swung' and 'ball' point one way, 'cave' and 'flew' the other.",
  },
  {
    id: "poll-5", after: "reasoning", act: "How AI Writes",
    q: "Turn the temperature dial UP. What changes?",
    options: ["The word choices get more surprising", "The computer gets warmer", "The AI gets smarter"], correct: 0,
    why: "Temperature reshapes the odds. Higher means the less-likely words get picked more often — more surprising, not smarter.",
  },
];
