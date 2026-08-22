import { useEffect, useState } from 'react';
import { fetchTenders, evaluateTender, Tender, EvaluationResult } from '../services/tenderService';
import { Building2, Calendar, DollarSign, Award, X, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

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
    const orgId = 'org-sample-uuid';
    const result = await evaluateTender(orgId, tenderId);
    setEvaluation(result);
    setEvaluatingId(null);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        Loading live tenders from backend...
      </div>
    );
  }

  if (tenders.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400">
        No active tenders found. Ensure your backend is running and seeded.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-white">Active Government Tenders</h2>
        <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400">
          {tenders.length} Live Tenders
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tenders.map((tender) => (
          <div key={tender.id} className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm transition hover:border-slate-700">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400">
                  {tender.status || 'Open'}
                </span>
                <div className="flex items-center text-emerald-400 font-semibold text-sm">
                  <Award className="mr-1 h-4 w-4" />
                  Match Ready
                </div>
              </div>
              
              <h3 className="mt-4 text-lg font-semibold text-white">{tender.title}</h3>
              {tender.description && (
                <p className="mt-2 text-sm text-slate-400 line-clamp-2">{tender.description}</p>
              )}
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-800 pt-4">
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center">
                  <Building2 className="mr-2 h-4 w-4 text-slate-500" />
                  <span className="truncate">{tender.organization}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-slate-500" />
                  Deadline: {tender.deadline}
                </div>
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-slate-500" />
                  Value: {tender.value}
                </div>
              </div>

              <button
                onClick={() => handleEvaluate(tender.id)}
                disabled={evaluatingId === tender.id}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-1.5"
              >
                <span>{evaluatingId === tender.id ? 'Evaluating AI Match...' : 'Evaluate Eligibility'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Evaluation Modal */}
      {evaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                  {evaluation.eligibilityStatus}
                </span>
                <h3 className="text-xl font-bold text-white mt-2">AI Eligibility & Gap Analysis</h3>
              </div>
              <button
                onClick={() => setEvaluation(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-sm text-slate-300 font-medium">Composite Match Score</span>
                <span className="text-2xl font-extrabold text-emerald-400">{evaluation.matchScore}%</span>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Executive Summary</h4>
                <p className="text-sm text-slate-200 bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">{evaluation.summary}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1.5" /> Identified Compliance & Technical Gaps
                </h4>
                <ul className="space-y-2">
                  {evaluation.gaps.map((gap, i) => (
                    <li key={i} className="text-xs text-slate-300 bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-lg flex items-start">
                      <span className="text-rose-400 mr-2 font-bold">•</span> {gap}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-1.5" /> Strategic Recommendations
                </h4>
                <ul className="space-y-2">
                  {evaluation.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-slate-300 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg flex items-start">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" /> {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setEvaluation(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-xl text-xs transition shadow-lg shadow-indigo-600/20"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}