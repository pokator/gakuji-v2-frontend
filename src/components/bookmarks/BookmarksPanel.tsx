import { useEffect, useState, useMemo } from 'react';
import { X, Bookmark, Trash2 } from 'lucide-react';
import { BookmarkedWordCard } from './BookmarkedWordCard';
import { BookmarkedKanjiCard } from './BookmarkedKanjiCard';
import { getWordData } from '../../utils/dataHelpers';
import { useLists } from '../../hooks/useLists';
import { cache } from '../../utils/cache';
import type { Bookmarks, AppData, WordEntry, BookmarkedWord, BookmarkedKanji } from '../../types';

interface BookmarksPanelProps {
  isOpen: boolean;
  bookmarks: Bookmarks;
  appData: AppData | null;
  isLoading?: boolean;
  onClose: () => void;
  onToggleWordBookmark: (word: string, furigana: string, idseq?: number) => void;
  onRemoveKanji: (char: string) => void;
  onClearAll: () => void;
  onOpenListPicker?: (bookmarkType: 'word' | 'kanji', key: string) => void;
}

export const BookmarksPanel = ({
  isOpen,
  bookmarks,
  appData,
  isLoading = false,
  onClose,
  onToggleWordBookmark,
  onRemoveKanji,
  onClearAll
  ,onOpenListPicker
}: BookmarksPanelProps) => {
  const totalBookmarks = bookmarks.words.length + bookmarks.kanji.length;
  const [fetchedWords, setFetchedWords] = useState<Record<string, WordEntry | null>>({});
  const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const { lists: userLists } = useLists();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const availableFilters = useMemo(() => {
    const opts: { id: string; name: string }[] = [];
    // include lists from user's lists
    (userLists || []).forEach(l => opts.push({ id: String(l.id), name: l.name }));
    return opts;
  }, [userLists]);

  const bookmarkMatchesFilter = (bookmark: BookmarkedWord | BookmarkedKanji) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'nolists') return !bookmark.lists || bookmark.lists.length === 0;
    // match by id string
    const ls = bookmark.lists || [];
    return ls.some((l) => String(l.id) === String(selectedFilter));
  };

  // Fetch missing WordEntry items (when appData doesn't contain them)
  useEffect(() => {
    const missing = bookmarks.words.filter(b => {
      const entries = getWordData(appData, b.word);
      const hasLocal = entries && entries.length > 0;
      const hasFetched = b.idseq != null && fetchedWords[String(b.idseq)] !== undefined;
      return !hasLocal && b.idseq != null && !hasFetched;
    });

    if (missing.length === 0) return;

    missing.forEach(async (b) => {
      const id = String(b.idseq);
      try {
        // Check cache first
        const cached = cache.getWord(id);
        if (cached) {
          setFetchedWords(prev => ({ ...prev, [id]: cached }));
          return;
        }
        const res = await fetch(`${BACKEND_BASE}/word/${encodeURIComponent(id)}`);
        if (!res.ok) {
          console.error('[BookmarksPanel] failed fetching word', { id, status: res.status });
          setFetchedWords(prev => ({ ...prev, [id]: null }));
          return;
        }
        const data: WordEntry = await res.json();
        setFetchedWords(prev => ({ ...prev, [id]: data }));
        try {
          cache.setWord(id, data);
        } catch { /* ignore cache persist error */ }
      } catch (err) {
        console.error('[BookmarksPanel] error fetching word', err);
        setFetchedWords(prev => ({ ...prev, [id]: null }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmarks.words, appData]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div 
        className={`
          fixed inset-y-0 right-0 z-40 w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-gray-100
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-amber-50">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <Bookmark className="text-yellow-600 w-6 h-6" fill="currentColor" />
                <h2 className="text-xl font-bold text-gray-900">Bookmarks</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {totalBookmarks} {totalBookmarks === 1 ? 'item' : 'items'} saved
              </p>
               {isLoading && (
                 <div className="text-xs text-gray-500 italic">Refreshing…</div>
               )}
              {totalBookmarks > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                >
                  <Trash2 size={12} />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {totalBookmarks === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Bookmark className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm mb-2">No bookmarks yet</p>
                <p className="text-gray-400 text-xs">
                  Click the bookmark icon on words or kanji to save them here
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <label className="text-sm text-gray-600">Filter:</label>
                  <select className="text-sm border px-2 py-1 rounded" value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
                    <option value="all">All lists</option>
                    <option value="nolists">No list</option>
                    {availableFilters.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                {/* Words Section */}
                {bookmarks.words.length > 0 && (
                  <section>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 mb-3 flex items-center gap-2">
                      <span>Words</span>
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        {bookmarks.words.length}
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {bookmarks.words
                        .filter(bookmarkMatchesFilter)
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .map((bookmark) => {
                          const entries = getWordData(appData, bookmark.word);
                          let entry: WordEntry | undefined = entries[0];

                          // fallback to cached word by exact word key
                          if (!entry) {
                            const cachedByWord = cache.getWord(bookmark.word);
                            if (cachedByWord) entry = cachedByWord as WordEntry;
                          }

                          // fallback to fetched word by idseq (if available)
                          if (!entry && bookmark.idseq != null) {
                            entry = (fetchedWords[String(bookmark.idseq)] ?? undefined) as WordEntry | undefined;
                            // also try cache by idseq string
                            if (!entry) {
                              const cachedById = cache.getWord(String(bookmark.idseq));
                              if (cachedById) entry = cachedById as WordEntry;
                            }
                          }

                          // final fallback: build a minimal entry so the UI can show something
                          if (!entry) {
                            const fallback: WordEntry = {
                              idseq: typeof bookmark.idseq === 'number' ? bookmark.idseq : Number(bookmark.idseq ?? 0),
                              word: bookmark.word,
                              furigana: bookmark.furigana,
                              definitions: []
                            };
                            entry = fallback;
                          }

                          return (
                            <BookmarkedWordCard
                              key={`${bookmark.word}-${String(bookmark.idseq ?? '')}`}
                              entry={entry}
                              isBookmarked={true}
                              onToggleBookmark={onToggleWordBookmark}
                              onOpenListPicker={() => onOpenListPicker?.('word', String(bookmark.idseq ?? bookmark.word))}
                              lists={bookmark.lists}
                            />
                          );
                        })}
                    </div>
                  </section>
                )}

                {/* Kanji Section */}
                {bookmarks.kanji.length > 0 && (
                  <section>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600 mb-3 flex items-center gap-2">
                      <span>Kanji</span>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        {bookmarks.kanji.length}
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {bookmarks.kanji
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .map((bookmark) => (
                          <BookmarkedKanjiCard
                            key={bookmark.char}
                            bookmark={bookmark}
                            onRemove={onRemoveKanji}
                            onOpenListPicker={() => onOpenListPicker?.('kanji', bookmark.char)}
                          />
                        ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};