import { useState } from 'react';
import { MapPin, ChevronDown, Check } from 'lucide-react';

interface OriginFilterProps {
  availableOrigins: string[];
  selectedOrigins: string[];
  onChange: (origins: string[]) => void;
  disabled?: boolean;
}

export default function OriginFilter({ 
  availableOrigins, 
  selectedOrigins, 
  onChange, 
  disabled = false 
}: OriginFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOriginToggle = (origin: string) => {
    const newSelected = selectedOrigins.includes(origin)
      ? selectedOrigins.filter(o => o !== origin)
      : [...selectedOrigins, origin];
    
    onChange(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedOrigins.length === availableOrigins.length) {
      onChange([]);
    } else {
      onChange([...availableOrigins]);
    }
  };

  const isOriginSelected = (origin: string) => selectedOrigins.includes(origin);
  const allSelected = selectedOrigins.length === availableOrigins.length;
  const someSelected = selectedOrigins.length > 0 && selectedOrigins.length < availableOrigins.length;

  return (
    <div className={`relative ${disabled ? 'opacity-50' : ''}`}>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
          <h4 className="font-medium text-slate-800 text-sm sm:text-base">Origine</h4>
        </div>

        {/* Dropdown trigger */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-full flex items-center justify-between px-4 py-3 min-h-12 bg-white border border-slate-300 rounded-xl hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200 touch-manipulation"
        >
          <span className="text-slate-700 text-sm sm:text-base truncate">
            {selectedOrigins.length === 0 
              ? 'Toutes les origines'
              : selectedOrigins.length === 1
              ? selectedOrigins[0]
              : `${selectedOrigins.length} origines sélectionnées`
            }
          </span>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown content */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-300 rounded-xl shadow-lg max-h-64 overflow-y-auto">
            {/* Select All option */}
            {availableOrigins.length > 0 && (
              <div
                onClick={handleSelectAll}
                className="flex items-center px-4 py-3 min-h-12 hover:bg-slate-50 cursor-pointer border-b border-slate-100 touch-manipulation"
              >
                <div className="flex items-center justify-center w-6 h-6 mr-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-150 ${
                    allSelected 
                      ? 'bg-indigo-500 border-indigo-500' 
                      : someSelected 
                      ? 'bg-indigo-100 border-indigo-300' 
                      : 'border-slate-300'
                  }`}>
                    {allSelected && <Check className="w-4 h-4 text-white" />}
                    {someSelected && !allSelected && (
                      <div className="w-3 h-3 bg-indigo-500 rounded-sm" />
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {allSelected ? 'Désélectionner tout' : 'Sélectionner tout'}
                </span>
              </div>
            )}

            {/* Individual origins */}
            {availableOrigins.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500">
                Aucune origine disponible
              </div>
            ) : (
              availableOrigins.map((origin) => (
                <div
                  key={origin}
                  onClick={() => handleOriginToggle(origin)}
                  className="flex items-center px-4 py-3 min-h-12 hover:bg-slate-50 cursor-pointer transition-colors duration-150 touch-manipulation"
                >
                  <div className="flex items-center justify-center w-6 h-6 mr-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-150 ${
                      isOriginSelected(origin) 
                        ? 'bg-indigo-500 border-indigo-500' 
                        : 'border-slate-300'
                    }`}>
                      {isOriginSelected(origin) && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  <span className="text-sm text-slate-700">{origin}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Selected origins chips */}
        {selectedOrigins.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedOrigins.map((origin) => (
              <span
                key={origin}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-white"
              >
                {origin}
                <button
                  onClick={() => handleOriginToggle(origin)}
                  className="ml-2 hover:bg-white/20 rounded-full p-1 min-w-6 min-h-6 flex items-center justify-center transition-colors duration-150 touch-manipulation"
                  type="button"
                >
                  <Check className="w-3 h-3 rotate-45" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}