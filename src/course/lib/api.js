// Thin client wrappers around the existing Vercel API functions.
// All endpoints have input caps and content moderation server-side;
// responses may carry { blocked: true } or { error }.

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// Ranked next-token candidates with probabilities.
// → { blocked? } | { tokens: [{token, prob, ...}], ... }
export function predictNext(prompt, { temperature = 1.0 } = {}) {
  return postJSON("/api/predict", { prompt, temperature });
}

// Real tiktoken tokenization. → { blocked? } | { tokens: [...], count, ... }
export function tokenize(text) {
  return postJSON("/api/tokenize", { text });
}

// PCA-reduced 2D embedding coordinates. → { blocked? } | { points: [...], ... }
export function embed2d(words) {
  return postJSON("/api/embed", { words });
}

// Streaming generation over SSE. Calls onToken(token) as tokens arrive.
// Resolves with { blocked } or { text } when the stream ends.
export async function generateStream(prompt, { temperature = 0.8, maxTokens, onToken } = {}) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, temperature, ...(maxTokens ? { maxTokens } : {}) }),
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = JSON.parse(line.slice(6));
      if (data.blocked) return { blocked: true, text: "" };
      if (data.error) throw new Error(data.error);
      if (data.token) {
        text += data.token;
        onToken?.(data.token, text);
      }
      if (data.done) return { blocked: false, text };
    }
  }
  return { blocked: false, text };
}
