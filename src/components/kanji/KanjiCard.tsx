import type { KanjiData, BookmarkedKanji } from "../../types";
import { BookmarkButton } from "../bookmarks/BookmarkButton";
import { ExternalLink } from "lucide-react";

interface KanjiCardProps {
  char: string;
  data: KanjiData;
  isBookmarked: boolean;
  // accepts either (char, meanings) or a full BookmarkedKanji object
  onToggleBookmark: (
    charOrBookmark: string | BookmarkedKanji,
    meanings?: string[]
  ) => void;
  onOpenListPicker?: (bookmarkType: "word" | "kanji", key: string) => void;
}

export const KanjiCard = ({
  char,
  data,
  isBookmarked,
  onToggleBookmark,
  onOpenListPicker,
}: KanjiCardProps) => (
  <div className="card-kanji">
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-center gap-3">
        <div className="text-4xl font-serif bg-warning-bg/30 rounded w-12 h-12 flex items-center justify-center border border-warning-text/20 text-warning-text">
          {char}
        </div>
        <div>
          <div className="flex flex-wrap gap-1 mb-1">
            {data.meanings.slice(0, 3).map((m, i) => (
              <span
                key={i}
                className="text-xs font-medium text-warning-text bg-warning-text/20 px-1.5 py-0.5 rounded"
              >
                {m}
              </span>
            ))}
          </div>

          {data.jlpt_new && (
            <span className="text-[10px] font-bold text-warning-text border border-warning-text/30 px-1 rounded">
              N{data.jlpt_new}
            </span>
          )}
        </div>
      </div>
      <BookmarkButton
        isBookmarked={isBookmarked}
        onClick={() => {
          onToggleBookmark({
            char,
            meanings: data.meanings,
            readings_on: data.readings_on,
            readings_kun: data.readings_kun,
            jlpt_new: data.jlpt_new,
            radicals: data.radicals,
            timestamp: Date.now(),
          });
        }}
        onOpenListPicker={() => onOpenListPicker?.("kanji", char)}
        size="sm"
      />
    </div>

    <div className="grid grid-cols-2 gap-2 text-xs mt-3">
      <div className="p-2 rounded" style={{ backgroundColor: 'rgba(var(--color-warning-text), 0.1)' }}>
        <div className="text-[10px] uppercase text-warning-text/70 font-bold mb-1">
          Onyomi
        </div>
        <div className="text-warning-text">
          {data.readings_on.join("、 ") || "-"}
        </div>
      </div>
      <div className="p-2 rounded" style={{ backgroundColor: 'rgba(var(--color-warning-text), 0.1)' }}>
        <div className="text-[10px] uppercase text-warning-text/70 font-bold mb-1">
          Kunyomi
        </div>
        <div className="text-warning-text">
          {data.readings_kun.join("、 ") || "-"}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs col-span-2">
        {data.radicals && (
          // Applying the single-line fix to the Radicals section
          <div className="flex items-center gap-1 overflow-hidden min-w-0 text-warning-text">
            <span className="font-bold shrink-0">Radicals:</span>
            <span className="truncate whitespace-nowrap min-w-0">
              {data.radicals.join(", ")}
            </span>
          </div>
        )}

        <a
          href={`https://jisho.org/search/${encodeURIComponent(
            `${char} #kanji`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-warning-text hover:underline ml-2 shrink-0"
          aria-label={`Open ${char} on Jisho (kanji)`}
        >
          <ExternalLink className="h-3 w-3" />
          <span className="text-[10px]">Jisho</span>
        </a>
      </div>
    </div>
  </div>
);
