import { BookOpen, Bookmark, LogOut, Clipboard, List } from "lucide-react";

interface HeaderProps {
  bookmarkCount: number;
  onBookmarksClick: () => void;
  user: any;
  onLogout: () => void;
  onOpenLyricsModal?: () => void;
  onOpenSavedSongs?: () => void;
  isProcessing?: boolean;
  activeTitle?: string | null;
  activeArtist?: string | null;
}

export const Header = ({
  bookmarkCount,
  onBookmarksClick,
  user,
  onLogout,
  onOpenLyricsModal,
  onOpenSavedSongs,
  isProcessing,
  activeTitle,
  activeArtist,
}: HeaderProps) => (
  <header className="z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
    <div className="flex w-[400px] items-center justify-start gap-2">
      <BookOpen className="h-6 w-6 text-indigo-600" />
      <h1 className="text-xl font-bold tracking-tight text-slate-800">
        Gakuji
      </h1>
    </div>

    <div className="flex-1 min-w-0 px-4">
      <div className="text-center">
        {(activeTitle || activeArtist) && (
          <span className="inline-block max-w-full truncate text-2xl font-extrabold tracking-tight text-slate-800">
            {activeTitle || "— No Title —"}
            {activeArtist && (
              <>
                <span className="mx-2 font-light text-slate-500">—</span>
                <span className="font-semibold text-slate-600">
                  {activeArtist}
                </span>
              </>
            )}
          </span>
        )}
      </div>
    </div>

    <div className="flex w-[400px] items-center justify-end gap-4">
      <div className="hidden text-xs font-medium text-gray-400 sm:block">
        Click words to analyze
      </div>

      {onOpenLyricsModal && (
        <button
          onClick={onOpenLyricsModal}
          aria-label="Open lyrics modal"
          title="Paste lyrics"
          disabled={isProcessing}
          className={`flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-gray-50 ${
            isProcessing ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          <Clipboard className="h-5 w-5 text-gray-400" />
        </button>
      )}

      {onOpenSavedSongs && (
        <button
          onClick={onOpenSavedSongs}
          aria-label="Saved songs"
          title="Saved songs"
          className="rounded-lg p-2 transition-colors hover:bg-gray-50"
        >
          <List className="h-5 w-5 text-gray-400" />
        </button>
      )}

      <button
        onClick={onBookmarksClick}
        title="View bookmarks"
        className="group relative rounded-lg p-2 transition-colors hover:bg-yellow-50"
      >
        <Bookmark
          className="h-5 w-5 text-gray-400 transition-colors group-hover:text-yellow-600"
          fill={bookmarkCount > 0 ? "currentColor" : "none"}
        />
        {bookmarkCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-white">
            {bookmarkCount > 99 ? "99+" : bookmarkCount}
          </span>
        )}
      </button>

      {user && (
        <button
          onClick={onLogout}
          title="Logout"
          className="rounded-lg p-2 transition-colors hover:bg-gray-50"
        >
          <LogOut className="h-5 w-5 text-gray-400" />
        </button>
      )}
    </div>
  </header>
);
