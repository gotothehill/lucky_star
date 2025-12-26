import React, { useEffect, useState } from 'react';
import { CityRecord, searchCities } from '../services/citySearch';

interface CityAutocompleteProps {
  value: string;
  onSelect: (city: CityRecord) => void;
  placeholder?: string;
  inputClassName?: string;
  containerClassName?: string;
  suggestionItemClassName?: string;
  onInputChange?: (value: string) => void;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value,
  onSelect,
  placeholder = '请输入城市名称',
  inputClassName = '',
  containerClassName = '',
  suggestionItemClassName = '',
  onInputChange,
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<CityRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    let active = true;
    const timer = setTimeout(() => {
      setLoading(true);
      searchCities(query, 8)
        .then(list => {
          if (active) setSuggestions(list);
        })
        .finally(() => active && setLoading(false));
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const handleSelect = (city: CityRecord) => {
    setQuery(city.name);
    setSuggestions([]);
    setFocused(false);
    onSelect(city);
  };

  return (
    <div className={`relative ${containerClassName}`}>
      <input
        className={`w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:border-amber-500 text-white transition-all ${inputClassName}`}
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          onInputChange?.(e.target.value);
        }}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => { setFocused(false); setSuggestions([]); }, 150)}
      />
      {loading && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">…</span>}
      {focused && suggestions.length > 0 && (
        <div className="absolute z-30 mt-2 w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-h-72 overflow-y-auto">
          {suggestions.map(city => (
            <button
              type="button"
              key={`${city.name}-${city.geonameid}`}
              onClick={() => handleSelect(city)}
              className={`w-full text-left px-4 py-3 hover:bg-slate-800/70 border-b border-slate-800/50 last:border-0 ${suggestionItemClassName}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-100">{city.name}</span>
                <span className="text-[11px] text-slate-500">{city.country}</span>
              </div>
              <p className="text-xs text-slate-500">
                {city.subcountry || ''} {city.latitude?.toFixed(3)}, {city.longitude?.toFixed(3)}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;
