import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Song } from "@/types/music";
import { scanDeviceForMusic, isNativePlatform, ScanProgress } from "@/services/musicScanner";
import { mockSongs } from "@/data/mockSongs";

interface LibraryContextType {
  songs: Song[];
  isScanning: boolean;
  scanProgress: ScanProgress | null;
  rescan: () => Promise<void>;
  isNative: boolean;
}

const LibraryContext = createContext<LibraryContextType | null>(null);

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
};

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const isNative = isNativePlatform();

  const scan = useCallback(async () => {
    if (!isNative) {
      // On web, use mock data
      setSongs(mockSongs);
      return;
    }

    setIsScanning(true);
    setScanProgress({ phase: "scanning", current: 0, total: 0 });

    try {
      const scanned = await scanDeviceForMusic((progress) => {
        setScanProgress(progress);
      });
      setSongs(scanned);
    } catch (err) {
      console.error("Scan failed:", err);
      // Fall back to mock data on error
      setSongs(mockSongs);
    } finally {
      setIsScanning(false);
    }
  }, [isNative]);

  useEffect(() => {
    scan();
  }, [scan]);

  return (
    <LibraryContext.Provider
      value={{
        songs,
        isScanning,
        scanProgress,
        rescan: scan,
        isNative,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};
