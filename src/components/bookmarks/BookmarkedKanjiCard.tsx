import {List, Bookmark } from 'lucide-react';
import type { BookmarkedKanji } from '../../types';

interface BookmarkedKanjiCardProps {
  bookmark: BookmarkedKanji;
  onRemove: (char: string) => void;
  onOpenListPicker?: () => void;
}

export const BookmarkedKanjiCard = ({ bookmark, onRemove, onOpenListPicker }: BookmarkedKanjiCardProps) => (
  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-all group">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3 flex-1">
        <div className="text-3xl font-serif text-amber-900 bg-white rounded w-10 h-10 flex items-center justify-center border border-amber-100">
          {bookmark.char}
        </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap gap-1">
              {bookmark.meanings.slice(0, 3).map((m, i) => (
                <span key={i} className="text-xs font-medium text-amber-800 bg-amber-100/50 px-1.5 py-0.5 rounded">
                  {m}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {bookmark.readings_on && bookmark.readings_on.length > 0 && (
                <span className="text-[10px] text-amber-800 bg-amber-100/40 px-2 py-0.5 rounded">On: {bookmark.readings_on.slice(0,2).join(', ')}</span>
              )}

              {bookmark.readings_kun && bookmark.readings_kun.length > 0 && (
                <span className="text-[10px] text-amber-800 bg-amber-100/40 px-2 py-0.5 rounded">Kun: {bookmark.readings_kun.slice(0,2).join(', ')}</span>
              )}

              {bookmark.jlpt_new && (
                <span className="text-[10px] font-semibold text-amber-900 bg-amber-200 px-2 py-0.5 rounded">N{bookmark.jlpt_new}</span>
              )}
            </div>

            {bookmark.radicals && bookmark.radicals.length > 0 && (
              <div className="text-[11px] text-amber-700/90 mt-1">Radicals: {bookmark.radicals.join(' ')}</div>
            )}
            {bookmark.lists && bookmark.lists.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {bookmark.lists.filter(l => String(l.name).toLowerCase() !== 'default').map(l => (
                  <span key={String(l.id)} className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded">{l.name}</span>
                ))}
              </div>
            )}
          </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onOpenListPicker?.()}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
          title="Manage lists"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => onRemove(bookmark.char)}
          className="p-1 rounded-full transition-all duration-200 text-yellow-500 hover:text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
          title="Remove bookmark"
        >
          <Bookmark size={16} fill='currentColor' />
        </button>
      </div>
    </div>
  </div>
);