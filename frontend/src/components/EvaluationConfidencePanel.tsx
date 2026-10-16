import React from 'react';
import { ShieldAlert, AlertCircle, CheckCircle, HelpCircle, ShieldCheck } from 'lucide-react';
import { StatusBadge } from './common/StatusBadge';

interface ConfidenceData {
  level: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNAVAILABLE';
  reasons: string[];
}

interface RiskFlag {
  category: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH';
  title: string;
  explanation: string;
}

interface EvaluationConfidencePanelProps {
  confidence?: ConfidenceData;
  riskFlags?: RiskFlag[];
}

export const EvaluationConfidencePanel: React.FC<EvaluationConfidencePanelProps> = ({ confidence, riskFlags = [] }) => {
  if (!confidence) return null;

  return (
    <div className="enterprise-card p-6 border-slate-800/80 space-y-6 mt-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Evaluation Confidence & Risk Telemetry
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Indicates evidentiary completeness of processed RFP clauses. Does NOT represent probability of winning.
          </p>
        </div>
        <StatusBadge status={confidence.level} label={`Confidence: ${confidence.level}`} size="md" />
      </div>

      {/* Confidence Reasons */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
          Deterministic Assessment Foundation
        </h3>
        <ul className="space-y-1.5 text-xs text-slate-300">
          {confidence.reasons.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-surface-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-cyan-400 font-bold">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Risk Indicators */}
      {riskFlags.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
            Identified Risk Indicators ({riskFlags.length})
          </h3>
          <div className="space-y-2.5">
            {riskFlags.map((flag, idx) => {
              const isHigh = flag.severity === 'HIGH';
              const isMedium = flag.severity === 'MEDIUM';

              return (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                    isHigh 
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
                      : isMedium 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                        : 'bg-surface-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">{flag.title}</span>
                    <span className="font-mono text-[10px] uppercase bg-surface-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                      {flag.category} [{flag.severity}]
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">{flag.explanation}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};