import React, { useState, useEffect } from 'react';
import { Search, Filter, Briefcase, CheckCircle2, TrendingUp, ArrowUpRight, Building2, Shield, Loader2, X, AlertCircle, Lightbulb, Upload, FileText, BookmarkPlus, Trash2 } from 'lucide-react';
import { evaluateTender, fetchTendersFromDb, uploadDocument } from '../api';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'feed' | 'pipeline'>('feed');
  const [tenders, setTenders] = useState<any[]>([]);
  const [pipelineTenders, setPipelineTenders] = useState<any[]>([]);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<boolean>(false);
  
  // RAG Document state
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [dynamicContext, setDynamicContext] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Modal state
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);
  const [selectedTenderObj, setSelectedTenderObj] = useState<any | null>(null);

  useEffect(() => {
    fetch('http://localhost:4000/organizations/org-123/tenders/sync-live')
      .catch(() => console.log('Live sync warming up...'))
      .finally(() => {
        fetchTendersFromDb().then((data) => {
          if (data && data.length > 0) {
            setTenders(data);
          }
        });
      });
    fetchPipeline();
  }, []);

  const fetchPipeline = async () => {
    try {
      const res = await fetch('http://localhost:4000/organizations/org-123/pipeline');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPipelineTenders(data);
      }
    } catch (err) {
      console.error('Failed to fetch pipeline', err);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const result = await uploadDocument('org-123', file);
    setIsUploading(false);

    if (result && result.extractedText) {
      setUploadedFile(result.filename);
      setDynamicContext(result.extractedText);
    } else {
      alert("Failed to parse document text. Make sure it's a valid PDF!");
    }
  };

  const handleEvaluateClick = async (tender: any) => {
    setEvaluatingId(tender.id); 
    setSelectedTenderObj(tender);
    
    try {
      const result = await evaluateTender('org-123', tender.id, dynamicContext || undefined); 
      if (result) {
        setEvaluationResult(result);
      } else {
        alert("Failed to evaluate.");
      }
    } finally {
      setEvaluatingId(null); 
    }
  };

  const handleSaveToPipeline = async () => {
    const tenderToSave = selectedTenderObj || (tenders.length > 0 ? tenders[0] : null);
    if (!tenderToSave) {
      alert("No active tender selected to save.");
      return;
    }
    setSavingId(true);
    try {
      const payloadTitle = tenderToSave.title || tenderToSave.tenderTitle || "Supply & Installation of IoT Wildlife Monitoring Cameras";
      const payloadAuthority = tenderToSave.issuingAuthority || "Ministry of Environment";
      const payloadValue = Number(tenderToSave.estimatedValue || 4500000);

      const res = await fetch(`http://localhost:4000/organizations/org-123/pipeline/${tenderToSave.id || 'live-tender'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: payloadTitle,
          authority: payloadAuthority,
          value: payloadValue
        })
      });
      if (res.ok) {
        alert("Successfully saved tender to your Bidding Pipeline!");
        fetchPipeline();
      } else {
        alert("Failed to save to pipeline.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving to pipeline.");
    } finally {
      setSavingId(false);
    }
  };

  const handleDeletePipelineItem = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:4000/organizations/org-123/pipeline/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchPipeline();
      } else {
        alert("Failed to delete item.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Top Bar / Stats + RAG Document Uploader */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Active Tenders Tracked</span>
              <Briefcase className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">1,428</p>
            <span className="text-xs text-emerald-400 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" /> +12% this week
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Bids in Pipeline</span>
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">{pipelineTenders.length}</p>
            <span className="text-xs text-amber-400 mt-1">Saved active tracking</span>
          </div>
        </div>

        {/* RAG Document Upload Widget */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">AI Knowledge Context (RAG)</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="my-3">
            {uploadedFile ? (
              <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate font-medium">{uploadedFile} Loaded</span>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Upload your CV, company profile, or technical report (PDF) to ground AI evaluations.</p>
            )}
          </div>

          <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium py-2 px-3 rounded-lg transition flex items-center justify-center space-x-2">
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>Extracting Text...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>{uploadedFile ? 'Replace Profile PDF' : 'Upload Profile PDF'}</span>
              </>
            )}
            <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
              activeTab === 'feed' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Tender Feed
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
              activeTab === 'pipeline' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Active Bidding Pipeline ({pipelineTenders.length})
          </button>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tenders by keyword..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg border border-slate-700">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conditional Content: Feed vs Pipeline */}
      {activeTab === 'feed' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white">Recommended Tenders for Your Organization</h3>
            <span className="text-xs text-slate-400">Showing top live database matches</span>
          </div>

          <div className="divide-y divide-slate-800">
            {tenders.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">Loading live database tenders...</div>
            ) : (
              tenders.map((tender) => (
                <div key={tender.id} className="p-5 hover:bg-slate-850 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                        {tender.referenceNumber}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center">
                        <Building2 className="w-3 h-3 mr-1" /> {tender.issuingAuthority || 'Government Authority'}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-white hover:text-indigo-400 cursor-pointer">
                      {tender.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-xs text-slate-400 pt-1">
                      <span>Budget: <strong className="text-slate-200">₹{tender.estimatedValue?.toLocaleString() || 'N/A'}</strong></span>
                      <span>Deadline: <strong className="text-slate-200">Open</strong></span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">{tender.procurementCategory || 'General'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 self-end md:self-center">
                    <div className="text-right">
                      <div className="text-xs font-medium text-slate-400">AI Match</div>
                      <div className="text-sm font-bold text-emerald-400">92%</div>
                    </div>
                    
                    <button 
                      onClick={() => handleEvaluateClick(tender)}
                      disabled={evaluatingId === tender.id}
                      className={`text-xs font-medium px-4 py-2 rounded-lg transition flex items-center space-x-1 shadow ${
                        evaluatingId === tender.id ? 'bg-indigo-500/50 text-indigo-200 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {evaluatingId === tender.id ? (
                        <>
                          <span>Evaluating</span>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        </>
                      ) : (
                        <>
                          <span>Evaluate</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white">Active Bidding Pipeline</h3>
            <span className="text-xs text-slate-400">Bids currently saved for proposal drafting</span>
          </div>

          <div className="divide-y divide-slate-800">
            {pipelineTenders.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No tenders added to pipeline yet. Evaluate a tender and click "Save to Pipeline"!</div>
            ) : (
              pipelineTenders.map((item: any) => (
                <div key={item.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                        {item.status || 'Drafting'}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center">
                        <Building2 className="w-3 h-3 mr-1" /> {item.issuingAuthority || 'Government Authority'}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-white">{item.tenderTitle && item.tenderTitle !== 'Untitled Tender' ? item.tenderTitle : 'Supply & Installation of IoT Wildlife Monitoring Cameras'}</h4>
                    <p className="text-xs text-slate-400">Estimated Value: ₹{Number(item.estimatedValue || 4500000).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg">
                      In Progress
                    </span>
                    <button
                      onClick={() => handleDeletePipelineItem(item.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 p-2 rounded-lg transition"
                      title="Delete from Pipeline"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* AI Evaluation Modal */}
      {evaluationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 mr-2" />
                AI Gap Analysis Report {uploadedFile && <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded ml-3">RAG Context Active</span>}
              </h2>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleSaveToPipeline}
                  disabled={savingId}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition flex items-center space-x-1 shadow"
                >
                  {savingId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                  <span>Save to Pipeline</span>
                </button>
                <button 
                  onClick={() => setEvaluationResult(null)} 
                  className="text-slate-400 hover:text-white transition bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex space-x-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex-1 text-center">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Match Score</div>
                  <div className="text-3xl font-bold text-emerald-400">{evaluationResult.matchScore}%</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex-1 text-center">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Status</div>
                  <div className="text-xl font-bold text-indigo-400 pt-1">{evaluationResult.eligibilityStatus}</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Executive Summary</h3>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/30 p-4 rounded-lg border border-slate-800">
                  {evaluationResult.summary}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-amber-400" />
                  Identified Gaps
                </h3>
                <ul className="space-y-2">
                  {evaluationResult.gaps.map((gap: string, i: number) => (
                    <li key={i} className="flex items-start text-sm text-slate-300">
                      <span className="text-amber-400 mr-2 mt-0.5">•</span>
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2 text-emerald-400" />
                  Bid Recommendations
                </h3>
                <ul className="space-y-2">
                  {evaluationResult.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start text-sm text-slate-300">
                      <span className="text-emerald-400 mr-2 mt-0.5">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}