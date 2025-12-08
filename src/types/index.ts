export interface Definition {
  pos: string[];
  definition: string[];
}

export type LineTuple = [ja: string, en: string];

export interface WordEntry {
  idseq: number;
  word: string;
  furigana: string;
  definitions: Definition[];
  // lines: LineTuple[];
}

export interface KanjiData {
  jlpt_new?: number;
  meanings: string[];
  readings_on: string[];
  readings_kun: string[];
  radicals?: string[];
}

export interface AppData {
  lyrics_lines: string[][];
  word_map: Record<string, WordEntry[]>;
  kanji_data: Record<string, KanjiData>;
  translated_lines: [string, string][];
}

export interface BookmarkedWord {
  word: string;
  furigana: string;
  timestamp: number;
  // optional idseq when the bookmark refers to a word id from the backend
  idseq?: number | string;
  // lists this bookmark belongs to (fetched via bookmark_lists)
  lists?: { id: number | string; name: string }[];
}

export interface BookmarkedKanji {
  char: string;
  meanings: string[];
  // Onyomi readings (Chinese-derived)
  readings_on?: string[];
  // Kunyomi readings (native Japanese)
  readings_kun?: string[];
  // Optional JLPT level (1-5)
  jlpt_new?: number;
  // Optional radicals for quick recognition
  radicals?: string[];
  timestamp: number;
  // lists this bookmark belongs to (fetched via bookmark_lists)
  lists?: { id: number | string; name: string }[];
}

export interface Bookmarks {
  words: BookmarkedWord[];
  kanji: BookmarkedKanji[];
}

export interface SavedSong {
  id: string;
  title?: string | null;
  artist?: string | null;
  lyrics: string;
  createdAt: number; // ms since epoch
  lastProcessedAt?: number | null;
  appData?: AppData | null;
}