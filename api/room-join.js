import { redis } from "./_redis.js";
import { readRoom } from "./_room.js";

const VALID_ROLES = ["character", "place", "event"];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { code, role } = req.body || {};
  if (!code || !role || !VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: "code and valid role required" });
  }

  const key = `room:${code.toUpperCase()}`;
  const room = await readRoom(code.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: "room_not_found" });
  }
  // In pass-around mode only the paired class tablet may enter ingredients.
  if (room.mode === "tablet" && room.tablet !== (req.body?.deviceId || "")) {
    return res.status(403).json({ error: "tablet_only" });
  }

  // Check if role is already claimed
  const claimed = await redis("HGET", key, `${role}_claimed`);
  if (claimed === "1") {
    return res.status(409).json({ error: "role_taken" });
  }

  // Claim the role
  await redis("HSET", key, `${role}_claimed`, "1");
  return res.status(200).json({ ok: true });
}
