import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, FileEdit, Info, Copy, Check, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { generateBidDraft, getBidDrafts, DraftResult } from '../api';

interface BidDraftingPanelProps {
  organizationId: string;
  tenderId: string;
  documentId: string;
}

const DRAFT_TYPES = [
  'Company Profile Overview',
  'Eligibility & Compliance Response',
  'Technical Approach',
  'Relevant Experience Summary'
];

export const BidDraftingPanel: React.FC<BidDraftingPanelProps> = ({ organizationId, tenderId, documentId }) => {
  const [drafts, setDrafts] = useState<DraftResult[]>([]);
  const [selectedType, setSelectedType] = useState<string>(DRAFT_TYPES[0]);
  const [activeDraft, setActiveDraft] = useState<DraftResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadDrafts();
  }, [organizationId, tenderId, documentId]);

  const loadDrafts = async () => {
    const existing = await getBidDrafts(organizationId, tenderId, documentId);
    setDrafts(existing);
    const match = existing.find(d => d.draftType === selectedType);
    if (match) {
      setActiveDraft(match);
      setEditableContent(match.content);
    }
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    const match = drafts.find(d => d.draftType === type);
    setActiveDraft(match || null);
    setEditableContent(match ? match.content : '');
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const result = await generateBidDraft(organizationId, tenderId, documentId, selectedType);
    if (result) {
      setActiveDraft(result);
      setEditableContent(result.content);
      await loadDrafts(); // refresh list
    } else {
      alert("Failed to generate draft. Please ensure the document is fully processed and profile is set.");
    }
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="enterprise-card p-6 sm:p-8 border-slate-800/80 mt-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <FileEdit className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              AI-Assisted Bid Drafting Studio
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Generate conservative, non-hallucinatory draft sections based strictly on verified evidence and profile data.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full w-fit">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini RAG Assistant</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Controls */}
        <div className="lg:col-span-1 space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Select Proposal Section
          </label>
          <div className="space-y-1.5">
            {DRAFT_TYPES.map(type => {
              const hasDraft = drafts.some(d => d.draftType === type);
              const isSelected = selectedType === type;
              return (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs rounded-xl transition border flex items-center justify-between ${
                    isSelected 
                      ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/40 text-cyan-300 font-semibold shadow-inner' 
                      : 'bg-surface-950/70 border-slate-800 text-slate-400 hover:text-white hover:bg-surface-850'
                  }`}
                >
                  <span className="truncate">{type}</span>
                  {hasDraft && <span className="text-emerald-400 font-mono text-xs font-bold">✓</span>}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full mt-2 flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-cyan-200" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 mr-2 text-cyan-300" />
                <span>Generate Draft Section</span>
              </>
            )}
          </button>
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-3">
          {!activeDraft ? (
            <div className="h-72 flex flex-col items-center justify-center bg-surface-950/60 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs p-6 text-center space-y-2">
              <Layers className="w-8 h-8 text-slate-600" />
              <p className="font-medium text-slate-300">No draft generated for this section yet.</p>
              <p className="text-slate-500 max-w-sm">Click "Generate Draft Section" to query the RAG extraction pipeline and synthesize this proposal section.</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Review Guidance Banner */}
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3.5 text-xs text-cyan-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
                <div>
                  <strong className="text-cyan-200">Assistive Draft — Human Verification Required.</strong> 
                  <p className="mt-0.5 text-cyan-300/80 leading-relaxed">
                    Verify all claims and substitute any <span className="font-mono bg-surface-950 px-1.5 py-0.5 rounded text-cyan-200 border border-cyan-500/30">[USER INPUT REQUIRED]</span> markers prior to formal bid submission.
                  </p>
                </div>
              </div>

              {/* Missing Information Callout */}
              {activeDraft.missingInformation.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 text-xs text-amber-300 space-y-1.5">
                  <strong className="flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0"/> 
                    <span>Missing Factual Organization Telemetry:</span>
                  </strong>
                  <ul className="list-disc pl-5 space-y-0.5 text-amber-300/80">
                    {activeDraft.missingInformation.map((info, i) => <li key={i}>{info}</li>)}
                  </ul>
                </div>
              )}

              {/* Editable Textarea */}
              <div className="relative">
                <textarea
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  className="w-full h-80 p-4 bg-surface-950/90 border border-slate-800 rounded-xl shadow-inner focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-sans text-xs sm:text-sm text-slate-200 leading-relaxed resize-y"
                  placeholder="Draft content..."
                />
                <button 
                  onClick={handleCopy}
                  className="absolute top-3 right-3 p-2 bg-surface-900 hover:bg-surface-850 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition shadow-sm flex items-center gap-1.5 text-xs"
                  title="Copy to Clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Provenance Metadata */}
              {activeDraft.usedSources.length > 0 && (
                <div className="text-xs text-slate-400 bg-surface-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="font-mono text-[11px] uppercase text-slate-500 font-semibold block">
                    Grounded Sources & Evidentiary Citations:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {activeDraft.usedSources.map((src, i) => (
                      <span key={i} className="font-mono text-[11px] bg-surface-900 border border-slate-800 text-slate-300 px-2.5 py-0.5 rounded">
                        {src}
                      </span>
                    ))}
                    <span className="font-mono text-[11px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified Organization Profile
                    </span>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};