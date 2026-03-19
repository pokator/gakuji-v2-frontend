import type { WordEntry } from "../../types";
import { BookmarkButton } from "../bookmarks/BookmarkButton";
import { ExternalLink } from "lucide-react";

interface ListInfo {
  id: number | string;
  name: string;
}

interface BookmarkedWordCardProps {
  entry: WordEntry;
  isBookmarked: boolean;
  onToggleBookmark: (word: string, furigana: string, idseq?: number) => void;
  onOpenListPicker?: () => void;
  lists?: ListInfo[];
}

export const BookmarkedWordCard = ({
  entry,
  isBookmarked,
  onToggleBookmark,
  onOpenListPicker,
  lists = [],
}: BookmarkedWordCardProps) => (
  <div className="bg-surface border border-border rounded-lg p-3 mb-3 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-1">
      <div className="flex items-center gap-2 flex-1">
        <div className="text-lg font-bold text-primary font-sans">
          {entry.word}
        </div>
        <div className="text-sm text-muted font-mono bg-surface px-2 py-0.5 rounded">
          {entry.furigana}
        </div>
      </div>
      <BookmarkButton
        isBookmarked={isBookmarked}
        onClick={() =>
          onToggleBookmark(entry.word, entry.furigana, entry.idseq)
        }
        onOpenListPicker={onOpenListPicker}
        size="sm"
      />
    </div>

    {(entry as any).lines && (entry as any).lines.length > 0 && (
      <blockquote className="text-sm text-muted italic border-l-4 border-primary/30 pl-4 mt-2 mb-2">
        {(entry as any).lines[0]}
      </blockquote>
    )}

    <div className="space-y-2">
      {(entry.definitions || []).map((def, idx) => (
        <div key={idx} className="text-sm">
          <div className="flex flex-wrap gap-1 mb-1">
            {(def.pos || []).map((p, pIdx) => (
              <span
                key={pIdx}
                className="text-[10px] uppercase font-bold tracking-wider text-primary bg-surface px-1.5 py-0.5 rounded"
              >
                {String(p).split(" ")[0]}
              </span>
            ))}
          </div>
          <ul className="list-disc list-inside text-text pl-1">
            {(def.definition || []).map((d, dIdx) => (
              <li key={dIdx} className="leading-tight mb-0.5">
                {d}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    {lists && lists.length > 0 && (
      <div className="mt-2 flex flex-wrap gap-2">
        {lists
          .filter((l) => String(l.name).toLowerCase() !== "default")
          .map((l) => (
            <span
              key={String(l.id)}
              className="text-[11px] bg-surface text-primary px-2 py-0.5 rounded"
            >
              {l.name}
            </span>
          ))}
      </div>
    )}

    <div className="flex justify-end mt-3">
      <a
        href={`https://jisho.org/search/${encodeURIComponent(entry.word)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary hover:underline flex items-center"
        aria-label={`Open ${entry.word} on Jisho (opens in a new tab)`}
      >
        <ExternalLink className="h-4 w-4" />
        <span className="ml-1">Jisho</span>
      </a>
    </div>
  </div>
);
