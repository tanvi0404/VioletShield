import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Server,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  Info,
  Layers,
  Wrench
} from "lucide-react";

const NiktoMisconfigCard = ({ niktoData }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState("ALL");

  if (!niktoData) return null;

  const findings = niktoData.findings || [];
  const serverBanner = niktoData.server_banner || "Unknown";
  const riskRating = niktoData.risk_rating || "LOW";
  const counts = niktoData.severity_counts || { critical: 0, high: 0, medium: 0, low: 0, info: 0 };

  const getSeverityBadge = (sev) => {
    switch ((sev || "").toUpperCase()) {
      case "CRITICAL":
        return "border-rose-500/50 bg-rose-500/20 text-rose-300";
      case "HIGH":
        return "border-orange-500/50 bg-orange-500/20 text-orange-300";
      case "MEDIUM":
        return "border-amber-500/50 bg-amber-500/20 text-amber-300";
      case "LOW":
        return "border-blue-500/50 bg-blue-500/20 text-blue-300";
      default:
        return "border-zinc-700 bg-zinc-800 text-zinc-300";
    }
  };

  const filteredFindings = findings.filter((f) => {
    if (selectedSeverity === "ALL") return true;
    return (f.severity || "").toUpperCase() === selectedSeverity;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-zinc-950 to-black p-6 md:p-8 shadow-2xl space-y-6"
    >
      {/* HEADER & RISK BADGE */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-purple-500/20 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/20 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-purple-300">
              Phase 7 OWASP & Nikto Vulnerability Audit
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Web Server Misconfigurations ({findings.length})
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 flex items-center gap-1.5 font-mono">
            <Server size={13} className="text-purple-400" />
            {serverBanner}
          </span>
          <span className={`rounded-xl border px-3 py-1.5 text-xs font-black uppercase font-mono ${getSeverityBadge(riskRating)}`}>
            {riskRating} RISK
          </span>
        </div>
      </div>

      {/* SEVERITY METRICS COUNTER */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Critical", count: counts.critical || 0, color: "text-rose-400 border-rose-500/30 bg-rose-950/10", key: "CRITICAL" },
          { label: "High", count: counts.high || 0, color: "text-orange-400 border-orange-500/30 bg-orange-950/10", key: "HIGH" },
          { label: "Medium", count: counts.medium || 0, color: "text-amber-400 border-amber-500/30 bg-amber-950/10", key: "MEDIUM" },
          { label: "Low", count: counts.low || 0, color: "text-blue-400 border-blue-500/30 bg-blue-950/10", key: "LOW" },
          { label: "Info / Notice", count: counts.info || 0, color: "text-zinc-300 border-zinc-700 bg-zinc-900/40", key: "INFO" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setSelectedSeverity(selectedSeverity === s.key ? "ALL" : s.key)}
            className={`rounded-2xl border p-3.5 text-left transition hover:scale-102 ${s.color} ${
              selectedSeverity === s.key ? "ring-2 ring-purple-500/50 scale-102" : ""
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">{s.label}</span>
            <span className="text-2xl font-black">{s.count}</span>
          </button>
        ))}
      </div>

      {/* FINDINGS LIST */}
      {findings.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center space-y-2">
          <CheckCircle2 size={28} className="mx-auto text-emerald-400" />
          <p className="text-sm font-semibold text-zinc-300">
            No dangerous server misconfigurations or exposed debug vectors identified.
          </p>
          <p className="text-xs text-zinc-500">
            Web server satisfies baseline OWASP hardening standards.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFindings.map((f, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-5 transition hover:border-purple-500/40"
              >
                <div
                  className="flex cursor-pointer items-start justify-between gap-3"
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${getSeverityBadge(f.severity)}`}>
                        {f.severity}
                      </span>
                      {f.category && (
                        <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                          {f.category}
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-white">{f.title}</h3>
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2">{f.description}</p>
                  </div>

                  <button className="text-zinc-400 hover:text-white transition mt-1">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 border-t border-zinc-900 pt-4 space-y-3 font-mono text-xs"
                    >
                      {f.evidence && (
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
                          <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Observed Evidence:</span>
                          <p className="text-purple-300 text-xs">{f.evidence}</p>
                        </div>
                      )}

                      {f.remediation && (
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 flex items-start gap-2 text-emerald-300">
                          <Wrench size={14} className="shrink-0 mt-0.5 text-emerald-400" />
                          <div>
                            <strong className="text-[11px] uppercase tracking-wider block text-emerald-400">Hardening Guidance:</strong>
                            <p className="text-xs mt-0.5">{f.remediation}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default NiktoMisconfigCard;
