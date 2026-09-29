import { useState } from "react";
import { Activity } from "lucide-react";

interface SignupProps {
  onLogin: () => void;
}

export default function Signup({ onLogin }: SignupProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
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

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-10">

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">
              Create your account
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign up to get started with TenderIQ
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              onLogin();
            }}
          >

            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-4">

              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  First Name
                </label>

                <input
                  id="firstName"
                  type="text"
                  required
                  placeholder="First name"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Last Name
                </label>

                <input
                  id="lastName"
                  type="text"
                  placeholder="Last name"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

            </div>

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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password
              </label>

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
                  placeholder="Confirm your password"
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

            {/* Create Account */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Create Account
            </button>

          </form>

          {/* Login */}
          <p className="text-center text-sm text-slate-500 mt-7">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onLogin}
              className="text-indigo-600 font-semibold hover:text-indigo-700"
            >
              Login
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