import React, { useState } from 'react';
import { Search, Filter, Briefcase, CheckCircle2, TrendingUp, ArrowUpRight, Building2, Shield } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'feed' | 'pipeline'>('feed');

  // Mock live data matching our procurement domain
  const mockTenders = [
    {
      id: 'TEND-2026-089',
      title: 'Supply & Installation of IoT Wildlife Monitoring Cameras',
      issuer: 'Ministry of Environment & Forests',
      budget: '₹45,00,000',
      deadline: '28th Mar 2026',
      matchScore: 96,
      category: 'IoT & Embedded Systems',
      status: 'Eligible',
    },
    {
      id: 'TEND-2026-042',
      title: 'Enterprise Cloud Infrastructure Migration & Security Audit',
      issuer: 'National Informatics Centre (NIC)',
      budget: '₹1,20,00,000',
      deadline: '15th Apr 2026',
      matchScore: 84,
      category: 'Cloud & DevOps',
      status: 'Review Required',
    },
    {
      id: 'TEND-2026-112',
      title: 'Automated Laser Fencing & Perimeter Security Deployment',
      issuer: 'Defense Research and Development',
      budget: '₹85,00,000',
      deadline: '02. May 2026',
      matchScore: 78,
      category: 'Hardware & Defense',
      status: 'Eligible',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar / Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <span>AI Eligibility Matches</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">34</p>
          <span className="text-xs text-slate-400 mt-1">High confidence score &gt;85%</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Bids in Pipeline</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">5</p>
          <span className="text-xs text-amber-400 mt-1">2 deadlines approaching</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Win Rate Prediction</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">68.4%</p>
          <span className="text-xs text-emerald-400 mt-1">Optimized via AI scoring</span>
        </div>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
              activeTab === 'feed'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Tender Feed
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
              activeTab === 'pipeline'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Active Bidding Pipeline
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

      {/* Tenders Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-white">Recommended Tenders for Your Organization</h3>
          <span className="text-xs text-slate-400">Showing 3 top semantic matches</span>
        </div>

        <div className="divide-y divide-slate-800">
          {mockTenders.map((tender) => (
            <div key={tender.id} className="p-5 hover:bg-slate-850 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                    {tender.id}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center">
                    <Building2 className="w-3 h-3 mr-1" /> {tender.issuer}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-white hover:text-indigo-400 cursor-pointer">
                  {tender.title}
                </h4>
                <div className="flex items-center space-x-4 text-xs text-slate-400 pt-1">
                  <span>Budget: <strong className="text-slate-200">{tender.budget}</strong></span>
                  <span>Deadline: <strong className="text-slate-200">{tender.deadline}</strong></span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">{tender.category}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 self-end md:self-center">
                <div className="text-right">
                  <div className="text-xs font-medium text-slate-400">AI Match</div>
                  <div className="text-sm font-bold text-emerald-400">{tender.matchScore}%</div>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition flex items-center space-x-1 shadow">
                  <span>Evaluate</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}