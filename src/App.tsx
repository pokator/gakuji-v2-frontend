import { useState, useEffect } from "react";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { MobileOverlay } from "./components/layout/MobileOverlay";
import { BookmarksPanel } from "./components/bookmarks/BookmarksPanel";
import ListPicker from "./components/bookmarks/ListPicker";
import { LyricsDisplay } from "./components/lyrics/LyricsDisplay";
import { getWordData } from './utils/dataHelpers';
import type { WordEntry } from './types';
import LyricsModal from './components/lyrics/LyricsModal';
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import Toasts from './components/ui/Toast';
import { Loader } from 'lucide-react';
import { ErrorDisplay } from "./components/ui/ErrorDisplay";
import { useAppData } from "./hooks/useAppData";
import { useBookmarks } from "./hooks/useBookmarks";
import { useAuth } from "./hooks/useAuth";
import AuthModal from "./components/auth/AuthModal";
import SavedSongsPanel from './components/lyrics/SavedSongsPanel';
import { saveSong, listSongs } from './utils/savedSongs';

const App = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { appData, loading, processing, error, processLyrics, clearLyrics } = useAppData(!!user, user?.id ?? null); 
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
  const [lyricsModalOpen, setLyricsModalOpen] = useState(false);
  const [savedSongsOpen, setSavedSongsOpen] = useState(false);
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
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<string[] | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<WordEntry | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookmarksPanelOpen, setBookmarksPanelOpen] = useState(false);

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
        setLyricsModalOpen(true);
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
      setBookmarksPanelOpen(false); // Close bookmarks when opening sidebar
    }
  };
  const handleBookmarksClick = () => {
    setBookmarksPanelOpen(!bookmarksPanelOpen);
    if (!bookmarksPanelOpen) {
      setSidebarOpen(false); // Close sidebar when opening bookmarks
    }
  };
  const handleSavedSongsClick = () => {
    setSavedSongsOpen(prev => !prev);
    if (!savedSongsOpen) setSidebarOpen(false);
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
      } catch (err) {
        // ignore
      }
    }
  } catch (err) {
    // ignore
  }
  
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row overflow-hidden">
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-0 transition-all duration-300">
        <Header
          bookmarkCount={totalBookmarks}
          onBookmarksClick={handleBookmarksClick}
          user={user}
          onLogout={signOut}
          onOpenLyricsModal={() => setLyricsModalOpen(true)}
          onOpenSavedSongs={handleSavedSongsClick}
          isProcessing={processing}
          activeTitle={activeTitle}
          activeArtist={activeArtist}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 flex items-start justify-center">
          <div className="w-full max-w-3xl">
            {error && <div className="mb-4"><ErrorDisplay message={error} /></div>}
            {!appData ? (
              processing ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 md:p-12 w-full max-w-3xl flex flex-col items-center justify-center text-center">
                  <Loader className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">Loading lyrics…</h3>
                  <p className="text-sm text-slate-600">Please wait while your lyrics are loaded.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 md:p-12 w-full max-w-3xl flex flex-col items-center justify-center text-center">
                  <h2 className="text-2xl font-bold text-slate-800 mb-3">No lyrics loaded</h2>
                  <p className="text-sm text-slate-600 mb-4">Paste lyrics to analyze them. Use the button below or press <span className="font-mono">Ctrl/Cmd + Shift + V</span>.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setLyricsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Paste lyrics</button>
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
                />
                {processing && (
                  <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center rounded-xl">
                    <Loader className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                    <div className="text-sm text-gray-700">Processing lyrics...</div>
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

      <ListPicker
        isOpen={listPickerOpen}
        onClose={closeListPicker}
        bookmarkType={pickerBookmarkType}
        bookmarkKey={pickerKey}
        addBookmarkToList={addBookmarkToList}
        removeBookmarkFromList={removeBookmarkFromList}
        getListsForBookmark={getListsForBookmark}
      />

      <LyricsModal
        isOpen={lyricsModalOpen}
        onClose={() => setLyricsModalOpen(false)}
        onSubmit={(payload: { lyrics: string; title?: string | null; artist?: string | null }) => {
          // close immediately (modal already closes, but ensure) and run processing in background
          setLyricsModalOpen(false);
          try {
            // Save metadata locally (non-blocking)
            saveSong({ title: payload.title ?? null, artist: payload.artist ?? null, lyrics: payload.lyrics });
          } catch (err) {
            console.error('Failed to save song locally', err);
          }
          processLyrics(payload.lyrics)
            .then(() => pushToast('Lyrics processed', 'success'))
            .catch((err: unknown) => {
              const msg = err instanceof Error ? err.message : String(err);
              pushToast(msg || 'Failed to process lyrics', 'error');
            });
        }}
        onClear={() => {
          clearLyrics();
          setSelectedWord(null);
          setSelectedLine(null);
          setSelectedTranslation(null);
          // refresh bookmark details so full entries are fetched from backend/cache
          try {
            refreshBookmarks();
          } catch (err) {
            console.error('Failed to refresh bookmarks after clearing lyrics', err);
          }
        }}
        processing={processing}
        error={error}
      />

      <SavedSongsPanel
        isOpen={savedSongsOpen}
        onClose={() => setSavedSongsOpen(false)}
        onOpen={(song) => {
          // load the saved song's lyrics and process them
          setSavedSongsOpen(false);
          processLyrics(song.lyrics)
            .then(() => pushToast('Saved song loaded', 'success'))
            .catch((err: unknown) => {
              const msg = err instanceof Error ? err.message : String(err);
              pushToast(msg || 'Failed to process saved song', 'error');
            });
        }}
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
