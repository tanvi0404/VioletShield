import React, { useState } from "react";
import {
  Shield,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import AuthBackground from "./AuthBackground";
import signupImage from "../../assets/cyber-security2.png";
import { registerUser } from "../../api/authApi";

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignup = async (e) => {
    e?.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const data = await registerUser(name.trim(), email.trim(), password);

      setSuccessMessage(data?.message || "Account registered successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      const msg =
        error.response?.data?.error ||
        "Registration failed. Email may already be in use.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center py-10 px-4">
      <AuthBackground />

      <div className="relative z-10 grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2">
        {/* SIGNUP FORM */}
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
              Create Account
            </h2>
            <p className="text-xs text-zinc-400">
              Join VioletShield AI Penetration Testing & Defense Platform
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

          {/* SUCCESS ALERT */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-5 flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs text-emerald-300"
              >
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FORM */}
          <form onSubmit={handleSignup} className="mt-6 space-y-4">
            {/* FULL NAME */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                Full Name
              </label>
              <div className="relative">
                <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                />
              </div>
            </div>

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
              <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                Password
              </label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="At least 6 characters"
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* LOGIN LINK */}
          <div className="mt-6 text-center text-xs text-zinc-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-purple-400 transition hover:text-purple-300 hover:underline"
            >
              Sign in
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
            src={signupImage}
            alt="VioletShield Defense"
            className="max-h-80 object-contain drop-shadow-[0_0_40px_rgba(168,85,247,0.4)]"
          />
          <div className="text-center space-y-2 max-w-sm">
            <h3 className="text-lg font-bold text-white">
              Enterprise SOC Defense
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Equip your infrastructure with automated reconnaissance, vulnerability scanning, and threat intelligence.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
