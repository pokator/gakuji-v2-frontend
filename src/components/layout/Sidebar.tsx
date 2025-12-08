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
      fixed inset-y-0 right-0 z-20 w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-gray-100
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `}
  >
    {selectedWord ? (
      <div className="h-full flex flex-col">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-3xl font-bold text-indigo-900 mb-1">{selectedWord}</h2>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Selected Token</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {selectedLine && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-lg font-medium text-slate-700 mb-2">{selectedLine.join('')}</p>
              {selectedTranslation && (
                <p className="text-sm text-slate-500 italic">{selectedTranslation}</p>
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
          <hr className="border-gray-100" />
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
      <div className="h-full flex items-center justify-center text-gray-400">
        <span className="text-sm">Select a word</span>
      </div>
    )}
  </div>
);