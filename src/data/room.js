// Lesson room — client library, React context and hooks.
//
// The teacher's browser holds { code, hostKey, mode }; kids' browsers hold only an
// anonymous deviceId. See api/_room.js for the server layout and the rules
// (one vote per phone while a question is open; tablet taps count individually;
// projector mode needs no room at all).

import { createContext, useContext, useEffect, useRef } from "react";

const ROOM_KEY = "iknowgenai_room";
const DEVICE_KEY = "iknowgenai_device";
export const TALLY_POLL_MS = 2000;
export const STATUS_POLL_MS = 2000;

/* ── persistence ─────────────────────────────────────────────────────── */

export function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40);
      if (id.length < 8) id = id.padEnd(8, "x");
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return "anon-" + Math.random().toString(36).slice(2, 12);
  }
}

export function loadRoom() {
  try {
    const r = JSON.parse(localStorage.getItem(ROOM_KEY) || "null");
    return r && r.code && r.hostKey ? r : null;
  } catch { return null; }
}
export function saveRoom(room) {
  try { room ? localStorage.setItem(ROOM_KEY, JSON.stringify(room)) : localStorage.removeItem(ROOM_KEY); } catch { /* ignore */ }
}

export function buildJoinUrl(code) {
  return `${window.location.origin}${window.location.pathname}?join=${code}`;
}

/* ── fetch wrappers ──────────────────────────────────────────────────── */

async function post(url, body) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  let data = null;
  try { data = await res.json(); } catch { /* empty */ }
  if (!res.ok) {
    const err = new Error(data?.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.code = data?.error;
    throw err;
  }
  return data;
}

export const createRoom = (mode) => post("/api/room-create", { mode });
export const hostAction = (room, action, payload = {}) => post("/api/room-host", { code: room.code, hostKey: room.hostKey, action, ...payload });
export const deviceAction = (code, action, payload = {}) => post("/api/room-device", { code, deviceId: getDeviceId(), action, ...payload });
export async function getStatus(code, withDevice = false) {
  const q = withDevice ? `&deviceId=${encodeURIComponent(getDeviceId())}` : "";
  const res = await fetch(`/api/room-status?code=${encodeURIComponent(code)}${q}`);
  if (!res.ok) { const err = new Error("room_not_found"); err.status = res.status; throw err; }
  return res.json();
}

/* ── context ─────────────────────────────────────────────────────────── */

export const RoomContext = createContext(null);

/** Teacher-side room handle. `null` context (no provider) behaves like projector mode. */
export function useRoom() {
  return useContext(RoomContext) || INERT_ROOM;
}

const noop = async () => {};
const INERT_ROOM = {
  room: null, active: false, mode: "projector", tally: null, error: null,
  start: noop, setMode: noop, end: noop, publish: noop, close: noop, freeze: noop, pair: noop, unpair: noop, storymash: noop,
};

/**
 * Bind a tally to the room: publishes `questions` (auto-open) while `active`, closes
 * them when `active` turns false or on unmount, and returns the room's counts per
 * question id as arrays aligned with each question's options. With no room (or in
 * projector mode) it returns zeros and does nothing.
 */
export function useRoomVotes(questions, active = true) {
  const { room, active: roomActive, publish, close, tally } = useRoom();
  const ids = questions.map(q => q.id).join("|");
  const optionSig = questions.map(q => q.options.map(o => o.id).join(",")).join("|");
  const questionsRef = useRef(questions);
  useEffect(() => { questionsRef.current = questions; });

  useEffect(() => {
    if (!room || !roomActive || !active) return;
    const qs = questionsRef.current;
    if (qs.length === 0) return;
    publish(qs);
    return () => { close(qs.map(q => q.id)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.code, roomActive, active, ids, optionSig]);

  const counts = {};
  for (const q of questions) {
    const t = tally?.questions?.[q.id];
    counts[q.id] = q.options.map(o => (t ? t.counts?.[o.id] || 0 : 0));
  }
  return { counts, joined: tally?.joined || 0, live: Boolean(room && roomActive) };
}

/**
 * Merge a manual tally handle (useTally) with room counts so the projector shows
 * hands-up taps AND phone/tablet votes in one set of bars.
 */
export function mergeTally(tally, roomCounts) {
  if (!roomCounts) return tally;
  const counts = tally.counts.map((v, i) => v + (roomCounts[i] || 0));
  const total = counts.reduce((a, b) => a + b, 0);
  let best = -1, leader = null, tie = false;
  counts.forEach((v, i) => {
    if (v > best) { best = v; leader = i; tie = false; }
    else if (v === best && v > 0) tie = true;
  });
  return { ...tally, counts, total, leader: best > 0 && !tie ? leader : null, roomTotal: roomCounts.reduce((a, b) => a + b, 0) };
}

/* ── polling helper (used by the provider and the student view) ──────── */

export function useInterval(fn, ms, enabled) {
  const fnRef = useRef(fn);
  useEffect(() => { fnRef.current = fn; });
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const tick = async () => { if (!cancelled) await fnRef.current(); };
    tick();
    const id = setInterval(tick, ms);
    return () => { cancelled = true; clearInterval(id); };
  }, [ms, enabled]);
}

