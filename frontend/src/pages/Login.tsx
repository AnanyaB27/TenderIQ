import React, { useState } from "react";
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  ShieldCheck, 
  Zap, 
  Search, 
  FileCheck2, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  Lock,
  Mail
} from "lucide-react";
import { loginLocalDemo } from "../api";
import { TenderIQLogo } from "../components/common/TenderIQLogo";

interface LoginProps {
  onSignup: () => void;
  onForgotPassword: () => void;
  onLogin: () => void;
}

export default function Login({
  onSignup,
  onForgotPassword,
  onLogin,
}: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill for the backend's local demo account
  const [email, setEmail] = useState("demo@tenderiq.local");
  const [password, setPassword] = useState("demo_password");

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Hit the actual NestJS backend auth controller
      const authData = await loginLocalDemo();
      
      // Persist the JWT and Organization ID for future API calls
      localStorage.setItem('accessToken', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);
      if (authData.organization?.id) {
        localStorage.setItem('activeOrganizationId', authData.organization.id);
      }
      
      // Navigate to dashboard
      onLogin();
    } catch (err) {
      console.error(err);
      setError("Failed to connect to authentication server. Please ensure the NestJS backend on port 4000 is active.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 text-slate-100 flex flex-col justify-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Form Card */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
            <div className="mb-8">
              <TenderIQLogo size="lg" />
            </div>

            <div className="enterprise-card p-6 sm:p-8 border-slate-800/90 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Enterprise Single Sign-On</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Welcome to TenderIQ
                </h1>
                <p className="mt-1.5 text-sm text-slate-400">
                  Authenticate to access deterministic AI procurement intelligence.
                </p>
              </div>

              {error && (
                <div 
                  className="mb-5 p-3.5 bg-rose-500/10 text-rose-400 text-xs sm:text-sm border border-rose-500/30 rounded-xl flex items-start gap-2.5"
                  role="alert"
                >
                  <div className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleLoginSubmit}>
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Business Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@organization.com"
                      className="w-full bg-surface-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={onForgotPassword}
                      className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-surface-950/80 border border-slate-800 rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Local Demo Indicator */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label htmlFor="remember" className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                    <input 
                      id="remember" 
                      type="checkbox" 
                      defaultChecked 
                      className="w-4 h-4 rounded bg-surface-950 border-slate-800 text-cyan-500 focus:ring-cyan-500/20 accent-cyan-500" 
                    />
                    <span>Remember this device</span>
                  </label>
                  <span className="font-mono text-[11px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    Local Demo Mode
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl text-sm transition duration-200 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to TenderIQ</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Signup Link */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
                Don't have an enterprise account?{" "}
                <button
                  type="button"
                  onClick={onSignup}
                  className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition"
                >
                  Create an account
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: High-Tech Enterprise Analytics Visual */}
          <div className="hidden lg:block lg:col-span-7 pl-6">
            <div className="relative">
              {/* Subtle ambient glow behind visualization */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/10 via-blue-500/5 to-indigo-500/10 rounded-3xl blur-2xl" />

              <div className="relative enterprise-card p-8 border-slate-800/80 space-y-6">
                
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                      Deterministic AI Pipeline Status: Active
                    </span>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                    PGVector v0.7.0
                  </span>
                </div>

                {/* Feature Showcase Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-surface-950/80 border border-slate-800/80 space-y-2">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 w-fit">
                      <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Semantic Match Engine</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Cosine-similarity indexing compares MSME capability vectors against RFP requirements.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-950/80 border border-slate-800/80 space-y-2">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 w-fit">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Rule-Engine Verification</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Deterministic boolean tests for turnover, experience, and eligibility thresholds.
                    </p>
                  </div>
                </div>

                {/* Simulated Real-Time Audit Telemetry Card */}
                <div className="p-4 rounded-xl bg-surface-950/90 border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <Layers className="w-3.5 h-3.5" />
                      <span>RAG Extraction & Validation Stack</span>
                    </span>
                    <span className="text-[11px] text-slate-500">Latency: 42ms</span>
                  </div>
                  
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between p-2 rounded bg-surface-900 border border-slate-800/80">
                      <span className="text-slate-300">Annual Turnover Verification</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> PASS (INR 25.0 Cr &gt; 15.0 Cr)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-surface-900 border border-slate-800/80">
                      <span className="text-slate-300">Years of Experience</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> PASS (8 Yrs &gt; 5 Yrs)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-surface-900 border border-slate-800/80">
                      <span className="text-slate-300">Geographic Jurisdiction Match</span>
                      <span className="text-cyan-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Karnataka, India
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Trust Indicators */}
                <div className="flex items-center justify-between pt-2 text-xs text-slate-400 border-t border-slate-800/80">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Zero Hallucination Bid Drafter</span>
                  </span>
                  <span className="text-slate-500 font-mono">
                    Presidency University CSE Project
                  </span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}