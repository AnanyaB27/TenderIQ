import { useState } from "react";
import { Activity } from "lucide-react";

interface ForgotPasswordProps {
  onLogin: () => void;
}

export default function ForgotPassword({
  onLogin,
}: ForgotPasswordProps) {
  const [step, setStep] = useState<
    "email" | "otp" | "password" | "success"
  >("email");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-indigo-600 p-3 rounded-xl">
            <Activity className="w-7 h-7 text-white" />
          </div>

          <span className="text-2xl font-bold text-slate-900">
            TenderIQ
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-10">

          {/* Email Step */}
          {step === "email" && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">
                  Forgot Password?
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Enter your email and we'll send you an OTP.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!email.trim()) {
                      setError("Please enter your email.");
                      return;
                    }

                    if (!/\S+@\S+\.\S+/.test(email)) {
                      setError("Please enter a valid email address.");
                      return;
                    }

                    setError("");
                    setStep("otp");
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Send OTP
                </button>

                {error && (
                  <p className="text-sm text-red-500 text-center">
                    {error}
                  </p>
                )}
              </div>
            </>
          )}

          {/* OTP Step */}
          {step === "otp" && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">
                  Verify OTP
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Enter the OTP sent to your email.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    OTP
                  </label>

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
                    placeholder="Enter 6-digit OTP"
                    style={{
                      color: "#0f172a",
                    }}
                    className="w-full px-4 py-3 text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg tracking-widest outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (otp.length !== 6) {
                      setError("Please enter a 6-digit OTP.");
                      return;
                    }

                    setError("");
                    setStep("password");
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Verify OTP
                </button>

                {error && (
                  <p className="text-sm text-red-500 text-center">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep("email");
                  }}
                  className="w-full text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Change Email
                </button>
              </div>
            </>
          )}

          {/* New Password Step */}
          {step === "password" && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">
                  Set New Password
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Create a new password for your account.
                </p>
              </div>

              <div className="space-y-5">

                {/* New Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="Enter new password"
                      style={{
                        color: "#0f172a",
                      }}
                      className="w-full px-4 py-3 pr-16 text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="Confirm new password"
                      style={{
                        color: "#0f172a",
                      }}
                      className="w-full px-4 py-3 pr-16 text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-slate-700"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!newPassword) {
                      setError("Please enter a new password.");
                      return;
                    }

                    if (!confirmPassword) {
                      setError("Please confirm your password.");
                      return;
                    }

                    if (newPassword !== confirmPassword) {
                      setError("Passwords do not match.");
                      return;
                    }

                    setError("");
                    setStep("success");
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Reset Password
                </button>

                {error && (
                  <p className="text-sm text-red-500 text-center">
                    {error}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="text-center">

              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-green-600">
                    ✓
                  </span>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-slate-900">
                Password Reset Successfully!
              </h1>

              <p className="mt-3 text-sm text-slate-500">
                Your password has been reset successfully.
                You can now login with your new password.
              </p>

              <button
                type="button"
                onClick={onLogin}
                className="w-full mt-7 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Login
              </button>
            </div>
          )}

          {/* Back to Login */}
          {step !== "success" && (
            <p className="text-center text-sm text-slate-500 mt-7">
              Remember your password?{" "}
              <button
                type="button"
                onClick={onLogin}
                className="text-indigo-600 font-semibold hover:text-indigo-700"
              >
                Login
              </button>
            </p>
          )}

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 TenderIQ
        </p>

      </div>
    </div>
  );
}