import { useState, useRef, useEffect, useCallback } from "react";
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";

const VolumeControl = () => {
  const [volume, setVolume] = useState(80);
  const [show, setShow] = useState(false);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Sync with audio element
  useEffect(() => {
    const audio = document.querySelector("audio") as HTMLAudioElement | null;
    if (audio) audio.volume = volume / 100;
    // Also try the global Audio instance
    const audios = document.querySelectorAll("audio");
    audios.forEach((a) => (a.volume = volume / 100));
  }, [volume]);

  // Poll for audio elements to keep volume in sync
  useEffect(() => {
    const interval = setInterval(() => {
      const audios = document.querySelectorAll("audio");
      audios.forEach((a) => (a.volume = volume / 100));
    }, 2000);
    return () => clearInterval(interval);
  }, [volume]);

  const scheduleHide = useCallback(() => {
    clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      if (!dragging) setShow(false);
    }, 2000);
  }, [dragging]);

  const toggleShow = () => {
    setShow((p) => !p);
    if (!show) scheduleHide();
  };

  const updateVolume = (clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = 1 - (clientY - rect.top) / rect.height;
    setVolume(Math.max(0, Math.min(100, Math.round(ratio * 100))));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateVolume(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragging) updateVolume(e.clientY);
  };

  const handlePointerUp = () => {
    setDragging(false);
    scheduleHide();
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 30 ? Volume : volume < 70 ? Volume1 : Volume2;

  return (
    <div className="fixed right-3 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2">
      {show && (
        <div className="relative flex flex-col items-center animate-fade-in">
          {/* Volume label */}
          <span className="text-[10px] font-semibold text-primary font-heading mb-1">{volume}</span>
          {/* Track */}
          <div
            ref={trackRef}
            className="relative w-8 h-40 rounded-full bg-secondary/80 backdrop-blur-md overflow-hidden cursor-pointer"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{ touchAction: "none" }}
          >
            {/* Fill */}
            <div
              className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-100"
              style={{
                height: `${volume}%`,
                background: "var(--gradient-primary)",
                boxShadow: "0 -4px 12px hsl(var(--primary) / 0.3)",
              }}
            />
            {/* Thumb */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-primary border-2 border-background shadow-lg transition-all duration-100"
              style={{ bottom: `calc(${volume}% - 10px)` }}
            />
          </div>
        </div>
      )}
      {/* Toggle button */}
      <button
        onClick={toggleShow}
        className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-md border border-border flex items-center justify-center active:scale-90 transition-transform shadow-lg"
      >
        <VolumeIcon size={18} className="text-primary" />
      </button>
    </div>
  );
};

export default VolumeControl;
