import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Clock,
  Maximize2,
  Heart,
  Loader2,
  Zap,
  Radio,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { RadioStation, PlaybackStatus, SleepTimerState } from '../types';

interface PlayerBarProps {
  currentStation: RadioStation | null;
  status: PlaybackStatus;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onTogglePlay: () => void;
  onPlayNext: () => void;
  onPlayPrevious: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  sleepTimer: SleepTimerState;
  onOpenSleepTimer: () => void;
  onOpenFullPlayer: () => void;
  batterySaverMode: boolean;
  errorMessage: string | null;
  activeUrlIndex?: number;
  onSwitchServer?: () => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentStation,
  status,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  onTogglePlay,
  onPlayNext,
  onPlayPrevious,
  isFavorite,
  onToggleFavorite,
  sleepTimer,
  onOpenSleepTimer,
  onOpenFullPlayer,
  batterySaverMode,
  errorMessage,
  activeUrlIndex = 0,
  onSwitchServer,
}) => {
  if (!currentStation) return null;

  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const totalServers = 1 + (currentStation.fallbackUrls?.length || 0);

  return (
    <div
      id="bottom-player-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 shadow-2xl transition-all"
    >
      {/* Error / Status notification bar */}
      {errorMessage && (
        <div className="bg-rose-950/80 border-b border-rose-800/60 px-4 py-1.5 text-xs text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-2xl truncate">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {totalServers > 1 && onSwitchServer && (
              <button
                id="switch-server-btn"
                onClick={onSwitchServer}
                className="text-xs text-amber-300 hover:text-white flex items-center gap-1 font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                Ganti Server ({activeUrlIndex + 1}/{totalServers})
              </button>
            )}
            <button
              id="retry-stream-btn"
              onClick={onTogglePlay}
              className="text-xs font-semibold underline text-rose-300 hover:text-white"
            >
              Coba Putar Ulang
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Station Details (Clickable to open Full Player) */}
        <div
          id="mini-player-info-section"
          onClick={onOpenFullPlayer}
          className="flex items-center gap-3 cursor-pointer group min-w-0 max-w-[40%] sm:max-w-sm"
        >
          {/* Station Visual Thumbnail */}
          <div
            className={`relative flex items-center justify-center w-11 h-11 rounded-xl text-white font-bold text-sm shadow-md bg-gradient-to-tr ${currentStation.accentGradient} flex-shrink-0`}
          >
            {currentStation.name.substring(0, 2).toUpperCase()}
            {isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-slate-100 group-hover:text-red-400 transition truncate">
                {currentStation.name}
              </h4>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-red-400 border border-slate-700/80 hidden sm:inline-block">
                {currentStation.frequency}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate flex items-center gap-1.5">
              <span>{currentStation.city}</span>
              <span>•</span>
              <span className="truncate">{currentStation.tagline}</span>
            </p>
          </div>

          <button
            id="mini-fav-btn"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(currentStation.id);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-400 transition hidden sm:block"
            title={isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            id="player-prev-btn"
            onClick={onPlayPrevious}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Stasiun Sebelumnya"
          >
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            id="player-play-pause-btn"
            onClick={onTogglePlay}
            disabled={isLoading}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition shadow-lg ${
              isPlaying
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-red-950/50 hover:scale-105'
                : 'bg-white text-slate-900 shadow-white/10 hover:scale-105 hover:bg-slate-100'
            }`}
            title={isPlaying ? 'Jeda' : 'Putar'}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            id="player-next-btn"
            onClick={onPlayNext}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Stasiun Selanjutnya"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Right: Volume & Utilities */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Sleep Timer Indicator Button */}
          <button
            id="player-sleep-timer-btn"
            onClick={onOpenSleepTimer}
            className={`p-2 rounded-xl transition flex items-center gap-1.5 text-xs font-medium ${
              sleepTimer.isActive
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 animate-pulse'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Atur Timer Tidur"
          >
            <Clock className="w-4 h-4" />
            {sleepTimer.isActive && (
              <span className="hidden sm:inline font-mono">
                {formatTimer(sleepTimer.remainingSeconds)}
              </span>
            )}
          </button>

          {/* Volume Control */}
          <div className="hidden md:flex items-center gap-2">
            <button
              id="player-mute-btn"
              onClick={onToggleMute}
              className="p-1.5 text-slate-400 hover:text-white transition"
              title={isMuted ? 'Batal Bisukan' : 'Bisukan'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              id="player-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 lg:w-24 accent-red-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Full Screen Player Modal Trigger */}
          <button
            id="player-maximize-btn"
            onClick={onOpenFullPlayer}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Buka Pemutar Penuh"
          >
            <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
