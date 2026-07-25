import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

function AuthModal({ isOpen, onClose, initialMode = "login", onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(initialMode === "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const BACKEND_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    setIsSignup(initialMode === "signup");
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: "", email: "", password: "" });
      setShowPassword(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      toast.dismiss();

      const loadingToastId = toast.loading("Verifying Google account...");

      try {
        const userInfoResponse = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          },
        );

        const userInfo = userInfoResponse.data;

        const response = await axios.post(
          `${BACKEND_BASE}/api/auth/google-login`,
          {
            name: userInfo.name || "Google User",
            email: userInfo.email,
          },
        );

        const data = response.data;
        toast.dismiss(loadingToastId);

        if (data.success) {
          toast.dismiss();
          toast.success(data.message || "Welcome to TaskDock!", {
            id: "auth-toast-unique",
          });

          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          onClose();

          if (onLoginSuccess) {
            onLoginSuccess(data.user);
          }
        } else {
          toast.error(data.message || "Google Login failed.", {
            id: "auth-toast-unique",
          });
        }
      } catch (error) {
        toast.dismiss(loadingToastId);
        console.error("Google Auth Error:", error);
        toast.error("Failed to authenticate with Google.", {
          id: "auth-toast-unique",
        });
      }
    },
    onError: (error) => {
      console.error("Google OAuth Error:", error);
      toast.error("Google sign-in was cancelled.", { id: "auth-toast-unique" });
    },
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPassword = formData.password;
    const cleanName = formData.name.trim();

    if (!cleanEmail || !cleanPassword || (isSignup && !cleanName)) {
      toast.error("Please fill in all required fields!", {
        id: "validation-error",
      });
      return;
    }

    const submissionData = isSignup
      ? { name: cleanName, email: cleanEmail, password: cleanPassword }
      : { email: cleanEmail, password: cleanPassword };

    setLoading(true);
    toast.dismiss();

    const endpoint = isSignup ? "/api/auth/register" : "/api/auth/login";

    try {
      let response;
      try {
        response = await axios.post(
          `${BACKEND_BASE}${endpoint}`,
          submissionData,
        );
      } catch (firstErr) {
        if (isSignup && firstErr.response?.status === 404) {
          response = await axios.post(
            `${BACKEND_BASE}/api/auth/signup`,
            submissionData,
          );
        } else {
          throw firstErr;
        }
      }

      const data = response.data;

      if (data.success || response.status === 200 || response.status === 201) {
        if (data.token && data.user) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          toast.dismiss();
          toast.success(
            data.message || (isSignup ? "Account created!" : "Welcome back!"),
            { id: "auth-toast-unique" },
          );

          onClose();

          if (onLoginSuccess) {
            onLoginSuccess(data.user);
          }
        } else if (isSignup) {
          toast.dismiss();
          toast.success(data.message || "Account created! Please log in.", {
            id: "auth-toast-unique",
          });
          setIsSignup(false);
          setFormData({ name: "", email: cleanEmail, password: "" });
        }
      } else {
        toast.dismiss();
        toast.error(data.message || "Authentication failed!", {
          id: "auth-toast-unique",
        });
      }
    } catch (error) {
      console.error("Auth submit error:", error);
      const serverMessage =
        error.response?.data?.message || error.response?.data?.error;
      toast.dismiss();
      toast.error(serverMessage || "Something went wrong. Try again!", {
        id: "auth-toast-unique",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-3 sm:p-4 overflow-y-auto transition-all duration-300"
      onClick={onClose}
    >
      {/* Modal Box */}
      <div
        className="relative w-full max-w-md rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 transition-all duration-300 my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 sm:right-5 sm:top-5 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Header Badge & Title */}
        <div className="text-center mb-5 sm:mb-6 pr-6 sm:pr-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 text-[11px] sm:text-xs font-semibold mb-2 sm:mb-3">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>TaskDock Account</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isSignup ? "Get started for free" : "Welcome back"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSignup
              ? "Create your account in seconds"
              : "Enter your credentials to access your account"}
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          {isSignup && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 ml-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 sm:top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  required={isSignup}
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 sm:top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 ml-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 sm:top-3.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 sm:top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/20 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : isSignup ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4 sm:my-5">
          <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          <span className="absolute bg-white dark:bg-slate-900 px-3 text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
            or continue with
          </span>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={() => handleGoogleLogin()}
          className="w-full flex items-center justify-center gap-2.5 sm:gap-3 py-2.5 sm:py-3 px-4 border border-slate-200 dark:border-slate-700/80 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all duration-150 shadow-sm cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"
            />
            <path
              fill="#4285F4"
              d="M16.04 15.345c-1.077.733-2.418 1.164-4.04 1.164-2.955 0-5.464-1.991-6.355-4.673L1.609 14.95C3.582 18.882 7.664 21.6 12 21.6c3.155 0 6.027-1.127 8.19-3.055l-4.15-3.2z"
            />
            <path
              fill="#34A853"
              d="M23.49 12.273c0-.773-.073-1.527-.2-2.273H12v4.51h6.464a5.532 5.532 0 01-2.4 3.636l4.15 3.2c2.427-2.236 3.827-5.527 3.827-9.073z"
            />
            <path
              fill="#FBBC05"
              d="M5.645 11.836A6.938 6.938 0 015.455 10c0-.636.1-1.255.264-1.845L1.69 5.04A11.94 11.94 0 000 10c0 1.745.373 3.4 1.045 4.91l4.6-3.073z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Bottom Switch Link */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-5 sm:mt-6">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer ml-1"
          >
            {isSignup ? "Log In" : "Sign Up free"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthModal;
