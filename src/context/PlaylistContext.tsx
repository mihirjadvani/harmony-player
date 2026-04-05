import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Song, Playlist } from "@/types/music";

interface PlaylistContextType {
  playlists: Playlist[];
  createPlaylist: (name: string) => Playlist;
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
}

const PlaylistContext = createContext<PlaylistContextType | null>(null);

export const usePlaylist = () => {
  const ctx = useContext(PlaylistContext);
  if (!ctx) throw new Error("usePlaylist must be used within PlaylistProvider");
  return ctx;
};

const STORAGE_KEY = "soundwave_playlists";

const loadPlaylists = (): Playlist[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((p: any) => ({ ...p, createdAt: new Date(p.createdAt) }));
  } catch {
    return [];
  }
};

const savePlaylists = (playlists: Playlist[]) => {
  // Save playlists without audioSrc (blob URLs aren't persistent)
  const serializable = playlists.map((p) => ({
    ...p,
    songs: p.songs.map(({ audioSrc, ...rest }) => rest),
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
};

export const PlaylistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>(loadPlaylists);

  useEffect(() => {
    savePlaylists(playlists);
  }, [playlists]);

  const createPlaylist = useCallback((name: string): Playlist => {
    const pl: Playlist = {
      id: Date.now().toString(),
      name: name.trim(),
      songs: [],
      createdAt: new Date(),
    };
    setPlaylists((prev) => [...prev, pl]);
    return pl;
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const renamePlaylist = useCallback((id: string, name: string) => {
    setPlaylists((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: name.trim() } : p))
    );
  }, []);

  const addSongToPlaylist = useCallback((playlistId: string, song: Song) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id !== playlistId) return p;
        if (p.songs.some((s) => s.id === song.id)) return p;
        return { ...p, songs: [...p.songs, song] };
      })
    );
  }, []);

  const removeSongFromPlaylist = useCallback((playlistId: string, songId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id !== playlistId) return p;
        return { ...p, songs: p.songs.filter((s) => s.id !== songId) };
      })
    );
  }, []);

  return (
    <PlaylistContext.Provider
      value={{ playlists, createPlaylist, deletePlaylist, renamePlaylist, addSongToPlaylist, removeSongFromPlaylist }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};
