import { useEffect, useState } from 'react';
import { checkBackendHealth } from './services/api';
import Dashboard from './components/Dashboard';
import { ShieldCheck, Server, Activity, LogOut, Loader2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:4000';

export default function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Connecting...');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [view, setView] = useState<'landing' | 'dashboard'>(
    localStorage.getItem('accessToken') ? 'dashboard' : 'landing',
  );
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    checkBackendHealth()
      .then((data) => {
        setBackendStatus(`Online (Status: ${data.status || 'OK'})`);
        setIsConnected(true);
      })
      .catch(() => {
        setBackendStatus('Offline (Check NestJS port 4000)');
        setIsConnected(false);
      });
  }, []);

  const handleLaunch = async () => {
    if (localStorage.getItem('accessToken')) {
      setView('dashboard');
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Local login failed: ${response.status}`);
      }

      const data = await response.json();

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      if (data.organization?.id) {
        localStorage.setItem('activeOrganizationId', data.organization.id);
      }

      setView('dashboard');
    } catch (error) {
      console.error('Local demo login failed:', error);
      alert('Local demo login failed. Make sure the NestJS backend is running on port 4000.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('activeOrganizationId');
    setView('landing');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col justify-between p-6 md:p-8 font-sans">
      <header className="max-w-6xl mx-auto w-full flex justify-between items-center border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('landing')}>
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">TenderIQ</h1>
            <p className="text-xs text-slate-400">AI Procurement OS</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-slate-300 font-medium">Backend: {backendStatus}</span>
          </div>

          {view === 'dashboard' && (
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full my-auto py-6">
        {view === 'landing' ? (
          <div className="text-center space-y-6 max-w-3xl mx-auto py-12">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Production Architecture Active</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Intelligent Procurement <br />
              <span className="text-indigo-400">Operating System</span>
            </h2>

            <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
              Discover relevant government tenders, evaluate your organization's eligibility via semantic AI, and manage your complete bidding lifecycle.
            </p>

            <div className="pt-4 flex justify-center gap-4">
              <button
                onClick={handleLaunch}
                disabled={isLoggingIn || !isConnected}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-600/25 flex items-center space-x-2"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Entering TenderIQ...</span>
                  </>
                ) : (
                  <span>Launch Tender Intelligence Hub</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          <Dashboard />
        )}
      </main>

      <footer className="max-w-6xl mx-auto w-full text-center border-t border-slate-900 pt-6 text-xs text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
        <p>Â© 2026 TenderIQ. All rights reserved.</p>
        <p className="flex items-center justify-center space-x-1">
          <Server className="w-3 h-3" />
          <span>NestJS API + React Client Active</span>
        </p>
      </footer>
    </div>
  );
}
