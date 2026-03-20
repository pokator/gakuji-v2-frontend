import { List, Bookmark, ExternalLink } from 'lucide-react';
import type { BookmarkedKanji } from '../../types';

interface BookmarkedKanjiCardProps {
  bookmark: BookmarkedKanji;
  onRemove: (char: string) => void;
  onOpenListPicker?: () => void;
}

export const BookmarkedKanjiCard = ({ bookmark, onRemove, onOpenListPicker }: BookmarkedKanjiCardProps) => (
  <div className="card-kanji">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="text-3xl font-serif bg-warning-bg/30 rounded w-10 h-10 flex items-center justify-center border border-warning-text/20 flex-shrink-0">
          {bookmark.char}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex flex-wrap gap-1 mb-1">
            {bookmark.meanings.slice(0, 3).map((m, i) => (
              <span key={i} className="text-xs font-medium text-warning-text bg-warning-text/20 px-1.5 py-0.5 rounded">
                {m}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {bookmark.readings_on && bookmark.readings_on.length > 0 && (
              <span className="text-[10px] text-warning-text bg-warning-text/20 px-2 py-0.5 rounded">On: {bookmark.readings_on.slice(0,2).join(', ')}</span>
            )}

            {bookmark.readings_kun && bookmark.readings_kun.length > 0 && (
              <span className="text-[10px] text-warning-text bg-warning-text/20 px-2 py-0.5 rounded">Kun: {bookmark.readings_kun.slice(0,2).join(', ')}</span>
            )}

            {bookmark.jlpt_new && (
              <span className="text-[10px] font-semibold text-warning-text bg-warning-text/20 px-2 py-0.5 rounded">N{bookmark.jlpt_new}</span>
            )}
          </div>

          {bookmark.lists && bookmark.lists.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {bookmark.lists.filter(l => String(l.name).toLowerCase() !== 'default').map(l => (
                <span key={String(l.id)} className="card-list-name-badge">{l.name}</span>
              ))}
            </div>
          )}
        </div>
      </div>
        <div className="flex items-center gap-2">
        <button
          onClick={() => onOpenListPicker?.()}
          className="card-list-picker-btn"
          title="Manage lists"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => onRemove(bookmark.char)}
          className="card-bookmark-btn bookmarked"
          title="Remove bookmark"
        >
          <Bookmark size={16} fill='currentColor' />
        </button>
      </div>
    </div>
    <div className="mt-2 grid grid-cols-2 items-center text-xs gap-2">
      <div>
        {bookmark.radicals && bookmark.radicals.length > 0 && (
          <div className="text-[11px] text-warning-text">Radicals: {bookmark.radicals.join(' ')}</div>
        )}
      </div>

      <div className="justify-self-end">
        <a
          href={`https://jisho.org/search/${encodeURIComponent(`${bookmark.char} #kanji`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-warning-text hover:underline"
          aria-label={`Open ${bookmark.char} on Jisho (kanji)`}
        >
          <ExternalLink className="h-4 w-4" />
          <span>Jisho</span>
        </a>
      </div>
    </div>
  </div>
);