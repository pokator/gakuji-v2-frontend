import type { KanjiData, BookmarkedKanji } from '../../types';
import { BookmarkButton } from '../bookmarks/BookmarkButton';

interface KanjiCardProps {
  char: string;
  data: KanjiData;
  isBookmarked: boolean;
  // accepts either (char, meanings) or a full BookmarkedKanji object
  onToggleBookmark: (charOrBookmark: string | BookmarkedKanji, meanings?: string[]) => void;
  onOpenListPicker?: (bookmarkType: 'word' | 'kanji', key: string) => void;
}

export const KanjiCard = ({ char, data, isBookmarked, onToggleBookmark, onOpenListPicker }: KanjiCardProps) => (
  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-3 shadow-sm">
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-center gap-3">
        <div className="text-4xl font-serif text-amber-900 bg-white rounded w-12 h-12 flex items-center justify-center border border-amber-100">
          {char}
        </div>
        <div>
          <div className="flex flex-wrap gap-1 mb-1">
            {data.meanings.slice(0, 3).map((m, i) => (
              <span key={i} className="text-xs font-medium text-amber-800 bg-amber-100/50 px-1.5 py-0.5 rounded">{m}</span>
            ))}
          </div>
          {data.jlpt_new && (
            <span className="text-[10px] font-bold text-amber-600 border border-amber-200 px-1 rounded">
              N{data.jlpt_new}
            </span>
          )}
        </div>
      </div>
      <BookmarkButton
        isBookmarked={isBookmarked}
        onClick={() => {
          onToggleBookmark({
            char,
            meanings: data.meanings,
            readings_on: data.readings_on,
            readings_kun: data.readings_kun,
            jlpt_new: data.jlpt_new,
            radicals: data.radicals,
            timestamp: Date.now()
          });
        }}
        onOpenListPicker={() => onOpenListPicker?.('kanji', char)}
        size="sm"
      />
    </div>

    <div className="grid grid-cols-2 gap-2 text-xs mt-3">
      <div className="bg-white/60 p-2 rounded">
        <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">Onyomi</div>
        <div className="text-gray-800">{data.readings_on.join('、 ') || '-'}</div>
      </div>
      <div className="bg-white/60 p-2 rounded">
        <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">Kunyomi</div>
        <div className="text-gray-800">{data.readings_kun.join('、 ') || '-'}</div>
      </div>
    </div>
    
    {data.radicals && (
       <div className="mt-2 text-xs text-amber-700/70 flex gap-1 items-center">
          <span className="font-bold">Radicals:</span> {data.radicals.join(', ')}
       </div>
    )}
  </div>
);