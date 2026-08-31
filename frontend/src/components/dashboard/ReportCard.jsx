import React, { useState } from "react";
import axios from "axios";
import {
  FileText,
  Download,
  Shield,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Loader2,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ReportCard = ({ report }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!report) {
    return null;
  }

  const issues = report.ai_report?.issues || report.vulnerabilities || [];
  const score = report.security_score ?? report.score ?? 0;
  const risk = report.ai_report?.risk || report.risk || "Low";

  const downloadReport = async () => {
    setDownloading(true);
    setDownloadSuccess(false);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/report/${report.id}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `VioletShield_Security_Report_${report.website || "Audit"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (error) {
      console.error("PDF DOWNLOAD ERROR:", error);
      // Fallback direct download link
      window.open(`http://localhost:5000/api/report/${report.id}`, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const getRiskColor = (r) => {
    switch (r) {
      case "High":
      case "Critical":
        return "border-rose-500/40 bg-rose-500/15 text-rose-300";
      case "Medium":
        return "border-amber-500/40 bg-amber-500/15 text-amber-300";
      default:
        return "border-emerald-500/40 bg-emerald-500/15 text-emerald-300";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-zinc-950 to-black p-6 md:p-8 shadow-2xl space-y-6"
    >
      {/* HEADER WITH EXPORT BUTTON */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-purple-500/20 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/20 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Executive Security Audit Report
            </h2>
            <p className="text-xs text-purple-300 font-mono">
              Ready for executive sign-off & technical remediation
            </p>
          </div>
        </div>

        {/* DOWNLOAD ACTION */}
        <div className="flex items-center gap-3">
          <button
            onClick={downloadReport}
            disabled={downloading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-600/30 transition-all hover:scale-105 hover:shadow-purple-600/50 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Compiling PDF...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download PDF Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {downloadSuccess && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300"
          >
            <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
            <span>Executive PDF downloaded successfully to your device.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SNAPSHOT METRICS GRID */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Target Host</span>
          <p className="mt-1 font-mono text-sm font-bold text-white truncate">{report.website || "Target"}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Security Score</span>
          <p className="mt-1 text-2xl font-black text-emerald-400">{score}%</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Risk Assessment</span>
          <div className="mt-1">
            <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-bold uppercase ${getRiskColor(risk)}`}>
              {risk} Risk
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Audit Status</span>
          <p className="mt-1 text-xs font-bold text-purple-300">
            {issues.length > 0 ? `${issues.length} Findings Logged` : "Baseline Secured"}
          </p>
        </div>
      </div>

      {/* PDF REPORT SECTIONS SUMMARY */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Sparkles size={14} className="text-purple-400" />
          Included in This Executive PDF:
        </h3>
        <div className="grid grid-cols-1 gap-2 text-xs text-zinc-300 sm:grid-cols-2 md:grid-cols-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            <span>Target Recon & Technology</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            <span>SSL/TLS Cipher Validation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            <span>HTTP Security Headers Table</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            <span>AI Risk & Vulnerability Tiers</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            <span>Remediation Action Plan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            <span>Numbered Confidential Footer</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReportCard;