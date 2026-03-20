import { BookOpen, Bookmark, LogOut, ListMusic, Sun, Moon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

interface HeaderProps {
  bookmarkCount: number;
  onBookmarksClick: () => void;
  user: any;
  onLogout: () => void;
  onOpenSongsManager?: () => void;
  isProcessing?: boolean;
  activeTitle?: string | null;
  activeArtist?: string | null;
}

export const Header = ({
  bookmarkCount,
  onBookmarksClick,
  user,
  onLogout,
  onOpenSongsManager,
  isProcessing,
  activeTitle,
  activeArtist,
}: HeaderProps) => {
  const { theme, toggle } = useTheme();

  return (
    <header className="z-10 flex items-center justify-between border-b border-border bg-surface text-surface-text px-6 py-4 shadow-sm">
    <div className="flex w-[400px] items-center justify-start gap-2">
      <BookOpen className="h-6 w-6 text-primary" />
      <h1 className="text-xl font-bold tracking-tight text-text">
        Gakuji
      </h1>
    </div>

    <div className="flex-1 min-w-0 px-4">
      <div className="text-center">
        {(activeTitle || activeArtist) && (
          <span className="inline-block max-w-full truncate text-2xl font-extrabold tracking-tight text-text">
            {activeTitle || "— No Title —"}
            {activeArtist && (
              <>
                <span className="mx-2 font-light text-muted">—</span>
                <span className="font-semibold text-muted">
                  {activeArtist}
                </span>
              </>
            )}
          </span>
        )}
      </div>
    </div>

    <div className="flex w-[400px] items-center justify-end gap-4">
      <div className="hidden text-xs font-medium text-muted sm:block">
        Click words to analyze
      </div>

      {onOpenSongsManager && (
        <button
          onClick={onOpenSongsManager}
          aria-label="Open songs manager"
          title="Songs"
          disabled={isProcessing}
          className="rounded-lg p-2 transition-colors hover:bg-surface disabled:opacity-50"
        >
          <ListMusic className="h-5 w-5 text-secondary" />
        </button>
      )}

      {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          className="rounded-lg p-2 transition-colors hover:bg-surface"
        >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5 text-secondary" />
        ) : (
          <Moon className="h-5 w-5 text-muted" />
        )}
      </button>

      <button
        onClick={onBookmarksClick}
        title="View bookmarks"
        className="bookmark-icon-btn group relative rounded-lg p-2 transition-colors"
      >
        <Bookmark
          className="bookmark-icon h-5 w-5"
          fill={bookmarkCount > 0 ? "currentColor" : "none"}
        />
        {bookmarkCount > 0 && (
          <span className="bookmark-counter">
            {bookmarkCount > 99 ? "99+" : bookmarkCount}
          </span>
        )}
      </button>

      {user && (
        <button
          onClick={onLogout}
          title="Logout"
          className="rounded-lg p-2 transition-colors hover:bg-surface"
        >
          <LogOut className="h-5 w-5 text-muted" />
        </button>
      )}
    </div>
  </header>
  );
};
