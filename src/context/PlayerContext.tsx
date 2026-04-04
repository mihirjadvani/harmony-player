import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { Song, PlayerState, RepeatMode } from "@/types/music";

interface PlayerContextType extends PlayerState {
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seekTo: (time: number) => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  setCurrentTime: (time: number) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    shuffle: false,
    repeat: "off",
    queue: [],
    queueIndex: -1,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setState((prev) => {
        if (!prev.currentSong || !prev.isPlaying) return prev;
        const next = prev.currentTime + 1;
        if (next >= prev.currentSong.duration) {
          clearInterval(intervalRef.current!);
          return { ...prev, currentTime: 0, isPlaying: false };
        }
        return { ...prev, currentTime: next };
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const playSong = useCallback((song: Song, queue?: Song[]) => {
    const q = queue || [song];
    const idx = q.findIndex((s) => s.id === song.id);
    setState({
      currentSong: song,
      isPlaying: true,
      currentTime: 0,
      shuffle: false,
      repeat: "off",
      queue: q,
      queueIndex: idx >= 0 ? idx : 0,
    });
    stopTimer();
    startTimer();
  }, [startTimer, stopTimer]);

  const togglePlay = useCallback(() => {
    setState((prev) => {
      const next = !prev.isPlaying;
      if (next) startTimer();
      else stopTimer();
      return { ...prev, isPlaying: next };
    });
  }, [startTimer, stopTimer]);

  const getNextIndex = useCallback((prev: PlayerState): number => {
    if (prev.repeat === "one") return prev.queueIndex;
    if (prev.shuffle) {
      let next = Math.floor(Math.random() * prev.queue.length);
      if (next === prev.queueIndex && prev.queue.length > 1) next = (next + 1) % prev.queue.length;
      return next;
    }
    const next = prev.queueIndex + 1;
    if (next >= prev.queue.length) {
      return prev.repeat === "all" ? 0 : prev.queueIndex;
    }
    return next;
  }, []);

  const nextSong = useCallback(() => {
    setState((prev) => {
      const idx = getNextIndex(prev);
      if (idx === prev.queueIndex && prev.repeat !== "one") return prev;
      stopTimer();
      startTimer();
      return {
        ...prev,
        queueIndex: idx,
        currentSong: prev.queue[idx],
        currentTime: 0,
        isPlaying: true,
      };
    });
  }, [getNextIndex, startTimer, stopTimer]);

  const prevSong = useCallback(() => {
    setState((prev) => {
      if (prev.currentTime > 3) {
        return { ...prev, currentTime: 0 };
      }
      const idx = prev.queueIndex - 1;
      if (idx < 0) return { ...prev, currentTime: 0 };
      stopTimer();
      startTimer();
      return {
        ...prev,
        queueIndex: idx,
        currentSong: prev.queue[idx],
        currentTime: 0,
        isPlaying: true,
      };
    });
  }, [startTimer, stopTimer]);

  const seekTo = useCallback((time: number) => {
    setState((prev) => ({ ...prev, currentTime: time }));
  }, []);

  const toggleShuffle = useCallback(() => {
    setState((prev) => ({ ...prev, shuffle: !prev.shuffle }));
  }, []);

  const setRepeatMode = useCallback((mode: RepeatMode) => {
    setState((prev) => ({ ...prev, repeat: mode }));
  }, []);

  const setCurrentTime = useCallback((time: number) => {
    setState((prev) => ({ ...prev, currentTime: time }));
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        playSong,
        togglePlay,
        nextSong,
        prevSong,
        seekTo,
        toggleShuffle,
        setRepeatMode,
        setCurrentTime,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
