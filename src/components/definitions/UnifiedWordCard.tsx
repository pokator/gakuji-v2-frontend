import { useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { BookmarkButton } from '../bookmarks/BookmarkButton';
import { getKanjiInWord } from '../../utils/dataHelpers';
import type { AppData, WordEntry, BookmarkedKanji } from '../../types';
import { KanjiCard } from '../kanji/KanjiCard';

interface UnifiedWordCardProps {
  selectedWord: string;
  entries: WordEntry[];
  appData: AppData | null;
  isWordBookmarked: (word: string) => boolean;
  isKanjiBookmarked: (char: string) => boolean;
  onToggleWordBookmark: (word: string, furigana: string, idseq?: number) => void;
  onToggleKanjiBookmark: (charOrBookmark: string | BookmarkedKanji) => void;
  onOpenListPicker?: (bookmarkType: 'word' | 'kanji', key: string) => void;
}

export const UnifiedWordCard = ({
  selectedWord,
  entries,
  appData,
  isWordBookmarked,
  isKanjiBookmarked,
  onToggleWordBookmark,
  onToggleKanjiBookmark,
  onOpenListPicker,
}: UnifiedWordCardProps) => {
  const [currentDefinitionIndex, setCurrentDefinitionIndex] = useState(0);
  const kanjiList = getKanjiInWord(appData, selectedWord);

  if (entries.length === 0) {
    return (
      <div className="card-word card-word-unified">
        <div className="p-4 bg-bg rounded-lg text-sm text-muted italic text-center text-surface-text">
          No dictionary definitions found for this specific token.
        </div>
      </div>
    );
  }

  const currentEntry = entries[currentDefinitionIndex];
  const hasMultipleDefinitions = entries.length > 1;

  const handlePrevious = () => {
    setCurrentDefinitionIndex((prev) =>
      prev === 0 ? entries.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentDefinitionIndex((prev) =>
      prev === entries.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="card-word card-word-unified">
      {/* Header with word and navigation */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="text-lg font-bold text-primary font-sans">
            {currentEntry.word}
          </div>
          <div className="text-sm text-muted font-mono bg-surface px-2 py-0.5 rounded text-surface-text">
            {currentEntry.furigana}
          </div>
        </div>
        <BookmarkButton
          isBookmarked={isWordBookmarked(selectedWord)}
          onClick={() => {
            onToggleWordBookmark(selectedWord, currentEntry.furigana, currentEntry.idseq);
          }}
          onOpenListPicker={() => onOpenListPicker?.('word', String(currentEntry.idseq ?? selectedWord))}
          size="sm"
        />
      </div>

      {/* Definition content */}
      <div className="space-y-2 mb-4">
        {currentEntry.definitions.map((def, idx) => (
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
        ))}
      </div>

      {/* Navigation and Jisho link */}
      <div className="flex justify-between items-center mb-4 pb-3 ">
        <div className="flex items-center gap-2">
          {hasMultipleDefinitions && (
            <>
              <button
                onClick={handlePrevious}
                className="p-1 rounded hover:bg-surface transition-colors"
                aria-label="Previous definition"
              >
                <ChevronLeft size={16} className="text-text" />
              </button>
              <span className="text-xs text-muted px-2">
                {currentDefinitionIndex + 1} / {entries.length}
              </span>
              <button
                onClick={handleNext}
                className="p-1 rounded hover:bg-surface transition-colors"
                aria-label="Next definition"
              >
                <ChevronRight size={16} className="text-text" />
              </button>
            </>
          )}
        </div>
        <a
          href={`https://jisho.org/search/${encodeURIComponent(currentEntry.word)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center"
          aria-label={`Open ${currentEntry.word} on Jisho (opens in a new tab)`}
        >
          <ExternalLink className="h-4 w-4" />
          <span className="ml-1">Jisho</span>
        </a>
      </div>

      {/* Kanji breakdown section */}
      {kanjiList.length > 0 && (
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-secondary mb-3">
            Kanji Breakdown
          </h4>
          <div className="space-y-2">
            {kanjiList.map((item, idx) => (
              <KanjiCard
                key={idx}
                char={item.char}
                data={item.data}
                isBookmarked={isKanjiBookmarked(item.char)}
                onToggleBookmark={onToggleKanjiBookmark}
                onOpenListPicker={onOpenListPicker}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
