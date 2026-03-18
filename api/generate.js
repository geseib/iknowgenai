import OpenAI from "openai";
import { moderate, SAFE_SYSTEM_PROMPT } from "./_moderate.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Max input prompt length in characters
const MAX_PROMPT_LENGTH = 500;
// Hard cap on output tokens (client can request less but never more)
const MAX_OUTPUT_TOKENS = 100;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { prompt, temperature = 0.8, maxTokens = 60 } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "prompt required" });
  }

  // Guard: cap input length
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: `Prompt too long (max ${MAX_PROMPT_LENGTH} characters)` });
  }

  // Content safety check
  const check = await moderate(prompt);
  if (!check.safe) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.write(`data: ${JSON.stringify({ blocked: true })}\n\n`);
    res.end();
    return;
  }

  // Set up streaming headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SAFE_SYSTEM_PROMPT + " Keep responses short (2-3 sentences max)." },
        { role: "user", content: prompt },
      ],
      max_tokens: Math.min(maxTokens, MAX_OUTPUT_TOKENS),
      temperature: Math.max(0, Math.min(temperature, 2)),
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ token: content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("generate error:", err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
}
