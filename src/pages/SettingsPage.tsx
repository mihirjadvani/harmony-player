import { Smartphone, Info, Moon, Volume2 } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="flex flex-col h-full px-4 pt-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

      <div className="space-y-2">
        <div className="flex items-center gap-4 p-4 bg-card rounded-2xl">
          <Volume2 size={20} className="text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Audio Quality</p>
            <p className="text-xs text-muted-foreground">High quality playback</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-card rounded-2xl">
          <Moon size={20} className="text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Sleep Timer</p>
            <p className="text-xs text-muted-foreground">Off</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-card rounded-2xl">
          <Smartphone size={20} className="text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Storage Scan</p>
            <p className="text-xs text-muted-foreground">Scan device for audio files</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-card rounded-2xl">
          <Info size={20} className="text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">About</p>
            <p className="text-xs text-muted-foreground">SoundWave v1.0</p>
          </div>
        </div>
      </div>

      <div className="mt-auto pb-6">
        <p className="text-xs text-muted-foreground text-center">
          SoundWave Music Player<br />
          Built with ❤️ using Capacitor
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
