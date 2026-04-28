import { useState, useEffect, useRef } from 'react';
import { fetchCitySuggestions } from '../../api/geocoding';
import type { CityCoords } from '../../types';
import { MapPin, Navigation, X, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CityAutocompleteProps {
  id: string;
  placeholder: string;
  type: 'origin' | 'destination';
  value: CityCoords | null;
  onChange: (city: CityCoords | null) => void;
}

export function CityAutocomplete({ id, placeholder, type, value, onChange }: CityAutocompleteProps) {
  const [query, setQuery] = useState(value?.name || '');
  const [suggestions, setSuggestions] = useState<CityCoords[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync external value
    if (value) {
      setQuery(value.name);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchDebounced = setTimeout(async () => {
      if (query.length >= 3 && query !== value?.name) {
        setLoading(true);
        const results = await fetchCitySuggestions(query);
        setSuggestions(results);
        setIsOpen(true);
        setLoading(false);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 500);

    return () => clearTimeout(fetchDebounced);
  }, [query, value?.name]);

  const handleSelect = (city: CityCoords) => {
    setQuery(city.name);
    onChange(city);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange(null);
    setIsOpen(false);
    setSuggestions([]);
  };

  const Icon = type === 'origin' ? MapPin : Navigation;

  return (
    <div className={cn(
      "relative transition-all duration-300 rounded-xl group flex items-center",
      value ? "bg-emerald-500/10" : "hover:bg-white/5"
    )} ref={wrapperRef}>
      <label htmlFor={id} className="sr-only">{placeholder}</label>
      <Icon className={cn("absolute left-3 w-4 h-4 transition-colors duration-300", value ? 'text-emerald-400' : 'text-[#A0AEC0]')} aria-hidden="true" />
      <input 
        id={id}
        type="text" 
        placeholder={placeholder} 
        autoComplete="off"
        className="pl-10 pr-10 py-2.5 bg-transparent text-sm font-bold text-white outline-none w-52 placeholder:text-white/30 focus:text-[#2D7DFA]"
        value={query}
        onChange={(e) => {
           setQuery(e.target.value);
           if (value && e.target.value !== value.name) {
              onChange(null); // Reset selection if they type something new
           }
        }}
        onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
        }}
      />
      {loading && (
        <Loader2 className="absolute right-8 w-3 h-3 text-[#A0AEC0] animate-spin" />
      )}
      {query && !loading && (
        <button 
          type="button"
          onClick={handleClear}
          className="absolute right-2 p-1 hover:bg-white/10 rounded-full transition-colors group/btn"
          aria-label={`Clear ${type}`}
        >
          <X className="w-3 h-3 text-[#A0AEC0] group-hover/btn:text-white" />
        </button>
      )}

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 mt-2 w-full bg-[#0B1426] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[2000]">
          {suggestions.map((city, idx) => (
            <li 
              key={idx}
              className="px-4 py-2 text-sm text-white hover:bg-[#2D7DFA]/20 cursor-pointer font-medium transition-colors"
              onClick={() => handleSelect(city)}
            >
              {city.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
