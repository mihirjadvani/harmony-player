import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Song } from "@/types/music";
import { scanDeviceForMusic, isNativePlatform, ScanProgress } from "@/services/musicScanner";
import { parseAudioFiles, openAudioFilePicker, openFolderPicker } from "@/services/webFilePicker";
import { isNativeAndroid, pickAudioFilesNative, pickAudioFolderNative } from "@/services/nativeFilePicker";

interface LibraryContextType {
  songs: Song[];
  isScanning: boolean;
  scanProgress: ScanProgress | null;
  rescan: () => Promise<void>;
  addFilesFromPC: () => Promise<void>;
  addFolderFromPC: () => Promise<void>;
  removeSong: (id: string) => void;
  clearLibrary: () => void;
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

  // Native device scan
  const scan = useCallback(async () => {
    if (!isNative) return;

    setIsScanning(true);
    setScanProgress({ phase: "scanning", current: 0, total: 0 });

    try {
      const scanned = await scanDeviceForMusic((progress) => {
        setScanProgress(progress);
      });
      setSongs(scanned);
    } catch (err) {
      console.error("Scan failed:", err);
    } finally {
      setIsScanning(false);
      setScanProgress(null);
    }
  }, [isNative]);

  // Pick individual files (Android: system document picker, Web: file input)
  const addFilesFromPC = useCallback(async () => {
    setIsScanning(true);
    setScanProgress({ phase: "extracting", current: 0, total: 0 });

    try {
      if (isNativeAndroid()) {
        const newSongs = await pickAudioFilesNative((current, total, fileName) => {
          setScanProgress({ phase: "extracting", current, total, currentFile: fileName });
        });
        setSongs((prev) => [...prev, ...newSongs]);
      } else {
        const files = await openAudioFilePicker();
        if (!files || files.length === 0) return;
        setScanProgress({ phase: "extracting", current: 0, total: files.length });
        const newSongs = await parseAudioFiles(files, (current, total, fileName) => {
          setScanProgress({ phase: "extracting", current, total, currentFile: fileName });
        });
        setSongs((prev) => [...prev, ...newSongs]);
      }
    } catch (err) {
      console.error("File picking failed:", err);
    } finally {
      setIsScanning(false);
      setScanProgress(null);
    }
  }, []);

  // Pick entire folder (Android: document tree, Web: webkitdirectory)
  const addFolderFromPC = useCallback(async () => {
    setIsScanning(true);
    setScanProgress({ phase: "scanning", current: 0, total: 0 });

    try {
      if (isNativeAndroid()) {
        const newSongs = await pickAudioFolderNative((current, total, fileName) => {
          setScanProgress({ phase: "extracting", current, total, currentFile: fileName });
        });
        setSongs((prev) => [...prev, ...newSongs]);
        return;
      }

      const files = await openFolderPicker();
      if (!files || files.length === 0) return;

      const audioExts = [".mp3", ".wav", ".aac", ".flac", ".ogg", ".m4a", ".wma", ".opus", ".webm"];
      const audioFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (audioExts.some((ext) => f.name.toLowerCase().endsWith(ext))) {
          audioFiles.push(f);
        }
      }
      if (audioFiles.length === 0) return;

      const dt = new DataTransfer();
      audioFiles.forEach((f) => dt.items.add(f));

      setScanProgress({ phase: "scanning", current: 0, total: audioFiles.length });
      const newSongs = await parseAudioFiles(dt.files, (current, total, fileName) => {
        setScanProgress({ phase: "extracting", current, total, currentFile: fileName });
      });
      setSongs((prev) => [...prev, ...newSongs]);
    } catch (err) {
      console.error("Folder picking failed:", err);
    } finally {
      setIsScanning(false);
      setScanProgress(null);
    }
  }, []);

  const removeSong = useCallback((id: string) => {
    setSongs((prev) => {
      const song = prev.find((s) => s.id === id);
      if (song?.audioSrc) URL.revokeObjectURL(song.audioSrc);
      return prev.filter((s) => s.id !== id);
    });
  }, []);

  const clearLibrary = useCallback(() => {
    setSongs((prev) => {
      prev.forEach((s) => {
        if (s.audioSrc) URL.revokeObjectURL(s.audioSrc);
      });
      return [];
    });
  }, []);

  // On native, auto-scan
  useEffect(() => {
    if (isNative) scan();
  }, [isNative, scan]);

  return (
    <LibraryContext.Provider
      value={{
        songs,
        isScanning,
        scanProgress,
        rescan: scan,
        addFilesFromPC,
        addFolderFromPC,
        removeSong,
        clearLibrary,
        isNative,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};
