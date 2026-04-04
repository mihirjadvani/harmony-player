import { Song } from "@/types/music";
import AlbumArt from "./AlbumArt";
import { usePlayer } from "@/context/PlayerContext";
import { Heart, MoreVertical } from "lucide-react";
import { useState } from "react";

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
  const [liked, setLiked] = useState(false);
  const isActive = currentSong?.id === song.id;

  return (
    <div
      onClick={() => playSong(song, queue)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer ${
        isActive ? "bg-primary/10" : "hover:bg-secondary/50"
      }`}
    >
      {showIndex && (
        <span className={`w-6 text-center text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
          {isActive && isPlaying ? (
            <span className="flex gap-[2px] items-end justify-center h-4">
              <span className="w-[3px] bg-primary rounded-full animate-pulse" style={{ height: "60%" }} />
              <span className="w-[3px] bg-primary rounded-full animate-pulse" style={{ height: "100%", animationDelay: "0.15s" }} />
              <span className="w-[3px] bg-primary rounded-full animate-pulse" style={{ height: "40%", animationDelay: "0.3s" }} />
            </span>
          ) : (
            index !== undefined ? index + 1 : ""
          )}
        </span>
      )}
      <AlbumArt src={song.albumArt} alt={song.title} size="sm" />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? "text-primary" : "text-foreground"}`}>
          {song.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {song.artist} · {song.album}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{formatDuration(song.duration)}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="p-1"
        >
          <Heart size={16} className={liked ? "fill-primary text-primary" : "text-muted-foreground"} />
        </button>
      </div>
    </div>
  );
};

export default SongItem;
