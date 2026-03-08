# I Know GenAI — How AI Thinks

An interactive, presentation-style web app that teaches 3rd–5th graders how large language models work. Built with React and designed to be projected in a classroom — everything is big, colorful, and visible from the back row.

![Mode Select](docs/screenshots/01-mode-select.png)

## What It Teaches

The lesson walks students through 13 sections across three groups:

**Introduction** — What is AI? How is it different from regular programs? How does it compare to the human brain?

**Meet the LLMs** — What does LLM stand for? Meet ChatGPT, Claude, Llama, and Gemini. What's the big question they all answer?

**How AI Thinks** — The five-step pipeline: numbers (embeddings), words in space (vector similarity), attention, the thinking layer (MLP), stacking layers, and next-word prediction.

### Highlights

| Section | What kids see |
|---|---|
| **The Secret: Numbers** | A giant "cat" prompt, then a streaming ticker of 12,288 numbers |
| **Words in Space** | An interactive scatter plot — tap words to see clusters light up |
| **Dimension Explorer** | Step through "Is Animal?", "Has Wings?", "You Can Ride It?" dimensions |
| **Attention** | "bat" — baseball bat or flying animal? Context decides |
| **Predict!** | A temperature slider that controls how "creative" the AI's next word is |

## Screenshots

| | |
|---|---|
| ![What IS AI?](docs/screenshots/03-what-is-ai.png) | ![Rules vs Learning](docs/screenshots/04-rules-vs-learning.png) |
| ![What's an LLM?](docs/screenshots/05-whats-an-llm.png) | ![The Secret: Numbers](docs/screenshots/06-the-secret-numbers.png) |
| ![Cat Feelings](docs/screenshots/07-cat-feelings.png) | ![Words in Space](docs/screenshots/08-words-in-space.png) |
| ![Attention](docs/screenshots/09-attention.png) | ![Who's Used AI?](docs/screenshots/02-who-used-ai.png) |

## Two Modes

- **Classroom Mode** — The teacher controls the pace. Each section includes collapsible "Talking Points" with discussion prompts and teaching tips.
- **Solo Mode** — Students explore at their own pace with interactive elements guiding the way.

## Navigation

- **Down Arrow** or click the button — advance within a section (progressive reveal)
- **Left / Right Arrow** or click Back/Next — move between sections
- Each new step auto-scrolls into the center of the screen

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v20.19+ or v22.12+
- npm (included with Node.js)

### Setup

```bash
git clone https://github.com/geseib/iknowgenai.git
cd iknowgenai
npm install
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview
```

The built files will be in the `dist/` directory, ready to deploy to any static hosting service (GitHub Pages, Netlify, Vercel, S3, etc.).

## Tech Stack

- **React 19** — UI framework
- **Vite 7** — Build tool and dev server
- **Phosphor Icons** — Duotone icons throughout (no emoji)
- **No external CSS framework** — All styling is inline for simplicity
- **No backend** — Entirely client-side, zero dependencies beyond React

## Project Structure

```
src/
  App.jsx                  # Root component, section navigation, keyboard handling
  components/
    shared.jsx             # Card, Label, H1, TriviaBox, TeacherNote, DiscussionGate
    CatIllustration.jsx    # Inline SVG cat illustration
    SectionWhoIsHere.jsx   # Section 1: Who's used AI?
    SectionWhatIsAI.jsx    # Section 2: What IS AI?
    SectionProgramsVsAI.jsx# Section 3: Rules vs Learning
    SectionBrainVsAI.jsx   # Section 4: Brain vs AI
    SectionWhatIsLLM.jsx   # Section 5: What's an LLM?
    SectionMeetModels.jsx  # Section 6: Meet the Models
    SectionTheBridge.jsx   # Section 7: The Big Question
    SectionHook.jsx        # Section 8: The Secret: Numbers
    SectionEmbeddings.jsx  # Section 9: Words in Space + Dimension Explorer
    SectionAttention.jsx   # Section 10: Attention
    SectionMLP.jsx         # Section 11: The Thinking Layer
    SectionLayers.jsx      # Section 12: Rinse & Repeat
    SectionPredict.jsx     # Section 13: Predict!
  data/
    constants.js           # Colors, section titles, group definitions
    embeddings.js          # Word map coordinates, dimension explorer steps
    predict.js             # Prediction demo data
  styles/
    global.js              # CSS animations (twinkle, fadeUp, slideIn, etc.)
```

## Submitting Issues

Found a bug, factual error, or have a suggestion?

1. Go to [Issues](https://github.com/geseib/iknowgenai/issues)
2. Click **New Issue**
3. Include:
   - What section the issue is in (e.g., "Section 9: Words in Space")
   - What you expected to happen
   - What actually happened
   - Your browser and device (especially if it's a display issue)

Factual accuracy matters here — if something is wrong or misleading for kids, please flag it.

## Contributing

Contributions are welcome! This is an educational project aimed at kids, so keep that audience in mind.

### Getting started

1. Fork the repository
2. Create a feature branch: `git checkout -b my-feature`
3. Make your changes
4. Test locally with `npm run dev`
5. Commit your changes: `git commit -m "Add my feature"`
6. Push to your fork: `git push origin my-feature`
7. Open a Pull Request

### Guidelines

- **Keep it kid-friendly** — Language should be simple and clear for 8–11 year olds
- **Keep it big** — All text, icons, and interactive elements must be visible from the back of a classroom
- **Keep it accurate** — All AI/ML concepts should be factually correct, even when simplified
- **Follow existing patterns** — Each section uses the same progressive reveal pattern (useState step + ArrowDown keyboard + scrollIntoView)
- **No external images** — Use Phosphor Icons or inline SVGs to avoid loading dependencies
- **Test both modes** — Check Classroom Mode (with talking points) and Solo Mode

### Ideas for contributions

- New sections covering topics like training data, hallucinations, or AI safety
- Accessibility improvements (screen reader support, high contrast mode)
- Translations / localization for other languages
- Mobile-friendly touch gestures
- Print-friendly handout versions of key visuals

## License

This project is open source. See the repository for license details.
