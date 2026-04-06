import { useEqualizer, EQ_PRESETS } from "@/context/EqualizerContext";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal } from "lucide-react";

const BAND_LABELS = ["Sub-bass", "Bass", "Mid", "Upper Mid", "Treble"];

const EqualizerPage = () => {
  const { activePreset, gains, setPreset, setBandGain, isEnabled, toggleEnabled, frequencies } = useEqualizer();

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

      {/* Presets */}
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

      {/* Band sliders */}
      <div className="flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Frequency Bands</p>
        <div className="flex items-end justify-between gap-2 h-64 px-1">
          {frequencies.map((freq, i) => (
            <div key={freq} className="flex flex-col items-center flex-1 h-full">
              <span className="text-[10px] text-muted-foreground mb-1 font-mono">
                {gains[i] > 0 ? "+" : ""}{gains[i].toFixed(0)}dB
              </span>

              <div className="flex-1 flex items-center justify-center relative w-full">
                <div className="h-full flex items-center" style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}>
                  <Slider
                    value={[gains[i]]}
                    min={-12}
                    max={12}
                    step={1}
                    onValueChange={([val]) => setBandGain(i, val)}
                    className="h-full"
                    disabled={!isEnabled}
                  />
                </div>
              </div>

              <span className="text-[9px] text-primary mt-1 font-bold">{formatFreq(freq)} Hz</span>
              <span className="text-[8px] text-muted-foreground">{BAND_LABELS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 mb-6 p-3 bg-card rounded-xl flex items-center gap-3">
        <SlidersHorizontal size={18} className="text-primary shrink-0" />
        <p className="text-xs text-muted-foreground">
          {isEnabled
            ? `Active preset: ${activePreset}. Adjust bands for custom sound.`
            : "Turn on the equalizer to modify audio output."}
        </p>
      </div>
    </div>
  );
};

export default EqualizerPage;
