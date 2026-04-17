/**
 * Metadata enrichment: smart filename parsing + iTunes Search API fallback.
 * iTunes API is free, requires no key, supports CORS, and returns album art.
 */

interface EnrichedMetadata {
  title?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
}

// Cache to avoid repeated network lookups for the same query
const lookupCache = new Map<string, EnrichedMetadata | null>();

/**
 * Parse "Artist - Title" / "Title - Artist" / "01. Artist - Title" patterns from filename.
 */
export function parseFilename(filename: string): { title: string; artist?: string } {
  // strip extension
  let name = filename.replace(/\.[^/.]+$/, "");
  // strip leading track numbers like "01. " or "01 - "
  name = name.replace(/^\s*\d{1,3}\s*[\.\-_)]\s*/, "");
  // normalize separators
  name = name.replace(/_/g, " ").trim();

  // Try "Artist - Title" pattern
  const dashSplit = name.split(/\s+[-–—]\s+/);
  if (dashSplit.length >= 2) {
    const [first, ...rest] = dashSplit;
    return {
      artist: first.trim(),
      title: rest.join(" - ").trim(),
    };
  }

  return { title: name };
}

/**
 * Lookup metadata via iTunes Search API.
 * Returns artist, album, and album art (high-res).
 */
export async function lookupITunes(
  title: string,
  artist?: string
): Promise<EnrichedMetadata | null> {
  const query = artist ? `${artist} ${title}` : title;
  const cacheKey = query.toLowerCase();

  if (lookupCache.has(cacheKey)) {
    return lookupCache.get(cacheKey) || null;
  }

  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
      query
    )}&media=music&entity=song&limit=1`;
    const res = await fetch(url);
    if (!res.ok) {
      lookupCache.set(cacheKey, null);
      return null;
    }
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      lookupCache.set(cacheKey, null);
      return null;
    }
    const r = data.results[0];
    const enriched: EnrichedMetadata = {
      title: r.trackName,
      artist: r.artistName,
      album: r.collectionName,
      // Replace 100x100 with 600x600 for hi-res cover
      albumArt: r.artworkUrl100
        ? r.artworkUrl100.replace("100x100", "600x600")
        : undefined,
    };
    lookupCache.set(cacheKey, enriched);
    return enriched;
  } catch (err) {
    console.warn("iTunes lookup failed:", err);
    lookupCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Enrich a song's metadata: prefer existing tags; if any are missing/unknown,
 * try filename parsing and online lookup.
 */
export async function enrichMetadata(input: {
  fileName: string;
  title?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
}): Promise<EnrichedMetadata> {
  const isUnknown = (v?: string) =>
    !v || /^unknown/i.test(v.trim()) || v.trim() === "";

  const needsArtist = isUnknown(input.artist);
  const needsAlbum = isUnknown(input.album);
  const needsArt = !input.albumArt;

  // Nothing missing → return as-is
  if (!needsArtist && !needsAlbum && !needsArt) {
    return {
      title: input.title,
      artist: input.artist,
      album: input.album,
      albumArt: input.albumArt,
    };
  }

  // Parse filename for clues
  const parsed = parseFilename(input.fileName);
  const titleGuess =
    !isUnknown(input.title) ? input.title! : parsed.title;
  const artistGuess =
    !isUnknown(input.artist) ? input.artist! : parsed.artist;

  // Online lookup
  const online = await lookupITunes(titleGuess, artistGuess);

  return {
    title: !isUnknown(input.title) ? input.title : online?.title || parsed.title,
    artist: !isUnknown(input.artist)
      ? input.artist
      : online?.artist || parsed.artist || "Unknown Artist",
    album: !isUnknown(input.album)
      ? input.album
      : online?.album || "Unknown Album",
    albumArt: input.albumArt || online?.albumArt,
  };
}
