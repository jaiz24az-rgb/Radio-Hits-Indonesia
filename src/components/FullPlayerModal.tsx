import React, { useState } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Clock,
  Heart,
  Share2,
  Zap,
  Radio,
  Sparkles,
  Signal,
  Check,
  Smartphone,
  ShieldCheck,
  Loader2,
  AlertCircle,
  RefreshCw,
  Server
} from 'lucide-react';
import { RadioStation, PlaybackStatus, SleepTimerState } from '../types';
import { StationLogo } from './StationLogo';

interface FullPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: RadioStation | null;
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
  batterySaverMode: boolean;
  onToggleBatterySaver: () => void;
  errorMessage?: string | null;
  activeUrlIndex?: number;
  onSwitchServer?: () => void;
}

export const FullPlayerModal: React.FC<FullPlayerModalProps> = ({
  isOpen,
  onClose,
  station,
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
  batterySaverMode,
  onToggleBatterySaver,
  errorMessage,
  activeUrlIndex = 0,
  onSwitchServer,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !station) return null;

  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';
  const totalServers = 1 + (station.fallbackUrls?.length || 0);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleShare = () => {
    try {
      const shareUrl = typeof window !== 'undefined' && window.location ? window.location.href : '';
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        navigator
          .share({
            title: `${station.name} (${station.frequency})`,
            text: `Dengarkan siaran live streaming radio ${station.name} - ${station.tagline}`,
            url: shareUrl,
          })
          .catch(() => {
            // user cancelled or disallowed
          });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard
          .writeText(`${station.name} - ${station.tagline} (${shareUrl})`)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          })
          .catch(() => {
            // ignore
          });
      }
    } catch {
      // ignore
    }
  };

  return (
    <div
      id="full-player-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div
        id="full-player-content-card"
        className="relative w-full max-w-lg h-full sm:h-auto sm:max-h-[92vh] flex flex-col justify-between p-6 sm:p-8 bg-slate-900 sm:rounded-3xl border border-slate-800 text-white overflow-y-auto shadow-2xl"
      >
        {/* Top bar: Dismiss button, title, share */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <button
            id="full-player-dismiss-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
            title="Tutup Pemutar"
          >
            <ChevronDown className="w-5 h-5" />
          </button>

          <div className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-widest text-red-400">
              SEDANG DIPUTAR
            </span>
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : isLoading ? 'bg-amber-400 animate-ping' : 'bg-slate-500'}`} />
              {isLoading ? 'Menghubungkan...' : isPlaying ? 'Siaran Langsung Online' : 'Siaran Dijeda'}
            </div>
          </div>

          <button
            id="full-player-share-btn"
            onClick={handleShare}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition relative"
            title="Bagikan Stasiun"
          >
            {copied ? (
              <Check className="w-5 h-5 text-emerald-400" />
            ) : (
              <Share2 className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Center Artwork & Visualizer */}
        <div className="my-auto py-6 flex flex-col items-center justify-center text-center">
          {/* Animated Glow Backdrop */}
          <div className="relative mb-6">
            {!batterySaverMode && isPlaying && (
              <div
                className={`absolute inset-0 rounded-3xl blur-2xl opacity-40 bg-gradient-to-tr ${station.accentGradient} animate-pulse`}
              />
            )}

            <div className="relative flex flex-col items-center">
              <StationLogo
                station={station}
                size="xl"
                isPlaying={isPlaying}
                className="shadow-2xl ring-1 ring-white/20"
              />

              {/* Bitrate badge below artwork */}
              <div className="mt-3 flex items-center gap-1.5 bg-slate-800/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-slate-300 border border-slate-700/60">
                <Signal className="w-3 h-3 text-emerald-400" />
                <span>{station.frequency}</span>
                <span>•</span>
                <span>{station.bitrate || '128 kbps'}</span>
              </div>
            </div>
          </div>

          {/* Station Metadata */}
          <div className="space-y-1.5 px-4 w-full">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              {station.name}
            </h2>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
              <span className="font-semibold text-red-400">{station.category}</span>
              <span>•</span>
              <span>{station.city}</span>
            </div>
            <p className="text-xs text-slate-400 max-w-xs mx-auto pt-1">
              {station.tagline}
            </p>
          </div>

          {/* Error Notice or Server Info */}
          {errorMessage && (
            <div className="mt-3 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-200 flex items-center gap-2 max-w-xs">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              <span className="truncate">{errorMessage}</span>
            </div>
          )}

          {totalServers > 1 && onSwitchServer && (
            <button
              onClick={onSwitchServer}
              className="mt-2 text-xs text-slate-400 hover:text-white flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 transition"
              title="Ganti ke server streaming cadangan"
            >
              <Server className="w-3 h-3 text-emerald-400" />
              <span>Server {activeUrlIndex + 1} dari {totalServers}</span>
              <RefreshCw className="w-3 h-3 ml-1 text-slate-400" />
            </button>
          )}
        </div>

        {/* Playback Controls & Sliders */}
        <div className="space-y-6">
          {/* Main Controls Row */}
          <div className="flex items-center justify-center gap-6">
            <button
              id="full-prev-btn"
              onClick={onPlayPrevious}
              className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95"
              title="Stasiun Sebelumnya"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              id="full-play-pause-btn"
              onClick={onTogglePlay}
              disabled={isLoading}
              className={`w-16 h-16 rounded-3xl flex items-center justify-center transition shadow-2xl active:scale-95 ${
                isPlaying
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-red-950/60'
                  : 'bg-white text-slate-900 shadow-white/20 hover:bg-slate-100'
              }`}
              title={isPlaying ? 'Jeda' : 'Putar'}
            >
              {isLoading ? (
                <Loader2 className="w-7 h-7 animate-spin text-slate-900" />
              ) : isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current ml-1" />
              )}
            </button>

            <button
              id="full-next-btn"
              onClick={onPlayNext}
              className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95"
              title="Stasiun Selanjutnya"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Volume bar */}
          <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-2xl border border-slate-800">
            <button
              id="full-mute-btn"
              onClick={onToggleMute}
              className="text-slate-400 hover:text-white transition"
              title={isMuted ? 'Batal Bisukan' : 'Bisukan'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-rose-400" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              id="full-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="flex-1 accent-red-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400 w-8 text-right">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>

          {/* Actions & Utilities Bar */}
          <div className="grid grid-cols-3 gap-2">
            {/* Favorite toggle */}
            <button
              id="full-favorite-btn"
              onClick={() => onToggleFavorite(station.id)}
              className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border transition text-xs font-medium ${
                isFavorite
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
              <span>{isFavorite ? 'Favorit' : 'Sukai'}</span>
            </button>

            {/* Sleep timer */}
            <button
              id="full-sleep-timer-btn"
              onClick={onOpenSleepTimer}
              className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border transition text-xs font-medium ${
                sleepTimer.isActive
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>
                {sleepTimer.isActive
                  ? formatTimer(sleepTimer.remainingSeconds)
                  : 'Timer Tidur'}
              </span>
            </button>

            {/* Battery saver */}
            <button
              id="full-battery-saver-btn"
              onClick={onToggleBatterySaver}
              className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border transition text-xs font-medium ${
                batterySaverMode
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Zap className={`w-4 h-4 ${batterySaverMode ? 'fill-emerald-400' : ''}`} />
              <span>{batterySaverMode ? 'Hemat ON' : 'Hemat Daya'}</span>
            </button>
          </div>

          {/* Background Playback & Battery Saver Info Pill */}
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
            <Smartphone className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-300">Siaran Latar Belakang Aktif</strong>:
              Pemutaran audio tetap berjalan lancar saat Anda berpindah tab atau mengunci layar perangkat.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
