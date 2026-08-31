import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Award,
  Layers
} from "lucide-react";

const SecurityScoreCard = ({ score, riskDetails }) => {
  const [expanded, setExpanded] = useState(false);

  // If riskDetails is provided, use its rich parameters, otherwise infer defaults
  const finalScore = typeof riskDetails?.security_score === "number" ? riskDetails.security_score : (score ?? 100);
  
  let defaultGrade = "A";
  if (finalScore >= 95) defaultGrade = "A+";
  else if (finalScore >= 85) defaultGrade = "A";
  else if (finalScore >= 70) defaultGrade = "B";
  else if (finalScore >= 55) defaultGrade = "C";
  else if (finalScore >= 40) defaultGrade = "D";
  else defaultGrade = "F";

  const grade = riskDetails?.grade || defaultGrade;
  const pillars = riskDetails?.pillars || null;
  const reasons = riskDetails?.main_reasons || [];
  const remediations = riskDetails?.priority_remediations || [];

  let color = "text-rose-400";
  let bg = "bg-rose-500";
  let badgeBorder = "border-rose-500/40 bg-rose-500/10 text-rose-300";

  if (finalScore >= 85) {
    color = "text-emerald-400";
    bg = "bg-emerald-400";
    badgeBorder = "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  } else if (finalScore >= 60) {
    color = "text-amber-400";
    bg = "bg-amber-400";
    badgeBorder = "border-amber-500/40 bg-amber-500/10 text-amber-300";
  }

  return (
    <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 md:p-8 shadow-2xl relative overflow-hidden font-sans">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              AI Composite Security Score
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-300">
              <Sparkles size={11} /> Phase 10 Engine
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-4">
            <h2 className={`text-6xl font-black tracking-tight ${color}`}>
              {finalScore}
              <span className="text-2xl font-bold text-zinc-500 ml-1">/100</span>
            </h2>

            {/* LETTER GRADE BADGE */}
            <div className={`flex items-center gap-1.5 rounded-2xl border px-3.5 py-1.5 font-mono text-xl font-black ${badgeBorder}`}>
              <Award size={18} />
              <span>Grade {grade}</span>
            </div>
          </div>

          <p className="mt-2 text-xs text-zinc-400 max-w-md">
            {riskDetails?.posture_label || "Multi-pillar evaluated security posture across network, vulnerabilities, cryptography, and threat feeds."}
          </p>
        </div>

        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-600/10 border border-purple-500/30 text-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.15)] shrink-0">
          {finalScore >= 70 ? <ShieldCheck size={40} /> : <ShieldAlert size={40} className="text-rose-400" />}
        </div>
      </div>

      {/* OVERALL SCORE BAR */}
      <div className="mt-6 h-3.5 overflow-hidden rounded-full bg-zinc-800/80 p-0.5 border border-zinc-700/50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${finalScore}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={`${bg} h-full rounded-full shadow-[0_0_12px_rgba(168,85,247,0.4)]`}
        />
      </div>

      {/* 4-PILLAR MINI BREAKDOWN (IF AVAILABLE) */}
      {pillars && (
        <div className="mt-6 grid grid-cols-2 gap-3 pt-5 border-t border-zinc-800/80 sm:grid-cols-4 font-mono text-xs">
          {Object.entries(pillars).map(([key, p]) => (
            <div key={key} className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3">
              <span className="text-[10px] text-zinc-400 block truncate font-sans">{p.name}</span>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-base font-bold text-white">
                  {p.score} <span className="text-[10px] text-zinc-500">/{p.max}</span>
                </span>
                <span className="text-[10px] font-bold text-purple-300">{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EXPANDABLE REASONS & REMEDIATION ROI */}
      {(reasons.length > 0 || remediations.length > 0) && (
        <div className="mt-5 pt-4 border-t border-zinc-800/80">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between text-xs font-bold text-purple-400 hover:text-purple-300 transition"
          >
            <span className="flex items-center gap-1.5">
              <Layers size={14} />
              {expanded ? "Hide Score Drivers & Remediation ROI" : "View Score Drivers & Remediation ROI"}
            </span>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4 overflow-hidden text-xs"
              >
                {/* REASONS */}
                {reasons.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] uppercase font-bold text-zinc-400 block">Score Deduction Factors:</span>
                    <div className="space-y-1.5">
                      {reasons.map((r, idx) => (
                        <div key={idx} className="flex items-start gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-2.5 text-zinc-300">
                          <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* REMEDIATIONS ROI */}
                {remediations.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] uppercase font-bold text-zinc-400 block">Points Recovery Potential:</span>
                    <div className="space-y-1.5">
                      {remediations.map((rem, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-xl border border-purple-500/20 bg-purple-950/20 p-2.5 text-zinc-200 font-mono">
                          <span className="font-sans pr-2">{rem.action}</span>
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-400 shrink-0">
                            <TrendingUp size={12} />
                            +{rem.points_recovery} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default SecurityScoreCard;