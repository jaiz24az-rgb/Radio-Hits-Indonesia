import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Radio,
  Search,
  Globe,
  MapPin,
  Tag,
  Check,
  AlertCircle,
  Play,
  Square,
  Volume2,
  Loader2,
  ListPlus,
  Sparkles,
  Layers,
  Music,
  CheckCheck,
} from 'lucide-react';
import { RadioStation, Category, City } from '../types';
import { CITIES } from '../data/stations';

interface AddStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStation: (station: RadioStation) => void;
  onAddMultipleStations?: (stations: RadioStation[]) => void;
  existingStationUrls?: string[];
  existingStationNames?: string[];
}

export const AddStationModal: React.FC<AddStationModalProps> = ({
  isOpen,
  onClose,
  onAddStation,
  onAddMultipleStations,
  existingStationUrls = [],
  existingStationNames = [],
}) => {
  const [activeTab, setActiveTab] = useState<'auto' | 'manual'>('auto');

  // Auto-search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Indonesia');
  const [searchResults, setSearchResults] = useState<RadioStation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [addedStationIds, setAddedStationIds] = useState<Set<string>>(new Set());

  // In-modal preview player state
  const [previewingStationId, setPreviewingStationId] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Manual Form State
  const [manualName, setManualName] = useState('');
  const [manualFrequency, setManualFrequency] = useState('');
  const [manualTagline, setManualTagline] = useState('');
  const [manualCity, setManualCity] = useState<City>('Jakarta');
  const [manualCategory, setManualCategory] = useState<Category>('Pop & Hits');
  const [manualStreamUrl, setManualStreamUrl] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);

  const categories: Category[] = [
    'Pop & Hits',
    'Dangdut',
    'Berita & Talk',
    'Daerah & Komunitas',
    'Religi & Inspirasi',
    'Kustom',
  ];

  const gradients = [
    'from-red-500 to-rose-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-purple-500 to-indigo-600',
    'from-amber-500 to-orange-600',
    'from-pink-500 to-rose-600',
    'from-violet-500 to-purple-600',
    'from-teal-500 to-emerald-600',
  ];

  // Stop preview audio when modal closes or changes
  useEffect(() => {
    if (!isOpen && previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.src = '';
      setPreviewingStationId(null);
    }
  }, [isOpen]);

  // Initial load of popular Indonesian stations when opening auto tab
  useEffect(() => {
    if (isOpen && activeTab === 'auto' && searchResults.length === 0 && !isSearching) {
      handleSearch('', 'Indonesia', '');
    }
  }, [isOpen, activeTab]);

  const handleSearch = async (query: string, country: string, tag: string) => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('query', query.trim());
      if (country && country !== 'all') params.set('country', country);
      if (tag) params.set('tag', tag);
      params.set('limit', '45');

      const res = await fetch(`/api/radio-search?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Gagal menghubungi server direktori radio');
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.stations)) {
        setSearchResults(data.stations);
        if (data.stations.length === 0) {
          setSearchError('Tidak ada stasiun yang cocok dengan kata kunci tersebut. Coba kata kunci atau kategori lain.');
        }
      } else {
        setSearchResults([]);
        setSearchError('Tidak ada hasil ditemukan.');
      }
    } catch (err: any) {
      setSearchError('Terjadi gangguan saat mengambil data siaran radio. Silakan coba lagi.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery, selectedCountry, selectedTag);
  };

  // Preview audio tester
  const togglePreview = (station: RadioStation) => {
    if (previewingStationId === station.id) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.src = '';
      }
      setPreviewingStationId(null);
      setPreviewLoading(false);
      return;
    }

    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio();
    }

    setPreviewingStationId(station.id);
    setPreviewLoading(true);

    const proxyUrl = `/api/stream?url=${encodeURIComponent(station.streamUrl)}`;
    previewAudioRef.current.src = proxyUrl;

    previewAudioRef.current.onplaying = () => {
      setPreviewLoading(false);
    };

    previewAudioRef.current.onerror = () => {
      setPreviewLoading(false);
      setPreviewingStationId(null);
    };

    previewAudioRef.current.play().catch(() => {
      setPreviewLoading(false);
      setPreviewingStationId(null);
    });
  };

  // Single add
  const handleAddSingle = (station: RadioStation) => {
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
    const readyStation: RadioStation = {
      ...station,
      id: `custom-auto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      accentGradient: station.accentGradient || randomGradient,
      isCustom: true,
    };

    onAddStation(readyStation);
    setAddedStationIds((prev) => new Set(prev).add(station.id));
  };

  // Bulk add all search results
  const handleAddAll = () => {
    const toAdd: RadioStation[] = [];
    const newAddedIds = new Set(addedStationIds);

    searchResults.forEach((st) => {
      if (!isAlreadyInList(st)) {
        const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
        const readyStation: RadioStation = {
          ...st,
          id: `custom-auto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          accentGradient: st.accentGradient || randomGradient,
          isCustom: true,
        };
        toAdd.push(readyStation);
        newAddedIds.add(st.id);
      }
    });

    if (toAdd.length > 0) {
      if (onAddMultipleStations) {
        onAddMultipleStations(toAdd);
      } else {
        toAdd.forEach((st) => onAddStation(st));
      }
      setAddedStationIds(newAddedIds);
    }
  };

  // Manual Form Submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) {
      setManualError('Nama stasiun radio wajib diisi');
      return;
    }
    if (!manualStreamUrl.trim()) {
      setManualError('URL streaming wajib diisi');
      return;
    }

    try {
      new URL(manualStreamUrl);
    } catch {
      setManualError('Format URL streaming tidak valid (harus diawali http:// atau https://)');
      return;
    }

    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

    const newStation: RadioStation = {
      id: `custom-manual-${Date.now()}`,
      name: manualName.trim(),
      frequency: manualFrequency.trim() || 'Online FM',
      tagline: manualTagline.trim() || 'Stasiun Radio Kustom Pengguna',
      city: manualCity,
      category: manualCategory,
      streamUrl: manualStreamUrl.trim(),
      color: '#EF4444',
      accentGradient: randomGradient,
      isCustom: true,
      bitrate: '128 kbps',
    };

    onAddStation(newStation);
    onClose();
  };

  const isAlreadyInList = (st: RadioStation) => {
    if (addedStationIds.has(st.id)) return true;
    if (existingStationUrls.some((u) => u === st.streamUrl)) return true;
    if (existingStationNames.some((n) => n.toLowerCase() === st.name.toLowerCase())) return true;
    return false;
  };

  if (!isOpen) return null;

  return (
    <div
      id="add-station-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="add-station-card"
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-md shadow-red-950/40">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-100 flex items-center gap-2">
                Eksplor & Tambah Stasiun Radio
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  Otomatis
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Cari ribuan siaran online Indonesia & dunia atau masukkan URL kustom
              </p>
            </div>
          </div>
          <button
            id="close-add-station-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1.5">
          <button
            id="tab-auto-search"
            onClick={() => setActiveTab('auto')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
              activeTab === 'auto'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Cari Otomatis (Direktori Online)</span>
          </button>
          <button
            id="tab-manual-input"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
              activeTab === 'manual'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Input URL Stream Manual</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'auto' ? (
            /* TAB 1: AUTO SEARCH & EXPLORER */
            <div className="space-y-4">
              {/* Search Bar & Controls */}
              <form onSubmit={handleSearchSubmit} className="space-y-2.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      id="auto-search-query-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ketik nama radio, kota, atau genre (cth: Solo, Dangdut, Pekalongan, Tegal, BBC, Prambors)..."
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-200"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    id="submit-auto-search-btn"
                    disabled={isSearching}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-red-950/40"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span className="hidden sm:inline">Cari Radio</span>
                  </button>
                </div>

                {/* Country & Tag Quick Filters */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-slate-400 text-[11px] font-medium mr-1">Rekomendasi:</span>
                  {[
                    { label: '🇮🇩 Semua Indonesia', country: 'Indonesia', tag: '' },
                    { label: '📻 Dangdut & Koplo', country: 'Indonesia', tag: 'dangdut' },
                    { label: '🏛️ Daerah & LPPL', country: 'Indonesia', tag: 'komunitas' },
                    { label: '🕌 Dakwah & Religi', country: 'Indonesia', tag: 'islam' },
                    { label: '📰 Warta & Berita', country: 'Indonesia', tag: 'news' },
                    { label: '🎵 Pop & Hits', country: 'Indonesia', tag: 'pop' },
                    { label: '🌍 Seluruh Dunia', country: 'all', tag: '' },
                  ].map((filter, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(filter.country);
                        setSelectedTag(filter.tag);
                        handleSearch(searchQuery, filter.country, filter.tag);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                        selectedCountry === filter.country && selectedTag === filter.tag
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </form>

              {/* Search Results Summary & Batch Add All */}
              {searchResults.length > 0 && (
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="text-slate-300 font-medium">
                    Ditemukan <span className="text-red-400 font-bold">{searchResults.length}</span> stasiun radio online
                  </div>
                  <button
                    id="bulk-add-all-btn"
                    onClick={handleAddAll}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <ListPlus className="w-3.5 h-3.5 text-red-400" />
                    <span>Tambah Semua ke Koleksi</span>
                  </button>
                </div>
              )}

              {/* Error Message */}
              {searchError && (
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              {/* Loading State */}
              {isSearching && (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
                  <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                  <p className="text-xs font-medium">Mencari stasiun radio online aktif...</p>
                </div>
              )}

              {/* Results List */}
              {!isSearching && searchResults.length > 0 && (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {searchResults.map((station) => {
                    const alreadyAdded = isAlreadyInList(station);
                    const isPreviewing = previewingStationId === station.id;

                    return (
                      <div
                        key={station.id}
                        className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                          isPreviewing
                            ? 'bg-slate-800/90 border-red-500/50 shadow-md shadow-red-950/20'
                            : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-800'
                        }`}
                      >
                        {/* Left: Play preview + info */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Preview Play/Stop Button */}
                          <button
                            type="button"
                            onClick={() => togglePreview(station)}
                            title={isPreviewing ? 'Hentikan Preview' : 'Tes Dengarkan Siaran'}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition ${
                              isPreviewing
                                ? 'bg-red-600 text-white shadow-md shadow-red-950/50 animate-pulse'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                            }`}
                          >
                            {isPreviewing ? (
                              previewLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Square className="w-3.5 h-3.5 fill-white" />
                              )
                            ) : (
                              <Play className="w-4 h-4 ml-0.5 fill-current" />
                            )}
                          </button>

                          {/* Station Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                                {station.name}
                              </h4>
                              {station.frequency && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 flex-shrink-0">
                                  {station.frequency}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 truncate">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                {station.city}
                              </span>
                              <span>•</span>
                              <span className="truncate">{station.category}</span>
                              {station.bitrate && (
                                <>
                                  <span>•</span>
                                  <span className="text-[10px] text-slate-400">{station.bitrate}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Add to collection button */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {alreadyAdded ? (
                            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>Tersimpan</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAddSingle(station)}
                              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm shadow-red-950/40"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Tambah</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: MANUAL URL INPUT FORM */
            <form onSubmit={handleManualSubmit} className="space-y-3.5">
              {manualError && (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-xs text-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{manualError}</span>
                </div>
              )}

              {/* Station Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Stasiun Radio *
                </label>
                <input
                  id="custom-station-name"
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Cth: Radio Komunitas Pantura 99.9"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Frequency & City */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Frekuensi (Opsional)
                  </label>
                  <input
                    id="custom-station-freq"
                    type="text"
                    value={manualFrequency}
                    onChange={(e) => setManualFrequency(e.target.value)}
                    placeholder="Cth: 104.5 FM"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Kota Asal
                  </label>
                  <select
                    id="custom-station-city"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value as City)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Kategori / Genre
                </label>
                <select
                  id="custom-station-category"
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value as Category)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stream URL */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  URL Stream Siaran (HTTP/HTTPS) *
                </label>
                <input
                  id="custom-station-url"
                  type="url"
                  required
                  value={manualStreamUrl}
                  onChange={(e) => setManualStreamUrl(e.target.value)}
                  placeholder="https://stream.server.com/live.mp3"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Mendukung protokol streaming MP3, AAC, Icecast, Shoutcast, atau HLS.
                </p>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Slogan / Deskripsi Singkat
                </label>
                <input
                  id="custom-station-tagline"
                  type="text"
                  value={manualTagline}
                  onChange={(e) => setManualTagline(e.target.value)}
                  placeholder="Cth: Musik Hits Terkini Sepanjang Hari"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  id="cancel-add-btn"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="save-add-station-btn"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs transition shadow-lg shadow-red-950/50 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Stasiun</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
