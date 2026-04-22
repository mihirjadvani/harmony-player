import { useState, useCallback } from "react";
import { PlayerProvider, usePlayer } from "@/context/PlayerContext";
import { LibraryProvider } from "@/context/LibraryContext";
import { SleepTimerProvider } from "@/context/SleepTimerContext";
import { PlaylistProvider } from "@/context/PlaylistContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { EqualizerProvider } from "@/context/EqualizerContext";
import BottomNav from "@/components/BottomNav";
import MiniPlayer from "@/components/MiniPlayer";
import NowPlayingFull from "@/components/NowPlayingFull";

import LibraryPage from "@/pages/LibraryPage";
import PlaylistsPage from "@/pages/PlaylistsPage";
import NowPlayingPage from "@/pages/NowPlayingPage";
import SettingsPage from "@/pages/SettingsPage";
import EqualizerPage from "@/pages/EqualizerPage";

type Tab = "library" | "playlists" | "nowplaying" | "equalizer" | "settings";

const InnerApp = () => {
  const [tab, setTab] = useState<Tab>("library");
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const { togglePlay, isPlaying } = usePlayer();

  const handleSleepTimerEnd = useCallback(() => {
    if (isPlaying) togglePlay();
  }, [isPlaying, togglePlay]);

  return (
    <SleepTimerProvider onTimerEnd={handleSleepTimerEnd}>
      <div className="relative flex flex-col h-screen">
        {/* Ambient neon glows */}
        <div aria-hidden className="pointer-events-none fixed -top-24 -left-20 w-72 h-72 rounded-full opacity-30 blur-3xl"
             style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.35), transparent 70%)" }} />
        <div aria-hidden className="pointer-events-none fixed -bottom-24 -right-20 w-80 h-80 rounded-full opacity-20 blur-3xl"
             style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.35), transparent 70%)" }} />

        {/* App Header */}
        <header className="relative px-4 pt-4 pb-2 flex items-center justify-center">
          <h3 className="text-xl font-heading text-gradient tracking-wide" style={{ filter: "drop-shadow(0 0 12px hsl(var(--primary) / 0.4))" }}>
            Harmony Player
          </h3>
        </header>

        <main className="relative flex-1 overflow-hidden">
          {tab === "library" && <LibraryPage />}
          {tab === "playlists" && <PlaylistsPage />}
          {tab === "nowplaying" && <NowPlayingPage />}
          {tab === "equalizer" && <EqualizerPage />}
          {tab === "settings" && <SettingsPage />}
        </main>
        {tab !== "nowplaying" && <MiniPlayer onExpand={() => setShowFullPlayer(true)} />}
        <BottomNav active={tab} onChange={setTab} />
        {showFullPlayer && <NowPlayingFull onClose={() => setShowFullPlayer(false)} />}
      </div>
    </SleepTimerProvider>
  );
};

const Index = () => (
  <LibraryProvider>
    <PlayerProvider>
      <PlaylistProvider>
        <FavoritesProvider>
          <EqualizerProvider>
            <InnerApp />
          </EqualizerProvider>
        </FavoritesProvider>
      </PlaylistProvider>
    </PlayerProvider>
  </LibraryProvider>
);

export default Index;
