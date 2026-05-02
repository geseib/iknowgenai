// Curated slide-by-slide content for the course workflow spreadsheet.
//
// One entry per V2 section. Slides are listed in the order a 7-8 grader would
// click through (the most complete version). For shorter grade levels, the
// generator script trims the slide list to GRADE_CONFIG[grade].presentationSlides[i]
// — those slides represent what those students actually see/click.
//
// Fields per slide:
//   id              short slug used for "identifier" column (e.g. "attention.s4")
//   title           short label that fits a spreadsheet column
//   description     what reveals / what the user does on this click
//   element_group   slides that together build ONE concept beat
//                   (sequence beats — "the bat baseball example")
//   placement_group slides that share a single visual canvas / are layered on
//                   one composite (overlay beats — same backdrop)
//   interactive     STATIC | AUTO-ANIM | INPUT | DRAG | SLIDER | SELECT | LIVE-AI
//   simplification  optional — what we say vs. what's really happening
//   notes           optional — flags for ordering decisions, branching, etc.

export const SECTIONS = [
  {
    v2: 0,
    group: { id: 1, name: "What Is AI?" },
    title: "Who's Used AI?",
    file: "SectionWhoIsHere.jsx",
    slides: [
      { id: "who.s0", title: "Show of hands hook", description: "Title card. Teacher prompts: 'Raise your hand if you've ever talked to Siri/Alexa/Google.'", element_group: "warmup-hands", placement_group: "warmup-canvas", interactive: "STATIC" },
      { id: "who.s1", title: "AI examples grid", description: "Grid of 8 AI apps (Siri, Netflix, games, camera, ChatGPT, Spotify, Google, filters) reveals one by one. 'Keep your hand up if YouTube/Netflix has suggested something you liked.'", element_group: "warmup-hands", placement_group: "warmup-canvas", interactive: "AUTO-ANIM" },
      { id: "who.s2", title: "Open brainstorm", description: "Prompt: 'What other apps do you think use AI?' Accept all answers — no pressure to define AI yet.", element_group: "warmup-discuss", placement_group: "warmup-canvas", interactive: "STATIC" },
    ],
  },
  {
    v2: 1,
    group: { id: 1, name: "What Is AI?" },
    title: "Story Mash-Up!",
    file: "SectionStoryMash.jsx",
    slides: [
      { id: "story.s0", title: "GenAI intro", description: "Define generative AI: until recently AI sorted/recommended; ~2017 Transformer + Nov 2022 ChatGPT changed it — AI now CREATES (stories, images, music, code).", element_group: "story-frame", placement_group: "frame", interactive: "STATIC", simplification: "We say 'AI learned to create' — really it's pattern-matched generation from massive data." },
      { id: "story.s1", title: "Demo title", description: "Title card sets up the wow moment: 3 random ingredients → one story.", element_group: "story-demo", placement_group: "demo-canvas", interactive: "STATIC" },
      { id: "story.s2", title: "Live prompt entry", description: "3 students secretly enter a character, place, and event (manual input or QR-scan from phones).", element_group: "story-demo", placement_group: "demo-canvas", interactive: "INPUT", notes: "Two entry modes: remote (QR/phone) or manual classroom keyboard." },
      { id: "story.s3", title: "Story streams in", description: "Real LLM streams the story word by word, weaving the 3 ingredients together. Stay quiet — let the magic land. After: 'How did it know how to do that?'", element_group: "story-demo", placement_group: "demo-canvas", interactive: "AUTO-ANIM", notes: "Replayable — class can run 2–3 times if loving it." },
      { id: "story.s4", title: "What is a prompt?", description: "Connect the dots: the 3 inputs combined into a PROMPT. Define prompt. Optional 'behind the scenes' panel reveals the actual system/user/assistant messages sent to the AI.", element_group: "story-explain", placement_group: "explain-canvas", interactive: "STATIC", notes: "behindTheScenes panel can expand to show the chat-format messages." },
      { id: "story.s5", title: "Word-by-word visual", description: "Animation walks through how each new word is picked based on all words before it. AI doesn't plan the ending first — it predicts ONE word, then the next.", element_group: "story-explain", placement_group: "explain-canvas", interactive: "AUTO-ANIM" },
    ],
  },
  {
    v2: 2,
    group: { id: 1, name: "What Is AI?" },
    title: "What IS AI?",
    file: "SectionWhatIsAI.jsx",
    slides: [
      { id: "whatis.s0", title: "Vote: 3 options", description: "'Is AI a robot, a smart program, or a digital brain?' Class votes by raising hands for each option. All three are partly right.", element_group: "whatis-vote", placement_group: "vote-canvas", interactive: "SELECT" },
      { id: "whatis.s1", title: "Reveal: it learns", description: "Real answer: regular programs follow rules someone WROTE. AI learns rules ITSELF from millions of examples — like how you learned to talk by hearing people talk.", element_group: "whatis-reveal", placement_group: "vote-canvas", interactive: "STATIC" },
    ],
  },
  {
    v2: 3,
    group: { id: 1, name: "What Is AI?" },
    title: "Rules vs Learning",
    file: "SectionProgramsVsAI.jsx",
    slides: [
      { id: "rules.s0", title: "Programs vs AI intro", description: "Programs = explicit rules someone wrote. AI = patterns learned from data. Define 'program'.", element_group: "rules-frame", placement_group: "frame", interactive: "STATIC" },
      { id: "rules.s1", title: "Pair 1 question", description: "First scenario pair shown side-by-side (e.g. calculator vs cat detector). Class guesses which is which.", element_group: "rules-pair-1", placement_group: "pair-1-canvas", interactive: "SELECT" },
      { id: "rules.s2", title: "Pair 1 reveal", description: "Reveal which is rule-based and which is AI. Bike analogy: you can't learn to ride a bike from instructions.", element_group: "rules-pair-1", placement_group: "pair-1-canvas", interactive: "STATIC" },
      { id: "rules.s3", title: "Pair 2 question", description: "Second scenario pair. Class guesses again.", element_group: "rules-pair-2", placement_group: "pair-2-canvas", interactive: "SELECT" },
      { id: "rules.s4", title: "Pair 2 reveal", description: "Reveal — second example reinforces the pattern.", element_group: "rules-pair-2", placement_group: "pair-2-canvas", interactive: "STATIC" },
      { id: "rules.s5", title: "Bias warning", description: "AI learns FROM EXAMPLES — bad/unbalanced examples = bad learning. Define 'bias'. 'If AI only saw golden retrievers, would it recognize a poodle as a dog?'", element_group: "rules-insight", placement_group: "frame", interactive: "STATIC" },
    ],
  },
  {
    v2: 4,
    group: { id: 1, name: "What Is AI?" },
    title: "Brain vs AI",
    file: "SectionBrainVsAI.jsx",
    slides: [
      { id: "brain.s0", title: "Does AI think like us?", description: "Title — three areas to compare: how it learns, emotions, creativity. Honest framing: we don't fully know.", element_group: "brain-frame", placement_group: "frame", interactive: "STATIC" },
      { id: "brain.s1", title: "Learning Q", description: "Prompt: how does each one learn?", element_group: "brain-learning", placement_group: "row-learning", interactive: "STATIC" },
      { id: "brain.s2", title: "Learning A", description: "Both learn — brains from living in the world, AI from millions of text examples.", element_group: "brain-learning", placement_group: "row-learning", interactive: "STATIC" },
      { id: "brain.s3", title: "Emotions Q", description: "Prompt: does AI have feelings?", element_group: "brain-emotions", placement_group: "row-emotions", interactive: "STATIC" },
      { id: "brain.s4", title: "Emotions A", description: "AI sounds emotional but doesn't FEEL anything — like an actor who can cry on cue without being sad.", element_group: "brain-emotions", placement_group: "row-emotions", interactive: "STATIC" },
      { id: "brain.s5", title: "Creativity Q", description: "Prompt: is AI creative?", element_group: "brain-creative", placement_group: "row-creative", interactive: "STATIC" },
      { id: "brain.s6", title: "Creativity A", description: "AI remixes patterns from training data. Is that creativity? Open question for the class.", element_group: "brain-creative", placement_group: "row-creative", interactive: "STATIC" },
      { id: "brain.s7", title: "Math function payoff", description: "Punchline: AI was inspired by neurons but is ultimately a giant math function — billions of multiplications. Define 'neuron'.", element_group: "brain-payoff", placement_group: "frame", interactive: "STATIC" },
    ],
  },
  {
    v2: 5,
    group: { id: 2, name: "Meet the LLMs" },
    title: "What's an LLM?",
    file: "SectionWhatIsLLM.jsx",
    slides: [
      { id: "llm.s0", title: "LLM intro", description: "Define LLM = Large Language Model. 'Three words, each matters — we'll break them down one by one.'", element_group: "llm-frame", placement_group: "letter-stack", interactive: "STATIC" },
      { id: "llm.s1", title: "L = Large", description: "GPT-4 trained on TRILLIONS of words. English Wikipedia ≈ 4B words — these models read hundreds of Wikipedias.", element_group: "llm-letters", placement_group: "letter-stack", interactive: "STATIC", simplification: "We say 'words' but technically LLMs process tokens — subword pieces. We use 'words' because it's intuitive." },
      { id: "llm.s2", title: "L = Language", description: "Distinguishes LLMs from image/audio AI. Some newer models handle images too, but language is core.", element_group: "llm-letters", placement_group: "letter-stack", interactive: "STATIC" },
      { id: "llm.s3", title: "M = Model", description: "Mathematical representation of patterns. Analogy: hearing enough songs builds a 'model' of music in your brain — LLMs build a model of language.", element_group: "llm-letters", placement_group: "letter-stack", interactive: "STATIC" },
      { id: "llm.s4", title: "Multimodal expansion", description: "Unpack: LLMs aren't just text anymore — vision, audio. Define 'multimodal'. Discussion: 'most popular thing people use LLMs for?'", element_group: "llm-payoff", placement_group: "letter-stack", interactive: "STATIC" },
    ],
  },
  {
    v2: 6,
    group: { id: 2, name: "Meet the LLMs" },
    title: "Meet the Models",
    file: "SectionMeetModels.jsx",
    slides: [
      { id: "models.s0", title: "Carousel of 4 models", description: "Auto-scrolling cards: ChatGPT (OpenAI), Claude (Anthropic), Llama (Meta — open source), Gemini (Google). 'Has anyone heard of any of these?'", element_group: "models-tour", placement_group: "carousel-canvas", interactive: "AUTO-ANIM" },
      { id: "models.s1", title: "BIG question hook", description: "'BILLIONS of words — but HOW does that teach it to write?' Dramatic pause. Don't answer yet.", element_group: "models-hook", placement_group: "frame", interactive: "STATIC" },
    ],
  },
  {
    v2: 7,
    group: { id: 2, name: "Meet the LLMs" },
    title: "How AI Learns",
    file: "SectionHowItLearns.jsx",
    slides: [
      { id: "learn.s0", title: "Guess, check, adjust intro", description: "Title — AI learns by guessing, being told if it's right or wrong, and adjusting its settings.", element_group: "learn-frame", placement_group: "frame", interactive: "STATIC" },
      { id: "learn.s1", title: "Knock-knock setup", description: "Round 1 setup: knock-knock. Cat says 'Lettuce' — what's the punchline? Robots make wild guesses.", element_group: "learn-round-1", placement_group: "joke-canvas", interactive: "AUTO-ANIM" },
      { id: "learn.s2", title: "Punchline reveal", description: "Punchline reveals: 'Lettuce in!' Robots got it wrong. Their weight dials shift.", element_group: "learn-round-1", placement_group: "joke-canvas", interactive: "AUTO-ANIM" },
      { id: "learn.s3", title: "Weight dials", description: "Weight dials represent the BILLIONS of internal numbers. When AI is wrong, those numbers shift slightly. Define 'weights'.", element_group: "learn-weights", placement_group: "joke-canvas", interactive: "AUTO-ANIM" },
      { id: "learn.s4", title: "Robot Q&A round 2", description: "Second round: robots try again with adjusted weights, getting closer.", element_group: "learn-round-2", placement_group: "joke-canvas", interactive: "AUTO-ANIM" },
      { id: "learn.s5", title: "Robot Q&A round 2 reveal", description: "Reveal whether robots got it right; dials adjust again.", element_group: "learn-round-2", placement_group: "joke-canvas", interactive: "AUTO-ANIM" },
      { id: "learn.s6", title: "Robot Q&A round 3", description: "Third round: robots now answer correctly — the learning curve.", element_group: "learn-round-3", placement_group: "joke-canvas", interactive: "AUTO-ANIM" },
      { id: "learn.s7", title: "Real AI scale", description: "Real AI does this MILLIONS of times with millions of examples. It learns the PATTERN, not specific answers.", element_group: "learn-payoff", placement_group: "frame", interactive: "STATIC" },
    ],
  },
  {
    v2: 8,
    group: { id: 2, name: "Meet the LLMs" },
    title: "Three Steps to Helpful AI",
    file: "SectionThreeSteps.jsx",
    slides: [
      { id: "steps.s0", title: "Why pre-training isn't enough", description: "Connect to knock-knock joke: real AI does the same on a much bigger scale, in three stages. 'If you read every book in the library, would you automatically be helpful?'", element_group: "steps-frame", placement_group: "pipeline", interactive: "STATIC" },
      { id: "steps.s1", title: "Stage 1: Pre-training", description: "Pre-training = reading TRILLIONS of words. Spinning weight dials = billions of weights being adjusted. Speed-reading the internet.", element_group: "steps-pretrain", placement_group: "pipeline", interactive: "AUTO-ANIM" },
      { id: "steps.s2", title: "Raw model surprise", description: "Genuinely surprising moment: AI that read trillions of words... just keeps generating text. Doesn't know what a 'question' is yet.", element_group: "steps-pretrain", placement_group: "pipeline", interactive: "STATIC" },
      { id: "steps.s3", title: "Stage 2: Instruction Tuning", description: "Humans write thousands of example conversations (Q→A). Same AI, completely different behavior — just from seeing good examples.", element_group: "steps-tuning", placement_group: "pipeline", interactive: "STATIC" },
      { id: "steps.s4", title: "Stage 3: RLHF intro", description: "RLHF = humans rate which responses are BETTER. Being able to answer isn't enough — AI needs to learn what GOOD looks like.", element_group: "steps-rlhf-intro", placement_group: "pipeline", interactive: "STATIC" },
      { id: "steps.s5", title: "RLHF round 1", description: "A/B choice: students pick the better response. Personality bars (Clearer / Safer / Friendlier) shift based on choice.", element_group: "steps-rlhf-rounds", placement_group: "rlhf-canvas", interactive: "SELECT" },
      { id: "steps.s6", title: "RLHF round 2", description: "Second A/B preference round; bars continue shifting.", element_group: "steps-rlhf-rounds", placement_group: "rlhf-canvas", interactive: "SELECT" },
      { id: "steps.s7", title: "RLHF round 3", description: "Third A/B round — class sees their cumulative preferences shape the AI.", element_group: "steps-rlhf-rounds", placement_group: "rlhf-canvas", interactive: "SELECT" },
      { id: "steps.s8", title: "Whose 'good'?", description: "Personality bars summary. Discussion: 'Who decides what GOOD means? Would AI from different countries behave differently?'", element_group: "steps-payoff", placement_group: "rlhf-canvas", interactive: "STATIC" },
    ],
  },
  {
    v2: 9,
    group: { id: 3, name: "Inside the Machine" },
    title: "The Big Question",
    file: "SectionTheBridge.jsx",
    slides: [
      { id: "bridge.s0", title: "Open the hood", description: "Transition beat: 'We know what LLMs are. Now we open the hood and look at the engine.' Define 'training'.", element_group: "bridge-frame", placement_group: "pipeline", interactive: "STATIC", simplification: "Training stages presented as sequential are actually simultaneous in real training." },
      { id: "bridge.s1", title: "3-step pipeline anim", description: "Robot with crank processes 'The cat sat on the ___' through 96 layers. Don't talk over it — let kids watch.", element_group: "bridge-pipeline", placement_group: "pipeline-canvas", interactive: "AUTO-ANIM", simplification: "96 layers is GPT-3 specific. GPT-2 has 48; smaller models have 12; newer can have 128+." },
      { id: "bridge.s2", title: "All that for ONE word", description: "Punchline: all that work — JUST FOR ONE WORD. Then it does it again. Word by word. That's how AI writes.", element_group: "bridge-payoff", placement_group: "pipeline-canvas", interactive: "STATIC" },
    ],
  },
  {
    v2: 10,
    group: { id: 3, name: "Inside the Machine" },
    title: "Numbers & Words",
    file: "SectionHook.jsx",
    slides: [
      { id: "hook.s0", title: "What is 'cat'?", description: "Show the word 'cat'. 'When you see this word, what happens in your brain?' Give 30–60s for kids to share.", element_group: "hook-human", placement_group: "human-canvas", interactive: "STATIC" },
      { id: "hook.s1", title: "Rich human descriptions", description: "Capture kids' descriptions: fur, whiskers, purring. Write a few on the board.", element_group: "hook-human", placement_group: "human-canvas", interactive: "STATIC" },
      { id: "hook.s2", title: "AI only has numbers", description: "Pivot: 'All of that — fur, purring, picture in your head — your brain does instantly. AI can't do ANY of that. Only numbers.' Define 'embedding'.", element_group: "hook-pivot", placement_group: "pivot-canvas", interactive: "STATIC", simplification: "AI processes 'tokens' (subword pieces), not whole words. We simplify to 'words'." },
      { id: "hook.s3", title: "12,288 numbers stream", description: "Numbers stream by, scrolling counter ticks up. Stay quiet — let the visual do the work. 'How many numbers do you think represent one word?'", element_group: "hook-scale", placement_group: "scale-canvas", interactive: "AUTO-ANIM", simplification: "12,288 is GPT-3's embedding dim. GPT-2 uses 768/1,600. Not universal." },
      { id: "hook.s4", title: "Point in meaning space", description: "Each word becomes a point in 'meaning space'. Define 'vector' — coordinates with thousands of dimensions.", element_group: "hook-scale", placement_group: "scale-canvas", interactive: "STATIC" },
    ],
  },
  {
    v2: 11,
    group: { id: 3, name: "Inside the Machine" },
    title: "Tokens — Not Quite Words",
    file: "SectionTokens.jsx",
    slides: [
      { id: "tokens.s0", title: "Tokens reveal", description: "Define 'token' — a piece of a word. Kids assumed AI thinks in words. Truth: tokens — subword pieces.", element_group: "tokens-frame", placement_group: "frame", interactive: "STATIC" },
      { id: "tokens.s1", title: "Vocab tradeoff intro", description: "Vocab size is a design choice — too small = too many pieces, too big = too much to learn. Spectrum visual.", element_group: "tokens-tradeoff", placement_group: "spectrum-canvas", interactive: "STATIC" },
      { id: "tokens.s2", title: "Too small (95)", description: "At 95 tokens (every character separate), 'The cat sat' explodes into 11 tokens. Wildly inefficient.", element_group: "tokens-tradeoff", placement_group: "spectrum-canvas", interactive: "AUTO-ANIM" },
      { id: "tokens.s3", title: "Too big (1M)", description: "At 1M+ tokens (every word unique), grid becomes overwhelming. Too many entries to learn well.", element_group: "tokens-tradeoff", placement_group: "spectrum-canvas", interactive: "AUTO-ANIM" },
      { id: "tokens.s4", title: "Sweet spot (50K)", description: "50K is the sweet spot. 'Unbelievable' snap-splits into Un + believ + able — reusable across many words.", element_group: "tokens-sweet-spot", placement_group: "spectrum-canvas", interactive: "AUTO-ANIM" },
      { id: "tokens.s5", title: "Tokenizer demo", description: "Kids type words and see them split into colored token chips with token IDs. Try long, compound, made-up words.", element_group: "tokens-hands-on", placement_group: "demo-canvas", interactive: "INPUT", notes: "Real tokenizer (cl100k_base or similar). Fallback splits unknown words into 3-char chunks." },
      { id: "tokens.s6", title: "Stadium of 50K", description: "For every position in a sentence, AI considers 50,000 options. Stadium visual: pick one person from a crowd of 50K.", element_group: "tokens-payoff", placement_group: "frame", interactive: "STATIC" },
    ],
  },
  {
    v2: 12,
    group: { id: 3, name: "Inside the Machine" },
    title: "Words in Space",
    file: "SectionEmbeddings.jsx",
    slides: [
      { id: "embed.s0", title: "Tap-to-explore intro", description: "Similar meanings = close in space. Kids tap words, connection lines reveal relationships.", element_group: "embed-2d-frame", placement_group: "scatter-canvas", interactive: "SELECT" },
      { id: "embed.s1", title: "2D scatter active", description: "Free exploration on the scatter plot. Why are king/queen close but far from pizza?", element_group: "embed-2d-frame", placement_group: "scatter-canvas", interactive: "SELECT" },
      { id: "embed.s2", title: "Clusters emerge", description: "Words cluster by meaning (animals, vehicles, royalty). AI discovers these clusters from data.", element_group: "embed-clusters", placement_group: "scatter-canvas", interactive: "STATIC" },
      { id: "embed.s3", title: "Dimension 1: Is animal?", description: "Each dimension captures one aspect of meaning. First named dimension revealed; class names it before reveal.", element_group: "embed-dims", placement_group: "dim-canvas", interactive: "STATIC" },
      { id: "embed.s4", title: "Dimension 2: Has wings?", description: "Cross-category surprise — bird AND plane have wings. AI discovered this on its own.", element_group: "embed-dims", placement_group: "dim-canvas", interactive: "STATIC" },
      { id: "embed.s5", title: "Dimension 3: ride-able", description: "Another dimension stacks on top.", element_group: "embed-dims", placement_group: "dim-canvas", interactive: "STATIC" },
      { id: "embed.s6", title: "Dimension 4+ stack", description: "More dimensions added — DimensionExplorer visualizes scoring.", element_group: "embed-dims", placement_group: "dim-canvas", interactive: "STATIC" },
      { id: "embed.s7", title: "Thousands of dimensions", description: "Real AI uses thousands of dimensions to capture everything about a word's meaning.", element_group: "embed-payoff", placement_group: "dim-canvas", interactive: "STATIC", simplification: "Named dimensions ('Is Animal?') are illustrative. Real dimensions aren't human-readable categories." },
    ],
  },
  {
    v2: 13,
    group: { id: 3, name: "Inside the Machine" },
    title: "Beyond 2D",
    file: "SectionBeyond2D.jsx",
    slides: [
      { id: "b2d.s0", title: "Connect to 2D scatter", description: "Reference earlier scatter plot. 'That was 2 dimensions. What if we could add more?'", element_group: "b2d-frame", placement_group: "frame", interactive: "STATIC" },
      { id: "b2d.s1", title: "1D number line", description: "Cat and Dog close, Pizza far. Just one axis — only close vs far, no nuance.", element_group: "b2d-progression", placement_group: "dim-stack", interactive: "STATIC" },
      { id: "b2d.s2", title: "2D plane", description: "Two axes — words can cluster by type. Better, still limited.", element_group: "b2d-progression", placement_group: "dim-stack", interactive: "STATIC" },
      { id: "b2d.s3", title: "3D cube (drag)", description: "3D cube of meaning — kids drag to rotate it. Physicality makes the concept tangible.", element_group: "b2d-progression", placement_group: "dim-stack", interactive: "DRAG" },
      { id: "b2d.s4", title: "Counter accelerates to 12,288", description: "Counter accelerates from 4 → 12,288. Wow moment. We can't picture it, but math handles it perfectly. Define 'high-dimensional space'.", element_group: "b2d-progression", placement_group: "dim-stack", interactive: "AUTO-ANIM" },
      { id: "b2d.s5", title: "Cosine similarity", description: "Arrow pairs: similar words point the same way (King↔Queen 0.92), unrelated words point apart (Cat↔Pizza 0.12). Define 'cosine similarity'.", element_group: "b2d-cosine", placement_group: "frame", interactive: "STATIC" },
    ],
  },
  {
    v2: 14,
    group: { id: 3, name: "Inside the Machine" },
    title: "Attention!",
    file: "SectionAttention.jsx",
    slides: [
      { id: "attn.s0", title: "Bat — vote", description: "Show 'bat'. Show of hands: baseball bat or flying bat? Both should get votes.", element_group: "attn-mystery", placement_group: "bat-canvas", interactive: "SELECT" },
      { id: "attn.s1", title: "Same word, two meanings", description: "AI must figure it out without the picture in their head. How would YOU explain which bat using only words?", element_group: "attn-mystery", placement_group: "bat-canvas", interactive: "STATIC" },
      { id: "attn.s2", title: "Both meanings until context", description: "AI sees BOTH meanings at once... unless it looks at the other words. Sets up the cliffhanger.", element_group: "attn-mystery", placement_group: "bat-canvas", interactive: "STATIC" },
      { id: "attn.s3", title: "Attention defined", description: "Define 'attention' — the process where each word looks at all other words for clues.", element_group: "attn-define", placement_group: "frame", interactive: "STATIC" },
      { id: "attn.s4", title: "Baseball context beams", description: "Sentence: '...he swung the bat and hit the ball.' Beams light up clue words (swung, hit, ball). Class predicts which words are clues before reveal.", element_group: "attn-example-1", placement_group: "sentence-canvas", interactive: "AUTO-ANIM" },
      { id: "attn.s5", title: "Nature context beams", description: "Sentence: '...the bat flew out of the cave at dusk.' Different beams (flew, cave, dusk). Same word, different clues.", element_group: "attn-example-2", placement_group: "sentence-canvas", interactive: "AUTO-ANIM" },
      { id: "attn.s6", title: "Attention payoff", description: "That's attention! Multiple attention HEADS work in parallel. Define 'attention head'.", element_group: "attn-payoff", placement_group: "frame", interactive: "STATIC", simplification: "Real attention is more parallel — each head computes weighted scores for every word pair simultaneously, with many heads per layer." },
    ],
  },
  {
    v2: 15,
    group: { id: 4, name: "How AI Writes" },
    title: "The Thinking Layer",
    file: "SectionMLP.jsx",
    slides: [
      { id: "mlp.s0", title: "MLP intro", description: "Attention is reading the room and finding relationships. MLP is the THINKING layer — flips through everything ever learned. Define 'MLP'.", element_group: "mlp-frame", placement_group: "mlp-canvas", interactive: "STATIC", simplification: "'21 questions' analogy is illustrative — MLP does matrix multiplications, not literal yes/no questions." },
      { id: "mlp.s1", title: "Expand to 49,152", description: "21 questions → 49,152 questions. 4× expansion = room to brainstorm. 'Why would you make it bigger in the middle?'", element_group: "mlp-expand", placement_group: "mlp-canvas", interactive: "STATIC", simplification: "4× expansion is GPT-3-style; some models use 8/3× (Llama). Pattern is consistent though." },
      { id: "mlp.s2", title: "Compress back down", description: "Keep what's useful, throw away the rest. Expand-then-compress = brainstorm then decide. Like deep breath before a hard answer.", element_group: "mlp-compress", placement_group: "mlp-canvas", interactive: "STATIC" },
      { id: "mlp.s3", title: "Every layer = Attention + MLP", description: "Every single layer does BOTH: Attention (words look at each other) + MLP (asks questions). 'How many layers?' (96)", element_group: "mlp-payoff", placement_group: "frame", interactive: "STATIC" },
    ],
  },
  {
    v2: 16,
    group: { id: 4, name: "How AI Writes" },
    title: "Rinse & Repeat",
    file: "SectionLayers.jsx",
    slides: [
      { id: "layers.s0", title: "Layers preview", description: "Many layers, each pass richer. Early layers = letters/spelling, middle = grammar/facts, late = reasoning. Class guesses early-vs-late before reveal. Define 'layer'.", element_group: "layers-preview", placement_group: "stack-canvas", interactive: "STATIC", simplification: "96 layers is GPT-3; GPT-2 has 48, smaller models 12-24. Layer specialization is gradual, not as clean as 6 ranges." },
      { id: "layers.s1", title: "Full 96-layer animation", description: "Animation runs through all 96 layers — questions evolve from 'is this spelled right?' (early) to 'which word fits best?' (late). Let it play.", element_group: "layers-anim", placement_group: "stack-canvas", interactive: "AUTO-ANIM", simplification: "Flashing questions are an analogy — each layer does math transformations, not literal questions." },
    ],
  },
  {
    v2: 17,
    group: { id: 4, name: "How AI Writes" },
    title: "Predict!",
    file: "SectionPredict.jsx",
    slides: [
      { id: "pred.s0", title: "After 96 layers — pick one word", description: "Big question: all that work — but how does it actually pick the next word? This is the payoff.", element_group: "pred-frame", placement_group: "frame", interactive: "STATIC" },
      { id: "pred.s1", title: "Meaning flows in", description: "Each word sends meaning into the last position. Grammar, facts, context all accumulate. Define 'prediction'.", element_group: "pred-flow", placement_group: "flow-canvas", interactive: "AUTO-ANIM", simplification: "By final layer, info is mixed/transformed — not a simple sum of parts. Beam animation oversimplifies." },
      { id: "pred.s2", title: "Probability rankings", description: "Ranked list: mat 42%, floor 18%, etc. Top word wins — unless temperature adds randomness. Define 'probability'.", element_group: "pred-ranks", placement_group: "ranks-canvas", interactive: "STATIC", simplification: "Real distribution is over 50K+ tokens; most get near-zero probability. Numbers shown are illustrative." },
      { id: "pred.s3", title: "Temperature slider", description: "Generate sentence at temp 0.1 (frozen), then 1.5 (wild). Same prompt, different results. Define 'temperature'.", element_group: "pred-temp", placement_group: "temp-canvas", interactive: "SLIDER" },
      { id: "pred.s4", title: "Full pipeline recap", description: "Words → Numbers → Space → Attention → MLP → Predict. 'Now that you know how AI works — does it change how you'd use it?'", element_group: "pred-payoff", placement_group: "frame", interactive: "STATIC" },
    ],
  },
  {
    v2: 18,
    group: { id: 5, name: "Try It!" },
    title: "Try It Yourself!",
    file: "SectionTryIt.jsx",
    slides: [
      { id: "try.s0", title: "Hands-on intro", description: "Three tools: Predict, Word Space, Generate. Kids get to use real AI and see the concepts in action.", element_group: "try-frame", placement_group: "frame", interactive: "STATIC" },
      { id: "try.s1", title: "Live AI playground", description: "Tabbed playground: Predict (real probability rankings), Word Space (real embeddings plotted), Generate (streaming AI writing word by word). Take turns suggesting prompts.", element_group: "try-playground", placement_group: "playground-canvas", interactive: "LIVE-AI", notes: "Uses gpt-4o-mini + text-embedding-3-small. Embedding viz uses PCA to 2D — loses most information." },
    ],
  },
  {
    v2: 19,
    group: { id: 6, name: "Bonus" },
    title: "Beyond What AI Knows",
    file: "SectionBeyondKnowledge.jsx",
    slides: [
      { id: "beyond.s0", title: "Three things AI can't do", description: "Knowledge cutoff, no precise math, no file access. 'If AI is so smart, why can't it tell us today's date?' Define 'knowledge cutoff'.", element_group: "beyond-limits", placement_group: "limits-canvas", interactive: "STATIC" },
      { id: "beyond.s1", title: "Solution 1: Context stuffing", description: "Paste info into your message. AI reads it alongside your question. You do the work. Define 'context window'.", element_group: "beyond-solutions", placement_group: "solution-canvas", interactive: "STATIC" },
      { id: "beyond.s2", title: "Solution 2: RAG", description: "A regular program SEARCHES for relevant docs, hands them to AI. Search = deterministic, answer = AI. Define 'RAG'.", element_group: "beyond-solutions", placement_group: "solution-canvas", interactive: "STATIC" },
      { id: "beyond.s3", title: "Solution 3: Tool use", description: "Model LEARNED to write a special message asking for a tool. A program runs it and sends result back. Optional behind-the-scenes panel shows the actual tool_call format. Define 'tool use' / 'function calling'.", element_group: "beyond-solutions", placement_group: "solution-canvas", interactive: "STATIC", notes: "behindTheScenes panel can expand to show user / assistant / tool_result / final message exchange." },
      { id: "beyond.s4", title: "Agent loop", description: "Agent = Think → Act → Observe → repeat. Walk through pizza party example step by step. Define 'agent'.", element_group: "beyond-agents", placement_group: "agent-canvas", interactive: "AUTO-ANIM" },
      { id: "beyond.s5", title: "All three together", description: "Real apps (ChatGPT, Claude, Gemini) use ALL three: context stuffing + RAG + tools. Each solves a different problem.", element_group: "beyond-recap", placement_group: "frame", interactive: "STATIC" },
      { id: "beyond.s6", title: "Mission Control demo", description: "Tool toggles (calculator, today's date, doc search). Side-by-side: WITHOUT tools vs WITH. StepTrace shows tool_call → tool_result → response.", element_group: "beyond-demo", placement_group: "demo-canvas", interactive: "LIVE-AI", notes: "Hover over each tool for tooltip; sample questions pre-fill on click." },
    ],
  },
];
