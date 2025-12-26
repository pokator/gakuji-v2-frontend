import type { SavedSong, AppData } from '../types';

const KEY = 'gakuji:saved_songs_v1';

function safeParse(input: string | null) {
  if (!input) return [] as SavedSong[];
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) return parsed;
    return [] as SavedSong[];
  } catch (err) {
    console.error('Failed to parse saved songs from localStorage', err);
    return [] as SavedSong[];
  }
}

export function listSongs(): SavedSong[] {
  const raw = localStorage.getItem(KEY);
  return safeParse(raw).sort((a, b) => b.createdAt - a.createdAt);
}

export function saveSong({ title, artist, lyrics, appData }: { title?: string | null; artist?: string | null; lyrics: string; appData?: AppData | null }): SavedSong {
  const list = listSongs();
  const id = String(Date.now()) + Math.random().toString(36).slice(2, 8);
  const song: SavedSong = {
    id,
    title: title ?? null,
    artist: artist ?? null,
    lyrics,
    createdAt: Date.now(),
    lastProcessedAt: null,
    appData: appData ?? null,
  };
  list.unshift(song);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save song to localStorage', err);
  }
  return song;
}

export function loadSong(id: string): SavedSong | undefined {
  const list = listSongs();
  return list.find(s => s.id === id);
}

export function deleteSong(id: string): void {
  const list = listSongs().filter(s => s.id !== id);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to delete saved song from localStorage', err);
  }
}

export function updateSong(id: string, { title, artist, lyrics, appData, lastProcessedAt }: { title?: string | null; artist?: string | null; lyrics?: string; appData?: AppData | null; lastProcessedAt?: number | null }): SavedSong | undefined {
  const list = listSongs();
  const idx = list.findIndex(s => s.id === id);
  if (idx === -1) return undefined;
  const existing = list[idx];
  const updated: SavedSong = {
    ...existing,
    title: title === undefined ? existing.title : title,
    artist: artist === undefined ? existing.artist : artist,
    lyrics: lyrics === undefined ? existing.lyrics : lyrics,
    appData: appData === undefined ? existing.appData : appData,
    lastProcessedAt: lastProcessedAt === undefined ? existing.lastProcessedAt ?? null : lastProcessedAt,
  };
  list[idx] = updated;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to update saved song in localStorage', err);
  }
  return updated;
}

export function clearAllSongs(): void {
  try {
    localStorage.removeItem(KEY);
  } catch (err) {
    console.error('Failed to clear saved songs', err);
  }
}
