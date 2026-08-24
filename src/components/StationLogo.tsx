import React, { useState } from 'react';
import { Radio, Disc, Mic2, HeartHandshake, Waves, Sparkles, Flame, Headphones } from 'lucide-react';
import { RadioStation } from '../types';

interface StationLogoProps {
  station: RadioStation;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isPlaying?: boolean;
}

export const StationLogo: React.FC<StationLogoProps> = ({
  station,
  size = 'md',
  className = '',
  isPlaying = false,
}) => {
  const [imageError, setImageError] = useState(false);

  // Size mapping
  const sizeClasses = {
    sm: 'w-9 h-9 rounded-lg',
    md: 'w-12 h-12 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-40 h-40 sm:w-48 sm:h-48 rounded-3xl',
  };

  const hasImage = Boolean(station.logo && !imageError);

  // Render stylized brand vector badge based on station ID or name
  const renderBrandBadge = () => {
    const id = (station.id || '').toLowerCase();
    const name = (station.name || '').toLowerCase();

    // 1. PRAMBORS FM
    if (id.includes('prambors') || name.includes('prambors')) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 text-white p-1 text-center shadow-inner overflow-hidden select-none">
          <Headphones className={size === 'xl' ? 'w-12 h-12 mb-1 drop-shadow' : size === 'sm' ? 'w-3 h-3 mb-0.5' : 'w-4 h-4 mb-0.5 drop-shadow-sm'} />
          <span className={`font-black uppercase tracking-normal leading-none max-w-full truncate px-0.5 ${size === 'xl' ? 'text-2xl tracking-wide' : size === 'sm' ? 'text-[7px]' : 'text-[8.5px]'}`}>
            PRAMBORS
          </span>
          {size === 'xl' ? (
            <span className="text-xs font-bold tracking-widest text-amber-100 uppercase mt-1">
              102.2 FM HITS
            </span>
          ) : size === 'md' ? (
            <span className="text-[7px] font-bold text-amber-100 leading-none mt-0.5">
              102.2 FM
            </span>
          ) : null}
        </div>
      );
    }

    // 2. iSWARA / iRADIO
    if (id.includes('iswara') || name.includes('iradio') || name.includes('iswara')) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-800 text-white p-1 text-center shadow-inner overflow-hidden select-none">
          <div className="flex items-center justify-center max-w-full">
            <span className={`font-black tracking-tight leading-none ${size === 'xl' ? 'text-3xl' : size === 'sm' ? 'text-[8.5px]' : 'text-[10.5px]'}`}>
              <span className="text-amber-300">i</span>SWARA
            </span>
          </div>
          <span className={`font-semibold tracking-tight text-emerald-100 max-w-full truncate leading-none ${size === 'xl' ? 'text-xs mt-1.5' : size === 'sm' ? 'text-[6px] mt-0.5' : 'text-[7px] mt-0.5'}`}>
            {size === 'xl' ? '100% MUSIK INDONESIA' : 'INDONESIA'}
          </span>
        </div>
      );
    }

    // 3. BENS RADIO
    if (id.includes('bens') || name.includes('bens')) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-500 via-yellow-600 to-orange-700 text-white p-1 text-center shadow-inner overflow-hidden select-none">
          <Radio className={size === 'xl' ? 'w-10 h-10 mb-1 text-yellow-200' : size === 'sm' ? 'w-3 h-3 mb-0.5 text-yellow-200' : 'w-4 h-4 mb-0.5 text-yellow-200'} />
          <span className={`font-black tracking-tight leading-none ${size === 'xl' ? 'text-2xl' : size === 'sm' ? 'text-[8px]' : 'text-[9.5px]'}`}>
            BENS RADIO
          </span>
          <span className={`font-bold text-yellow-200 leading-none ${size === 'xl' ? 'text-xs mt-1' : size === 'sm' ? 'text-[6.5px] mt-0.5' : 'text-[7px] mt-0.5'}`}>
            106.2 FM
          </span>
        </div>
      );
    }

    // 4. RADIO CBB DANGDUT
    if (id.includes('cbb') || name.includes('cbb')) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-600 via-rose-700 to-pink-800 text-white p-1 text-center shadow-inner overflow-hidden select-none">
          <Disc className={size === 'xl' ? 'w-10 h-10 mb-1 text-amber-300' : size === 'sm' ? 'w-3 h-3 mb-0.5 text-amber-300' : 'w-4 h-4 mb-0.5 text-amber-300'} />
          <span className={`font-black tracking-normal leading-none ${size === 'xl' ? 'text-2xl' : size === 'sm' ? 'text-[8px]' : 'text-[9.5px]'}`}>
            CBB 105.4
          </span>
          <span className={`font-bold uppercase tracking-wider text-rose-200 leading-none ${size === 'xl' ? 'text-xs mt-1' : size === 'sm' ? 'text-[6px] mt-0.5' : 'text-[6.5px] mt-0.5'}`}>
            DANGDUT
          </span>
        </div>
      );
    }

    // 5. RADIO ELSHINTA
    if (id.includes('elshinta') || name.includes('elshinta')) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950 text-white p-1 text-center border-t-2 border-red-500 shadow-inner overflow-hidden select-none">
          <Mic2 className={size === 'xl' ? 'w-10 h-10 mb-1 text-red-400' : size === 'sm' ? 'w-3 h-3 mb-0.5 text-red-400' : 'w-3.5 h-3.5 mb-0.5 text-red-400'} />
          <span className={`font-black tracking-normal leading-none max-w-full truncate px-0.5 ${size === 'xl' ? 'text-2xl' : size === 'sm' ? 'text-[7.5px]' : 'text-[9px]'}`}>
            ELSHINTA
          </span>
          <span className={`font-bold text-red-400 tracking-wider uppercase leading-none ${size === 'xl' ? 'text-xs mt-1' : size === 'sm' ? 'text-[6px] mt-0.5' : 'text-[6.5px] mt-0.5'}`}>
            NEWS TALK
          </span>
        </div>
      );
    }

    // 6. SUARA SURABAYA (e100)
    if (id.includes('suara-surabaya') || name.includes('suara surabaya')) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-700 via-red-800 to-slate-950 text-white p-1 text-center shadow-inner overflow-hidden select-none">
          <div className="flex items-center justify-center gap-1 leading-none">
            <span className={`font-black text-amber-400 ${size === 'xl' ? 'text-3xl' : size === 'sm' ? 'text-xs' : 'text-sm'}`}>
              SS
            </span>
            <span className={`font-extrabold ${size === 'xl' ? 'text-xl' : size === 'sm' ? 'text-[8.5px]' : 'text-[10.5px]'}`}>
              e100
            </span>
          </div>
          <span className={`font-bold text-slate-200 uppercase tracking-wider leading-none ${size === 'xl' ? 'text-xs mt-1.5' : size === 'sm' ? 'text-[6px] mt-0.5' : 'text-[7px] mt-0.5'}`}>
            SURABAYA
          </span>
        </div>
      );
    }

    // 7. SUARA GIRI FM GRESIK
    if (id.includes('giri') || name.includes('giri')) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-600 via-emerald-700 to-yellow-800 text-white p-1 text-center shadow-inner overflow-hidden select-none">
          <Waves className={size === 'xl' ? 'w-10 h-10 mb-1 text-yellow-300' : size === 'sm' ? 'w-3 h-3 mb-0.5 text-yellow-300' : 'w-3.5 h-3.5 mb-0.5 text-yellow-300'} />
          <span className={`font-black tracking-tight leading-none max-w-full truncate px-0.5 ${size === 'xl' ? 'text-2xl' : size === 'sm' ? 'text-[7.5px]' : 'text-[9px]'}`}>
            SUARA GIRI
          </span>
          <span className={`font-bold text-yellow-300 leading-none ${size === 'xl' ? 'text-xs mt-1' : size === 'sm' ? 'text-[6.5px] mt-0.5' : 'text-[7px] mt-0.5'}`}>
            98.4 FM
          </span>
        </div>
      );
    }

    // 8. RADIO RODJA
    if (id.includes('rodja') || name.includes('rodja')) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 text-white p-1 text-center border border-amber-500/40 shadow-inner overflow-hidden select-none">
          <HeartHandshake className={size === 'xl' ? 'w-10 h-10 mb-1 text-amber-300' : size === 'sm' ? 'w-3 h-3 mb-0.5 text-amber-300' : 'w-3.5 h-3.5 mb-0.5 text-amber-300'} />
          <span className={`font-black tracking-wider text-amber-300 leading-none ${size === 'xl' ? 'text-2xl' : size === 'sm' ? 'text-[8px]' : 'text-[9.5px]'}`}>
            RODJA
          </span>
          <span className={`font-semibold text-emerald-200 leading-none ${size === 'xl' ? 'text-xs mt-1' : size === 'sm' ? 'text-[6px] mt-0.5' : 'text-[6.5px] mt-0.5'}`}>
            756 AM
          </span>
        </div>
      );
    }

    // 9. ARDAN FM BANDUNG
    if (id.includes('ardan') || name.includes('ardan')) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-800 text-white p-1 text-center shadow-inner overflow-hidden select-none">
          <Sparkles className={size === 'xl' ? 'w-10 h-10 mb-1 text-yellow-300' : size === 'sm' ? 'w-3 h-3 mb-0.5 text-yellow-300' : 'w-3.5 h-3.5 mb-0.5 text-yellow-300'} />
          <span className={`font-black tracking-normal leading-none max-w-full truncate px-0.5 ${size === 'xl' ? 'text-2xl' : size === 'sm' ? 'text-[8px]' : 'text-[9.5px]'}`}>
            ARDAN
          </span>
          <span className={`font-bold text-pink-200 leading-none ${size === 'xl' ? 'text-xs mt-1' : size === 'sm' ? 'text-[6px] mt-0.5' : 'text-[7px] mt-0.5'}`}>
            105.9 FM
          </span>
        </div>
      );
    }

    // 10. RRI (RADIO REPUBLIK INDONESIA)
    if (id.includes('rri') || name.includes('rri')) {
      const proMatch = name.match(/pro\s*(\d)/i);
      const proNum = proMatch ? `PRO ${proMatch[1]}` : (name.includes('voi') ? 'VOI' : (name.includes('5') || name.includes('ch5')) ? 'CH 5' : 'RRI');
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 via-blue-900 to-indigo-950 text-white p-1 text-center shadow-inner overflow-hidden select-none">
          <span className={`font-black tracking-wider text-blue-200 leading-none ${size === 'xl' ? 'text-3xl' : size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
            RRI
          </span>
          <span className={`font-black px-1 py-0.5 rounded bg-red-600 text-white leading-none ${size === 'xl' ? 'text-xs mt-1.5' : size === 'sm' ? 'text-[6px] mt-0.5' : 'text-[7px] mt-0.5'}`}>
            {proNum}
          </span>
        </div>
      );
    }

    // 11. GENERAL / CATEGORY-BASED FALLBACK
    const isDangdut = station.category === 'Dangdut' || name.includes('dangdut') || name.includes('koplo') || name.includes('campursari');
    const isReligi = station.category === 'Religi & Inspirasi' || name.includes('quran') || name.includes('islam') || name.includes('hidayah');
    const isNews = station.category === 'Berita & Talk' || name.includes('news') || name.includes('suara');

    // Clean short name for badge
    const shortName = station.name
      .replace(/^Radio\s+/i, '')
      .replace(/^LPPL\s+/i, '')
      .replace(/\s*\d+(\.\d+)?\s*(FM|AM)?/i, '')
      .trim();

    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr ${station.accentGradient || 'from-red-600 to-rose-800'} text-white p-1 text-center shadow-inner overflow-hidden select-none`}>
        {isDangdut ? (
          <Flame className={size === 'xl' ? 'w-10 h-10 mb-1 text-amber-300' : size === 'sm' ? 'w-3 h-3 mb-0.5 text-amber-300' : 'w-3.5 h-3.5 mb-0.5 text-amber-300'} />
        ) : isReligi ? (
          <HeartHandshake className={size === 'xl' ? 'w-10 h-10 mb-1 text-emerald-300' : size === 'sm' ? 'w-3 h-3 mb-0.5 text-emerald-300' : 'w-3.5 h-3.5 mb-0.5 text-emerald-300'} />
        ) : isNews ? (
          <Mic2 className={size === 'xl' ? 'w-10 h-10 mb-1 text-sky-300' : size === 'sm' ? 'w-3 h-3 mb-0.5 text-sky-300' : 'w-3.5 h-3.5 mb-0.5 text-sky-300'} />
        ) : (
          <Radio className={size === 'xl' ? 'w-10 h-10 mb-1 text-white' : size === 'sm' ? 'w-3 h-3 mb-0.5 text-white' : 'w-3.5 h-3.5 mb-0.5 text-white'} />
        )}
        
        <span className={`font-black tracking-normal leading-none max-w-full truncate px-0.5 ${size === 'xl' ? 'text-2xl' : size === 'sm' ? 'text-[7.5px]' : 'text-[8.5px]'}`}>
          {shortName.length > 10 && size !== 'xl'
            ? shortName.substring(0, 9) + '..'
            : shortName}
        </span>
        
        <span className={`font-bold text-white/85 leading-none ${size === 'xl' ? 'text-xs mt-1 font-mono' : size === 'sm' ? 'text-[6px] mt-0.5' : 'text-[6.5px] mt-0.5'}`}>
          {station.frequency}
        </span>
      </div>
    );
  };

  return (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 overflow-hidden select-none transition-transform duration-200 ${
        sizeClasses[size]
      } ${className}`}
    >
      {hasImage ? (
        <div className="w-full h-full bg-slate-800 flex items-center justify-center border border-slate-700/60 p-1">
          <img
            src={station.logo}
            alt={`Logo ${station.name}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        renderBrandBadge()
      )}

      {/* Live Active Status Indicator Dot */}
      {isPlaying && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-900 ring-2 ring-slate-900 z-10">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
        </span>
      )}
    </div>
  );
};
