import { Music } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { useRef, useEffect, useState } from "react";

interface DiscPlayerProps {
  size?: "md" | "lg";
  className?: string;
}

const DiscPlayer = ({ size = "lg", className = "" }: DiscPlayerProps) => {
  const { currentSong, isPlaying } = usePlayer();
  const discRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const speedRef = useRef(0); // current speed (0 to 1)

  const dimensions = size === "lg" ? "w-64 h-64" : "w-48 h-48";
  const holeDimensions = size === "lg" ? "w-14 h-14" : "w-10 h-10";
  const iconSize = size === "lg" ? 64 : 48;

  useEffect(() => {
    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Smooth speed transitions
      const targetSpeed = isPlaying ? 1 : 0;
      const ease = isPlaying ? 3 : 2; // ease-in faster, ease-out slower
      speedRef.current += (targetSpeed - speedRef.current) * Math.min(delta * ease, 1);

      // Rotate at 45 deg/sec at full speed
      rotationRef.current += speedRef.current * 45 * delta;

      if (discRef.current) {
        discRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying]);

  return (
    <div className={`relative ${dimensions} ${className}`}>
      {/* Glow effect */}
      <div
        className="absolute inset-[-20%] rounded-full blur-3xl transition-opacity duration-1000"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.25), transparent 70%)",
          opacity: isPlaying ? 1 : 0.3,
        }}
      />

      {/* Shadow under disc */}
      <div
        className="absolute inset-2 rounded-full transition-all duration-700"
        style={{
          boxShadow: isPlaying
            ? "0 20px 60px hsl(0 0% 0% / 0.6), 0 0 40px hsl(var(--primary) / 0.15)"
            : "0 10px 30px hsl(0 0% 0% / 0.4)",
        }}
      />

      {/* Disc */}
      <div
        ref={discRef}
        className={`relative ${dimensions} rounded-full overflow-hidden`}
        style={{
          boxShadow: "inset 0 0 30px hsl(0 0% 0% / 0.3), 0 0 1px hsl(0 0% 100% / 0.1)",
          perspective: "800px",
        }}
      >
        {/* Album art or fallback */}
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
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `
              repeating-radial-gradient(
                circle at center,
                transparent 0px,
                transparent 3px,
                hsl(0 0% 0% / 0.06) 3.5px,
                transparent 4px
              )
            `,
          }}
        />

        {/* Shine / reflection */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "linear-gradient(135deg, hsl(0 0% 100% / 0.08) 0%, transparent 40%, transparent 60%, hsl(0 0% 100% / 0.04) 100%)",
          }}
        />

        {/* Rim highlight */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: "inset 0 0 0 2px hsl(0 0% 100% / 0.08), inset 0 0 0 3px hsl(0 0% 0% / 0.2)",
          }}
        />

        {/* Center hole */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${holeDimensions} rounded-full bg-background flex items-center justify-center`}
          style={{
            boxShadow: "inset 0 2px 8px hsl(0 0% 0% / 0.5), 0 0 0 2px hsl(0 0% 100% / 0.06)",
          }}
        >
          {/* Pin */}
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-muted-foreground/50 to-muted-foreground/20"
            style={{ boxShadow: "0 1px 3px hsl(0 0% 0% / 0.5)" }}
          />
        </div>
      </div>
    </div>
  );
};

export default DiscPlayer;
