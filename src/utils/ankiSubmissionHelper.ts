import type { AnkiCard, AnkiKanjiCard, Definition } from '../types';

/**
 * Backend request/response types for Anki submission
 */
export interface BackendWordPayload {
  deck_name: string;
  words: {
    word: string;
    furigana: string;
    definitions: string[];
    kanji_in_word: {
      kanji: string;
      onyomi: string[];
      kunyomi: string[];
      meanings: string[];
    }[];
  }[];
  model_name: string;
  field_mapping: Record<string, string>;
}

export interface BackendKanjiPayload {
  deck_name: string;
  kanji: {
    kanji: string;
    onyomi: string[];
    kunyomi: string[];
    definitions: string[];
    radicals?: string;
    jlpt_level?: string;
  }[];
  model_name: string;
  field_mapping: Record<string, string>;
}

export interface AnkiBatchResponse {
  success: boolean;
  message: string;
  added_count?: number;
  failed_count?: number;
  errors?: string[];
}

/**
 * Flattens a Definition array to a simple string array
 * Concatenates all definition strings, filtering out empty ones
 */
const flattenDefinitions = (definitions: Definition[]): string[] => {
  const result: string[] = [];
  definitions.forEach(def => {
    def.definition.forEach(d => {
      if (d.trim()) {
        result.push(d.trim());
      }
    });
  });
  return result;
};

/**
 * Transforms AnkiCard[] into the backend word submission format
 */
export const transformCardsToBackendFormat = (
  cards: AnkiCard[],
  deckName: string
): BackendWordPayload => {
  const words = cards.map(card => ({
    word: card.word,
    furigana: card.furigana,
    definitions: flattenDefinitions(card.definitions),
    kanji_in_word: card.kanjiList.map(kanjiItem => ({
      kanji: kanjiItem.char,
      onyomi: kanjiItem.data.readings_on || [],
      kunyomi: kanjiItem.data.readings_kun || [],
      meanings: kanjiItem.data.meanings || [],
    })),
  }));

  return {
    deck_name: deckName,
    words,
    model_name: 'Word',
    field_mapping: {},
  };
};

/**
 * Transforms AnkiKanjiCard[] into the backend kanji submission format
 */
export const transformKanjiToBackendFormat = (
  kanji: AnkiKanjiCard[],
  deckName: string
): BackendKanjiPayload => {
  const kanjiItems = kanji.map(item => {
    const kanjiObj: {
      kanji: string;
      onyomi: string[];
      kunyomi: string[];
      definitions: string[];
      radicals?: string;
      jlpt_level?: string;
    } = {
      kanji: item.char,
      onyomi: item.data.readings_on || [],
      kunyomi: item.data.readings_kun || [],
      definitions: item.data.meanings || [],
    };

    // Add radicals as a single string (join array with comma separator)
    if (item.data.radicals && item.data.radicals.length > 0) {
      kanjiObj.radicals = item.data.radicals.join(', ');
    }

    // Add jlpt_level as optional string
    if (item.data.jlpt_new !== undefined && item.data.jlpt_new !== null) {
      kanjiObj.jlpt_level = String(item.data.jlpt_new);
    }

    return kanjiObj;
  });

  return {
    deck_name: deckName,
    kanji: kanjiItems,
    model_name: 'Kanji',
    field_mapping: {},
  };
};

/**
 * Returns the default deck name based on the model type
 */
export const getDefaultDeckName = (modelType: 'words' | 'kanji'): string => {
  return modelType === 'words' ? 'Gakuji Words' : 'Gakuji Kanji';
};

/**
 * Validates that a deck name is not empty
 */
export const validateDeckName = (deckName: string): { valid: boolean; error?: string } => {
  if (!deckName || !deckName.trim()) {
    return {
      valid: false,
      error: 'Deck name cannot be empty',
    };
  }
  return { valid: true };
};
