import { WordToken } from './WordToken';
import { Edit2 } from 'lucide-react';
import type { AppData } from '../../types';

interface LyricsDisplayProps {
  lyricsLines: string[][];
  selectedWord: string | null;
  wordMap: AppData['word_map'];
  onWordClick: (word: string, line: string[]) => void;
  onEdit?: () => void;
}

export const LyricsDisplay = ({ lyricsLines, selectedWord, wordMap, onWordClick, onEdit }: LyricsDisplayProps) => {
  return (
    <div className="relative bg-surface rounded-xl shadow-sm border border-border p-8 md:p-12 w-full max-w-3xl text-surface-text">
      {onEdit ? (
        <div className="absolute right-4 top-4">
          <button
            onClick={onEdit}
            aria-label="Edit lyrics"
            className="p-2 bg-surface text-surface-text hover:opacity-90 rounded border border-border flex items-center justify-center"
          >
            <Edit2 className="w-4 h-4 text-muted" />
          </button>
        </div>
      ) : null}
      <div className="space-y-6">
        {lyricsLines.map((line, lineIdx) => (
          <div key={lineIdx} className="flex flex-wrap items-end gap-x-1 gap-y-2 leading-relaxed text-2xl md:text-3xl font-medium text-text">
            {line.map((word, wordIdx) => (
              <WordToken
                key={`${lineIdx}-${wordIdx}`}
                word={word}
                isSelected={selectedWord === word}
                hasDefinitions={wordMap[word]?.length > 0}
                onClick={() => onWordClick(word, line)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};