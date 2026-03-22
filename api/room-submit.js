import { redis } from "./_redis.js";
import { moderate } from "./_moderate.js";

const VALID_ROLES = ["character", "place", "event"];
const MAX_VALUE_LENGTH = 100;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { code, role, value } = req.body || {};
  if (!code || !role || !VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: "code and valid role required" });
  }
  if (!value || value.trim().length === 0) {
    return res.status(400).json({ error: "value required" });
  }
  if (value.length > MAX_VALUE_LENGTH) {
    return res.status(400).json({ error: `Too long (max ${MAX_VALUE_LENGTH} characters)` });
  }

  const key = `room:${code.toUpperCase()}`;
  const exists = await redis("EXISTS", key);
  if (!exists) {
    return res.status(404).json({ error: "room_not_found" });
  }

  // Content moderation
  const check = await moderate(value);
  if (!check.safe) {
    return res.status(422).json({ error: "blocked", message: check.message });
  }

  // Store the value
  await redis("HSET", key, role, value.trim());
  return res.status(200).json({ ok: true });
}
