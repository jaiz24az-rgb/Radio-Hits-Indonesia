import React from 'react';
import { Play, Pause, Heart, Radio, Loader2, Volume2, Sparkles } from 'lucide-react';
import { RadioStation, PlaybackStatus } from '../types';

interface StationCardProps {
  station: RadioStation;
  isPlaying: boolean;
  isLoading: boolean;
  isFavorite: boolean;
  onPlay: (station: RadioStation) => void;
  onToggleFavorite: (stationId: string) => void;
  batterySaverMode: boolean;
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  isPlaying,
  isLoading,
  isFavorite,
  onPlay,
  onToggleFavorite,
  batterySaverMode,
}) => {
  return (
    <div
      id={`station-card-${station.id}`}
      onClick={() => onPlay(station)}
      className={`group relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none text-left ${
        isPlaying
          ? 'bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-red-950/40 border-red-500/50 shadow-lg shadow-red-950/30 ring-1 ring-red-500/30'
          : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700/80 hover:shadow-md'
      }`}
    >
      {/* Top row: Monogram / Logo & Actions */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* Station Visual Badge */}
          <div
            className={`relative flex items-center justify-center w-12 h-12 rounded-xl text-white font-bold text-base shadow-md bg-gradient-to-tr ${station.accentGradient} flex-shrink-0`}
          >
            {station.name.substring(0, 2).toUpperCase()}
            {isPlaying && (
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-900 ring-2 ring-slate-900">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              </span>
            )}
          </div>

          {/* Station Name & Frequency */}
          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm sm:text-base text-slate-100 group-hover:text-white truncate">
                {station.name}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-xs font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-red-400 border border-slate-700">
                {station.frequency}
              </span>
              <span className="text-xs text-slate-400 truncate">
                {station.city}
              </span>
            </div>
          </div>
        </div>

        {/* Favorite Heart Button */}
        <button
          id={`fav-btn-${station.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(station.id);
          }}
          className={`p-2 rounded-xl transition-all ${
            isFavorite
              ? 'text-rose-500 hover:text-rose-400 bg-rose-500/10'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
          }`}
          title={isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Middle: Tagline & Description */}
      <p className="text-xs text-slate-400 line-clamp-2 mb-3 min-h-[32px]">
        {station.tagline}
      </p>

      {/* Bottom bar: Category badge, Live Equalizer / Play button */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
            {station.category}
          </span>
          {station.isCustom && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Kustom
            </span>
          )}
        </div>

        {/* Play Action / Audio Wave State */}
        <div className="flex items-center gap-2">
          {isPlaying && !batterySaverMode && (
            <div className="flex items-end gap-0.5 h-3.5 px-1.5">
              <span className="w-0.5 bg-red-400 rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
              <span className="w-0.5 bg-red-400 rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
              <span className="w-0.5 bg-red-400 rounded-full animate-bounce [animation-delay:-0.45s] h-2" />
              <span className="w-0.5 bg-red-400 rounded-full animate-bounce h-3.5" />
            </div>
          )}

          <button
            id={`card-play-btn-${station.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onPlay(station);
            }}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-red-500 text-white shadow-md shadow-red-600/40 hover:bg-red-600'
                : 'bg-slate-800 text-slate-200 hover:bg-red-500 hover:text-white border border-slate-700 hover:border-red-500'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
