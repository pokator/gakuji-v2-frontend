import { X } from 'lucide-react';
import type { AnkiKanjiCard } from '../../types';

interface AnkiKanjiCardDisplayProps {
  kanji: AnkiKanjiCard;
  onRemove: () => void;
}

export const AnkiKanjiCardDisplay = ({
  kanji,
  onRemove,
}: AnkiKanjiCardDisplayProps) => {
  const jlptLevel = kanji.data.jlpt_new;

  return (
    <div className="card-word">
      {/* Header with kanji character and close button */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-4xl font-bold text-primary font-sans">
            {kanji.char}
          </div>
          {jlptLevel && (
            <div className="text-xs uppercase font-bold tracking-wider text-primary bg-surface px-2.5 py-1 rounded">
              N{jlptLevel}
            </div>
          )}
        </div>
        <button
          onClick={onRemove}
          className="p-1 rounded hover:bg-surface transition-colors text-muted hover:text-text"
          aria-label="Remove from Anki kanji list"
        >
          <X size={18} />
        </button>
      </div>

      {/* Meanings */}
      {kanji.data.meanings.length > 0 && (
        <div className="mb-3">
          <p className="text-xs uppercase font-bold tracking-wider text-secondary mb-1">
            Meanings
          </p>
          <p className="text-sm text-text">
            {kanji.data.meanings.join(', ')}
          </p>
        </div>
      )}

      {/* Onyomi readings */}
      {kanji.data.readings_on && kanji.data.readings_on.length > 0 && (
        <div className="mb-3">
          <p className="text-xs uppercase font-bold tracking-wider text-secondary mb-1">
            Onyomi (音読み)
          </p>
          <p className="text-sm text-text font-mono">
            {kanji.data.readings_on.join(', ')}
          </p>
        </div>
      )}

      {/* Kunyomi readings */}
      {kanji.data.readings_kun && kanji.data.readings_kun.length > 0 && (
        <div className="mb-3">
          <p className="text-xs uppercase font-bold tracking-wider text-secondary mb-1">
            Kunyomi (訓読み)
          </p>
          <p className="text-sm text-text font-mono">
            {kanji.data.readings_kun.join(', ')}
          </p>
        </div>
      )}

      {/* Radicals */}
      {kanji.data.radicals && kanji.data.radicals.length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs uppercase font-bold tracking-wider text-secondary mb-2">
            Radicals
          </p>
          <div className="flex flex-wrap gap-1.5">
            {kanji.data.radicals.map((radical, idx) => (
              <span
                key={idx}
                className="text-sm bg-surface px-2.5 py-1 rounded text-text"
              >
                {radical}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
