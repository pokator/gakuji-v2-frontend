import { useRef, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ id: string; name: string }>;
  label?: string;
}

export const FilterDropdown = ({ 
  value, 
  onChange, 
  options,
  label = 'Filter'
}: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get display text for selected value
  const selectedOption = options.find(opt => opt.id === value);
  const displayText = selectedOption?.name || 'All lists';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <div className="filter-dropdown-container" ref={dropdownRef}>
      {label && <label className="filter-dropdown-label">{label}:</label>}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="filter-dropdown-trigger"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{displayText}</span>
        <ChevronDown 
          size={16} 
          className={`filter-dropdown-chevron ${isOpen ? 'open' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="filter-dropdown-menu">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`filter-dropdown-item ${value === option.id ? 'selected' : ''}`}
              role="option"
              aria-selected={value === option.id}
            >
              <span className="filter-dropdown-item-text">{option.name}</span>
              {value === option.id && (
                <span className="filter-dropdown-checkmark">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
