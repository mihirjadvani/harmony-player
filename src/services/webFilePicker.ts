import { Song } from "@/types/music";

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

/**
 * Parse audio files selected from a file input, extract metadata + album art,
 * and return Song objects with blob URLs for playback.
 */
export async function parseAudioFiles(
  files: FileList,
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<Song[]> {
  const songs: Song[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(i + 1, files.length, file.name);

    // Create blob URL for playback
    const audioSrc = URL.createObjectURL(file);

    // Default values
    let title = titleFromFilename(file.name);
    let artist = "Unknown Artist";
    let album = "Unknown Album";
    let genre: string | undefined;
    let duration = 0;
    let albumArt: string | undefined;

    try {
      // Get duration from Audio element
      duration = await getAudioDuration(audioSrc);
    } catch {
      // ignore
    }

    try {
      // Extract metadata via music-metadata-browser
      const mm = await import("music-metadata-browser");
      const metadata = await mm.parseBlob(file, { skipCovers: false });
      const common = metadata.common;

      if (common.title) title = common.title;
      if (common.artist) artist = common.artist;
      if (common.album) album = common.album;
      if (common.genre?.[0]) genre = common.genre[0];
      if (metadata.format.duration) duration = Math.round(metadata.format.duration);

      // Extract album art
      if (common.picture && common.picture.length > 0) {
        const pic = common.picture[0];
        const base64 = uint8ArrayToBase64(pic.data);
        albumArt = `data:${pic.format};base64,${base64}`;
      }
    } catch (err) {
      console.warn("Metadata extraction failed for", file.name, err);
    }

    songs.push({
      id: `web-${Date.now()}-${i}`,
      title,
      artist,
      album,
      genre,
      duration,
      fileSize: file.size,
      filePath: file.name,
      albumArt,
      format: getFormat(file.name),
      audioSrc,
    });
  }

  return songs;
}

function getAudioDuration(src: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      resolve(Math.round(audio.duration));
      audio.src = "";
    };
    audio.onerror = reject;
    audio.src = src;
  });
}

/**
 * Open a file picker dialog for audio files.
 * Returns the FileList or null if cancelled.
 */
export function openAudioFilePicker(): Promise<FileList | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "audio/*,.mp3,.wav,.aac,.flac,.ogg,.m4a,.wma,.opus,.webm";
    input.onchange = () => resolve(input.files);
    input.oncancel = () => resolve(null);
    input.click();
  });
}

/**
 * Open a folder picker (if supported) for scanning entire folders.
 */
export function openFolderPicker(): Promise<FileList | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "audio/*,.mp3,.wav,.aac,.flac,.ogg,.m4a,.wma,.opus,.webm";
    (input as any).webkitdirectory = true;
    input.onchange = () => {
      // Filter to only audio files
      if (input.files) {
        resolve(input.files);
      } else {
        resolve(null);
      }
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}
