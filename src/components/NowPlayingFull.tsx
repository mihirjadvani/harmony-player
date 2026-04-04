import { usePlayer } from "@/context/PlayerContext";
import AlbumArt from "./AlbumArt";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, ChevronDown } from "lucide-react";
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
    currentSong,
    isPlaying,
    currentTime,
    duration,
    shuffle,
    repeat,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    toggleShuffle,
    setRepeatMode,
  } = usePlayer();

  if (!currentSong) return null;

  const totalDuration = duration || currentSong.duration;
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  const cycleRepeat = () => {
    const modes: Array<"off" | "all" | "one"> = ["off", "all", "one"];
    const idx = modes.indexOf(repeat);
    setRepeatMode(modes[(idx + 1) % modes.length]);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background animate-slide-up">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

      <div className="relative flex flex-col h-full px-6 pt-4 pb-8 safe-bottom">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={onClose} className="p-2 -ml-2">
            <ChevronDown size={24} className="text-foreground" />
          </button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Now Playing</p>
          </div>
          <div className="w-10" />
        </div>

        {/* Album Art */}
        <div className="flex-1 flex items-center justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl blur-3xl opacity-30 bg-primary" />
            <AlbumArt
              src={currentSong.albumArt}
              alt={currentSong.title}
              size="xl"
              className="rounded-3xl shadow-2xl relative z-10"
            />
          </div>
        </div>

        {/* Song Info */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground truncate">{currentSong.title}</h2>
          <p className="text-sm text-muted-foreground truncate">{currentSong.artist} — {currentSong.album}</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            onValueChange={([val]) => seekTo((val / 100) * currentSong.duration)}
            className="mb-2"
          />
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
            <span className="text-xs text-muted-foreground">{formatTime(currentSong.duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-4 mb-8">
          <button onClick={toggleShuffle} className={`p-2 ${shuffle ? "text-primary" : "text-muted-foreground"}`}>
            <Shuffle size={20} />
          </button>
          <button onClick={prevSong} className="p-3 text-foreground active:scale-90 transition-transform">
            <SkipBack size={28} fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center active:scale-90 transition-transform shadow-lg"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            {isPlaying ? (
              <Pause size={28} className="text-primary-foreground" fill="currentColor" />
            ) : (
              <Play size={28} className="text-primary-foreground ml-1" fill="currentColor" />
            )}
          </button>
          <button onClick={nextSong} className="p-3 text-foreground active:scale-90 transition-transform">
            <SkipForward size={28} fill="currentColor" />
          </button>
          <button onClick={cycleRepeat} className={`p-2 ${repeat !== "off" ? "text-primary" : "text-muted-foreground"}`}>
            {repeat === "one" ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NowPlayingFull;
