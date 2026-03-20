import { Type } from 'lucide-react';
import { KanjiCard } from './KanjiCard';
import { getKanjiInWord } from '../../utils/dataHelpers';
import type { AppData, BookmarkedKanji } from '../../types';

interface KanjiSectionProps {
  selectedWord: string;
  appData: AppData | null;
  isKanjiBookmarked: (char: string) => boolean;
  onToggleKanjiBookmark: (charOrBookmark: string | BookmarkedKanji) => void;
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

  const handleToggleBookmark = (charOrBookmark: string | BookmarkedKanji) => {
    onToggleKanjiBookmark(charOrBookmark);
  };
  
  return (
    <section>
      <div className="flex items-center gap-2 mb-3 text-secondary">
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
        <div className="p-4 rounded-lg text-sm italic text-muted text-center" style={{ backgroundColor: 'rgba(var(--color-warning-rgb),0.07)' }}>
          No Kanji characters detected in this word.
        </div>
      )}
    </section>
  );
};