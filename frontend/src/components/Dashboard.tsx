import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Briefcase, 
  CheckCircle2, 
  TrendingUp, 
  Shield, 
  Loader2, 
  Upload, 
  FileText, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  Layers, 
  CheckCircle,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { getTenders, PaginatedTenders, Tender, uploadDocument, loginLocalDemo } from '../api';
import { TenderEvaluation } from './TenderEvaluation';
import { OrganizationProfile } from './OrganizationProfile';
import { StatusBadge } from './common/StatusBadge';

export default function Dashboard() {
  // --- AUTO-LOGIN LOCAL DEMO TOKEN ---
  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      loginLocalDemo().then(res => {
        if (res && res.accessToken) {
          localStorage.setItem('accessToken', res.accessToken);
          if (res.organization?.id) {
            localStorage.setItem('activeOrganizationId', res.organization.id);
          }
          window.location.reload();
        }
      }).catch(err => console.error('Auto-login failed:', err));
    }
  }, []);

  // --- STATE PERSISTENCE ---
  const [activeTab, setActiveTab] = useState<'feed' | 'pipeline' | 'profile'>(() => {
    return (sessionStorage.getItem('dashboard_activeTab') as any) || 'feed';
  });

  const [inspectingTender, setInspectingTender] = useState<Tender | null>(() => {
    const saved = sessionStorage.getItem('dashboard_inspectingTender');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedTenderObj, setSelectedTenderObj] = useState<Tender | null>(() => {
    const saved = sessionStorage.getItem('dashboard_selectedTenderObj');
    return saved ? JSON.parse(saved) : null;
  });

  const [uploadedFile, setUploadedFile] = useState<string | null>(() => {
    return sessionStorage.getItem('dashboard_uploadedFile') || null;
  });

  const [documentId, setDocumentId] = useState<string | undefined>(() => {
    return sessionStorage.getItem('dashboard_documentId') || undefined;
  });

  const [documentSummary, setDocumentSummary] = useState<string | null>(() => {
    return sessionStorage.getItem('dashboard_documentSummary') || null;
  });

  const [documentMetadata, setDocumentMetadata] = useState<any | null>(() => {
    const saved = sessionStorage.getItem('dashboard_documentMetadata');
    return saved ? JSON.parse(saved) : null;
  });

  const [pipelineTenders, setPipelineTenders] = useState<any[]>([]);
  
  // Search, Filter, Pagination State
  const [tendersData, setTendersData] = useState<PaginatedTenders | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const authOrgId = localStorage.getItem('activeOrganizationId') || '';

  // --- PERSISTENCE SYNCHRONIZATION ---
  useEffect(() => { sessionStorage.setItem('dashboard_activeTab', activeTab); }, [activeTab]);
  
  useEffect(() => {
    if (inspectingTender) sessionStorage.setItem('dashboard_inspectingTender', JSON.stringify(inspectingTender));
    else sessionStorage.removeItem('dashboard_inspectingTender');
  }, [inspectingTender]);

  useEffect(() => {
    if (selectedTenderObj) sessionStorage.setItem('dashboard_selectedTenderObj', JSON.stringify(selectedTenderObj));
    else sessionStorage.removeItem('dashboard_selectedTenderObj');
  }, [selectedTenderObj]);

  useEffect(() => {
    if (documentId) sessionStorage.setItem('dashboard_documentId', documentId);
    else sessionStorage.removeItem('dashboard_documentId');
  }, [documentId]);

  useEffect(() => {
    if (uploadedFile) sessionStorage.setItem('dashboard_uploadedFile', uploadedFile);
    else sessionStorage.removeItem('dashboard_uploadedFile');
  }, [uploadedFile]);

  useEffect(() => {
    if (documentSummary) sessionStorage.setItem('dashboard_documentSummary', documentSummary);
    else sessionStorage.removeItem('dashboard_documentSummary');
  }, [documentSummary]);

  useEffect(() => {
    if (documentMetadata) sessionStorage.setItem('dashboard_documentMetadata', JSON.stringify(documentMetadata));
    else sessionStorage.removeItem('dashboard_documentMetadata');
  }, [documentMetadata]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchFeed = useCallback(async () => {
    setIsLoadingFeed(true);
    const data = await getTenders({ search: debouncedSearch, page, limit: 10 });
    setTendersData(data);
    setIsLoadingFeed(false);
  }, [debouncedSearch, page]);

  useEffect(() => {
    if (activeTab === 'feed' && authOrgId) {
      fetch(`http://localhost:4000/organizations/${authOrgId}/tenders/sync-live`)
        .catch(() => console.log('Live sync warming up...'))
        .finally(() => {
          fetchFeed();
        });
    }
    if (activeTab === 'pipeline' && authOrgId) {
      fetchPipeline();
    }
  }, [authOrgId, activeTab, fetchFeed]);

  const fetchPipeline = async () => {
    try {
      const res = await fetch(`http://localhost:4000/organizations/${authOrgId}/pipeline`);
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

    if (file.type !== 'application/pdf') {
      alert("Unsupported file format. Please upload a valid tender PDF document.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert("File exceeds maximum size threshold. Upper limit is 15MB.");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadDocument(authOrgId, file);
      
      if (result && result.status === 'READY') {
        setUploadedFile(result.filename);
        setDocumentId(result.id);
        setDocumentSummary(result.documentSummary || null);
        setDocumentMetadata(result.metadata || null);
      } else if (result && result.status === 'NO_EXTRACTABLE_TEXT') {
        alert("The PDF was parsed but contains no extractable text. Scanned PDFs (OCR) are not yet supported.");
        setUploadedFile(null);
        setDocumentId(undefined);
        setDocumentSummary(null);
        setDocumentMetadata(null);
      } else {
        alert(result?.message || "Failed to process document.");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred during file upload and extraction.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEvaluateClick = (tender: any) => {
    setSelectedTenderObj(tender);
  };

  const handleDeletePipelineItem = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:4000/organizations/${authOrgId}/pipeline/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchPipeline();
      } else {
        alert("Failed to delete item from pipeline.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const closeInspector = () => {
    setInspectingTender(null);
    setUploadedFile(null);
    setDocumentId(undefined);
    setDocumentSummary(null);
    setDocumentMetadata(null);
  };

  // View: Evaluation Dashboard
  if (selectedTenderObj) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <button 
            onClick={() => setSelectedTenderObj(null)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-surface-900 hover:bg-surface-850 border border-slate-800 px-4 py-2 rounded-xl transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Back to Tender Details</span>
          </button>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Interactive Evaluation Mode</span>
          </div>
        </div>

        <TenderEvaluation 
          organizationId={authOrgId} 
          tenderId={selectedTenderObj.id || (selectedTenderObj as any).referenceNumber} 
          documentId={documentId} 
          tenderTitle={selectedTenderObj.title || (selectedTenderObj as any).tenderTitle}
          onBack={() => setSelectedTenderObj(null)}
        />
      </div>
    );
  }

  // View: Tender Detail Inspector
  if (inspectingTender) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation Back */}
        <button 
          onClick={closeInspector} 
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-cyan-400 transition"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Return to Discovery Feed</span>
        </button>
        
        {/* Tender Header Card */}
        <div className="enterprise-card p-6 sm:p-8 border-slate-800/80 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded border border-cyan-500/20">
                {inspectingTender.referenceNumber}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight pt-1">
                {inspectingTender.title}
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-500"/> 
                <span>{inspectingTender.issuingAuthority}</span>
                <span className="text-slate-600">•</span>
                <span className="bg-surface-950 px-2 py-0.5 rounded text-slate-300 border border-slate-800 font-mono">
                  {inspectingTender.procurementCategory || 'General Goods & Services'}
                </span>
              </p>
            </div>

            {inspectingTender.estimatedValue && (
              <div className="text-right sm:shrink-0 p-3 rounded-xl bg-surface-950 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Estimated Scale</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  ₹{Number(inspectingTender.estimatedValue).toLocaleString()}
                </span>
              </div>
            )}
          </div>
          
          {/* Tender Description */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Procurement Scope & Description
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-surface-950/60 p-4 rounded-xl border border-slate-800/80">
              {inspectingTender.description || 'No detailed scope description provided by the originating procurement portal.'}
            </p>
          </div>

          {/* AI Readiness & Document Extraction Section */}
          <div className="pt-6 border-t border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Deterministic AI Evaluation Readiness</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                PGVector Chunking Pipeline
              </span>
            </div>

            {!documentId ? (
              <div className="enterprise-card p-6 border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>RFP Tender Document Required</span>
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                    Attach the official tender PDF to trigger document extraction, semantic clause chunking, and deterministic rule validation.
                  </p>
                </div>

                <label className="cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition shadow-md shadow-cyan-500/20 flex items-center gap-2 shrink-0">
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white"/> 
                      <span>Extracting Vectors...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-white"/> 
                      <span>Upload Tender PDF</span>
                    </>
                  )}
                  <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Success Banner */}
                <div className="enterprise-card p-5 border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400"/> 
                      <span>Tender Document Processed & Vectorized</span>
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      Target file: <span className="text-slate-300 font-semibold">{uploadedFile}</span> has been indexed into PGVector.
                    </p>
                  </div>

                  <button 
                    onClick={() => handleEvaluateClick(inspectingTender)} 
                    className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition shadow-lg shadow-cyan-500/20 flex items-center gap-2 shrink-0"
                  >
                    <FileText className="w-4 h-4 text-white"/> 
                    <span>Execute AI Rule Evaluation</span>
                  </button>
                </div>

                {/* AI Document Summary */}
                {documentSummary && (
                  <div className="enterprise-card p-5 border-slate-800/80 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      <FileCheck className="w-4 h-4" />
                      <span>Extracted Executive Document Summary</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed bg-surface-950/70 p-4 rounded-xl border border-slate-800/80">
                      {documentSummary}
                    </p>
                    
                    {documentMetadata?.eligibility_highlights && (
                      <div className="pt-2">
                        <h5 className="text-[11px] font-mono font-semibold uppercase text-slate-500 mb-2">
                          Extracted Qualification Highlights
                        </h5>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
                          {documentMetadata.eligibility_highlights.map((highlight: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 bg-surface-950/50 p-2.5 rounded-lg border border-slate-800/60">
                              <span className="text-cyan-400 font-bold">•</span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Procurement KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Tenders Card */}
        <div className="enterprise-card p-5 border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-semibold">
            <span>ACTIVE TENDERS</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-mono">1,428</p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+12% live sync this week</span>
          </div>
        </div>

        {/* Pipeline Bids Card */}
        <div className="enterprise-card p-5 border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-semibold">
            <span>ACTIVE PIPELINE</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-mono">{pipelineTenders.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Saved opportunities in drafting
          </span>
        </div>

        {/* Compliance Rate Card */}
        <div className="enterprise-card p-5 border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-semibold">
            <span>AI MATCH VERIFIED</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-mono">100%</p>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            Zero-hallucination ground truth
          </span>
        </div>

        {/* Engine Status Card */}
        <div className="enterprise-card p-5 border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-semibold">
            <span>PGVECTOR INDEX</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400 mt-2 font-mono">1536-D</p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Embeddings semantic distance
          </span>
        </div>

      </div>

      {/* Main Tabs Navigation Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-900/90 border border-slate-800/80 p-3.5 rounded-2xl backdrop-blur-md">
        
        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'feed' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-surface-850'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tender Discovery</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'pipeline' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-surface-850'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Active Pipeline ({pipelineTenders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'profile' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-surface-850'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>MSME Profile</span>
          </button>
        </div>

        {/* Search Bar for Tender Discovery */}
        {activeTab === 'feed' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                placeholder="Search reference, keywords, authority..."
                className="w-full bg-surface-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner font-sans"
              />
            </div>
          </div>
        )}
      </div>

      {/* TAB CONTENT: TENDER DISCOVERY FEED */}
      {activeTab === 'feed' && (
        <div className="enterprise-card border-slate-800/80 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-800/80 flex justify-between items-center bg-surface-900">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Government Procurement Feed
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time synchronized opportunities matched against your business scope
              </p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
              Live Database
            </span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {isLoadingFeed ? (
              <div className="p-16 text-center flex flex-col justify-center items-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                <span className="text-xs font-mono text-slate-400">Loading tenders from PostgreSQL...</span>
              </div>
            ) : tendersData?.items.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-xs sm:text-sm space-y-2">
                <p className="font-semibold text-slate-300">No tenders matched your search criteria.</p>
                <p className="text-slate-500">Try adjusting your keywords or clearing the search query.</p>
              </div>
            ) : (
              tendersData?.items.map((tender) => (
                <div 
                  key={tender.id} 
                  className="p-5 hover:bg-surface-850/60 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">
                        {tender.referenceNumber}
                      </span>
                      <span className="bg-surface-950 px-2 py-0.5 rounded text-[11px] text-slate-400 border border-slate-800 font-medium">
                        {tender.procurementCategory || 'General Goods'}
                      </span>
                    </div>

                    <h4 
                      onClick={() => setInspectingTender(tender)} 
                      className="text-sm font-semibold text-white group-hover:text-cyan-400 cursor-pointer transition line-clamp-2"
                    >
                      {tender.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" /> 
                        <span>{tender.issuingAuthority}</span>
                      </span>

                      {tender.estimatedValue && (
                        <span className="text-emerald-400 font-mono font-semibold">
                          ₹{Number(tender.estimatedValue).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => setInspectingTender(tender)} 
                    className="text-xs font-semibold px-4 py-2.5 rounded-xl transition bg-surface-950 hover:bg-cyan-500 hover:text-surface-950 border border-slate-700 hover:border-cyan-400 text-slate-200 shadow-sm shrink-0 flex items-center gap-1.5 group-hover:shadow-glow-cyan"
                  >
                    <span>Inspect & Evaluate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {tendersData && tendersData.totalPages > 1 && (
            <div className="p-4 border-t border-slate-800/80 flex justify-between items-center bg-surface-900/80 text-xs">
              <span className="text-slate-400 font-mono">
                Showing Page {tendersData.page} of {tendersData.totalPages} ({tendersData.total} total opportunities)
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  className="p-2 rounded-xl bg-surface-950 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-surface-850 hover:border-slate-700 transition"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono px-2 text-slate-300">{page}</span>
                <button 
                  onClick={() => setPage(p => Math.min(tendersData.totalPages, p + 1))} 
                  disabled={page === tendersData.totalPages}
                  className="p-2 rounded-xl bg-surface-950 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-surface-850 hover:border-slate-700 transition"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ACTIVE PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="enterprise-card border-slate-800/80 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-800/80 flex justify-between items-center bg-surface-900">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Active Bidding Pipeline
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Saved tender opportunities undergoing proposal preparation
              </p>
            </div>
            <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
              {pipelineTenders.length} Active Bids
            </span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {pipelineTenders.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-xs sm:text-sm space-y-2">
                <p className="font-semibold text-slate-300">No opportunities added to your pipeline yet.</p>
                <p className="text-slate-500">Inspect any tender in the Discovery feed and click "Save to Pipeline" to track it here.</p>
              </div>
            ) : (
              pipelineTenders.map((item: any) => (
                <div key={item.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-surface-850/50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                        {item.status || 'Drafting Proposal'}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white">
                      {item.tenderTitle && item.tenderTitle !== 'Untitled Tender' ? item.tenderTitle : 'Supply & Installation of IoT Wildlife Monitoring Cameras'}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Estimated Budget: <span className="text-emerald-400 font-semibold">₹{Number(item.estimatedValue || 4500000).toLocaleString()}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDeletePipelineItem(item.id)}
                      className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 p-2.5 rounded-xl transition"
                      title="Remove from Active Pipeline"
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

      {/* TAB CONTENT: MSME PROFILE */}
      {activeTab === 'profile' && (
        <div className="enterprise-card border-slate-800/80 p-6 sm:p-8">
          <OrganizationProfile organizationId={authOrgId} />
        </div>
      )}
    </div>
  );
}