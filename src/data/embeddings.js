export const WORD_MAP = [
  { w: "cat",      x: 16, y: 24, g: "animals" },
  { w: "dog",      x: 23, y: 17, g: "animals" },
  { w: "bird",     x: 11, y: 36, g: "animals" },
  { w: "fish",     x: 7,  y: 47, g: "animals" },
  { w: "king",     x: 66, y: 14, g: "royalty" },
  { w: "queen",    x: 74, y: 21, g: "royalty" },
  { w: "prince",   x: 61, y: 29, g: "royalty" },
  { w: "pizza",    x: 37, y: 73, g: "food" },
  { w: "burger",   x: 44, y: 79, g: "food" },
  { w: "sushi",    x: 51, y: 67, g: "food" },
  { w: "robot",    x: 80, y: 69, g: "tech" },
  { w: "phone",    x: 75, y: 77, g: "tech" },
  { w: "computer", x: 86, y: 62, g: "tech" },
  { w: "run",      x: 33, y: 31, g: "action" },
  { w: "jump",     x: 41, y: 25, g: "action" },
  { w: "swim",     x: 27, y: 38, g: "action" },
];

export const GROUP_COLORS = {
  animals: "#fee440",
  royalty: "#f15bb5",
  food:    "#fb5607",
  tech:    "#00bbf9",
  action:  "#9b5de5",
};

export const P2_ANIMALS  = ["cat", "dog", "bird", "fish"];
export const P2_VEHICLES = ["plane", "train", "car", "boat"];

export const P2_STEPS = [
  {
    title: "Two neighbourhoods",
    body: "These 8 words live in totally different parts of vector space. Animals over here \u2014 vehicles over there.",
    dimLabel: null, scores: null, focusGroup: null,
  },
  {
    title: "Let's zoom in on cat and dog",
    body: "They sit really close together. The AI thinks they're similar \u2014 but WHY? What's the same about them?",
    dimLabel: null, scores: null, focusGroup: "cd",
  },
  {
    title: "Dimension: Animal",
    body: "They're both animals! Cat and dog score HIGH. Plane and train score zero.",
    dimLabel: "Animal",
    scores: { cat: 2, dog: 2, bird: 2, fish: 2, plane: 0, train: 0, car: 0, boat: 0 },
    focusGroup: "cd", dimColor: "#fee440",
  },
  {
    title: "Dimension: Has Fur",
    body: "Both cat and dog have fur. Bird has feathers. Fish has scales. Plane has... metal. Very different!",
    dimLabel: "Has Fur",
    scores: { cat: 2, dog: 2, bird: 0, fish: 0, plane: 0, train: 0, car: 0, boat: 0 },
    focusGroup: "cd", dimColor: "#fb5607",
  },
  {
    title: "Dimension: Has 4 Legs",
    body: "Four legs each \u2014 confirmed. A bird has two. A fish has none. Each difference becomes different numbers!",
    dimLabel: "Has 4 Legs",
    scores: { cat: 2, dog: 2, bird: 1, fish: 0, plane: 0, train: 0, car: 0, boat: 0 },
    focusGroup: "cd", dimColor: "#9b5de5",
  },
  {
    title: "Now look at bird and plane",
    body: "These live in different neighbourhoods... but do they share anything surprising?",
    dimLabel: null, scores: null, focusGroup: "bp",
  },
  {
    title: "Dimension: Has Wings",
    body: "Both bird AND plane score HIGH on wings! The AI noticed this connection across totally different groups.",
    dimLabel: "Has Wings",
    scores: { cat: 0, dog: 0, bird: 2, fish: 0, plane: 2, train: 0, car: 0, boat: 0 },
    focusGroup: "bp", dimColor: "#00bbf9",
  },
  {
    title: "But... would you ride a bird to school?",
    body: "Plane scores HIGH on 'you can ride it'. Bird scores almost zero. Same wings \u2014 totally different purpose!",
    dimLabel: "You Can Ride It",
    scores: { cat: 0, dog: 0, bird: 0, fish: 0, plane: 2, train: 2, car: 2, boat: 2 },
    focusGroup: "veh", dimColor: "#f15bb5",
  },
  {
    title: "Every word is a mix of ALL dimensions",
    body: "Cat = [animal:high, fur:high, legs:high, wings:zero, rideable:zero...] \u00d7 12,288 dimensions. That's what those numbers actually mean!",
    dimLabel: "All dimensions at once",
    scores: { cat: 2, dog: 2, bird: 1, fish: 1, plane: 2, train: 2, car: 2, boat: 2 },
    focusGroup: null, dimColor: "#fee440",
  },
];
