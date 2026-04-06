import { useState, useMemo } from "react";
import { Song } from "@/types/music";
import { useLibrary } from "@/context/LibraryContext";
import { usePlaylist } from "@/context/PlaylistContext";
import { Check, Music, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AlbumArt from "./AlbumArt";
import { toast } from "@/hooks/use-toast";

interface AddSongsToPlaylistProps {
  playlistId: string;
  playlistName: string;
  existingSongIds: Set<string>;
  open: boolean;
  onClose: () => void;
}

const AddSongsToPlaylist = ({ playlistId, playlistName, existingSongIds, open, onClose }: AddSongsToPlaylistProps) => {
  const { songs } = useLibrary();
  const { addSongToPlaylist } = usePlaylist();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return songs.filter(
      (s) =>
        !existingSongIds.has(s.id) &&
        (s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q))
    );
  }, [songs, search, existingSongIds]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    selected.forEach((id) => {
      const song = songs.find((s) => s.id === id);
      if (song) addSongToPlaylist(playlistId, song);
    });
    toast({
      title: "Songs added",
      description: `${selected.size} song${selected.size !== 1 ? "s" : ""} added to ${playlistName}`,
    });
    setSelected(new Set());
    setSearch("");
    onClose();
  };

  const handleClose = () => {
    setSelected(new Set());
    setSearch("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-card border-border max-w-[380px] rounded-2xl p-0 max-h-[80vh] flex flex-col">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-foreground font-heading">Add Songs</DialogTitle>
        </DialogHeader>

        <div className="px-4 py-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search songs..."
              className="pl-9 bg-secondary border-none text-foreground text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-2 min-h-0">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <Music size={36} className="mb-3 opacity-30" />
              <p className="text-sm">No songs available</p>
            </div>
          )}
          {filtered.map((song) => {
            const isSelected = selected.has(song.id);
            return (
              <button
                key={song.id}
                onClick={() => toggleSelect(song.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-[0.98] ${
                  isSelected ? "bg-primary/10" : "hover:bg-secondary/50"
                }`}
              >
                <AlbumArt src={song.albumArt} alt={song.title} size="sm" />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-foreground truncate">{song.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                  }`}
                >
                  {isSelected && <Check size={12} className="text-primary-foreground" />}
                </div>
              </button>
            );
          })}
        </div>

        {selected.size > 0 && (
          <div className="p-4 border-t border-border">
            <Button onClick={handleAdd} className="w-full">
              Add {selected.size} Song{selected.size !== 1 ? "s" : ""}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddSongsToPlaylist;
