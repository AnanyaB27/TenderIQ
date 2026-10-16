import React from 'react';
import { Cpu, Sparkles } from 'lucide-react';

interface TenderIQLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const TenderIQLogo: React.FC<TenderIQLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const containerSizes = {
    sm: 'p-1.5 rounded-lg',
    md: 'p-2 rounded-xl',
    lg: 'p-3 rounded-2xl',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`relative ${containerSizes[size]} bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 shadow-lg shadow-cyan-500/20 border border-cyan-400/30 flex items-center justify-center`}
      >
        <Cpu className={`${iconSizes[size]} text-white`} />
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-300"></span>
        </span>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-tight text-white ${textSizes[size]}`}>
            Tender<span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">IQ</span>
          </span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            AI OS
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] text-slate-400 tracking-normal font-medium">
            AI Procurement Intelligence for MSMEs
          </span>
        )}
      </div>
    </div>
  );
};
