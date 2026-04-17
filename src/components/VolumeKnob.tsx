import { useState, useRef, useCallback, useEffect } from "react";

interface VolumeKnobProps {
  size?: number;
}

const VolumeKnob = ({ size = 160 }: VolumeKnobProps) => {
  const [volume, setVolume] = useState(75);
  const [isDragging, setIsDragging] = useState(false);
  const knobRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef<number | null>(null);

  // Map volume 0-100 to angle -135 to 135 (270° sweep) for visual indicator
  const volumeToAngle = (v: number) => -135 + (v / 100) * 270;
  const angle = volumeToAngle(volume);

  // Sync with audio elements
  useEffect(() => {
    const audios = document.querySelectorAll("audio");
    audios.forEach((a) => (a.volume = volume / 100));
  }, [volume]);

  useEffect(() => {
    const interval = setInterval(() => {
      const audios = document.querySelectorAll("audio");
      audios.forEach((a) => (a.volume = volume / 100));
    }, 2000);
    return () => clearInterval(interval);
  }, [volume]);

  const getRawAngle = useCallback((clientX: number, clientY: number) => {
    if (!knobRef.current) return 0;
    const rect = knobRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rad = Math.atan2(clientY - cy, clientX - cx);
    return (rad * 180) / Math.PI; // -180..180, 0° = right, 90° = down
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    lastAngleRef.current = getRawAngle(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || lastAngleRef.current === null) return;
    const current = getRawAngle(e.clientX, e.clientY);
    let delta = current - lastAngleRef.current;
    // Normalize to [-180, 180] to handle wraparound
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    lastAngleRef.current = current;
    // Clockwise (positive delta) = increase volume; 270° sweep = 100 units
    const volumeDelta = (delta / 270) * 100;
    setVolume((v) => Math.max(0, Math.min(100, v + volumeDelta)));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    lastAngleRef.current = null;
  };

  // Generate dot positions around the knob
  const dots = [];
  const dotCount = 24;
  const radius = size / 2 + 12;
  for (let i = 0; i < dotCount; i++) {
    const dotAngle = -135 + (i / (dotCount - 1)) * 270;
    const rad = ((dotAngle - 90) * Math.PI) / 180;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;
    const isActive = dotAngle <= angle;
    dots.push({ x, y, isActive, angle: dotAngle });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Volume percentage */}
      <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">
        Volume
      </span>

      <div className="relative" style={{ width: size + 40, height: size + 40 }}>
        {/* Dots around the knob */}
        {dots.map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full transition-all duration-150"
            style={{
              width: dot.isActive ? 6 : 4,
              height: dot.isActive ? 6 : 4,
              left: `calc(50% + ${dot.x}px - ${dot.isActive ? 3 : 2}px)`,
              top: `calc(50% + ${dot.y}px - ${dot.isActive ? 3 : 2}px)`,
              background: dot.isActive
                ? `hsl(var(--primary))`
                : `hsl(var(--muted-foreground) / 0.3)`,
              boxShadow: dot.isActive
                ? `0 0 8px hsl(var(--primary) / 0.6)`
                : "none",
            }}
          />
        ))}

        {/* Main knob */}
        <div
          ref={knobRef}
          className="absolute cursor-grab active:cursor-grabbing"
          style={{
            width: size,
            height: size,
            left: 20,
            top: 20,
            touchAction: "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(
                from 225deg,
                hsl(var(--primary)) 0deg,
                hsl(var(--accent)) ${(volume / 100) * 270}deg,
                hsl(var(--muted) / 0.3) ${(volume / 100) * 270}deg,
                hsl(var(--muted) / 0.3) 270deg
              )`,
              padding: 3,
              borderRadius: "50%",
            }}
          >
            <div className="w-full h-full rounded-full bg-card" />
          </div>

          {/* Inner knob body */}
          <div
            className="absolute rounded-full"
            style={{
              inset: 6,
              background: `radial-gradient(circle at 40% 35%, hsl(var(--secondary)), hsl(var(--card)) 60%, hsl(0 0% 5%) 100%)`,
              boxShadow: `
                inset 0 2px 10px hsl(0 0% 100% / 0.05),
                inset 0 -4px 10px hsl(0 0% 0% / 0.4),
                0 4px 20px hsl(0 0% 0% / 0.5)
              `,
            }}
          >
            {/* Mesh pattern overlay */}
            <div
              className="absolute inset-3 rounded-full opacity-30"
              style={{
                backgroundImage: `radial-gradient(circle, hsl(var(--muted-foreground) / 0.3) 1px, transparent 1px)`,
                backgroundSize: "6px 6px",
              }}
            />
          </div>

          {/* Rotating indicator */}
          <div
            className="absolute inset-0 transition-transform"
            style={{
              transform: `rotate(${angle}deg)`,
              transitionDuration: isDragging ? "0ms" : "150ms",
            }}
          >
            {/* Indicator line */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-2"
              style={{
                width: 3,
                height: 16,
                borderRadius: 2,
                background: `hsl(var(--primary))`,
                boxShadow: `0 0 10px hsl(var(--primary) / 0.8), 0 0 20px hsl(var(--primary) / 0.4)`,
              }}
            />
          </div>
        </div>

        {/* MIN / MAX labels */}
        <span
          className="absolute text-[9px] font-semibold text-muted-foreground tracking-wider"
          style={{
            left: -2,
            bottom: 2,
          }}
        >
          MIN
        </span>
        <span
          className="absolute text-[9px] font-semibold text-muted-foreground tracking-wider"
          style={{
            right: -4,
            bottom: 2,
          }}
        >
          MAX
        </span>
      </div>

      {/* Volume value */}
      <span className="text-2xl font-bold text-foreground tabular-nums">
        {volume}%
      </span>

      {/* OFF indicator */}
      {volume === 0 && (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-[10px] font-semibold text-destructive tracking-wider">OFF</span>
        </div>
      )}
    </div>
  );
};

export default VolumeKnob;
