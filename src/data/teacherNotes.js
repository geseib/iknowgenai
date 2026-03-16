// Per-slide teacher notes for every section.
// Each entry maps to SECTIONS[i] and contains a slides[] array matching PRESENTATION_SLIDES[i].
// Fields: keyPoints (string[]), narrative (string), definitions ({term,def}[]), discussion (string[])

const empty = { keyPoints: [], narrative: "", definitions: [], discussion: [] };

export const TEACHER_NOTES = [
  // ── 0: SectionWhoIsHere (3 slides) ──
  {
    title: "Who's Used AI?",
    slides: [
      {
        keyPoints: ["Surface existing experience", "Most kids have interacted with AI already"],
        narrative: "Start with a show of hands: 'Raise your hand if you've ever talked to Siri, Alexa, or Google.' Most hands should go up immediately.",
        definitions: [],
        discussion: ["Has anyone been recommended a song, video, or game by an app?", "If nobody raises their hand: 'Has anyone used autocorrect or predictive text?'"],
      },
      {
        keyPoints: ["AI is everywhere — not just robots", "Kids already use AI daily"],
        narrative: "'Keep your hand up if YouTube or Netflix has ever suggested something you actually liked.' This almost always gets every hand up — great moment to say that's AI at work.",
        definitions: [],
        discussion: ["What other apps do you think use AI?"],
      },
      {
        keyPoints: ["No wrong answers at this stage", "Warm-up complete"],
        narrative: "Don't pressure kids to define AI yet. You're just warming up and surfacing their existing experience. Accept all answers.",
        definitions: [],
        discussion: [],
      },
    ],
  },

  // ── 1: SectionWhatIsAI (5 slides) ──
  {
    title: "What IS AI?",
    slides: [
      {
        keyPoints: ["Get the class guessing before revealing"],
        narrative: "Ask the class to vote by raising hands for each option. Tally roughly and tap the winning answer.",
        definitions: [],
        discussion: ["What do you think AI actually is?"],
      },
      {
        keyPoints: ["'Robot' is the most common misconception", "AI is software, not hardware"],
        narrative: "'Robot' is the most common misconception — great teaching opportunity. AI is software running on computers, not a physical thing.",
        definitions: [{ term: "AI", def: "Artificial Intelligence — software that learns from examples instead of following fixed rules" }],
        discussion: [],
      },
      {
        keyPoints: ["'Smart program' is close but incomplete"],
        narrative: "'Smart program' is the closest answer — acknowledge that. The key nuance: what makes AI different from a calculator or a regular app?",
        definitions: [],
        discussion: ["What makes something 'smart'?"],
      },
      {
        keyPoints: ["AI was inspired by neurons but doesn't have emotions"],
        narrative: "'Digital brain' opens a great philosophical discussion. AI was inspired by how neurons connect, but it doesn't have feelings or consciousness.",
        definitions: [],
        discussion: ["If it can write like a human, does that make it a brain?"],
      },
      {
        keyPoints: ["AI learns patterns from data", "It's not magic — it's math"],
        narrative: "After the class votes and you reveal: ask 'What do you think ALL three answers are missing?' The real answer: AI is a program that learns from examples.",
        definitions: [],
        discussion: ["What do you think ALL three answers are missing?"],
      },
    ],
  },

  // ── 2: SectionProgramsVsAI (8 slides) ──
  {
    title: "Rules vs Learning",
    slides: [
      {
        keyPoints: ["Traditional programming = explicit rules", "AI = learns patterns from data"],
        narrative: "The key concept: traditional programming is explicit — every rule must be written out. AI is implicit — the rules emerge from patterns in data.",
        definitions: [{ term: "Program", def: "A set of instructions a computer follows step by step" }],
        discussion: [],
      },
      empty, // pair 1
      {
        keyPoints: ["Rules are rigid — they break on edge cases"],
        narrative: "Use the bike analogy: you can't learn to ride a bike by reading instructions. You learn by doing. That's closer to how AI learns.",
        definitions: [],
        discussion: [],
      },
      empty, // pair 2
      {
        keyPoints: ["AI discovers rules by seeing many examples"],
        narrative: "'If I showed you 1,000 pictures of cats and 1,000 pictures of dogs, could you learn to tell them apart without anyone explaining the rules?' That's exactly what AI does.",
        definitions: [],
        discussion: ["Could you learn to sort cats from dogs without being told the rules?"],
      },
      empty, // pair 3
      empty, // reveal 3
      {
        keyPoints: ["AI learns from examples — bad examples = bad learning"],
        narrative: "Watch for the misconception that 'AI = smart = always right.' Emphasize that AI learns from examples, so if the examples are bad, the AI learns bad patterns.",
        definitions: [{ term: "Bias", def: "When AI learns unfair patterns from unbalanced training data" }],
        discussion: ["If the AI only saw pictures of golden retrievers, would it recognize a poodle as a dog?"],
      },
    ],
  },

  // ── 3: SectionBrainVsAI (16 slides) ──
  {
    title: "Brain vs AI",
    slides: [
      {
        keyPoints: ["Brains and AI are different, not better/worse", "AI processes differently from humans"],
        narrative: "Kids often ask 'does AI think like us?' — be honest: we don't fully know. What we do know is that it processes very differently.",
        definitions: [],
        discussion: ["Does AI think like us?"],
      },
      // Slides 1-14: comparison pairs (question → reveal)
      ...Array.from({ length: 13 }, () => empty),
      {
        keyPoints: ["AI is a giant math function", "Inspired by brains but not the same"],
        narrative: "Key point: AI was inspired by neurons, but an AI model is ultimately a giant math function — billions of multiplication operations in sequence.",
        definitions: [{ term: "Neuron", def: "A cell in the brain that sends electrical signals — AI 'neurons' are math operations inspired by real ones" }],
        discussion: ["What would AI need before you'd say it was truly like a brain?"],
      },
    ],
  },

  // ── 4: SectionWhatIsLLM (5 slides) ──
  {
    title: "What's an LLM?",
    slides: [
      {
        keyPoints: ["LLM = Large Language Model", "Three words, each matters"],
        narrative: "We're going to break this down letter by letter. Each word tells us something important about what these models are.",
        definitions: [{ term: "LLM", def: "Large Language Model — a very big AI trained on language" }],
        discussion: [],
      },
      {
        keyPoints: ["'Large' = trillions of words of training data"],
        narrative: "'Large' is worth dwelling on. GPT-4 trained on trillions of words. The entire English Wikipedia is about 4 billion words — so these models read hundreds of Wikipedias.",
        definitions: [],
        discussion: ["How many books do you think you've read in your life? How does that compare?"],
      },
      {
        keyPoints: ["'Language' = focused on words and text"],
        narrative: "'Language' distinguishes LLMs from other AI (like image or audio AI). Some newer models handle images too, but language is core.",
        definitions: [],
        discussion: [],
      },
      {
        keyPoints: ["'Model' = a mathematical representation of patterns"],
        narrative: "A useful analogy: when you hear enough songs, your brain builds a model of what music sounds like. LLMs build a mathematical model of what language sounds like.",
        definitions: [{ term: "Model", def: "A mathematical representation that captures patterns from training data" }],
        discussion: ["What does your brain's 'model' of music sound like?"],
      },
      {
        keyPoints: ["LLMs aren't just text anymore — multimodal is coming"],
        narrative: "After revealing all three: 'So what's the most popular thing people use LLMs for?' Chatbots, writing, coding, answering questions.",
        definitions: [{ term: "Multimodal", def: "AI that can handle multiple types of input — text, images, audio" }],
        discussion: ["What's the most popular thing people use LLMs for?"],
      },
    ],
  },

  // ── 5: SectionMeetModels (4 slides) ──
  {
    title: "Meet the Models",
    slides: [
      {
        keyPoints: ["ChatGPT was the breakout moment for AI", "1 million users in 5 days"],
        narrative: "Ask: 'Has anyone heard of any of these?' before revealing. ChatGPT: emphasize the speed of adoption — 1 million users in 5 days.",
        definitions: [{ term: "ChatGPT", def: "An LLM chatbot made by OpenAI — the most well-known AI assistant" }],
        discussion: ["Has anyone used ChatGPT? What did you use it for?"],
      },
      {
        keyPoints: ["Claude is made by Anthropic", "This app was built with Claude's help"],
        narrative: "This is a great moment to tell the class they're interacting with Anthropic's work right now through this app.",
        definitions: [{ term: "Claude", def: "An LLM made by Anthropic, focused on being helpful and safe" }],
        discussion: [],
      },
      {
        keyPoints: ["Multiple companies build their own AI", "Open source vs closed source"],
        narrative: "Llama: 'open source' is worth explaining. Imagine if the recipe for your favorite food was secret vs. shared with everyone.",
        definitions: [
          { term: "Llama", def: "Meta's open-source LLM — anyone can download and modify it" },
          { term: "Gemini", def: "Google's LLM, built into Search and other Google products" },
          { term: "Open Source", def: "Software whose code is freely available for anyone to use and modify" },
        ],
        discussion: ["If these companies are all building AI, are they competing? Why make their own version?"],
      },
      {
        keyPoints: ["BILLIONS of words — but HOW does that teach it to write?"],
        narrative: "This is the big dramatic question. Let it hang. Don't answer yet — the next sections answer it piece by piece.",
        definitions: [],
        discussion: ["How do YOU think reading millions of books could teach a computer to write?"],
      },
    ],
  },

  // ── 6: SectionTheBridge (3 slides) ──
  {
    title: "The Big Question",
    slides: [
      {
        keyPoints: ["Training = reading the entire internet", "Took months and thousands of computers"],
        narrative: "This is the transition beat — use it as a dramatic pause. 'We know what LLMs are. Now we're going to open the hood and look at the engine.'",
        definitions: [{ term: "Training", def: "The process of feeding an AI massive amounts of data so it can learn patterns" }],
        discussion: ["How do YOU think reading millions of books could teach a computer to write?"],
      },
      {
        keyPoints: ["The 3-step pipeline: numbers → 96 layers → predict", "Watch the animation play through"],
        narrative: "Let the animation run. The robot with the crank is processing 'The cat sat on the ___' through 96 layers. Don't talk over it — let kids watch.",
        definitions: [],
        discussion: [],
      },
      {
        keyPoints: ["96 layers for just ONE word", "Then repeat for every word"],
        narrative: "The punchline: all of that work — just for one word. Then it does it again. And again. Word by word. That's how AI writes.",
        definitions: [],
        discussion: ["Does that seem like a lot of work for one word?"],
      },
    ],
  },

  // ── 7: SectionHowItLearns (11 slides) ──
  {
    title: "How AI Learns",
    slides: [
      {
        keyPoints: ["AI learns by guessing, checking, and adjusting"],
        narrative: "This is a simplified model of how training works. The key: AI learns by guessing, being told if it's right or wrong, and adjusting its settings.",
        definitions: [],
        discussion: [],
      },
      empty, // lettuce
      empty, // punchline
      {
        keyPoints: ["Weight dials represent billions of internal numbers"],
        narrative: "The 'weight dials' represent the billions of numbers inside the model. When it gets something wrong, those numbers shift slightly.",
        definitions: [{ term: "Weights", def: "The billions of numbers inside an AI model that get adjusted during training" }],
        discussion: [],
      },
      empty, empty, empty, empty, empty, empty, // robot Q&A pairs
      {
        keyPoints: ["Real AI does this millions of times", "It learns the pattern, not just the answers"],
        narrative: "Emphasize: real AI does this millions of times with millions of examples. It learns the PATTERN, not just individual answers.",
        definitions: [],
        discussion: ["If the AI practiced 1,000 knock-knock jokes, would it get better at a NEW joke it's never seen?"],
      },
    ],
  },

  // ── 8: SectionHook (5 slides) ──
  {
    title: "The Secret: Numbers",
    slides: [
      {
        keyPoints: ["Humans experience words with all senses", "AI only has numbers"],
        narrative: "Start by showing 'cat' and asking: 'When you see this word, what happens in your brain?' Give kids 30–60 seconds to share.",
        definitions: [],
        discussion: ["When you see the word 'cat', what happens in your brain?"],
      },
      {
        keyPoints: ["Kids' descriptions show rich human understanding"],
        narrative: "Kids will offer rich descriptions: fur, whiskers, purring. Write a few on the board. The key pivot is coming next.",
        definitions: [],
        discussion: [],
      },
      {
        keyPoints: ["AI can't picture, feel, or smell — only numbers"],
        narrative: "'All of that — the fur, the purring, the picture in your head — your brain does that instantly. But AI can't do ANY of that. It only has one tool: numbers.'",
        definitions: [{ term: "Embedding", def: "A list of numbers that represents what a word means to the AI" }],
        discussion: [],
      },
      {
        keyPoints: ["12,288 numbers per word", "Let the visual do the work"],
        narrative: "When the numbers start streaming, stay quiet. Let the visual do the work. The scrolling counter drives it home.",
        definitions: [],
        discussion: ["How many numbers do you think represent one word?"],
      },
      {
        keyPoints: ["Each word becomes a point in 'meaning space'"],
        narrative: "Follow-up: 'How many numbers do you think represent one word?' Let them guess before revealing 12,288.",
        definitions: [{ term: "Vector", def: "A list of numbers that describes something — like coordinates, but with thousands of dimensions" }],
        discussion: [],
      },
    ],
  },

  // ── 9: SectionEmbeddings (8 slides) ──
  {
    title: "Words in Space",
    slides: [
      {
        keyPoints: ["Similar meanings = close together in space"],
        narrative: "Let kids tap words freely. Ask: 'Why do you think king and queen are close together but far from pizza?'",
        definitions: [{ term: "Embedding Space", def: "An imaginary space where every word has a position based on its meaning" }],
        discussion: ["Why are king and queen close together?"],
      },
      empty, // scatter
      {
        keyPoints: ["Words cluster by meaning", "AI discovers these clusters from data"],
        narrative: "When a kid finds a cluster: 'What do all the words in that group have in common?'",
        definitions: [],
        discussion: ["What would you call the dimension that connects these words?"],
      },
      {
        keyPoints: ["Each dimension captures one aspect of meaning"],
        narrative: "Go slowly through each dimension. Let the class name it BEFORE revealing.",
        definitions: [{ term: "Dimension", def: "One axis of measurement — like height, weight, or 'is it alive?'" }],
        discussion: ["What do cat and dog have in common that bird doesn't?"],
      },
      {
        keyPoints: ["Surprising connections across categories"],
        narrative: "The bird/plane 'Has Wings' moment usually gets a reaction — AI discovered this cross-group similarity on its own.",
        definitions: [],
        discussion: ["What else has wings that isn't a bird?"],
      },
      empty, empty, // more dimension steps
      {
        keyPoints: ["Real AI uses 12,288 dimensions", "Captures everything about a word's meaning"],
        narrative: "'If you could measure a word along 12,288 different axes, do you think you could capture everything about what it means?'",
        definitions: [],
        discussion: ["Could 12,288 dimensions capture everything about a word?"],
      },
    ],
  },

  // ── 10: SectionAttention (7 slides) ──
  {
    title: "Attention!",
    slides: [
      {
        keyPoints: ["'Bat' has two completely different meanings", "Context is everything"],
        narrative: "Don't tell the class the answer — genuinely ask for a show of hands. Both 'baseball bat' and 'flying bat' should get votes. Perfect.",
        definitions: [],
        discussion: ["What does 'bat' mean to you?"],
      },
      {
        keyPoints: ["Same word, two meanings — AI must figure out which one"],
        narrative: "The key insight: 'the AI has to figure it out without the picture in their head.' How would YOU tell someone which bat you meant, using only words?",
        definitions: [],
        discussion: ["How would you explain which 'bat' you mean using only words?"],
      },
      {
        keyPoints: ["AI sees BOTH meanings at once — until context narrows it down"],
        narrative: "This sets up the 'unless...' cliffhanger. Context is the key.",
        definitions: [],
        discussion: [],
      },
      {
        keyPoints: ["AI needs context from surrounding words"],
        narrative: "The surrounding words are the clues. 'Unless it looks at the other words in the sentence.'",
        definitions: [{ term: "Attention", def: "The process where each word looks at all the other words to understand context — words look at each other" }],
        discussion: [],
      },
      {
        keyPoints: ["Baseball vocabulary = baseball bat", "Words like 'swung', 'hit', 'ball' are the clues"],
        narrative: "Read the sentence aloud. When the answer reveals, ask: which words were the clues? 'Swung', 'hit', and 'ball' are all baseball vocabulary.",
        definitions: [],
        discussion: ["Which words were the biggest clues?"],
      },
      {
        keyPoints: ["Nature vocabulary = flying bat", "Same word, different clues"],
        narrative: "Same exercise. Ask the class to predict the clue words BEFORE revealing. 'Flew', 'cave', and 'dusk' — all nature vocabulary.",
        definitions: [],
        discussion: ["Can you predict which words will be the clues this time?"],
      },
      {
        keyPoints: ["Attention = words looking at each other for clues", "96 attention heads work in parallel"],
        narrative: "That's attention! Same word, completely different meaning — depending on which other words shine their spotlight on it.",
        definitions: [{ term: "Attention Head", def: "One spotlight that focuses on different relationships — real models have 96 working in parallel" }],
        discussion: ["Can you think of other words that have two completely different meanings?"],
      },
    ],
  },

  // ── 11: SectionMLP (4 slides) ──
  {
    title: "The Thinking Layer",
    slides: [
      {
        keyPoints: ["MLP connects what it's reading to everything it ever learned", "Attention finds relationships, MLP thinks about them"],
        narrative: "Attention is reading the room and figuring out who's related to whom. MLP is flipping through your entire memory to decide what it all means.",
        definitions: [{ term: "MLP", def: "Multi-Layer Perceptron — the 'thinking layer' that asks questions about each word using everything it learned in training" }],
        discussion: [],
      },
      {
        keyPoints: ["21 Questions → 49,152 questions", "4× expansion = room to brainstorm"],
        narrative: "The 4× expansion is worth pausing on. Ask: 'Why would you make it bigger in the middle?' Answer: more room to consider possibilities.",
        definitions: [],
        discussion: ["Why would you want MORE room to think before narrowing down?"],
      },
      {
        keyPoints: ["Keep what's useful, throw away the rest", "Expand then compress = brainstorm then decide"],
        narrative: "A good physical analogy: breathing in deeply before answering a hard question. The 'expand then compress' pattern gives the model room to think.",
        definitions: [],
        discussion: [],
      },
      {
        keyPoints: ["Every layer does BOTH: Attention + MLP", "Then passes results to the next layer"],
        narrative: "After the animation: 'Every single layer does Attention (words look at each other) + MLP (asks questions). How many layers do you think there are?' (96)",
        definitions: [],
        discussion: ["How many layers do you think there are?"],
      },
    ],
  },

  // ── 12: SectionLayers (2 slides) ──
  {
    title: "Rinse & Repeat",
    slides: [
      {
        keyPoints: ["96 layers — each pass makes understanding richer", "Early layers = spelling, late layers = reasoning"],
        narrative: "Ask the class to guess what early vs late layers might do BEFORE revealing. 'What would you learn first if you were trying to understand language from scratch?'",
        definitions: [{ term: "Layer", def: "One complete round of Attention + MLP — the model has 96 of these stacked in sequence" }],
        discussion: ["If you cut the model off at layer 32, what could it do? What couldn't it do?"],
      },
      {
        keyPoints: ["Watch the full 96-layer animation", "Notice the questions changing as layers get deeper"],
        narrative: "The 96-layer count is the wow moment. The animation shows questions evolving from 'Is this spelled right?' (early) to 'Which word fits best?' (late). Let it play.",
        definitions: [],
        discussion: ["What do you think happens between layer 1 and layer 96 that makes the answer so much better?"],
      },
    ],
  },

  // ── 13: SectionPredict (5 slides) ──
  {
    title: "Predict!",
    slides: [
      {
        keyPoints: ["After 96 layers, the model picks ONE word", "But how?"],
        narrative: "The big question: all that work — but how does it actually pick the next word? This is the payoff.",
        definitions: [],
        discussion: [],
      },
      {
        keyPoints: ["Meaning flows into the last position", "All words contribute context"],
        narrative: "Watch the animation: each word sends its meaning into the last word. Grammar, facts, context — it all accumulates. The model then ranks candidate next words.",
        definitions: [{ term: "Prediction", def: "The model's best guess for the next word, based on everything it processed through 96 layers" }],
        discussion: [],
      },
      {
        keyPoints: ["Ranked probability list shows most likely next words", "The top word wins — unless temperature adds randomness"],
        narrative: "The probability list shows how the model ranks candidates. 'mat' wins at 42%, but 'floor', 'rug', and others are possibilities too.",
        definitions: [{ term: "Probability", def: "How likely the model thinks each word is — shown as a percentage" }],
        discussion: ["Why might there be multiple good answers instead of just one?"],
      },
      {
        keyPoints: ["Temperature controls creativity vs safety", "Low = predictable, High = creative"],
        narrative: "Generate a sentence at temp 0.1 (frozen), then reset and try at temp 1.5 (wild). Show how the same prompt gives different results.",
        definitions: [{ term: "Temperature", def: "A dial that controls how adventurous the AI's word choices are — low = safe, high = creative" }],
        discussion: ["At temperature zero, if you asked the same question 100 times, would you always get the same answer?", "Why would you WANT high temperature?"],
      },
      {
        keyPoints: ["You now know the full pipeline!", "Words → Numbers → Space → Attention → MLP → Predict"],
        narrative: "Final discussion: 'Now that you know how AI works under the hood — does it change how you think about using it?'",
        definitions: [],
        discussion: ["What does AI do well?", "What might it struggle with?", "Does knowing how it works change how you'd use it?"],
      },
    ],
  },
];
