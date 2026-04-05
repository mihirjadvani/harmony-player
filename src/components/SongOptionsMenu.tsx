import { useState } from "react";
import { Song } from "@/types/music";
import { usePlaylist } from "@/context/PlaylistContext";
import { useFavorites } from "@/context/FavoritesContext";
import { Heart, ListPlus, Plus, Info, X, Music, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface SongOptionsMenuProps {
  song: Song;
  open: boolean;
  onClose: () => void;
}

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const SongOptionsMenu = ({ song, open, onClose }: SongOptionsMenuProps) => {
  const { playlists, createPlaylist, addSongToPlaylist } = usePlaylist();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [view, setView] = useState<"menu" | "playlist" | "details">("menu");
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const liked = isFavorite(song.id);

  const handleAddToPlaylist = (playlistId: string, playlistName: string) => {
    addSongToPlaylist(playlistId, song);
    toast({ title: "Added to playlist", description: `"${song.title}" added to ${playlistName}` });
    onClose();
    setView("menu");
  };

  const handleCreateAndAdd = () => {
    if (!newPlaylistName.trim()) return;
    const pl = createPlaylist(newPlaylistName);
    addSongToPlaylist(pl.id, song);
    toast({ title: "Playlist created", description: `"${song.title}" added to ${pl.name}` });
    setNewPlaylistName("");
    onClose();
    setView("menu");
  };

  const handleFavorite = () => {
    toggleFavorite(song.id);
    toast({
      title: liked ? "Removed from Favorites" : "Added to Favorites",
      description: song.title,
    });
    onClose();
    setView("menu");
  };

  const handleClose = () => {
    onClose();
    setView("menu");
    setNewPlaylistName("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-card border-border max-w-[340px] rounded-2xl p-0 overflow-hidden">
        {view === "menu" && (
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                {song.albumArt ? (
                  <img src={song.albumArt} alt={song.title} className="w-full h-full object-cover" />
                ) : (
                  <Music size={20} className="text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{song.title}</p>
                <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
              </div>
            </div>

            <div className="space-y-1">
              <button
                onClick={handleFavorite}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/50 active:scale-[0.98] transition-all"
              >
                <Heart size={18} className={liked ? "fill-primary text-primary" : "text-muted-foreground"} />
                <span className="text-sm text-foreground">{liked ? "Remove from Favorites" : "Add to Favorites"}</span>
              </button>
              <button
                onClick={() => setView("playlist")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/50 active:scale-[0.98] transition-all"
              >
                <ListPlus size={18} className="text-muted-foreground" />
                <span className="text-sm text-foreground">Add to Playlist</span>
              </button>
              <button
                onClick={() => setView("details")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/50 active:scale-[0.98] transition-all"
              >
                <Info size={18} className="text-muted-foreground" />
                <span className="text-sm text-foreground">Song Details</span>
              </button>
            </div>
          </div>
        )}

        {view === "playlist" && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setView("menu")} className="text-sm text-primary">← Back</button>
              <p className="text-sm font-semibold text-foreground">Add to Playlist</p>
              <div className="w-10" />
            </div>

            {/* Create new */}
            <div className="flex gap-2 mb-3">
              <Input
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="New playlist name"
                className="bg-secondary border-none text-foreground text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleCreateAndAdd()}
              />
              <Button onClick={handleCreateAndAdd} size="sm" className="shrink-0">
                <Plus size={16} />
              </Button>
            </div>

            {/* Existing playlists */}
            <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-hide">
              {playlists.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No playlists yet</p>
              )}
              {playlists.map((pl) => {
                const alreadyIn = pl.songs.some((s) => s.id === song.id);
                return (
                  <button
                    key={pl.id}
                    onClick={() => !alreadyIn && handleAddToPlaylist(pl.id, pl.name)}
                    disabled={alreadyIn}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      alreadyIn ? "opacity-50" : "hover:bg-secondary/50 active:scale-[0.98]"
                    }`}
                  >
                    <ListPlus size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground flex-1 text-left truncate">{pl.name}</span>
                    {alreadyIn && <Check size={14} className="text-primary" />}
                    <span className="text-xs text-muted-foreground">{pl.songs.length}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {view === "details" && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setView("menu")} className="text-sm text-primary">← Back</button>
              <p className="text-sm font-semibold text-foreground">Song Details</p>
              <div className="w-10" />
            </div>
            <div className="space-y-3 text-sm">
              {[
                ["Title", song.title],
                ["Artist", song.artist],
                ["Album", song.album],
                ["Genre", song.genre || "—"],
                ["Duration", formatDuration(song.duration)],
                ["Format", song.format.toUpperCase()],
                ["File Size", formatSize(song.fileSize)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-foreground font-medium truncate ml-4 max-w-[180px] text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SongOptionsMenu;
