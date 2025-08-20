import type { Category } from '../../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  itemCounts?: { [key: string]: number };
  maxVisible?: number;
  className?: string;
}

export default function CategoryFilter({
  categories,
  selectedCategories,
  onCategoryChange,
  itemCounts = {},
  maxVisible = 8,
  className = ""
}: CategoryFilterProps) {
  const visibleCategories = categories.slice(0, maxVisible);

  const handleCategoryClick = (categoryValue: string) => {
    if (categoryValue === 'Tous') {
      // Si on clique sur "Tous", désélectionner toutes les autres catégories
      onCategoryChange([]);
    } else {
      // Toggle la catégorie
      const newSelection = selectedCategories.includes(categoryValue)
        ? selectedCategories.filter(cat => cat !== categoryValue)
        : [...selectedCategories.filter(cat => cat !== 'Tous'), categoryValue];
      
      onCategoryChange(newSelection);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {visibleCategories.map((category) => {
        const count = itemCounts[category.value] || 0;
        const isSelected = category.value === 'Tous' 
          ? selectedCategories.length === 0 || selectedCategories.includes('Tous')
          : selectedCategories.includes(category.value);
        
        return (
          <button
            key={category.value}
            onClick={() => handleCategoryClick(category.value)}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
              isSelected
                ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                : 'bg-white/70 text-slate-700 hover:bg-white hover:shadow-md hover:scale-105'
            }`}
          >
            {category.label}
            <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}