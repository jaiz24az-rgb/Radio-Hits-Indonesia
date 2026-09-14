import React, { useState, useEffect, useMemo } from 'react';
import { RadioStation, Category, City, ThemeMode } from './types';
import { INITIAL_STATIONS } from './data/stations';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useBattery } from './hooks/useBattery';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { StationCard } from './components/StationCard';
import { PlayerBar } from './components/PlayerBar';
import { FullPlayerModal } from './components/FullPlayerModal';
import { SleepTimerModal } from './components/SleepTimerModal';
import { AddStationModal } from './components/AddStationModal';
import { BatterySaverBanner } from './components/BatterySaverBanner';
import { InstallAppModal } from './components/InstallAppModal';
import { InstallBanner } from './components/InstallBanner';
import { Radio, Heart, Sparkles, Plus, AlertCircle, Volume2, Moon, Sun, Smartphone } from 'lucide-react';

export default function App() {
  // Theme state: dark (default), midnight (OLED dark), light
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('radio_theme');
      return (saved as ThemeMode) || 'midnight';
    } catch {
      return 'midnight';
    }
  });

  // Battery and power saving
  const { battery, batterySaverMode, toggleBatterySaver } = useBattery();

  // Stations State: Built-in + User Custom
  const [stations, setStations] = useState<RadioStation[]>(() => {
    try {
      const customSaved = localStorage.getItem('radio_custom_stations');
      const parsedCustom: RadioStation[] = customSaved ? JSON.parse(customSaved) : [];
      return [...parsedCustom, ...INITIAL_STATIONS];
    } catch {
      return INITIAL_STATIONS;
    }
  });

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('radio_favorites');
      return saved ? JSON.parse(saved) : ['prambors-jakarta', 'gen-fm-jakarta', 'nagaswara-fm'];
    } catch {
      return ['prambors-jakarta', 'gen-fm-jakarta', 'nagaswara-fm'];
    }
  });

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedCity, setSelectedCity] = useState<City>('Semua Kota');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);

  // Modals state
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState<boolean>(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState<boolean>(false);
  const [isAddStationOpen, setIsAddStationOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

  // Audio engine
  const {
    currentStation,
    status,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    errorMessage,
    activeUrlIndex,
    sleepTimer,
    startSleepTimer,
    cancelSleepTimer,
    playStation,
    togglePlay,
    playNext,
    playPrevious,
    switchServer,
    retryCurrentStation,
  } = useAudioPlayer({ stations, batterySaverMode });

  // Save favorites to localStorage
  const toggleFavorite = (stationId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(stationId)
        ? prev.filter((id) => id !== stationId)
        : [...prev, stationId];
      try {
        localStorage.setItem('radio_favorites', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Add custom station
  const handleAddStation = (newStation: RadioStation) => {
    setStations((prev) => {
      // Avoid duplicate by streamUrl or ID
      const filtered = prev.filter((s) => s.streamUrl !== newStation.streamUrl && s.id !== newStation.id);
      const next = [newStation, ...filtered];
      try {
        const customStations = next.filter((s) => s.isCustom);
        localStorage.setItem('radio_custom_stations', JSON.stringify(customStations));
      } catch {
        // ignore
      }
      return next;
    });
    // Auto play newly added station
    playStation(newStation);
  };

  // Add multiple stations (Batch auto add from online directory)
  const handleAddMultipleStations = (newStations: RadioStation[]) => {
    setStations((prev) => {
      const existingUrls = new Set(prev.map((s) => s.streamUrl));
      const validNew = newStations.filter((st) => !existingUrls.has(st.streamUrl));
      const next = [...validNew, ...prev];
      try {
        const customStations = next.filter((s) => s.isCustom);
        localStorage.setItem('radio_custom_stations', JSON.stringify(customStations));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Update theme setting
  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('radio_theme', newTheme);
    } catch {
      // ignore
    }
  };

  // Filtered stations logic
  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = station.name.toLowerCase().includes(query);
        const matchesFreq = station.frequency.toLowerCase().includes(query);
        const matchesCity = station.city.toLowerCase().includes(query);
        const matchesTagline = station.tagline.toLowerCase().includes(query);
        const matchesCat = station.category.toLowerCase().includes(query);
        if (!matchesName && !matchesFreq && !matchesCity && !matchesTagline && !matchesCat) {
          return false;
        }
      }

      // Favorites only filter
      if (showOnlyFavorites) {
        if (!favorites.includes(station.id)) return false;
      }

      // Category filter
      if (!showOnlyFavorites && selectedCategory !== 'Semua') {
        if (selectedCategory === 'Kustom') {
          if (!station.isCustom) return false;
        } else if (station.category !== selectedCategory) {
          return false;
        }
      }

      // City filter
      if (selectedCity !== 'Semua Kota') {
        if (station.city !== selectedCity) return false;
      }

      return true;
    });
  }, [stations, searchQuery, selectedCategory, selectedCity, showOnlyFavorites, favorites]);

  // Theme container classes
  const themeClasses = useMemo(() => {
    if (theme === 'light') {
      return 'bg-slate-100 text-slate-900';
    }
    if (theme === 'dark') {
      return 'bg-slate-950 text-slate-100';
    }
    // midnight / AMOLED
    return 'bg-black text-slate-100';
  }, [theme]);

  return (
    <div
      id="radio-app-root"
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${themeClasses} pb-28`}
    >
      {/* Top Header */}
      <Header
        theme={theme}
        onThemeChange={handleThemeChange}
        battery={battery}
        batterySaverMode={batterySaverMode}
        onToggleBatterySaver={toggleBatterySaver}
        sleepTimer={sleepTimer}
        onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
        onOpenAddStation={() => setIsAddStationOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* PWA / Desktop Install Banner */}
      <InstallBanner onOpenModal={() => setIsInstallModalOpen(true)} />

      {/* Main Content Area */}
      <main id="main-content-container" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {/* Battery Saver & Background Playback Banner */}
        <BatterySaverBanner
          batterySaverMode={batterySaverMode}
          onToggleBatterySaver={toggleBatterySaver}
          battery={battery}
        />

        {/* Category & City Filters */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          favoritesCount={favorites.length}
          showOnlyFavorites={showOnlyFavorites}
          onToggleFavoritesOnly={() => setShowOnlyFavorites((prev) => !prev)}
          totalStationsCount={stations.length}
          matchingCount={filteredStations.length}
          stations={stations}
        />

        {/* Stations Grid Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
              {showOnlyFavorites ? (
                <>
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  Stasiun Favorit Tersimpan
                </>
              ) : selectedCategory !== 'Semua' ? (
                <>Siaran Kategori: {selectedCategory}</>
              ) : (
                <>Semua Stasiun Radio Populer</>
              )}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {filteredStations.length}
            </span>
          </div>

          {/* Add custom station quick button */}
          <button
            id="quick-add-station-btn"
            onClick={() => setIsAddStationOpen(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 flex items-center gap-1.5 transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Cari & Tambah Radio</span>
          </button>
        </div>

        {/* Stations Grid */}
        {filteredStations.length > 0 ? (
          <div
            id="stations-grid-list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filteredStations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                isPlaying={currentStation?.id === station.id && status === 'playing'}
                isLoading={currentStation?.id === station.id && status === 'loading'}
                isFavorite={favorites.includes(station.id)}
                onPlay={(st) => {
                  if (currentStation?.id === st.id) {
                    togglePlay();
                  } else {
                    playStation(st);
                  }
                }}
                onToggleFavorite={toggleFavorite}
                batterySaverMode={batterySaverMode}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div
            id="empty-stations-state"
            className="flex flex-col items-center justify-center p-10 text-center bg-slate-900/40 rounded-3xl border border-slate-800 my-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
              <Radio className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-1">
              Tidak Ada Stasiun Sesuai Filter
            </h3>
            <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
              {showOnlyFavorites
                ? 'Belum ada stasiun yang Anda simpan sebagai favorit. Klik ikon hati pada kartu stasiun untuk menyimpannya.'
                : 'Tidak menemukan stasiun yang dicari? Anda bisa mencari dan menambahkan stasiun apa saja secara otomatis dari ribuan direktori radio online.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                id="empty-state-search-online-btn"
                onClick={() => setIsAddStationOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-semibold text-white shadow-lg shadow-red-950/50 flex items-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Cari di Direktori Radio Online</span>
              </button>
              {showOnlyFavorites && (
                <button
                  id="reset-favorites-filter-btn"
                  onClick={() => setShowOnlyFavorites(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                >
                  Lihat Semua Stasiun
                </button>
              )}
              {searchQuery && (
                <button
                  id="reset-search-filter-btn"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                >
                  Hapus Pencarian
                </button>
              )}
            </div>
          </div>
        )}

        {/* Feature Highlights & Night Time / Battery Preservation Guide */}
        <section
          id="radio-features-guide"
          className="mt-12 mb-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800"
        >
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Fitur Unggulan Radio Hits Indonesia
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800/80 space-y-1.5">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                Pemutaran Latar Belakang
              </div>
              <p className="leading-relaxed">
                Dilengkapi dukungan Media Session API sehingga radio terus berputar saat Anda mengunci layar HP atau beralih ke aplikasi WhatsApp, medsos, dan game.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800/80 space-y-1.5">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-indigo-300" />
                Timer Tidur & Mode Malam
              </div>
              <p className="leading-relaxed">
                Dengarkan siaran favorit menjelang tidur tanpa takut baterai habis semalaman. Timer otomatis mematikan siaran dengan fitur suara pudar halus (fade-out).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800/80 space-y-1.5">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-400" />
                Favorit & URL Kustom
              </div>
              <p className="leading-relaxed">
                Tandai stasiun favorit untuk akses cepat dan tambahkan link streaming radio lokal atau komunitas favorit Anda sendiri dengan mudah.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Player Bar */}
      <PlayerBar
        currentStation={currentStation}
        status={status}
        volume={volume}
        onVolumeChange={setVolume}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        onTogglePlay={togglePlay}
        onPlayNext={playNext}
        onPlayPrevious={playPrevious}
        isFavorite={currentStation ? favorites.includes(currentStation.id) : false}
        onToggleFavorite={toggleFavorite}
        sleepTimer={sleepTimer}
        onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
        onOpenFullPlayer={() => setIsFullPlayerOpen(true)}
        batterySaverMode={batterySaverMode}
        errorMessage={errorMessage}
        activeUrlIndex={activeUrlIndex}
        onSwitchServer={switchServer}
      />

      {/* Full Screen Player Modal */}
      <FullPlayerModal
        isOpen={isFullPlayerOpen}
        onClose={() => setIsFullPlayerOpen(false)}
        station={currentStation}
        status={status}
        volume={volume}
        onVolumeChange={setVolume}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        onTogglePlay={togglePlay}
        onPlayNext={playNext}
        onPlayPrevious={playPrevious}
        isFavorite={currentStation ? favorites.includes(currentStation.id) : false}
        onToggleFavorite={toggleFavorite}
        sleepTimer={sleepTimer}
        onOpenSleepTimer={() => {
          setIsFullPlayerOpen(false);
          setIsSleepTimerOpen(true);
        }}
        batterySaverMode={batterySaverMode}
        onToggleBatterySaver={toggleBatterySaver}
        errorMessage={errorMessage}
        activeUrlIndex={activeUrlIndex}
        onSwitchServer={switchServer}
      />

      {/* Sleep Timer Modal */}
      <SleepTimerModal
        isOpen={isSleepTimerOpen}
        onClose={() => setIsSleepTimerOpen(false)}
        sleepTimer={sleepTimer}
        onStartTimer={startSleepTimer}
        onCancelTimer={cancelSleepTimer}
      />

      {/* Add Custom Station & Auto Search Modal */}
      <AddStationModal
        isOpen={isAddStationOpen}
        onClose={() => setIsAddStationOpen(false)}
        onAddStation={handleAddStation}
        onAddMultipleStations={handleAddMultipleStations}
        existingStationUrls={stations.map((s) => s.streamUrl)}
        existingStationNames={stations.map((s) => s.name)}
      />

      {/* Install App / Desktop Shortcut Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
