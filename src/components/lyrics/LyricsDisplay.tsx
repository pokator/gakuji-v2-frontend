import { WordToken } from './WordToken';
import type { AppData } from '../../types';

interface LyricsDisplayProps {
  lyricsLines: string[][];
  selectedWord: string | null;
  wordMap: AppData['word_map'];
  onWordClick: (word: string, line: string[]) => void;
}

export const LyricsDisplay = ({ lyricsLines, selectedWord, wordMap, onWordClick }: LyricsDisplayProps) => {
  console.log(lyricsLines);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 md:p-12 w-full max-w-3xl">
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