import type { AppData, WordEntry, KanjiData, BookmarkedKanji } from '../types';

export const getWordData = (appData: AppData | null, word: string): WordEntry[] => {
  return appData?.word_map[word] || [];
};

export const getKanjiInWord = (appData: AppData | null, word: string) => {
  if (!word || !appData) return [];
  return word.split('').map(char => {
    const data = appData.kanji_data[char];
    return data ? { char, data } : null;
  }).filter((item): item is { char: string; data: KanjiData } => item !== null);
};

export const buildBookmarkedKanji = (char: string, appData: AppData | null): BookmarkedKanji => {
  const data = appData?.kanji_data?.[char];
  const now = Date.now();
  return {
    char,
    meanings: data?.meanings || [],
    readings_on: data?.readings_on,
    readings_kun: data?.readings_kun,
    jlpt_new: data?.jlpt_new,
    radicals: data?.radicals,
    timestamp: now,
  };
};