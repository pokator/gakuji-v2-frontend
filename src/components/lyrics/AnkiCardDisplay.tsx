import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { AnkiCard, KanjiData } from '../../types';
import { KanjiCard } from '../kanji/KanjiCard';
import {
  extractKanjiFromText,
  fetchMultipleKanjiData,
} from '../../utils/ankiHelper';

interface AnkiCardDisplayProps {
  card: AnkiCard;
  onRemove: () => void;
}

interface RelatedKanjiItem {
  char: string;
  data: KanjiData;
}

export const AnkiCardDisplay = ({
  card,
  onRemove,
}: AnkiCardDisplayProps) => {
  const [relatedKanji, setRelatedKanji] = useState<RelatedKanjiItem[]>([]);
  const [isLoadingKanji, setIsLoadingKanji] = useState(false);

  // Fetch related kanji from the word itself if word has no kanji in kanjiList
  useEffect(() => {
    if (card.kanjiList.length > 0) {
      // Word already has kanji breakdown from word_map, no need to fetch
      setRelatedKanji([]);
      return;
    }

    // Extract kanji from the word itself (card.word)
    const kanjiFromWord = extractKanjiFromText(card.word);
    
    if (kanjiFromWord.length === 0) {
      // No kanji in the word
      setRelatedKanji([]);
      return;
    }

    const loadKanjiData = async () => {
      setIsLoadingKanji(true);
      try {
        const kanjiData = await fetchMultipleKanjiData(kanjiFromWord);
        setRelatedKanji(kanjiData);
      } catch (error) {
        console.error('[AnkiCardDisplay] failed to fetch kanji:', error);
        setRelatedKanji([]);
      } finally {
        setIsLoadingKanji(false);
      }
    };

    loadKanjiData();
  }, [card]);
  return (
    <div className="card-word">
      {/* Header with word, furigana, and close button */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="text-lg font-bold text-primary font-sans">
            {card.word}
          </div>
          <div className="text-sm text-muted font-mono bg-surface px-2 py-0.5 rounded text-surface-text">
            {card.furigana}
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-1 rounded hover:bg-surface transition-colors text-muted hover:text-text"
          aria-label="Remove from Anki cards"
        >
          <X size={18} />
        </button>
      </div>

      {/* Definitions */}
      <div className="space-y-2 mb-4">
        {card.definitions.length > 0 ? (
          card.definitions.map((def, idx) => (
            <div key={idx} className="text-sm">
              <div className="flex flex-wrap gap-1 mb-1">
                {def.pos.map((p, pIdx) => (
                  <span
                    key={pIdx}
                    className="text-[10px] uppercase font-bold tracking-wider text-primary bg-surface px-1.5 py-0.5 rounded"
                  >
                    {p.split(" ")[0]}
                  </span>
                ))}
              </div>
              <ul className="list-disc list-inside text-text pl-1">
                {def.definition.map((d, dIdx) => (
                  <li key={dIdx} className="leading-tight mb-0.5">
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted italic">No definitions found</p>
        )}
      </div>

      {/* Context line */}
      {card.contextLine && (
        <div className="mb-4 pb-4 border-b border-border/50">
          <p className="text-xs uppercase font-bold tracking-wider text-secondary mb-1">Context</p>
          <p className="text-sm text-text">{card.contextLine}</p>
          {card.contextTranslation && (
            <p className="text-xs text-muted italic mt-1">{card.contextTranslation}</p>
          )}
        </div>
      )}

      {/* Kanji breakdown */}
      {card.kanjiList.length > 0 && (
        <div>
          <h4 className="text-xs uppercase font-bold tracking-wider text-secondary mb-3">
            Kanji Breakdown
          </h4>
          <div className="space-y-2">
            {card.kanjiList.map((item, idx) => (
              <KanjiCard
                key={idx}
                char={item.char}
                data={item.data}
                isBookmarked={false}
                onToggleBookmark={() => {}}
                onOpenListPicker={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Related kanji from definitions (when word has no kanji) */}
      {card.kanjiList.length === 0 && relatedKanji.length > 0 && (
        <div>
          <h4 className="text-xs uppercase font-bold tracking-wider text-secondary mb-3">
            Related Kanji
          </h4>
          <div className="space-y-2">
            {relatedKanji.map((item, idx) => (
              <KanjiCard
                key={idx}
                char={item.char}
                data={item.data}
                isBookmarked={false}
                onToggleBookmark={() => {}}
                onOpenListPicker={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading state for related kanji */}
      {card.kanjiList.length === 0 && isLoadingKanji && (
        <div>
          <h4 className="text-xs uppercase font-bold tracking-wider text-secondary mb-3">
            Related Kanji
          </h4>
          <p className="text-xs text-muted italic">Loading kanji data...</p>
        </div>
      )}
    </div>
  );
};
