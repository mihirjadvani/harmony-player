import { useState } from "react";
import {
  Info,
  Moon,
  Volume2,
  FolderSearch,
  Loader2,
  FilePlus,
  FolderOpen,
  Trash2,
  TimerOff,
  Palette,
  SlidersHorizontal,
  Music2,
} from "lucide-react";

import { useLibrary } from "@/context/LibraryContext";
import { useSleepTimer } from "@/context/SleepTimerContext";
import { useEqualizer } from "@/context/EqualizerContext";
import { useTheme } from "@/context/ThemeContext";

const TIMER_OPTIONS = [5, 10, 15, 30, 60];

const NeonToggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
      on ? "bg-primary" : "bg-white/10"
    }`}
    style={on ? { boxShadow: "var(--shadow-glow-soft)" } : undefined}
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
type ThemeType = "Dark" | "Light" | "Auto";

const SettingsPage = () => {
  const { songs, isScanning, addFilesFromPC, addFolderFromPC, clearLibrary, isNative, rescan } = useLibrary();
  const { activeMinutes, remainingSeconds, startTimer, cancelTimer } = useSleepTimer();
  const { isEnabled: eqEnabled, toggleEnabled: toggleEq } = useEqualizer();
  const { theme, setTheme } = useTheme(); // ✅ using global theme

  const [showTimerPicker, setShowTimerPicker] = useState(false);
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
      
      <h1 className="text-2xl font-bold text-foreground mb-5 font-heading">
        Settings
      </h1>

      {/* LIBRARY */}
      <div className="glass-card p-2 mb-4">
        <p className="px-2 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-primary/80">
          Library
        </p>

        <button
          onClick={addFilesFromPC}
          disabled={isScanning}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <FilePlus size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Add Audio Files</p>
            <p className="text-xs text-muted-foreground">Select individual files</p>
          </div>
        </button>

        <button
          onClick={addFolderFromPC}
          disabled={isScanning}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <FolderOpen size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Add Music Folder</p>
            <p className="text-xs text-muted-foreground">Scan entire folder</p>
          </div>
        </button>

        {isNative && (
          <button
            onClick={rescan}
            disabled={isScanning}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              {isScanning ? (
                <Loader2 className="animate-spin text-primary" size={18} />
              ) : (
                <FolderSearch size={18} className="text-primary" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {isScanning ? "Scanning..." : "Scan Device Storage"}
              </p>
            </div>
          </button>
        )}
      </div>

      {/* THEME */}
      <div className="glass-card p-2 mb-4">
        <p className="px-2 pb-2 text-[10px] uppercase tracking-widest text-primary/80">
          Appearance
        </p>

        <div className="flex items-center justify-between p-3">
          <p className="text-sm text-foreground">Theme</p>

          <div className="flex gap-1 p-1 rounded-full glass-card">
            {(["Dark", "Light", "Auto"] as ThemeType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-3 py-1 text-xs rounded-full ${
                  theme === t
                    ? "bg-primary text-primary-foreground neon-glow-soft"
                    : "text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AUDIO */}
      <div className="glass-card p-2 mb-4">
        <p className="px-2 pb-2 text-[10px] uppercase tracking-widest text-primary/80">
          Audio
        </p>

        <div className="flex items-center justify-between p-3">
          <p className="text-sm text-foreground">Equalizer</p>
          <NeonToggle on={eqEnabled} onClick={toggleEq} />
        </div>

        <div className="flex items-center justify-between p-3">
          <p className="text-sm text-foreground">Audio Quality</p>

          <div className="flex gap-1 p-1 rounded-full glass-card">
            {(["Auto", "High", "Standard"] as const).map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={`px-2 py-1 text-xs rounded-full ${
                  quality === q
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
