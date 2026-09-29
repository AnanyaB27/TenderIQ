import { useState } from "react";
import { Activity } from "lucide-react";

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

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-10">

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Login to continue to TenderIQ
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();

              const form = e.currentTarget;

              if (!form.checkValidity()) {
                form.reportValidity();
                return;
              }

              onLogin();
            }}
          >

            {/* Email */}
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
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  style={{
                    color: "#0f172a",
                  }}
                  className="w-full px-4 py-3 pr-16 text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 accent-indigo-600"
              />

              <label
                htmlFor="remember"
                className="text-sm text-slate-600"
              >
                Remember me
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Login
            </button>

          </form>

          {/* Sign Up */}
          <p className="text-center text-sm text-slate-500 mt-7">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSignup}
              className="text-indigo-600 font-semibold hover:text-indigo-700"
            >
              Sign Up
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 TenderIQ
        </p>

      </div>
    </div>
  );
}