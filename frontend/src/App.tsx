import { useEffect, useState } from 'react';
import { checkBackendHealth } from './services/api';
import Dashboard from './components/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import { TenderIQLogo } from './components/common/TenderIQLogo';
import { 
  ShieldCheck, 
  Server, 
  Activity, 
  LogOut, 
  Cpu, 
  Sparkles, 
  ArrowRight, 
  FileCheck2, 
  Database, 
  Search, 
  Layers, 
  ChevronRight,
  TrendingUp,
  Building2
} from 'lucide-react';

export default function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Connecting...');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const [view, setView] = useState<
    'landing' | 'login' | 'signup' | 'forgot' | 'dashboard'
  >(
    localStorage.getItem('accessToken')
      ? 'dashboard'
      : 'landing',
  );

  useEffect(() => {
    checkBackendHealth()
      .then((data) => {
        setBackendStatus(`Online (${data.status || 'OK'})`);
        setIsConnected(true);
      })
      .catch(() => {
        setBackendStatus('Offline (NestJS port 4000)');
        setIsConnected(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('activeOrganizationId');
    sessionStorage.removeItem('dashboard_activeTab');
    sessionStorage.removeItem('dashboard_inspectingTender');
    sessionStorage.removeItem('dashboard_selectedTenderObj');
    sessionStorage.removeItem('dashboard_documentId');
    sessionStorage.removeItem('dashboard_uploadedFile');
    sessionStorage.removeItem('dashboard_documentSummary');
    sessionStorage.removeItem('dashboard_documentMetadata');

    setView('landing');
  };

  return (
    <div className="min-h-screen bg-surface-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      
      {/* Top Enterprise Header */}
      <header className="w-full border-b border-slate-800/80 bg-surface-950/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div 
            className="cursor-pointer transition hover:opacity-90"
            onClick={() => setView(localStorage.getItem('accessToken') ? 'dashboard' : 'landing')}
          >
            <TenderIQLogo size="sm" showSubtitle={false} />
          </div>

          {/* Navigation & Telemetry */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Backend Connectivity Status Badge */}
            <div 
              className="flex items-center gap-2 bg-surface-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-mono"
              title="NestJS Backend Health Telemetry"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected
                    ? 'bg-emerald-400 animate-pulse shadow-glow-emerald'
                    : 'bg-rose-500'
                }`}
              />
              <span className="text-slate-300 font-medium hidden sm:inline">
                API:
              </span>
              <span className={`${isConnected ? 'text-emerald-400' : 'text-rose-400'} font-semibold`}>
                {backendStatus}
              </span>
            </div>

            {/* View Switching Navigation */}
            {view === 'dashboard' ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-surface-900 hover:bg-surface-800 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white transition shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span>Sign Out</span>
              </button>
            ) : view === 'landing' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('login')}
                  className="bg-surface-900 hover:bg-surface-800 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setView('signup')}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium px-3.5 py-1.5 rounded-xl text-xs transition shadow-sm shadow-cyan-500/20"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <button
                onClick={() => setView('landing')}
                className="text-xs text-slate-400 hover:text-cyan-400 transition"
              >
                ← Return to Home
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Main View Router */}
      <main className="w-full flex-1">
        {view === 'login' ? (
          <Login
            onSignup={() => setView('signup')}
            onForgotPassword={() => setView('forgot')}
            onLogin={() => setView('dashboard')}
          />
        ) : view === 'signup' ? (
          <Signup
            onLogin={() => setView('login')}
          />
        ) : view === 'forgot' ? (
          <ForgotPassword
            onLogin={() => setView('login')}
          />
        ) : view === 'landing' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            
            {/* Hero Section */}
            <div className="text-center space-y-6 max-w-4xl mx-auto">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/20 text-cyan-300 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Presidency University CSE • Enterprise AI Platform</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                AI Procurement <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Intelligence Platform
                </span>{" "}
                for MSMEs
              </h1>

              {/* Sub-description */}
              <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                Discover relevant government tenders, evaluate strict RFP eligibility criteria using 
                deterministic semantic AI, and generate hallucination-free, verifiable bid proposal drafts.
              </p>

              {/* CTA Action Buttons */}
              <div className="pt-4 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setView('login')}
                  className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition duration-200 shadow-lg shadow-cyan-500/25 flex items-center gap-2 group"
                >
                  <span>Launch Procurement Hub</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => setView('signup')}
                  className="bg-surface-900 hover:bg-surface-800 text-slate-200 border border-slate-800 font-semibold px-6 py-3 rounded-xl text-sm transition"
                >
                  Register Organization
                </button>
              </div>

              {/* Technology Stack Pills */}
              <div className="pt-6 flex flex-wrap justify-center items-center gap-2 text-[11px] font-mono text-slate-500">
                <span className="px-2.5 py-1 rounded-md bg-surface-900 border border-slate-800/80">NestJS Core</span>
                <span className="px-2.5 py-1 rounded-md bg-surface-900 border border-slate-800/80">PostgreSQL + PGVector</span>
                <span className="px-2.5 py-1 rounded-md bg-surface-900 border border-slate-800/80">FastAPI AI Engine</span>
                <span className="px-2.5 py-1 rounded-md bg-surface-900 border border-slate-800/80">Google Gemini RAG</span>
              </div>
            </div>

            {/* Architecture Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-6xl mx-auto">
              
              <div className="enterprise-card p-6 border-slate-800/80 hover:border-cyan-500/30 transition duration-300">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-4">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Tender Discovery & Sync
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time synchronization with government procurement feeds, categorized by domain, budget scale, and deadlines.
                </p>
              </div>

              <div className="enterprise-card p-6 border-slate-800/80 hover:border-indigo-500/30 transition duration-300">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Deterministic Rule Engine
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Rigorous boolean tests matching organization turnover, experience, and past deliverables with complete citation tracking.
                </p>
              </div>

              <div className="enterprise-card p-6 border-slate-800/80 hover:border-blue-500/30 transition duration-300">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Zero-Hallucination Bid Drafter
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generates technical proposals and compliance matrices grounded strictly in verified evidence and MSME documentation.
                </p>
              </div>

            </div>

          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Dashboard />
          </div>
        )}
      </main>

      {/* Enterprise Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-surface-950 text-xs text-slate-500 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">TenderIQ</span>
            <span>•</span>
            <span>Presidency University Computer Science Engineering</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>NestJS Port 4000</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>PGVector Enabled</span>
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}