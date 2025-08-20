import { Baby } from 'lucide-react';

interface BabyFriendlyFilterProps {
  isBabyFriendly?: boolean;
  onChange: (isBabyFriendly?: boolean) => void;
  disabled?: boolean;
}

export default function BabyFriendlyFilter({
  isBabyFriendly,
  onChange,
  disabled = false
}: BabyFriendlyFilterProps) {
  const handleSelectionChange = (value: string) => {
    if (value === 'all') {
      onChange(undefined);
    } else if (value === 'baby') {
      onChange(true);
    } else if (value === 'regular') {
      onChange(false);
    }
  };

  const getCurrentValue = () => {
    if (isBabyFriendly === true) return 'baby';
    if (isBabyFriendly === false) return 'regular';
    return 'all';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg sm:text-xl font-semibold text-slate-800 flex items-center">
        <Baby className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-pink-500" />
        <span className="sm:hidden">Bébé</span>
        <span className="hidden sm:inline">Recettes pour bébé</span>
      </h3>

      <div className="space-y-2">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="baby-filter"
            value="all"
            checked={getCurrentValue() === 'all'}
            onChange={(e) => handleSelectionChange(e.target.value)}
            className="w-4 h-4 text-pink-500 border-slate-300 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            disabled={disabled}
          />
          <span className="text-sm text-slate-700">Toutes les recettes</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="baby-filter"
            value="baby"
            checked={getCurrentValue() === 'baby'}
            onChange={(e) => handleSelectionChange(e.target.value)}
            className="w-4 h-4 text-pink-500 border-slate-300 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            disabled={disabled}
          />
          <span className="text-sm text-slate-700 flex items-center space-x-1">
            <Baby className="w-3 h-3 text-pink-500" />
            <span>Adaptées aux bébés uniquement</span>
          </span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="baby-filter"
            value="regular"
            checked={getCurrentValue() === 'regular'}
            onChange={(e) => handleSelectionChange(e.target.value)}
            className="w-4 h-4 text-pink-500 border-slate-300 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            disabled={disabled}
          />
          <span className="text-sm text-slate-700">Recettes classiques uniquement</span>
        </label>
      </div>

      {isBabyFriendly !== undefined && (
        <div className="mt-3 p-3 bg-pink-50 border border-pink-200 rounded-lg">
          <p className="text-sm text-pink-800">
            {isBabyFriendly 
              ? "Affichage des recettes adaptées aux bébés (sans sel, sans sucre ajouté)"
              : "Affichage des recettes classiques (non adaptées aux bébés)"
            }
          </p>
        </div>
      )}
    </div>
  );
}