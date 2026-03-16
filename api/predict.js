import OpenAI from "openai";
import { moderate } from "./_moderate.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { prompt, topN = 8, temperature = 1 } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "prompt required" });
  }

  // Content safety check
  const check = await moderate(prompt);
  if (!check.safe) {
    return res.status(400).json({ error: check.message });
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
      pct: Math.round((exps[i] / sumExps) * 1000) / 10, // one decimal place
    }));

    res.status(200).json({
      chosen: choice.message.content.trim(),
      candidates,
    });
  } catch (err) {
    console.error("predict error:", err);
    res.status(500).json({ error: err.message });
  }
}
