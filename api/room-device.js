import { redis, redisPipeline } from "./_redis.js";
import { ROOM_TTL, readRoom, parseQuestions, normalizeCode, roomKey, devicesKey, votesKey, tapsKey } from "./_room.js";

// Student phone / class tablet actions. Body: { code, deviceId, action, ...payload }.
// deviceId is an anonymous id the browser mints once and keeps; nothing personal.
//
//   join                                   registers the device (for the joined count)
//   requestTablet                          asks to become the class tablet → { pairing: "42" }
//                                          (the teacher types it on the projector; see room-host "pair")
//   vote   { questionId, optionId }        phones mode: one vote per device (re-vote replaces)
//                                          tablet mode: only the paired tablet; every tap is one vote
//                                          projector mode / frozen / closed question: rejected

const DEVICE_RE = /^[A-Za-z0-9_-]{8,64}$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }
  const body = req.body || {};
  const code = normalizeCode(body.code);
  const { deviceId, action } = body;
  if (!code || !action || typeof deviceId !== "string" || !DEVICE_RE.test(deviceId)) {
    return res.status(400).json({ error: "code, deviceId and action required" });
  }

  const room = await readRoom(code);
  if (!room) return res.status(404).json({ error: "room_not_found" });
  const key = roomKey(code);

  try {
    switch (action) {
      case "join": {
        await redisPipeline([["SADD", devicesKey(code), deviceId], ["EXPIRE", devicesKey(code), ROOM_TTL]]);
        return res.status(200).json({ ok: true, mode: room.mode });
      }
      case "requestTablet": {
        // Pending requests are a map code → { deviceId, at }, so a second device asking
        // (a curious kid) can't overwrite the real tablet's number. Codes are unique per room.
        let pending = {};
        try { pending = JSON.parse(room.pairing || "{}") || {}; } catch { pending = {}; }
        if (pending.code) pending = {}; // legacy single-request shape
        const now = Date.now();
        for (const [c, p] of Object.entries(pending)) if (now - (p.at || 0) > 10 * 60 * 1000) delete pending[c];
        // One pending code per device: re-tapping reuses it
        let pairing = Object.keys(pending).find(c => pending[c].deviceId === deviceId);
        if (!pairing) {
          do { pairing = String(Math.floor(10 + Math.random() * 90)); } while (pending[pairing]); // two digits, never starts with 0
          pending[pairing] = { deviceId, at: now };
        }
        await redis("HSET", key, "pairing", JSON.stringify(pending));
        return res.status(200).json({ ok: true, pairing });
      }
      case "vote": {
        if (room.frozen === "1") return res.status(409).json({ error: "frozen" });
        if (room.mode === "projector") return res.status(403).json({ error: "projector_mode" });
        const isTablet = room.tablet && room.tablet === deviceId;
        if (room.mode === "tablet" && !isTablet) return res.status(403).json({ error: "tablet_only" });

        const questions = parseQuestions(room);
        const q = questions[body.questionId];
        if (!q || !q.open) return res.status(409).json({ error: "question_closed" });
        if (!q.options.some(o => o.id === body.optionId)) return res.status(400).json({ error: "bad_option" });

        if (room.mode === "tablet") {
          // Pass-around: each tap is a different kid, so count taps rather than devices.
          await redisPipeline([["HINCRBY", tapsKey(code, body.questionId), body.optionId, 1], ["EXPIRE", tapsKey(code, body.questionId), ROOM_TTL]]);
        } else {
          await redisPipeline([["HSET", votesKey(code, body.questionId), deviceId, body.optionId], ["EXPIRE", votesKey(code, body.questionId), ROOM_TTL]]);
        }
        return res.status(200).json({ ok: true });
      }
      default:
        return res.status(400).json({ error: "unknown_action" });
    }
  } catch (err) {
    console.error("[room-device] error:", err);
    return res.status(500).json({ error: `Upstash request failed: ${err.message}` });
  }
}
