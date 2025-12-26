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
    <div className="relative bg-white rounded-xl shadow-sm border border-slate-100 p-8 md:p-12 w-full max-w-3xl">
      {onEdit ? (
        <div className="absolute right-4 top-4">
          <button
            onClick={onEdit}
            aria-label="Edit lyrics"
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded border border-slate-100 flex items-center justify-center"
          >
            <Edit2 className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      ) : null}
      <div className="space-y-6">
        {lyricsLines.map((line, lineIdx) => (
          <div key={lineIdx} className="flex flex-wrap items-end gap-x-1 gap-y-2 leading-relaxed text-2xl md:text-3xl font-medium text-slate-700">
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