import { useState } from "react";
import { Info, Moon, Volume2, FolderSearch, Loader2, FilePlus, FolderOpen, Trash2, TimerOff } from "lucide-react";
import { useLibrary } from "@/context/LibraryContext";
import { useSleepTimer } from "@/context/SleepTimerContext";

const TIMER_OPTIONS = [5, 10, 15, 30, 60];

const SettingsPage = () => {
  const { songs, isScanning, addFilesFromPC, addFolderFromPC, clearLibrary, isNative, rescan } = useLibrary();
  const { activeMinutes, remainingSeconds, startTimer, cancelTimer } = useSleepTimer();
  const [showTimerPicker, setShowTimerPicker] = useState(false);

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
      <h1 className="text-2xl font-bold text-foreground mb-6 font-heading">Settings</h1>

      <div className="space-y-2">
        <button
          onClick={addFilesFromPC}
          disabled={isScanning}
          className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          <FilePlus size={20} className="text-primary" />
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">Add Audio Files</p>
            <p className="text-xs text-muted-foreground">Select individual files from your PC</p>
          </div>
        </button>

        <button
          onClick={addFolderFromPC}
          disabled={isScanning}
          className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          <FolderOpen size={20} className="text-primary" />
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">Add Music Folder</p>
            <p className="text-xs text-muted-foreground">Scan an entire folder for audio files</p>
          </div>
        </button>

        {isNative && (
          <button
            onClick={rescan}
            disabled={isScanning}
            className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {isScanning ? (
              <Loader2 size={20} className="text-primary animate-spin" />
            ) : (
              <FolderSearch size={20} className="text-primary" />
            )}
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">
                {isScanning ? "Scanning..." : "Scan Device Storage"}
              </p>
              <p className="text-xs text-muted-foreground">Rescan internal storage for audio files</p>
            </div>
          </button>
        )}

        <div className="flex items-center gap-4 p-4 bg-card rounded-2xl">
          <Volume2 size={20} className="text-primary" />
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
            className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl active:scale-[0.98] transition-transform"
          >
            <Trash2 size={20} className="text-destructive" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">Clear Library</p>
              <p className="text-xs text-muted-foreground">Remove all loaded songs</p>
            </div>
          </button>
        )}

        <button
          onClick={() => setShowTimerPicker(!showTimerPicker)}
          className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl active:scale-[0.98] transition-transform"
        >
          <Moon size={20} className="text-primary" />
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">Sleep Timer</p>
            <p className="text-xs text-muted-foreground">
              {activeMinutes ? `${formatRemaining(remainingSeconds)} remaining` : "Off"}
            </p>
          </div>
        </button>

        {showTimerPicker && (
          <div className="bg-card rounded-2xl p-4 animate-fade-in space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Select Duration</p>
            <div className="grid grid-cols-3 gap-2">
              {TIMER_OPTIONS.map((min) => (
                <button
                  key={min}
                  onClick={() => {
                    startTimer(min);
                    setShowTimerPicker(false);
                  }}
                  className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                    activeMinutes === min
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground active:scale-95"
                  }`}
                >
                  {min} min
                </button>
              ))}
              {activeMinutes && (
                <button
                  onClick={() => {
                    cancelTimer();
                    setShowTimerPicker(false);
                  }}
                  className="py-3 rounded-xl text-sm font-medium bg-destructive/10 text-destructive active:scale-95 transition-transform flex items-center justify-center gap-1"
                >
                  <TimerOff size={14} />
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 p-4 bg-card rounded-2xl">
          <Info size={20} className="text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">About</p>
            <p className="text-xs text-muted-foreground font-heading">Harmony Player v1.0</p>
          </div>
        </div>
      </div>

      <div className="mt-auto py-6">
        <p className="text-xs text-muted-foreground text-center">
          <span className="font-heading">Harmony Player</span><br />
          Built with ❤️
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
