import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { Song } from "@/types/music";

const AUDIO_EXTENSIONS = [
  ".mp3", ".wav", ".aac", ".flac", ".ogg", ".m4a", ".wma", ".opus", ".webm",
];

const SCAN_DIRECTORIES = [
  "Music",
  "Download",
  "Downloads",
  "media/audio",
  "Recordings",
  "Ringtones",
  "Notifications",
  "Podcasts",
  "DCIM",
];

function isAudioFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function getFormat(filename: string): string {
  const ext = filename.split(".").pop()?.toUpperCase() || "UNKNOWN";
  return ext;
}

function titleFromFilename(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
}

/**
 * Recursively scan a directory for audio files.
 */
async function scanDirectory(
  path: string,
  directory: Directory,
  depth: number = 0
): Promise<{ uri: string; name: string; size: number }[]> {
  if (depth > 4) return []; // limit recursion

  try {
    const result = await Filesystem.readdir({ path, directory });
    const files: { uri: string; name: string; size: number }[] = [];

    for (const entry of result.files) {
      if (entry.type === "directory") {
        const subFiles = await scanDirectory(
          `${path}/${entry.name}`,
          directory,
          depth + 1
        );
        files.push(...subFiles);
      } else if (isAudioFile(entry.name)) {
        files.push({
          uri: entry.uri || `${path}/${entry.name}`,
          name: entry.name,
          size: entry.size || 0,
        });
      }
    }

    return files;
  } catch {
    // Directory doesn't exist or no permission — skip
    return [];
  }
}

/**
 * Extract metadata from an audio file using music-metadata-browser.
 * Returns partial Song data with metadata fields + album art as base64 data URI.
 */
async function extractMetadata(
  fileUri: string,
  fileName: string
): Promise<{
  title: string;
  artist: string;
  album: string;
  genre?: string;
  duration: number;
  albumArt?: string;
}> {
  const defaults = {
    title: titleFromFilename(fileName),
    artist: "Unknown Artist",
    album: "Unknown Album",
    genre: undefined as string | undefined,
    duration: 0,
    albumArt: undefined as string | undefined,
  };

  try {
    // Read file as base64
    const fileData = await Filesystem.readFile({
      path: fileUri,
    });

    // Convert base64 to ArrayBuffer
    let arrayBuffer: ArrayBuffer;
    if (typeof fileData.data === "string") {
      const binary = atob(fileData.data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      arrayBuffer = bytes.buffer;
    } else {
      // Blob
      arrayBuffer = await (fileData.data as Blob).arrayBuffer();
    }

    // Dynamically import music-metadata-browser to avoid SSR issues
    const mm = await import("music-metadata-browser");
    const metadata = await mm.parseBuffer(
      new Uint8Array(arrayBuffer),
      { mimeType: getMimeType(fileName) },
      { duration: true, skipCovers: false }
    );

    const common = metadata.common;

    // Extract album art
    let albumArt: string | undefined;
    if (common.picture && common.picture.length > 0) {
      const pic = common.picture[0];
      const base64 = uint8ArrayToBase64(pic.data);
      albumArt = `data:${pic.format};base64,${base64}`;
    }

    return {
      title: common.title || defaults.title,
      artist: common.artist || defaults.artist,
      album: common.album || defaults.album,
      genre: common.genre?.[0] || defaults.genre,
      duration: metadata.format.duration
        ? Math.round(metadata.format.duration)
        : defaults.duration,
      albumArt,
    };
  } catch (err) {
    console.warn("Metadata extraction failed for", fileName, err);
    return defaults;
  }
}

function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop();
  const mimeMap: Record<string, string> = {
    mp3: "audio/mpeg",
    wav: "audio/wav",
    aac: "audio/aac",
    flac: "audio/flac",
    ogg: "audio/ogg",
    m4a: "audio/mp4",
    wma: "audio/x-ms-wma",
    opus: "audio/opus",
    webm: "audio/webm",
  };
  return mimeMap[ext || ""] || "audio/mpeg";
}

function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

export interface ScanProgress {
  phase: "scanning" | "extracting" | "done";
  current: number;
  total: number;
  currentFile?: string;
}

/**
 * Main scan function: discovers audio files, extracts metadata, returns Song[].
 * Calls onProgress for UI updates.
 */
export async function scanDeviceForMusic(
  onProgress?: (progress: ScanProgress) => void
): Promise<Song[]> {
  if (!Capacitor.isNativePlatform()) {
    console.log("Not on native platform — returning empty (use mock data)");
    return [];
  }

  onProgress?.({ phase: "scanning", current: 0, total: 0 });

  // Scan all directories in parallel
  const scanPromises = SCAN_DIRECTORIES.map((dir) =>
    scanDirectory(dir, Directory.ExternalStorage)
  );
  const results = await Promise.all(scanPromises);
  const allFiles = results.flat();

  // Deduplicate by URI
  const uniqueFiles = Array.from(
    new Map(allFiles.map((f) => [f.uri, f])).values()
  );

  onProgress?.({
    phase: "extracting",
    current: 0,
    total: uniqueFiles.length,
  });

  // Extract metadata in batches of 5 for performance
  const songs: Song[] = [];
  const BATCH_SIZE = 5;

  for (let i = 0; i < uniqueFiles.length; i += BATCH_SIZE) {
    const batch = uniqueFiles.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (file, batchIdx) => {
        onProgress?.({
          phase: "extracting",
          current: i + batchIdx + 1,
          total: uniqueFiles.length,
          currentFile: file.name,
        });

        const meta = await extractMetadata(file.uri, file.name);
        const song: Song = {
          id: file.uri,
          title: meta.title,
          artist: meta.artist,
          album: meta.album,
          genre: meta.genre,
          duration: meta.duration,
          fileSize: file.size,
          filePath: file.uri,
          albumArt: meta.albumArt,
          format: getFormat(file.name),
        };
        return song;
      })
    );
    songs.push(...batchResults);
  }

  onProgress?.({ phase: "done", current: songs.length, total: songs.length });

  return songs.sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Check if we're running on a native platform.
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}
