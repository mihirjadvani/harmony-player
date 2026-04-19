import { usePlayer } from "@/context/PlayerContext";
import AlbumArt from "./AlbumArt";
import { Play, Pause, SkipForward } from "lucide-react";

interface MiniPlayerProps {
  onExpand: () => void;
}

const MiniPlayer = ({ onExpand }: MiniPlayerProps) => {
  const { currentSong, isPlaying, togglePlay, nextSong, currentTime, duration } = usePlayer();

  if (!currentSong) return null;

  const totalDuration = duration || currentSong.duration;
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="px-3 pt-1 pb-2">
      <div className="relative glass rounded-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5">
          <div
            className="h-full bg-gradient-primary transition-all duration-700"
            style={{ width: `${progress}%`, boxShadow: "0 0 8px hsl(var(--primary) / 0.6)" }}
          />
        </div>

        <div onClick={onExpand} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer">
          <div className="relative">
            <AlbumArt src={currentSong.albumArt} alt={currentSong.title} size="sm" rounded />
            {isPlaying && (
              <span className="absolute -inset-0.5 rounded-lg pointer-events-none" style={{ boxShadow: "0 0 12px hsl(var(--primary) / 0.4)" }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-foreground">{currentSong.title}</p>
            <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="w-10 h-10 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center text-primary active:scale-90 transition-transform"
            style={{ boxShadow: "var(--shadow-glow-soft)" }}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextSong(); }}
            className="p-2 text-foreground/80 active:scale-90 transition-transform"
          >
            <SkipForward size={18} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
