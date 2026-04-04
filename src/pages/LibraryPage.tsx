import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import SongItem from "@/components/SongItem";
import { mockSongs } from "@/data/mockSongs";

const LibraryPage = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "artist" | "album">("title");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mockSongs
      .filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.album.toLowerCase().includes(q)
      )
      .sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
  }, [search, sortBy]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-foreground mb-4">Library</h1>
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
        {filtered.length === 0 && (
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
