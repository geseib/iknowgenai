import { encoding_for_model } from "tiktoken";
import { moderate } from "./_moderate.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "text string required" });
  }

  // Limit input length
  if (text.length > 500) {
    return res.status(400).json({ error: "Text too long (max 500 characters)" });
  }

  // Content safety check
  const check = await moderate(text);
  if (!check.safe) {
    return res.status(200).json({ blocked: true });
  }

  try {
    const enc = encoding_for_model("gpt-4o-mini");
    const tokenIds = enc.encode(text);

    // Decode each token individually to get its text representation
    const tokens = [];
    for (const id of tokenIds) {
      const bytes = enc.decode(new Uint32Array([id]));
      const decoded = new TextDecoder().decode(bytes);
      tokens.push({ id, text: decoded });
    }

    enc.free();

    res.status(200).json({
      tokens,
      count: tokens.length,
      charCount: text.length,
    });
  } catch (err) {
    console.error("tokenize error:", err);
    res.status(500).json({ error: err.message });
  }
}
