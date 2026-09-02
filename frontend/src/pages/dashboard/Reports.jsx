import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Globe,
  Loader2,
  Filter,
  Code,
  Sparkles,
  Layers,
  Award
} from "lucide-react";
import {
  getReports,
  downloadReportPdf,
  downloadReportJson,
  downloadReportHtml
} from "../../api/scannerApi";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRisk, setSelectedRisk] = useState("ALL");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getReports();
      setReports(Array.isArray(data) ? data.reverse() : []);
    } catch (err) {
      console.error("REPORT FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const website = (r.website || "").toLowerCase();
    const queryMatch = website.includes(searchQuery.toLowerCase());
    const riskMatch = selectedRisk === "ALL" || (r.risk || "").toUpperCase() === selectedRisk;
    return queryMatch && riskMatch;
  });

  const getRiskBadge = (risk) => {
    switch ((risk || "").toLowerCase()) {
      case "high":
      case "critical":
        return "border-rose-500/40 bg-rose-500/15 text-rose-300";
      case "medium":
        return "border-amber-500/40 bg-amber-500/15 text-amber-300";
      case "low":
      default:
        return "border-emerald-500/40 bg-emerald-500/15 text-emerald-300";
    }
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-zinc-950 to-black p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-purple-300">
              <Sparkles size={14} className="text-purple-400" />
              Phase 11 Automated Report Generation Engine
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
              Audit Archives & Compliance Exports
            </h1>
            <p className="mt-2 text-sm text-zinc-400 max-w-xl">
              Export comprehensive multi-vector penetration testing reports across PDF, standalone responsive HTML, and structured JSON SIEM formats.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 px-5 py-3.5 font-mono text-center shrink-0">
            <span className="text-[10px] text-zinc-500 block uppercase">Audit Database</span>
            <span className="text-xl font-black text-purple-300">{reports.length} Reports Saved</span>
          </div>
        </div>
      </motion.div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Filter reports by target domain or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2.5 pl-11 pr-4 text-xs text-white outline-none focus:border-purple-500 font-mono"
          />
        </div>

        {/* RISK FILTER PILLS */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <Filter size={14} className="text-zinc-500" />
          {["ALL", "HIGH", "MEDIUM", "LOW"].map((risk) => (
            <button
              key={risk}
              onClick={() => setSelectedRisk(risk)}
              className={`rounded-lg px-3 py-1.5 font-bold transition ${
                selectedRisk === risk
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {risk}
            </button>
          ))}
        </div>
      </div>

      {/* REPORTS LIST */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 size={36} className="animate-spin mx-auto text-purple-400" />
          <p className="text-sm text-zinc-400 font-mono">Retrieving security reports from audit repository...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center space-y-3">
          <FileText size={48} className="mx-auto text-zinc-600" />
          <h3 className="text-base font-bold text-white">No Security Reports Found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchQuery || selectedRisk !== "ALL"
              ? "No reports match your active filter criteria."
              : "Launch your first penetration scan to generate and persist detailed vulnerability audit reports."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report, idx) => {
            const reportId = report.id || idx + 1;
            const pdfUrl = downloadReportPdf(reportId);
            const htmlUrl = downloadReportHtml(reportId);
            const jsonUrl = downloadReportJson(reportId);

            const score = report.security_score ?? report.score ?? 0;
            const scoreColor = score >= 85 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-rose-400";

            return (
              <motion.div
                key={report.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="group rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 transition-all hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    {/* SCORE BADGE */}
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 font-mono font-black text-lg text-center shrink-0">
                      <span className={scoreColor}>{score}%</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Globe size={16} className="text-purple-400 shrink-0" />
                        <h3 className="font-bold text-white text-base truncate max-w-md">
                          {report.website}
                        </h3>
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase font-mono ${getRiskBadge(report.risk)}`}>
                          {report.risk || "Low"} Risk
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          {report.created_at ? new Date(report.created_at).toLocaleString() : "Recent"}
                        </span>
                        <span>•</span>
                        <span>Report ID: #{reportId}</span>
                      </div>
                    </div>
                  </div>

                  {/* MULTI-FORMAT EXPORT BUTTONS */}
                  <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center font-mono text-xs">
                    {/* PDF BUTTON */}
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-600/15 px-3.5 py-2 font-bold text-purple-300 transition hover:bg-purple-600 hover:text-white"
                      title="Download PDF Document"
                    >
                      <Download size={13} />
                      <span>PDF</span>
                    </a>

                    {/* HTML BUTTON */}
                    <a
                      href={htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-2 font-bold text-cyan-300 transition hover:bg-cyan-600 hover:text-white"
                      title="Open Standalone HTML Web Report"
                    >
                      <ExternalLink size={13} />
                      <span>HTML View</span>
                    </a>

                    {/* JSON BUTTON */}
                    <a
                      href={jsonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2 font-bold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                      title="View Raw JSON Telemetry"
                    >
                      <Code size={13} />
                      <span>JSON</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reports;
