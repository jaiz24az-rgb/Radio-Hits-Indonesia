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
      return saved !== null ? parseFloat(saved) : 0.85;
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
  const isMutedRef = useRef<boolean>(isMuted);
  const currentStationRef = useRef<RadioStation | null>(null);
  const activeUrlIndexRef = useRef<number>(0);
  const isSwitchingRef = useRef<boolean>(false);
  const fallbackCooldownRef = useRef<number>(0);
  const loadTimeoutRef = useRef<number | null>(null);

  // Auto-recovery & Keep-alive refs
  const userPausedRef = useRef<boolean>(true);
  const statusRef = useRef<PlaybackStatus>(status);
  const reconnectCooldownRef = useRef<number>(0);
  const stalledTimerRef = useRef<number | null>(null);
  const lastCurrentTimeRef = useRef<number>(0);
  const lastProgressTimeRef = useRef<number>(Date.now());
  const reconnectRef = useRef<() => void>(() => {});

  // Keep refs in sync
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    targetVolumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

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
      }
    } catch {
      // ignore
    }
  }, []);

  // Helper to build list of stream URL candidates
  const getCandidateUrls = useCallback((station: RadioStation) => {
    const rawList = [station.streamUrl, ...(station.fallbackUrls || [])].filter(Boolean);
    const candidates: string[] = [];

    rawList.forEach((url) => {
      if (url.startsWith('https://')) {
        // Direct HTTPS stream first (fastest, zero proxy latency)
        candidates.push(url);
        // Backend proxy as fallback
        candidates.push(`/api/stream?url=${encodeURIComponent(url)}`);
      } else {
        // HTTP streams through proxy
        candidates.push(`/api/stream?url=${encodeURIComponent(url)}`);
        // If app runs on HTTP (e.g. local dev), direct HTTP also allowed
        if (typeof window !== 'undefined' && window.location.protocol === 'http:') {
          candidates.push(url);
        }
      }
    });

    return candidates.length > 0 ? Array.from(new Set(candidates)) : [station.streamUrl];
  }, []);

  const clearLoadTimeout = () => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  };

  // Ref to hold tryFallback function so event listeners stay stable
  const tryFallbackRef = useRef<() => void>(() => {});

  const clearStalledTimeout = () => {
    if (stalledTimerRef.current) {
      clearTimeout(stalledTimerRef.current);
      stalledTimerRef.current = null;
    }
  };

  // Internal helper to play a specific URL for a station
  const playUrlForStation = useCallback((station: RadioStation, urlIndex: number, isReconnect = false) => {
    clearLoadTimeout();
    clearStalledTimeout();
    const urls = getCandidateUrls(station);
    if (urlIndex >= urls.length) {
      setStatus('error');
      statusRef.current = 'error';
      setErrorMessage('Siaran radio sedang offline atau server tidak merespons. Silakan coba stasiun lain.');
      return;
    }

    let streamUrl = urls[urlIndex];
    if (isReconnect) {
      const sep = streamUrl.includes('?') ? '&' : '?';
      streamUrl = `${streamUrl}${sep}_t=${Date.now()}`;
    }

    setActiveUrlIndex(urlIndex);
    activeUrlIndexRef.current = urlIndex;
    setStatus('loading');
    statusRef.current = 'loading';
    userPausedRef.current = false;

    if (isReconnect) {
      setErrorMessage('Menyambung ulang siaran radio...');
    } else if (urlIndex > 0) {
      setErrorMessage(`Menghubungkan ke jalur cadangan ${urlIndex + 1}/${urls.length}...`);
    } else {
      setErrorMessage(null);
    }

    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'auto';
      audioRef.current = audio;
    }

    const audio = audioRef.current;
    isSwitchingRef.current = true;

    // Start 10s watchdog timer in case browser stalls
    loadTimeoutRef.current = window.setTimeout(() => {
      if (isSwitchingRef.current) {
        tryFallbackRef.current();
      }
    }, 10000);

    try {
      audio.pause();
      audio.src = streamUrl;
      audio.volume = isMutedRef.current ? 0 : targetVolumeRef.current;
      audio.muted = isMutedRef.current;
      audio.load();

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            clearLoadTimeout();
            clearStalledTimeout();
            isSwitchingRef.current = false;
            setStatus('playing');
            statusRef.current = 'playing';
            setErrorMessage(null);
            lastProgressTimeRef.current = Date.now();
            lastCurrentTimeRef.current = audio.currentTime;
            updateMediaSession(station);
          })
          .catch((err) => {
            clearLoadTimeout();
            isSwitchingRef.current = false;
            if (err && err.name === 'AbortError') {
              return;
            }
            if (err && err.name === 'NotAllowedError') {
              setStatus('paused');
              statusRef.current = 'paused';
              setErrorMessage('Klik tombol putar untuk memulai siaran.');
              return;
            }
            tryFallbackRef.current();
          });
      }
    } catch {
      clearLoadTimeout();
      isSwitchingRef.current = false;
      tryFallbackRef.current();
    }
  }, [getCandidateUrls, updateMediaSession]);

  // Try next fallback URL with debounce guard
  const tryFallback = useCallback(() => {
    const now = Date.now();
    if (now - fallbackCooldownRef.current < 500) {
      return;
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
      statusRef.current = 'error';
      setErrorMessage('Siaran radio sedang offline atau server tidak merespons. Silakan coba stasiun lain.');
    }
  }, [playUrlForStation, getCandidateUrls]);

  // Auto-reconnect to current station
  const reconnectCurrentStation = useCallback(() => {
    const now = Date.now();
    if (now - reconnectCooldownRef.current < 1500) {
      return;
    }
    reconnectCooldownRef.current = now;

    const station = currentStationRef.current;
    if (!station || userPausedRef.current) return;

    playUrlForStation(station, activeUrlIndexRef.current, true);
  }, [playUrlForStation]);

  // Keep refs synced
  useEffect(() => {
    tryFallbackRef.current = tryFallback;
  }, [tryFallback]);

  useEffect(() => {
    reconnectRef.current = reconnectCurrentStation;
  }, [reconnectCurrentStation]);

  // Initialize audio element ONCE and attach permanent stable event listeners
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'auto';
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    const handlePlaying = () => {
      clearLoadTimeout();
      clearStalledTimeout();
      isSwitchingRef.current = false;
      setStatus('playing');
      statusRef.current = 'playing';
      setErrorMessage(null);
      lastProgressTimeRef.current = Date.now();
      lastCurrentTimeRef.current = audio.currentTime;
    };

    const handleWaiting = () => {
      if (!userPausedRef.current) {
        setStatus('loading');
        statusRef.current = 'loading';
      }
    };

    const handleStalled = () => {
      if (!userPausedRef.current && !isSwitchingRef.current) {
        if (!stalledTimerRef.current) {
          stalledTimerRef.current = window.setTimeout(() => {
            stalledTimerRef.current = null;
            if (!userPausedRef.current && !isSwitchingRef.current) {
              reconnectRef.current();
            }
          }, 5000);
        }
      }
    };

    const handleEnded = () => {
      // Live streams should not terminate. If server drops connection, reconnect immediately.
      if (!userPausedRef.current && !isSwitchingRef.current) {
        reconnectRef.current();
      }
    };

    const handlePause = () => {
      if (!isSwitchingRef.current) {
        if (userPausedRef.current) {
          setStatus((prev) => (prev === 'error' ? 'error' : 'paused'));
          statusRef.current = 'paused';
        } else {
          // Unexpected pause (browser background throttle or buffer underflow)
          setTimeout(() => {
            if (!userPausedRef.current && audioRef.current?.paused) {
              audioRef.current.play().catch(() => {
                reconnectRef.current();
              });
            }
          }, 800);
        }
      }
    };

    const handleError = () => {
      if (!isSwitchingRef.current) {
        tryFallbackRef.current();
      }
    };

    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      clearLoadTimeout();
      clearStalledTimeout();
      try {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      } catch {
        // ignore
      }
    };
  }, []); // Run only once on mount

  // Heartbeat watchdog & background tab wake-up
  useEffect(() => {
    const watchdogInterval = window.setInterval(() => {
      if (userPausedRef.current || !currentStationRef.current || !audioRef.current) {
        return;
      }

      const audio = audioRef.current;
      const now = Date.now();

      // If marked as playing but HTML5 audio element paused unexpectedly
      if (statusRef.current === 'playing' && audio.paused) {
        audio.play().catch(() => {
          reconnectRef.current();
        });
        return;
      }

      // Check if currentTime is advancing when supposed to be playing
      if (statusRef.current === 'playing') {
        const curTime = audio.currentTime;
        if (curTime > lastCurrentTimeRef.current + 0.05) {
          lastCurrentTimeRef.current = curTime;
          lastProgressTimeRef.current = now;
        } else if (now - lastProgressTimeRef.current > 7000) {
          // Buffer has been frozen for > 7s, reconnect fresh stream
          lastProgressTimeRef.current = now;
          reconnectRef.current();
        }
      }
    }, 3500);

    // Auto-resume when PC reconnects to Wi-Fi / network
    const handleOnline = () => {
      if (!userPausedRef.current && currentStationRef.current) {
        reconnectRef.current();
      }
    };

    // Auto-resume when switching back to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !userPausedRef.current && currentStationRef.current) {
        if (audioRef.current?.paused) {
          audioRef.current.play().catch(() => {
            reconnectRef.current();
          });
        }
      }
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(watchdogInterval);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Sync volume and mute to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume));
      audioRef.current.muted = isMuted;
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

  // Play a specific station
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

  // Manual server switch
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

  // Play / Resume
  const play = useCallback(() => {
    userPausedRef.current = false;
    const station = currentStationRef.current;
    if (!station) {
      if (stations.length > 0) {
        playStation(stations[0]);
      }
      return;
    }

    if (audioRef.current && audioRef.current.src) {
      setStatus('loading');
      statusRef.current = 'loading';
      setErrorMessage(null);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setStatus('playing');
            statusRef.current = 'playing';
            setErrorMessage(null);
          })
          .catch((err) => {
            if (err && err.name === 'NotAllowedError') {
              setStatus('paused');
              statusRef.current = 'paused';
              setErrorMessage('Klik tombol putar untuk memulai siaran.');
            } else {
              tryFallbackRef.current();
            }
          });
      }
    } else {
      playUrlForStation(station, activeUrlIndexRef.current);
    }
  }, [stations, playStation, playUrlForStation]);

  // Pause
  const pause = useCallback(() => {
    userPausedRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      setStatus('paused');
      statusRef.current = 'paused';
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
    userPausedRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      setStatus('idle');
      statusRef.current = 'idle';
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

  // Setup MediaSession handlers
  useEffect(() => {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator && navigator.mediaSession) {
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
  }, [play, pause, playPrevious, playNext, stop]);

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
            userPausedRef.current = true;
            audioRef.current.pause();
            setStatus('paused');
            statusRef.current = 'paused';
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
      audioRef.current.volume = isMutedRef.current ? 0 : targetVolumeRef.current;
    }
    setSleepTimer({
      isActive: false,
      remainingSeconds: 0,
      initialMinutes: 0,
      fadeOut: true,
    });
  }, []);

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
