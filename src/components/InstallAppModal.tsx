import React, { useState } from 'react';
import { Download, Monitor, Smartphone, Apple, CheckCircle2, X, ExternalLink, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'desktop' | 'android' | 'ios'>('desktop');
  const [installedSuccess, setInstalledSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    const success = await install();
    if (success) {
      setInstalledSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-red-950/30 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with App Logo */}
        <div className="p-6 bg-gradient-to-b from-slate-800/80 to-slate-900 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src="/pwa-192x192.png"
              alt="Radio Hit Indonesia"
              className="w-16 h-16 rounded-2xl shadow-xl shadow-red-950/60 border border-red-500/30 object-contain bg-[#0b0e24]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Radio Hit Indonesia
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-600/30 text-red-400 border border-red-500/40">
                  Aplikasi
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Pasang sebagai icon aplikasi mandiri di Desktop komputer & Layar Utama HP
              </p>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-5">
          {installedSuccess || isInstalled ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="font-semibold text-emerald-300">Aplikasi Sudah Terpasang!</h4>
              <p className="text-xs text-slate-300">
                Icon Radio Hit Indonesia kini sudah tersedia di Desktop / menu aplikasi Anda. Anda dapat membukanya kapan saja seperti aplikasi bawaan.
              </p>
            </div>
          ) : (
            <>
              {/* Primary 1-Click Install Button if supported by browser */}
              {isInstallable && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-red-600/20 via-rose-600/20 to-red-600/20 border border-red-500/40 text-center space-y-3">
                  <p className="text-xs font-medium text-red-200">
                    Browser Anda mendukung pemasangan langsung 1-klik:
                  </p>
                  <button
                    onClick={handleDirectInstall}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-950/60 flex items-center justify-center gap-2 transition active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pasang Icon Otomatis ke Desktop Sekarang</span>
                  </button>
                </div>
              )}

              {/* Tabs for instructions */}
              <div>
                <div className="flex border-b border-slate-800 text-xs font-medium">
                  <button
                    onClick={() => setActiveTab('desktop')}
                    className={`flex-1 py-2.5 flex items-center justify-center gap-2 border-b-2 transition ${
                      activeTab === 'desktop'
                        ? 'border-red-500 text-red-400 font-semibold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span>Komputer (PC/Laptop)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('android')}
                    className={`flex-1 py-2.5 flex items-center justify-center gap-2 border-b-2 transition ${
                      activeTab === 'android'
                        ? 'border-red-500 text-red-400 font-semibold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>HP Android</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('ios')}
                    className={`flex-1 py-2.5 flex items-center justify-center gap-2 border-b-2 transition ${
                      activeTab === 'ios'
                        ? 'border-red-500 text-red-400 font-semibold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Apple className="w-4 h-4" />
                    <span>iPhone / iPad</span>
                  </button>
                </div>

                {/* Tab content: Desktop */}
                {activeTab === 'desktop' && (
                  <div className="py-4 space-y-3 text-xs text-slate-300">
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 font-bold text-red-400">
                        1
                      </div>
                      <p className="pt-0.5 leading-relaxed">
                        Di browser <strong>Google Chrome</strong> atau <strong>Microsoft Edge</strong>, perhatikan ujung kanan kolom alamat URL (Address Bar) di atas.
                      </p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 font-bold text-red-400">
                        2
                      </div>
                      <p className="pt-0.5 leading-relaxed">
                        Klik ikon <strong>Instal Radio Hit Indonesia</strong> (simbol komputer dengan tanda panah ke bawah <Download className="inline w-3.5 h-3.5 text-red-400 mx-0.5" />) di ujung kanan bilah alamat.
                      </p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 font-bold text-red-400">
                        3
                      </div>
                      <p className="pt-0.5 leading-relaxed">
                        Klik <strong>"Instal"</strong>. Icon <strong>Radio Hit Indonesia</strong> akan otomatis dibuat di <strong>Desktop</strong>, Taskbar, dan menu Start komputer Anda!
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-400">
                      💡 <em>Keuntungan</em>: Radio berjalan di jendela khusus tanpa tab browser yang mengganggu, audio berjalan mulus di latar belakang, dan Anda bisa memutar radio langsung dari Desktop seperti aplikasi Spotify/iTunes.
                    </div>
                  </div>
                )}

                {/* Tab content: Android */}
                {activeTab === 'android' && (
                  <div className="py-4 space-y-3 text-xs text-slate-300">
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 font-bold text-red-400">
                        1
                      </div>
                      <p className="pt-0.5 leading-relaxed">
                        Buka website ini di browser <strong>Google Chrome</strong> di HP Anda.
                      </p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 font-bold text-red-400">
                        2
                      </div>
                      <p className="pt-0.5 leading-relaxed">
                        Ketuk tombol titik tiga (⋮) di pojok kanan atas browser.
                      </p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 font-bold text-red-400">
                        3
                      </div>
                      <p className="pt-0.5 leading-relaxed">
                        Pilih <strong>"Pasang aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab content: iOS */}
                {activeTab === 'ios' && (
                  <div className="py-4 space-y-3 text-xs text-slate-300">
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 font-bold text-red-400">
                        1
                      </div>
                      <p className="pt-0.5 leading-relaxed">
                        Buka website ini di browser <strong>Safari</strong> pada iPhone / iPad.
                      </p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 font-bold text-red-400">
                        2
                      </div>
                      <p className="pt-0.5 leading-relaxed">
                        Tekan tombol <strong>Bagikan / Share</strong> (ikon kotak dengan panah ke atas) di menu bilah bawah Safari.
                      </p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 font-bold text-red-400">
                        3
                      </div>
                      <p className="pt-0.5 leading-relaxed">
                        Gulir ke bawah dan ketuk <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>PWA Standalone & Background Playback</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
