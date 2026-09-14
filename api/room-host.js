import { redis, redisPipeline } from "./_redis.js";
import {
  MODES, readRoom, parseQuestions, sanitizeQuestions, normalizeCode, tallyRoom, touch,
  roomKey, devicesKey, votesKey, tapsKey,
} from "./_room.js";

// Teacher-only room actions. Body: { code, hostKey, action, ...payload }.
// Every action checks the hostKey minted by room-create, so a student who finds
// this endpoint cannot open votes, switch modes, or pair a tablet.
//
//   setMode    { mode }                      projector | tablet | phones
//   publish    { questions: [{id, prompt, options:[{id,label,color?}]}] }  opens them (merge)
//   sync       { questions: [...] }         opens exactly these and closes every other question
//                                           (the client sends its whole mounted set, serialized)
//   close      { ids: [] }                   closes those questions (votes are kept for the tally)
//   clear                                    forgets all questions and their votes
//   freeze     { frozen: bool }              pauses every phone/tablet ("look up!")
//   pair       { pairing: "42" }             confirms the 2-digit code shown on the tablet
//   unpair                                   forgets the tablet
//   storymash  { open: bool, reset?: bool }  shows/hides Story Mash-Up on joined devices
//   tally                                    { mode, frozen, joined, tabletPaired, questions: {id: {counts, voters, open}} }
//   end                                      deletes the room

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }
  const body = req.body || {};
  const code = normalizeCode(body.code);
  const { hostKey, action } = body;
  if (!code || !hostKey || !action) {
    return res.status(400).json({ error: "code, hostKey and action required" });
  }

  const room = await readRoom(code);
  if (!room) return res.status(404).json({ error: "room_not_found" });
  if (room.hostKey !== hostKey) return res.status(403).json({ error: "not_host" });

  const key = roomKey(code);
  const questions = parseQuestions(room);

  try {
    switch (action) {
      case "setMode": {
        if (!MODES.includes(body.mode)) return res.status(400).json({ error: "bad_mode" });
        await redis("HSET", key, "mode", body.mode);
        await touch(code);
        return res.status(200).json({ ok: true, mode: body.mode });
      }
      case "publish":
      case "sync": {
        const list = body.action === "sync" && Array.isArray(body.questions) && body.questions.length === 0
          ? []
          : sanitizeQuestions(body.questions);
        if (!list) return res.status(400).json({ error: "bad_questions" });
        if (body.action === "sync") {
          const keep = new Set(list.map(q => q.id));
          for (const id of Object.keys(questions)) if (!keep.has(id)) questions[id].open = false;
        }
        for (const q of list) {
          const prev = questions[q.id];
          // Re-publishing the same question keeps its votes; a changed option set resets them.
          const sameOptions = prev && JSON.stringify(prev.options.map(o => o.id)) === JSON.stringify(q.options.map(o => o.id));
          if (prev && !sameOptions) await redisPipeline([["DEL", votesKey(code, q.id)], ["DEL", tapsKey(code, q.id)]]);
          questions[q.id] = { prompt: q.prompt, options: q.options, open: true };
        }
        await redis("HSET", key, "questions", JSON.stringify(questions));
        await touch(code);
        return res.status(200).json({ ok: true, open: list.map(q => q.id) });
      }
      case "close": {
        const ids = Array.isArray(body.ids) ? body.ids : [];
        for (const id of ids) if (questions[id]) questions[id].open = false;
        await redis("HSET", key, "questions", JSON.stringify(questions));
        return res.status(200).json({ ok: true });
      }
      case "clear": {
        const cmds = [["HSET", key, "questions", "{}"]];
        for (const id of Object.keys(questions)) { cmds.push(["DEL", votesKey(code, id)]); cmds.push(["DEL", tapsKey(code, id)]); }
        await redisPipeline(cmds);
        return res.status(200).json({ ok: true });
      }
      case "freeze": {
        await redis("HSET", key, "frozen", body.frozen ? "1" : "0");
        return res.status(200).json({ ok: true, frozen: Boolean(body.frozen) });
      }
      case "pair": {
        let pending = null;
        try { pending = JSON.parse(room.pairing || "null"); } catch { pending = null; }
        const typed = String(body.pairing || "").trim();
        if (!pending || !typed || pending.code !== typed) return res.status(400).json({ error: "wrong_code" });
        if (Date.now() - (pending.at || 0) > 10 * 60 * 1000) return res.status(400).json({ error: "expired_code" });
        await redis("HSET", key, "tablet", pending.deviceId, "pairing", "");
        return res.status(200).json({ ok: true });
      }
      case "unpair": {
        await redis("HSET", key, "tablet", "", "pairing", "");
        return res.status(200).json({ ok: true });
      }
      case "storymash": {
        const fields = ["storymash", body.open ? "1" : "0"];
        if (body.reset) fields.push("character", "", "place", "", "event", "", "character_claimed", "0", "place_claimed", "0", "event_claimed", "0");
        await redis("HSET", key, ...fields);
        await touch(code);
        return res.status(200).json({ ok: true });
      }
      case "tally": {
        const [joinedRaw, tally] = await Promise.all([redis("SCARD", devicesKey(code)), tallyRoom(code, questions)]);
        return res.status(200).json({
          ok: true,
          mode: room.mode,
          frozen: room.frozen === "1",
          tabletPaired: Boolean(room.tablet),
          pendingPairing: Boolean(room.pairing),
          storymash: room.storymash === "1",
          joined: Number(joinedRaw) || 0,
          questions: tally,
        });
      }
      case "end": {
        const cmds = [["DEL", key], ["DEL", devicesKey(code)]];
        for (const id of Object.keys(questions)) { cmds.push(["DEL", votesKey(code, id)]); cmds.push(["DEL", tapsKey(code, id)]); }
        await redisPipeline(cmds);
        return res.status(200).json({ ok: true });
      }
      default:
        return res.status(400).json({ error: "unknown_action" });
    }
  } catch (err) {
    console.error("[room-host] error:", err);
    return res.status(500).json({ error: `Upstash request failed: ${err.message}` });
  }
}
