import { useState, useEffect } from "react";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { MobileOverlay } from "./components/layout/MobileOverlay";
import { BookmarksPanel } from "./components/bookmarks/BookmarksPanel";
import ListPicker from "./components/bookmarks/ListPicker";
import { LyricsDisplay } from "./components/lyrics/LyricsDisplay";
import { AnkiCardsPanel } from "./components/lyrics/AnkiCardsPanel";
import { getWordData } from './utils/dataHelpers';
import { convertSongToAnkiCards, deduplicateAnkiCards } from './utils/ankiHelper';
import type { WordEntry, AnkiCard } from './types';
import SongsManagerModal from './components/lyrics/SongsManagerModal';
import { listSongs } from './utils/savedSongs';
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import Toasts from './components/ui/Toast';
import { Loader } from 'lucide-react';
import { ErrorDisplay } from "./components/ui/ErrorDisplay";
import { useAppData } from "./hooks/useAppData";
import { useBookmarks } from "./hooks/useBookmarks";
import { useAuth } from "./hooks/useAuth";
import { useTheme } from "./hooks/useTheme";
import AuthModal from "./components/auth/AuthModal";
// saved songs handled inside SongsManagerModal

const App = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { appData, loading, processing, error, processLyrics, clearLyrics, rawLyrics, syncLyrics } = useAppData(!!user, user?.id ?? null); 
  const {
    bookmarks,
    isLoading: bookmarksLoading,
    isWordBookmarked,
    isKanjiBookmarked,
    toggleWordBookmark,
    toggleKanjiBookmark,
    removeKanjiBookmark,
    clearAllBookmarks,
    addBookmarkToList,
    removeBookmarkFromList,
    getListsForBookmark,
    refresh: refreshBookmarks,
  } = useBookmarks();
  const [songsManagerOpen, setSongsManagerOpen] = useState(false);
  const [songsManagerOriginal, setSongsManagerOriginal] = useState<string | null>(null);
  const [songsManagerInitialTitle, setSongsManagerInitialTitle] = useState<string | null>(null);
  const [songsManagerInitialArtist, setSongsManagerInitialArtist] = useState<string | null>(null);
  const [listPickerOpen, setListPickerOpen] = useState(false);
  const [pickerBookmarkType, setPickerBookmarkType] = useState<'word' | 'kanji' | null>(null);
  const [pickerKey, setPickerKey] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: 'success'|'error'|'info' }>>([]);

  

  const pushToast = (message: string, type: 'success'|'error'|'info' = 'info') => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2,8);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const openListPicker = (type: 'word' | 'kanji', key: string) => {
    setPickerBookmarkType(type);
    setPickerKey(key);
    setListPickerOpen(true);
  };
  const closeListPicker = () => {
    setListPickerOpen(false);
    setPickerBookmarkType(null);
    setPickerKey(null);
  };

  // Handler passed to SongsManagerModal. If `songsManagerOriginal` is set we call `syncLyrics`,
  // otherwise we call `processLyrics`. Returns the processed appData when available.
  const handleSongsManagerProcess = async (lyrics: string) => {
    if (songsManagerOriginal) {
      try {
        const data = await syncLyrics(songsManagerOriginal, lyrics);
        pushToast('Lyrics synced', 'success');
        return data;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        pushToast(msg || 'Failed to sync lyrics', 'error');
        throw err;
      }
    } else {
      try {
        await processLyrics(lyrics);
        pushToast('Lyrics processed', 'success');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        pushToast(msg || 'Failed to process lyrics', 'error');
        throw err;
      }
    }
  };
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<string[] | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<WordEntry | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookmarksPanelOpen, setBookmarksPanelOpen] = useState(false);
  const [ankiCards, setAnkiCards] = useState<AnkiCard[]>([]);
  const [removedAnkiCards, setRemovedAnkiCards] = useState<AnkiCard[]>([]);
  const [ankiPanelOpen, setAnkiPanelOpen] = useState(false);

  // initialize theme (applies persisted dataset to <html>)
  useTheme();

  // Clear Anki cards when lyrics change
  useEffect(() => {
    setAnkiCards([]);
    setRemovedAnkiCards([]);
    setAnkiPanelOpen(false);
  }, [appData]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl/Cmd+Shift+<key> shortcuts: V = paste lyrics, B = bookmarks, S = sidebar
      if (!(e.ctrlKey || e.metaKey) || !e.shiftKey) return;
      const key = (e.key || '').toLowerCase();
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || (target.getAttribute && target.getAttribute('contenteditable') === 'true'))) {
        return;
      }
      if (key === 'v') {
        e.preventDefault();
        setSongsManagerOpen(true);
        return;
      }
      if (key === 'b') {
        e.preventDefault();
        setBookmarksPanelOpen(prev => {
          const next = !prev;
          if (next) setSidebarOpen(false);
          return next;
        });
        return;
      }
      if (key === 's') {
        e.preventDefault();
        setSidebarOpen(prev => {
          const next = !prev;
          if (next) setBookmarksPanelOpen(false);
          return next;
        });
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);


  const handleWordClick = (word: string, line: string[]) => {
    if (selectedWord === word && sidebarOpen) {
      setSidebarOpen(false);
      setTimeout(() => {
        setSelectedWord(null);
        setSelectedLine(null);
        setSelectedTranslation(null);
      }, 300);
    } else {
      if (!appData) {
        setSelectedWord(word);
        setSelectedLine(line);
        setSelectedTranslation(null);
        setSelectedEntry(null);
        setSidebarOpen(true);
        setBookmarksPanelOpen(false);
        setAnkiPanelOpen(false);
        return;
      }
      const lineIndex = appData.lyrics_lines.findIndex(l => l === line);
      const translation = appData.translated_lines[lineIndex]?.[1] || null;
      // derive the WordEntry for this word (if available) so Sidebar can still show definitions
      const entries = getWordData(appData, word);
      setSelectedEntry(entries && entries.length > 0 ? entries[0] : null);
      setSelectedWord(word);
      setSelectedLine(line);
      setSelectedTranslation(translation);
      setSidebarOpen(true);
      setBookmarksPanelOpen(false);
      setAnkiPanelOpen(false);
    }
  };
  const handleBookmarksClick = () => {
    setBookmarksPanelOpen(!bookmarksPanelOpen);
    if (!bookmarksPanelOpen) {
      setSidebarOpen(false);
      setAnkiPanelOpen(false);
    }
  };
  const handleSongsManagerClick = () => {
    setSongsManagerOpen(prev => !prev);
    if (!songsManagerOpen) {
      setSidebarOpen(false);
      setAnkiPanelOpen(false);
    }
  };

  const handleConvertToAnki = () => {
    // If panel is already open, just close it
    if (ankiPanelOpen) {
      setAnkiPanelOpen(false);
      return;
    }

    if (!appData) {
      pushToast('No lyrics loaded', 'error');
      return;
    }

    try {
      const cards = convertSongToAnkiCards(appData);
      const deduplicated = deduplicateAnkiCards(cards);
      
      // Filter out cards that are in the removed list to preserve removed state
      const activeCards = deduplicated.filter(newCard =>
        !removedAnkiCards.some(
          removedCard =>
            removedCard.word === newCard.word &&
            removedCard.furigana === newCard.furigana &&
            removedCard.lineIndex === newCard.lineIndex
        )
      );

      setAnkiCards(activeCards);
      // Keep the removed cards - don't clear them
      setAnkiPanelOpen(true);
      setSidebarOpen(false);
      setBookmarksPanelOpen(false);
      pushToast(`Converted ${deduplicated.length} cards (${activeCards.length} active)`, 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      pushToast(msg || 'Failed to convert to Anki', 'error');
      console.error('Error converting to Anki:', err);
    }
  };

  const handleRemoveAnkiCard = (card: AnkiCard) => {
    setAnkiCards(prev => prev.filter(c => !(c.word === card.word && c.furigana === card.furigana && c.lineIndex === card.lineIndex)));
    setRemovedAnkiCards(prev => [...prev, card]);
  };

  const handleRestoreAnkiCard = (card: AnkiCard) => {
    setRemovedAnkiCards(prev => prev.filter(c => !(c.word === card.word && c.furigana === card.furigana && c.lineIndex === card.lineIndex)));
    setAnkiCards(prev => [...prev, card]);
  };
  if (authLoading || loading) return <LoadingSpinner />;
  if (!user) return <AuthModal isOpen={true} />;
  const totalBookmarks = bookmarks.words.length + bookmarks.kanji.length;
  // determine active song metadata from saved songs if the current cached lyrics match a saved song
  let activeTitle: string | null = null;
  let activeArtist: string | null = null;
  try {
    const LS_KEY_BASE = 'gakuji:lastLyrics';
    const lsKey = user?.id ? `${LS_KEY_BASE}:${user.id}` : `${LS_KEY_BASE}:anon`;
    const cachedLyrics = (() => {
      try { return localStorage.getItem(lsKey); } catch { return null; }
    })();
    if (cachedLyrics) {
      try {
        const songs = listSongs();
        const match = songs.find(s => s.lyrics === cachedLyrics);
        if (match) {
          activeTitle = match.title ?? null;
          activeArtist = match.artist ?? null;
        }
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
  
  return (
    <div className={`min-h-screen bg-bg text-bg-text font-sans flex flex-col md:flex-row overflow-hidden ${sidebarOpen || bookmarksPanelOpen || ankiPanelOpen ? 'has-panel-open' : ''}`}>
      <div className={`flex-1 flex flex-col h-screen overflow-hidden relative z-0 transition-all duration-300 ${sidebarOpen ? 'sidebar-open' : ''} ${bookmarksPanelOpen ? 'bookmarks-open' : ''} ${ankiPanelOpen ? 'anki-open' : ''}`}>
        <Header
          bookmarkCount={totalBookmarks}
          onBookmarksClick={handleBookmarksClick}
          user={user}
          onLogout={signOut}
          onOpenSongsManager={handleSongsManagerClick}
          isProcessing={processing}
          activeTitle={activeTitle}
          activeArtist={activeArtist}
          onConvertToAnki={handleConvertToAnki}
          hasLyrics={!!appData}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 flex items-start justify-center">
          <div className="w-full max-w-3xl">
            {error && <div className="mb-4"><ErrorDisplay message={error} /></div>}
            {!appData ? (
              processing ? (
                <div className="bg-surface rounded-xl shadow-sm border border-border p-8 md:p-12 w-full max-w-3xl flex flex-col items-center justify-center text-center">
                  <Loader className="w-10 h-10 text-primary animate-spin mb-3" />
                  <h3 className="text-lg font-semibold text-text mb-1">Loading lyrics…</h3>
                  <p className="text-sm text-muted">Please wait while your lyrics are loaded.</p>
                </div>
              ) : (
                <div className="bg-surface rounded-xl shadow-sm border border-border p-8 md:p-12 w-full max-w-3xl flex flex-col items-center justify-center text-center">
                  <h2 className="text-2xl font-bold text-text mb-3">No lyrics loaded</h2>
                  <p className="text-sm text-muted mb-4">Paste lyrics to analyze them. Use the button below or press <span className="font-mono">Ctrl/Cmd + Shift + V</span>.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setSongsManagerOpen(true)} className="btn btn-primary">Paste lyrics</button>
                  </div>
                </div>
              )
            ) : (
              <div className="relative">
                <LyricsDisplay
                  lyricsLines={appData?.lyrics_lines || []}
                  selectedWord={selectedWord}
                  wordMap={appData?.word_map || {}}
                  onWordClick={handleWordClick}
                  onEdit={() => {
                    setSongsManagerOriginal(rawLyrics ?? null);
                    setSongsManagerInitialTitle(activeTitle);
                    setSongsManagerInitialArtist(activeArtist);
                    setSongsManagerOpen(true);
                  }}
                />
                {processing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(var(--color-surface-rgb),0.6)' }}>
                    <Loader className="w-8 h-8 text-primary animate-spin mb-2" />
                    <div className="text-sm text-muted">Processing lyrics...</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <Sidebar
        isOpen={sidebarOpen}
        selectedWord={selectedWord}
        selectedLine={selectedLine}
        selectedTranslation={selectedTranslation}
        appData={appData}
        overrideEntry={appData ? null : selectedEntry}
        onClose={() => setSidebarOpen(false)}
        isWordBookmarked={isWordBookmarked}
        isKanjiBookmarked={isKanjiBookmarked}
        onToggleWordBookmark={toggleWordBookmark}
        onToggleKanjiBookmark={toggleKanjiBookmark}
        onOpenListPicker={openListPicker}
      />

      <BookmarksPanel
        isOpen={bookmarksPanelOpen}
        bookmarks={bookmarks}
        appData={appData}
        isLoading={bookmarksLoading}
        onClose={() => setBookmarksPanelOpen(false)}
        onToggleWordBookmark={toggleWordBookmark}
        onRemoveKanji={removeKanjiBookmark}
        onClearAll={clearAllBookmarks}
        onOpenListPicker={openListPicker}
      />

      <AnkiCardsPanel
        isOpen={ankiPanelOpen}
        activeCards={ankiCards}
        removedCards={removedAnkiCards}
        onClose={() => setAnkiPanelOpen(false)}
        onRemoveCard={handleRemoveAnkiCard}
        onRestoreCard={handleRestoreAnkiCard}
      />

      <ListPicker
        isOpen={listPickerOpen}
        onClose={closeListPicker}
        bookmarkType={pickerBookmarkType}
        bookmarkKey={pickerKey}
        addBookmarkToList={addBookmarkToList}
        removeBookmarkFromList={removeBookmarkFromList}
        getListsForBookmark={getListsForBookmark}
      />

      <SongsManagerModal
        isOpen={songsManagerOpen}
        onClose={() => {
          setSongsManagerOpen(false);
          setSongsManagerOriginal(null);
          setSongsManagerInitialTitle(null);
          setSongsManagerInitialArtist(null);
        }}
        processing={processing}
        error={error}
        initialLyrics={songsManagerOriginal ?? null}
        initialTitle={songsManagerInitialTitle ?? null}
        initialArtist={songsManagerInitialArtist ?? null}
        originalLyrics={songsManagerOriginal ?? null}
        onProcess={handleSongsManagerProcess}
      />

      <Toasts toasts={toasts} onClose={removeToast} />

      <MobileOverlay
        isOpen={sidebarOpen || bookmarksPanelOpen}
        onClose={() => {
          setSidebarOpen(false);
          setBookmarksPanelOpen(false);
        }}
      />
    </div>
  );
};
export default App;
