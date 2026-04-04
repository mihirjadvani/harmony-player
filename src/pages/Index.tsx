import { useState } from "react";
import { PlayerProvider } from "@/context/PlayerContext";
import { LibraryProvider } from "@/context/LibraryContext";
import BottomNav from "@/components/BottomNav";
import MiniPlayer from "@/components/MiniPlayer";
import NowPlayingFull from "@/components/NowPlayingFull";
import LibraryPage from "@/pages/LibraryPage";
import PlaylistsPage from "@/pages/PlaylistsPage";
import NowPlayingPage from "@/pages/NowPlayingPage";
import SettingsPage from "@/pages/SettingsPage";

type Tab = "library" | "playlists" | "nowplaying" | "settings";

const Index = () => {
  const [tab, setTab] = useState<Tab>("library");
  const [showFullPlayer, setShowFullPlayer] = useState(false);

  return (
    <LibraryProvider>
      <PlayerProvider>
        <div className="flex flex-col h-screen bg-background">
          <main className="flex-1 overflow-hidden">
            {tab === "library" && <LibraryPage />}
            {tab === "playlists" && <PlaylistsPage />}
            {tab === "nowplaying" && <NowPlayingPage />}
            {tab === "settings" && <SettingsPage />}
          </main>
          {tab !== "nowplaying" && <MiniPlayer onExpand={() => setShowFullPlayer(true)} />}
          <BottomNav active={tab} onChange={setTab} />
          {showFullPlayer && <NowPlayingFull onClose={() => setShowFullPlayer(false)} />}
        </div>
      </PlayerProvider>
    </LibraryProvider>
  );
};

export default Index;
