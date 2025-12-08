import { Book } from 'lucide-react';
import { DefinitionCard } from './DefinitionCard';
import { getWordData } from '../../utils/dataHelpers';
import type { AppData } from '../../types';

interface DefinitionsSectionProps {
  selectedWord: string;
  appData: AppData | null;
  isWordBookmarked: (word: string) => boolean;
  onToggleWordBookmark: (word: string, furigana: string, idseq?: number) => void;
  onOpenListPicker?: (bookmarkType: 'word' | 'kanji', key: string) => void;
}

export const DefinitionsSection = ({ 
  selectedWord, 
  appData,
  isWordBookmarked,
  onToggleWordBookmark,
  onOpenListPicker
}: DefinitionsSectionProps) => {
  const wordData = getWordData(appData, selectedWord);
  
  return (
    <section>
      <div className="flex items-center gap-2 mb-3 text-indigo-600">
        <Book size={16} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Definitions</h3>
      </div>
      
      {wordData.length > 0 ? (
        wordData.map((entry, idx) => (
          <DefinitionCard 
            key={idx} 
            entry={entry}
            selectedWord={selectedWord}
            isBookmarked={isWordBookmarked(selectedWord)}
            onToggleBookmark={onToggleWordBookmark}
            onOpenListPicker={() => onOpenListPicker?.('word', String(entry.idseq ?? selectedWord))}
          />
        ))
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500 italic text-center">
          No dictionary definitions found for this specific token.
        </div>
      )}
    </section>
  );
};