import type { AppData, AnkiCard, Definition, KanjiData } from '../types';
import { getKanjiInWord } from './dataHelpers';
import { cache } from './cache';

/**
 * Converts the active song into Anki cards.
 * Each word from the lyrics becomes a card with its definitions, context, and kanji.
 */
export const convertSongToAnkiCards = (appData: AppData): AnkiCard[] => {
  const cards: AnkiCard[] = [];

  appData.lyrics_lines.forEach((line, lineIndex) => {
    const contextLine = line.join('');
    const contextTranslation = appData.translated_lines[lineIndex]?.[1];

    line.forEach((word) => {
      // Get all word entries for this word
      const entries = appData.word_map[word] || [];

      if (entries.length === 0) {
        // No definition found, skip
        return;
      }

      // Filter definitions to exact matches (word === word token)
      // If multiple exact matches, concatenate their definitions and furigana
      const exactMatches = entries.filter(entry => entry.word === word);
      
      let selectedDefinitions: Definition[];
      let selectedFurigana: string;
      let selectedEntry = entries[0];

      if (exactMatches.length > 0) {
        // Concatenate all exact match definitions
        selectedDefinitions = [];
        exactMatches.forEach(entry => {
          selectedDefinitions.push(...entry.definitions);
        });
        // Concatenate furigana with divider
        selectedFurigana = exactMatches.map(entry => entry.furigana).join(' / ');
        selectedEntry = exactMatches[0];
      } else {
        // No exact match, use first entry's definitions
        selectedDefinitions = entries[0].definitions;
        selectedFurigana = entries[0].furigana;
      }

      // Get kanji list for this word
      const kanjiList = getKanjiInWord(appData, word);

      const card: AnkiCard = {
        word: selectedEntry.word,
        furigana: selectedFurigana,
        definitions: selectedDefinitions,
        contextLine,
        contextTranslation,
        kanjiList,
        idseq: selectedEntry.idseq,
        lineIndex,
      };

      cards.push(card);
    });
  });

  return cards;
};

/**
 * Removes duplicate Anki cards based on word + furigana combination.
 * Keeps the first occurrence of each unique word.
 */
export const deduplicateAnkiCards = (cards: AnkiCard[]): AnkiCard[] => {
  const seen = new Set<string>();
  const deduplicated: AnkiCard[] = [];

  cards.forEach(card => {
    const key = `${card.word}:${card.furigana}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(card);
    }
  });

  return deduplicated;
};

/**
 * Extracts unique kanji characters from text using comprehensive Unicode ranges:
 * - U+3400–U+4DBF: CJK Unified Ideographs Extension A
 * - U+4E00–U+9FAF: CJK Unified Ideographs (common and uncommon)
 */
export const extractKanjiFromText = (text: string): string[] => {
  const kanjiPattern = /[\u3400-\u4DBF\u4E00-\u9FAF]/g;
  const matches = text.match(kanjiPattern);
  return [...new Set(matches || [])]; // unique kanji only
};

/**
 * Extracts all unique kanji from a definitions array.
 */
export const extractKanjiFromDefinitions = (definitions: Definition[]): string[] => {
  const allKanji = new Set<string>();

  definitions.forEach(definition => {
    definition.definition.forEach(def => {
      const kanji = extractKanjiFromText(def);
      kanji.forEach(k => allKanji.add(k));
    });
  });

  return Array.from(allKanji);
};

/**
 * Fetches kanji data from backend with caching.
 * Returns undefined if fetch fails or character is invalid.
 */
export const fetchKanjiData = async (char: string): Promise<KanjiData | undefined> => {
  // Check cache first
  const cached = cache.getKanji(char);
  if (cached) {
    return cached;
  }

  try {
    const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(
      `${BACKEND_BASE}/kanji/${encodeURIComponent(char)}`
    );

    if (!response.ok) {
      return undefined;
    }

    let data = await response.json();

    // Normalize response format - backend can return 3 different formats
    if (data.data) {
      data = data.data;
    } else if (data.kanji_info) {
      data = data.kanji_info;
    }

    // Cache the result
    if (data && typeof data === 'object') {
      cache.setKanji(char, data as KanjiData);
      return data as KanjiData;
    }

    return undefined;
  } catch (error) {
    console.warn(`[ankiHelper] failed to fetch kanji data for ${char}:`, error);
    return undefined;
  }
};

/**
 * Fetches kanji data for multiple characters in parallel.
 * Returns an array of { char, data } objects, filtering out failed fetches.
 */
export const fetchMultipleKanjiData = async (
  chars: string[]
): Promise<Array<{ char: string; data: KanjiData }>> => {
  const results = await Promise.all(
    chars.map(async (char) => {
      const data = await fetchKanjiData(char);
      return data ? { char, data } : null;
    })
  );

  // Filter out null results
  return results.filter(
    (result): result is { char: string; data: KanjiData } => result !== null
  );
};

/**
 * Collects all distinct kanji from an array of Anki cards.
 * Returns unique kanji characters sorted alphabetically.
 */
export const collectDistinctKanjiFromCards = (cards: AnkiCard[]): string[] => {
  const kanjiSet = new Set<string>();

  cards.forEach(card => {
    // Add kanji from kanjiList (from word)
    card.kanjiList.forEach(item => {
      kanjiSet.add(item.char);
    });

    // Also extract any kanji from the word itself (in case kanjiList is empty)
    const wordKanji = extractKanjiFromText(card.word);
    wordKanji.forEach(char => kanjiSet.add(char));
  });

  // Return sorted unique kanji
  return Array.from(kanjiSet).sort();
};

/**
 * Builds kanji cards with data from a list of kanji characters.
 * Fetches data for any kanji that doesn't have it cached.
 */
export const buildAnkiKanjiCards = async (
  kanjiChars: string[]
): Promise<Array<{ char: string; data: KanjiData | undefined }>> => {
  const results = await Promise.all(
    kanjiChars.map(async (char) => {
      const data = await fetchKanjiData(char);
      return { char, data };
    })
  );
  return results;
};
