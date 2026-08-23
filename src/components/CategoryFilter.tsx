import React from 'react';
import { Flame, Music, Newspaper, MapPin, Sparkles, Heart, PlusCircle, Radio, Sparkle } from 'lucide-react';
import { Category, City } from '../types';
import { CITIES } from '../data/stations';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedCity: City;
  onSelectCity: (city: City) => void;
  favoritesCount: number;
  showOnlyFavorites: boolean;
  onToggleFavoritesOnly: () => void;
  totalStationsCount: number;
  matchingCount: number;
  stations?: { city: string }[];
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedCity,
  onSelectCity,
  favoritesCount,
  showOnlyFavorites,
  onToggleFavoritesOnly,
  totalStationsCount,
  matchingCount,
  stations = [],
}) => {
  const categories = [
    { id: 'Semua', label: 'Semua Hits', icon: Radio },
    { id: 'Pop & Hits', label: 'Pop & Hits', icon: Flame },
    { id: 'Dangdut', label: 'Dangdut', icon: Music },
    { id: 'Berita & Talk', label: 'Berita & Info', icon: Newspaper },
    { id: 'Daerah & Komunitas', label: 'Budaya / Lokal', icon: MapPin },
    { id: 'Religi & Inspirasi', label: 'Religi & Dakwah', icon: Sparkles },
    { id: 'Kustom', label: 'Kustom Anda', icon: PlusCircle },
  ];

  // Calculate count per city
  const cityCountMap = React.useMemo(() => {
    const map: Record<string, number> = { 'Semua Kota': stations.length };
    stations.forEach((s) => {
      map[s.city] = (map[s.city] || 0) + 1;
    });
    return map;
  }, [stations]);

  return (
    <div className="space-y-3 mb-6">
      {/* Category Pills & Favorites Toggle */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {/* Favorit Tab Button */}
        <button
          id="filter-favorites-btn"
          onClick={onToggleFavoritesOnly}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
            showOnlyFavorites
              ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-900/30 ring-1 ring-rose-400/50'
              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700/80 border border-slate-700'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-white text-white' : 'text-rose-400'}`} />
          <span>Favorit Saya</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
            showOnlyFavorites ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
          }`}>
            {favoritesCount}
          </span>
        </button>

        <div className="h-4 w-[1px] bg-slate-700/60 mx-1 flex-shrink-0" />

        {/* Categories */}
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = !showOnlyFavorites && selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              id={`filter-cat-${cat.id.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => {
                if (showOnlyFavorites) onToggleFavoritesOnly();
                onSelectCategory(cat.id);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm shadow-red-900/30 ring-1 ring-red-400/50'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-bar: City Selector Pills & Match Count */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none no-scrollbar">
          <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold px-1.5 flex-shrink-0">
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            <span>Kota:</span>
          </div>

          {CITIES.map((city) => {
            const isSelected = selectedCity === city;
            const count = cityCountMap[city] || 0;
            if (city !== 'Semua Kota' && count === 0) return null;

            return (
              <button
                key={city}
                id={`filter-city-${city.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onSelectCity(city as City)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-red-600 text-white font-semibold shadow-sm shadow-red-950'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                }`}
              >
                <span>{city}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-700/80 text-slate-400'
                }`}>
                  {city === 'Semua Kota' ? totalStationsCount : count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-slate-400 text-[11px] font-medium whitespace-nowrap px-1 self-end sm:self-center">
          Ditemukan <span className="text-red-400 font-bold">{matchingCount}</span> siaran
        </div>
      </div>
    </div>
  );
};
