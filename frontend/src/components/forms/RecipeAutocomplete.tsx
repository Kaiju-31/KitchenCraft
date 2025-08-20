import { useState, useCallback, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

interface RecipeAutocompleteProps {
  onRecipeSelect?: (recipeName: string) => void;
  onSearch?: (query: string) => Promise<string[]>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function RecipeAutocomplete({
  onRecipeSelect,
  onSearch,
  value,
  onChange,
  placeholder = "Rechercher une recette...",
  disabled = false
}: RecipeAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const handleInputChange = useCallback(async (newValue: string) => {
    onChange(newValue);
    setHighlightedIndex(-1);

    if (newValue.trim().length >= 2) {
      setIsLoading(true);
      setShowSuggestions(true);
      
      try {
        if (onSearch) {
          const searchResults = await onSearch(newValue.trim());
          setSuggestions(searchResults.slice(0, 10));
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Erreur lors de la recherche de recettes:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [onChange, onSearch]);

  const handleRecipeSelect = useCallback((recipeName: string) => {
    onChange(recipeName);
    setSuggestions([]);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    if (onRecipeSelect) {
      onRecipeSelect(recipeName);
    }
  }, [onChange, onRecipeSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleRecipeSelect(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [showSuggestions, suggestions, highlightedIndex, handleRecipeSelect]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      suggestionsRef.current &&
      !suggestionsRef.current.contains(e.target as Node) &&
      inputRef.current &&
      !inputRef.current.contains(e.target as Node)
    ) {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-3 min-h-12 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors duration-200 bg-white/90 backdrop-blur-sm text-slate-800 placeholder-slate-400 text-sm sm:text-base touch-manipulation"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 shadow-xl max-h-64 overflow-y-auto"
        >
          {suggestions.map((recipeName, index) => (
            <div
              key={index}
              onClick={() => handleRecipeSelect(recipeName)}
              className={`px-4 py-3 min-h-12 cursor-pointer transition-colors duration-150 border-b border-slate-100 last:border-b-0 touch-manipulation ${
                index === highlightedIndex
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="font-medium text-sm sm:text-base">{recipeName}</div>
            </div>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && !isLoading && value.trim().length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 shadow-xl">
          <div className="px-4 py-3 text-slate-500 text-center">
            Aucune recette trouvée
          </div>
        </div>
      )}
    </div>
  );
}