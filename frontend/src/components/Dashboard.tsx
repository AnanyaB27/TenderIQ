import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Briefcase, CheckCircle2, TrendingUp, Shield, Loader2, Upload, FileText, Trash2, Building, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { getTenders, PaginatedTenders, Tender, uploadDocument } from '../api';
import { TenderEvaluation } from './TenderEvaluation';
import { OrganizationProfile } from './OrganizationProfile';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'feed' | 'pipeline' | 'profile'>('feed');
  const [pipelineTenders, setPipelineTenders] = useState<any[]>([]);
  
  // Search, Filter, Pagination State
  const [tendersData, setTendersData] = useState<PaginatedTenders | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  // Detail View State
  const [inspectingTender, setInspectingTender] = useState<Tender | null>(null);

  // RAG Document state (Scoped to the inspected tender)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Evaluation Navigation State
  const [selectedTenderObj, setSelectedTenderObj] = useState<Tender | null>(null);

  // Extract authenticated organization context dynamically
  const authOrgId = localStorage.getItem('activeOrganizationId') || 'org-123';

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Database Tenders for the Feed
  const fetchFeed = useCallback(async () => {
    setIsLoadingFeed(true);
    const data = await getTenders({ search: debouncedSearch, page, limit: 10 });
    setTendersData(data);
    setIsLoadingFeed(false);
  }, [debouncedSearch, page]);

  useEffect(() => {
    if (activeTab === 'feed') {
      // Run the live CPPP sync in the background first
      fetch(`http://localhost:4000/organizations/${authOrgId}/tenders/sync-live`)
        .catch(() => console.log('Live sync warming up...'))
        .finally(() => {
          fetchFeed();
        });
    }
    if (activeTab === 'pipeline') {
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
      alert("Unsupported file type. Please upload a PDF.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert("File is too large. Maximum size is 15MB.");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadDocument(authOrgId, file);
      
      if (result && result.status === 'READY') {
        setUploadedFile(result.filename);
        setDocumentId(result.id);
      } else if (result && result.status === 'NO_EXTRACTABLE_TEXT') {
        alert("The PDF was parsed but contains no extractable text. Scanned PDFs (OCR) are not yet supported.");
        setUploadedFile(null);
        setDocumentId(undefined);
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
        alert("Failed to delete item.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const closeInspector = () => {
    setInspectingTender(null);
    setUploadedFile(null);
    setDocumentId(undefined);
  };

  // View: Evaluation Dashboard (P1.5)
  if (selectedTenderObj) {
    return (
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex justify-between items-center">
          <button 
            onClick={() => setSelectedTenderObj(null)}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center bg-white px-4 py-2 rounded shadow-sm border border-gray-200"
          >
            ← Back to Details
          </button>
        </div>
        <TenderEvaluation 
          organizationId={authOrgId} 
          tenderId={selectedTenderObj.id || (selectedTenderObj as any).referenceNumber} 
          documentId={documentId} 
          tenderTitle={selectedTenderObj.title || (selectedTenderObj as any).tenderTitle}
        />
      </div>
    );
  }

  // View: Tender Detail Inspector (P1.8)
  if (inspectingTender) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6 mt-6">
        <button onClick={closeInspector} className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Search Feed
        </button>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-mono bg-indigo-500/10 text-indigo-600 px-2 py-1 rounded border border-indigo-100">
                {inspectingTender.referenceNumber}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 mt-3">{inspectingTender.title}</h1>
              <p className="text-sm text-gray-500 mt-2 flex items-center">
                <Building2 className="w-4 h-4 mr-1"/> {inspectingTender.issuingAuthority}
              </p>
            </div>
          </div>
          
          <div className="mt-6 prose max-w-none text-gray-700 text-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="whitespace-pre-wrap">{inspectingTender.description || 'No description provided by the source.'}</p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">AI Evaluation Readiness</h3>
            {!documentId ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-amber-800">Tender Document Required</p>
                  <p className="text-xs text-amber-700 mt-1">Upload the tender PDF to extract requirements and run the deterministic AI match scoring.</p>
                </div>
                <label className="cursor-pointer bg-white border border-amber-300 text-amber-700 hover:bg-amber-100 px-4 py-2 rounded shadow-sm text-sm font-medium transition flex items-center">
                  {isUploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2"/> Processing...</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2"/> Upload PDF</>
                  )}
                  <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-emerald-800 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1"/> Document Processed
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">The document {uploadedFile} has been chunked and vectorized. Ready for evaluation.</p>
                </div>
                <button 
                  onClick={() => handleEvaluateClick(inspectingTender)} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow-sm text-sm font-medium transition flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2"/> Run AI Evaluation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Navigation Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
        <div className="flex space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeTab === 'feed' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Tender Discovery
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeTab === 'pipeline' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Active Pipeline ({pipelineTenders.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition flex items-center space-x-1 whitespace-nowrap ${
              activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building className="w-3.5 h-3.5 mr-1" />
            <span>Organization Profile</span>
          </button>
        </div>

        {activeTab === 'feed' && (
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                placeholder="Search titles, reference numbers..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg border border-slate-700">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Tab Views */}
      {activeTab === 'feed' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white">Global Tender Database</h3>
            <span className="text-xs text-slate-400">Database Search Results</span>
          </div>

          <div className="divide-y divide-slate-800">
            {isLoadingFeed ? (
              <div className="p-12 text-center flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
            ) : tendersData?.items.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No tenders match your search criteria.</div>
            ) : (
              tendersData?.items.map((tender) => (
                <div key={tender.id} className="p-5 hover:bg-slate-800/50 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1.5 flex-1">
                    <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                      {tender.referenceNumber}
                    </span>
                    <h4 
                      onClick={() => setInspectingTender(tender)} 
                      className="text-sm font-medium text-white hover:text-indigo-400 cursor-pointer line-clamp-2"
                    >
                      {tender.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center"><Building2 className="w-3.5 h-3.5 mr-1" /> {tender.issuingAuthority}</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">{tender.procurementCategory || 'General'}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setInspectingTender(tender)} 
                    className="text-xs font-medium px-4 py-2 rounded-lg transition bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white shadow-sm shrink-0"
                  >
                    Inspect & Evaluate
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {tendersData && tendersData.totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-900/50">
              <span className="text-xs text-slate-400">Page {tendersData.page} of {tendersData.totalPages} ({tendersData.total} total)</span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-50 hover:bg-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(tendersData.totalPages, p + 1))} 
                  disabled={page === tendersData.totalPages}
                  className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-50 hover:bg-slate-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'pipeline' && (
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
                    </div>
                    <h4 className="text-sm font-medium text-white">{item.tenderTitle && item.tenderTitle !== 'Untitled Tender' ? item.tenderTitle : 'Supply & Installation of IoT Wildlife Monitoring Cameras'}</h4>
                    <p className="text-xs text-slate-400">Estimated Value: ₹{Number(item.estimatedValue || 4500000).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-3">
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

      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <OrganizationProfile organizationId={authOrgId} />
        </div>
      )}
    </div>
  );
}