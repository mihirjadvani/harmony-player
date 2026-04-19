import { useState } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { useFavorites } from "@/context/FavoritesContext";
import DiscPlayer from "./DiscPlayer";
import SongOptionsMenu from "./SongOptionsMenu";
import VolumeKnob from "./VolumeKnob";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, ChevronDown, Heart, MoreHorizontal, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

interface NowPlayingFullProps {
  onClose: () => void;
}

const NowPlayingFull = ({ onClose }: NowPlayingFullProps) => {
  const {
    currentSong, isPlaying, currentTime, duration, shuffle, repeat,
    togglePlay, nextSong, prevSong, seekTo, toggleShuffle, setRepeatMode,
  } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  if (!currentSong) return null;

  const totalDuration = duration || currentSong.duration;
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
  const liked = isFavorite(currentSong.id);

  const cycleRepeat = () => {
    const modes: Array<"off" | "all" | "one"> = ["off", "all", "one"];
    const idx = modes.indexOf(repeat);
    setRepeatMode(modes[(idx + 1) % modes.length]);
  };

  if (showVolume) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="relative flex flex-col h-full px-6 pt-4 pb-8 safe-bottom">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setShowVolume(false)} className="p-2 -ml-2">
              <ChevronDown size={24} className="text-foreground" />
            </button>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Volume Control</p>
            <div className="w-10" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <VolumeKnob size={180} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background animate-slide-up">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

      <div className="relative flex flex-col h-full px-6 pt-4 pb-8 safe-bottom">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onClose} className="p-2 -ml-2">
            <ChevronDown size={24} className="text-foreground" />
          </button>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Now Playing</p>
          <button onClick={() => setMenuOpen(true)} className="p-2 -mr-2">
            <MoreHorizontal size={22} className="text-muted-foreground" />
          </button>
        </div>

        {/* Disc */}
        <div className="flex-1 flex items-center justify-center mb-6">
          <DiscPlayer size="lg" />
        </div>

        {/* Song Info + Favorite */}
        <div className="flex items-start justify-between mb-5">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-foreground truncate">{currentSong.title}</h2>
            <p className="text-sm text-muted-foreground truncate">{currentSong.artist} — {currentSong.album}</p>
          </div>
          <button onClick={() => toggleFavorite(currentSong.id)} className="p-2 shrink-0">
            <Heart size={22} className={liked ? "fill-primary text-primary" : "text-muted-foreground"} />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-5">
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            onValueChange={([val]) => seekTo((val / 100) * totalDuration)}
            className="mb-2"
          />
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
            <span className="text-xs text-muted-foreground">{formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-4 mb-4">
          <button onClick={toggleShuffle} className={`p-2 ${shuffle ? "text-primary" : "text-muted-foreground"}`}>
            <Shuffle size={20} />
          </button>
          <button onClick={prevSong} className="p-3 text-foreground active:scale-90 transition-transform">
            <SkipBack size={28} fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center active:scale-95 transition-transform animate-pulse-glow"
          >
            {isPlaying ? (
              <Pause size={32} className="text-primary-foreground" fill="currentColor" />
            ) : (
              <Play size={32} className="text-primary-foreground ml-1" fill="currentColor" />
            )}
          </button>
          <button onClick={nextSong} className="p-3 text-foreground active:scale-90 transition-transform">
            <SkipForward size={28} fill="currentColor" />
          </button>
          <button onClick={cycleRepeat} className={`p-2 ${repeat !== "off" ? "text-primary" : "text-muted-foreground"}`}
                  style={repeat !== "off" ? { filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.7))" } : undefined}>
            {repeat === "one" ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </button>
        </div>

        {/* Volume button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowVolume(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 text-muted-foreground active:scale-95 transition-transform"
          >
            <Volume2 size={16} />
            <span className="text-xs font-medium">Volume</span>
          </button>
        </div>
      </div>

      <SongOptionsMenu song={currentSong} open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
};

export default NowPlayingFull;
