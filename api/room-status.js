import { redis } from "./_redis.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "GET only" });
  }

  const code = (req.query.code || "").toUpperCase();
  if (!code) {
    return res.status(400).json({ error: "code required" });
  }

  const key = `room:${code}`;
  const data = await redis("HGETALL", key);

  // HGETALL returns null or empty array when key doesn't exist
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return res.status(404).json({ error: "room_not_found" });
  }

  // Upstash returns HGETALL as a flat array: [field, value, field, value, ...]
  // Convert to object
  const obj = {};
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i += 2) {
      obj[data[i]] = data[i + 1];
    }
  } else {
    Object.assign(obj, data);
  }

  return res.status(200).json({
    character: obj.character || "",
    place: obj.place || "",
    event: obj.event || "",
    character_claimed: obj.character_claimed === "1",
    place_claimed: obj.place_claimed === "1",
    event_claimed: obj.event_claimed === "1",
  });
}
