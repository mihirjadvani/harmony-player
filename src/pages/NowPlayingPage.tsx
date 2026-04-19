import { useState } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { useFavorites } from "@/context/FavoritesContext";
import DiscPlayer from "@/components/DiscPlayer";
import SongItem from "@/components/SongItem";
import SongOptionsMenu from "@/components/SongOptionsMenu";
import VolumeKnob from "@/components/VolumeKnob";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Heart, MoreHorizontal, Disc3, ChevronDown, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const NowPlayingPage = () => {
  const {
    currentSong, isPlaying, currentTime, duration, shuffle, repeat, queue,
    togglePlay, nextSong, prevSong, seekTo, toggleShuffle, setRepeatMode,
  } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  const cycleRepeat = () => {
    const modes: Array<"off" | "all" | "one"> = ["off", "all", "one"];
    const idx = modes.indexOf(repeat);
    setRepeatMode(modes[(idx + 1) % modes.length]);
  };

  if (showVolume) {
    return (
      <div className="flex flex-col h-full px-6 pt-2 pb-safe">
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
    );
  }

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground px-6">
        <Disc3 size={80} className="mb-6 opacity-20" />
        <p className="text-lg font-medium mb-2 text-foreground font-heading">No song playing</p>
        <p className="text-sm text-center">Go to Library and tap a song to start playing</p>
      </div>
    );
  }

  const totalDuration = duration || currentSong.duration;
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
  const liked = isFavorite(currentSong.id);

  return (
    <div className="flex flex-col h-full px-6 pt-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Now Playing</p>
        <button onClick={() => setMenuOpen(true)} className="p-1">
          <MoreHorizontal size={20} className="text-muted-foreground" />
        </button>
      </div>

      <div className="flex justify-center mb-4">
        <DiscPlayer size="lg" />
      </div>

      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1 text-center">
          <h2 className="text-xl font-bold text-foreground truncate font-heading">{currentSong.title}</h2>
          <p className="text-sm text-muted-foreground">{currentSong.artist} — {currentSong.album}</p>
          {currentSong.genre && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">
              {currentSong.genre}
            </span>
          )}
        </div>
        <button onClick={() => toggleFavorite(currentSong.id)} className="p-2 shrink-0">
          <Heart size={22} className={liked ? "fill-primary text-primary" : "text-muted-foreground"} />
        </button>
      </div>

      <div className="mb-3">
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

      <div className="flex items-center justify-between px-2 mb-4">
        <button onClick={toggleShuffle} className={`p-2 ${shuffle ? "text-primary" : "text-muted-foreground"}`}>
          <Shuffle size={18} />
        </button>
        <button onClick={prevSong} className="p-3 text-foreground active:scale-90 transition-transform">
          <SkipBack size={24} fill="currentColor" />
        </button>
        <button
          onClick={togglePlay}
          className="w-14 h-14 rounded-full bg-primary flex items-center justify-center active:scale-90 transition-transform"
          style={{ boxShadow: "var(--shadow-glow)" }}
        >
          {isPlaying ? (
            <Pause size={24} className="text-primary-foreground" fill="currentColor" />
          ) : (
            <Play size={24} className="text-primary-foreground ml-0.5" fill="currentColor" />
          )}
        </button>
        <button onClick={nextSong} className="p-3 text-foreground active:scale-90 transition-transform">
          <SkipForward size={24} fill="currentColor" />
        </button>
        <button onClick={cycleRepeat} className={`p-2 ${repeat !== "off" ? "text-primary" : "text-muted-foreground"}`}>
          {repeat === "one" ? <Repeat1 size={18} /> : <Repeat size={18} />}
        </button>
      </div>

      {/* Volume button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setShowVolume(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 text-muted-foreground active:scale-95 transition-transform"
        >
          <Volume2 size={16} />
          <span className="text-xs font-medium">Volume</span>
        </button>
      </div>

      {queue.length > 1 && (
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Up Next</p>
          {queue
            .filter((s) => s.id !== currentSong.id)
            .slice(0, 5)
            .map((song) => (
              <SongItem key={song.id} song={song} queue={queue} />
            ))}
        </div>
      )}

      <SongOptionsMenu song={currentSong} open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
};

export default NowPlayingPage;
