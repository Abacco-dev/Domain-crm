import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Zap, ArrowRight, Lock, Mail } from "lucide-react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      console.log("Login success for:", email);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 overflow-hidden relative">
      {/* Animated gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        <div className="absolute top-40 -right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glow effect behind card */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl blur-2xl opacity-20 animate-pulse" style={{animation: "pulse 4s ease-in-out infinite"}}></div>

        {/* Card */}
        <div 
          className="relative bg-white rounded-3xl p-8 shadow-2xl border border-gray-100"
          style={{animation: "slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)"}}
        >
          {/* Top accent bar */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-md"></div>

          {/* Icon container with enhanced animation */}
          <div className="flex justify-center mb-8" style={{animation: "fadeIn 0.6s ease-out 0.15s both"}}>
            <div className="relative group">
              {/* Multiple glowing rings */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-xl opacity-20 animate-pulse animation-delay-1000"></div>
              
              {/* Main icon */}
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-5 rounded-2xl border border-white/30 transform group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Header with enhanced typography */}
          <div className="text-center mb-2" style={{animation: "fadeIn 0.6s ease-out 0.2s both"}}>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 drop-shadow-lg">
              Welcome Back
            </h1>
            <p className="text-gray-700 text-sm font-medium tracking-wide">Access your Domain CRM Dashboard</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-8"></div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div style={{animation: "fadeIn 0.6s ease-out 0.25s both"}}>
              <label className="block text-gray-800 text-xs font-bold uppercase tracking-widest mb-3">
                Email Address
              </label>
              <div className={`relative group transition-all duration-300`}>
                <div className={`absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl opacity-0 group-hover:opacity-20 group-focus-within:opacity-30 blur-lg transition-all duration-300`}></div>
                <div className="relative flex items-center">
                  <Mail className={`absolute left-4 w-5 h-5 transition-colors duration-300 ${focused === "email" ? "text-blue-600" : "text-gray-400"}`} />
                  <input
                    type="email"
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none ${
                      focused === "email"
                        ? "border-blue-500 bg-white shadow-lg shadow-blue-400/30"
                        : "border-gray-300 hover:border-gray-400 hover:bg-white"
                    }`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Password field */}
            <div style={{animation: "fadeIn 0.6s ease-out 0.3s both"}}>
              <label className="block text-gray-800 text-xs font-bold uppercase tracking-widest mb-3">
                Password
              </label>
              <div className={`relative group transition-all duration-300`}>
                <div className={`absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl opacity-0 group-hover:opacity-20 group-focus-within:opacity-30 blur-lg transition-all duration-300`}></div>
                <div className="relative flex items-center">
                  <Lock className={`absolute left-4 w-5 h-5 transition-colors duration-300 ${focused === "password" ? "text-purple-600" : "text-gray-400"}`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 transition-all duration-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none ${
                      focused === "password"
                        ? "border-purple-500 bg-white shadow-lg shadow-purple-400/30"
                        : "border-gray-300 hover:border-gray-400 hover:bg-white"
                    }`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-gray-500 hover:text-gray-700 transition-colors duration-300"
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div style={{animation: "shake 0.5s ease-in-out"}}>
                <div className="text-red-700 text-sm text-center bg-red-100 border border-red-300 rounded-xl py-3 px-4 font-semibold">
                  {error}
                </div>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div style={{animation: "slideDown 0.5s ease-out"}}>
                <div className="text-green-700 text-sm text-center bg-green-100 border border-green-300 rounded-xl py-3 px-4 font-semibold">
                  ✓ Login successful! Redirecting...
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || success}
              className={`w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 mt-8 relative overflow-hidden group ${
                loading || success
                  ? "bg-gradient-to-r from-blue-500/70 to-purple-500/70 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-2xl hover:shadow-purple-500/40 active:shadow-lg"
              }`}
              style={{animation: "fadeIn 0.6s ease-out 0.35s both"}}
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              
              <span className="flex items-center justify-center gap-3 relative z-10">
                {loading ? (
                  <>
                    <span className="animate-spin">
                      <Zap size={20} />
                    </span>
                    <span>Signing in...</span>
                  </>
                ) : success ? (
                  <>
                    <span>✓ Welcome!</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center" style={{animation: "fadeIn 0.6s ease-out 0.4s both"}}>
            <p className="text-gray-600 text-xs font-medium tracking-widest uppercase">
              🚀 Domain CRM Dashboard
            </p>
          </div>
        </div>

        {/* Bottom floating element */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes grid {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(100px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-grid {
          animation: grid 20s linear infinite;
        }
      `}</style>
    </div>
  );
}