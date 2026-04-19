import { useState } from "react";
import { useEqualizer, EQ_PRESETS } from "@/context/EqualizerContext";
import { SlidersHorizontal, Plus, Minus } from "lucide-react";

const BAND_LABELS = ["Sub-bass", "Bass", "Mid", "Upper Mid", "Treble"];

const VerticalBand = ({
  label,
  freqLabel,
  gain,
  onChange,
  disabled,
}: {
  label: string;
  freqLabel: string;
  gain: number;
  onChange: (g: number) => void;
  disabled: boolean;
}) => {
  const percent = ((gain + 12) / 24) * 100;

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <span className={`text-[10px] font-mono ${gain !== 0 ? "text-primary" : "text-muted-foreground"}`}
            style={gain !== 0 ? { textShadow: "0 0 6px hsl(var(--primary) / 0.5)" } : undefined}>
        {gain > 0 ? "+" : ""}{gain}dB
      </span>

      <button
        disabled={disabled || gain >= 12}
        onClick={() => onChange(Math.min(12, gain + 1))}
        className="w-7 h-7 rounded-full glass-card flex items-center justify-center text-foreground active:scale-90 transition-transform disabled:opacity-30"
      >
        <Plus size={14} />
      </button>

      <div
        className="relative w-6 rounded-full bg-white/5 overflow-visible border border-white/5"
        style={{ height: 150 }}
        onClick={(e) => {
          if (disabled) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const y = e.clientY - rect.top;
          const ratio = 1 - y / rect.height;
          onChange(Math.max(-12, Math.min(12, Math.round(ratio * 24 - 12))));
        }}
        onTouchMove={(e) => {
          if (disabled) return;
          const touch = e.touches[0];
          const rect = e.currentTarget.getBoundingClientRect();
          const y = touch.clientY - rect.top;
          const ratio = 1 - y / rect.height;
          onChange(Math.max(-12, Math.min(12, Math.round(ratio * 24 - 12))));
        }}
      >
        <div className="absolute w-full h-px bg-muted-foreground/30" style={{ top: "50%" }} />
        <div
          className="absolute bottom-0 w-full rounded-full transition-all duration-150"
          style={{
            height: `${percent}%`,
            background: "var(--gradient-primary)",
            opacity: disabled ? 0.3 : 0.95,
            boxShadow: disabled ? "none" : "0 0 14px hsl(var(--primary) / 0.6)",
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-primary bg-background transition-all duration-150"
          style={{
            bottom: `calc(${percent}% - 10px)`,
            boxShadow: disabled ? "none" : "0 0 12px hsl(var(--primary) / 0.7)",
          }}
        />
      </div>

      <button
        disabled={disabled || gain <= -12}
        onClick={() => onChange(Math.max(-12, gain - 1))}
        className="w-7 h-7 rounded-full glass-card flex items-center justify-center text-foreground active:scale-90 transition-transform disabled:opacity-30"
      >
        <Minus size={14} />
      </button>

      <span className="text-[9px] font-bold text-primary" style={{ textShadow: "0 0 6px hsl(var(--primary) / 0.5)" }}>{freqLabel}</span>
      <span className="text-[8px] text-muted-foreground leading-none">{label}</span>
    </div>
  );
};

const EqualizerPage = () => {
  const { activePreset, gains, setPreset, setBandGain, isEnabled, toggleEnabled, frequencies } = useEqualizer();
  const [mode, setMode] = useState<"presets" | "manual">("presets");

  const formatFreq = (hz: number) => (hz >= 1000 ? `${(hz / 1000).toFixed(hz >= 10000 ? 0 : 1)}k` : `${hz}`);

  return (
    <div className="flex flex-col h-full px-4 pt-4 overflow-y-auto scrollbar-hide">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-foreground font-heading">Equalizer</h1>
        <button
          onClick={toggleEnabled}
          className={`relative px-5 py-2 rounded-full text-xs font-bold transition-all ${
            isEnabled
              ? "bg-primary text-primary-foreground animate-pulse-glow"
              : "glass-card text-muted-foreground"
          }`}
        >
          {isEnabled ? "ON" : "OFF"}
        </button>
      </div>

      {/* Glass container holding everything */}
      <div className="glass-card p-4 mb-4">
        {/* Animated EQ visualization */}
        <div className="flex items-end justify-center gap-1.5 h-16 mb-4">
          {gains.map((g, i) => {
            const height = Math.max(10, ((g + 12) / 24) * 100);
            return (
              <div
                key={i}
                className="w-3 rounded-full transition-all duration-500"
                style={{
                  height: `${height}%`,
                  background: "var(--gradient-primary)",
                  opacity: isEnabled ? 0.9 : 0.3,
                  boxShadow: isEnabled ? "0 0 10px hsl(var(--primary) / 0.6)" : "none",
                  animation: isEnabled ? `eq-bar ${0.7 + i * 0.15}s ease-in-out infinite` : "none",
                  transformOrigin: "bottom",
                }}
              />
            );
          })}
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4 p-1 glass-card">
          {(["presets", "manual"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                mode === m
                  ? "bg-primary text-primary-foreground neon-glow-soft"
                  : "text-muted-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === "presets" ? (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Presets</p>
            <div className="flex flex-wrap gap-2">
              {EQ_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setPreset(preset.name)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                    activePreset === preset.name
                      ? "bg-primary text-primary-foreground neon-glow-soft"
                      : "glass-card text-secondary-foreground"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
              {activePreset === "Custom" && (
                <span className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-accent text-accent-foreground">
                  Custom
                </span>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Manual Adjust</p>
              <button
                onClick={() => { frequencies.forEach((_, i) => setBandGain(i, 0)); setPreset("Normal"); }}
                className="text-[10px] text-primary font-semibold active:scale-95 transition-transform"
              >
                Reset All
              </button>
            </div>
            <div className="flex justify-between gap-1 px-1">
              {frequencies.map((freq, i) => (
                <VerticalBand
                  key={freq}
                  label={BAND_LABELS[i]}
                  freqLabel={`${formatFreq(freq)}Hz`}
                  gain={gains[i]}
                  onChange={(g) => setBandGain(i, g)}
                  disabled={!isEnabled}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mb-6 p-3 glass-card flex items-center gap-3">
        <SlidersHorizontal size={18} className="text-primary shrink-0" style={{ filter: "drop-shadow(0 0 4px hsl(var(--primary) / 0.5))" }} />
        <p className="text-xs text-muted-foreground">
          {isEnabled
            ? `Active preset: ${activePreset}. ${mode === "manual" ? "Tap +/- or drag bars to adjust." : "Select a preset above."}`
            : "Turn on the equalizer to modify audio output."}
        </p>
      </div>
    </div>
  );
};

export default EqualizerPage;
