import { useEqualizer, EQ_PRESETS } from "@/context/EqualizerContext";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal } from "lucide-react";

const EqualizerPage = () => {
  const { activePreset, gains, setPreset, setBandGain, isEnabled, toggleEnabled, frequencies } = useEqualizer();

  const formatFreq = (hz: number) => (hz >= 1000 ? `${(hz / 1000).toFixed(hz >= 10000 ? 0 : 1)}k` : `${hz}`);

  return (
    <div className="flex flex-col h-full px-4 pt-6 overflow-y-auto scrollbar-hide">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Equalizer</h1>
        <button
          onClick={toggleEnabled}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
            isEnabled ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}
        >
          {isEnabled ? "ON" : "OFF"}
        </button>
      </div>

      {/* Presets */}
      <div className="mb-8">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Presets</p>
        <div className="flex flex-wrap gap-2">
          {EQ_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setPreset(preset.name)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                activePreset === preset.name
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {preset.name}
            </button>
          ))}
          {activePreset === "Custom" && (
            <span className="px-4 py-2 rounded-xl text-sm font-medium bg-accent text-accent-foreground">
              Custom
            </span>
          )}
        </div>
      </div>

      {/* Band sliders */}
      <div className="flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Frequency Bands</p>
        <div className="flex items-end justify-between gap-3 h-64 px-2">
          {frequencies.map((freq, i) => (
            <div key={freq} className="flex flex-col items-center flex-1 h-full">
              {/* Gain label */}
              <span className="text-xs text-muted-foreground mb-2 font-mono">
                {gains[i] > 0 ? "+" : ""}{gains[i].toFixed(0)}
              </span>

              {/* Vertical slider container */}
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

              {/* Frequency label */}
              <span className="text-[10px] text-muted-foreground mt-2 font-medium">{formatFreq(freq)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 mb-6 p-3 bg-card rounded-xl flex items-center gap-3">
        <SlidersHorizontal size={18} className="text-primary shrink-0" />
        <p className="text-xs text-muted-foreground">
          {isEnabled
            ? "Equalizer is active. Adjust frequency bands or select a preset."
            : "Turn on the equalizer to modify audio output."}
        </p>
      </div>
    </div>
  );
};

export default EqualizerPage;
