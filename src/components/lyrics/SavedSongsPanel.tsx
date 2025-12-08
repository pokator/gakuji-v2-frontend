import { useEffect, useState } from 'react';
import type { SavedSong } from '../../types';
import { listSongs, deleteSong } from '../../utils/savedSongs';
import { ErrorDisplay } from '../ui/ErrorDisplay';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpen: (song: SavedSong) => void;
}

const SavedSongsPanel = ({ isOpen, onClose, onOpen }: Props) => {
  const [songs, setSongs] = useState<SavedSong[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (isOpen) {
      Promise.resolve().then(() => {
        if (cancelled) return;
        try {
          setSongs(listSongs());
        } catch (err) {
          console.error(err);
          setError((err as Error)?.message || 'Failed to load saved songs');
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpen = (song: SavedSong) => {
    onOpen(song);
    onClose();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this saved song?')) return;
    try {
      deleteSong(id);
      setSongs(listSongs());
    } catch (err) {
      console.error(err);
      setError((err as Error)?.message || 'Failed to delete saved song');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg w-[min(90%,700px)] p-4 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold">Saved songs</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">Close</button>
        </div>

        {error && <div className="mb-2"><ErrorDisplay message={error} /></div>}

        <div className="max-h-64 overflow-y-auto">
          {songs.length === 0 ? (
            <div className="text-sm text-slate-600">No saved songs</div>
          ) : (
            <ul className="space-y-2">
              {songs.map(s => (
                <li key={s.id} className="flex items-center justify-between border rounded p-2">
                  <div>
                    <div className="font-semibold">{s.title || <span className="text-sm text-gray-400">(Untitled)</span>}</div>
                    <div className="text-sm text-slate-600">{s.artist || ''}</div>
                    <div className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpen(s)} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Open</button>
                    <button onClick={() => handleDelete(s.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedSongsPanel;
