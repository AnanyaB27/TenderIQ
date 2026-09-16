// frontend/src/components/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { Search, Filter, Briefcase, CheckCircle2, TrendingUp, Shield, Loader2, Upload, FileText, Trash2 } from 'lucide-react';
import { fetchTendersFromDb, uploadDocument } from '../api';
import { TenderEvaluation } from './TenderEvaluation';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'feed' | 'pipeline'>('feed');
  const [tenders, setTenders] = useState<any[]>([]);
  const [pipelineTenders, setPipelineTenders] = useState<any[]>([]);
  
  // RAG Document state
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Evaluation Navigation State
  const [selectedTenderObj, setSelectedTenderObj] = useState<any | null>(null);

  // In a real app this comes from Context/Redux. Fallback to localStorage.
  const authOrgId = localStorage.getItem('activeOrganizationId') || 'org-123'; // Note: Keep org-123 fallback temporarily if your auth isn't fully wired yet

  useEffect(() => {
    fetch(`http://localhost:4000/organizations/${authOrgId}/tenders/sync-live`)
      .catch(() => console.log('Live sync warming up...'))
      .finally(() => {
        fetchTendersFromDb(authOrgId).then((data) => {
          if (data && data.length > 0) {
            setTenders(data);
          }
        });
      });
    fetchPipeline();
  }, [authOrgId]);

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
        alert(result?.message || "Failed to process document. It may still be extracting or failed.");
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

  // If a tender is selected, render the detailed Evaluation View instead of the Feed
  if (selectedTenderObj) {
    return (
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex justify-between items-center">
          <button 
            onClick={() => setSelectedTenderObj(null)}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center bg-white px-4 py-2 rounded shadow-sm border border-gray-200"
          >
            ← Back to Feed
          </button>
        </div>
        <TenderEvaluation 
          organizationId={authOrgId} 
          tenderId={selectedTenderObj.id || selectedTenderObj.referenceNumber} 
          documentId={documentId} 
          tenderTitle={selectedTenderObj.title || selectedTenderObj.tenderTitle}
        />
      </div>
    );
  }

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
                    <button 
                      onClick={() => handleEvaluateClick(tender)}
                      className="text-xs font-medium px-4 py-2 rounded-lg transition flex items-center space-x-1 shadow bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      View AI Evaluation
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
    </div>
  );
}