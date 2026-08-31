import React, { useState } from "react";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import AuthBackground from "./AuthBackground";
import cyberImage from "../../assets/cyber-security.png";
import { loginUser } from "../../api/authApi";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email address and password.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const data = await loginUser(email.trim(), password);

      if (data && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_id", data.user_id);
        navigate("/dashboard");
      } else {
        setErrorMessage(data?.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      const msg =
        error.response?.data?.error ||
        "Unable to connect to authentication server. Ensure backend is running.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center py-10 px-4">
      <AuthBackground />

      <div className="relative z-10 grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2">
        {/* LOGIN FORM */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-purple-500/30 bg-black/70 p-8 shadow-[0_0_50px_rgba(168,85,247,0.2)] backdrop-blur-2xl"
        >
          {/* LOGO & HEADING */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-violet-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]">
              <Shield size={28} />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">
              Welcome Back
            </h2>
            <p className="text-xs text-zinc-400">
              Authenticate into VioletShield Security Operations Center
            </p>
          </div>

          {/* ERROR ALERT */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-5 flex items-center gap-2.5 rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-300"
              >
                <AlertTriangle size={16} className="shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FORM */}
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            {/* EMAIL */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                Email Address
              </label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="analyst@violetshield.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2.5 pl-10 pr-10 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-600/30 transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* SIGNUP LINK */}
          <div className="mt-6 text-center text-xs text-zinc-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-purple-400 transition hover:text-purple-300 hover:underline"
            >
              Register here
            </Link>
          </div>
        </motion.div>

        {/* ARTWORK / BRANDING RIGHT */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden flex-col items-center justify-center space-y-6 lg:flex"
        >
          <img
            src={cyberImage}
            alt="VioletShield Security"
            className="max-h-80 object-contain drop-shadow-[0_0_40px_rgba(168,85,247,0.4)]"
          />
          <div className="text-center space-y-2 max-w-sm">
            <h3 className="text-lg font-bold text-white">
              Continuous Penetration Testing
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Automate network reconnaissance, service fingerprinting, ExploitDB search correlation, and live SIEM ingestion.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
