import { useEffect, useRef, useState } from 'react';
import { ErrorDisplay } from '../ui/ErrorDisplay';

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { lyrics: string; title?: string | null; artist?: string | null }) => void | Promise<void>;
  onClear: () => void;
  processing: boolean;
  error?: string | null;
  initialLyrics?: string | null;
  initialTitle?: string | null;
  initialArtist?: string | null;
  modalTitle?: string;
  submitLabel?: string;
}

export const LyricsModal = ({ isOpen, onClose, onSubmit, onClear, processing, error, initialLyrics, initialTitle, initialArtist, modalTitle, submitLabel }: LyricsModalProps) => {
  const [value, setValue] = useState('');
  const [title, setTitle] = useState<string>('');
  const [artist, setArtist] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalError(null);
      setValue(initialLyrics ?? '');
      setTitle(initialTitle ?? '');
      setArtist(initialArtist ?? '');
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setLocalError('Please paste some lyrics before sending.');
      return;
    }
    setLocalError(null);
    setSubmitting(true);
    try {
      // await caller's handler so modal can show errors / spinner until complete
      await Promise.resolve(onSubmit({ lyrics: trimmed, title: title.trim() || null, artist: artist.trim() || null }));
      onClose();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : String(err) || 'Failed to process lyrics');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg w-[min(90%,700px)] p-4 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold">{modalTitle ?? 'Paste lyrics'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">Close</button>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="flex-1 border rounded p-2 text-sm"
              disabled={processing}
            />
            <input
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Artist (optional)"
              className="flex-1 border rounded p-2 text-sm"
              disabled={processing}
            />
          </div>

          <textarea
            ref={textareaRef}
            className="w-full h-56 border rounded p-2 text-sm font-medium text-slate-700"
            placeholder="Paste raw lyrics here (preserve new lines / sections)..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={processing}
          />
        </div>

        <div className="mt-3">
          {(localError || error) && (
            <div className="mb-2">
              <ErrorDisplay message={localError || error || ''} />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={handleClear}
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
              disabled={processing || submitting}
            >
              Clear lyrics
            </button>
            <button
              onClick={handleSubmit}
              className={`px-4 py-1 rounded bg-indigo-600 text-white flex items-center gap-2 ${(processing || submitting) ? 'opacity-60 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
              disabled={processing || submitting}
            >
              {(processing || submitting) ? (
                <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
              ) : null}
              {submitLabel ?? 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LyricsModal;
