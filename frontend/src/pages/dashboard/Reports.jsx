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
  ChevronDown,
  ChevronUp,
  Lock,
  Layers,
  Filter
} from "lucide-react";
import { getReports, downloadReportPdf } from "../../api/scannerApi";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRisk, setSelectedRisk] = useState("ALL");
  const [expandedReportId, setExpandedReportId] = useState(null);

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
    switch (risk) {
      case "High":
        return "border-rose-500/40 bg-rose-500/15 text-rose-300";
      case "Medium":
        return "border-amber-500/40 bg-amber-500/15 text-amber-300";
      case "Low":
      default:
        return "border-emerald-500/40 bg-emerald-500/15 text-emerald-300";
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-zinc-950 to-black p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-purple-300">
              <FileText size={14} />
              Audit Repository
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
              Security Reports & Compliance Archives
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Review historical penetration tests, download generated executive PDF reports, and track remediation over time.
            </p>
          </div>
          <span className="rounded-2xl border border-zinc-800 bg-black/60 px-5 py-3 font-mono text-xs text-purple-300 text-center">
            {reports.length} Reports Archived
          </span>
        </div>
      </motion.div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search reports by target domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2.5 pl-11 pr-4 text-xs text-white outline-none focus:border-purple-500"
          />
        </div>

        {/* RISK FILTER PILLS */}
        <div className="flex items-center gap-2 text-xs">
          <Filter size={14} className="text-zinc-500" />
          {["ALL", "HIGH", "MEDIUM", "LOW"].map((risk) => (
            <button
              key={risk}
              onClick={() => setSelectedRisk(risk)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition ${
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
          <p className="text-sm text-zinc-400 font-mono">Retrieving security reports from database...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center space-y-3">
          <FileText size={48} className="mx-auto text-zinc-600" />
          <h3 className="text-base font-bold text-white">No Security Reports Found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchQuery || selectedRisk !== "ALL"
              ? "No reports match your search or filter criteria."
              : "Launch your first scan to generate and persist detailed vulnerability audit reports."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report, idx) => {
            const isExpanded = expandedReportId === report.id;
            const pdfUrl = downloadReportPdf(report.id);

            return (
              <motion.div
                key={report.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="group rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 transition-all hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    {/* SCORE AVATAR */}
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 font-mono font-black text-lg text-purple-400">
                      {report.security_score ?? report.score ?? 0}%
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Globe size={16} className="text-purple-400" />
                        <h3 className="font-bold text-white text-base">
                          {report.website}
                        </h3>
                        <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${getRiskBadge(report.risk)}`}>
                          {report.risk || "Low"} Risk
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          {report.created_at ? new Date(report.created_at).toLocaleString() : "Recent"}
                        </span>
                        <span>•</span>
                        <span>ID: #{report.id || idx + 1}</span>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-purple-600/20 border border-purple-500/40 px-4 py-2.5 text-xs font-semibold text-purple-300 transition hover:bg-purple-600 hover:text-white"
                    >
                      <Download size={14} />
                      <span>Download PDF</span>
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
