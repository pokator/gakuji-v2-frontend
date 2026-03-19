import { X } from 'lucide-react';
import { DefinitionsSection } from '../definitions/DefinitionsSection';
import { DefinitionCard } from '../definitions/DefinitionCard';
import { KanjiSection } from '../kanji/KanjiSection';
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
  onToggleKanjiBookmark: (char: string, meanings?: string[]) => void;
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
}: SidebarProps) => (
  <div 
    className={`
      fixed inset-y-0 right-0 z-20 w-full md:w-96 bg-surface shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-border
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `}
  >
    {selectedWord ? (
      <div className="h-full flex flex-col">
        <div className="p-5 border-b border-border flex justify-between items-center bg-surface">
          <div>
            <h2 className="text-3xl font-bold text-primary mb-1">{selectedWord}</h2>
            <p className="text-xs font-medium text-muted uppercase tracking-widest">Selected Token</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-surface rounded-full transition-colors text-muted hover:text-text"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {selectedLine && (
            <div className="bg-surface rounded-lg p-4">
              <p className="text-lg font-medium text-text mb-2">{selectedLine.join('')}</p>
              {selectedTranslation && (
                <p className="text-sm text-muted italic">{selectedTranslation}</p>
              )}
            </div>
          )}
          {/* If an overrideEntry is provided (e.g., last-selected WordEntry), render its definitions here. Otherwise use DefinitionsSection which depends on appData. */}
          {overrideEntry ? (
            <DefinitionCard
              entry={overrideEntry}
              selectedWord={selectedWord as string}
              isBookmarked={isWordBookmarked(selectedWord as string)}
              onToggleBookmark={onToggleWordBookmark}
              onOpenListPicker={() => onOpenListPicker?.('word', String(overrideEntry.idseq ?? selectedWord))}
            />
          ) : (
            <DefinitionsSection 
              selectedWord={selectedWord} 
              appData={appData}
              isWordBookmarked={isWordBookmarked}
              onToggleWordBookmark={onToggleWordBookmark}
              onOpenListPicker={onOpenListPicker}
            />
          )}
          <hr className="border-border" />
          <KanjiSection 
            selectedWord={selectedWord} 
            appData={appData}
            isKanjiBookmarked={isKanjiBookmarked}
            onToggleKanjiBookmark={onToggleKanjiBookmark}
            onOpenListPicker={onOpenListPicker}
          />
        </div>
      </div>
    ) : (
      <div className="h-full flex items-center justify-center text-muted">
        <span className="text-sm">Select a word</span>
      </div>
    )}
  </div>
);