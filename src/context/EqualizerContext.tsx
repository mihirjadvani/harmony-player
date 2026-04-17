import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { usePlayer } from "./PlayerContext";

export interface EQPreset {
  name: string;
  gains: number[]; // 5 bands: 60, 230, 910, 3600, 14000 Hz
}

export const EQ_PRESETS: EQPreset[] = [
  { name: "Normal", gains: [0, 0, 0, 0, 0] },
  { name: "Bass Boost", gains: [6, 4, 0, 0, 0] },
  { name: "Rock", gains: [4, 2, -2, 3, 4] },
  { name: "Pop", gains: [2, 3, 0, 3, 2] },
  { name: "Jazz", gains: [3, 2, 2, 3, 4] },
  { name: "Dance", gains: [5, 4, -1, 2, 3] },
  { name: "Flat", gains: [0, 0, 0, 0, 0] },
];

const EQ_FREQUENCIES = [60, 230, 910, 3600, 14000];

interface EqualizerContextType {
  activePreset: string;
  gains: number[];
  setPreset: (name: string) => void;
  setBandGain: (bandIndex: number, gain: number) => void;
  isEnabled: boolean;
  toggleEnabled: () => void;
  frequencies: number[];
}

const EqualizerContext = createContext<EqualizerContextType | null>(null);

export const useEqualizer = () => {
  const ctx = useContext(EqualizerContext);
  if (!ctx) throw new Error("useEqualizer must be used within EqualizerProvider");
  return ctx;
};

const STORAGE_KEY = "soundwave_eq";

export const EqualizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getAudioElement, isPlaying } = usePlayer();
  const [activePreset, setActivePreset] = useState("Normal");
  const [gains, setGains] = useState<number[]>([0, 0, 0, 0, 0]);
  const [isEnabled, setIsEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const connectedAudioRef = useRef<HTMLAudioElement | null>(null);
  const bypassGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { preset, gains: g, enabled } = JSON.parse(raw);
        if (preset) setActivePreset(preset);
        if (g) setGains(g);
        if (enabled !== undefined) setIsEnabled(enabled);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ preset: activePreset, gains, enabled: isEnabled }));
  }, [activePreset, gains, isEnabled]);

  // Connect EQ filters into audio graph (one-time per audio element)
  const connectEQ = useCallback(() => {
    const audioEl = getAudioElement();
    if (!audioEl) return;

    // Create AudioContext lazily
    if (!audioContextRef.current) {
      try {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new Ctx();
      } catch (e) {
        console.error("[EQ] AudioContext failed", e);
        return;
      }
    }
    const ctx = audioContextRef.current;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    // Create MediaElementSource (only once per element)
    if (!sourceRef.current || connectedAudioRef.current !== audioEl) {
      try {
        sourceRef.current = ctx.createMediaElementSource(audioEl);
        connectedAudioRef.current = audioEl;
      } catch (e) {
        // Already connected — fine
        return;
      }

      // Build filter chain
      filtersRef.current = EQ_FREQUENCIES.map((freq, i) => {
        const filter = ctx.createBiquadFilter();
        filter.type = i === 0 ? "lowshelf" : i === EQ_FREQUENCIES.length - 1 ? "highshelf" : "peaking";
        filter.frequency.value = freq;
        filter.gain.value = isEnabled ? gains[i] : 0;
        if (filter.type === "peaking") filter.Q.value = 1;
        return filter;
      });

      const output = ctx.createGain();
      output.gain.value = 1;
      bypassGainRef.current = output;

      let prev: AudioNode = sourceRef.current!;
      filtersRef.current.forEach((f) => {
        prev.connect(f);
        prev = f;
      });
      prev.connect(output);
      output.connect(ctx.destination);
      console.log("[EQ] Audio chain connected with", filtersRef.current.length, "bands");
    }
  }, [getAudioElement, gains, isEnabled]);

  // Try connecting whenever playback starts
  useEffect(() => {
    if (isPlaying) connectEQ();
  }, [isPlaying, connectEQ]);

  // Also try once on mount
  useEffect(() => {
    connectEQ();
  }, [connectEQ]);

  // Apply gain changes in real-time with smooth ramp
  useEffect(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    filtersRef.current.forEach((filter, i) => {
      const target = isEnabled ? gains[i] : 0;
      try {
        filter.gain.cancelScheduledValues(now);
        filter.gain.setTargetAtTime(target, now, 0.02);
      } catch {
        filter.gain.value = target;
      }
    });
  }, [gains, isEnabled]);

  const ensureRunning = useCallback(() => {
    connectEQ();
    const ctx = audioContextRef.current;
    if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
  }, [connectEQ]);

  const setPreset = useCallback((name: string) => {
    const preset = EQ_PRESETS.find((p) => p.name === name);
    if (preset) {
      setActivePreset(name);
      setGains([...preset.gains]);
      ensureRunning();
    }
  }, [ensureRunning]);

  const setBandGain = useCallback((bandIndex: number, gain: number) => {
    setGains((prev) => {
      const next = [...prev];
      next[bandIndex] = gain;
      return next;
    });
    setActivePreset("Custom");
    ensureRunning();
  }, [ensureRunning]);

  const toggleEnabled = useCallback(() => {
    setIsEnabled((prev) => !prev);
    ensureRunning();
  }, [ensureRunning]);

  return (
    <EqualizerContext.Provider
      value={{ activePreset, gains, setPreset, setBandGain, isEnabled, toggleEnabled, frequencies: EQ_FREQUENCIES }}
    >
      {children}
    </EqualizerContext.Provider>
  );
};
