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
      {/* dB label */}
      <span className="text-[10px] font-mono text-muted-foreground">
        {gain > 0 ? "+" : ""}{gain}dB
      </span>

      {/* + button */}
      <button
        disabled={disabled || gain >= 12}
        onClick={() => onChange(Math.min(12, gain + 1))}
        className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-foreground active:scale-90 transition-transform disabled:opacity-30"
      >
        <Plus size={14} />
      </button>

      {/* Vertical bar track */}
      <div
        className="relative w-5 rounded-full bg-secondary overflow-hidden"
        style={{ height: 140 }}
        onClick={(e) => {
          if (disabled) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const y = e.clientY - rect.top;
          const ratio = 1 - y / rect.height;
          const newGain = Math.round(ratio * 24 - 12);
          onChange(Math.max(-12, Math.min(12, newGain)));
        }}
        onTouchMove={(e) => {
          if (disabled) return;
          const touch = e.touches[0];
          const rect = e.currentTarget.getBoundingClientRect();
          const y = touch.clientY - rect.top;
          const ratio = 1 - y / rect.height;
          const newGain = Math.round(ratio * 24 - 12);
          onChange(Math.max(-12, Math.min(12, newGain)));
        }}
      >
        {/* Zero line */}
        <div className="absolute w-full h-px bg-muted-foreground/30" style={{ top: "50%" }} />
        {/* Fill */}
        <div
          className="absolute bottom-0 w-full rounded-full transition-all duration-150"
          style={{
            height: `${percent}%`,
            background: "var(--gradient-primary)",
            opacity: disabled ? 0.3 : 0.8,
          }}
        />
        {/* Thumb indicator */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-primary bg-background shadow-md transition-all duration-150"
          style={{ bottom: `calc(${percent}% - 8px)` }}
        />
      </div>

      {/* - button */}
      <button
        disabled={disabled || gain <= -12}
        onClick={() => onChange(Math.max(-12, gain - 1))}
        className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-foreground active:scale-90 transition-transform disabled:opacity-30"
      >
        <Minus size={14} />
      </button>

      {/* Frequency */}
      <span className="text-[9px] font-bold text-primary">{freqLabel}</span>
      <span className="text-[8px] text-muted-foreground leading-none">{label}</span>
    </div>
  );
};

const EqualizerPage = () => {
  const { activePreset, gains, setPreset, setBandGain, isEnabled, toggleEnabled, frequencies } = useEqualizer();
  const [mode, setMode] = useState<"presets" | "manual">("presets");

  const formatFreq = (hz: number) => (hz >= 1000 ? `${(hz / 1000).toFixed(hz >= 10000 ? 0 : 1)}k` : `${hz}`);

  return (
    <div className="flex flex-col h-full px-4 pt-6 overflow-y-auto scrollbar-hide">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground font-heading">Equalizer</h1>
        <button
          onClick={toggleEnabled}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            isEnabled
              ? "bg-primary text-primary-foreground shadow-lg"
              : "bg-secondary text-muted-foreground"
          }`}
          style={isEnabled ? { boxShadow: "var(--shadow-glow)" } : {}}
        >
          {isEnabled ? "ON" : "OFF"}
        </button>
      </div>

      {/* Animated EQ bars visualization */}
      {isEnabled && (
        <div className="flex items-end justify-center gap-1 h-12 mb-6">
          {gains.map((g, i) => {
            const height = Math.max(8, ((g + 12) / 24) * 100);
            return (
              <div
                key={i}
                className="w-3 rounded-full transition-all duration-300"
                style={{
                  height: `${height}%`,
                  background: "var(--gradient-primary)",
                  opacity: 0.6 + (height / 100) * 0.4,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        {(["presets", "manual"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              mode === m
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground"
            }`}
            style={mode === m ? { boxShadow: "var(--shadow-glow)" } : {}}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === "presets" ? (
        <div className="mb-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Presets</p>
          <div className="flex flex-wrap gap-2">
            {EQ_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setPreset(preset.name)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                  activePreset === preset.name
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-secondary-foreground"
                }`}
                style={activePreset === preset.name ? { boxShadow: "var(--shadow-glow)" } : {}}
              >
                {preset.name}
              </button>
            ))}
            {activePreset === "Custom" && (
              <span className="px-3.5 py-2 rounded-xl text-xs font-medium bg-accent text-accent-foreground shadow-md">
                Custom
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Manual Adjust</p>
            <button
              onClick={() => {
                frequencies.forEach((_, i) => setBandGain(i, 0));
                setPreset("Normal");
              }}
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

      <div className="mt-4 mb-6 p-3 bg-card rounded-xl flex items-center gap-3">
        <SlidersHorizontal size={18} className="text-primary shrink-0" />
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
