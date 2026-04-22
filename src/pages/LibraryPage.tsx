import { useState, useMemo } from "react";
import { Search, FolderOpen, FilePlus, Loader2, Music, ChevronRight, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import SongItem from "@/components/SongItem";
import { useLibrary } from "@/context/LibraryContext";
import AlbumArt from "@/components/AlbumArt";

type ViewMode = "title" | "artist" | "album";

const LibraryPage = () => {
  const { songs, isScanning, scanProgress, addFilesFromPC, addFolderFromPC } = useLibrary();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("title");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q)
    );
  }, [songs, search]);

  const groups = useMemo(() => {
    if (viewMode === "title") return null;
    const map = new Map<string, typeof filtered>();
    filtered.forEach((song) => {
      const key = viewMode === "artist" ? song.artist : song.album;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(song);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, viewMode]);

  const sortedSongs = useMemo(() => [...filtered].sort((a, b) => a.title.localeCompare(b.title)), [filtered]);

  const groupSongs = useMemo(() => {
    if (!selectedGroup || !groups) return [];
    const entry = groups.find(([name]) => name === selectedGroup);
    return entry ? entry[1] : [];
  }, [selectedGroup, groups]);

  if (selectedGroup && (viewMode === "artist" || viewMode === "album")) {
    const firstSong = groupSongs[0];
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 pt-4 pb-3">
          <button onClick={() => setSelectedGroup(null)} className="flex items-center gap-1 text-sm text-primary mb-3">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3 mb-3">
            <AlbumArt src={firstSong?.albumArt} alt={selectedGroup} size="md" />
            <div>
              <h1 className="text-xl font-bold text-foreground font-heading">{selectedGroup}</h1>
              <p className="text-xs text-muted-foreground">{groupSongs.length} songs</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide px-1 pb-4">
          {groupSongs.map((song, i) => (
            <SongItem key={song.id} song={song} queue={groupSongs} index={i} showIndex />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-2 pb-3">
        <div className="flex items-center justify-between mb-3">
<h4 className="text-3xl font-bold text-white tracking-wide">
  Library
</h4>
          <div className="flex gap-2">
            <button
              onClick={addFilesFromPC}
              disabled={isScanning}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-card text-foreground text-xs font-medium active:scale-95 transition-transform disabled:opacity-50"
            >
              <FilePlus size={16} />
              <span>Files</span>
            </button>
            <button
              onClick={addFolderFromPC}
              disabled={isScanning}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold active:scale-95 transition-transform disabled:opacity-50 neon-glow-soft"
            >
              <FolderOpen size={16} />
              <span>Folder</span>
            </button>
          </div>
        </div>

        {isScanning && scanProgress && (
          <div className="mb-3 p-3 glass-card animate-fade-in">
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
              <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-primary rounded-full transition-all duration-300"
                  style={{ width: `${(scanProgress.current / scanProgress.total) * 100}%`, boxShadow: "0 0 8px hsl(var(--primary) / 0.6)" }}
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
            className="pl-10 glass-card border-0 text-foreground placeholder:text-muted-foreground rounded-xl h-11"
          />
        </div>

        <div className="flex gap-2 mt-3">
          {(["title", "artist", "album"] as const).map((key) => (
            <button
              key={key}
              onClick={() => { setViewMode(key); setSelectedGroup(null); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                viewMode === key
                  ? "bg-primary text-primary-foreground neon-glow-soft"
                  : "glass-card text-secondary-foreground"
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-1">
        <p className="text-xs text-muted-foreground">
          {viewMode === "title"
            ? `${filtered.length} songs`
            : `${groups?.length || 0} ${viewMode === "artist" ? "artists" : "albums"}`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-1 pb-4">
        {viewMode === "title" ? (
          sortedSongs.map((song, i) => (
            <SongItem key={song.id} song={song} queue={sortedSongs} index={i} showIndex />
          ))
        ) : (
          groups?.map(([name, songs]) => (
            <button
              key={name}
              onClick={() => setSelectedGroup(name)}
              className="w-full flex items-center gap-3 px-3 py-2.5 mx-1 my-1 rounded-2xl glass-card active:scale-[0.98] transition-all"
            >
              <AlbumArt src={songs[0]?.albumArt} alt={name} size="sm" />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-foreground truncate">{name}</p>
                <p className="text-xs text-muted-foreground">{songs.length} songs</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))
        )}

        {filtered.length === 0 && !isScanning && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <div className="relative mb-5">
              <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: "hsl(var(--primary) / 0.25)" }} />
              <Music size={56} className="relative opacity-40 text-primary" />
            </div>
            <p className="text-base font-semibold text-foreground mb-1">No songs yet</p>
            <p className="text-sm text-muted-foreground mb-5 text-center px-8">
              Add audio files from your device to start listening
            </p>
            <div className="flex gap-3">
              <button
                onClick={addFilesFromPC}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-foreground text-sm font-medium active:scale-95 transition-transform"
              >
                <FilePlus size={18} />
                Add Files
              </button>
              <button
                onClick={addFolderFromPC}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:scale-95 transition-transform neon-glow-soft"
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
