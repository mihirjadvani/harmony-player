import { useState, useMemo } from "react";
import { Search, RefreshCw, Loader2, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import SongItem from "@/components/SongItem";
import { useLibrary } from "@/context/LibraryContext";

const LibraryPage = () => {
  const { songs, isScanning, scanProgress, rescan, isNative } = useLibrary();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "artist" | "album">("title");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return songs
      .filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.album.toLowerCase().includes(q)
      )
      .sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
  }, [songs, search, sortBy]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Library</h1>
          <button
            onClick={rescan}
            disabled={isScanning}
            className="p-2 rounded-full bg-secondary text-secondary-foreground active:scale-90 transition-transform disabled:opacity-50"
          >
            {isScanning ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <RefreshCw size={18} />
            )}
          </button>
        </div>

        {/* Scan progress */}
        {isScanning && scanProgress && (
          <div className="mb-3 p-3 bg-card rounded-xl animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 size={14} className="animate-spin text-primary" />
              <span className="text-xs font-medium text-foreground">
                {scanProgress.phase === "scanning"
                  ? "Scanning for audio files..."
                  : `Extracting metadata (${scanProgress.current}/${scanProgress.total})`}
              </span>
            </div>
            {scanProgress.currentFile && (
              <p className="text-xs text-muted-foreground truncate">{scanProgress.currentFile}</p>
            )}
            {scanProgress.total > 0 && (
              <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{
                    width: `${(scanProgress.current / scanProgress.total) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Not native banner */}
        {!isNative && !isScanning && (
          <div className="mb-3 p-3 bg-card rounded-xl flex items-center gap-3">
            <Smartphone size={16} className="text-primary flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Running in browser — showing demo songs. Build with Capacitor to scan real device files.
            </p>
          </div>
        )}

        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search songs, artists, albums..."
            className="pl-10 bg-secondary border-none text-foreground placeholder:text-muted-foreground rounded-xl"
          />
        </div>
        <div className="flex gap-2 mt-3">
          {(["title", "artist", "album"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                sortBy === key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Song count */}
      <div className="px-4 py-2">
        <p className="text-xs text-muted-foreground">{filtered.length} songs</p>
      </div>

      {/* Song List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-1 pb-4">
        {filtered.map((song, i) => (
          <SongItem key={song.id} song={song} queue={filtered} index={i} showIndex />
        ))}
        {filtered.length === 0 && !isScanning && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Search size={48} className="mb-4 opacity-30" />
            <p className="text-sm">No songs found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
