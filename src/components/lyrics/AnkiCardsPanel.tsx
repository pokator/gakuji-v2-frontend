import { useState, useEffect } from 'react';
import { X, Brain, Search, Send, Loader, Info } from 'lucide-react';
import { AnkiCardDisplay } from './AnkiCardDisplay';
import { AnkiKanjiCardDisplay } from './AnkiKanjiCardDisplay';
import type { AnkiCard, AnkiKanjiCard } from '../../types';
import {
  transformCardsToBackendFormat,
  transformKanjiToBackendFormat,
  getDefaultDeckName,
  validateDeckName,
} from '../../utils/ankiSubmissionHelper';
import { submitWordsToAnki, submitKanjiToAnki } from '../../utils/ankiApi';

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
  pushToast: (message: string, type?: 'success' | 'error' | 'info') => void;
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
  pushToast,
}: AnkiCardsPanelProps) => {
  const [mainTab, setMainTab] = useState<'words' | 'kanji'>('words');
  const [wordTab, setWordTab] = useState<'active' | 'removed'>('active');
  const [kanjiTab, setKanjiTab] = useState<'active' | 'removed'>('active');
  const [isClosing, setIsClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [wordsDeckName, setWordsDeckName] = useState<string>(getDefaultDeckName('words'));
  const [kanjiDeckName, setKanjiDeckName] = useState<string>(getDefaultDeckName('kanji'));
  const [isSubmittingWords, setIsSubmittingWords] = useState(false);
  const [isSubmittingKanji, setIsSubmittingKanji] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isSetupModalClosing, setIsSetupModalClosing] = useState(false);

  const totalCards = activeCards.length + removedCards.length;
  const totalKanji = activeKanji.length + removedKanji.length;
  const totalAll = totalCards + totalKanji;

  const handleCloseSetupModal = () => {
    setIsSetupModalClosing(true);
    setTimeout(() => {
      setIsSetupModalOpen(false);
      setIsSetupModalClosing(false);
    }, 200);
  };

  useEffect(() => {
    if (isSetupModalOpen) {
      const timer = setTimeout(() => {
        setIsSetupModalClosing(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isSetupModalOpen]);

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

  const handleSubmitWords = async () => {
    setSubmissionError(null);

    // Validate deck name
    const validation = validateDeckName(wordsDeckName);
    if (!validation.valid) {
      setSubmissionError(validation.error || 'Invalid deck name');
      return;
    }

    // Validate cards exist
    if (activeCards.length === 0) {
      setSubmissionError('No words to submit');
      return;
    }

    setIsSubmittingWords(true);

    try {
      const payload = transformCardsToBackendFormat(activeCards, wordsDeckName);
      const response = await submitWordsToAnki(payload);

      setSubmissionError(null);
      setIsSubmittingWords(false);

      // Reset deck name to default after successful submission
      setWordsDeckName(getDefaultDeckName('words'));

      // Show success feedback
      const message =
        response.added_count !== undefined
          ? `Successfully added ${response.added_count} word${response.added_count !== 1 ? 's' : ''} to Anki!`
          : 'Words submitted successfully!';
      pushToast(message, 'success');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to submit words to Anki';
      setSubmissionError(errorMessage);
      setIsSubmittingWords(false);
    }
  };

  const handleSubmitKanji = async () => {
    setSubmissionError(null);

    // Validate deck name
    const validation = validateDeckName(kanjiDeckName);
    if (!validation.valid) {
      setSubmissionError(validation.error || 'Invalid deck name');
      return;
    }

    // Validate kanji exist
    if (activeKanji.length === 0) {
      setSubmissionError('No kanji to submit');
      return;
    }

    setIsSubmittingKanji(true);

    try {
      const payload = transformKanjiToBackendFormat(activeKanji, kanjiDeckName);
      const response = await submitKanjiToAnki(payload);

      setSubmissionError(null);
      setIsSubmittingKanji(false);

      // Reset deck name to default after successful submission
      setKanjiDeckName(getDefaultDeckName('kanji'));

      // Show success feedback
      const message =
        response.added_count !== undefined
          ? `Successfully added ${response.added_count} kanji to Anki!`
          : 'Kanji submitted successfully!';
      pushToast(message, 'success');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to submit kanji to Anki';
      setSubmissionError(errorMessage);
      setIsSubmittingKanji(false);
    }
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
                <button
                  onClick={() => setIsSetupModalOpen(true)}
                  className="p-1 rounded hover:bg-surface/50 transition-colors text-muted hover:text-text"
                  title="Setup instructions"
                >
                  <Info size={18} />
                </button>
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
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search Input - Fixed */}
            {totalAll > 0 && (
              <div className="px-5 pt-4 pb-2 border-b border-border/50">
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
              </div>
            )}

            {/* Main Tabs - Fixed */}
            {totalAll > 0 && (
              <div className="px-5 pb-3 border-b border-border/50">
                <div className="flex gap-1">
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
              </div>
            )}

            {/* Scrollable Content for Cards */}
            <div className="flex-1 overflow-y-auto">
              {totalAll === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <Brain className="w-16 h-16 text-muted mb-4" />
                  <p className="text-muted text-sm mb-2">No cards yet</p>
                  <p className="text-muted text-xs">
                    Click the brain icon in the header to convert lyrics to Anki cards
                  </p>
                </div>
              ) : (
                <div className="px-5 py-4 space-y-4">
                  {/* Results counter */}
                  {searchQuery.trim() && (
                    <div className="px-1 py-1 text-xs text-muted opacity-100 transition-opacity duration-200">
                      {(() => {
                        if (mainTab === 'words') {
                          const activeMatches = activeCards.filter(cardMatchesSearch).length;
                          const removedMatches = removedCards.filter(cardMatchesSearch).length;
                          const total = activeMatches + removedMatches;
                          return total === 0 ? 'No matches found' : `${total} match${total !== 1 ? 'es' : ''} found`;
                        } else {
                          const activeMatches = activeKanji.filter(kanjiMatchesSearch).length;
                          const removedMatches = removedKanji.filter(kanjiMatchesSearch).length;
                          const total = activeMatches + removedMatches;
                          return total === 0 ? 'No matches found' : `${total} match${total !== 1 ? 'es' : ''} found`;
                        }
                      })()}
                    </div>
                  )}

                  {/* Word Sub-Tabs */}
                  {mainTab === 'words' && (
                    <>
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

                  {/* Kanji Sub-Tabs */}
                  {mainTab === 'kanji' && (
                    <>
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

          {/* SUBMISSION SECTION - Pinned at bottom */}
          {totalAll > 0 && (
            <div className="border-t border-border/50 px-5 py-4 space-y-3">
              {/* Error message */}
              {submissionError && (
                <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded text-red-600 text-sm">
                  {submissionError}
                </div>
              )}

              {/* Deck name input */}
              <div>
                <label className="text-xs font-medium text-muted block mb-1.5">
                  {mainTab === 'words' ? 'Words Deck Name' : 'Kanji Deck Name'}
                </label>
                <input
                  type="text"
                  value={mainTab === 'words' ? wordsDeckName : kanjiDeckName}
                  onChange={(e) => {
                    if (mainTab === 'words') {
                      setWordsDeckName(e.target.value);
                    } else {
                      setKanjiDeckName(e.target.value);
                    }
                    setSubmissionError(null);
                  }}
                  placeholder={
                    mainTab === 'words' ? 'Gakuji Words' : 'Gakuji Kanji'
                  }
                  disabled={
                    mainTab === 'words' ? isSubmittingWords : isSubmittingKanji
                  }
                  className="w-full px-3 py-2 text-sm border border-border rounded bg-background text-text placeholder-muted focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                />
              </div>

              {/* Submit button */}
              <button
                onClick={mainTab === 'words' ? handleSubmitWords : handleSubmitKanji}
                disabled={
                  mainTab === 'words'
                    ? isSubmittingWords || activeCards.length === 0
                    : isSubmittingKanji || activeKanji.length === 0
                }
                className="w-full px-4 py-2 bg-primary text-surface font-medium rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {mainTab === 'words' ? (
                  <>
                    {isSubmittingWords ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Submit {activeCards.length} Word{activeCards.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {isSubmittingKanji ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Submit {activeKanji.length} Kanji
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Setup Instructions Modal */}
      {isSetupModalOpen && (
        <>
          <div 
            className={`fixed inset-0 z-50 modal-overlay ${isSetupModalClosing ? 'closing' : ''}`}
            onClick={handleCloseSetupModal}
          />
          <div 
            className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none modal-overlay-container ${isSetupModalClosing ? 'closing' : ''}`}
          >
            <div
              className={`rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto pointer-events-auto anki-setup-modal ${isSetupModalClosing ? 'closing' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 anki-setup-modal-header border-b px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-text">Anki Setup</h3>
                <button
                  onClick={handleCloseSetupModal}
                  className="p-1 rounded hover:bg-surface/50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-6 py-4 space-y-4 text-sm text-text">
                <div>
                  <h4 className="font-semibold text-primary mb-2">Step 1: Install Anki</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-2 text-muted">
                    <li>Download Anki from <span className="text-text font-mono">https://apps.ankiweb.net/</span></li>
                    <li>Install the application for your operating system</li>
                    <li>Launch Anki and create your first deck (optional)</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">Step 2: Install AnkiConnect Add-on</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-2 text-muted">
                    <li>In Anki, go to <span className="font-mono text-text">Tools → Add-ons</span></li>
                    <li>Click <span className="font-mono text-text">Get Add-ons</span></li>
                    <li>Enter the code: <span className="font-mono text-text font-semibold">2055492159</span></li>
                    <li>Click <span className="font-mono text-text">OK</span> to install</li>
                    <li>Restart Anki</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">Step 3: Verify AnkiConnect is Running</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-2 text-muted">
                    <li>Open Anki</li>
                    <li>AnkiConnect runs automatically in the background</li>
                    <li>You should see no errors in the Anki interface</li>
                  </ol>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                  <p className="text-xs font-semibold text-yellow-700 mb-1">⚠️ Note for Mac Users:</p>
                  <p className="text-xs text-yellow-700">
                    Mac OS's App Nap feature may put Anki to sleep, causing connection issues. To prevent this:
                    <ul className="list-disc list-inside mt-1 ml-2">
                      <li>1. Open the terminal.</li>
                      <li>2. Run the command: <span className="font-mono text-text">defaults write net.ichi2.anki NSAppSleepDisabled -bool true</span></li>
                      <li>3. Restart Anki.</li>
                    </ul>
                  </p>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                  <p className="text-xs font-semibold text-yellow-700 mb-1">⚠️ Important:</p>
                  <p className="text-xs text-yellow-700">
                    If you encounter connection errors, make sure:
                    <ul className="list-disc list-inside mt-1 ml-2">
                      <li>Anki is open and running</li>
                      <li>AnkiConnect add-on is installed and enabled</li>
                      <li>No firewall is blocking port 8765</li>
                    </ul>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
