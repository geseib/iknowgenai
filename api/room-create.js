import { redis, redisPipeline, redisConfigured } from "./_redis.js";
import { ROOM_TTL, MODES, makeCode, makeKey, roomKey } from "./_room.js";

// Creates a lesson room. Body: { mode?: "projector" | "tablet" | "phones" } (default "phones").
// Returns { code, hostKey, mode }. The hostKey authorizes teacher actions (room-host) and
// must stay in the teacher's browser — kids only get the code.
//
// Story Mash-Up's standalone "Remote Entry" also calls this (no body) and keeps working:
// the character/place/event fields are created here exactly as before.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  // Fail fast with a clear message if the Redis env vars aren't configured
  if (!redisConfigured()) {
    return res.status(500).json({
      error: "Backend not configured: KV_REST_API_URL / KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN) missing in Vercel environment",
    });
  }

  const requested = req.body?.mode;
  const mode = MODES.includes(requested) ? requested : "phones";
  const storymash = req.body?.storymash ? "1" : "0"; // standalone Story Mash rooms open immediately

  try {
    // Try up to 5 times to avoid collision
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = makeCode();
      const key = roomKey(code);

      const exists = await redis("EXISTS", key);
      if (exists) continue;

      const hostKey = makeKey();
      await redisPipeline([
        ["HSET", key,
          "mode", mode, "hostKey", hostKey, "frozen", "0", "tablet", "", "pairing", "",
          "storymash", storymash, "questions", "{}", "createdAt", String(Date.now()),
          "character", "", "place", "", "event", "",
          "character_claimed", "0", "place_claimed", "0", "event_claimed", "0",
        ],
        ["EXPIRE", key, ROOM_TTL],
      ]);

      return res.status(200).json({ code, hostKey, mode });
    }
    return res.status(500).json({ error: "Could not generate room code, try again" });
  } catch (err) {
    console.error("[room-create] error:", err);
    return res.status(500).json({ error: `Upstash request failed: ${err.message}` });
  }
}
