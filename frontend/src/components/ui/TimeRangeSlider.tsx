import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { formatTimeDisplay } from '../../utils/timeUtils';

interface TimeRangeSliderProps {
  minTime?: number;
  maxTime?: number;
  onChange: (minTime: number | undefined, maxTime: number | undefined) => void;
  disabled?: boolean;
}

export default function TimeRangeSlider({ 
  minTime, 
  maxTime, 
  onChange, 
  disabled = false 
}: TimeRangeSliderProps) {
  const [localMin, setLocalMin] = useState(minTime ?? 0);
  const [localMax, setLocalMax] = useState(maxTime ?? 300);
  const [isDraggingMin, setIsDraggingMin] = useState(false);
  const [isDraggingMax, setIsDraggingMax] = useState(false);
  
  const minSliderRef = useRef<HTMLInputElement>(null);
  const maxSliderRef = useRef<HTMLInputElement>(null);
  
  const MIN_POSSIBLE = 0;
  const MAX_POSSIBLE = 300; // 5 heures

  useEffect(() => {
    setLocalMin(minTime ?? 0);
    setLocalMax(maxTime ?? 300);
  }, [minTime, maxTime]);

  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, localMax);
    setLocalMin(newMin);
    onChange(newMin === 0 ? undefined : newMin, localMax === MAX_POSSIBLE ? undefined : localMax);
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, localMin);
    setLocalMax(newMax);
    onChange(localMin === 0 ? undefined : localMin, newMax === MAX_POSSIBLE ? undefined : newMax);
  };

  // Utiliser la fonction utilitaire commune
  const formatTime = (minutes: number) => {
    return formatTimeDisplay(minutes);
  };

  return (
    <div className={`space-y-4 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
        <h4 className="font-medium text-slate-800 text-sm sm:text-base">Temps total</h4>
      </div>

      <div className="space-y-4">
        {/* Valeurs actuelles */}
        <div className="flex justify-between text-xs sm:text-sm text-slate-600">
          <span>Min: {formatTime(localMin)}</span>
          <span>Max: {formatTime(localMax)}</span>
        </div>

        {/* Sliders */}
        <div className="relative px-2 py-2">
          {/* Track */}
          <div className="h-3 sm:h-2 bg-slate-200 rounded-full relative">
            {/* Range highlight */}
            <div 
              className="absolute h-3 sm:h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              style={{
                left: `${(localMin / MAX_POSSIBLE) * 100}%`,
                width: `${((localMax - localMin) / MAX_POSSIBLE) * 100}%`
              }}
            />
          </div>

          {/* Min slider */}
          <input
            ref={minSliderRef}
            type="range"
            min={MIN_POSSIBLE}
            max={MAX_POSSIBLE}
            value={localMin}
            onChange={(e) => handleMinChange(parseInt(e.target.value))}
            onMouseDown={() => setIsDraggingMin(true)}
            onMouseUp={() => setIsDraggingMin(false)}
            onTouchStart={() => setIsDraggingMin(true)}
            onTouchEnd={() => setIsDraggingMin(false)}
            disabled={disabled}
            className="absolute top-0 left-0 w-full h-6 sm:h-4 bg-transparent appearance-none cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 range-slider"
            style={{ 
              zIndex: isDraggingMin ? 3 : (Math.abs(localMax - localMin) < 20 && localMin >= localMax - 20) ? 2 : 1
            }}
          />

          {/* Max slider */}
          <input
            ref={maxSliderRef}
            type="range"
            min={MIN_POSSIBLE}
            max={MAX_POSSIBLE}
            value={localMax}
            onChange={(e) => handleMaxChange(parseInt(e.target.value))}
            onMouseDown={() => setIsDraggingMax(true)}
            onMouseUp={() => setIsDraggingMax(false)}
            onTouchStart={() => setIsDraggingMax(true)}
            onTouchEnd={() => setIsDraggingMax(false)}
            disabled={disabled}
            className="absolute top-0 left-0 w-full h-6 sm:h-4 bg-transparent appearance-none cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 range-slider"
            style={{ 
              zIndex: isDraggingMax ? 3 : (Math.abs(localMax - localMin) < 20 && localMax <= localMin + 20) ? 1 : 2
            }}
          />
        </div>

        {/* Time markers */}
        <div className="flex justify-between text-xs text-slate-400 px-2">
          <span className="text-[10px] sm:text-xs">0min</span>
          <span className="text-[10px] sm:text-xs">1h</span>
          <span className="text-[10px] sm:text-xs">2h</span>
          <span className="text-[10px] sm:text-xs">3h</span>
          <span className="text-[10px] sm:text-xs">5h+</span>
        </div>
      </div>
    </div>
  );
}