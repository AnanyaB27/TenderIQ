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
  AlertCircle,
  Plus,
  X,
  BookmarkPlus
} from 'lucide-react';
import { getTenders, PaginatedTenders, Tender, uploadDocument, loginLocalDemo } from '../api';
import { TenderEvaluation } from './TenderEvaluation';
import { OrganizationProfile } from './OrganizationProfile';
import { StatusBadge } from './common/StatusBadge';

export default function Dashboard() {
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
  
  const [tendersData, setTendersData] = useState<PaginatedTenders | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSavingPipeline, setIsSavingPipeline] = useState<boolean>(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploadingCustom, setIsUploadingCustom] = useState(false);
  const [customUploadFile, setCustomUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const authOrgId = localStorage.getItem('activeOrganizationId') || '';

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

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchFeed = useCallback(async () => {
    setIsLoadingFeed(true);
    const url = new URL('http://localhost:4000/tenders');
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', '10');
    if (debouncedSearch) url.searchParams.append('search', debouncedSearch);
    if (authOrgId) url.searchParams.append('organizationId', authOrgId);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      const data = await res.json();
      if (data && Array.isArray(data.items)) {
        setTendersData(data);
      } else {
        setTendersData({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 } as any);
      }
    } catch (err) {
      console.error('Failed to fetch feed', err);
      setTendersData({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 } as any);
    } finally {
      setIsLoadingFeed(false);
    }
  }, [debouncedSearch, page, authOrgId]);

  useEffect(() => {
    if (activeTab === 'feed' && authOrgId) {
      fetchFeed();
    }
    if (activeTab === 'pipeline' && authOrgId) {
      fetchPipeline();
    }
  }, [authOrgId, activeTab, fetchFeed]);

  const fetchPipeline = async () => {
    if (!authOrgId) {
      setPipelineTenders([]);
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:4000/organizations/${authOrgId}/pipeline`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(typeof data.message === 'string' ? data.message : `API Error: ${res.status}`);
      if (Array.isArray(data)) setPipelineTenders(data);
      else setPipelineTenders([]);
    } catch (err) {
      console.error('Failed to fetch pipeline', err);
    }
  };

  const handleCustomUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customUploadFile) {
      setUploadError('Please select a PDF document to upload.');
      return;
    }
    if (customUploadFile.type !== 'application/pdf' && !customUploadFile.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF format is supported.');
      return;
    }
    if (customUploadFile.size > 15 * 1024 * 1024) {
      setUploadError('The PDF must be 15 MB or smaller.');
      return;
    }
    if (!authOrgId) {
      setUploadError('No active organization was found. Please log in again.');
      return;
    }

    setIsUploadingCustom(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', customUploadFile);
      formData.append('organizationId', authOrgId);
      formData.append('title', uploadTitle.trim() || customUploadFile.name);

      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:4000/tenders/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = Array.isArray(payload.message) ? payload.message.join(', ') : payload.message;
        throw new Error(message || `Upload failed with status ${response.status}.`);
      }

      // Support both flat responses and common { tender, document } response shapes.
      const tender = payload.tender ?? payload.item ?? payload.data?.tender ?? payload.data ?? payload;
      const document = payload.document ?? payload.data?.document ?? tender.document ?? {};
      const returnedTenderId = payload.tenderId ?? tender.id ?? payload.data?.tenderId;
      const returnedDocumentId = payload.documentId ?? document.id ?? payload.data?.documentId ?? tender.documentId;
      const returnedStatus = String(payload.extractionStatus ?? document.extractionStatus ?? payload.status ?? '').toUpperCase();

      if (!returnedTenderId) {
        throw new Error('The server accepted the upload but did not return a tender ID. Check the POST /tenders/upload response in the Network tab.');
      }
      if (!returnedDocumentId) {
        throw new Error('The server created the tender but did not return a document ID. The backend upload response must include documentId (or document.id) so the evaluation endpoint can use it.');
      }

      const uploadedTender: any = {
        ...tender,
        id: returnedTenderId,
        title: tender.title || uploadTitle.trim() || customUploadFile.name,
        referenceNumber: tender.referenceNumber || `CUSTOM-${returnedTenderId}`,
        documentId: returnedDocumentId,
        documentUrl: tender.documentUrl || customUploadFile.name,
        extractionStatus: returnedStatus || 'READY',
      };

      setDocumentId(returnedDocumentId);
      setUploadedFile(customUploadFile.name);
      setDocumentSummary(payload.documentSummary ?? document.summary ?? payload.summary ?? null);
      setDocumentMetadata(payload.metadata ?? document.metadata ?? null);
      setInspectingTender(uploadedTender);
      await fetchFeed();
      setShowUploadModal(false);
      setCustomUploadFile(null);
      setUploadTitle('');
      setUploadError(null);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'An error occurred during upload.');
    } finally {
      setIsUploadingCustom(false);
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

  const handleSaveToPipeline = async () => {
    if (!selectedTenderObj) return;
    setIsSavingPipeline(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:4000/organizations/${authOrgId}/pipeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          tenderId: selectedTenderObj.id,
          tenderTitle: selectedTenderObj.title,
          estimatedValue: selectedTenderObj.estimatedValue,
          status: 'Drafting Proposal'
        })
      });

      if (res.ok) {
        alert("Opportunity successfully saved to your Active Pipeline!");
        fetchPipeline();
      } else {
        alert("Failed to save to pipeline.");
      }
    } catch (err) {
      console.error(err);
      alert("A network error occurred while saving.");
    } finally {
      setIsSavingPipeline(false);
    }
  };

  const handleDeleteTender = async (tenderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this tender?")) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:4000/tenders/${tenderId}?organizationId=${encodeURIComponent(authOrgId)}`, {
        method: 'DELETE',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (res.ok) {
        fetchFeed();
      } else {
        alert("Failed to delete tender.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while deleting tender.");
    }
  };

  const handleDeletePipelineItem = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:4000/organizations/${authOrgId}/pipeline/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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

  if (selectedTenderObj) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <button 
            onClick={() => setSelectedTenderObj(null)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-surface-900 hover:bg-surface-850 border border-slate-800 px-4 py-2 rounded-xl transition shadow-sm w-fit"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Back to Tender Details</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveToPipeline}
              disabled={isSavingPipeline}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition shadow-md shadow-indigo-500/20 disabled:opacity-50"
            >
              {isSavingPipeline ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookmarkPlus className="w-4 h-4" />}
              <span>Save to Pipeline</span>
            </button>
            <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-surface-950 px-3 py-2 rounded-xl border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Interactive Evaluation Mode</span>
            </div>
          </div>
        </div>

        <TenderEvaluation 
          organizationId={authOrgId} 
          tenderId={selectedTenderObj.id} 
          documentId={documentId || (selectedTenderObj as any).documentId} 
          tenderTitle={selectedTenderObj.title || (selectedTenderObj as any).tenderTitle}
          onBack={() => setSelectedTenderObj(null)}
        />
      </div>
    );
  }

  if (inspectingTender) {
    const hasDocument = !!documentId || !!(inspectingTender as any).documentUrl || inspectingTender.referenceNumber?.startsWith('CUSTOM-');

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <button 
          onClick={closeInspector} 
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-cyan-400 transition"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Return to Discovery Feed</span>
        </button>
        
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
                <span>{inspectingTender.issuingAuthority || 'Private Organization'}</span>
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
          
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Procurement Scope & Description
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-surface-950/60 p-4 rounded-xl border border-slate-800/80">
              {inspectingTender.description || 'No detailed scope description provided.'}
            </p>
          </div>

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

            {!hasDocument ? (
              <div className="enterprise-card p-6 border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>RFP Tender Document Required</span>
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                    Attach the official tender PDF to trigger document extraction and semantic clause chunking.
                  </p>
                </div>

                <label className="cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition shadow-md flex items-center gap-2 shrink-0">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-white"/> : <Upload className="w-4 h-4 text-white"/>}
                  <span>Upload Tender PDF</span>
                  <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="enterprise-card p-5 border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400"/> 
                      <span>Tender Document Processed & Available</span>
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      Target file: <span className="text-slate-300 font-semibold">{uploadedFile || (inspectingTender as any).documentUrl || 'Custom Attached PDF'}</span> is ready.
                    </p>
                  </div>

                  <button 
                    onClick={() => handleEvaluateClick(inspectingTender)} 
                    className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition shadow-lg flex items-center gap-2 shrink-0"
                  >
                    <FileText className="w-4 h-4 text-white"/> 
                    <span>Execute AI Rule Evaluation</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="enterprise-card p-5 border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-semibold">
            <span>ACTIVE TENDERS</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400"><Briefcase className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-mono">1,428</p>
        </div>
        <div className="enterprise-card p-5 border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-semibold">
            <span>ACTIVE PIPELINE</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400"><Shield className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-mono">{pipelineTenders?.length || 0}</p>
        </div>
        <div className="enterprise-card p-5 border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-semibold">
            <span>AI MATCH VERIFIED</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400"><CheckCircle className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-mono">100%</p>
        </div>
        <div className="enterprise-card p-5 border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-semibold">
            <span>PGVECTOR INDEX</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400"><Layers className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400 mt-2 font-mono">1536-D</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-900/90 border border-slate-800/80 p-3.5 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-2 ${activeTab === 'feed' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tender Discovery</span>
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-2 ${activeTab === 'pipeline' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Active Pipeline ({pipelineTenders?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-2 ${activeTab === 'profile' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>MSME Profile</span>
          </button>
        </div>

        {activeTab === 'feed' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                placeholder="Search reference, keywords, authority..."
                className="w-full bg-surface-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        )}
      </div>

      {activeTab === 'feed' && (
        <div className="enterprise-card border-slate-800/80 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-900">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Government Procurement Feed</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time synchronized opportunities matched against your scope</p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">Live Database</span>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-surface-950 hover:bg-cyan-500 hover:text-surface-950 border border-slate-700 text-slate-200 font-semibold px-3 py-1.5 rounded-full text-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Private RFP</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-800/80">
            {isLoadingFeed ? (
              <div className="p-16 text-center flex flex-col justify-center items-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                <span className="text-xs font-mono text-slate-400">Loading tenders from PostgreSQL...</span>
              </div>
            ) : (!tendersData?.items || tendersData.items.length === 0) ? (
              <div className="p-16 text-center text-slate-400 text-xs sm:text-sm space-y-4">
                <p className="font-semibold text-slate-300">No tenders matched your search criteria.</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="mx-auto bg-cyan-500 hover:bg-cyan-400 text-surface-950 font-semibold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload PDF</span>
                </button>
              </div>
            ) : (
              tendersData.items.map((tender) => (
                <div 
                  key={tender.id} 
                  className="p-5 hover:bg-surface-850/60 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group relative"
                >
                  {tender.referenceNumber?.startsWith('CUSTOM-') && (
                    <div className="absolute top-0 right-0 bg-indigo-500/20 text-indigo-300 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-bl-lg border-b border-l border-indigo-500/30">
                      Private
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1 w-full">
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
                        <span className="truncate max-w-[200px]">{tender.issuingAuthority || 'Private Organization'}</span>
                      </span>

                      {tender.estimatedValue && (
                        <span className="text-emerald-400 font-mono font-semibold">
                          ₹{Number(tender.estimatedValue).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    {tender.referenceNumber?.startsWith('CUSTOM-') && (
                      <button 
                        onClick={(e) => handleDeleteTender(tender.id, e)} 
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 p-2.5 rounded-xl transition"
                        title="Delete Private Tender"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => setInspectingTender(tender)} 
                      className="flex-1 md:flex-initial text-xs font-semibold px-4 py-2.5 rounded-xl transition bg-surface-950 hover:bg-cyan-500 hover:text-surface-950 border border-slate-700 text-slate-200 shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>Inspect & Evaluate</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-950/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-surface-900 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Upload Private RFP</h3>
                <p className="text-xs text-slate-400 mt-1">Isolate a custom tender document for analysis.</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="rounded-xl p-1.5 text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-500/10 text-rose-400 text-xs border border-rose-500/30 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleCustomUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Tender Title (Optional)</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g., 2026 Tech Infrastructure RFP"
                  className="w-full bg-surface-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Official Document (PDF)</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setCustomUploadFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    required
                  />
                  <div className={`w-full border-2 border-dashed rounded-xl p-6 text-center flex flex-col items-center justify-center space-y-2 ${customUploadFile ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-slate-700 bg-surface-950/50'}`}>
                    <FileText className={`w-8 h-8 ${customUploadFile ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <div className="text-sm font-medium text-slate-300">
                      {customUploadFile ? customUploadFile.name : 'Click to browse or drag PDF here'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800/80">
                <button
                  type="submit"
                  disabled={isUploadingCustom}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploadingCustom ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>Upload to PostgreSQL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'pipeline' && (
        <div className="enterprise-card border-slate-800/80 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-800/80 flex justify-between items-center bg-surface-900">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Active Bidding Pipeline</h3>
              <p className="text-xs text-slate-400 mt-0.5">Saved tender opportunities undergoing proposal preparation</p>
            </div>
            <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
              {pipelineTenders?.length || 0} Active Bids
            </span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {(!pipelineTenders || pipelineTenders.length === 0) ? (
              <div className="p-16 text-center text-slate-400 text-xs sm:text-sm space-y-2">
                <p className="font-semibold text-slate-300">No opportunities added to your pipeline yet.</p>
              </div>
            ) : (
              pipelineTenders.map((item: any) => (
                <div key={item.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-surface-850/50 transition">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono font-semibold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                      {item.status || 'Drafting Proposal'}
                    </span>
                    <h4 className="text-sm font-semibold text-white">{item.tenderTitle}</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Estimated Budget: <span className="text-emerald-400 font-semibold">₹{Number(item.estimatedValue || 0).toLocaleString()}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletePipelineItem(item.id)}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 p-2.5 rounded-xl transition"
                    title="Remove from Pipeline"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="enterprise-card border-slate-800/80 p-6 sm:p-8">
          <OrganizationProfile organizationId={authOrgId} />
        </div>
      )}
    </div>
  );
}