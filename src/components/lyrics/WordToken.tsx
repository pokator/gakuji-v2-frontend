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
      relative px-1 py-0.5 rounded transition-all duration-200
      ${isSelected 
        ? 'bg-indigo-600 text-white shadow-md scale-105 z-10' 
        : 'hover:bg-indigo-50 hover:text-indigo-700 text-slate-700'}
      ${!hasDefinitions && !isSelected ? 'cursor-default opacity-80' : 'cursor-pointer'}
    `}
  >
    {word}
  </button>
);