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
    <header className="z-10 flex items-center justify-between border-b border-border bg-surface px-6 py-4 shadow-sm">
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
          className={`flex items-center justify-center rounded-lg p-2 transition-colors bg-button text-button-text force-button hover:bg-surface ${
            isProcessing ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          <ListMusic className="h-5 w-5 text-current" />
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
          <Sun className="h-5 w-5 text-warning" />
        ) : (
          <Moon className="h-5 w-5 text-muted" />
        )}
      </button>

      <button
        onClick={onBookmarksClick}
        title="View bookmarks"
        className="group relative rounded-lg p-2 transition-colors hover:bg-surface"
      >
        <Bookmark
          className="h-5 w-5 text-muted transition-colors group-hover:text-warning"
          fill={bookmarkCount > 0 ? "currentColor" : "none"}
        />
        {bookmarkCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-warning text-xs font-bold text-warning-text">
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
