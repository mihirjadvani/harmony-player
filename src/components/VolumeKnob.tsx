import { useRef, useCallback, useEffect } from "react";
import { usePlayer } from "@/context/PlayerContext";

interface VolumeKnobProps {
  size?: number;
}

const VolumeKnob = ({ size = 160 }: VolumeKnobProps) => {
  const { volume, setVolume } = usePlayer();
  const knobRef = useRef<HTMLDivElement>(null);
  const activePointerRef = useRef<number | null>(null);
  const lastAngleRef = useRef<number | null>(null);
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  // Map volume 0-100 to angle -135 to 135 (270° sweep) for visual indicator
  const angle = -135 + (volume / 100) * 270;

  const getRawAngle = useCallback((clientX: number, clientY: number) => {
    const el = knobRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Ignore extra fingers — only first touch controls the knob
    if (activePointerRef.current !== null) return;
    activePointerRef.current = e.pointerId;
    lastAngleRef.current = getRawAngle(e.clientX, e.clientY);
    knobRef.current?.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  }, [getRawAngle]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (e.pointerId !== activePointerRef.current) return;
    if (lastAngleRef.current === null) return;
    const current = getRawAngle(e.clientX, e.clientY);
    let delta = current - lastAngleRef.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    lastAngleRef.current = current;
    // Clockwise (positive delta) → volume up. 270° sweep maps to 100 units.
    const next = Math.max(0, Math.min(100, volumeRef.current + (delta / 270) * 100));
    setVolume(next);
  }, [getRawAngle, setVolume]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (e.pointerId !== activePointerRef.current) return;
    activePointerRef.current = null;
    lastAngleRef.current = null;
    try { knobRef.current?.releasePointerCapture?.(e.pointerId); } catch {}
  }, []);

  // Wheel scroll fine-tune (desktop)
  useEffect(() => {
    const el = knobRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const step = e.deltaY < 0 ? 2 : -2;
      setVolume(Math.max(0, Math.min(100, volumeRef.current + step)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setVolume]);

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
    dots.push({ x, y, isActive });
  }

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">
        Volume
      </span>

      <div className="relative" style={{ width: size + 40, height: size + 40 }}>
        {dots.map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none transition-all duration-150"
            style={{
              width: dot.isActive ? 6 : 4,
              height: dot.isActive ? 6 : 4,
              left: `calc(50% + ${dot.x}px - ${dot.isActive ? 3 : 2}px)`,
              top: `calc(50% + ${dot.y}px - ${dot.isActive ? 3 : 2}px)`,
              background: dot.isActive
                ? `hsl(var(--primary))`
                : `hsl(var(--muted-foreground) / 0.3)`,
              boxShadow: dot.isActive ? `0 0 8px hsl(var(--primary) / 0.6)` : "none",
            }}
          />
        ))}

        {/* Main knob — gesture target */}
        <div
          ref={knobRef}
          className="absolute cursor-grab active:cursor-grabbing"
          style={{
            width: size,
            height: size,
            left: 20,
            top: 20,
            touchAction: "none",
            WebkitUserSelect: "none",
            userSelect: "none",
            WebkitTouchCallout: "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onLostPointerCapture={handlePointerUp}
        >
          {/* Outer arc ring */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `conic-gradient(
                from 225deg,
                hsl(var(--primary)) 0deg,
                hsl(var(--accent)) ${(volume / 100) * 270}deg,
                hsl(var(--muted) / 0.3) ${(volume / 100) * 270}deg,
                hsl(var(--muted) / 0.3) 270deg
              )`,
              padding: 3,
            }}
          >
            <div className="w-full h-full rounded-full bg-card" />
          </div>

          {/* Inner knob body */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: 6,
              background: `radial-gradient(circle at 40% 35%, hsl(var(--secondary)), hsl(var(--card)) 60%, hsl(0 0% 5%) 100%)`,
              boxShadow: `inset 0 2px 10px hsl(0 0% 100% / 0.05), inset 0 -4px 10px hsl(0 0% 0% / 0.4), 0 4px 20px hsl(0 0% 0% / 0.5)`,
            }}
          >
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
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `rotate(${angle}deg)`,
              transition: activePointerRef.current !== null ? "none" : "transform 120ms ease-out",
            }}
          >
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

        <span className="absolute text-[9px] font-semibold text-muted-foreground tracking-wider" style={{ left: -2, bottom: 2 }}>MIN</span>
        <span className="absolute text-[9px] font-semibold text-muted-foreground tracking-wider" style={{ right: -4, bottom: 2 }}>MAX</span>
      </div>

      <span className="text-2xl font-bold text-foreground tabular-nums">
        {Math.round(volume)}%
      </span>

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
