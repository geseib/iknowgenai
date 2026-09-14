import { redis } from "./_redis.js";
import { readRoom, parseQuestions, normalizeCode, devicesKey } from "./_room.js";

// Public room snapshot, polled by student phones / the class tablet (and by Story
// Mash-Up's teacher screen). Never returns the hostKey or other devices' votes.
// Query: ?code=XXXX[&deviceId=...]  — deviceId lets the caller learn if it is the tablet.

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "GET only" });
  }

  const code = normalizeCode(req.query.code);
  if (!code) {
    return res.status(400).json({ error: "code required" });
  }

  const room = await readRoom(code);
  if (!room) {
    return res.status(404).json({ error: "room_not_found" });
  }

  const deviceId = typeof req.query.deviceId === "string" ? req.query.deviceId.slice(0, 64) : "";
  const questions = parseQuestions(room);
  const open = Object.entries(questions)
    .filter(([, q]) => q.open)
    .map(([id, q]) => ({ id, prompt: q.prompt, options: q.options }));

  let joined = 0;
  try { joined = Number(await redis("SCARD", devicesKey(code))) || 0; } catch { /* non-fatal */ }

  return res.status(200).json({
    // Story Mash-Up fields (unchanged contract)
    character: room.character || "",
    place: room.place || "",
    event: room.event || "",
    character_claimed: room.character_claimed === "1",
    place_claimed: room.place_claimed === "1",
    event_claimed: room.event_claimed === "1",
    // Lesson-room fields
    mode: room.mode || "phones",
    frozen: room.frozen === "1",
    storymash: room.storymash === "1",
    tabletPaired: Boolean(room.tablet),
    isTablet: Boolean(deviceId) && room.tablet === deviceId,
    joined,
    questions: open,
  });
}
