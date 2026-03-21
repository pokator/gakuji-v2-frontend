import { useEffect, useState, useRef } from 'react';
import type { SavedSong, AppData } from '../../types';
import { listSongs, saveSong, loadSong, updateSong, deleteSong } from '../../utils/savedSongs';
import { ErrorDisplay } from '../ui/ErrorDisplay';
import { Trash2, X, Plus, EllipsisVertical } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  processing: boolean;
  error?: string | null;
  initialLyrics?: string | null;
  initialTitle?: string | null;
  initialArtist?: string | null;
  // Called to process lyrics; can return processed data or void
  onProcess: (lyrics: string) => Promise<unknown> | void;
}

// If `originalLyrics` is provided, the modal treats this as an "edit of already-processed" flow
// and will run `onProcess` first (expecting the caller to return the processed `appData` when applicable),
// then attempt to update any saved song that matched the original lyrics with returned appData
interface ExtendedProps extends Props {
  originalLyrics?: string | null;
}

const SongsManagerModal = ({ isOpen, onClose, processing, error, initialLyrics, initialTitle, initialArtist, onProcess, originalLyrics }: ExtendedProps) => {
  const [songs, setSongs] = useState<SavedSong[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [artist, setArtist] = useState<string>('');
  const [lyrics, setLyrics] = useState<string>('');
  const [loadedTitle, setLoadedTitle] = useState<string>('');
  const [loadedArtist, setLoadedArtist] = useState<string>('');
  const [loadedLyrics, setLoadedLyrics] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const load = () => {
    try {
      setSongs(listSongs());
    } catch (err) {
      console.error(err);
      setLocalError((err as Error)?.message || 'Failed to load saved songs');
    }
  };

  useEffect(() => {
    if (isOpen) {
      setLocalError(null);
      load();
      setSelectedId(null);
      setTitle(initialTitle ?? '');
      setArtist(initialArtist ?? '');
      setLyrics(initialLyrics ?? '');
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    setIsClosing(false);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdownId]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleSelect = (s: SavedSong) => {
    setSelectedId(s.id);
    setTitle(s.title ?? '');
    setArtist(s.artist ?? '');
    setLyrics(s.lyrics);
    setLoadedTitle(s.title ?? '');
    setLoadedArtist(s.artist ?? '');
    setLoadedLyrics(s.lyrics);
    setLocalError(null);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleNew = () => {
    setSelectedId(null);
    setTitle('');
    setArtist('');
    setLyrics('');
    setLoadedTitle('');
    setLoadedArtist('');
    setLoadedLyrics('');
    setLocalError(null);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };



  const handleDelete = (id: string) => {
    if (!confirm('Delete this saved song?')) return;
    try {
      deleteSong(id);
      if (selectedId === id) handleNew();
      load();
    } catch (err) {
      console.error(err);
      setLocalError((err as Error)?.message || 'Failed to delete saved song');
    }
    setOpenDropdownId(null);
  };

  const handleConvertToAnki = (song: SavedSong) => {
    // TODO: Implement convert to Anki functionality
    console.log('Converting to Anki:', song);
    setOpenDropdownId(null);
  };

  const handleClear = () => {
    setTitle('');
    setArtist('');
    setLyrics('');
  };

  const handleSubmit = async () => {
    const trimmed = lyrics.trim();
    if (!trimmed) {
      setLocalError('Please paste some lyrics before submitting.');
      return;
    }

    const lyricsChanged = trimmed !== loadedLyrics;
    const metadataChanged = title !== loadedTitle || artist !== loadedArtist;
    const isNewSong = !selectedId;

    setLocalError(null);
    setSubmitting(true);
    handleClose(); // Close modal immediately

    try {
      if (isNewSong) {
        // Creating new song - save and send to backend
        saveSong({ title: title || null, artist: artist || null, lyrics: trimmed });
        load();
        await Promise.resolve(onProcess(trimmed));
      } else if (lyricsChanged) {
        // Editing lyrics - save and send to backend
        updateSong(selectedId, { title: title || null, artist: artist || null, lyrics: trimmed });
        load();
        await Promise.resolve(onProcess(trimmed));
      } else if (metadataChanged) {
        // Only metadata changed - save without sending to backend
        updateSong(selectedId, { title: title || null, artist: artist || null });
        load();
      } else {
        // No changes - just process existing lyrics to show
        await Promise.resolve(onProcess(trimmed));
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : String(err) || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const getButtonLabel = () => {
    if (!selectedId) return 'Create';
    const lyricsChanged = lyrics.trim() !== loadedLyrics;
    const metadataChanged = title !== loadedTitle || artist !== loadedArtist;
    if (lyricsChanged || metadataChanged) return 'Update';
    return 'Show';
  };

  const isButtonDisabled = () => {
    const trimmed = lyrics.trim();
    if (!trimmed) return true;
    if (processing || submitting) return true;
    return false;
  };

  if (!isOpen && !isClosing) return null;

  return (
    <>
      <div className={`fixed inset-0 z-50 modal-overlay ${isClosing ? 'closing' : ''}`} />
      <div className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none modal-overlay-container ${isClosing ? 'closing' : ''}`}>
        <div className={`songs-manager-modal rounded-lg w-[min(96%,1000px)] p-4 shadow-lg max-h-[90vh] overflow-hidden pointer-events-auto ${isClosing ? 'closing' : ''}`}>
        <div className="flex justify-between items-center mb-3">
          <h1 className="font-bold text-text">Songs</h1>
          <button onClick={handleClose} className="icon-btn icon-btn-danger"><X className="h-6 w-6" /></button>
        </div>

        <div className="flex gap-4 h-[70vh]">
          <div className="w-72 shrink-0 border-r border-border pr-3 bg-surface text-surface-text flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {songs.length === 0 ? (
                <div className="text-sm text-muted">No saved songs</div>
              ) : (
                <ul className="space-y-2">
                  {songs.map(s => (
                    <li key={s.id} className={`flex items-start justify-between p-2 rounded border ${selectedId === s.id ? 'bg-surface/50 text-surface-text border-primary' : 'border-border'}`}>
                      <button onClick={() => handleSelect(s)} className="text-left flex-1 pr-2">
                        <div className="font-semibold truncate">{s.title || <span className="text-sm text-muted">(Untitled)</span>}</div>
                        <div className="text-sm text-muted truncate">{s.artist || ''}</div>
                        <div className="text-xs text-muted">{new Date(s.createdAt).toLocaleString()}</div>
                      </button>
                      <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setOpenDropdownId(openDropdownId === s.id ? null : s.id)} className="icon-btn icon-btn-primary p-1"><EllipsisVertical size={16} /></button>
                        {openDropdownId === s.id && (
                          <div className="songs-manager-dropdown">
                            <button onClick={() => handleConvertToAnki(s)} className="songs-manager-dropdown-item">
                              Convert to Anki
                            </button>
                            <button onClick={() => handleDelete(s.id)} className="songs-manager-dropdown-item delete">
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button onClick={handleNew} className="icon-btn icon-btn-primary mt-3 self-end"><Plus className="h-5 w-5" /></button>
          </div>

          <div className="flex-1 pl-3 flex flex-col">
            <div className="flex gap-2">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (optional)" className="flex-1 border rounded p-2 text-sm" />
              <input value={artist} onChange={e => setArtist(e.target.value)} placeholder="Artist (optional)" className="flex-1 border rounded p-2 text-sm" />
            </div>

            <textarea
              ref={textareaRef}
              className="w-full flex-1 border rounded p-2 text-sm font-medium text-text mt-3"
              placeholder="Paste raw lyrics here (preserve new lines / sections)..."
              value={lyrics}
              onChange={e => setLyrics(e.target.value)}
            />

            <div className="mt-3">
              {(localError || error) && (
                <div className="mb-2"><ErrorDisplay message={localError || error || ''} /></div>
              )}

              <div className="flex justify-end gap-2">
                {!selectedId && (
                  <button
                    onClick={handleClear}
                    className="btn btn-secondary disabled:opacity-50"
                    disabled={!title.trim() && !artist.trim() && !lyrics.trim()}
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  className="btn btn-primary disabled:opacity-50"
                  disabled={isButtonDisabled()}
                >
                  {(processing || submitting) ? (
                    <span className="w-3 h-3 rounded-full bg-current animate-pulse" />
                  ) : null}
                  {getButtonLabel()}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default SongsManagerModal;
