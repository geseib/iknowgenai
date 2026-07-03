import OpenAI from "openai";
import { moderate, SAFE_SYSTEM_PROMPT } from "./_moderate.js";

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

  // Content safety check on input. Completion mode is used only by the 14+
  // course, so it gets relaxed moderation (OpenAI moderation API only — the
  // K-12 keyword list and classifier would block ordinary story words).
  const isCompletion = req.body.mode === "completion";
  const check = await moderate(prompt, { relaxed: isCompletion });
  if (!check.safe) {
    return res.status(200).json({ blocked: true });
  }

  // Completion mode (v2 course): raw next-token prediction via the legacy
  // completions API. Unlike chat, every token here carries its true leading
  // space, so word boundaries are unambiguous — the model also naturally
  // continues partial words. Returns the assembled first word + its pieces.
  if (req.body.mode === "completion") {
    try {
      const t = Math.max(0.05, Math.min(temperature, 2));
      const response = await openai.completions.create({
        model: "gpt-3.5-turbo-instruct",
        prompt,
        max_tokens: 8,
        temperature: Math.min(t, 2),
        logprobs: 5, // completions API max
        stop: ["\n"],
      });
      const lp = response.choices[0].logprobs || {};
      const sampled = lp.tokens || [];

      // Assemble the first whole word from the sampled tokens.
      const pieces = [];
      for (let i = 0; i < sampled.length; i++) {
        if (i > 0 && /^[\s.,!?;:'"()]/.test(sampled[i])) break;
        pieces.push(sampled[i]);
        if (/[.,!?;:]$/.test(sampled[i])) break;
      }
      const word = pieces.join("").trim();

      // Top candidates for the FIRST position, with temperature rescaling
      // (same math as the chat path).
      const top0 = lp.top_logprobs?.[0] || {};
      const entries = Object.entries(top0).filter(([tok]) => tok.trim().length > 0);
      const scaled = entries.map(([, l]) => l / t);
      const maxL = Math.max(...scaled);
      const exps = scaled.map((l) => Math.exp(l - maxL));
      const sumExps = exps.reduce((a, b) => a + b, 0);
      const candidates = entries
        .map(([tok, l], i) => ({
          token: tok.trim(),
          raw: tok,
          logprob: l,
          pct: Math.round((exps[i] / sumExps) * 1000) / 10,
        }))
        .sort((a, b) => b.pct - a.pct);

      const outputCheck = await moderate(prompt + " " + word, { relaxed: true });
      if (!outputCheck.safe) {
        return res.status(200).json({ blocked: true });
      }
      return res.status(200).json({ chosen: word, word, pieces, candidates });
    } catch (err) {
      console.error("predict (completion mode) error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SAFE_SYSTEM_PROMPT + " Complete the text with one word. Do not explain." },
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
      raw: lp.token, // untrimmed — leading space marks a word boundary
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
