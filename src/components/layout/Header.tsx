import { BookOpen, Bookmark, LogOut, Clipboard, List } from 'lucide-react';

interface HeaderProps {
  bookmarkCount: number;
  onBookmarksClick: () => void;
  user: any;
  onLogout: () => void;
  onOpenLyricsModal?: () => void;
  onOpenSavedSongs?: () => void;
  isProcessing?: boolean;
}

export const Header = ({ bookmarkCount, onBookmarksClick, user, onLogout, onOpenLyricsModal, onOpenSavedSongs, isProcessing }: HeaderProps) => (
  <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
    <div className="flex items-center gap-2">
      <BookOpen className="text-indigo-600 w-6 h-6" />
      <h1 className="text-xl font-bold tracking-tight text-slate-800">Gakuji</h1>
    </div>
    
    <div className="flex items-center gap-4">
      <div className="text-xs text-gray-400 font-medium hidden sm:block">
        Click words to analyze
      </div>
      {onOpenLyricsModal && (
        <button
          onClick={onOpenLyricsModal}
          aria-label="Open lyrics modal"
          title="Paste lyrics"
          disabled={isProcessing}
          className={`p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Clipboard className="w-5 h-5 text-gray-400" />
        </button>
      )}
      {onOpenSavedSongs && (
        <button
          onClick={onOpenSavedSongs}
          aria-label="Saved songs"
          title="Saved songs"
          className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <List className="w-5 h-5 text-gray-400" />
        </button>
      )}
      <button
        onClick={onBookmarksClick}
        className="relative p-2 hover:bg-yellow-50 rounded-lg transition-colors group"
        title="View bookmarks"
      >
        <Bookmark 
          className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 transition-colors" 
          fill={bookmarkCount > 0 ? 'currentColor' : 'none'}
        />
        {bookmarkCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {bookmarkCount > 99 ? '99+' : bookmarkCount}
          </span>
        )}
      </button>
      {user && (
        <button
          onClick={onLogout}
          className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5 text-gray-400" />
        </button>
      )}
    </div>
  </header>
);