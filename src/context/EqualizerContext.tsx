import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

export interface EQPreset {
  name: string;
  gains: number[]; // 5 bands: 60, 230, 910, 3600, 14000 Hz
}

export const EQ_PRESETS: EQPreset[] = [
  { name: "Normal", gains: [0, 0, 0, 0, 0] },
  { name: "Bass Boost", gains: [6, 4, 0, 0, 0] },
  { name: "Rock", gains: [4, 2, -1, 3, 4] },
  { name: "Pop", gains: [-1, 2, 4, 2, -1] },
  { name: "Jazz", gains: [3, 1, -1, 1, 3] },
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
  const [activePreset, setActivePreset] = useState("Normal");
  const [gains, setGains] = useState<number[]>([0, 0, 0, 0, 0]);
  const [isEnabled, setIsEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const connectedAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load saved state
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

  // Save state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ preset: activePreset, gains, enabled: isEnabled }));
  }, [activePreset, gains, isEnabled]);

  // Connect to audio element and apply EQ
  useEffect(() => {
    const connectToAudio = () => {
      const audioEl = document.querySelector("audio") as HTMLAudioElement | null;
      // Also try to find the Audio() element via the global ref
      if (!audioEl && !connectedAudioRef.current) return;
      
      const target = audioEl || connectedAudioRef.current;
      if (!target) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;

      if (!sourceRef.current || connectedAudioRef.current !== target) {
        try {
          sourceRef.current = ctx.createMediaElementSource(target);
          connectedAudioRef.current = target;
        } catch {
          // Already connected
        }
      }

      if (filtersRef.current.length === 0) {
        filtersRef.current = EQ_FREQUENCIES.map((freq, i) => {
          const filter = ctx.createBiquadFilter();
          filter.type = i === 0 ? "lowshelf" : i === EQ_FREQUENCIES.length - 1 ? "highshelf" : "peaking";
          filter.frequency.value = freq;
          filter.gain.value = gains[i];
          if (filter.type === "peaking") filter.Q.value = 1;
          return filter;
        });

        // Chain: source -> filters -> destination
        let prev: AudioNode = sourceRef.current!;
        filtersRef.current.forEach((f) => {
          prev.connect(f);
          prev = f;
        });
        prev.connect(ctx.destination);
      }
    };

    // Try connecting periodically since Audio element is created dynamically
    const interval = setInterval(connectToAudio, 1000);
    connectToAudio();
    return () => clearInterval(interval);
  }, []);

  // Update filter gains
  useEffect(() => {
    filtersRef.current.forEach((filter, i) => {
      filter.gain.value = isEnabled ? gains[i] : 0;
    });
  }, [gains, isEnabled]);

  const setPreset = useCallback((name: string) => {
    const preset = EQ_PRESETS.find((p) => p.name === name);
    if (preset) {
      setActivePreset(name);
      setGains([...preset.gains]);
    }
  }, []);

  const setBandGain = useCallback((bandIndex: number, gain: number) => {
    setGains((prev) => {
      const next = [...prev];
      next[bandIndex] = gain;
      return next;
    });
    setActivePreset("Custom");
  }, []);

  const toggleEnabled = useCallback(() => {
    setIsEnabled((prev) => !prev);
  }, []);

  return (
    <EqualizerContext.Provider
      value={{ activePreset, gains, setPreset, setBandGain, isEnabled, toggleEnabled, frequencies: EQ_FREQUENCIES }}
    >
      {children}
    </EqualizerContext.Provider>
  );
};
