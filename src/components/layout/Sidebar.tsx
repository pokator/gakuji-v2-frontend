import { X } from 'lucide-react';
import { DefinitionCard } from '../definitions/DefinitionCard';
import { UnifiedWordCard } from '../definitions/UnifiedWordCard';
import { getWordData } from '../../utils/dataHelpers';
import type { AppData } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  selectedWord: string | null;
  selectedLine: string[] | null;
  selectedTranslation: string | null;
  appData: AppData | null;
  overrideEntry?: import('../../types').WordEntry | null;
  onClose: () => void;
  isWordBookmarked: (word: string) => boolean;
  isKanjiBookmarked: (char: string) => boolean;
  onToggleWordBookmark: (word: string, furigana: string, idseq?: number) => void;
  onToggleKanjiBookmark: (charOrBookmark: string | import('../../types').BookmarkedKanji) => void;
  onOpenListPicker?: (bookmarkType: 'word' | 'kanji', key: string) => void;
}

export const Sidebar = ({ 
  isOpen, 
  selectedWord, 
  selectedLine,
  selectedTranslation,
  appData,
  overrideEntry,
  onClose,
  isWordBookmarked,
  isKanjiBookmarked,
  onToggleWordBookmark,
  onToggleKanjiBookmark,
  onOpenListPicker
}: SidebarProps) => {
  // Overlay for mobile
  const showOverlay = isOpen;

  return (
    <>
      {/* Mobile overlay - fades in/out */}
      {showOverlay && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 block md:hidden panel-overlay transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar panel - slides in from right */}
      <div 
        className={`
          fixed inset-y-0 right-0 z-40 w-full md:w-96 panel-bg shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-border
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {selectedWord ? (
          <div className="h-full flex flex-col">
            <div className="sidebar-header">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="sidebar-header-title">{selectedWord}</h2>
                  <p className="sidebar-header-label">Selected Token</p>
                </div>
                <button 
                  onClick={onClose}
                  className="sidebar-close-btn"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="sidebar-content space-y-6">
              {selectedLine && (
                <div className="sidebar-line-display">
                  <p className="sidebar-line-text">{selectedLine.join('')}</p>
                  {selectedTranslation && (
                    <p className="sidebar-line-translation">{selectedTranslation}</p>
                  )}
                </div>
              )}
              {/* If an overrideEntry is provided (e.g., last-selected WordEntry), render its definitions here. Otherwise use UnifiedWordCard which combines definitions and kanji. */}
              {overrideEntry ? (
                <DefinitionCard
                  entry={overrideEntry}
                  selectedWord={selectedWord as string}
                  isBookmarked={isWordBookmarked(selectedWord as string)}
                  onToggleBookmark={onToggleWordBookmark}
                  onOpenListPicker={() => onOpenListPicker?.('word', String(overrideEntry.idseq ?? selectedWord))}
                />
              ) : (
                <UnifiedWordCard
                  selectedWord={selectedWord}
                  entries={getWordData(appData, selectedWord)}
                  appData={appData}
                  isWordBookmarked={isWordBookmarked}
                  isKanjiBookmarked={isKanjiBookmarked}
                  onToggleWordBookmark={onToggleWordBookmark}
                  onToggleKanjiBookmark={onToggleKanjiBookmark}
                  onOpenListPicker={onOpenListPicker}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted">
            <span className="text-sm">Select a word</span>
          </div>
        )}
      </div>
    </>
  );
};