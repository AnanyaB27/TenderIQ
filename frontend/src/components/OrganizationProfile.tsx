import React, { useState, useEffect } from 'react';
import { getMsmeProfile, updateMsmeProfile } from '../api';
import { Save, Loader2, Building2, MapPin, Target, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface OrganizationProfileProps {
  organizationId: string;
}

export const OrganizationProfile: React.FC<OrganizationProfileProps> = ({ organizationId }) => {
  const [turnover, setTurnover] = useState<string>('');
  const [experience, setExperience] = useState<string>('');
  const [locations, setLocations] = useState<string>('');
  const [capabilities, setCapabilities] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      const data = await getMsmeProfile(organizationId);
      if (data) {
        // Aggressively check all possible backend property names
        const fetchedTurnover = (data as any).annualTurnover ?? (data as any).turnoverInCrores ?? (data as any).annual_turnover ?? '';
        setTurnover(fetchedTurnover.toString());
        setExperience(data.yearsOfExperience?.toString() || '');
        setLocations(data.operatingLocations?.join(', ') || '');
        setCapabilities(data.coreCapabilities?.join(', ') || '');
      }
      setLoading(false);
    }
    loadProfile();
  }, [organizationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    
    const parsedLocations = locations.split(',').map(s => s.trim()).filter(Boolean);
    const parsedCapabilities = capabilities.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      turnoverInCrores: turnover ? Number(turnover) : 0,
      annualTurnover: turnover ? Number(turnover) : 0, // Bulletproof fallback for backend
      yearsOfExperience: experience ? Number(experience) : 0,
      operatingLocations: parsedLocations,
      coreCapabilities: parsedCapabilities
    };
    
    const updated = await updateMsmeProfile(organizationId, payload);
    if (updated) {
      // Extract data safely regardless of backend response wrapping
      const profileData = (updated as any).data || (updated as any).profile || updated;
      const newTurnover = profileData.annualTurnover ?? profileData.turnoverInCrores ?? profileData.annual_turnover ?? turnover;
      
      setTurnover(newTurnover.toString());
      setExperience(profileData.yearsOfExperience?.toString() || experience);
      setLocations(profileData.operatingLocations?.join(', ') || locations);
      setCapabilities(profileData.coreCapabilities?.join(', ') || capabilities);
      
      setMessage({ text: 'Profile successfully updated. Changes will be factored into all AI evaluations.', type: 'success' });
    } else {
      setMessage({ text: 'Failed to update organization profile. Please try again.', type: 'error' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-16 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        <span className="text-xs font-mono text-slate-400 tracking-wider">
          Retrieving organization profile telemetry...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              MSME Organization Profile
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Verified Entity
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            This factual baseline directly feeds the deterministic AI RuleEngine to evaluate mandatory tender eligibility.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-surface-900 border border-slate-800 px-3 py-1.5 rounded-xl w-fit">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Deterministic Audit Standard</span>
        </div>
      </div>

      {/* Alert Banner */}
      {message && (
        <div 
          className={`p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
          role="alert"
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
          )}
          <span className="leading-relaxed">{message.text}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Financial & Tenure Metrics */}
        <div className="enterprise-card p-6 border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 text-white font-semibold text-sm">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Building2 className="w-4 h-4" />
            </div>
            <span>Core Procurement Thresholds</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Annual Turnover (INR Crores)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={turnover}
                  onChange={(e) => setTurnover(e.target.value)}
                  className="w-full bg-surface-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner font-mono"
                  placeholder="e.g. 25.5"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 pointer-events-none">
                  ₹ Cr
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Used to test minimum financial turnover threshold rules.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Years of Operating Experience
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-surface-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner font-mono"
                  placeholder="e.g. 8"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 pointer-events-none">
                  Years
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Validated against past-performance clause prerequisites.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Geographic Reach */}
        <div className="enterprise-card p-6 border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 text-white font-semibold text-sm">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <MapPin className="w-4 h-4" />
            </div>
            <span>Operational Jurisdiction</span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Operating Locations (Comma-separated)
            </label>
            <input
              type="text"
              value={locations}
              onChange={(e) => setLocations(e.target.value)}
              placeholder="e.g., Bangalore, Karnataka, Maharashtra, Delhi NCR"
              className="w-full bg-surface-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Determines regional qualification and local supplier preference exemptions.
            </p>
          </div>
        </div>

        {/* Section 3: Technical Capabilities */}
        <div className="enterprise-card p-6 border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 text-white font-semibold text-sm">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Target className="w-4 h-4" />
            </div>
            <span>Domain Capabilities & Technical Scope</span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Core Technical Competencies (Comma-separated)
            </label>
            <textarea
              value={capabilities}
              onChange={(e) => setCapabilities(e.target.value)}
              rows={4}
              placeholder="e.g., Embedded Systems, AI Development, Network Hardware, Cloud Architecture, IoT Sensors"
              className="w-full bg-surface-950/80 border border-slate-800 rounded-xl p-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner leading-relaxed"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Vectorized via PGVector embeddings to compute semantic similarity against tender scope of work.
            </p>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Updates immediately synchronize with AI rule engines</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition duration-200 shadow-lg shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Persisting Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};