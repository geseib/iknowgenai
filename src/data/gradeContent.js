// Grade-differentiated example content
// K-2:  Simple, familiar, silly — dogs and cookies
// 3-5:  Standard — sleepy cats and warm mats
// 7-8:  Goofy, internet-age — viral videos and broken algorithms

export const GRADE_EXAMPLES = {
  "K-2": {
    predict: {
      // Interactive word-by-word generator
      positions: [
        { candidates: [["The", -0.12], ["A", -2.53], ["One", -3.51]] },
        { candidates: [["happy", -0.89], ["big", -1.20], ["little", -1.24]] },
        { candidates: [["dog", -0.33], ["cat", -1.66], ["bunny", -2.41]] },
        { candidates: [["ate", -0.46], ["found", -1.42], ["liked", -2.04]] },
        { candidates: [["a", -0.09], ["the", -2.81], ["my", -3.51]] },
        { candidates: [["yummy", -0.94], ["big", -1.08], ["red", -1.32]] },
        { candidates: [["cookie", -0.40], ["treat", -1.56], ["cake", -2.04]] },
        { candidates: [["!", -0.15], [".", -2.21], ["?", -2.81]] },
      ],
      // Slide 0: display sentence
      sentenceStart: "The happy dog ate a yummy",
      highlightWord: "cookie",
      // Slide 1: MeaningLoadSlide
      meaningWords: ["The", "dog", "ate", "a", "cookie"],
      meaningLabels: [
        { word: "The", meaning: "grammar" },
        { word: "dog", meaning: "an animal!" },
        { word: "ate", meaning: "eating something" },
        { word: "a", meaning: "which one?" },
      ],
      meaningCandidates: [
        { word: "cookie", pct: 45 },
        { word: "bone", pct: 20 },
        { word: "treat", pct: 12 },
        { word: "toy", pct: 8 },
        { word: "ball", pct: 5 },
      ],
      // Slide 2: full ranked list
      rankedCandidates: [
        { word: "cookie", pct: 45 },
        { word: "bone", pct: 20 },
        { word: "treat", pct: 12 },
        { word: "toy", pct: 8 },
        { word: "ball", pct: 5 },
        { word: "stick", pct: 4 },
        { word: "snack", pct: 3 },
        { word: "rock", pct: 2 },
      ],
    },
    // Embeddings dimension examples (slide 0)
    dimensions: [
      { dim: "Can it fly?", yes: "bird, butterfly, bee", no: "dog, pizza" },
      { dim: "Can you eat it?", yes: "pizza, cake, apple", no: "cat, car" },
      { dim: "Is it an animal?", yes: "cat, dog, bird", no: "pizza, car" },
      { dim: "Does it have legs?", yes: "dog, cat, frog", no: "fish, snake" },
    ],
    // Try It section
    tryIt: {
      defaultPrompt: "The puppy ran to the",
      embedPresets: [
        { label: "Animals", words: ["cat", "dog", "bunny", "fish", "bird", "frog", "horse", "turtle", "duck", "hamster"] },
        { label: "Yummy Food", words: ["pizza", "cookie", "cake", "apple", "banana", "ice cream", "sandwich", "juice", "candy", "milk"] },
        { label: "Fun Stuff", words: ["play", "sing", "dance", "laugh", "jump", "run", "swim", "draw", "read", "nap"] },
      ],
    },
  },

  "3-5": {
    predict: {
      positions: [
        { candidates: [["The", -0.12], ["A", -2.53], ["One", -3.51]] },
        { candidates: [["sleepy", -0.89], ["big", -1.20], ["tiny", -1.24]] },
        { candidates: [["cat", -0.33], ["dog", -1.66], ["bird", -2.41]] },
        { candidates: [["sat", -0.46], ["slept", -1.42], ["napped", -2.04]] },
        { candidates: [["on", -0.09], ["near", -2.81], ["beside", -3.51]] },
        { candidates: [["a", -0.19], ["the", -1.97], ["my", -3.51]] },
        { candidates: [["warm", -0.94], ["soft", -1.08], ["cozy", -1.32]] },
        { candidates: [["mat", -0.40], ["cushion", -1.56], ["rug", -2.04]] },
        { candidates: [[".", -0.15], ["!", -2.21], ["?", -2.81]] },
      ],
      sentenceStart: "The sleepy cat sat on a warm",
      highlightWord: "mat",
      meaningWords: ["The", "cat", "sat", "on", "the"],
      meaningLabels: [
        { word: "The", meaning: "grammar & structure" },
        { word: "cat", meaning: "it's about an animal" },
        { word: "sat", meaning: "a physical action" },
        { word: "on", meaning: "location / position" },
      ],
      meaningCandidates: [
        { word: "mat", pct: 42 },
        { word: "floor", pct: 18 },
        { word: "rug", pct: 12 },
        { word: "ground", pct: 9 },
        { word: "couch", pct: 6 },
      ],
      rankedCandidates: [
        { word: "mat", pct: 42 },
        { word: "floor", pct: 18 },
        { word: "rug", pct: 12 },
        { word: "ground", pct: 9 },
        { word: "couch", pct: 6 },
        { word: "table", pct: 4 },
        { word: "bed", pct: 3 },
        { word: "roof", pct: 2 },
      ],
    },
    dimensions: [
      { dim: "Has wings?", yes: "bat, bird, butterfly", no: "pizza, car" },
      { dim: "Can you eat it?", yes: "pizza, burger, cake", no: "bat, car" },
      { dim: "Is it alive?", yes: "bat, bird, dog", no: "pizza, car" },
      { dim: "Is it furry?", yes: "dog, cat, bat", no: "pizza, bird" },
    ],
    tryIt: {
      defaultPrompt: "The dog ran to the",
      embedPresets: [
        { label: "Family", words: ["mom", "dad", "brother", "sister", "aunt", "uncle", "grandma", "grandpa", "cousin", "baby"] },
        { label: "Animals", words: ["cat", "dog", "fish", "bird", "snake", "horse", "dolphin", "eagle", "spider", "whale"] },
        { label: "Food & Sports", words: ["pizza", "hamburger", "sushi", "ice cream", "soccer", "basketball", "swimming", "tennis", "baseball", "football"] },
      ],
    },
  },

  "7-8": {
    predict: {
      positions: [
        { candidates: [["The", -0.12], ["A", -2.53], ["One", -3.51]] },
        { candidates: [["viral", -0.89], ["chaotic", -1.20], ["legendary", -1.24]] },
        { candidates: [["video", -0.33], ["meme", -1.66], ["post", -2.41]] },
        { candidates: [["completely", -0.46], ["basically", -1.42], ["literally", -2.04]] },
        { candidates: [["broke", -0.09], ["crashed", -2.81], ["melted", -3.51]] },
        { candidates: [["the", -0.19], ["my", -1.97], ["everyone's", -3.51]] },
        { candidates: [["entire", -0.94], ["whole", -1.08], ["actual", -1.32]] },
        { candidates: [["internet", -0.40], ["algorithm", -1.56], ["timeline", -2.04]] },
        { candidates: [[".", -0.15], ["!", -2.21], ["?", -2.81]] },
      ],
      sentenceStart: "The viral video completely broke the entire",
      highlightWord: "internet",
      meaningWords: ["The", "viral", "video", "broke", "the"],
      meaningLabels: [
        { word: "The", meaning: "grammar & structure" },
        { word: "viral", meaning: "massive spread" },
        { word: "video", meaning: "digital media" },
        { word: "broke", meaning: "disrupted" },
      ],
      meaningCandidates: [
        { word: "internet", pct: 38 },
        { word: "algorithm", pct: 15 },
        { word: "timeline", pct: 12 },
        { word: "server", pct: 10 },
        { word: "record", pct: 7 },
      ],
      rankedCandidates: [
        { word: "internet", pct: 38 },
        { word: "algorithm", pct: 15 },
        { word: "timeline", pct: 12 },
        { word: "server", pct: 10 },
        { word: "record", pct: 7 },
        { word: "feed", pct: 6 },
        { word: "matrix", pct: 5 },
        { word: "simulation", pct: 4 },
      ],
    },
    dimensions: [
      { dim: "Is it conscious?", yes: "dolphin, human, octopus", no: "algorithm, volcano" },
      { dim: "Can it learn?", yes: "algorithm, neural net, dolphin", no: "volcano, guitar" },
      { dim: "Is it dangerous?", yes: "volcano, virus, lightning", no: "guitar, algorithm" },
      { dim: "Does it create waves?", yes: "guitar, ocean, radio", no: "algorithm, volcano" },
    ],
    tryIt: {
      defaultPrompt: "The algorithm predicted that the next",
      embedPresets: [
        { label: "Internet Culture", words: ["meme", "viral", "algorithm", "streaming", "podcast", "influencer", "trending", "clickbait", "download", "WiFi"] },
        { label: "Science", words: ["gravity", "neuron", "quantum", "DNA", "atom", "laser", "orbit", "frequency", "voltage", "entropy"] },
        { label: "Music & Vibes", words: ["guitar", "drums", "lyrics", "remix", "chill", "hype", "vibe", "beat", "rhythm", "melody"] },
      ],
    },
  },
};
