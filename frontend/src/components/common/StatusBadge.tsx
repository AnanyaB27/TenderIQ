import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, ShieldAlert, ShieldCheck } from 'lucide-react';

export type StatusType = 
  | 'PASS' 
  | 'FAIL' 
  | 'UNKNOWN' 
  | 'ELIGIBLE' 
  | 'INELIGIBLE' 
  | 'REVIEW' 
  | 'VALID' 
  | 'HIGH' 
  | 'MEDIUM' 
  | 'LOW' 
  | 'UNAVAILABLE'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const normalized = (status || '').toUpperCase();
  const displayLabel = label || status;

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let IconComponent = HelpCircle;

  if (['PASS', 'ELIGIBLE', 'VALID'].includes(normalized)) {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    IconComponent = CheckCircle2;
  } else if (['FAIL', 'INELIGIBLE'].includes(normalized)) {
    colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    IconComponent = XCircle;
  } else if (['UNKNOWN', 'REVIEW', 'MEDIUM', 'LOW'].includes(normalized)) {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    IconComponent = AlertTriangle;
  } else if (['HIGH'].includes(normalized)) {
    colorClasses = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    IconComponent = ShieldCheck;
  }

  const sizeClasses = size === 'sm' 
    ? 'text-[11px] px-2 py-0.5 gap-1' 
    : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border font-mono tracking-wide ${sizeClasses} ${colorClasses} ${className}`}
      role="status"
      aria-label={`Status: ${displayLabel}`}
    >
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{displayLabel}</span>
    </span>
  );
};
