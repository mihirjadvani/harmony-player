import { usePlayer } from "@/context/PlayerContext";
import AlbumArt from "./AlbumArt";
import { Play, Pause } from "lucide-react";

interface MiniPlayerProps {
  onExpand: () => void;
}

const MiniPlayer = ({ onExpand }: MiniPlayerProps) => {
  const { currentSong, isPlaying, togglePlay, currentTime, duration } = usePlayer();

  if (!currentSong) return null;

  const totalDuration = duration || currentSong.duration;
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="relative glass border-t border-border">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-secondary">
        <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
      </div>

      <div onClick={onExpand} className="flex items-center gap-3 px-4 py-2 cursor-pointer">
        <AlbumArt src={currentSong.albumArt} alt={currentSong.title} size="sm" rounded />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-foreground">{currentSong.title}</p>
          <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="p-2 active:scale-90 transition-transform"
        >
          {isPlaying ? (
            <Pause size={22} className="text-foreground" fill="currentColor" />
          ) : (
            <Play size={22} className="text-foreground ml-0.5" fill="currentColor" />
          )}
        </button>
      </div>
    </div>
  );
};

export default MiniPlayer;
