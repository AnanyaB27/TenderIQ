import React, { useEffect, useState } from 'react';
import { fetchTenders, evaluateTender, uploadCustomTender, Tender, EvaluationResult } from '../services/tenderService';
import { Building2, Calendar, DollarSign, Award, X, CheckCircle2, AlertTriangle, Lightbulb, Loader2, ArrowRight, Plus, Upload, FileText } from 'lucide-react';
import { StatusBadge } from './common/StatusBadge';

export function TenderFeed() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Evaluation State
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  // Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadTenders = async () => {
    setLoading(true);
    const data = await fetchTenders();
    setTenders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTenders();
  }, []);

  const handleEvaluate = async (tenderId: string) => {
    setEvaluatingId(tenderId);
    const orgId = localStorage.getItem('activeOrganizationId');
    if (!orgId) {
      alert("Organization session expired. Please log in again.");
      setEvaluatingId(null);
      return;
    }
    const result = await evaluateTender(orgId, tenderId);
    setEvaluation(result);
    setEvaluatingId(null);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Please select a PDF document to upload.");
      return;
    }
    if (uploadFile.type !== "application/pdf") {
      setUploadError("Only PDF format is supported for tender documents.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const newTender = await uploadCustomTender(uploadFile, uploadTitle);
      
      // Inject the newly created tender at the top of the feed
      setTenders(prev => [newTender, ...prev]);
      
      // Reset and close modal
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadTitle("");
    } catch (err: any) {
      setUploadError(err.message || "An error occurred while uploading the document.");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        <span className="text-xs font-mono">Synchronizing live tenders from NestJS backend...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Active Government Tenders</h2>
          <p className="text-xs text-slate-400 mt-0.5">Automated synchronization & custom uploads</p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 text-xs font-mono font-semibold text-cyan-400">
            {tenders.length} Opportunities
          </span>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-surface-900 hover:bg-cyan-500 hover:text-surface-950 border border-slate-700 hover:border-cyan-400 text-slate-200 font-semibold px-3 py-1.5 rounded-full text-xs transition duration-200 shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Private Tender</span>
          </button>
        </div>
      </div>

      {tenders.length === 0 ? (
        <div className="enterprise-card p-12 text-center text-slate-400 text-xs sm:text-sm space-y-4">
          <p className="font-semibold text-slate-200">No active tenders found for your organization.</p>
          <p className="text-slate-500">Upload a custom RFP PDF to begin your first evaluation.</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mx-auto bg-cyan-500 hover:bg-cyan-400 text-surface-950 font-semibold px-4 py-2 rounded-xl text-xs transition duration-200 shadow-sm flex items-center justify-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            <span>Upload PDF</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tenders.map((tender) => (
            <div key={tender.id} className="enterprise-card p-6 flex flex-col justify-between hover:border-cyan-500/30 transition duration-200 relative overflow-hidden">
              {/* Optional: Indicator for Custom Uploads based on reference number pattern */}
              {tender.referenceNumber?.startsWith('CUSTOM-') && (
                <div className="absolute top-0 right-0 bg-indigo-500/20 text-indigo-300 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-bl-lg border-b border-l border-indigo-500/30">
                  Private Upload
                </div>
              )}
              
              <div>
                <div className="flex items-center justify-between mb-3 mt-1">
                  <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 text-[11px] font-mono font-medium text-cyan-400">
                    {tender.status || 'Active'}
                  </span>
                  <div className="flex items-center text-emerald-400 font-semibold text-xs font-mono">
                    <Award className="mr-1 h-3.5 w-3.5" />
                    Vector Ready
                  </div>
                </div>
                
                <h3 className="text-sm font-bold text-white line-clamp-2 pr-2">{tender.title}</h3>
                {tender.description && (
                  <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">{tender.description}</p>
                )}
              </div>

              <div className="mt-6 space-y-3 border-t border-slate-800/80 pt-4">
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center truncate">
                    <Building2 className="mr-2 h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{tender.issuingAuthority || 'Private Organization'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span>Deadline: {tender.submissionDeadline ? new Date(tender.submissionDeadline).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex items-center font-mono text-slate-300">
                    <DollarSign className="mr-2 h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span>Value: {tender.estimatedValue ? tender.estimatedValue.toLocaleString() : 'Undisclosed'}</span>
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
      )}

      {/* Custom Tender Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-surface-900 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Upload Tender PDF</h3>
                <p className="text-xs text-slate-400 mt-1">Isolate a custom RFP for private evaluation.</p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-surface-850 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-500/10 text-rose-400 text-xs border border-rose-500/30 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Tender Title (Optional)
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g., 2026 Solar Infrastructure RFP"
                  className="w-full bg-surface-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Official Document (PDF)
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    required
                  />
                  <div className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-colors flex flex-col items-center justify-center space-y-2 ${uploadFile ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-slate-700 bg-surface-950/50 group-hover:border-slate-500'}`}>
                    <FileText className={`w-8 h-8 ${uploadFile ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <div className="text-sm font-medium text-slate-300">
                      {uploadFile ? uploadFile.name : 'Click to browse or drag PDF here'}
                    </div>
                    {uploadFile && (
                      <div className="text-xs text-slate-500 font-mono">
                        {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800/80">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-md shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Ingesting PDF...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload & Process</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Evaluation Modal */}
      {evaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-surface-900 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
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