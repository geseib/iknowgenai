import OpenAI from "openai";
import { moderate } from "./_moderate.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Max input prompt length in characters (~200 tokens at 4 chars/token)
const MAX_PROMPT_LENGTH = 800;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { prompt, topN = 8, temperature = 1 } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "prompt required" });
  }

  // Guard: cap input length to control costs
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: `Prompt too long (max ${MAX_PROMPT_LENGTH} characters)` });
  }

  // Layer 1+2: Content safety check on input
  const check = await moderate(prompt);
  if (!check.safe) {
    return res.status(200).json({ blocked: true });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Complete the text with one word. Do not explain. The word must be appropriate for children ages 8-11. Never produce violent, sexual, scary, or inappropriate content." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1,
      logprobs: true,
      top_logprobs: Math.min(topN, 20),
      temperature: Math.max(0, Math.min(temperature, 2)),
    });

    const choice = response.choices[0];
    const topLogprobs = choice.logprobs?.content?.[0]?.top_logprobs || [];

    // Apply temperature scaling to logprobs, then softmax
    const t = Math.max(0.05, Math.min(temperature, 2));
    const filtered = topLogprobs.filter(lp => lp.token.trim().length > 0);
    const scaledLogprobs = filtered.map(lp => lp.logprob / t);
    const maxLogprob = Math.max(...scaledLogprobs);
    const exps = scaledLogprobs.map(lp => Math.exp(lp - maxLogprob));
    const sumExps = exps.reduce((a, b) => a + b, 0);

    const candidates = filtered.map((lp, i) => ({
      token: lp.token.trim(),
      logprob: lp.logprob,
      pct: Math.round((exps[i] / sumExps) * 1000) / 10,
    }));

    const chosen = choice.message.content.trim();

    // Layer 3: Check if the output itself is safe
    // Combine prompt + chosen word to catch context-dependent issues
    const outputCheck = await moderate(prompt + " " + chosen);
    if (!outputCheck.safe) {
      return res.status(200).json({ blocked: true });
    }

    res.status(200).json({
      chosen,
      candidates,
    });
  } catch (err) {
    console.error("predict error:", err);
    res.status(500).json({ error: err.message });
  }
}
