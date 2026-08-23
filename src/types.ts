export type Category = 
  | 'Semua'
  | 'Pop & Hits'
  | 'Dangdut'
  | 'Berita & Talk'
  | 'Daerah & Komunitas'
  | 'Religi & Inspirasi'
  | 'Kustom';

export type City = 
  | 'Semua Kota'
  | 'Jakarta'
  | 'Bandung'
  | 'Surabaya'
  | 'Yogyakarta'
  | 'Semarang'
  | 'Solo'
  | 'Medan'
  | 'Makassar'
  | 'Palembang'
  | 'Banjarmasin'
  | 'Pontianak'
  | 'Manado'
  | 'Bali'
  | 'Bogor'
  | 'Cirebon'
  | 'Malang'
  | 'Lampung'
  | 'Padang'
  | 'Batam'
  | 'Nasional'
  | string;

export interface RadioStation {
  id: string;
  name: string;
  tagline: string;
  frequency: string;
  city: City;
  category: Category;
  streamUrl: string;
  fallbackUrls?: string[];
  logo?: string;
  color: string;
  accentGradient: string;
  isCustom?: boolean;
  bitrate?: string;
}

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface SleepTimerState {
  isActive: boolean;
  remainingSeconds: number;
  initialMinutes: number;
  fadeOut: boolean;
}

export interface BatteryInfo {
  supported: boolean;
  level: number; // 0 to 1
  charging: boolean;
  chargingTime?: number;
  dischargingTime?: number;
}

export type ThemeMode = 'dark' | 'light' | 'midnight';
