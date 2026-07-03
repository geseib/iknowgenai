import OpenAI from "openai";
import { moderate } from "./_moderate.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// For the course's Chapter 1 replay: given the prompt and the story it
// produced, ask the model which earlier words most influenced each content
// word. This is an LLM's retrospective estimate, NOT real attention weights —
// the client labels it honestly. One call per story.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { prompt, story } = req.body;
  if (!prompt || !story) {
    return res.status(400).json({ error: "prompt and story required" });
  }
  if (prompt.length > 600 || story.length > 1500) {
    return res.status(400).json({ error: "input too long" });
  }

  const check = await moderate(prompt + " " + story, { relaxed: true });
  if (!check.safe) {
    return res.status(200).json({ blocked: true });
  }

  // The client splits with the same regex — indices must line up.
  const promptWords = prompt.trim().split(/\s+/);
  const storyWords = story.trim().split(/\s+/);

  const promptList = promptWords.map((w, i) => `P${i}:${w}`).join(" ");
  const storyList = storyWords.map((w, i) => `S${i}:${w}`).join(" ");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 1800,
      messages: [
        {
          role: "system",
          content:
            "You analyze which earlier words most influenced each word of an AI-generated story. Reply with JSON only.",
        },
        {
          role: "user",
          content:
            `A language model was given this prompt and wrote this story.\n\n` +
            `PROMPT WORDS: ${promptList}\n\nSTORY WORDS: ${storyList}\n\n` +
            `Identify story words whose choice was CLEARLY and SPECIFICALLY influenced ` +
            `by particular earlier words: the prompt's subject-matter ingredients ` +
            `(characters, places, events), a character or object named earlier in the ` +
            `story, or a clear cause-effect link. For each such story word, list 1-3 ` +
            `influencing words: prompt words (P#) or story words appearing BEFORE it ` +
            `(S# with a smaller number).\n\n` +
            `Rules:\n` +
            `- Quality over coverage: annotating only the 10-25 clearest cases is ideal.\n` +
            `- NEVER annotate or reference function words (the, a, his, in, was, and…).\n` +
            `- NEVER reference the prompt's instruction words (Write, fun, vivid, short, ` +
            `story, sentences, about, where) — only its subject-matter words.\n` +
            `- Skip any word with no specific influence. Do not pad.\n\n` +
            `Reply as JSON: {"influences": {"3": ["P8","S1"], ...}} where each key is a ` +
            `story word's S-number.`,
        },
      ],
    });

    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    const raw = parsed.influences || {};

    // Server-side quality filter — don't rely on model obedience.
    // Function words are never interesting targets or sources, and the
    // prompt's instruction boilerplate is never a real influence.
    const STOP = new Set(
      ("a an the and or but so as at by for from in into of off on onto out over to up with without " +
        "is are was were be been being am has have had do does did will would can could may might shall should " +
        "he she it they them his her its their this that these those there here i you we me my your our us " +
        "not no yes if then than when while where who whom whose which what every each all any some just simply").split(" ")
    );
    const clean = (w) => w.toLowerCase().replace(/[^a-z'-]/g, "");
    const BOILERPLATE = new Set(["write", "fun", "vivid", "short", "story", "sentences", "sentence", "about", "where"]);

    const influences = {};
    for (const [key, refs] of Object.entries(raw)) {
      const si = parseInt(key, 10);
      if (!Number.isInteger(si) || si < 0 || si >= storyWords.length) continue;
      if (STOP.has(clean(storyWords[si]))) continue; // never annotate function words
      if (!Array.isArray(refs)) continue;
      const valid = refs
        .filter((r) => typeof r === "string" && /^[PS]\d+$/.test(r))
        .filter((r) => {
          const idx = parseInt(r.slice(1), 10);
          if (r[0] === "P") {
            if (idx >= promptWords.length) return false;
            const w = clean(promptWords[idx]);
            return !STOP.has(w) && !BOILERPLATE.has(w);
          }
          return idx < si && !STOP.has(clean(storyWords[idx]));
        })
        .slice(0, 3);
      if (valid.length) influences[si] = valid;
    }

    res.status(200).json({ influences });
  } catch (err) {
    console.error("annotate error:", err);
    res.status(500).json({ error: err.message });
  }
}
