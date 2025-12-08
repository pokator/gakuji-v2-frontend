import type { WordEntry, KanjiData } from '../types';

// Simple in-memory maps with sessionStorage persistence
const WORDS_KEY = 'gakuji_cache_words_v1';
const KANJI_KEY = 'gakuji_cache_kanji_v1';

const wordMap = new Map<string, WordEntry>();
const kanjiMap = new Map<string, KanjiData>();

function loadFromStorage() {
  try {
    const w = sessionStorage.getItem(WORDS_KEY);
    if (w) {
      const obj = JSON.parse(w) as Record<string, WordEntry>;
      Object.entries(obj).forEach(([k, v]) => wordMap.set(k, v));
    }
  } catch (err) {
    console.warn('[cache] failed to load words from sessionStorage', err);
  }
  try {
    const k = sessionStorage.getItem(KANJI_KEY);
    if (k) {
      const obj = JSON.parse(k) as Record<string, KanjiData>;
      Object.entries(obj).forEach(([ch, v]) => kanjiMap.set(ch, v));
    }
  } catch (err) {
    console.warn('[cache] failed to load kanji from sessionStorage', err);
  }
}

function persistWords() {
  try {
    const obj: Record<string, WordEntry> = {};
    wordMap.forEach((v, k) => (obj[k] = v));
    sessionStorage.setItem(WORDS_KEY, JSON.stringify(obj));
  } catch (err) {
    console.warn('[cache] failed to persist words', err);
  }
}

function persistKanji() {
  try {
    const obj: Record<string, KanjiData> = {};
    kanjiMap.forEach((v, k) => (obj[k] = v));
    sessionStorage.setItem(KANJI_KEY, JSON.stringify(obj));
  } catch (err) {
    console.warn('[cache] failed to persist kanji', err);
  }
}

// initialize from sessionStorage
if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
  loadFromStorage();
}

export const cache = {
  getWord: (id: string | number): WordEntry | undefined => {
    const key = String(id);
    return wordMap.get(key);
  },
  setWord: (id: string | number, entry: WordEntry) => {
    const key = String(id);
    wordMap.set(key, entry);
    // persist async-ish
    try {
      persistWords();
    } catch {}
  },
  getKanji: (char: string): KanjiData | undefined => {
    return kanjiMap.get(String(char));
  },
  setKanji: (char: string, data: KanjiData) => {
    kanjiMap.set(String(char), data);
    try {
      persistKanji();
    } catch {}
  },
  clear: () => {
    wordMap.clear();
    kanjiMap.clear();
    try {
      sessionStorage.removeItem(WORDS_KEY);
      sessionStorage.removeItem(KANJI_KEY);
    } catch {}
  }
  ,
  // remove a single word entry from the cache
  removeWord: (id: string | number) => {
    try {
      const key = String(id);
      wordMap.delete(key);
      persistWords();
    } catch (err) {
      console.warn('[cache] failed to remove word', err);
    }
  },
  // remove a single kanji entry from the cache
  removeKanji: (char: string) => {
    try {
      const key = String(char);
      kanjiMap.delete(key);
      persistKanji();
    } catch (err) {
      console.warn('[cache] failed to remove kanji', err);
    }
  }
};

export default cache;
