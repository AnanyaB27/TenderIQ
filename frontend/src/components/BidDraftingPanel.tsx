import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, FileEdit, Info, Copy, Save } from 'lucide-react';
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FileEdit className="w-5 h-5 mr-2 text-indigo-600" /> AI-Assisted Bid Drafting
          </h2>
          <p className="text-sm text-gray-500 mt-1">Generate conservative starting drafts based on your verified factual profile.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Controls */}
        <div className="lg:col-span-1 space-y-4">
          <label className="block text-sm font-medium text-gray-700">Select Draft Section</label>
          <div className="space-y-2">
            {DRAFT_TYPES.map(type => {
              const hasDraft = drafts.some(d => d.draftType === type);
              return (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className={`w-full text-left px-3 py-2 text-sm rounded transition border ${
                    selectedType === type ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {type} {hasDraft && '✓'}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded shadow-sm disabled:opacity-50 transition"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isGenerating ? 'Drafting...' : 'Generate New Draft'}
          </button>
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-3">
          {!activeDraft ? (
            <div className="h-64 flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded text-gray-500 text-sm">
              No draft generated yet for this section. Click Generate.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Safety Banners */}
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800 flex items-start">
                <Info className="w-5 h-5 mr-2 shrink-0 text-blue-500" />
                <div>
                  <strong>AI-Generated Draft — Review Required.</strong> 
                  <p className="mt-1">This text is an assistive starting point. You must manually verify all claims and replace any <span className="font-mono bg-blue-100 px-1 rounded">[USER INPUT REQUIRED]</span> placeholders before submission.</p>
                </div>
              </div>

              {activeDraft.missingInformation.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-800">
                  <strong className="flex items-center"><AlertTriangle className="w-4 h-4 mr-1 text-amber-500"/> Missing Factual Context:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-0.5 text-amber-700">
                    {activeDraft.missingInformation.map((info, i) => <li key={i}>{info}</li>)}
                  </ul>
                </div>
              )}

              {/* Editor */}
              <div className="relative">
                <textarea
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  className="w-full h-80 p-4 border border-gray-300 rounded-lg shadow-inner focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-sans text-sm text-gray-800"
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(editableContent)}
                  className="absolute top-2 right-2 p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded border border-gray-300 transition"
                  title="Copy to Clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              {/* Provenance Metadata */}
              {activeDraft.usedSources.length > 0 && (
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border border-gray-100">
                  <strong>Information Sources Relied Upon:</strong>
                  <div className="mt-1 space-x-2">
                    {activeDraft.usedSources.map((src, i) => (
                      <span key={i} className="inline-block bg-white border border-gray-200 px-2 py-0.5 rounded">{src}</span>
                    ))}
                    <span className="inline-block bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Verified Organization Profile</span>
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