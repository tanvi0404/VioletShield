import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Shield,
  ShieldAlert,
  Copy,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";
import { searchCVE } from "../../api/scannerApi";

const CveSearch = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const sampleQueries = [
    "CVE-2021-41773",
    "CVE-2021-44228",
    "vsftpd 2.3.4",
    "Apache 2.4.49",
    "Apache 2.4.50",
    "OpenSSH 7.2p2",
    "Samba 3.0.20",
    "ProFTPD 1.3.5"
  ];

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) {
      setErrorMessage("Please enter a software name or CVE ID (e.g., 'Apache 2.4.49' or 'CVE-2021-41773').");
      return;
    }

    setErrorMessage("");
    setLoading(true);
    setResults(null);

    try {
      const data = await searchCVE(q.trim());
      if (data.error) {
        setErrorMessage(data.error);
      } else if (data.cve_id) {
        // Single CVE ID direct lookup response
        setResults([data]);
      } else {
        setResults(data.cves || []);
      }
    } catch (err) {
      console.error("CVE SEARCH ERROR:", err);
      setErrorMessage(
        err.response?.data?.error || "Failed to query CVE Intelligence database. Check backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyCveId = (cveId, idx) => {
    navigator.clipboard.writeText(cveId);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSeverityBadge = (severity, score) => {
    const sev = (severity || "").toUpperCase();
    if (sev === "CRITICAL" || score >= 9.0) {
      return "border-rose-500/50 bg-rose-500/20 text-rose-300";
    }
    if (sev === "HIGH" || score >= 7.0) {
      return "border-orange-500/50 bg-orange-500/20 text-orange-300";
    }
    if (sev === "MEDIUM" || score >= 4.0) {
      return "border-yellow-500/50 bg-yellow-500/20 text-yellow-300";
    }
    return "border-emerald-500/50 bg-emerald-500/20 text-emerald-300";
  };

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-zinc-950 to-black p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-purple-300">
          <ShieldAlert size={14} />
          Phase 6 CVE Intelligence
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
          NIST CVE Database & Vulnerability Lookup
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Query official National Vulnerability Database records, CVSS scores, affected software versions, and official mitigation advisories.
        </p>
      </motion.div>

      {/* SEARCH INPUT */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              placeholder="Enter CVE ID (CVE-2021-41773) or software (Apache 2.4.49, OpenSSH 7.2)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={loading}
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-900/90 py-4 pl-12 pr-4 font-mono text-sm text-white outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-60"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-500 px-8 py-4 font-semibold text-white shadow-lg shadow-purple-600/30 transition-all hover:scale-105 hover:shadow-purple-600/50 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Searching NVD...</span>
              </>
            ) : (
              <>
                <Search size={18} />
                <span>Search CVEs</span>
              </>
            )}
          </button>
        </div>

        {/* QUICK QUERY PRESETS */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Suggested Signatures:
          </span>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {sampleQueries.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(item);
                  handleSearch(item);
                }}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-300 transition-all hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-300"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-400 flex items-center gap-2">
            <AlertTriangle size={18} />
            {errorMessage}
          </div>
        )}
      </div>

      {/* RESULTS LIST */}
      {results !== null && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield size={18} className="text-purple-400" />
              NVD Vulnerability Matches ({results.length})
            </h2>
            <span className="text-xs font-mono text-zinc-400">
              Query: <span className="text-purple-300 font-bold">{query}</span>
            </span>
          </div>

          {results.length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center space-y-2">
              <p className="text-sm font-semibold text-zinc-300">
                No official CVE entries matched your query.
              </p>
              <p className="text-xs text-zinc-500">
                Try querying with broader software names (e.g., 'Apache 2.4' instead of sub-builds).
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((cve, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 transition-all hover:border-purple-500/40 hover:shadow-xl"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-black text-white">
                        {cve.cve_id}
                      </span>
                      <span className={`rounded-lg border px-2.5 py-0.5 font-mono text-xs font-bold ${getSeverityBadge(cve.severity, cve.cvss_score)}`}>
                        CVSS {cve.cvss_score || "N/A"} {cve.severity || "UNKNOWN"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => copyCveId(cve.cve_id, idx)}
                        className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-purple-500 hover:text-white"
                      >
                        <Copy size={13} />
                        {copiedId === idx ? "Copied!" : "Copy ID"}
                      </button>
                      <a
                        href={`https://nvd.nist.gov/vuln/detail/${cve.cve_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 transition hover:bg-purple-500/20"
                      >
                        <ExternalLink size={13} />
                        <span>NVD Official</span>
                      </a>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {cve.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] font-mono text-zinc-500 border-t border-zinc-900">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      Published: {cve.published_date || "Unknown"}
                    </span>
                    <span>
                      Target: <span className="text-zinc-400">{cve.affected_versions || query}</span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default CveSearch;
