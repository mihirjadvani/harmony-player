import { useState, useMemo, useRef } from "react";
import { Search, FolderOpen, FilePlus, Loader2, Music } from "lucide-react";
import { Input } from "@/components/ui/input";
import SongItem from "@/components/SongItem";
import { useLibrary } from "@/context/LibraryContext";

const LibraryPage = () => {
  const { songs, isScanning, scanProgress, addFilesFromPC, addFolderFromPC } = useLibrary();
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
          <div className="flex gap-2">
            <button
              onClick={addFilesFromPC}
              disabled={isScanning}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium active:scale-95 transition-transform disabled:opacity-50"
              title="Add audio files"
            >
              <FilePlus size={16} />
              <span>Files</span>
            </button>
            <button
              onClick={addFolderFromPC}
              disabled={isScanning}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium active:scale-95 transition-transform disabled:opacity-50"
              title="Add entire folder"
            >
              <FolderOpen size={16} />
              <span>Folder</span>
            </button>
          </div>
        </div>

        {/* Scan / extraction progress */}
        {isScanning && scanProgress && (
          <div className="mb-3 p-3 bg-card rounded-xl animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 size={14} className="animate-spin text-primary" />
              <span className="text-xs font-medium text-foreground">
                {scanProgress.phase === "scanning"
                  ? "Scanning for audio files..."
                  : `Reading metadata (${scanProgress.current}/${scanProgress.total})`}
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
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Music size={56} className="mb-4 opacity-20" />
            <p className="text-base font-medium text-foreground mb-1">No songs yet</p>
            <p className="text-sm text-muted-foreground mb-5 text-center px-8">
              Add audio files from your PC to start listening
            </p>
            <div className="flex gap-3">
              <button
                onClick={addFilesFromPC}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium active:scale-95 transition-transform"
              >
                <FilePlus size={18} />
                Add Files
              </button>
              <button
                onClick={addFolderFromPC}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium active:scale-95 transition-transform"
              >
                <FolderOpen size={18} />
                Add Folder
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
