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
            `For each CONTENT word in the story (nouns, verbs, adjectives, names — ` +
            `skip articles, prepositions, conjunctions, pronouns, and auxiliary verbs), ` +
            `list 1-3 earlier words that most influenced its choice: prompt words (P#) ` +
            `or story words that appear BEFORE it (S# with a smaller number). ` +
            `Prefer meaningful links — the prompt's ingredients, a character named earlier, ` +
            `cause and effect. Reply as JSON: {"influences": {"3": ["P8","S1"], ...}} ` +
            `where each key is a story word's S-number.`,
        },
      ],
    });

    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    const raw = parsed.influences || {};
    // Validate: keys must be story indices; refs must be earlier words.
    const influences = {};
    for (const [key, refs] of Object.entries(raw)) {
      const si = parseInt(key, 10);
      if (!Number.isInteger(si) || si < 0 || si >= storyWords.length) continue;
      if (!Array.isArray(refs)) continue;
      const valid = refs
        .filter((r) => typeof r === "string" && /^[PS]\d+$/.test(r))
        .filter((r) => {
          const idx = parseInt(r.slice(1), 10);
          return r[0] === "P" ? idx < promptWords.length : idx < si;
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
