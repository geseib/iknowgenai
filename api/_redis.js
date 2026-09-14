// Thin wrapper around Upstash Redis REST API — zero dependencies.
//
// Vercel's Upstash integration now provisions KV_REST_API_URL / KV_REST_API_TOKEN
// (plus KV_URL / REDIS_URL for TCP clients, which we don't use). The older
// UPSTASH_REDIS_REST_* names are still honored as a fallback.
const BASE_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

/** True when a REST URL and write token are both present. */
export function redisConfigured() {
  return Boolean(BASE_URL && TOKEN);
}

export async function redis(...args) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Redis error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.result;
}

// Pipeline: run multiple commands in one request
export async function redisPipeline(commands) {
  const res = await fetch(`${BASE_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Redis pipeline error ${res.status}: ${text}`);
  }
  return res.json();
}
