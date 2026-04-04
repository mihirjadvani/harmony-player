import { Smartphone, Info, Moon, Volume2, RefreshCw, Loader2, FolderSearch } from "lucide-react";
import { useLibrary } from "@/context/LibraryContext";

const SettingsPage = () => {
  const { songs, isScanning, rescan, isNative } = useLibrary();

  const totalSize = songs.reduce((acc, s) => acc + s.fileSize, 0);
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formats = [...new Set(songs.map((s) => s.format))];

  return (
    <div className="flex flex-col h-full px-4 pt-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

      <div className="space-y-2">
        {/* Storage scan */}
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
              {isScanning ? "Scanning..." : "Scan for Music"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isNative
                ? "Rescan internal storage for audio files"
                : "Using demo data (web preview)"}
            </p>
          </div>
          {!isScanning && <RefreshCw size={16} className="text-muted-foreground" />}
        </button>

        {/* Library stats */}
        <div className="flex items-center gap-4 p-4 bg-card rounded-2xl">
          <Smartphone size={20} className="text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Library Stats</p>
            <p className="text-xs text-muted-foreground">
              {songs.length} songs · {formatSize(totalSize)}
              {formats.length > 0 && ` · ${formats.join(", ")}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-card rounded-2xl">
          <Volume2 size={20} className="text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Audio Quality</p>
            <p className="text-xs text-muted-foreground">High quality playback</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-card rounded-2xl">
          <Moon size={20} className="text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Sleep Timer</p>
            <p className="text-xs text-muted-foreground">Off</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-card rounded-2xl">
          <Info size={20} className="text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">About</p>
            <p className="text-xs text-muted-foreground">SoundWave v1.0</p>
          </div>
        </div>
      </div>

      <div className="mt-auto pb-6">
        <p className="text-xs text-muted-foreground text-center">
          SoundWave Music Player<br />
          Built with ❤️ using Capacitor
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
