import React, { useState } from 'react';
import { Zap, Moon, Smartphone, ShieldCheck, X, Check } from 'lucide-react';
import { BatteryInfo } from '../types';

interface BatterySaverBannerProps {
  batterySaverMode: boolean;
  onToggleBatterySaver: () => void;
  battery: BatteryInfo;
}

export const BatterySaverBanner: React.FC<BatterySaverBannerProps> = ({
  batterySaverMode,
  onToggleBatterySaver,
  battery,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      id="battery-saver-banner"
      className={`mb-6 p-4 rounded-2xl border transition-all ${
        batterySaverMode
          ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-100'
          : 'bg-slate-800/60 border-slate-700/70 text-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl flex-shrink-0 ${
              batterySaverMode
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-700/60 text-slate-300'
            }`}
          >
            <Zap className={`w-5 h-5 ${batterySaverMode ? 'fill-emerald-400' : ''}`} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white">
                {batterySaverMode
                  ? 'Mode Hemat Daya & Pemutaran Latar Aktif'
                  : 'Dukungan Pemutaran Latar Belakang & Hemat Baterai'}
              </h4>
              {batterySaverMode && (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Efisien
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {batterySaverMode
                ? 'Aplikasi berjalan dalam mode konsumsi daya ultra-rendah. Visualizer dinonaktifkan dan streaming dioptimalkan untuk menjaga baterai HP Anda tetap tahan lama.'
                : 'Dengarkan radio nonstop sambil membuka aplikasi lain atau dengan layar HP mati/terkunci berkat Media Session API.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1.5 text-xs">
              <button
                id="toggle-banner-saver-btn"
                onClick={onToggleBatterySaver}
                className={`font-semibold underline transition ${
                  batterySaverMode
                    ? 'text-emerald-400 hover:text-emerald-300'
                    : 'text-red-400 hover:text-red-300'
                }`}
              >
                {batterySaverMode ? 'Nonaktifkan Mode Hemat' : 'Aktifkan Mode Hemat Daya'}
              </button>

              <span className="text-slate-500 hidden sm:inline">•</span>

              <span className="text-slate-400 flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-indigo-400" /> Mode Malam Nyaman untuk Mata
              </span>
            </div>
          </div>
        </div>

        <button
          id="dismiss-battery-banner-btn"
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition flex-shrink-0"
          title="Tutup Pesan"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
