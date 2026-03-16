import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { prompt, topN = 8 } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "prompt required" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Complete the text with one word. Do not explain." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1,
      logprobs: true,
      top_logprobs: Math.min(topN, 20),
      temperature: 1,
    });

    const choice = response.choices[0];
    const topLogprobs = choice.logprobs?.content?.[0]?.top_logprobs || [];

    // Convert logprobs to percentages
    const candidates = topLogprobs.map(lp => ({
      token: lp.token.trim(),
      logprob: lp.logprob,
      pct: Math.round(Math.exp(lp.logprob) * 100),
    })).filter(c => c.token.length > 0);

    res.status(200).json({
      chosen: choice.message.content.trim(),
      candidates,
    });
  } catch (err) {
    console.error("predict error:", err);
    res.status(500).json({ error: err.message });
  }
}
