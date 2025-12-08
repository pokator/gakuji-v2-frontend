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
          className="p-1 rounded-full text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100"
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
        className={`p-1.5 rounded-full transition-all duration-200 ${isBookmarked ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50 hover:bg-yellow-100' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'}`}
        title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        <Bookmark className={sizeClasses[size]} fill={isBookmarked ? 'currentColor' : 'none'} />
      </button>

      
    </div>
  );
};