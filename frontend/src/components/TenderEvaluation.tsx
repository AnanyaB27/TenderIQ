import React, { useState, useEffect } from 'react';
import { 
  getTenderEvaluation, 
  evaluateTender, 
  generateBidDraft, 
  EvaluationResult, 
  RuleResult, 
  DraftResult 
} from '../api';
import { 
  FileText, 
  Loader2, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  FileCheck2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { StatusBadge } from './common/StatusBadge';

interface TenderEvaluationProps {
  organizationId: string;
  tenderId: string;
  documentId?: string;
  tenderTitle?: string;
  onBack?: () => void;
}

export const TenderEvaluation: React.FC<TenderEvaluationProps> = ({ 
  organizationId, 
  tenderId: rawTenderId, 
  documentId: propDocumentId,
  tenderTitle = 'Unknown Tender',
  onBack
}) => {
  // Keep the tender ID and document ID separate. Never fall back to tenderId:
  // the evaluation API requires the ID of the TenderDocument record.
  const tenderId = rawTenderId;
  const storedSelectedTenderId = sessionStorage.getItem('dashboard_selectedTenderId');
  const storedDocumentId = sessionStorage.getItem('dashboard_documentId');
  const storedDocumentTenderId = sessionStorage.getItem('dashboard_documentTenderId');

  const documentId =
    propDocumentId && propDocumentId !== tenderId
      ? propDocumentId
      : storedSelectedTenderId === tenderId &&
          storedDocumentTenderId === tenderId &&
          storedDocumentId &&
          storedDocumentId !== tenderId
        ? storedDocumentId
        : undefined;

  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Drafting State
  const [draft, setDraft] = useState<DraftResult | null>(null);
  const [isDrafting, setIsDrafting] = useState<boolean>(false);
  const [draftType, setDraftType] = useState<string>('Executive Summary');
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);

  useEffect(() => {
    async function fetchEvaluation() {
      setLoading(true);
      setError(null);

      if (!organizationId || !tenderId || !documentId || documentId === tenderId) {
        setEvaluation(null);
        setError('This tender has no valid linked document ID. Return to the dashboard, upload the tender PDF again, and retry.');
        setLoading(false);
        return;
      }

      try {
        const data = await getTenderEvaluation(organizationId, tenderId, documentId);
        setEvaluation(data);
      } catch (err) {
        setEvaluation(null);
      } finally {
        setLoading(false);
      }
    }
    fetchEvaluation();
  }, [organizationId, tenderId, documentId]);

  const handleRunEvaluation = async () => {
    if (!documentId || documentId === tenderId) {
      setError('Cannot evaluate: the separate TenderDocument ID is missing or invalid. Return to the dashboard and upload the PDF again.');
      return;
    }

    setEvaluating(true);
    setError(null);
    try {
      const data = await evaluateTender(organizationId, tenderId, documentId);
      setEvaluation(data);
    } catch (err) {
      setError('An error occurred while evaluating the tender against your organization profile.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!documentId || documentId === tenderId) {
      setError('Cannot generate a draft because the separate TenderDocument ID is missing or invalid. Upload the PDF again first.');
      return;
    }

    setIsDrafting(true);
    try {
      const result = await generateBidDraft(organizationId, tenderId, documentId, draftType);
      setDraft(result);
    } catch (err) {
      console.error(err);
      alert('Failed to generate draft proposal section.');
    } finally {
      setIsDrafting(false);
    }
  };

  const handleCopyDraft = () => {
    if (!draft?.content) return;
    navigator.clipboard.writeText(draft.content);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-20 space-y-4">
        <Loader2 className="animate-spin text-cyan-400 w-10 h-10"/>
        <span className="text-xs font-mono text-slate-400 tracking-wider">
          Retrieving deterministic evaluation audit...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enterprise-card p-6 border-rose-500/30 bg-rose-500/10 text-rose-300 max-w-5xl mx-auto my-6 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-rose-400">
          <AlertTriangle className="w-5 h-5" />
          <span>Evaluation Notice</span>
        </div>
        <p className="text-xs leading-relaxed text-slate-300">{error}</p>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="enterprise-card max-w-3xl mx-auto p-10 text-center border-slate-800/80 space-y-6 my-8">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-glow-cyan">
          <Layers className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Evaluation Readiness Required
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mt-2 leading-relaxed">
            This tender is ready for rule verification. Click below to execute the deterministic AI RuleEngine against your MSME profile.
          </p>
        </div>

        <button 
          onClick={handleRunEvaluation}
          disabled={evaluating}
          className={`px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm text-white flex items-center justify-center mx-auto transition shadow-lg shadow-cyan-500/20 ${
            evaluating 
              ? 'bg-surface-800 text-slate-500 cursor-not-allowed border border-slate-700' 
              : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500'
          }`}
        >
          {evaluating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-cyan-400"/>
              <span>Running Vectorized Rule Evaluation...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2 text-cyan-300" />
              <span>Execute AI Match Evaluation</span>
            </>
          )}
        </button>
      </div>
    );
  }

  const isEligible = evaluation.eligibilityStatus === 'ELIGIBLE';
  const isIneligible = evaluation.eligibilityStatus === 'INELIGIBLE';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* HEADER SECTION */}
      <header className="enterprise-card p-6 border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
              Deterministic Audit
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-mono text-slate-400">Target ID: {tenderId.slice(0, 8)}...</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Tender Compliance & Gap Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 line-clamp-1">
            Target: <span className="font-medium text-slate-200">{tenderTitle}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleRunEvaluation}
            disabled={evaluating}
            className="text-xs font-semibold bg-surface-850 hover:bg-surface-800 text-slate-300 hover:text-white border border-slate-700 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            {evaluating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400"/> : <RefreshCw className="w-3.5 h-3.5 text-cyan-400"/>}
            <span>Re-evaluate</span>
          </button>
        </div>
      </header>

      {/* COMPOSITE SUMMARY CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Match Score Card */}
        <div className="enterprise-card p-6 border-slate-800/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
            Semantic Match Score
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
              {evaluation.matchScore}
            </span>
            <span className="text-sm font-semibold text-slate-500 font-mono">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Multi-factor score based on strict criteria match and semantic domain proximity.
          </p>
        </div>

        {/* Eligibility Status Card */}
        <div className={`enterprise-card p-6 relative overflow-hidden ${
          isEligible ? 'border-emerald-500/30 bg-emerald-500/5' : 
          isIneligible ? 'border-rose-500/30 bg-rose-500/5' : 
          'border-amber-500/30 bg-amber-500/5'
        }`}>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
            Overall Eligibility Determination
          </span>
          <div className="mt-3">
            <StatusBadge 
              status={evaluation.eligibilityStatus} 
              size="md" 
              className="text-sm px-3.5 py-1"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            {isEligible 
              ? 'Meets all mandatory criteria with verified document citations.'
              : isIneligible 
                ? 'Failed one or more non-negotiable mandatory qualification clauses.'
                : 'Partial criteria verified; manual review advised for unconfirmed clauses.'}
          </p>
        </div>

        {/* Evidence Coverage Card */}
        <div className="enterprise-card p-6 border-slate-800/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
            Validated Evidence Coverage
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-cyan-400 tracking-tight font-mono">
              {evaluation.evidenceCoverage.toFixed(0)}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Ratio of qualification rules supported by verified document citations.
          </p>
        </div>
      </section>

      {/* RULE-BY-RULE AUDIT SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-cyan-400" />
              <span>Clause-by-Clause Rule Audit</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic validation of RFP requirements matched against MSME entity data.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-surface-900 border border-slate-800 px-3 py-1 rounded-full">
            {evaluation.ruleResults.length} Evaluated Rules
          </span>
        </div>

        <div className="space-y-3">
          {evaluation.ruleResults.map((rule) => (
            <EnterpriseRuleCard key={rule.rule_id} rule={rule} />
          ))}
        </div>
      </section>

      {/* AI BID DRAFTING SECTION */}
      <section className="enterprise-card p-6 sm:p-8 border-slate-800/80 relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>RAG-Grounded Drafter</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              AI Bid Proposal Drafting
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Synthesize factual proposal sections referencing validated tender evidence without hallucinations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select 
              value={draftType}
              onChange={(e) => setDraftType(e.target.value)}
              className="bg-surface-950 border border-slate-800 text-xs font-medium text-slate-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 cursor-pointer shadow-inner"
            >
              <option value="Executive Summary">Executive Summary</option>
              <option value="Technical Proposal">Technical Proposal Approach</option>
              <option value="Compliance Matrix">Compliance Matrix Statement</option>
            </select>

            <button 
              onClick={handleGenerateDraft}
              disabled={isDrafting}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              {isDrafting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-200"/>
                  <span>Synthesizing Draft...</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5"/>
                  <span>Generate Section Draft</span>
                </>
              )}
            </button>
          </div>
        </div>

        {draft && (
          <div className="enterprise-card border-slate-800/90 overflow-hidden shadow-2xl">
            <div className="bg-surface-850 px-5 py-3.5 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">Generated: {draft.draftType}</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  ID: {draft.id.slice(0, 8)}...
                </span>
              </div>

              <button
                onClick={handleCopyDraft}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-surface-900 border border-slate-700 hover:border-slate-600 px-3 py-1.5 rounded-lg transition"
              >
                {copiedDraft ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Draft</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="p-6 bg-surface-950/60 prose-dark">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {draft.content}
              </ReactMarkdown>
            </div>

            {(draft.warnings?.length > 0 || draft.missingInformation?.length > 0) && (
              <div className="bg-surface-900/90 px-6 py-4 border-t border-slate-800 space-y-4">
                {draft.warnings?.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                    <h4 className="font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0"/> 
                      <span>Deterministic Warnings</span>
                    </h4>
                    <ul className="list-disc pl-5 text-amber-300/90 space-y-1">
                      {draft.warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}
                {draft.missingInformation?.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
                    <h4 className="font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-1.5">
                      <Info className="w-3.5 h-3.5 shrink-0"/> 
                      <span>User Input & Missing Organization Telemetry</span>
                    </h4>
                    <ul className="list-disc pl-5 text-cyan-300/90 space-y-1">
                      {draft.missingInformation.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

    </div>
  );
};

const EnterpriseRuleCard: React.FC<{ rule: RuleResult }> = ({ rule }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`enterprise-card border transition-all duration-200 overflow-hidden ${
      expanded ? 'border-cyan-500/40 shadow-glow-cyan bg-surface-900' : 'border-slate-800/80 hover:border-slate-700'
    }`}>
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 bg-surface-900 hover:bg-surface-850 flex justify-between items-center focus:outline-none transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex-1 pr-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusBadge status={rule.status} size="sm" />
            
            {rule.is_mandatory && (
              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-[11px] font-semibold uppercase tracking-wider font-mono">
                Mandatory
              </span>
            )}
            
            <span className="text-[11px] text-slate-400 font-mono bg-surface-950 px-2 py-0.5 rounded border border-slate-800">
              {rule.requirement_type}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-white leading-snug">
            {rule.requirement_text}
          </h3>
        </div>

        <div className="text-slate-400 p-1 rounded-lg bg-surface-950 border border-slate-800 shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 py-5 bg-surface-950/70 border-t border-slate-800/80 text-xs space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-surface-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono font-semibold uppercase text-slate-400 tracking-wider">
                Organization Benchmark Value
              </span>
              <p className="text-xs font-medium text-slate-200 pt-0.5">
                {rule.organization_value || 'No value recorded in active MSME profile'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono font-semibold uppercase text-slate-400 tracking-wider">
                Deterministic RuleEngine Reasoning
              </span>
              <p className="text-xs text-slate-300 pt-0.5 leading-relaxed">
                {rule.reason}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2 text-slate-400">
              <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">
                Verifiable RFP Document Citations ({rule.evidence?.length || 0})
              </span>
            </div>

            {rule.evidence && rule.evidence.length > 0 ? (
              <div className="space-y-2.5">
                {rule.evidence.map((citation, idx) => (
                  <div key={idx} className="bg-surface-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <blockquote className="border-l-2 border-cyan-500 pl-3 text-slate-300 italic text-xs leading-relaxed">
                      "{citation.excerpt}"
                    </blockquote>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-1">
                      <span className="font-mono bg-surface-950 px-2 py-0.5 rounded border border-slate-800 text-cyan-300">
                        Page {citation.page_start}{citation.page_end > citation.page_start ? `-${citation.page_end}` : ''}
                      </span>
                      {citation.section_heading && (
                        <span className="truncate max-w-xs">
                          Section: <span className="font-medium text-slate-300">{citation.section_heading}</span>
                        </span>
                      )}
                      {citation.validation_status === 'VALID' && (
                        <span className="text-emerald-400 font-semibold font-mono flex items-center ml-auto">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Validated Ground Truth
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic bg-surface-900 p-3 rounded-xl border border-slate-800 text-xs">
                No direct citations extracted from the parsed document for this rule.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};