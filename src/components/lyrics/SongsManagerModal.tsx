import { useEffect, useState, useRef } from 'react';
import type { SavedSong, AppData } from '../../types';
import { listSongs, saveSong, loadSong, updateSong, deleteSong } from '../../utils/savedSongs';
import { ErrorDisplay } from '../ui/ErrorDisplay';
import { Trash2, X, Plus } from 'lucide-react';

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
  onClear: () => void;
}

// If `originalLyrics` is provided, the modal treats this as an "edit of already-processed" flow
// and will run `onProcess` first (expecting the caller to return the processed `appData` when applicable),
// then attempt to update any saved song that matched the original lyrics with returned appData
interface ExtendedProps extends Props {
  originalLyrics?: string | null;
}

const SongsManagerModal = ({ isOpen, onClose, processing, error, initialLyrics, initialTitle, initialArtist, onProcess, onClear, originalLyrics }: ExtendedProps) => {
  const [songs, setSongs] = useState<SavedSong[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [artist, setArtist] = useState<string>('');
  const [lyrics, setLyrics] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
    setLocalError(null);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleNew = () => {
    setSelectedId(null);
    setTitle('');
    setArtist('');
    setLyrics('');
    setLocalError(null);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleSave = () => {
    try {
      if (selectedId) {
        const existing = loadSong(selectedId);
        if (!existing) {
          // fallback to save new
          saveSong({ title: title || null, artist: artist || null, lyrics });
        } else {
          // If title or artist changed, create a new song instead of updating
          const titleChanged = (existing.title ?? '') !== (title ?? '');
          const artistChanged = (existing.artist ?? '') !== (artist ?? '');
          if (titleChanged || artistChanged) {
            saveSong({ title: title || null, artist: artist || null, lyrics });
          } else {
            updateSong(selectedId, { lyrics });
          }
        }
      } else {
        saveSong({ title: title || null, artist: artist || null, lyrics });
      }
      load();
    } catch (err) {
      console.error(err);
      setLocalError((err as Error)?.message || 'Failed to save song');
    }
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
  };

  const handleSend = async () => {
    const trimmed = lyrics.trim();
    if (!trimmed) {
      setLocalError('Please paste some lyrics before sending.');
      return;
    }
    setLocalError(null);
    setSubmitting(true);
    try {
      if (originalLyrics) {
        // Edit flow for already-processed lyrics: run processing first (caller expected to call syncLyrics)
        // and return processed appData (if available). After processing completes, update matching saved song.
        const processed = await Promise.resolve(onProcess(trimmed));
        try {
          const songs = listSongs();
          const match = songs.find(s => s.lyrics === originalLyrics);
          if (match) {
            const titleChanged = (match.title ?? '') !== (title ?? '');
            const artistChanged = (match.artist ?? '') !== (artist ?? '');
            if (titleChanged || artistChanged) {
              // create a new saved song with processed appData
              saveSong({ title: title || null, artist: artist || null, lyrics: trimmed, appData: (processed ? processed as AppData : null) });
            } else {
              // update the matched song with new lyrics + appData
              updateSong(match.id, { title: title ?? match.title, artist: artist ?? match.artist, lyrics: trimmed, appData: (processed ? processed as AppData : null), lastProcessedAt: Date.now() });
            }
          } else {
            // no matching saved song for original — just save new
            saveSong({ title: title || null, artist: artist || null, lyrics: trimmed, appData: (processed ? processed as AppData : null) });
          }
        } catch (err) {
          console.error('Failed to update saved song after processing', err);
        }
        handleClose();
      } else {
        // Normal flow: persist first, then call processing
        if (selectedId) {
          const existing = loadSong(selectedId);
          if (!existing) {
            saveSong({ title: title || null, artist: artist || null, lyrics: trimmed });
          } else {
            const titleChanged = (existing.title ?? '') !== (title ?? '');
            const artistChanged = (existing.artist ?? '') !== (artist ?? '');
            if (titleChanged || artistChanged) {
              saveSong({ title: title || null, artist: artist || null, lyrics: trimmed });
            } else {
              updateSong(selectedId, { lyrics: trimmed });
            }
          }
        } else {
          saveSong({ title: title || null, artist: artist || null, lyrics: trimmed });
        }

        await Promise.resolve(onProcess(trimmed));
        handleClose();
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : String(err) || 'Failed to process lyrics');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <>
      <div className={`fixed inset-0 z-50 modal-overlay ${isClosing ? 'closing' : ''}`} />
      <div className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none modal-overlay-container ${isClosing ? 'closing' : ''}`}>
        <div className={`songs-manager-modal rounded-lg w-[min(96%,1000px)] p-4 shadow-lg max-h-[90vh] overflow-hidden pointer-events-auto ${isClosing ? 'closing' : ''}`}>
        <div className="flex justify-between items-center mb-3">
          <h1 className="font-bold text-text"></h1>
          <button onClick={handleClose} className="icon-btn icon-btn-danger"><X className="h-6 w-6" /></button>
        </div>

        <div className="flex gap-4 h-[70vh]">
          <div className="w-72 shrink-0 border-r border-border pr-3 bg-surface text-surface-text">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Songs</div>
              <button onClick={handleNew} className="icon-btn icon-btn-primary"><Plus className="h-5 w-5" /></button>
            </div>
            <div className="overflow-y-auto max-h-full">
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
                      <div className="flex flex-col items-end gap-1">
                        <button onClick={() => handleDelete(s.id)} className="btn btn-danger text-xs px-2 py-0.5"><Trash2 size={12} /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
                <button onClick={onClear} className="btn btn-secondary">Clear lyrics</button>
                <button onClick={handleSave} className="btn btn-primary">Save</button>
                <button
                  onClick={handleSend}
                  className="btn btn-primary disabled:opacity-50"
                  disabled={processing || submitting}
                >
                  {(processing || submitting) ? (
                    <span className="w-3 h-3 rounded-full bg-current animate-pulse" />
                  ) : null}
                  Send
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
