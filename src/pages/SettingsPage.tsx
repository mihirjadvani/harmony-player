import { useState } from "react";
import { Info, Moon, Volume2, FolderSearch, Loader2, FilePlus, FolderOpen, Trash2, TimerOff, Palette, SlidersHorizontal, Music2 } from "lucide-react";
import { useLibrary } from "@/context/LibraryContext";
import { useSleepTimer } from "@/context/SleepTimerContext";
import { useEqualizer } from "@/context/EqualizerContext";

const TIMER_OPTIONS = [5, 10, 15, 30, 60];

const NeonToggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
      on ? "bg-primary" : "bg-white/10"
    }`}
    style={on ? { boxShadow: "var(--shadow-glow-soft)" } : undefined}
    aria-pressed={on}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-background transition-transform duration-300 ${
        on ? "translate-x-5" : "translate-x-0"
      }`}
      style={on ? { boxShadow: "0 0 8px hsl(var(--primary) / 0.6)" } : undefined}
    />
  </button>
);

type Quality = "Auto" | "High" | "Standard";

const SettingsPage = () => {
  const { songs, isScanning, addFilesFromPC, addFolderFromPC, clearLibrary, isNative, rescan } = useLibrary();
  const { activeMinutes, remainingSeconds, startTimer, cancelTimer } = useSleepTimer();
  const { isEnabled: eqEnabled, toggleEnabled: toggleEq } = useEqualizer();
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [theme, setTheme] = useState<"Dark" | "Auto">("Dark");
  const [quality, setQuality] = useState<Quality>("Auto");

  const totalSize = songs.reduce((acc, s) => acc + s.fileSize, 0);
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatRemaining = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formats = [...new Set(songs.map((s) => s.format))];

  return (
    <div className="flex flex-col h-full px-4 pt-4 overflow-y-auto scrollbar-hide">
      <h1 className="text-2xl font-bold text-foreground mb-5 font-heading">Settings</h1>

      {/* Library section */}
      <div className="glass-card p-2 mb-4">
        <p className="px-2 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-primary/80">Library</p>

        <button
          onClick={addFilesFromPC}
          disabled={isScanning}
          className="w-full flex items-center gap-3 p-3 rounded-xl active:scale-[0.98] transition-transform hover:bg-white/5 disabled:opacity-50"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <FilePlus size={18} className="text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">Add Audio Files</p>
            <p className="text-xs text-muted-foreground">Select individual files</p>
          </div>
        </button>

        <button
          onClick={addFolderFromPC}
          disabled={isScanning}
          className="w-full flex items-center gap-3 p-3 rounded-xl active:scale-[0.98] transition-transform hover:bg-white/5 disabled:opacity-50"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <FolderOpen size={18} className="text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">Add Music Folder</p>
            <p className="text-xs text-muted-foreground">Scan an entire folder</p>
          </div>
        </button>

        {isNative && (
          <button
            onClick={rescan}
            disabled={isScanning}
            className="w-full flex items-center gap-3 p-3 rounded-xl active:scale-[0.98] transition-transform hover:bg-white/5 disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              {isScanning ? <Loader2 size={18} className="text-primary animate-spin" /> : <FolderSearch size={18} className="text-primary" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">{isScanning ? "Scanning..." : "Scan Device Storage"}</p>
              <p className="text-xs text-muted-foreground">Rescan internal storage</p>
            </div>
          </button>
        )}

        <div className="flex items-center gap-3 p-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Volume2 size={18} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Library Stats</p>
            <p className="text-xs text-muted-foreground">
              {songs.length} songs · {formatSize(totalSize)}
              {formats.length > 0 && ` · ${formats.join(", ")}`}
            </p>
          </div>
        </div>

        {songs.length > 0 && (
          <button
            onClick={clearLibrary}
            className="w-full flex items-center gap-3 p-3 rounded-xl active:scale-[0.98] transition-transform hover:bg-destructive/10"
          >
            <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Trash2 size={18} className="text-destructive" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">Clear Library</p>
              <p className="text-xs text-muted-foreground">Remove all loaded songs</p>
            </div>
          </button>
        )}
      </div>

      {/* Appearance */}
      <div className="glass-card p-2 mb-4">
        <p className="px-2 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-primary/80">Appearance</p>
        <div className="flex items-center gap-3 p-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Palette size={18} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Theme</p>
            <p className="text-xs text-muted-foreground">Dark neon by default</p>
          </div>
          <div className="flex p-1 rounded-full glass-card">
            {(["Dark", "Auto"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-3 py-1 text-[11px] font-semibold rounded-full transition-all ${
                  theme === t ? "bg-primary text-primary-foreground neon-glow-soft" : "text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audio */}
      <div className="glass-card p-2 mb-4">
        <p className="px-2 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-primary/80">Audio</p>

        <div className="flex items-center gap-3 p-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <SlidersHorizontal size={18} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Equalizer</p>
            <p className="text-xs text-muted-foreground">{eqEnabled ? "Enabled" : "Disabled"}</p>
          </div>
          <NeonToggle on={eqEnabled} onClick={toggleEq} />
        </div>

        <div className="flex items-center gap-3 p-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Music2 size={18} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Audio Quality</p>
            <p className="text-xs text-muted-foreground">{quality}</p>
          </div>
          <div className="flex p-1 rounded-full glass-card">
            {(["Auto", "High", "Standard"] as const).map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={`px-2.5 py-1 text-[10px] font-semibold rounded-full transition-all ${
                  quality === q ? "bg-primary text-primary-foreground neon-glow-soft" : "text-muted-foreground"
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowTimerPicker(!showTimerPicker)}
          className="w-full flex items-center gap-3 p-3 rounded-xl active:scale-[0.98] transition-transform hover:bg-white/5"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Moon size={18} className="text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">Sleep Timer</p>
            <p className="text-xs text-muted-foreground">
              {activeMinutes ? `${formatRemaining(remainingSeconds)} remaining` : "Off"}
            </p>
          </div>
        </button>

        {showTimerPicker && (
          <div className="p-3 animate-fade-in">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Select Duration</p>
            <div className="grid grid-cols-3 gap-2">
              {TIMER_OPTIONS.map((min) => (
                <button
                  key={min}
                  onClick={() => { startTimer(min); setShowTimerPicker(false); }}
                  className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeMinutes === min
                      ? "bg-primary text-primary-foreground neon-glow-soft"
                      : "glass-card text-secondary-foreground active:scale-95"
                  }`}
                >
                  {min} min
                </button>
              ))}
              {activeMinutes && (
                <button
                  onClick={() => { cancelTimer(); setShowTimerPicker(false); }}
                  className="py-2.5 rounded-xl text-xs font-semibold bg-destructive/15 text-destructive active:scale-95 transition-transform flex items-center justify-center gap-1"
                >
                  <TimerOff size={14} />
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* About */}
      <div className="glass-card p-5 space-y-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0" style={{ boxShadow: "var(--shadow-glow-soft)" }}>
            <Info size={22} className="text-primary" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">Harmony Player</p>
            <p className="text-xs text-muted-foreground">Version 1.0</p>
          </div>
        </div>

        <div className="h-px bg-white/5" />

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Supported Formats</p>
          <div className="flex flex-wrap gap-1.5">
            {["MP3", "WAV", "AAC", "FLAC", "OGG", "M4A", "OPUS", "WebM"].map((f) => (
              <span key={f} className="px-2.5 py-1 text-[11px] font-medium rounded-lg glass-card text-secondary-foreground">
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="h-px bg-white/5" />

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Features</p>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-primary shrink-0" style={{ boxShadow: "0 0 4px hsl(var(--primary))" }} />ID3v2 metadata &amp; embedded album art</li>
            <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-primary shrink-0" style={{ boxShadow: "0 0 4px hsl(var(--primary))" }} />Playlists &amp; favorites</li>
            <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-primary shrink-0" style={{ boxShadow: "0 0 4px hsl(var(--primary))" }} />5-band equalizer with presets</li>
            <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-primary shrink-0" style={{ boxShadow: "0 0 4px hsl(var(--primary))" }} />Background playback &amp; lock-screen controls</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
