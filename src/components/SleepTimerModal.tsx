import React, { useState } from 'react';
import { X, Clock, Moon, Check, Volume2, ShieldCheck } from 'lucide-react';
import { SleepTimerState } from '../types';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sleepTimer: SleepTimerState;
  onStartTimer: (minutes: number, fadeOut: boolean) => void;
  onCancelTimer: () => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  onClose,
  sleepTimer,
  onStartTimer,
  onCancelTimer,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(30);
  const [customMinutes, setCustomMinutes] = useState<number>(30);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [fadeOut, setFadeOut] = useState<boolean>(true);

  if (!isOpen) return null;

  const presets = [15, 30, 45, 60, 90, 120];

  const formatRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} menit ${secs} detik`;
  };

  const handleApply = () => {
    const minutesToUse = isCustom ? customMinutes : selectedMinutes;
    onStartTimer(minutesToUse, fadeOut);
    onClose();
  };

  const handleStop = () => {
    onCancelTimer();
    onClose();
  };

  return (
    <div
      id="sleep-timer-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="sleep-timer-card"
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">
                Pengatur Waktu Tidur
              </h3>
              <p className="text-xs text-slate-400">
                Otomatis matikan siaran & hemat baterai saat Anda tertidur
              </p>
            </div>
          </div>
          <button
            id="close-sleep-timer-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Timer Status Banner if running */}
        {sleepTimer.isActive && (
          <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-indigo-400 animate-pulse" />
              <div>
                <div className="text-xs text-indigo-300 font-medium">Timer Sedang Berjalan</div>
                <div className="font-mono text-base font-bold text-white">
                  Sisa: {formatRemaining(sleepTimer.remainingSeconds)}
                </div>
              </div>
            </div>
            <button
              id="stop-timer-btn"
              onClick={handleStop}
              className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-xs font-semibold text-white transition"
            >
              Matikan
            </button>
          </div>
        )}

        {/* Preset Minutes Buttons */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Pilih Durasi Waktu Tidur:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((mins) => {
              const isSelected = !isCustom && selectedMinutes === mins;
              return (
                <button
                  key={mins}
                  id={`preset-${mins}-mins-btn`}
                  onClick={() => {
                    setSelectedMinutes(mins);
                    setIsCustom(false);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition ${
                    isSelected
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-500 shadow-md shadow-red-950/40'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border-slate-700'
                  }`}
                >
                  {mins} Menit
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom duration slider */}
        <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">Durasi Kustom:</span>
            <span className="font-mono font-bold text-red-400 text-sm">
              {customMinutes} Menit
            </span>
          </div>
          <input
            id="custom-sleep-timer-slider"
            type="range"
            min="5"
            max="180"
            step="5"
            value={customMinutes}
            onChange={(e) => {
              setCustomMinutes(parseInt(e.target.value, 10));
              setIsCustom(true);
            }}
            className="w-full accent-red-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>5 menit</span>
            <span>60 menit</span>
            <span>180 menit</span>
          </div>
        </div>

        {/* Smooth Fade-out Option */}
        <label
          id="fadeout-toggle-label"
          className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-800 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <div>
              <div className="text-xs font-medium text-slate-200">
                Pudar Halus (Fade Out)
              </div>
              <div className="text-[11px] text-slate-400">
                Turunkan volume bertahap di 45 detik terakhir agar tidak kaget
              </div>
            </div>
          </div>
          <input
            id="fadeout-checkbox"
            type="checkbox"
            checked={fadeOut}
            onChange={(e) => setFadeOut(e.target.checked)}
            className="w-4 h-4 accent-red-500 rounded bg-slate-700 border-slate-600 cursor-pointer"
          />
        </label>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            id="cancel-sleep-modal-btn"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
          >
            Tutup
          </button>

          <button
            id="apply-sleep-timer-btn"
            onClick={handleApply}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs transition shadow-lg shadow-red-950/50 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Pasang Timer ({isCustom ? customMinutes : selectedMinutes}m)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
