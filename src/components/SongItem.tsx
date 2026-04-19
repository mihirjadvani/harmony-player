import { useState } from "react";
import { Song } from "@/types/music";
import AlbumArt from "./AlbumArt";
import { usePlayer } from "@/context/PlayerContext";
import { useFavorites } from "@/context/FavoritesContext";
import { Heart, MoreVertical } from "lucide-react";
import SongOptionsMenu from "./SongOptionsMenu";

interface SongItemProps {
  song: Song;
  queue?: Song[];
  index?: number;
  showIndex?: boolean;
}

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const SongItem = ({ song, queue, index, showIndex }: SongItemProps) => {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = currentSong?.id === song.id;
  const liked = isFavorite(song.id);

  return (
    <>
      <div
        onClick={() => playSong(song, queue)}
        className={`flex items-center gap-3 px-3 py-2.5 mx-1 my-1 rounded-2xl cursor-pointer transition-all duration-300 active:scale-[0.98] ${
          isActive ? "glass-card glass-card-active" : "glass-card hover:border-white/10"
        }`}
      >
        {showIndex && (
          <span className={`w-5 text-center text-xs font-semibold ${isActive ? "text-primary" : "text-muted-foreground"}`}>
            {isActive && isPlaying ? (
              <span className="flex gap-[2px] items-end justify-center h-4">
                <span className="w-[3px] bg-primary rounded-full animate-eq-bar" style={{ animationDelay: "0s" }} />
                <span className="w-[3px] bg-primary rounded-full animate-eq-bar" style={{ animationDelay: "0.2s" }} />
                <span className="w-[3px] bg-primary rounded-full animate-eq-bar" style={{ animationDelay: "0.4s" }} />
              </span>
            ) : (
              index !== undefined ? index + 1 : ""
            )}
          </span>
        )}
        <AlbumArt src={song.albumArt} alt={song.title} size="sm" />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isActive ? "text-primary" : "text-foreground"}`}
             style={isActive ? { textShadow: "0 0 10px hsl(var(--primary) / 0.4)" } : undefined}>
            {song.title}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {song.artist} · {song.album}
          </p>
        </div>
        <div className="flex items-center gap-0.5">
          <span className="text-[11px] text-muted-foreground tabular-nums mr-1">{formatDuration(song.duration)}</span>
          <button onClick={(e) => { e.stopPropagation(); toggleFavorite(song.id); }} className="p-1.5">
            <Heart size={15} className={liked ? "fill-primary text-primary" : "text-muted-foreground"}
                   style={liked ? { filter: "drop-shadow(0 0 4px hsl(var(--primary) / 0.6))" } : undefined} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen(true); }} className="p-1.5">
            <MoreVertical size={15} className="text-muted-foreground" />
          </button>
        </div>
      </div>
      <SongOptionsMenu song={song} open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};

export default SongItem;
