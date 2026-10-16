import React, { useEffect, useState } from 'react';
import { fetchTenders, evaluateTender, Tender, EvaluationResult } from '../services/tenderService';
import { Building2, Calendar, DollarSign, Award, X, CheckCircle2, AlertTriangle, Lightbulb, Loader2, ArrowRight } from 'lucide-react';
import { StatusBadge } from './common/StatusBadge';

export function TenderFeed() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  useEffect(() => {
    fetchTenders().then((data) => {
      setTenders(data);
      setLoading(false);
    });
  }, []);

  const handleEvaluate = async (tenderId: string) => {
    setEvaluatingId(tenderId);
    // Sample organization UUID for testing the AI evaluation workflow
    const orgId = localStorage.getItem('activeOrganizationId') || 'org-sample-uuid';
    const result = await evaluateTender(orgId, tenderId);
    setEvaluation(result);
    setEvaluatingId(null);
  };

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        <span className="text-xs font-mono">Synchronizing live tenders from NestJS backend...</span>
      </div>
    );
  }

  if (tenders.length === 0) {
    return (
      <div className="enterprise-card p-12 text-center text-slate-400 text-xs sm:text-sm space-y-2">
        <p className="font-semibold text-slate-200">No active government tenders synchronized.</p>
        <p className="text-slate-500">Ensure your NestJS backend on port 4000 is active and seeded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Active Government Tenders</h2>
          <p className="text-xs text-slate-400 mt-0.5">Automated synchronization feed</p>
        </div>
        <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs font-mono font-semibold text-cyan-400">
          {tenders.length} Live Opportunities
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {tenders.map((tender) => (
          <div key={tender.id} className="enterprise-card p-6 flex flex-col justify-between hover:border-cyan-500/30 transition duration-200">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 text-[11px] font-mono font-medium text-cyan-400">
                  {tender.status || 'Active'}
                </span>
                <div className="flex items-center text-emerald-400 font-semibold text-xs font-mono">
                  <Award className="mr-1 h-3.5 w-3.5" />
                  Vector Ready
                </div>
              </div>
              
              <h3 className="text-sm font-bold text-white line-clamp-2">{tender.title}</h3>
              {tender.description && (
                <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">{tender.description}</p>
              )}
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-800/80 pt-4">
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center truncate">
                  <Building2 className="mr-2 h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{tender.organization}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span>Deadline: {tender.deadline}</span>
                </div>
                <div className="flex items-center font-mono text-slate-300">
                  <DollarSign className="mr-2 h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span>Value: {tender.value}</span>
                </div>
              </div>

              <button
                onClick={() => handleEvaluate(tender.id)}
                disabled={evaluatingId === tender.id}
                className="w-full mt-2 bg-surface-950 hover:bg-cyan-500 hover:text-surface-950 border border-slate-700 hover:border-cyan-400 disabled:opacity-50 text-slate-200 font-semibold py-2.5 rounded-xl text-xs transition duration-200 shadow-sm flex items-center justify-center gap-1.5"
              >
                {evaluatingId === tender.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating Deterministic Rules...</span>
                  </>
                ) : (
                  <>
                    <span>Evaluate Eligibility</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Evaluation Modal */}
      {evaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-surface-900 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <StatusBadge status={evaluation.eligibilityStatus} size="sm" />
                <h3 className="text-xl font-bold text-white tracking-tight mt-2">
                  AI Eligibility & Gap Analysis
                </h3>
              </div>
              <button
                onClick={() => setEvaluation(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-surface-850 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between bg-surface-950 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300 font-medium">Composite Semantic Match Score</span>
                <span className="text-2xl font-extrabold text-cyan-400 font-mono">{evaluation.matchScore}%</span>
              </div>

              <div>
                <h4 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Executive Determination Summary
                </h4>
                <p className="text-xs text-slate-200 bg-surface-950/70 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
                  {evaluation.summary}
                </p>
              </div>

              <div>
                <h4 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> 
                  <span>Identified Compliance & Technical Gaps</span>
                </h4>
                <ul className="space-y-1.5">
                  {evaluation.gaps.map((gap, i) => (
                    <li key={i} className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 shrink-0" /> 
                  <span>Strategic Recommendations</span>
                </h4>
                <ul className="space-y-1.5">
                  {evaluation.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800/80">
              <button
                onClick={() => setEvaluation(null)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition shadow-md shadow-cyan-500/20"
              >
                Close Audit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}