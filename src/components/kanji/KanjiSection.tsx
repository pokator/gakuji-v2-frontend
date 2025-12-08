import { Type } from 'lucide-react';
import { KanjiCard } from './KanjiCard';
import { getKanjiInWord } from '../../utils/dataHelpers';
import type { AppData, BookmarkedKanji } from '../../types';

interface KanjiSectionProps {
  selectedWord: string;
  appData: AppData | null;
  isKanjiBookmarked: (char: string) => boolean;
  onToggleKanjiBookmark: (char: string, meanings: string[]) => void;
  onOpenListPicker?: (bookmarkType: 'word' | 'kanji', key: string) => void;
}

export const KanjiSection = ({ 
  selectedWord, 
  appData,
  isKanjiBookmarked,
  onToggleKanjiBookmark,
  onOpenListPicker
}: KanjiSectionProps) => {
  const kanjiList = getKanjiInWord(appData, selectedWord);

  const handleToggleBookmark = (charOrBookmark: string | BookmarkedKanji, meanings?: string[]) => {
    const char = typeof charOrBookmark === 'string' ? charOrBookmark : charOrBookmark.char;
    onToggleKanjiBookmark(char, meanings ?? []);
  };
  
  return (
    <section>
      <div className="flex items-center gap-2 mb-3 text-amber-600">
        <Type size={16} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Kanji Breakdown</h3>
      </div>

      {kanjiList.length > 0 ? (
        kanjiList.map((item, idx) => (
          <KanjiCard 
            key={idx} 
            char={item.char} 
            data={item.data}
            isBookmarked={isKanjiBookmarked(item.char)}
            onToggleBookmark={handleToggleBookmark}
            onOpenListPicker={onOpenListPicker}
          />
        ))
      ) : (
        <div className="p-4 bg-amber-50/50 rounded-lg text-sm text-amber-800/60 italic text-center">
          No Kanji characters detected in this word.
        </div>
      )}
    </section>
  );
};