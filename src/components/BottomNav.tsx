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
    <nav className="glass border-t border-border safe-bottom">
      <div className="flex items-center justify-around py-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-200 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon size={20} className={isActive ? "text-primary" : ""} />
              <span className="text-[9px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
