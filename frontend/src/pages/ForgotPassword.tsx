import React, { useState } from "react";
import { Eye, EyeOff, Mail, KeyRound, Lock, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { TenderIQLogo } from "../components/common/TenderIQLogo";

interface ForgotPasswordProps {
  onLogin: () => void;
}

export default function ForgotPassword({ onLogin }: ForgotPasswordProps) {
  const [step, setStep] = useState<"email" | "otp" | "password" | "success">("email");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const stepsList = [
    { id: "email", label: "Email" },
    { id: "otp", label: "OTP" },
    { id: "password", label: "Reset" },
    { id: "success", label: "Done" },
  ];

  return (
    <div className="min-h-screen bg-surface-950 text-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <TenderIQLogo size="md" />
        </div>

        {/* Card */}
        <div className="enterprise-card p-6 sm:p-8 border-slate-800/90 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Stepper Progress */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/80">
            {stepsList.map((s, idx) => {
              const isCurrent = step === s.id;
              const isPast = 
                (step === 'otp' && idx === 0) ||
                (step === 'password' && idx <= 1) ||
                (step === 'success' && idx <= 2);

              return (
                <div key={s.id} className="flex items-center gap-1.5">
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-colors ${
                      isCurrent 
                        ? 'bg-cyan-500 text-surface-950 shadow-glow-cyan' 
                        : isPast 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-surface-850 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {isPast ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[11px] font-medium hidden sm:inline ${isCurrent ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {s.label}
                  </span>
                  {idx < stepsList.length - 1 && (
                    <div className="w-4 h-[1px] bg-slate-800 mx-1 hidden sm:block" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Email Step */}
          {step === "email" && (
            <div>
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Account Recovery
                </h1>
                <p className="mt-1.5 text-xs text-slate-400">
                  Enter your registered work email to receive a 6-digit verification code.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Registered Work Email
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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="name@organization.com"
                      className="w-full bg-surface-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-rose-500/10 text-rose-400 text-xs border border-rose-500/30 rounded-xl flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (!email.trim()) {
                      setError("Please enter your registered work email.");
                      return;
                    }
                    if (!/\S+@\S+\.\S+/.test(email)) {
                      setError("Please provide a valid email format.");
                      return;
                    }
                    setError("");
                    setStep("otp");
                  }}
                  className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition duration-200 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 group"
                >
                  <span>Dispatch Verification Code</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* OTP Step */}
          {step === "otp" && (
            <div>
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Enter 6-Digit OTP
                </h1>
                <p className="mt-1.5 text-xs text-slate-400">
                  Verification code dispatched to <span className="text-cyan-400 font-mono">{email}</span>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Security Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, ""));
                        setError("");
                      }}
                      placeholder="• • • • • •"
                      className="w-full bg-surface-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-center font-mono text-base tracking-[0.5em] text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-rose-500/10 text-rose-400 text-xs border border-rose-500/30 rounded-xl flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (otp.length !== 6) {
                      setError("Please provide all 6 digits of the verification code.");
                      return;
                    }
                    setError("");
                    setStep("password");
                  }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition duration-200 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                >
                  <span>Verify Security Code</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setStep("email");
                    }}
                    className="text-xs text-slate-400 hover:text-cyan-400 transition flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change email address</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* New Password Step */}
          {step === "password" && (
            <div>
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Set New Credentials
                </h1>
                <p className="mt-1.5 text-xs text-slate-400">
                  Choose a robust password for your TenderIQ workspace.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="Minimum 8 characters"
                      className="w-full bg-surface-950/80 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="Re-enter password"
                      className="w-full bg-surface-950/80 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-rose-500/10 text-rose-400 text-xs border border-rose-500/30 rounded-xl flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (!newPassword) {
                      setError("Please provide a new password.");
                      return;
                    }
                    if (newPassword.length < 6) {
                      setError("Password must be at least 6 characters.");
                      return;
                    }
                    if (newPassword !== confirmPassword) {
                      setError("Passwords do not match.");
                      return;
                    }
                    setError("");
                    setStep("success");
                  }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition duration-200 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                >
                  <span>Update Account Password</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-glow-emerald">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>

              <h1 className="text-xl font-bold tracking-tight text-white">
                Credentials Updated
              </h1>

              <p className="mt-2 text-xs text-slate-400 max-w-xs mx-auto">
                Your password has been securely updated. You can now authenticate with your updated credentials.
              </p>

              <button
                type="button"
                onClick={onLogin}
                className="w-full mt-6 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition duration-200 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
              >
                <span>Return to Authentication</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Back to Login link */}
          {step !== "success" && (
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
              Remember your credentials?{" "}
              <button
                type="button"
                onClick={onLogin}
                className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}