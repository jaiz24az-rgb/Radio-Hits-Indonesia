import React, { useState, useEffect } from 'react';
import { Download, Monitor, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallBannerProps {
  onOpenModal: () => void;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({ onOpenModal }) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('pwa_banner_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  const handleQuickInstall = async () => {
    if (isInstallable) {
      await install();
    } else {
      onOpenModal();
    }
  };

  // Hide banner if running in standalone mode (already installed) or dismissed
  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <div
      id="pwa-install-banner"
      className="bg-gradient-to-r from-red-950/70 via-slate-900 to-indigo-950/70 border-b border-red-500/20 text-slate-200 px-4 py-2.5 transition relative"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <img
            src="/pwa-192x192.png"
            alt="Radio Hit Indonesia"
            className="w-8 h-8 rounded-xl object-contain border border-red-500/30 bg-[#0b0e24] shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Radio Hit Indonesia di Desktop
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded bg-red-600/30 text-red-300 border border-red-500/30">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Buat icon di Desktop komputer atau HP untuk akses cepat tanpa buka browser.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleQuickInstall}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-950/40 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Pasang Icon Otomatis</span>
          </button>

          <button
            onClick={onOpenModal}
            className="hidden sm:flex px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            Petunjuk
          </button>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            title="Tutup banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
