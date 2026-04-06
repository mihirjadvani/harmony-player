import { useState } from "react";
import { Plus, Music, Trash2, Pencil, Heart } from "lucide-react";
import { usePlaylist } from "@/context/PlaylistContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useLibrary } from "@/context/LibraryContext";
import AlbumArt from "@/components/AlbumArt";
import SongItem from "@/components/SongItem";
import AddSongsToPlaylist from "@/components/AddSongsToPlaylist";
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
  const { playlists, createPlaylist, deletePlaylist, renamePlaylist, removeSongFromPlaylist } = usePlaylist();
  const { favoriteIds } = useFavorites();
  const { songs: allSongs } = useLibrary();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [newName, setNewName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [addSongsOpen, setAddSongsOpen] = useState(false);

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);
  const favoriteSongs = allSongs.filter((s) => favoriteIds.has(s.id));

  const handleCreate = () => {
    if (!newName.trim()) return;
    createPlaylist(newName);
    setNewName("");
    setDialogOpen(false);
  };

  const handleRename = () => {
    if (!renameId || !renameValue.trim()) return;
    renamePlaylist(renameId, renameValue);
    setRenameId(null);
    setRenameValue("");
  };

  // Favorites view
  if (showFavorites) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 pt-4 pb-3">
          <button onClick={() => setShowFavorites(false)} className="text-sm text-primary mb-2">← Back</button>
          <h1 className="text-2xl font-bold text-foreground font-heading">Favorites</h1>
          <p className="text-xs text-muted-foreground">{favoriteSongs.length} songs</p>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide px-1 pb-4">
          {favoriteSongs.map((song, i) => (
            <SongItem key={song.id} song={song} queue={favoriteSongs} index={i} showIndex />
          ))}
          {favoriteSongs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Heart size={48} className="mb-4 opacity-30" />
              <p className="text-sm">No favorite songs yet</p>
              <p className="text-xs mt-1">Tap the heart icon on any song</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Selected playlist detail view
  if (selectedPlaylist) {
    const existingSongIds = new Set(selectedPlaylist.songs.map((s) => s.id));
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 pt-4 pb-3">
          <button onClick={() => setSelectedPlaylistId(null)} className="text-sm text-primary mb-2">← Back</button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground font-heading">{selectedPlaylist.name}</h1>
              <p className="text-xs text-muted-foreground">{selectedPlaylist.songs.length} songs</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setAddSongsOpen(true)}
                className="p-2 rounded-xl bg-primary"
              >
                <Plus size={16} className="text-primary-foreground" />
              </button>
              <button
                onClick={() => {
                  setRenameId(selectedPlaylist.id);
                  setRenameValue(selectedPlaylist.name);
                }}
                className="p-2 rounded-xl bg-secondary"
              >
                <Pencil size={16} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => {
                  deletePlaylist(selectedPlaylist.id);
                  setSelectedPlaylistId(null);
                }}
                className="p-2 rounded-xl bg-secondary"
              >
                <Trash2 size={16} className="text-destructive" />
              </button>
            </div>
          </div>
        </div>

        <Dialog open={!!renameId} onOpenChange={(o) => !o && setRenameId(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground font-heading">Rename Playlist</DialogTitle>
            </DialogHeader>
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="bg-secondary border-none text-foreground"
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
            />
            <Button onClick={handleRename} className="w-full">Rename</Button>
          </DialogContent>
        </Dialog>

        <AddSongsToPlaylist
          playlistId={selectedPlaylist.id}
          playlistName={selectedPlaylist.name}
          existingSongIds={existingSongIds}
          open={addSongsOpen}
          onClose={() => setAddSongsOpen(false)}
        />

        <div className="flex-1 overflow-y-auto scrollbar-hide px-1 pb-4">
          {selectedPlaylist.songs.map((song, i) => (
            <div key={song.id} className="relative group">
              <SongItem song={song} queue={selectedPlaylist.songs} index={i} showIndex />
              <button
                onClick={() => removeSongFromPlaylist(selectedPlaylist.id, song.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={12} className="text-destructive" />
              </button>
            </div>
          ))}
          {selectedPlaylist.songs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Music size={48} className="mb-4 opacity-30" />
              <p className="text-sm">No songs in this playlist</p>
              <p className="text-xs mt-1">Tap + to add songs from your library</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Playlists list view
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground font-heading">Playlists</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg" style={{ boxShadow: "var(--shadow-glow)" }}>
              <Plus size={20} className="text-primary-foreground" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground font-heading">New Playlist</DialogTitle>
            </DialogHeader>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Playlist name"
              className="bg-secondary border-none text-foreground"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Button onClick={handleCreate} className="w-full">Create</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4">
        {/* Favorites card */}
        <button
          onClick={() => setShowFavorites(true)}
          className="w-full flex items-center gap-3 p-3 mb-3 bg-card rounded-2xl active:scale-[0.97] transition-transform"
        >
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Heart size={24} className="text-primary fill-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Favorites</p>
            <p className="text-xs text-muted-foreground">{favoriteSongs.length} songs</p>
          </div>
        </button>

        {playlists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Music size={48} className="mb-4 opacity-20" />
            <p className="text-base font-medium text-foreground mb-1">No playlists yet</p>
            <p className="text-sm text-center px-8">Create a playlist to organize your music</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              className="relative group bg-card rounded-2xl p-3 cursor-pointer active:scale-[0.97] transition-transform"
              onClick={() => setSelectedPlaylistId(pl.id)}
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
