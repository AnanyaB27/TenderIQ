import React from 'react';
import { ShieldAlert, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

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

  const levelColor = 
    confidence.level === 'HIGH' ? 'bg-green-100 text-green-800 border-green-200' :
    confidence.level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
    confidence.level === 'LOW' ? 'bg-orange-100 text-orange-800 border-orange-200' :
    'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6 mt-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <ShieldAlert className="w-5 h-5 mr-2 text-indigo-600" /> Evaluation Confidence & Risk Indicators
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Indicates how completely the evaluation is supported by processed evidence. Not a bid-success prediction.
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${levelColor}`}>
          Confidence: {confidence.level}
        </span>
      </div>

      {/* Confidence Reasons */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Deterministic Assessment Basis</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          {confidence.reasons.map((reason, idx) => (
            <li key={idx}>{reason}</li>
          ))}
        </ul>
      </div>

      {/* Risk Indicators */}
      {riskFlags.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Identified Risk Indicators ({riskFlags.length})</h3>
          <div className="space-y-3">
            {riskFlags.map((flag, idx) => {
              const severityColor = 
                flag.severity === 'HIGH' ? 'bg-red-50 border-red-200 text-red-900' :
                flag.severity === 'MEDIUM' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                'bg-blue-50 border-blue-200 text-blue-900';

              return (
                <div key={idx} className={`p-4 rounded-lg border text-sm ${severityColor}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">{flag.title}</span>
                    <span className="text-xs font-mono uppercase bg-white/60 px-2 py-0.5 rounded border">
                      {flag.category} [{flag.severity}]
                    </span>
                  </div>
                  <p className="text-xs mt-1 opacity-90">{flag.explanation}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};