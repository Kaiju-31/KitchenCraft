import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import type { Ingredient } from '../../types';

interface IngredientAutocompleteProps {
  ingredients: Ingredient[];
  onIngredientSelect: (ingredient: Ingredient) => void;
  onNewIngredientRequest?: (name: string) => void;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function IngredientAutocomplete({
  ingredients,
  onIngredientSelect,
  onNewIngredientRequest,
  placeholder = "Rechercher un ingrédient...",
  value = "",
  onChange,
  className = ""
}: IngredientAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCreateOption, setShowCreateOption] = useState(false);
  const [isIngredientSelected, setIsIngredientSelected] = useState(false);

  // Filtrer les suggestions basées sur la saisie
  useEffect(() => {
    if (inputValue.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setShowCreateOption(false);
      return;
    }

    const filtered = ingredients.filter(ingredient =>
      ingredient.name.toLowerCase().includes(inputValue.toLowerCase())
    ).slice(0, 8);
    
    // Vérifier s'il y a une correspondance exacte
    const hasExactMatch = ingredients.some(ingredient =>
      ingredient.name.toLowerCase() === inputValue.toLowerCase()
    );
    
    setSuggestions(filtered);
    
    // LOGIQUE SIMPLIFIÉE : Toujours afficher si >= 2 caractères ET pas d'ingrédient sélectionné
    const shouldShowDropdown = inputValue.length >= 2 && !isIngredientSelected;
    const shouldShowCreateButton = inputValue.length >= 2 && onNewIngredientRequest;
    
    // console.log('IngredientAutocomplete useEffect:', {
    //   inputValue,
    //   filtered: filtered.length,
    //   shouldShowDropdown,
    //   shouldShowCreateButton,
    //   isIngredientSelected,
    //   willSetShowSuggestions: shouldShowDropdown
    // });
    
    setShowSuggestions(shouldShowDropdown);
    setShowCreateOption(shouldShowCreateButton);
  }, [inputValue, ingredients, onNewIngredientRequest, isIngredientSelected]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    setIsIngredientSelected(false); // Reset quand l'utilisateur tape
    onChange?.(newValue);
  };

  const handleSuggestionClick = (ingredient: Ingredient) => {
    setInputValue(ingredient.name);
    setShowSuggestions(false);
    setIsIngredientSelected(true); // Marquer comme sélectionné
    onIngredientSelect(ingredient);
    onChange?.(ingredient.name);
  };

  const handleInputBlur = () => {
    // Délai pour permettre le clic sur une suggestion
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleCreateNewIngredient = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onNewIngredientRequest && inputValue.trim()) {
      onNewIngredientRequest(inputValue.trim());
      setShowSuggestions(false);
      setInputValue(''); // Vider l'input après création
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => !isIngredientSelected && inputValue.length >= 2 && setShowSuggestions(true)}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className="w-full px-4 py-3 min-h-12 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm sm:text-base touch-manipulation"
      />

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-10 mt-1 max-h-48 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 min-h-12 hover:bg-emerald-50 transition-colors duration-150 border-b border-slate-100 touch-manipulation"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800 text-sm sm:text-base">{suggestion.name}</span>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full flex-shrink-0">
                  {suggestion.basicCategory || suggestion.category}
                </span>
              </div>
            </button>
          ))}
          
          {(showCreateOption || inputValue.length >= 2) && (
            <button
              type="button"
              onClick={handleCreateNewIngredient}
              className="w-full text-left px-4 py-3 min-h-12 hover:bg-blue-50 transition-colors duration-150 border-t border-slate-200 bg-blue-50/50 touch-manipulation"
            >
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-blue-700 text-sm sm:text-base">
                  Créer "{inputValue}" comme nouvel ingrédient
                </span>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}