export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre?: string;
  duration: number; // seconds
  fileSize: number; // bytes
  filePath: string;
  albumArt?: string; // base64 or URI
  format: string;
  audioSrc?: string; // blob URL for web playback
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  coverArt?: string;
  createdAt: Date;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  queue: Song[];
  queueIndex: number;
}
