import { Capacitor } from "@capacitor/core";
import { Song } from "@/types/music";

// Lazy-loaded plugin reference
let MusicControls: any = null;

const isNative = () => Capacitor.isNativePlatform();

async function getPlugin() {
  if (!isNative()) return null;
  if (MusicControls) return MusicControls;
  try {
    const mod: any = await import("capacitor-music-controls-plugin");
    MusicControls =
      mod.CapacitorMusicControls ||
      mod.MusicControls ||
      mod.default ||
      mod;
    return MusicControls;
  } catch (e) {
    console.warn("MusicControls plugin not available", e);
    return null;
  }
}

export type BgEvent =
  | "music-controls-play"
  | "music-controls-pause"
  | "music-controls-next"
  | "music-controls-previous"
  | "music-controls-destroy"
  | "music-controls-toggle-play-pause"
  | "music-controls-headset-unplugged"
  | "music-controls-headset-plugged";

export async function showNotification(song: Song, isPlaying: boolean) {
  const plugin = await getPlugin();
  if (!plugin) return;
  try {
    // Best-effort destroy previous
    try { await plugin.destroy?.(); } catch {}
    await plugin.create?.({
      track: song.title || "Unknown Title",
      artist: song.artist || "Unknown Artist",
      album: song.album || "",
      cover: song.albumArt || "",
      isPlaying,
      dismissable: false,
      hasPrev: true,
      hasNext: true,
      hasClose: false,
      hasScrubbing: false,
      // Android
      ticker: `Now playing: ${song.title}`,
      playIcon: "media_play",
      pauseIcon: "media_pause",
      prevIcon: "media_prev",
      nextIcon: "media_next",
      closeIcon: "media_close",
      notificationIcon: "notification",
    });
  } catch (e) {
    console.warn("MusicControls.create failed", e);
  }
}

export async function updatePlaybackState(isPlaying: boolean) {
  const plugin = await getPlugin();
  if (!plugin) return;
  try {
    await plugin.updateIsPlaying?.({ isPlaying });
  } catch (e) {
    console.warn("MusicControls.updateIsPlaying failed", e);
  }
}

export async function destroyNotification() {
  const plugin = await getPlugin();
  if (!plugin) return;
  try {
    await plugin.destroy?.();
  } catch {}
}

export async function subscribeControls(handler: (action: BgEvent) => void) {
  const plugin = await getPlugin();
  if (!plugin) return () => {};
  try {
    const sub = await plugin.addListener?.("controlsNotification", (info: any) => {
      try {
        const message = typeof info === "string" ? info : info?.message;
        if (message) handler(message as BgEvent);
      } catch (e) {
        console.warn("controls handler error", e);
      }
    });
    return () => {
      try { sub?.remove?.(); } catch {}
    };
  } catch (e) {
    console.warn("MusicControls.addListener failed", e);
    return () => {};
  }
}

export const isBackgroundAudioSupported = () => isNative();
