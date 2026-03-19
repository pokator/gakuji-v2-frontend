import { Bookmark, List } from 'lucide-react';

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onClick: () => void;
  onOpenListPicker?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BookmarkButton = ({ 
  isBookmarked, 
  onClick, 
  onOpenListPicker,
  size = 'md',
  className = '' 
}: BookmarkButtonProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {onOpenListPicker && (
        <button
          onClick={() => {
            try {
              onOpenListPicker?.();
            } catch (err) {
              console.error('[BookmarkButton] onOpenListPicker click error', err);
            }
          }}
          className="p-1 rounded-full text-muted hover:text-text bg-surface hover:bg-surface/95"
          title="Edit lists"
        >
          <List className="w-4 h-4" />
        </button>
      )}
      
      <button
        onClick={() => {
          try {
            onClick();
          } catch (err) {
            console.error('[BookmarkButton] onClick handler error', err);
          }
        }}
        className={`p-1.5 rounded-full transition-all duration-200 ${isBookmarked ? 'text-warning hover:text-warning bg-warning-bg hover:bg-warning-border' : 'text-muted hover:text-warning hover:bg-warning-bg'}`}
        title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        <Bookmark className={sizeClasses[size]} fill={isBookmarked ? 'currentColor' : 'none'} />
      </button>

      
    </div>
  );
};