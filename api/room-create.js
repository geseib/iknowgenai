import { redis, redisPipeline } from "./_redis.js";

// Characters that are easy to read aloud / type on a phone (no O/0/I/1/L)
const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LEN = 4;
const TTL = 600; // 10 minutes

function makeCode() {
  let code = "";
  for (let i = 0; i < CODE_LEN; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  // Fail fast with a clear message if Upstash env vars aren't configured
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return res.status(500).json({
      error: "Backend not configured: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN missing in Vercel environment",
    });
  }

  try {
    // Try up to 5 times to avoid collision
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = makeCode();
      const key = `room:${code}`;

      const exists = await redis("EXISTS", key);
      if (exists) continue;

      await redisPipeline([
        ["HSET", key,
          "character", "", "place", "", "event", "",
          "character_claimed", "0", "place_claimed", "0", "event_claimed", "0",
        ],
        ["EXPIRE", key, TTL],
      ]);

      return res.status(200).json({ code });
    }
    return res.status(500).json({ error: "Could not generate room code, try again" });
  } catch (err) {
    console.error("[room-create] error:", err);
    return res.status(500).json({ error: `Upstash request failed: ${err.message}` });
  }
}
