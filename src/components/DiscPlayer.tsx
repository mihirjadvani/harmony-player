import { Music } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";

interface DiscPlayerProps {
  size?: "md" | "lg";
  className?: string;
}

const DiscPlayer = ({ size = "lg", className = "" }: DiscPlayerProps) => {
  const { currentSong, isPlaying } = usePlayer();

  const dimensions = size === "lg" ? "w-64 h-64" : "w-48 h-48";
  const holeDimensions = size === "lg" ? "w-16 h-16" : "w-12 h-12";
  const iconSize = size === "lg" ? 64 : 48;

  return (
    <div className={`relative ${dimensions} ${className}`}>
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full blur-3xl opacity-20 bg-primary" />

      {/* Disc */}
      <div
        className={`relative ${dimensions} rounded-full shadow-2xl overflow-hidden border-2 border-border/30 ${
          isPlaying ? "animate-disc-spin" : ""
        }`}
        style={{ animationPlayState: isPlaying ? "running" : "paused" }}
      >
        {/* Album art or fallback gradient */}
        {currentSong?.albumArt ? (
          <img
            src={currentSong.albumArt}
            alt={currentSong.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary to-card flex items-center justify-center">
            <Music size={iconSize} className="text-muted-foreground opacity-30" />
          </div>
        )}

        {/* Vinyl grooves overlay */}
        <div className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(circle, transparent 20%, transparent 21%, hsl(var(--border) / 0.1) 21.5%, transparent 22%, transparent 30%, hsl(var(--border) / 0.08) 30.5%, transparent 31%, transparent 40%, hsl(var(--border) / 0.06) 40.5%, transparent 41%, transparent 50%, hsl(var(--border) / 0.05) 50.5%, transparent 51%, transparent 60%, hsl(var(--border) / 0.04) 60.5%, transparent 61%, transparent 70%, hsl(var(--border) / 0.03) 70.5%, transparent 71%, transparent 80%, hsl(var(--border) / 0.02) 80.5%, transparent 81%)
            `
          }}
        />

        {/* Center hole */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${holeDimensions} rounded-full bg-background border-2 border-border/50 flex items-center justify-center shadow-inner`}>
          <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
        </div>
      </div>
    </div>
  );
};

export default DiscPlayer;
