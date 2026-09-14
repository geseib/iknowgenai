// Teacher-side room state for the whole lesson. Mounts once in App; sections and
// the presenter bar read it through useRoom(). Polls the tally while a room is live.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RoomContext, createRoom, hostAction, loadRoom, saveRoom, useInterval, TALLY_POLL_MS } from "../data/room";

export default function RoomProvider({ children }) {
  const [room, setRoom] = useState(loadRoom);
  const [tally, setTally] = useState(null);
  const [error, setError] = useState(null);
  const roomRef = useRef(room);
  useEffect(() => { roomRef.current = room; }, [room]);

  const mode = room?.mode || "projector";
  const active = Boolean(room) && mode !== "projector";

  const persist = useCallback((next) => { setRoom(next); saveRoom(next); }, []);

  const start = useCallback(async (wantMode) => {
    setError(null);
    try {
      const data = await createRoom(wantMode);
      persist({ code: data.code, hostKey: data.hostKey, mode: data.mode });
      return data;
    } catch (err) {
      setError(`Could not start a room (${err.message}).`);
      throw err;
    }
  }, [persist]);

  const act = useCallback(async (action, payload) => {
    const r = roomRef.current;
    if (!r) return null;
    try {
      return await hostAction(r, action, payload);
    } catch (err) {
      if (err.status === 404 || err.status === 403) { persist(null); setTally(null); }
      setError(err.message);
      return null;
    }
  }, [persist]);

  const setMode = useCallback(async (next) => {
    const r = roomRef.current;
    if (!r) return;
    const res = await act("setMode", { mode: next });
    if (res?.ok) persist({ ...r, mode: next });
  }, [act, persist]);

  const end = useCallback(async () => {
    await act("end");
    persist(null);
    setTally(null);
  }, [act, persist]);

  // Questions currently mounted on the projector, in mount order. Every change is
  // debounced into ONE "sync" call and calls are chained, so a fast run through
  // several slides can never leave a stale question open on the phones.
  const mountedRef = useRef(new Map());
  const syncTimer = useRef(null);
  const chain = useRef(Promise.resolve());
  const scheduleSync = useCallback(() => {
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      const questions = Array.from(mountedRef.current.values());
      chain.current = chain.current.then(() => act("sync", { questions })).catch(() => {});
    }, 60);
  }, [act]);
  const publish = useCallback((questions) => {
    for (const q of questions) mountedRef.current.set(q.id, q);
    scheduleSync();
  }, [scheduleSync]);
  const close = useCallback((ids) => {
    for (const id of ids) mountedRef.current.delete(id);
    scheduleSync();
  }, [scheduleSync]);
  const freeze = useCallback((frozen) => act("freeze", { frozen }), [act]);
  const refreshTally = useCallback(async () => { const res = await act("tally"); if (res?.ok) setTally(res); }, [act]);
  const resetQuestion = useCallback(async (id) => { await act("resetQuestion", { id }); await refreshTally(); }, [act, refreshTally]);
  const clearVotes = useCallback(async () => { await act("clear"); await refreshTally(); }, [act, refreshTally]);
  const pair = useCallback((pairing) => act("pair", { pairing }), [act]);
  const unpair = useCallback(() => act("unpair"), [act]);
  const storymash = useCallback((open, reset = false) => act("storymash", { open, reset }), [act]);

  // Live tally while the room is doing anything device-side
  useInterval(async () => {
    const res = await act("tally");
    if (res?.ok) setTally(res);
  }, TALLY_POLL_MS, active);

  // If the saved room died on the server (TTL), forget it on first use
  useEffect(() => {
    if (!room) return;
    act("tally").then(res => { if (res?.ok) setTally(res); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.code]);

  const value = useMemo(() => ({
    room, active, mode, tally, error,
    start, setMode, end, publish, close, freeze, pair, unpair, storymash, resetQuestion, clearVotes,
    clearError: () => setError(null),
  }), [room, active, mode, tally, error, start, setMode, end, publish, close, freeze, pair, unpair, storymash, resetQuestion, clearVotes]);

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}
