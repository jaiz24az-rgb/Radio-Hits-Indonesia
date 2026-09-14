import React from 'react';
import { Radio, Moon, Sun, ShieldAlert, Battery, BatteryCharging, Clock, Plus, Zap, Download, Monitor } from 'lucide-react';
import { ThemeMode, BatteryInfo, SleepTimerState } from '../types';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  battery: BatteryInfo;
  batterySaverMode: boolean;
  onToggleBatterySaver: () => void;
  sleepTimer: SleepTimerState;
  onOpenSleepTimer: () => void;
  onOpenAddStation: () => void;
  onOpenInstallModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onThemeChange,
  battery,
  batterySaverMode,
  onToggleBatterySaver,
  sleepTimer,
  onOpenSleepTimer,
  onOpenAddStation,
  onOpenInstallModal,
  searchQuery,
  onSearchChange,
}) => {
  const formatTimerRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const nextTheme = () => {
    if (theme === 'midnight') onThemeChange('dark');
    else if (theme === 'dark') onThemeChange('light');
    else onThemeChange('midnight');
  };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 backdrop-blur-md transition-colors border-b px-4 py-3 sm:px-6 
        bg-slate-900/90 border-slate-800 text-white"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Live Indicator with Official Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black italic tracking-tight text-white">
                  Radio Hit <span className="text-red-500">Indonesia</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Streaming Musik, Berita & Talkshow Populer
              </p>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-1.5 md:hidden">
            {/* Install Desktop / Mobile Button */}
            <button
              id="mobile-install-app-btn"
              onClick={onOpenInstallModal}
              title="Pasang Icon Aplikasi ke Layar Utama / Desktop"
              className="p-2 rounded-lg bg-red-600/20 text-red-300 border border-red-500/40 hover:bg-red-600/30 transition"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Auto Search / Add Station Mobile */}
            <button
              id="mobile-add-station-btn"
              onClick={onOpenAddStation}
              title="Cari & Tambah Stasiun Radio Online"
              className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Battery Saver Button Mobile */}
            <button
              id="mobile-battery-saver-btn"
              onClick={onToggleBatterySaver}
              title={batterySaverMode ? 'Mode Hemat Baterai Aktif' : 'Aktifkan Hemat Baterai'}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                batterySaverMode
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              <Zap className={`w-4 h-4 ${batterySaverMode ? 'fill-emerald-400 text-emerald-400' : ''}`} />
            </button>

            {/* Sleep timer button Mobile */}
            <button
              id="mobile-sleep-timer-btn"
              onClick={onOpenSleepTimer}
              title="Pengatur Waktu Tidur"
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                sleepTimer.isActive
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              {sleepTimer.isActive && (
                <span className="text-[11px] font-mono font-semibold">
                  {formatTimerRemaining(sleepTimer.remainingSeconds)}
                </span>
              )}
            </button>

            {/* Theme switcher Mobile */}
            <button
              id="mobile-theme-toggle-btn"
              onClick={nextTheme}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title={`Ganti Tema: ${theme}`}
            >
              {theme === 'light' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-300" />}
            </button>
          </div>
        </div>

        {/* Center: Search Field */}
        <div className="relative flex-1 max-w-md">
          <input
            id="station-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari stasiun, frekuensi, atau genre (cth: Prambors, 98.7, Dangdut)..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition shadow-inner"
          />
          <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchQuery && (
            <button
              id="clear-search-btn"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Battery Status & Saver Toggle */}
          <button
            id="desktop-battery-saver-btn"
            onClick={onToggleBatterySaver}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition border ${
              batterySaverMode
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-950/40'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border-slate-700/80'
            }`}
            title="Mode Hemat Daya & Baterai (Optimalisasi Audio Latar Belakang)"
          >
            {battery.supported ? (
              battery.charging ? (
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
              ) : (
                <Battery className={`w-4 h-4 ${battery.level <= 0.2 ? 'text-amber-400' : 'text-slate-300'}`} />
              )
            ) : (
              <Zap className={`w-4 h-4 ${batterySaverMode ? 'text-emerald-400 fill-emerald-400' : 'text-slate-400'}`} />
            )}
            <span>
              {batterySaverMode ? 'Hemat Daya ON' : 'Hemat Daya'}
              {battery.supported && ` (${Math.round(battery.level * 100)}%)`}
            </span>
          </button>

          {/* Sleep timer button */}
          <button
            id="desktop-sleep-timer-btn"
            onClick={onOpenSleepTimer}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition border ${
              sleepTimer.isActive
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-950/40'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border-slate-700/80'
            }`}
            title="Timer Tidur (Otomatis Berhenti)"
          >
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>
              {sleepTimer.isActive
                ? `Tidur: ${formatTimerRemaining(sleepTimer.remainingSeconds)}`
                : 'Timer Tidur'}
            </span>
          </button>

          {/* Install Desktop App Button */}
          <button
            id="desktop-install-app-btn"
            onClick={onOpenInstallModal}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 hover:border-red-500/40 transition shadow-sm"
            title="Pasang Icon Aplikasi ke Desktop Komputer (Akses 1-Klik)"
          >
            <Monitor className="w-3.5 h-3.5 text-red-400" />
            <span>Pasang di Desktop</span>
          </button>

          {/* Add custom station button */}
          <button
            id="desktop-add-station-btn"
            onClick={onOpenAddStation}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-950/40 transition"
            title="Cari & Tambah Siaran Radio Otomatis atau Kustom"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Cari & Tambah Radio</span>
          </button>

          {/* Theme switcher */}
          <button
            id="desktop-theme-toggle-btn"
            onClick={nextTheme}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition"
            title={`Ganti Tema: ${theme}`}
          >
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : theme === 'midnight' ? (
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
