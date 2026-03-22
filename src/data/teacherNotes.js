// Per-slide teacher notes for every section.
// Each entry maps to SECTIONS[i] and contains a slides[] array matching PRESENTATION_SLIDES[i].
// Fields: keyPoints (string[]), narrative (string), definitions ({term,def}[]), discussion (string[]),
//         simplification (string|null) — where we simplified for kids; what the real story is,
//         connections ({subject,note}[]) — ties to school subjects kids already know

const empty = { keyPoints: [], narrative: "", definitions: [], discussion: [] };

export const TEACHER_NOTES = [
  // ── 0: SectionWhoIsHere (3 slides) ──
  {
    title: "Who's Used AI?",
    connections: [
      { subject: "ELA", note: "Making predictions — when you read a story and guess what happens next, that's a skill AI uses too" },
      { subject: "Social Studies", note: "Technology in daily life — how tools change how people work, communicate, and learn" },
    ],
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

  // ── 1: SectionStoryMash (6 slides) ──
  {
    title: "Story Mash-Up!",
    connections: [
      { subject: "ELA", note: "Story elements — character, setting, event are the same building blocks kids learn in creative writing" },
      { subject: "ELA", note: "Sequencing and narrative structure — AI builds a story word by word, like writing a sentence from left to right" },
      { subject: "Art", note: "Creative collaboration — using tools to make something new, like using paint or instruments" },
    ],
    slides: [
      {
        keyPoints: ["Generative AI is AI that creates new things", "This is what changed recently — AI went from sorting and recommending to creating"],
        narrative: "Until recently, the AI we talked about — Siri, Netflix, YouTube — was good at recognizing and recommending things. But around 2017, researchers invented a new kind of AI architecture called the Transformer. By November 2022, ChatGPT brought this to the world — 100 million people used it in just 2 months. This new AI doesn't just sort or recommend — it creates. Stories, pictures, music, code. That's called Generative AI, or GenAI.",
        definitions: [{ term: "Generative AI (GenAI)", def: "AI that can create new content — text, images, music, code — rather than just recognizing or recommending existing things" }],
        discussion: ["What's the difference between AI that recommends a video and AI that writes a story?", "Can you think of anything you've seen that was created by AI?"],
        simplification: "We're saying 'AI learned to create' which is a simplification. GenAI models don't truly understand or create with intent — they generate outputs based on patterns learned from massive datasets. The Transformer architecture (2017) and scale of training data are the real breakthroughs.",
      },
      {
        keyPoints: ["Pure engagement hook — no teaching yet", "Let kids experience AI magic before explaining it"],
        narrative: "This is a 'wow' moment. Pick 3 volunteers and have each secretly enter a character, a place, or an event. The class watches as the AI weaves the random ingredients into a real story. After the reveal, just ask: 'How did it know how to do that?' Let the question hang.",
        definitions: [],
        discussion: ["How did the computer know how to make a story from those random things?", "Could you have written a story from those three ingredients? How would yours be different?"],
      },
      {
        keyPoints: ["AI can create coherent text from random inputs", "This is the same technology behind ChatGPT, Claude, etc."],
        narrative: "You can run this 2-3 times if the class is loving it. Each round takes about 90 seconds. The sillier the inputs, the more fun the story. If kids are shy, offer suggestions: 'a dancing taco', 'on the surface of the sun', 'gravity reverses'.",
        definitions: [],
        discussion: ["What would happen if we gave the AI the same three things again — would we get the same story?", "What makes a good story? Did the AI include those things?"],
      },
      {
        keyPoints: ["A prompt is instructions for the AI", "AI predicts one word at a time — it doesn't plan the whole story first", "Each word is chosen based on all the words before it"],
        narrative: "NOW you connect the dots. 'Remember those 3 things you typed in? We combined them into a message called a PROMPT. The AI read that prompt and then started guessing what word should come next — one word at a time. It didn't plan the whole story first!'",
        definitions: [{ term: "Prompt", def: "The instructions or question you give to AI — what starts the whole process" }],
        discussion: ["When you write a story, do you plan it all out first or figure it out as you go?", "How is that similar to or different from what AI does?"],
      },
      {
        keyPoints: ["Word-by-word prediction is how ALL text AI works", "The visual shows it's not magic — it's a process"],
        narrative: "Walk through the animation slowly. Point out how each new word only makes sense because of the words before it. 'The AI doesn't know the ending when it starts. It picks ONE word, then uses that to pick the next one, and the next one...'",
        definitions: [],
        discussion: ["Can you finish this sentence: 'The dog chased the ___'? How did you know what word comes next?", "You just did what AI does! You predicted the next word based on what came before."],
      },
      {
        keyPoints: ["Set up curiosity for the rest of the lesson", "Don't answer yet — let the question motivate the next sections"],
        narrative: "This is the hook for everything that follows. 'So the AI predicts the next word. But HOW does it know which word to pick? That's what we're going to figure out today.' Pause here. Let the question hang.",
        definitions: [],
        discussion: ["How do YOU decide what word comes next when you're talking?", "Do you think the AI understands the story, or is it just really good at guessing?"],
      },
    ],
  },

  // ── 2: SectionWhatIsAI (2 slides) ──
  {
    title: "What IS AI?",
    connections: [
      { subject: "Science", note: "Observation and patterns — scientists look for patterns in data to understand the world, just like AI does" },
      { subject: "Math", note: "Sorting and classifying — grouping objects by shared properties is something kids do in math and AI does with data" },
    ],
    slides: [
      {
        keyPoints: ["Get the class guessing before revealing", "All three answers are partly right"],
        narrative: "Ask the class to vote by raising hands for each option. Robot, smart program, digital brain — they're all a little right. The key question: what makes AI SPECIAL compared to all of these?",
        definitions: [{ term: "AI", def: "Artificial Intelligence — software that learns from examples instead of following fixed rules" }],
        discussion: ["What do you think AI actually is?", "What do all three answers have in common?"],
      },
      {
        keyPoints: ["AI learns patterns from data", "Regular programs follow rules; AI learns rules itself"],
        narrative: "The real answer: regular programs follow rules someone wrote. AI learns the rules itself — from millions of examples. Just like you learned to talk by hearing people talk.",
        definitions: [],
        discussion: ["What do you think ALL three answers are missing?"],
      },
    ],
  },

  // ── 3: SectionProgramsVsAI (6 slides) ──
  {
    title: "Rules vs Learning",
    connections: [
      { subject: "Math", note: "Algorithms — step-by-step instructions for solving a problem, like long division. Traditional programs are algorithms; AI learns its own" },
      { subject: "Science", note: "Hypothesis testing — scientists guess, test, and revise. AI does the same: guess, check, adjust weights" },
      { subject: "ELA", note: "Context clues — figuring out what a word means from the words around it, just like AI uses context" },
    ],
    slides: [
      {
        keyPoints: ["Traditional programming = explicit rules", "AI = learns patterns from data"],
        narrative: "The key concept: traditional programming is explicit — every rule must be written out. AI is implicit — the rules emerge from patterns in data.",
        definitions: [{ term: "Program", def: "A set of instructions a computer follows step by step" }],
        discussion: [],
      },
      empty, // pair 1 question
      {
        keyPoints: ["Rules are rigid — they break on edge cases"],
        narrative: "Use the bike analogy: you can't learn to ride a bike by reading instructions. You learn by doing. That's closer to how AI learns.",
        definitions: [],
        discussion: [],
      },
      empty, // pair 2 question
      empty, // pair 2 reveal
      {
        keyPoints: ["AI learns from examples — bad examples = bad learning"],
        narrative: "Watch for the misconception that 'AI = smart = always right.' AI learns from examples, so if the examples are bad, the AI learns bad patterns.",
        definitions: [{ term: "Bias", def: "When AI learns unfair patterns from unbalanced training data" }],
        discussion: ["If the AI only saw pictures of golden retrievers, would it recognize a poodle as a dog?"],
      },
    ],
  },

  // ── 4: SectionBrainVsAI (8 slides) ──
  {
    title: "Brain vs AI",
    connections: [
      { subject: "Science", note: "The brain and nervous system — neurons send electrical signals, and AI 'neurons' are math operations inspired by real ones" },
      { subject: "Health", note: "Emotions and empathy — understanding that AI can mimic emotions in text but doesn't feel them connects to social-emotional learning" },
      { subject: "ELA", note: "Author's voice and creativity — is AI remixing patterns 'creative' the same way an author is?" },
    ],
    slides: [
      {
        keyPoints: ["Brains and AI are different, not better/worse", "AI processes differently from humans"],
        narrative: "Kids often ask 'does AI think like us?' — be honest: we don't fully know. What we do know is that it processes very differently. We'll look at 3 key areas.",
        definitions: [],
        discussion: ["Does AI think like us?"],
      },
      empty, // How it learns — question
      {
        keyPoints: ["Both learn from experience, but differently"],
        narrative: "Both brains and AI learn — but brains learn from living in the world, while AI learns from millions of text examples.",
        definitions: [],
        discussion: [],
      },
      empty, // Has emotions — question
      {
        keyPoints: ["AI can sound emotional but doesn't feel anything"],
        narrative: "AI can say 'I'm excited!' but it's predicting words, not feeling things. Like an actor who can cry on cue without being sad.",
        definitions: [],
        discussion: ["If AI can write a sad poem, does that mean it's sad?"],
      },
      empty, // Can be creative — question
      {
        keyPoints: ["AI remixes patterns — is that creativity?"],
        narrative: "AI combines and remixes patterns from training data. Is that 'real' creativity? Great open question for the class.",
        definitions: [],
        discussion: ["What would AI need before you'd say it was truly like a brain?"],
      },
      {
        keyPoints: ["AI is a giant math function", "Inspired by brains but not the same"],
        narrative: "Key point: AI was inspired by neurons, but an AI model is ultimately a giant math function — billions of multiplication operations in sequence.",
        definitions: [{ term: "Neuron", def: "A cell in the brain that sends electrical signals — AI 'neurons' are math operations inspired by real ones" }],
        discussion: ["What would AI need before you'd say it was truly like a brain?"],
      },
    ],
  },

  // ── 5: SectionWhatIsLLM (5 slides) ──
  {
    title: "What's an LLM?",
    connections: [
      { subject: "Math", note: "Large numbers and scale — trillions of words connects to place value and understanding big numbers" },
      { subject: "ELA", note: "Vocabulary and word meaning — 'model' is a multiple-meaning word (fashion model, model airplane, mathematical model)" },
      { subject: "Science", note: "Models in science — scientists build models of weather, volcanoes, the solar system. An LLM is a model of language" },
    ],
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
        simplification: "We say 'words' throughout this lesson, but LLMs actually process 'tokens' — pieces of words. For example, 'unhelpful' might be split into 'un', 'help', 'ful'. We use 'words' because it's more intuitive for kids, but tokens are the real unit.",
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

  // ── 6: SectionMeetModels (4 slides) ──
  {
    title: "Meet the Models",
    connections: [
      { subject: "Social Studies", note: "Competition and innovation — companies competing to build the best AI is like the space race or car manufacturers" },
      { subject: "ELA", note: "Compare and contrast — comparing ChatGPT, Claude, Llama, and Gemini uses the same skill as comparing characters in a book" },
    ],
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

  // ── 7: SectionTheBridge (3 slides) ──
  {
    title: "The Big Question",
    connections: [
      { subject: "Science", note: "Systems and processes — a pipeline with steps is like the water cycle or food chain, where each stage feeds the next" },
      { subject: "Math", note: "Input → process → output — the same function machine concept from math class" },
    ],
    slides: [
      {
        keyPoints: ["Training = reading the entire internet", "Took months and thousands of computers"],
        narrative: "This is the transition beat — use it as a dramatic pause. 'We know what LLMs are. Now we're going to open the hood and look at the engine.'",
        definitions: [{ term: "Training", def: "The process of feeding an AI massive amounts of data so it can learn patterns" }],
        discussion: ["How do YOU think reading millions of books could teach a computer to write?"],
        simplification: "The training steps shown here (vectorize → read → grammar → facts → reasoning) are presented as sequential stages for clarity, but in reality training happens all at once — the model learns all of these capabilities simultaneously through exposure to data. The neat progression is a teaching tool, not a literal description of training phases.",
      },
      {
        keyPoints: ["The 3-step pipeline: numbers → 96 layers → predict", "Watch the animation play through"],
        narrative: "Let the animation run. The robot with the crank is processing 'The cat sat on the ___' through 96 layers. Don't talk over it — let kids watch.",
        definitions: [],
        discussion: [],
        simplification: "We show 96 layers because that's what some well-known models like GPT-3 use. But different models have different numbers — GPT-2 has 48, some small models have 12, and newer models may have 128+. The number 96 is an example, not a universal constant. Similarly, the model processes tokens (word pieces), not whole words.",
      },
      {
        keyPoints: ["96 layers for just ONE word", "Then repeat for every word"],
        narrative: "The punchline: all of that work — just for one word. Then it does it again. And again. Word by word. That's how AI writes.",
        definitions: [],
        discussion: ["Does that seem like a lot of work for one word?"],
      },
    ],
  },

  // ── 8: SectionHowItLearns (11 slides) ──
  {
    title: "How AI Learns",
    connections: [
      { subject: "Science", note: "Trial and error — the scientific method uses guess → test → revise, just like AI training uses guess → check → adjust" },
      { subject: "Math", note: "Getting closer to the right answer — like estimation in math, each round the AI's guess gets more accurate" },
      { subject: "PE/Music", note: "Practice makes progress — learning to shoot a basketball or play piano means adjusting based on feedback, just like AI adjusts its weights" },
    ],
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

  // ── 9: SectionThreeSteps (9 slides) — 7-8 only ──
  {
    title: "Three Steps to Helpful AI",
    connections: [
      { subject: "ELA", note: "Drafting and revision — writers do rough draft → edit → polish, just like AI does pre-training → tuning → RLHF" },
      { subject: "Social Studies", note: "Ethics and fairness — who gets to decide what 'good' means for AI? Connects to discussions about rules, laws, and values" },
      { subject: "Math", note: "Ranking and ordering — rating which response is better uses comparison and ordering skills" },
    ],
    slides: [
      {
        keyPoints: ["Pre-training alone isn't enough", "AI reads the internet but doesn't know how to be helpful"],
        narrative: "Connect back to the knock-knock joke section. 'Remember how the robots learned by guessing? Real AI does something similar — but on a much bigger scale, and in three stages.'",
        definitions: [],
        discussion: ["If you read every book in the library, would you automatically be helpful?"],
      },
      {
        keyPoints: ["Pre-training = reading trillions of words", "Learns patterns, grammar, facts — everything at once"],
        narrative: "The spinning dials represent the billions of weights being adjusted. The AI is speed-reading the entire internet.",
        definitions: [{ term: "Pre-training", def: "The first stage where AI reads massive amounts of text to learn patterns" }],
        discussion: [],
      },
      {
        keyPoints: ["Raw model just continues patterns", "It doesn't know it should answer questions"],
        narrative: "This is a genuinely surprising moment for kids. The AI that read trillions of words... just keeps going. It doesn't know what a 'question' is yet.",
        definitions: [],
        discussion: ["Why would reading lots of text not teach you how to have a conversation?"],
      },
      {
        keyPoints: ["Instruction tuning teaches question-answer format", "Humans write thousands of example conversations"],
        narrative: "The before/after contrast is powerful. Same AI, completely different behavior — just from seeing examples of good conversations.",
        definitions: [{ term: "Instruction Tuning", def: "Training the AI on example conversations so it learns to follow instructions and answer questions" }],
        discussion: [],
      },
      {
        keyPoints: ["RLHF = Reinforcement Learning from Human Feedback", "Humans rate which responses are better"],
        narrative: "The 'GOOD' reveal is the key moment. Being able to answer isn't enough — the AI needs to learn what a GOOD answer looks like.",
        definitions: [{ term: "RLHF", def: "Reinforcement Learning from Human Feedback — humans rate AI responses to teach it what 'good' means" }],
        discussion: ["What makes an answer 'good' vs just 'correct'?"],
      },
      empty, // RLHF round 1
      empty, // RLHF round 2
      empty, // RLHF round 3
      {
        keyPoints: ["Human feedback shapes AI personality", "Different raters = different AI behavior"],
        narrative: "The personality bars respond to the class's choices. Great moment to discuss: 'Who decides what GOOD means? Is there only one right answer?'",
        definitions: [],
        discussion: ["Who should get to decide what 'good' means for AI?", "Would AI from different countries behave differently?"],
      },
    ],
  },

  // ── 10: SectionHook (5 slides) ──
  {
    title: "The Secret: Numbers",
    connections: [
      { subject: "Math", note: "Number lines and coordinates — words becoming numbers is like plotting points on a number line or coordinate grid" },
      { subject: "Science", note: "Measurement — scientists turn observations into numbers (temperature, weight, speed). AI turns words into numbers the same way" },
      { subject: "ELA", note: "Describing with adjectives — when kids describe 'cat' with fur, whiskers, purring, they're identifying features. AI does the same thing with numbers" },
    ],
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
        simplification: "We say AI turns 'words' into numbers, but technically it processes 'tokens' — subword pieces. The word 'unhelpful' might become three tokens: 'un', 'help', 'ful'. Each token gets its own embedding. We simplify to 'words' because it's more intuitive for this age group.",
      },
      {
        keyPoints: ["12,288 numbers per word", "Let the visual do the work"],
        narrative: "When the numbers start streaming, stay quiet. Let the visual do the work. The scrolling counter drives it home.",
        definitions: [],
        discussion: ["How many numbers do you think represent one word?"],
        simplification: "12,288 is the embedding dimension for GPT-3 (175B). Other models use different sizes: GPT-2 uses 768 or 1,600, Claude and GPT-4's sizes aren't public, and smaller models might use 256 or 512. We use 12,288 because it's impressively large and comes from a well-known model, but it's not universal.",
      },
      {
        keyPoints: ["Each word becomes a point in 'meaning space'"],
        narrative: "Follow-up: 'How many numbers do you think represent one word?' Let them guess before revealing 12,288.",
        definitions: [{ term: "Vector", def: "A list of numbers that describes something — like coordinates, but with thousands of dimensions" }],
        discussion: [],
      },
    ],
  },

  // ── 11: SectionTokens (7 slides) — 7-8 only ──
  {
    title: "Tokens — Not Quite Words",
    connections: [
      { subject: "ELA", note: "Prefixes, suffixes, and root words — 'un-believe-able' splits the same way in English class and in AI tokenization" },
      { subject: "Math", note: "Efficiency and trade-offs — the vocab size spectrum is an optimization problem, just like choosing the right unit of measurement" },
      { subject: "ELA", note: "Syllables — breaking words into syllables is similar to how tokenizers break words into subword pieces" },
    ],
    slides: [
      {
        keyPoints: ["Tokens are the actual units AI processes", "Not words, not letters — something in between"],
        narrative: "Kids assumed AI thinks in words. This section reveals the truth: AI thinks in tokens — subword pieces.",
        definitions: [{ term: "Token", def: "A piece of a word that AI actually processes — shorter words are one token, longer words get split into pieces" }],
        discussion: ["Why wouldn't AI just use whole words?"],
      },
      {
        keyPoints: ["Vocab size is a design choice", "Too small = too many pieces, too big = too much to learn"],
        narrative: "The spectrum helps kids understand this is a design tradeoff, not a fixed rule.",
        definitions: [],
        discussion: [],
      },
      {
        keyPoints: ["At 95 tokens, every character is separate", "Way too many pieces for just three words"],
        narrative: "Watch the characters explode apart. 11 tokens for 'The cat sat' — that's wildly inefficient.",
        definitions: [],
        discussion: [],
      },
      {
        keyPoints: ["At 1M+ tokens, every word is unique", "Too many entries to learn well"],
        narrative: "The overwhelming grid drives home: you'd need a million unique entries. That's impractical.",
        definitions: [],
        discussion: [],
      },
      {
        keyPoints: ["50K is the sweet spot", "Reusable pieces like 'un-', '-able', '-ing'"],
        narrative: "The snap-split of 'Unbelievable' into 'Un' + 'believ' + 'able' is the key insight. These pieces show up in other words too!",
        definitions: [{ term: "Subword Tokenization", def: "Splitting words into reusable pieces — 'unbelievable' becomes 'Un' + 'believ' + 'able'" }],
        discussion: ["What other words use the piece 'un-'?"],
      },
      {
        keyPoints: ["Interactive tokenization demo", "Kids type words and see them split"],
        narrative: "Let kids experiment freely. Try long words, compound words, and made-up words. The fallback splits unknown words into 3-char chunks.",
        definitions: [],
        discussion: ["Can you find a word that's just one token?"],
      },
      {
        keyPoints: ["50,000 choices for every position", "Like picking one person from a stadium"],
        narrative: "The stadium visual makes the scale tangible. For every single position in a sentence, AI considers 50,000 options.",
        definitions: [],
        discussion: ["How does the AI narrow down from 50,000 to just one?"],
      },
    ],
  },

  // ── 12: SectionEmbeddings (8 slides) ──
  {
    title: "Words in Space",
    connections: [
      { subject: "Math", note: "Coordinate grids and graphing — the scatter plot is an X-Y coordinate grid, just like in math class. Each word has an (x, y) position" },
      { subject: "Math", note: "Horizontal and vertical axes — the X axis goes left-right, Y axis goes up-down. Each axis measures a different quality of the word" },
      { subject: "Science", note: "Classification and grouping — animals, vehicles, and royalty cluster together, just like classifying organisms in science" },
      { subject: "ELA", note: "Synonyms and antonyms — words that are close in meaning are close on the graph. Words with opposite meanings are far apart" },
    ],
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
        keyPoints: ["Real AI uses thousands of dimensions", "Captures everything about a word's meaning"],
        narrative: "'If you could measure a word along thousands of different axes, do you think you could capture everything about what it means?'",
        definitions: [],
        discussion: ["Could thousands of dimensions capture everything about a word?"],
        simplification: "The named dimensions like 'Is Animal?', 'Has Wings?', and 'You Can Ride It?' are illustrative — they help kids grasp the concept. In reality, embedding dimensions aren't human-readable categories. They're abstract mathematical directions discovered during training. No one can look at dimension #7,431 and say 'this one means animals.' The meaning is distributed across many dimensions in ways that aren't easily interpretable.",
      },
    ],
  },

  // ── 13: SectionBeyond2D (6 slides) — 7-8 only ──
  {
    title: "Beyond 2D",
    connections: [
      { subject: "Math", note: "1D, 2D, 3D geometry — number lines (1D), flat graphs (2D), and 3D shapes directly map to the dimension progression here" },
      { subject: "Math", note: "Measurement with multiple units — describing something with height AND weight AND speed is like using multiple dimensions" },
      { subject: "Science", note: "Describing objects with multiple properties — color, size, texture, hardness. More properties = more complete description, like more dimensions" },
      { subject: "Math (7-8)", note: "Cosine similarity connects to angles and trigonometry — the angle between two arrows tells you how similar they are" },
    ],
    slides: [
      {
        keyPoints: ["Connect back to the 2D scatter plot", "Words as dots was just the beginning"],
        narrative: "Reference the scatter plot they saw earlier. 'That was cool, but it was only 2 dimensions. What if we could add more?'",
        definitions: [],
        discussion: [],
      },
      {
        keyPoints: ["1D = just a number line", "Very limited — can only show close vs far"],
        narrative: "Start simple. Cat and Dog are close, Pizza is far. But there's no room for nuance.",
        definitions: [],
        discussion: [],
      },
      {
        keyPoints: ["2D = two axes", "Words can spread out more — clusters emerge"],
        narrative: "Now words can cluster by type. King/Queen group, animals group. Better, but still limited.",
        definitions: [],
        discussion: [],
      },
      {
        keyPoints: ["3D = a cube of meaning", "Drag to explore — words float in 3D space"],
        narrative: "Let kids drag the cube around. The physicality of rotating it makes the concept tangible. 'Three dimensions are what we live in — but AI goes way beyond.'",
        definitions: [],
        discussion: ["What would a 4th dimension even look like?"],
      },
      {
        keyPoints: ["The counter accelerates from 4 to 12,288", "You can't visualize this — but the math works"],
        narrative: "The accelerating counter is the wow moment. Let it run. When it hits 12,288, let it sink in. We can't picture it, but the math handles it perfectly.",
        definitions: [{ term: "High-Dimensional Space", def: "A space with thousands of axes — humans can't visualize it, but math can work in it perfectly" }],
        discussion: ["Why would more dimensions be better?"],
      },
      {
        keyPoints: ["Cosine similarity measures how similar two words are", "1.0 = same meaning, 0.0 = unrelated"],
        narrative: "The arrow pairs make cosine similarity visual. Similar words point the same direction. Different words point apart.",
        definitions: [{ term: "Cosine Similarity", def: "A number from 0 to 1 that measures how similar two word vectors are — by comparing the angle between their arrows" }],
        discussion: ["What word pairs would have the highest similarity?"],
      },
    ],
  },

  // ── 14: SectionAttention (7 slides) ──
  {
    title: "Attention!",
    connections: [
      { subject: "ELA", note: "Multiple-meaning words (homonyms) — 'bat', 'bank', 'bark', 'ring' all have different meanings depending on context, just like in vocabulary lessons" },
      { subject: "ELA", note: "Context clues — figuring out an unknown word's meaning from surrounding words is exactly what attention does" },
      { subject: "Reading", note: "Reading comprehension — understanding what a sentence means requires paying attention to how all the words relate, not just reading one word at a time" },
    ],
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
        keyPoints: ["Attention = words looking at each other for clues", "Multiple attention heads work in parallel"],
        narrative: "That's attention! Same word, completely different meaning — depending on which other words shine their spotlight on it.",
        definitions: [{ term: "Attention Head", def: "One spotlight that focuses on different relationships — real models have many working in parallel" }],
        discussion: ["Can you think of other words that have two completely different meanings?"],
        simplification: "We show attention as simple curved beams between word pairs. Real attention is more nuanced: each 'head' computes a weighted score for every word pair simultaneously, and there are many heads per layer (32, 64, 96, or more depending on the model). The beam animation captures the essence — words influencing each other — but the actual math is far more parallel and subtle.",
      },
    ],
  },

  // ── 15: SectionMLP (4 slides) ──
  {
    title: "The Thinking Layer",
    connections: [
      { subject: "ELA", note: "21 Questions game — narrowing down by asking yes/no questions is how the MLP checks what it knows about each word" },
      { subject: "Math", note: "Expanding and compressing — the 12,288 → 49,152 → 12,288 pattern is like multiplying then dividing. Brainstorm big, then narrow down" },
      { subject: "Science", note: "Memory recall — when you see a test question, your brain searches everything you've learned. MLP does the same with its weights" },
    ],
    slides: [
      {
        keyPoints: ["MLP connects what it's reading to everything it ever learned", "Attention finds relationships, MLP thinks about them"],
        narrative: "Attention is reading the room and figuring out who's related to whom. MLP is flipping through your entire memory to decide what it all means.",
        definitions: [{ term: "MLP", def: "Multi-Layer Perceptron — the 'thinking layer' that asks questions about each word using everything it learned in training" }],
        discussion: [],
        simplification: "The '21 Questions' analogy and the flashing questions ('Does it have fur?', 'Is this spelled right?') are illustrative. The MLP doesn't literally ask yes/no questions. It performs matrix multiplications that activate different patterns in its weights. Researchers have found that certain neurons do seem to respond to specific concepts (like a 'cat neuron'), but knowledge isn't stored as discrete facts — it's distributed across millions of weights in ways we still don't fully understand. The question framing helps kids grasp the idea that the MLP is checking what it knows, even though the mechanism is mathematical rather than linguistic.",
      },
      {
        keyPoints: ["21 Questions → 49,152 questions", "4× expansion = room to brainstorm"],
        narrative: "The 4× expansion is worth pausing on. Ask: 'Why would you make it bigger in the middle?' Answer: more room to consider possibilities.",
        definitions: [],
        discussion: ["Why would you want MORE room to think before narrowing down?"],
        simplification: "49,152 is the MLP hidden dimension for models with 12,288 embedding dimensions (4× expansion). Different models use different expansion ratios — some use 4×, others use 8/3× (like Llama). The exact number varies, but the expand-then-compress pattern is consistent across most transformer architectures.",
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

  // ── 16: SectionLayers (2 slides) ──
  {
    title: "Rinse & Repeat",
    connections: [
      { subject: "ELA", note: "Levels of understanding — letters → words → sentences → paragraphs → themes mirrors the layer progression from spelling to reasoning" },
      { subject: "Science", note: "Building complexity from simple parts — atoms → molecules → cells → organisms. Each layer adds a level of organization" },
      { subject: "Math", note: "Repeated operations — doing the same two steps (attention + MLP) 96 times is like iteration or loops in math" },
    ],
    slides: [
      {
        keyPoints: ["Many layers — each pass makes understanding richer", "Early layers = spelling, late layers = reasoning"],
        narrative: "Ask the class to guess what early vs late layers might do BEFORE revealing. 'What would you learn first if you were trying to understand language from scratch?'",
        definitions: [{ term: "Layer", def: "One complete round of Attention + MLP — models stack many of these in sequence" }],
        discussion: ["If you cut the model off at layer 32, what could it do? What couldn't it do?"],
        simplification: "We use 96 layers throughout this lesson, but that's specific to certain models like GPT-3. GPT-2 has 48 layers, smaller models may have 12-24, and newer models can exceed 100. The progression from 'letters & spelling' (early) to 'deep understanding' (late) is supported by research, but the boundaries aren't as clean as our 6 labeled ranges suggest. In reality, layers specialize gradually and capabilities overlap across many layers. The neat categories help kids build intuition for the general principle: simple features first, complex reasoning later.",
      },
      {
        keyPoints: ["Watch the full layer animation", "Notice the questions changing as layers get deeper"],
        narrative: "The layer count is the wow moment. The animation shows questions evolving from 'Is this spelled right?' (early) to 'Which word fits best?' (late). Let it play.",
        definitions: [],
        discussion: ["What do you think happens between layer 1 and the last layer that makes the answer so much better?"],
        simplification: "The flashing questions during the animation ('Does a cat have fur?', 'What rhymes with cat?') are an analogy. Each layer doesn't literally ask a question — it performs mathematical transformations. But research (particularly 'probing' studies) has shown that different types of information do emerge at different depths. The questions we show are inspired by what researchers have found at each layer range, presented in kid-friendly language.",
      },
    ],
  },

  // ── 17: SectionPredict (5 slides) ──
  {
    title: "Predict!",
    connections: [
      { subject: "Math", note: "Probability and percentages — the ranked word list shows percentages, just like probability in math (42% chance = 42 out of 100)" },
      { subject: "ELA", note: "Word choice — writers pick the best word from many options. AI does the same thing, but with math instead of feeling" },
      { subject: "Science", note: "Variables and controls — temperature is a variable that changes the outcome, just like in a science experiment" },
      { subject: "Math", note: "Bar graphs — the probability bars are a horizontal bar graph, a data representation skill from math class" },
    ],
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
        definitions: [{ term: "Prediction", def: "The model's best guess for the next word, based on everything it processed" }],
        discussion: [],
        simplification: "The animation shows meaning 'flowing' from individual words into the last position, as though each word contributes a discrete piece. In reality, by the time the model reaches the final layer, information has been mixed and transformed so many times through attention and MLP operations that the last position's representation is a complex blend of the entire context — not a simple sum of parts. The beam animation is a useful metaphor but oversimplifies how information aggregates through dozens of layers.",
      },
      {
        keyPoints: ["Ranked probability list shows most likely next words", "The top word wins — unless temperature adds randomness"],
        narrative: "The probability list shows how the model ranks candidates. 'mat' wins at 42%, but 'floor', 'rug', and others are possibilities too.",
        definitions: [{ term: "Probability", def: "How likely the model thinks each word is — shown as a percentage" }],
        discussion: ["Why might there be multiple good answers instead of just one?"],
        simplification: "The percentages shown (mat 42%, floor 18%, etc.) are illustrative, not from a real model. In practice, the model produces a probability distribution over its entire vocabulary (50,000+ tokens), not just 5-8 words. Most tokens get near-zero probability. Also, the model predicts the next token, not necessarily a complete word — 'mat' might be one token, but longer words get split into multiple tokens that are predicted one at a time.",
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

  // ── 18: SectionTryIt (2 slides) ──
  {
    title: "Try It Yourself!",
    connections: [
      { subject: "Science", note: "Hands-on experimentation — testing hypotheses by trying different inputs and observing results is the scientific method in action" },
      { subject: "ELA", note: "Word relationships — the embedding explorer lets kids test synonyms, antonyms, and word categories they've learned" },
      { subject: "Math", note: "Data visualization — the scatter plots and probability bars are real-time data representations" },
    ],
    slides: [
      {
        keyPoints: ["Hands-on demo with real AI", "Three tools: Predict, Word Space, Generate"],
        narrative: "This is the hands-on payoff. Kids get to use real AI and see the concepts they just learned in action. Let them experiment freely.",
        definitions: [],
        discussion: ["What sentence do you want to try?", "Which words do you think will cluster together?"],
      },
      {
        keyPoints: ["Predict: see real probability rankings", "Word Space: see real embeddings plotted", "Generate: watch AI write word by word"],
        narrative: "Let kids take turns suggesting prompts. Try the prediction with different sentences to see how context changes the top word. Try embedding surprising word combinations. The generate tab shows the streaming effect — AI writes one token at a time, just like we learned.",
        definitions: [],
        discussion: ["Did the AI's top prediction surprise you?", "Why do you think those words clustered together?", "Does knowing how it works change what you think about AI's writing?"],
        simplification: "These demos use OpenAI's gpt-4o-mini model and text-embedding-3-small. Different models would give different results. The embedding visualization reduces 1,536 dimensions down to 2D using PCA, which loses most of the information — the real embedding space is much richer than what the 2D plot shows.",
      },
    ],
  },
];
