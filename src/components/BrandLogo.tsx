import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
}) => {
  const sizeMap = {
    sm: { box: 'w-8 h-8', icon: 32 },
    md: { box: 'w-10 h-10', icon: 40 },
    lg: { box: 'w-14 h-14', icon: 56 },
    xl: { box: 'w-24 h-24', icon: 96 },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-2xl overflow-hidden shadow-lg shadow-red-950/40 border border-red-500/20 bg-[#0b0e24] ${currentSize.box}`}
      >
        <img
          src="/icon.svg"
          alt="Radio Hit Indonesia Logo"
          className="w-full h-full object-contain p-0.5 select-none pointer-events-none"
          loading="eager"
        />
        {/* Subtle Live pulse dot */}
        <span className="absolute top-1 right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-base sm:text-lg font-black italic tracking-wide text-white font-sans">
              RADIO HIT <span className="text-red-500">INDONESIA</span>
            </span>
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-600/30 text-red-400 border border-red-500/40">
              LIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 -mt-0.5 font-medium">
            Streaming Musik & Berita Populer
          </p>
        </div>
      )}
    </div>
  );
};
