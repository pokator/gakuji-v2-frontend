import { useEffect, useState, useMemo } from 'react';
import { X, Bookmark, Trash2, Search } from 'lucide-react';
import { BookmarkedWordCard } from './BookmarkedWordCard';
import { BookmarkedKanjiCard } from './BookmarkedKanjiCard';
import { FilterDropdown } from '../ui/FilterDropdown';
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
  const [isClosing, setIsClosing] = useState(false);
  const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const { lists: userLists } = useLists();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'words' | 'kanji'>('words');

  // Switch to available tab if current tab has no items
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
    if (activeTab === 'words' && bookmarks.words.length === 0 && bookmarks.kanji.length > 0) {
      setActiveTab('kanji');
    } else if (activeTab === 'kanji' && bookmarks.kanji.length === 0 && bookmarks.words.length > 0) {
      setActiveTab('words');
    }
  }, [bookmarks.words.length, bookmarks.kanji.length, activeTab, isOpen]);

  useEffect(() => {
    setIsClosing(false);
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

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

  // Helper to get entry for a word
  const getEntryForWordBookmark = (bookmark: BookmarkedWord): WordEntry | undefined => {
    const entries = getWordData(appData, bookmark.word);
    if (entries[0]) return entries[0];

    const cachedByWord = cache.getWord(bookmark.word);
    if (cachedByWord) return cachedByWord as WordEntry;

    if (bookmark.idseq != null) {
      const entry = fetchedWords[String(bookmark.idseq)] ?? undefined;
      if (entry) return entry as WordEntry;

      const cachedById = cache.getWord(String(bookmark.idseq));
      if (cachedById) return cachedById as WordEntry;
    }

    return undefined;
  };

  const bookmarkMatchesSearch = (bookmark: BookmarkedWord | BookmarkedKanji): boolean => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();

    if ('word' in bookmark) {
      // It's a BookmarkedWord
      const word = bookmark.word.toLowerCase();
      const furigana = bookmark.furigana.toLowerCase();
      
      if (word.includes(query) || furigana.includes(query)) return true;

      // Search in definitions
      const entry = getEntryForWordBookmark(bookmark);
      if (entry) {
        return entry.definitions.some(def =>
          def.definition.some(d => d.toLowerCase().includes(query))
        );
      }
      return false;
    } else {
      // It's a BookmarkedKanji
      const char = bookmark.char.toLowerCase();
      if (char.includes(query)) return true;

      const meanings = (bookmark.meanings || []).map(m => m.toLowerCase());
      if (meanings.some(m => m.includes(query))) return true;

      const readings = [
        ...(bookmark.readings_on || []),
        ...(bookmark.readings_kun || []),
        ...(bookmark.radicals || [])
      ].map(r => r.toLowerCase());
      
      return readings.some(r => r.includes(query));
    }
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
          className={`panel-overlay ${isClosing ? 'closing' : ''}`}
          onClick={handleClose}
        />
      )}

      {/* Panel */}
      <div 
        className={`
          fixed inset-y-0 right-0 z-40 w-full md:w-96 panel-bg text-surface-text shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-border
          ${isOpen && !isClosing ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bookmarks-header">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <Bookmark className="bookmarks-header-icon" fill="currentColor" />
                <h2 className="bookmarks-header-title">Bookmarks</h2>
              </div>
              <button 
                onClick={handleClose}
                className="bookmarks-close-btn"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="bookmarks-header-subtitle">
                {totalBookmarks} {totalBookmarks === 1 ? 'item' : 'items'} saved
              </p>
               {isLoading && (
                 <div className="text-xs text-muted italic">Refreshing…</div>
               )}
              {totalBookmarks > 0 && (
                <button
                  onClick={onClearAll}
                  className="btn btn-danger text-xs px-2 py-1"
                >
                  <Trash2 size={12} />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="bookmarks-content">
            {totalBookmarks === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Bookmark className="w-16 h-16 text-muted mb-4" />
                <p className="text-muted text-sm mb-2">No bookmarks yet</p>
                <p className="text-muted text-xs">
                  Click the bookmark icon on words or kanji to save them here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search & Filter Section */}
                <div className="rounded-lg border border-border bg-surface/50 duration-200">
                  {/* Search Input */}
                  <div className="px-3 py-2">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-2.5 text-muted pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search bookmarks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border-0 rounded bg-background text-text placeholder-muted focus:outline-none focus:bg-surface transition-colors"
                      />
                    </div>
                  </div>

                  {/* Filter Dropdown */}
                  <div className="px-3 py-2 border-t border-border/50 transition-colors bookmarks-filter-section">
                    <FilterDropdown
                      value={selectedFilter}
                      onChange={setSelectedFilter}
                      options={[
                        { id: 'all', name: 'All lists' },
                        { id: 'nolists', name: 'No list' },
                        ...availableFilters
                      ]}
                      label=""
                    />
                  </div>
                </div>

                {/* Results counter */}
                {searchQuery.trim() && (
                  <div className="px-1 py-1 text-xs text-muted opacity-100 transition-opacity duration-200">
                    {(() => {
                      const wordMatches = bookmarks.words.filter((b) => bookmarkMatchesFilter(b) && bookmarkMatchesSearch(b)).length;
                      const kanjiMatches = bookmarks.kanji.filter((b) => bookmarkMatchesFilter(b) && bookmarkMatchesSearch(b)).length;
                      const total = wordMatches + kanjiMatches;
                      return total === 0 ? 'No matches found' : `${total} match${total !== 1 ? 'es' : ''} found`;
                    })()}
                  </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 border-b border-border/50">
                  {bookmarks.words.length > 0 && (
                    <button
                      onClick={() => setActiveTab('words')}
                      className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-0.5 ${
                        activeTab === 'words'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted hover:text-text'
                      }`}
                    >
                      Words{' '}
                      <span className="text-xs">
                        ({bookmarks.words.filter((b) => bookmarkMatchesFilter(b) && bookmarkMatchesSearch(b)).length})
                      </span>
                    </button>
                  )}
                  {bookmarks.kanji.length > 0 && (
                    <button
                      onClick={() => setActiveTab('kanji')}
                      className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-0.5 ${
                        activeTab === 'kanji'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted hover:text-text'
                      }`}
                    >
                      Kanji{' '}
                      <span className="text-xs">
                        ({bookmarks.kanji.filter((b) => bookmarkMatchesFilter(b) && bookmarkMatchesSearch(b)).length})
                      </span>
                    </button>
                  )}
                </div>
                {/* Words Tab Content */}
                {activeTab === 'words' && bookmarks.words.length > 0 && (
                  <div className="space-y-2">
                    {bookmarks.words
                      .filter(b => bookmarkMatchesFilter(b) && bookmarkMatchesSearch(b))
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
                    {bookmarks.words.filter(b => bookmarkMatchesFilter(b) && bookmarkMatchesSearch(b)).length === 0 && (
                      <div className="text-center py-8 text-muted text-sm">No words match your search</div>
                    )}
                  </div>
                )}

                {/* Kanji Tab Content */}
                {activeTab === 'kanji' && bookmarks.kanji.length > 0 && (
                  <div className="space-y-2">
                    {bookmarks.kanji
                      .filter(b => bookmarkMatchesFilter(b) && bookmarkMatchesSearch(b))
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .map((bookmark) => (
                        <BookmarkedKanjiCard
                          key={bookmark.char}
                          bookmark={bookmark}
                          onRemove={onRemoveKanji}
                          onOpenListPicker={() => onOpenListPicker?.('kanji', bookmark.char)}
                        />
                      ))}
                    {bookmarks.kanji.filter(b => bookmarkMatchesFilter(b) && bookmarkMatchesSearch(b)).length === 0 && (
                      <div className="text-center py-8 text-muted text-sm">No kanji match your search</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};