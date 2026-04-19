import { Library, ListMusic, Disc3, Settings, SlidersHorizontal } from "lucide-react";

type Tab = "library" | "playlists" | "nowplaying" | "equalizer" | "settings";

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "library", label: "Library", icon: Library },
  { id: "playlists", label: "Playlists", icon: ListMusic },
  { id: "nowplaying", label: "Playing", icon: Disc3 },
  { id: "equalizer", label: "EQ", icon: SlidersHorizontal },
  { id: "settings", label: "Settings", icon: Settings },
];

const BottomNav = ({ active, onChange }: BottomNavProps) => {
  return (
    <nav className="glass safe-bottom mx-3 mb-3 rounded-2xl">
      <div className="flex items-center justify-around py-2 px-1">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <span
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  style={{ boxShadow: "var(--shadow-glow-soft)" }}
                />
              )}
              <Icon size={20} className="relative" style={isActive ? { filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.7))" } : undefined} />
              <span className="relative text-[9px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
