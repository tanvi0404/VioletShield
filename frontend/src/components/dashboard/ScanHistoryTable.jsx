import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  History,
  Search,
  Download,
  ExternalLink,
  RotateCcw,
  Globe,
  Calendar,
  Filter,
  ShieldAlert,
  ShieldCheck,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { downloadReportPdf, downloadReportHtml } from "../../api/scannerApi";

const ScanHistoryTable = ({ scans = [] }) => {
  const [search, setSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState("ALL");

  const filtered = scans.filter((s) => {
    const target = (s.website || "").toLowerCase();
    const matchesSearch = target.includes(search.toLowerCase());
    const matchesRisk = filterRisk === "ALL" || (s.risk || "").toUpperCase() === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const getRiskBadge = (r) => {
    switch ((r || "").toLowerCase()) {
      case "high":
      case "critical":
        return "border-rose-500/40 bg-rose-500/10 text-rose-300";
      case "medium":
        return "border-amber-500/40 bg-amber-500/10 text-amber-300";
      default:
        return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
    }
  };

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 shadow-xl backdrop-blur-xl space-y-5 font-sans">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <History size={18} className="text-purple-400" />
            Recent Penetration Scan Activity
          </h2>
          <p className="text-xs text-zinc-400">Historical audit logs, score tracking, and report exports</p>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-900/80 py-1.5 pl-8 pr-3 text-xs text-white outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-1">
            {["ALL", "HIGH", "MEDIUM", "LOW"].map((rk) => (
              <button
                key={rk}
                onClick={() => setFilterRisk(rk)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  filterRisk === rk
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {rk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TABLE */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-zinc-500 text-xs space-y-2">
          <Activity size={32} className="mx-auto text-zinc-600" />
          <p>{search || filterRisk !== "ALL" ? "No scan records match filter." : "No target audits recorded yet."}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/40">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[10px] uppercase font-bold text-zinc-400">
                <th className="py-3 px-4">Target Endpoint</th>
                <th className="py-3 px-4">Security Score</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.map((s, idx) => {
                const reportId = s.id || idx + 1;
                const score = s.security_score ?? 0;
                const scoreColor = score >= 85 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-rose-400";
                const pdfUrl = downloadReportPdf(reportId);
                const htmlUrl = downloadReportHtml(reportId);

                return (
                  <tr key={s.id || idx} className="hover:bg-purple-950/10 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-purple-400 shrink-0" />
                        <div>
                          <span className="font-bold text-white font-sans block truncate max-w-xs">{s.website}</span>
                          <span className="text-[10px] text-zinc-500">IP: {s.ip || "N/A"}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`text-sm font-black ${scoreColor}`}>{score}%</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${getRiskBadge(s.risk)}`}>
                        {s.risk || "Low"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-zinc-400 text-[11px]">
                      {s.created_at ? s.created_at.slice(0, 16) : "Recent"}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-purple-500/30 bg-purple-600/10 p-1.5 text-purple-300 hover:bg-purple-600 hover:text-white transition"
                          title="Download PDF Report"
                        >
                          <Download size={12} />
                        </a>
                        <a
                          href={htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-1.5 text-cyan-300 hover:bg-cyan-600 hover:text-white transition"
                          title="View HTML Report"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScanHistoryTable;
