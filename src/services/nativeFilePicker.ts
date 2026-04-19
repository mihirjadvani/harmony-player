import { Capacitor } from "@capacitor/core";
import { FilePicker } from "@capawesome/capacitor-file-picker";
import { Song } from "@/types/music";
import { enrichMetadata } from "./metadataEnricher";

const AUDIO_MIME_TYPES = ["audio/*"];
const AUDIO_EXTENSIONS = ["mp3", "wav", "aac", "m4a", "flac", "ogg", "opus"];

function getFormat(filename: string): string {
  return filename.split(".").pop()?.toUpperCase() || "UNKNOWN";
}

function titleFromFilename(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
}

function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, i + chunkSize);
    for (let j = 0; j < chunk.length; j++) {
      binary += String.fromCharCode(chunk[j]);
    }
  }
  return btoa(binary);
}

export function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

/**
 * Open Android's system document picker (ACTION_OPEN_DOCUMENT) restricted to audio/*.
 * This avoids the gallery/camera and shows the file manager (Internal storage, Downloads, Music).
 */
export async function pickAudioFilesNative(
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<Song[]> {
  const result = await FilePicker.pickFiles({
    types: AUDIO_MIME_TYPES,
    readData: true,
    limit: 0, // 0 = no limit / multi-select
  });

  const picked = result.files.filter((f) => {
    const name = (f.name || "").toLowerCase();
    return AUDIO_EXTENSIONS.some((ext) => name.endsWith(`.${ext}`));
  });

  const songs: Song[] = [];

  for (let i = 0; i < picked.length; i++) {
    const file = picked[i];
    onProgress?.(i + 1, picked.length, file.name);

    let title = titleFromFilename(file.name);
    let artist = "Unknown Artist";
    let album = "Unknown Album";
    let genre: string | undefined;
    let duration = 0;
    let albumArt: string | undefined;
    let audioSrc: string | undefined;

    try {
      let arrayBuffer: ArrayBuffer | undefined;

      if (file.data) {
        // base64
        const binary = atob(file.data);
        const bytes = new Uint8Array(binary.length);
        for (let j = 0; j < binary.length; j++) bytes[j] = binary.charCodeAt(j);
        arrayBuffer = bytes.buffer;
      } else if (file.path) {
        // Fall back to native path -> convertFileSrc for playback
        audioSrc = Capacitor.convertFileSrc(file.path);
      }

      if (arrayBuffer) {
        const blob = new Blob([arrayBuffer], { type: file.mimeType || "audio/mpeg" });
        audioSrc = URL.createObjectURL(blob);

        const mm = await import("music-metadata-browser");
        const metadata = await mm.parseBuffer(
          new Uint8Array(arrayBuffer),
          { mimeType: file.mimeType || "audio/mpeg" },
          { duration: true, skipCovers: false }
        );
        const common = metadata.common;
        if (common.title) title = common.title;
        if (common.artist) artist = common.artist;
        if (common.album) album = common.album;
        if (common.genre?.[0]) genre = common.genre[0];
        if (metadata.format.duration) duration = Math.round(metadata.format.duration);
        if (common.picture && common.picture.length > 0) {
          const pic = common.picture[0];
          albumArt = `data:${pic.format};base64,${uint8ArrayToBase64(pic.data)}`;
        }
      }
    } catch (err) {
      console.warn("Native metadata extraction failed for", file.name, err);
    }

    try {
      const enriched = await enrichMetadata({
        fileName: file.name,
        title,
        artist,
        album,
        albumArt,
      });
      title = enriched.title || title;
      artist = enriched.artist || artist;
      album = enriched.album || album;
      albumArt = enriched.albumArt || albumArt;
    } catch (err) {
      console.warn("Enrichment failed for", file.name, err);
    }

    songs.push({
      id: `native-${Date.now()}-${i}`,
      title,
      artist,
      album,
      genre,
      duration,
      fileSize: file.size || 0,
      filePath: file.path || file.name,
      albumArt,
      format: getFormat(file.name),
      audioSrc: audioSrc || "",
    });
  }

  return songs;
}

/**
 * Pick a folder using ACTION_OPEN_DOCUMENT_TREE — currently the FilePicker plugin
 * exposes pickDirectory which returns the tree URI but not children. As a practical
 * fallback we trigger pickFiles with multi-select (user can select all in folder).
 */
export async function pickAudioFolderNative(
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<Song[]> {
  // pickFiles already lets the user navigate folders in the system file manager
  // and select multiple audio files at once.
  return pickAudioFilesNative(onProgress);
}
