import { useState } from "react";
import { Plus, Music, Trash2 } from "lucide-react";
import { Playlist } from "@/types/music";
import { mockSongs } from "@/data/mockSongs";
import AlbumArt from "@/components/AlbumArt";
import SongItem from "@/components/SongItem";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([
    {
      id: "fav",
      name: "Favorites",
      songs: mockSongs.slice(0, 4),
      createdAt: new Date(),
    },
    {
      id: "chill",
      name: "Chill Vibes",
      songs: mockSongs.slice(3, 7),
      createdAt: new Date(),
    },
    {
      id: "recent",
      name: "Recently Played",
      songs: mockSongs.slice(5, 10),
      createdAt: new Date(),
    },
  ]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [newName, setNewName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const createPlaylist = () => {
    if (!newName.trim()) return;
    const pl: Playlist = {
      id: Date.now().toString(),
      name: newName.trim(),
      songs: [],
      createdAt: new Date(),
    };
    setPlaylists((prev) => [...prev, pl]);
    setNewName("");
    setDialogOpen(false);
  };

  const deletePlaylist = (id: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
    if (selectedPlaylist?.id === id) setSelectedPlaylist(null);
  };

  if (selectedPlaylist) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 pt-6 pb-3">
          <button onClick={() => setSelectedPlaylist(null)} className="text-sm text-primary mb-2">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-foreground">{selectedPlaylist.name}</h1>
          <p className="text-xs text-muted-foreground">{selectedPlaylist.songs.length} songs</p>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide px-1 pb-4">
          {selectedPlaylist.songs.map((song, i) => (
            <SongItem key={song.id} song={song} queue={selectedPlaylist.songs} index={i} showIndex />
          ))}
          {selectedPlaylist.songs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Music size={48} className="mb-4 opacity-30" />
              <p className="text-sm">No songs in this playlist</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-6 pb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Playlists</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Plus size={20} className="text-primary-foreground" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">New Playlist</DialogTitle>
            </DialogHeader>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Playlist name"
              className="bg-secondary border-none text-foreground"
              onKeyDown={(e) => e.key === "Enter" && createPlaylist()}
            />
            <Button onClick={createPlaylist} className="w-full">Create</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              className="relative group bg-card rounded-2xl p-3 cursor-pointer active:scale-[0.97] transition-transform"
              onClick={() => setSelectedPlaylist(pl)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletePlaylist(pl.id);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <Trash2 size={14} className="text-destructive" />
              </button>
              <div className="grid grid-cols-2 gap-1 mb-3 rounded-xl overflow-hidden">
                {pl.songs.slice(0, 4).map((s, i) => (
                  <AlbumArt key={`${s.id}-${i}`} src={s.albumArt} alt={s.title} size="sm" className="w-full h-auto aspect-square rounded-none" />
                ))}
                {Array.from({ length: Math.max(0, 4 - pl.songs.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square bg-secondary flex items-center justify-center">
                    <Music size={14} className="text-muted-foreground" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-semibold text-foreground truncate">{pl.name}</p>
              <p className="text-xs text-muted-foreground">{pl.songs.length} songs</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaylistsPage;
