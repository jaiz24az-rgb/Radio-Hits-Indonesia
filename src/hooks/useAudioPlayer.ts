import { useState, useEffect, useRef, useCallback } from 'react';
import { RadioStation, PlaybackStatus, SleepTimerState } from '../types';

interface UseAudioPlayerProps {
  stations: RadioStation[];
  batterySaverMode: boolean;
}

export function useAudioPlayer({ stations, batterySaverMode }: UseAudioPlayerProps) {
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [volume, setVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('radio_volume');
      return saved ? parseFloat(saved) : 0.85;
    } catch {
      return 0.85;
    }
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeUrlIndex, setActiveUrlIndex] = useState<number>(0);
  const [isLive, setIsLive] = useState<boolean>(true);

  // Sleep Timer state
  const [sleepTimer, setSleepTimer] = useState<SleepTimerState>({
    isActive: false,
    remainingSeconds: 0,
    initialMinutes: 0,
    fadeOut: true,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const targetVolumeRef = useRef<number>(volume);
  const currentStationRef = useRef<RadioStation | null>(null);
  const activeUrlIndexRef = useRef<number>(0);
  const isSwitchingRef = useRef<boolean>(false);
  const fallbackCooldownRef = useRef<number>(0);

  // Keep target volume and currentStation ref synced
  useEffect(() => {
    targetVolumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    currentStationRef.current = currentStation;
  }, [currentStation]);

  useEffect(() => {
    activeUrlIndexRef.current = activeUrlIndex;
  }, [activeUrlIndex]);

  // Setup Media Session API safely
  const updateMediaSession = useCallback((station: RadioStation) => {
    try {
      if (typeof window !== 'undefined' && 'mediaSession' in navigator && navigator.mediaSession) {
        if (typeof window.MediaMetadata !== 'undefined') {
          navigator.mediaSession.metadata = new window.MediaMetadata({
            title: station.name,
            artist: `${station.frequency} • ${station.city}`,
            album: station.tagline || 'Radio Indonesia Live',
            artwork: [
              {
                src: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=512&auto=format&fit=crop&q=80',
                sizes: '512x512',
                type: 'image/jpeg',
              },
            ],
          });
        }

        try {
          navigator.mediaSession.playbackState = 'playing';
        } catch {
          // ignore
        }

        const handlers: [MediaSessionAction, () => void][] = [
          ['play', () => play()],
          ['pause', () => pause()],
          ['previoustrack', () => playPrevious()],
          ['nexttrack', () => playNext()],
          ['stop', () => stop()],
        ];

        handlers.forEach(([action, handler]) => {
          try {
            navigator.mediaSession.setActionHandler(action, handler);
          } catch {
            // ignore
          }
        });
      }
    } catch {
      // ignore
    }
  }, [stations]);

  // Helper to build list of stream URL candidates
  const getCandidateUrls = useCallback((station: RadioStation) => {
    const rawList = [station.streamUrl, ...(station.fallbackUrls || [])].filter(Boolean);
    const candidates: string[] = [];

    rawList.forEach((url) => {
      if (url.startsWith('https://')) {
        // 1. Direct HTTPS first (works natively in browser, zero latency, zero server proxy limit on Vercel/Netlify)
        candidates.push(url);
        // 2. Backend proxy as fallback (if CORS / ICY headers issue on certain browsers)
        candidates.push(`/api/stream?url=${encodeURIComponent(url)}`);
      } else {
        // HTTP streams must go through the HTTPS proxy on HTTPS deployments (Vercel, Cloud Run)
        candidates.push(`/api/stream?url=${encodeURIComponent(url)}`);
        // If app is running on HTTP (e.g. local dev / http), direct HTTP can also be tried
        if (typeof window !== 'undefined' && window.location.protocol === 'http:') {
          candidates.push(url);
        }
      }
    });

    return candidates.length > 0 ? Array.from(new Set(candidates)) : [station.streamUrl];
  }, []);

  const loadTimeoutRef = useRef<number | null>(null);

  const clearLoadTimeout = () => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  };

  // Internal helper to play a specific URL for a station
  const playUrlForStation = useCallback((station: RadioStation, urlIndex: number) => {
    clearLoadTimeout();
    const urls = getCandidateUrls(station);
    if (urlIndex >= urls.length) {
      setStatus('error');
      setErrorMessage('Siaran radio sedang offline atau server tidak merespons. Silakan coba stasiun lain.');
      return;
    }

    const streamUrl = urls[urlIndex];
    setActiveUrlIndex(urlIndex);
    activeUrlIndexRef.current = urlIndex;
    setStatus('loading');

    if (urlIndex > 0) {
      setErrorMessage(`Menghubungkan ke jalur cadangan ${urlIndex + 1}/${urls.length}...`);
    } else {
      setErrorMessage(null);
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    isSwitchingRef.current = true;

    // Start 10s watchdog timer in case browser hangs on buffering dead stream
    loadTimeoutRef.current = window.setTimeout(() => {
      if (status === 'loading' || isSwitchingRef.current) {
        tryFallback();
      }
    }, 10000);

    try {
      audio.pause();
      audio.src = streamUrl;
      audio.volume = isMuted ? 0 : targetVolumeRef.current;
      audio.load();

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            clearLoadTimeout();
            isSwitchingRef.current = false;
            setStatus('playing');
            setErrorMessage(null);
            updateMediaSession(station);
          })
          .catch((err) => {
            clearLoadTimeout();
            isSwitchingRef.current = false;
            // Ignore AbortError if interrupted by another load/station click
            if (err && err.name === 'AbortError') {
              return;
            }
            if (err && err.name === 'NotAllowedError') {
              setStatus('paused');
              setErrorMessage('Klik tombol putar untuk memulai siaran.');
              return;
            }
            // Otherwise try next fallback
            tryFallback();
          });
      }
    } catch {
      clearLoadTimeout();
      isSwitchingRef.current = false;
      tryFallback();
    }
  }, [isMuted, status, updateMediaSession, getCandidateUrls]);

  // Try next fallback URL with debounce guard
  const tryFallback = useCallback(() => {
    const now = Date.now();
    if (now - fallbackCooldownRef.current < 600) {
      return; // prevent rapid consecutive loops
    }
    fallbackCooldownRef.current = now;

    const station = currentStationRef.current;
    if (!station) return;

    const urls = getCandidateUrls(station);
    const nextIndex = activeUrlIndexRef.current + 1;

    if (nextIndex < urls.length) {
      playUrlForStation(station, nextIndex);
    } else {
      setStatus('error');
      setErrorMessage('Siaran radio sedang offline atau server tidak merespons. Silakan coba stasiun lain.');
    }
  }, [playUrlForStation, getCandidateUrls]);

  // Initialize audio singleton
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'auto';
      audioRef.current = audio;

      audio.addEventListener('playing', () => {
        setStatus('playing');
        setErrorMessage(null);
      });

      audio.addEventListener('waiting', () => {
        setStatus('loading');
      });

      audio.addEventListener('pause', () => {
        if (!isSwitchingRef.current) {
          setStatus((prev) => (prev === 'error' ? 'error' : 'paused'));
        }
      });

      audio.addEventListener('error', () => {
        if (!isSwitchingRef.current) {
          tryFallback();
        }
      });
    }

    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.removeAttribute('src');
          audioRef.current.load();
        } catch {
          // ignore
        }
      }
    };
  }, [tryFallback]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    try {
      localStorage.setItem('radio_volume', volume.toString());
    } catch {
      // ignore
    }
  }, [volume, isMuted]);

  // Sync mediaSession playbackState
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'mediaSession' in navigator && navigator.mediaSession) {
        if (status === 'playing') {
          navigator.mediaSession.playbackState = 'playing';
        } else if (status === 'paused') {
          navigator.mediaSession.playbackState = 'paused';
        } else {
          navigator.mediaSession.playbackState = 'none';
        }
      }
    } catch {
      // ignore
    }
  }, [status]);

  // Play a specific station from beginning
  const playStation = useCallback((station: RadioStation) => {
    setCurrentStation(station);
    currentStationRef.current = station;
    playUrlForStation(station, 0);

    // Save to recently played
    try {
      const recent = JSON.parse(localStorage.getItem('radio_recent_stations') || '[]');
      const filtered = recent.filter((id: string) => id !== station.id);
      filtered.unshift(station.id);
      localStorage.setItem('radio_recent_stations', JSON.stringify(filtered.slice(0, 10)));
    } catch {
      // ignore
    }
  }, [playUrlForStation]);

  // Retry or switch server manually
  const switchServer = useCallback(() => {
    const station = currentStationRef.current;
    if (!station) return;
    const urls = getCandidateUrls(station);
    const nextIdx = (activeUrlIndexRef.current + 1) % urls.length;
    playUrlForStation(station, nextIdx);
  }, [playUrlForStation, getCandidateUrls]);

  const retryCurrentStation = useCallback(() => {
    const station = currentStationRef.current;
    if (!station) return;
    playUrlForStation(station, 0);
  }, [playUrlForStation]);

  // Play/Resume
  const play = useCallback(() => {
    const station = currentStationRef.current;
    if (!station) {
      if (stations.length > 0) {
        playStation(stations[0]);
      }
      return;
    }

    if (audioRef.current && audioRef.current.src) {
      setStatus('loading');
      setErrorMessage(null);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setStatus('playing');
            setErrorMessage(null);
          })
          .catch((err) => {
            if (err && err.name === 'NotAllowedError') {
              setStatus('paused');
              setErrorMessage('Klik tombol putar untuk memulai siaran.');
            } else {
              tryFallback();
            }
          });
      }
    } else {
      playUrlForStation(station, activeUrlIndexRef.current);
    }
  }, [stations, playStation, playUrlForStation, tryFallback]);

  // Pause
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setStatus('paused');
    }
  }, []);

  // Toggle Play / Pause
  const togglePlay = useCallback(() => {
    if (status === 'playing') {
      pause();
    } else {
      play();
    }
  }, [status, play, pause]);

  // Stop
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      setStatus('idle');
    }
  }, []);

  // Play next station
  const playNext = useCallback(() => {
    if (!currentStation || stations.length === 0) return;
    const currentIndex = stations.findIndex((s) => s.id === currentStation.id);
    const nextIndex = (currentIndex + 1) % stations.length;
    playStation(stations[nextIndex]);
  }, [currentStation, stations, playStation]);

  // Play previous station
  const playPrevious = useCallback(() => {
    if (!currentStation || stations.length === 0) return;
    const currentIndex = stations.findIndex((s) => s.id === currentStation.id);
    const prevIndex = (currentIndex - 1 + stations.length) % stations.length;
    playStation(stations[prevIndex]);
  }, [currentStation, stations, playStation]);

  // Sleep Timer logic
  const startSleepTimer = useCallback((minutes: number, fadeOut = true) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    if (minutes <= 0) {
      setSleepTimer({
        isActive: false,
        remainingSeconds: 0,
        initialMinutes: 0,
        fadeOut: true,
      });
      return;
    }

    const totalSeconds = minutes * 60;
    setSleepTimer({
      isActive: true,
      remainingSeconds: totalSeconds,
      initialMinutes: minutes,
      fadeOut,
    });

    timerIntervalRef.current = window.setInterval(() => {
      setSleepTimer((prev) => {
        if (!prev.isActive || prev.remainingSeconds <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          
          if (audioRef.current) {
            audioRef.current.pause();
            setStatus('paused');
          }

          return {
            isActive: false,
            remainingSeconds: 0,
            initialMinutes: 0,
            fadeOut: true,
          };
        }

        const nextSeconds = prev.remainingSeconds - 1;

        if (prev.fadeOut && nextSeconds <= 45 && audioRef.current) {
          const ratio = Math.max(0, nextSeconds / 45);
          audioRef.current.volume = targetVolumeRef.current * ratio;
        }

        return {
          ...prev,
          remainingSeconds: nextSeconds,
        };
      });
    }, 1000);
  }, []);

  const cancelSleepTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : targetVolumeRef.current;
    }
    setSleepTimer({
      isActive: false,
      remainingSeconds: 0,
      initialMinutes: 0,
      fadeOut: true,
    });
  }, [isMuted]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  return {
    currentStation,
    status,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    errorMessage,
    activeUrlIndex,
    isLive,
    sleepTimer,
    startSleepTimer,
    cancelSleepTimer,
    playStation,
    togglePlay,
    play,
    pause,
    stop,
    playNext,
    playPrevious,
    switchServer,
    retryCurrentStation,
  };
}
