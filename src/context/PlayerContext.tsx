import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { Song, PlayerState, RepeatMode } from "@/types/music";

interface PlayerContextType extends PlayerState {
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seekTo: (time: number) => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  volume: number;
  setVolume: (v: number) => void;
  getAudioElement: () => HTMLAudioElement | null;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [volume, setVolumeState] = useState<number>(() => {
    if (typeof window === "undefined") return 75;
    const saved = localStorage.getItem("player.volume");
    const n = saved ? parseFloat(saved) : NaN;
    return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 75;
  });

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(100, v));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped / 100;
    try { localStorage.setItem("player.volume", String(clamped)); } catch {}
  }, []);

  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    shuffle: false,
    repeat: "off",
    queue: [],
    queueIndex: -1,
  });

  // Create audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = volume / 100;
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () => {
      setState((prev) => ({ ...prev, currentTime: audio.currentTime }));
    });

    audio.addEventListener("loadedmetadata", () => {
      setState((prev) => ({
        ...prev,
        duration: audio.duration || prev.currentSong?.duration || 0,
      }));
    });

    audio.addEventListener("ended", () => {
      setState((prev) => {
        // Auto-advance logic
        if (prev.repeat === "one") {
          audio.currentTime = 0;
          audio.play();
          return prev;
        }

        let nextIdx: number;
        if (prev.shuffle) {
          nextIdx = Math.floor(Math.random() * prev.queue.length);
          if (nextIdx === prev.queueIndex && prev.queue.length > 1) {
            nextIdx = (nextIdx + 1) % prev.queue.length;
          }
        } else {
          nextIdx = prev.queueIndex + 1;
        }

        if (nextIdx >= prev.queue.length) {
          if (prev.repeat === "all") {
            nextIdx = 0;
          } else {
            return { ...prev, isPlaying: false, currentTime: 0 };
          }
        }

        const nextSong = prev.queue[nextIdx];
        if (nextSong?.audioSrc) {
          audio.src = nextSong.audioSrc;
          audio.play();
        }

        return {
          ...prev,
          currentSong: nextSong,
          queueIndex: nextIdx,
          currentTime: 0,
          isPlaying: true,
        };
      });
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const playSong = useCallback((song: Song, queue?: Song[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const q = queue || [song];
    const idx = q.findIndex((s) => s.id === song.id);

    if (song.audioSrc) {
      audio.src = song.audioSrc;
      audio.play().catch(console.error);
    }

    setState({
      currentSong: song,
      isPlaying: true,
      currentTime: 0,
      duration: song.duration || 0,
      shuffle: false,
      repeat: "off",
      queue: q,
      queueIndex: idx >= 0 ? idx : 0,
    });
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setState((prev) => {
      if (prev.isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(console.error);
      }
      return { ...prev, isPlaying: !prev.isPlaying };
    });
  }, []);

  const playByIndex = useCallback((idx: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    setState((prev) => {
      const song = prev.queue[idx];
      if (!song) return prev;

      if (song.audioSrc) {
        audio.src = song.audioSrc;
        audio.play().catch(console.error);
      }

      return {
        ...prev,
        currentSong: song,
        queueIndex: idx,
        currentTime: 0,
        isPlaying: true,
      };
    });
  }, []);

  const getNextIndex = useCallback((prev: PlayerState): number => {
    if (prev.repeat === "one") return prev.queueIndex;
    if (prev.shuffle) {
      let next = Math.floor(Math.random() * prev.queue.length);
      if (next === prev.queueIndex && prev.queue.length > 1) next = (next + 1) % prev.queue.length;
      return next;
    }
    const next = prev.queueIndex + 1;
    if (next >= prev.queue.length) {
      return prev.repeat === "all" ? 0 : -1;
    }
    return next;
  }, []);

  const nextSong = useCallback(() => {
    setState((prev) => {
      const idx = getNextIndex(prev);
      if (idx < 0) return { ...prev, isPlaying: false, currentTime: 0 };
      return prev; // playByIndex will handle
    });
    // We need to read the state to get the index
    setState((prev) => {
      const idx = getNextIndex(prev);
      if (idx < 0 || idx === prev.queueIndex) return prev;
      const song = prev.queue[idx];
      if (!song) return prev;
      const audio = audioRef.current;
      if (audio && song.audioSrc) {
        audio.src = song.audioSrc;
        audio.play().catch(console.error);
      }
      return { ...prev, currentSong: song, queueIndex: idx, currentTime: 0, isPlaying: true };
    });
  }, [getNextIndex]);

  const prevSong = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setState((prev) => {
      if (prev.currentTime > 3) {
        audio.currentTime = 0;
        return { ...prev, currentTime: 0 };
      }
      const idx = prev.queueIndex - 1;
      if (idx < 0) {
        audio.currentTime = 0;
        return { ...prev, currentTime: 0 };
      }
      const song = prev.queue[idx];
      if (song?.audioSrc) {
        audio.src = song.audioSrc;
        audio.play().catch(console.error);
      }
      return { ...prev, currentSong: song, queueIndex: idx, currentTime: 0, isPlaying: true };
    });
  }, []);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
    }
    setState((prev) => ({ ...prev, currentTime: time }));
  }, []);

  const toggleShuffle = useCallback(() => {
    setState((prev) => ({ ...prev, shuffle: !prev.shuffle }));
  }, []);

  const setRepeatMode = useCallback((mode: RepeatMode) => {
    setState((prev) => ({ ...prev, repeat: mode }));
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
        volume,
        setVolume,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
