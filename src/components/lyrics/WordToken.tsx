interface WordTokenProps {
  word: string;
  isSelected: boolean;
  hasDefinitions: boolean;
  onClick: () => void;
}

export const WordToken = ({ word, isSelected, hasDefinitions, onClick }: WordTokenProps) => (
  <button
    onClick={onClick}
    className={`
      word-token
      ${isSelected 
        ? 'word-token-selected' 
        : 'word-token-default'}
      ${!hasDefinitions && !isSelected ? 'word-token-disabled' : ''}
    `}
  >
    {word}
  </button>
);