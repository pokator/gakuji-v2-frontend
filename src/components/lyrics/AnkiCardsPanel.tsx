import { useState, useEffect } from 'react';
import { X, Brain, Search } from 'lucide-react';
import { AnkiCardDisplay } from './AnkiCardDisplay';
import { AnkiKanjiCardDisplay } from './AnkiKanjiCardDisplay';
import type { AnkiCard, AnkiKanjiCard } from '../../types';

interface AnkiCardsPanelProps {
  isOpen: boolean;
  activeCards: AnkiCard[];
  removedCards: AnkiCard[];
  onClose: () => void;
  onRemoveCard: (card: AnkiCard) => void;
  onRestoreCard: (card: AnkiCard) => void;
  activeKanji: AnkiKanjiCard[];
  removedKanji: AnkiKanjiCard[];
  onRemoveKanji: (kanjiChar: string) => void;
  onRestoreKanji: (kanjiChar: string) => void;
}

export const AnkiCardsPanel = ({
  isOpen,
  activeCards,
  removedCards,
  onClose,
  onRemoveCard,
  onRestoreCard,
  activeKanji,
  removedKanji,
  onRemoveKanji,
  onRestoreKanji,
}: AnkiCardsPanelProps) => {
  const [mainTab, setMainTab] = useState<'words' | 'kanji'>('words');
  const [wordTab, setWordTab] = useState<'active' | 'removed'>('active');
  const [kanjiTab, setKanjiTab] = useState<'active' | 'removed'>('active');
  const [isClosing, setIsClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const totalCards = activeCards.length + removedCards.length;
  const totalKanji = activeKanji.length + removedKanji.length;
  const totalAll = totalCards + totalKanji;

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsClosing(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const cardMatchesSearch = (card: AnkiCard): boolean => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();

    // Search word and furigana
    if (card.word.toLowerCase().includes(query) || card.furigana.toLowerCase().includes(query)) {
      return true;
    }

    // Search in definitions
    if (card.definitions.some(def =>
      def.definition.some(d => d.toLowerCase().includes(query))
    )) {
      return true;
    }

    // Search in context
    if (card.contextLine.toLowerCase().includes(query) || 
        card.contextTranslation?.toLowerCase().includes(query)) {
      return true;
    }

    return false;
  };

  const kanjiMatchesSearch = (kanji: AnkiKanjiCard): boolean => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();

    // Search character
    if (kanji.char.includes(query)) {
      return true;
    }

    // Search meanings
    if (kanji.data.meanings.some(m => m.toLowerCase().includes(query))) {
      return true;
    }

    // Search readings
    if (kanji.data.readings_on?.some(r => r.toLowerCase().includes(query))) {
      return true;
    }
    if (kanji.data.readings_kun?.some(r => r.toLowerCase().includes(query))) {
      return true;
    }

    // Search radicals
    if (kanji.data.radicals?.some(r => r.toLowerCase().includes(query))) {
      return true;
    }

    return false;
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className={`panel-overlay ${isClosing ? 'closing' : ''}`}
          onClick={handleClose}
        />
      )}

      {/* Panel */}
      <div
        className={`
          fixed inset-y-0 right-0 z-40 w-full md:w-96 panel-bg text-surface-text shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-border
          ${isOpen && !isClosing ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bookmarks-header">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <Brain className="text-secondary" size={20} />
                <h2 className="bookmarks-header-title">Anki Cards</h2>
              </div>
              <button
                onClick={handleClose}
                className="bookmarks-close-btn"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="bookmarks-header-subtitle">
              Please review the cards before importing - tokens may not be 100% accurate.
            </p>
          </div>

          {/* Content */}
          <div className="bookmarks-content">
            {totalAll === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Brain className="w-16 h-16 text-muted mb-4" />
                <p className="text-muted text-sm mb-2">No cards yet</p>
                <p className="text-muted text-xs">
                  Click the brain icon in the header to convert lyrics to Anki cards
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search Input */}
                <div className="rounded-lg border border-border bg-surface/50 duration-200">
                  <div className="px-3 py-2">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-2.5 text-muted pointer-events-none" />
                      <input
                        type="text"
                        placeholder={mainTab === 'words' ? 'Search words...' : 'Search kanji...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border-0 rounded bg-background text-text placeholder-muted focus:outline-none focus:bg-surface transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Main Tabs: Words / Kanji */}
                <div className="flex gap-1 border-b border-border/50">
                  {totalCards > 0 && (
                    <button
                      onClick={() => setMainTab('words')}
                      className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-0.5 ${
                        mainTab === 'words'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted hover:text-text'
                      }`}
                    >
                      Words <span className="text-xs">({totalCards})</span>
                    </button>
                  )}
                  {totalKanji > 0 && (
                    <button
                      onClick={() => setMainTab('kanji')}
                      className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-0.5 ${
                        mainTab === 'kanji'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted hover:text-text'
                      }`}
                    >
                      Kanji <span className="text-xs">({totalKanji})</span>
                    </button>
                  )}
                </div>

                {/* WORDS SECTION */}
                {mainTab === 'words' && (
                  <>
                    {/* Results counter */}
                    {searchQuery.trim() && (
                      <div className="px-1 py-1 text-xs text-muted opacity-100 transition-opacity duration-200">
                        {(() => {
                          const activeMatches = activeCards.filter(cardMatchesSearch).length;
                          const removedMatches = removedCards.filter(cardMatchesSearch).length;
                          const total = activeMatches + removedMatches;
                          return total === 0 ? 'No matches found' : `${total} match${total !== 1 ? 'es' : ''} found`;
                        })()}
                      </div>
                    )}

                    {/* Word Sub-Tabs */}
                    <div className="flex gap-1 border-b border-border/50">
                      {activeCards.length > 0 && (
                        <button
                          onClick={() => setWordTab('active')}
                          className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-0.5 ${
                            wordTab === 'active'
                              ? 'border-primary text-primary'
                              : 'border-transparent text-muted hover:text-text'
                          }`}
                        >
                          Active{' '}
                          <span className="text-xs">
                            ({activeCards.filter(cardMatchesSearch).length})
                          </span>
                        </button>
                      )}
                      {removedCards.length > 0 && (
                        <button
                          onClick={() => setWordTab('removed')}
                          className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-0.5 ${
                            wordTab === 'removed'
                              ? 'border-primary text-primary'
                              : 'border-transparent text-muted hover:text-text'
                          }`}
                        >
                          Removed{' '}
                          <span className="text-xs">
                            ({removedCards.filter(cardMatchesSearch).length})
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Active Words Tab */}
                    {wordTab === 'active' && activeCards.length > 0 && (
                      <div className="space-y-2">
                        {activeCards.filter(cardMatchesSearch).map((card, idx) => (
                          <AnkiCardDisplay
                            key={`${card.word}-${card.furigana}-${idx}`}
                            card={card}
                            onRemove={() => onRemoveCard(card)}
                          />
                        ))}
                        {activeCards.filter(cardMatchesSearch).length === 0 && (
                          <div className="text-center py-8 text-muted text-sm">
                            No active cards match your search
                          </div>
                        )}
                      </div>
                    )}

                    {/* Removed Words Tab */}
                    {wordTab === 'removed' && removedCards.length > 0 && (
                      <div className="space-y-2">
                        {removedCards.filter(cardMatchesSearch).map((card: AnkiCard, idx: number) => (
                          <div
                            key={`${card.word}-${card.furigana}-${idx}-removed`}
                            className="card-word opacity-60"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2 flex-1">
                                <div className="text-lg font-bold text-primary font-sans">
                                  {card.word}
                                </div>
                                <div className="text-sm text-muted font-mono bg-surface px-2 py-0.5 rounded text-surface-text">
                                  {card.furigana}
                                </div>
                              </div>
                              <button
                                onClick={() => onRestoreCard(card)}
                                className="px-3 py-1 text-xs font-medium bg-primary text-surface hover:bg-primary/90 rounded transition-colors"
                              >
                                Restore
                              </button>
                            </div>
                          </div>
                        ))}
                        {removedCards.filter(cardMatchesSearch).length === 0 && (
                          <div className="text-center py-8 text-muted text-sm">
                            No removed cards match your search
                          </div>
                        )}
                      </div>
                    )}

                    {/* Word view-specific empty states */}
                    {wordTab === 'active' && activeCards.length === 0 && (
                      <div className="text-center py-8 text-muted text-sm">
                        All word cards have been removed
                      </div>
                    )}
                    {wordTab === 'removed' && removedCards.length === 0 && (
                      <div className="text-center py-8 text-muted text-sm">
                        No removed word cards
                      </div>
                    )}
                  </>
                )}

                {/* KANJI SECTION */}
                {mainTab === 'kanji' && (
                  <>
                    {/* Results counter */}
                    {searchQuery.trim() && (
                      <div className="px-1 py-1 text-xs text-muted opacity-100 transition-opacity duration-200">
                        {(() => {
                          const activeMatches = activeKanji.filter(kanjiMatchesSearch).length;
                          const removedMatches = removedKanji.filter(kanjiMatchesSearch).length;
                          const total = activeMatches + removedMatches;
                          return total === 0 ? 'No matches found' : `${total} match${total !== 1 ? 'es' : ''} found`;
                        })()}
                      </div>
                    )}

                    {/* Kanji Sub-Tabs */}
                    <div className="flex gap-1 border-b border-border/50">
                      {activeKanji.length > 0 && (
                        <button
                          onClick={() => setKanjiTab('active')}
                          className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-0.5 ${
                            kanjiTab === 'active'
                              ? 'border-primary text-primary'
                              : 'border-transparent text-muted hover:text-text'
                          }`}
                        >
                          Active{' '}
                          <span className="text-xs">
                            ({activeKanji.filter(kanjiMatchesSearch).length})
                          </span>
                        </button>
                      )}
                      {removedKanji.length > 0 && (
                        <button
                          onClick={() => setKanjiTab('removed')}
                          className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-0.5 ${
                            kanjiTab === 'removed'
                              ? 'border-primary text-primary'
                              : 'border-transparent text-muted hover:text-text'
                          }`}
                        >
                          Removed{' '}
                          <span className="text-xs">
                            ({removedKanji.filter(kanjiMatchesSearch).length})
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Active Kanji Tab */}
                    {kanjiTab === 'active' && activeKanji.length > 0 && (
                      <div className="space-y-2">
                        {activeKanji.filter(kanjiMatchesSearch).map((kanji, idx) => (
                          <AnkiKanjiCardDisplay
                            key={`${kanji.char}-${idx}`}
                            kanji={kanji}
                            onRemove={() => onRemoveKanji(kanji.char)}
                          />
                        ))}
                        {activeKanji.filter(kanjiMatchesSearch).length === 0 && (
                          <div className="text-center py-8 text-muted text-sm">
                            No active kanji match your search
                          </div>
                        )}
                      </div>
                    )}

                    {/* Removed Kanji Tab */}
                    {kanjiTab === 'removed' && removedKanji.length > 0 && (
                      <div className="space-y-2">
                        {removedKanji.filter(kanjiMatchesSearch).map((kanji: AnkiKanjiCard, idx: number) => (
                          <div
                            key={`${kanji.char}-${idx}-removed`}
                            className="card-word opacity-60"
                          >
                            <div className="flex justify-between items-start">
                              <div className="text-2xl font-bold text-primary font-sans">
                                {kanji.char}
                              </div>
                              <button
                                onClick={() => onRestoreKanji(kanji.char)}
                                className="px-3 py-1 text-xs font-medium bg-primary text-surface hover:bg-primary/90 rounded transition-colors"
                              >
                                Restore
                              </button>
                            </div>
                          </div>
                        ))}
                        {removedKanji.filter(kanjiMatchesSearch).length === 0 && (
                          <div className="text-center py-8 text-muted text-sm">
                            No removed kanji match your search
                          </div>
                        )}
                      </div>
                    )}

                    {/* Kanji view-specific empty states */}
                    {kanjiTab === 'active' && activeKanji.length === 0 && (
                      <div className="text-center py-8 text-muted text-sm">
                        All kanji have been removed
                      </div>
                    )}
                    {kanjiTab === 'removed' && removedKanji.length === 0 && (
                      <div className="text-center py-8 text-muted text-sm">
                        No removed kanji
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
