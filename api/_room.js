// Shared helpers for the lesson room (classroom-response) endpoints.
//
// One room per lesson. Redis layout (all keys carry ROOM_TTL, refreshed on writes):
//   room:{CODE}              hash — mode, hostKey, frozen, tablet, pairing, storymash,
//                                   questions (JSON map id → {prompt, options, open}),
//                                   plus the Story Mash fields (character/place/event + *_claimed)
//   room:{CODE}:devices      set  — anonymous device ids that have joined
//   room:{CODE}:votes:{QID}  hash — deviceId → optionId   (phones mode: one vote per device)
//   room:{CODE}:taps:{QID}   hash — optionId → count      (tablet mode: one tap = one vote)
//
// Teacher actions require the hostKey returned by room-create; it lives only in the
// teacher's browser. Kids only ever hold the room code.

import { redis, redisPipeline } from "./_redis.js";

export const ROOM_TTL = 3 * 60 * 60; // a school lesson, with slack
export const MODES = ["projector", "tablet", "phones"];

// Characters that are easy to read aloud / type on a phone (no O/0/I/1/L)
const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function makeCode(len = 4) {
  let code = "";
  for (let i = 0; i < len; i++) code += CHARS[Math.floor(Math.random() * CHARS.length)];
  return code;
}
export function makeKey(len = 24) {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let k = "";
  for (let i = 0; i < len; i++) k += alphabet[Math.floor(Math.random() * alphabet.length)];
  return k;
}

export const roomKey = (code) => `room:${code}`;
export const devicesKey = (code) => `room:${code}:devices`;
export const votesKey = (code, qid) => `room:${code}:votes:${qid}`;
export const tapsKey = (code, qid) => `room:${code}:taps:${qid}`;

/** Upstash returns HGETALL as a flat [field, value, ...] array; normalize to an object. */
export function toObj(data) {
  if (!data) return null;
  if (Array.isArray(data)) {
    if (data.length === 0) return null;
    const obj = {};
    for (let i = 0; i < data.length; i += 2) obj[data[i]] = data[i + 1];
    return obj;
  }
  return Object.keys(data).length ? data : null;
}

export async function readRoom(code) {
  return toObj(await redis("HGETALL", roomKey(code)));
}

export function parseQuestions(room) {
  try { return JSON.parse(room?.questions || "{}") || {}; } catch { return {}; }
}

export function normalizeCode(raw) {
  return String(raw || "").toUpperCase().trim();
}

/** Validate a client-supplied question list; returns null if malformed. */
export function sanitizeQuestions(list) {
  if (!Array.isArray(list) || list.length === 0 || list.length > 6) return null;
  const out = [];
  for (const q of list) {
    if (!q || typeof q.id !== "string" || !/^[a-z0-9-]{1,40}$/i.test(q.id)) return null;
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 8) return null;
    const options = [];
    for (const o of q.options) {
      if (!o || typeof o.id !== "string" || o.id.length > 40) return null;
      options.push({ id: o.id, label: String(o.label ?? o.id).slice(0, 60), color: typeof o.color === "string" ? o.color.slice(0, 12) : undefined });
    }
    out.push({ id: q.id, prompt: String(q.prompt ?? "").slice(0, 200), options });
  }
  return out;
}

/** Refresh the TTL on the room and its side keys (call after writes). */
export async function touch(code, extraKeys = []) {
  const cmds = [["EXPIRE", roomKey(code), ROOM_TTL], ["EXPIRE", devicesKey(code), ROOM_TTL], ...extraKeys.map(k => ["EXPIRE", k, ROOM_TTL])];
  await redisPipeline(cmds);
}

/** Tally every question in the room: device votes + tablet taps, per option. */
export async function tallyRoom(code, questions) {
  const ids = Object.keys(questions);
  if (ids.length === 0) return {};
  const cmds = [];
  for (const id of ids) { cmds.push(["HGETALL", votesKey(code, id)]); cmds.push(["HGETALL", tapsKey(code, id)]); }
  const results = await redisPipeline(cmds);
  const out = {};
  ids.forEach((id, i) => {
    const votes = toObj(results[i * 2]?.result) || {};
    const taps = toObj(results[i * 2 + 1]?.result) || {};
    const counts = {};
    for (const o of questions[id].options) counts[o.id] = 0;
    for (const opt of Object.values(votes)) if (opt in counts) counts[opt] += 1;
    for (const [opt, n] of Object.entries(taps)) if (opt in counts) counts[opt] += Number(n) || 0;
    out[id] = { counts, voters: Object.keys(votes).length, open: Boolean(questions[id].open) };
  });
  return out;
}
