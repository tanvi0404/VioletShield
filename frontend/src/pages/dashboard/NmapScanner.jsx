import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Shield,
  Search,
  Loader2,
  Server,
  Cpu,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  Bug,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  CheckSquare,
  Wrench
} from "lucide-react";
import { scanNmap } from "../../api/scannerApi";
import AuthorizationNotice from "../../components/common/AuthorizationNotice";


const NmapScanner = () => {
  const [target, setTarget] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [threatIntel, setThreatIntel] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [copiedPath, setCopiedPath] = useState(null);
  const [expandedPorts, setExpandedPorts] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const quickTargets = ["scanme.nmap.org", "127.0.0.1", "localhost"];

  const handleScan = async () => {
    if (!target.trim()) {
      setErrorMessage("Please specify a valid target IP or hostname.");
      return;
    }
    if (!authorized) {
      setErrorMessage("You must confirm authorization before scanning.");
      return;
    }

    setErrorMessage("");
    setLoading(true);
    setScanResult(null);
    setThreatIntel(null);
    setAiAnalysis(null);

    try {
      const data = await scanNmap(target.trim());
      if (data.error) {
        setErrorMessage(data.error);
      } else {
        setScanResult(data.nmap_result || {});
        setThreatIntel(data.threat_intelligence || {});
        setAiAnalysis(data.ai_analysis || null);
        // Auto-expand all open ports
        const initialExpanded = {};
        Object.values(data.nmap_result || {}).forEach((host) => {

          (host.services || []).forEach((s) => {
            if (s.state === "open") {
              initialExpanded[s.port] = true;
            }
          });
        });
        setExpandedPorts(initialExpanded);
      }
    } catch (err) {
      console.error("NMAP SCAN ERROR:", err);
      setErrorMessage(
        err.response?.data?.error || "Failed to execute Nmap & ExploitDB scan. Check backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(id);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const toggleExpand = (port) => {
    setExpandedPorts((prev) => ({ ...prev, [port]: !prev[port] }));
  };

  // Aggregated Stats
  let totalOpenPorts = 0;
  let totalExploits = 0;
  let detectedOS = "Unknown";
  let osAccuracy = 0;

  if (scanResult) {
    Object.values(scanResult).forEach((host) => {
      if (host.os_matches && host.os_matches.length > 0) {
        detectedOS = host.os_matches[0].name;
        osAccuracy = host.os_matches[0].accuracy;
      }
      (host.services || []).forEach((s) => {
        if (s.state === "open") {
          totalOpenPorts++;
          totalExploits += (s.exploits || []).length;
        }
      });
    });
  }

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER HERO */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-zinc-950 to-black p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-purple-300">
              <Terminal size={14} />
              Offensive & Defensive Intelligence
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
              Nmap & ExploitDB Advanced Scanner
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Deep service detection (<code className="text-purple-300">-sV</code>), OS fingerprinting (<code className="text-purple-300">-O</code>), banner grabbing, and automatic Searchsploit/ExploitDB vulnerability mapping.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-zinc-800 bg-black/60 px-4 py-3 text-center">
              <span className="text-xs text-zinc-500">Kali API Node</span>
              <div className="flex items-center justify-center gap-1.5 font-mono text-xs text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Port 8000
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SCAN CONTROLLER */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Search size={18} className="text-purple-400" />
          Target Configuration
        </h2>

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Server size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              placeholder="Enter IP address or domain (e.g. scanme.nmap.org, 192.168.1.1)"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={loading}
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-900/90 py-4 pl-12 pr-4 font-mono text-sm text-white outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-60"
            />
          </div>

          <button
            onClick={handleScan}
            disabled={loading || !authorized}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-500 px-8 py-4 font-semibold text-white shadow-lg shadow-purple-600/30 transition-all hover:scale-105 hover:shadow-purple-600/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Scanning Target...</span>
              </>
            ) : (
              <>
                <Terminal size={18} />
                <span>Launch Nmap Scan</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Targets */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-500">Quick Targets:</span>
          {quickTargets.map((q) => (
            <button
              key={q}
              onClick={() => setTarget(q)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-mono text-zinc-400 transition hover:border-purple-500 hover:text-white"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Authorization Notice */}
        <AuthorizationNotice checked={authorized} onChange={setAuthorized} />

        {errorMessage && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-400 flex items-center gap-2">
            <AlertTriangle size={18} />
            {errorMessage}
          </div>
        )}
      </div>

      {/* SCANNING PROGRESS OVERLAY */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-3xl border border-purple-500/20 bg-zinc-950 p-8 text-center space-y-4"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600/20 text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
            <Loader2 size={32} className="animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-white">Auditing Target Services & Exploits</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Executing Nmap service & OS detection, grabbing socket banners, and querying Kali Searchsploit / ExploitDB database...
          </p>
          <div className="flex justify-center items-center gap-2 pt-2 text-xs font-mono text-purple-300">
            <span>[HOST DISCOVERY]</span> → <span>[FINGERPRINTING]</span> → <span>[EXPLOIT SEARCH]</span>
          </div>
        </motion.div>
      )}

      {/* RESULTS DISPLAY */}
      {scanResult && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* STATS OVERVIEW */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <span className="text-xs font-medium text-zinc-400">Target Scanned</span>
              <p className="mt-2 font-mono text-lg font-bold text-white truncate">{target}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <span className="text-xs font-medium text-zinc-400">Open Services</span>
              <p className="mt-2 text-2xl font-black text-emerald-400">{totalOpenPorts}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <span className="text-xs font-medium text-zinc-400">ExploitDB Matches</span>
              <p className="mt-2 text-2xl font-black text-red-400">{totalExploits}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <span className="text-xs font-medium text-zinc-400">OS Detection</span>
              <p className="mt-2 text-sm font-bold text-purple-300 truncate" title={detectedOS}>
                {detectedOS} ({osAccuracy}%)
              </p>
            </div>
          </div>

          {/* AI VULNERABILITY ANALYSIS CARD (PHASE 5) */}
          {aiAnalysis && (

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-purple-500/40 bg-gradient-to-br from-purple-950/30 via-zinc-950 to-black p-6 md:p-8 space-y-6 shadow-xl"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-purple-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/20 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    <BrainCircuit size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      AI Security Assessment & Mitigation Plan
                    </h2>
                    <span className="text-xs text-purple-300 font-mono">
                      Engine: {aiAnalysis.engine_used || "VioletShield AI"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-xl border px-4 py-1.5 text-sm font-black uppercase tracking-wider ${
                      aiAnalysis.severity_level === "Critical"
                        ? "border-red-500/60 bg-red-500/20 text-red-300 animate-pulse"
                        : aiAnalysis.severity_level === "High"
                        ? "border-orange-500/60 bg-orange-500/20 text-orange-300"
                        : aiAnalysis.severity_level === "Medium"
                        ? "border-yellow-500/60 bg-yellow-500/20 text-yellow-300"
                        : "border-emerald-500/60 bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    {aiAnalysis.severity_level} Severity
                  </span>
                  <div className="rounded-xl border border-zinc-800 bg-black/60 px-3 py-1.5 text-xs font-mono text-zinc-300">
                    Threat Score: <span className="font-bold text-purple-400">{aiAnalysis.threat_score}/100</span>
                  </div>
                </div>
              </div>

              {/* SUMMARY NARRATIVE */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-sm text-zinc-200 leading-relaxed font-sans">
                  {aiAnalysis.vulnerability_summary}
                </p>
              </div>

              {/* 2-COLUMN: KEY REASONS & RECOMMENDED FIXES */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* KEY REASONS */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle size={16} className="text-yellow-400" />
                    Key Risk Factors & Findings
                  </h3>
                  <ul className="space-y-2">
                    {(aiAnalysis.key_reasons || []).map((reason, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400"></span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* RECOMMENDED FIXES */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Wrench size={16} className="text-emerald-400" />
                    Actionable Mitigation Steps
                  </h3>
                  <ul className="space-y-2">
                    {(aiAnalysis.recommended_fixes || []).map((fix, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <CheckSquare size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                        <span>{fix}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* HOSTS DETAIL */}
          {Object.entries(scanResult).map(([hostIp, hostData]) => {

            const hostThreat = threatIntel?.[hostIp]?.risk_analysis || {};
            const vtData = threatIntel?.[hostIp]?.virustotal || {};

            return (
              <div key={hostIp} className="space-y-6">
                {/* OS & THREAT INTEL CARD */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* OS CARD */}
                  <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
                    <div className="flex items-center gap-2 text-purple-400 font-semibold">
                      <Cpu size={20} />
                      <h3>Operating System Fingerprint</h3>
                    </div>
                    {hostData.os_matches && hostData.os_matches.length > 0 ? (
                      <div className="space-y-3">
                        {hostData.os_matches.slice(0, 3).map((os, idx) => (
                          <div key={idx} className="flex items-center justify-between rounded-xl bg-zinc-900 p-3">
                            <span className="text-sm font-medium text-white">{os.name}</span>
                            <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-xs font-bold text-purple-300">
                              {os.accuracy}% match
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500">No OS matches identified (requires root/syn probes or host filtered).</p>
                    )}
                  </div>

                  {/* THREAT INTEL CARD */}
                  <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
                    <div className="flex items-center gap-2 text-purple-400 font-semibold">
                      <Flame size={20} />
                      <h3>VirusTotal & IP Reputation ({hostIp})</h3>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-zinc-900 p-4">
                      <div>
                        <span className="text-xs text-zinc-400">Threat Assessment</span>
                        <p className={`text-lg font-black ${hostThreat.risk === "High" ? "text-red-400" : hostThreat.risk === "Medium" ? "text-yellow-400" : "text-emerald-400"}`}>
                          {hostThreat.risk || "Low"} Risk ({hostThreat.score || 0}/100)
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-zinc-400">Country</span>
                        <p className="text-sm font-bold text-white">{vtData.country || "Unknown"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SERVICES & EXPLOITS LIST */}
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Layers size={20} className="text-purple-400" />
                      Discovered Services & ExploitDB Correlation
                    </h3>
                    <span className="text-xs text-zinc-400">
                      Host: <code className="font-mono text-purple-300">{hostIp}</code>
                    </span>
                  </div>

                  <div className="space-y-4">
                    {(hostData.services || []).map((service, idx) => {
                      const isOpen = service.state === "open";
                      const exploits = service.exploits || [];
                      const isExpanded = expandedPorts[service.port] ?? false;

                      return (
                        <div
                          key={idx}
                          className={`rounded-2xl border transition-all duration-300 ${
                            exploits.length > 0
                              ? "border-red-500/40 bg-red-950/10"
                              : isOpen
                              ? "border-zinc-800 bg-zinc-900/60"
                              : "border-zinc-900 bg-black/40 opacity-60"
                          }`}
                        >
                          <div
                            onClick={() => toggleExpand(service.port)}
                            className="flex cursor-pointer items-center justify-between p-5"
                          >
                            <div className="flex items-center gap-4">
                              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-black font-mono text-sm font-black text-purple-300 border border-purple-500/20">
                                {service.port}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-white">
                                    {service.product || service.name || "Unknown Service"}
                                  </span>
                                  {service.version && (
                                    <span className="rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-300">
                                      v{service.version}
                                    </span>
                                  )}
                                  <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                      isOpen ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-800 text-zinc-500"
                                    }`}
                                  >
                                    {service.state}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-400 mt-1 font-mono">
                                  Protocol: TCP | Service: {service.name || "-"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {exploits.length > 0 ? (
                                <span className="flex items-center gap-1.5 rounded-xl border border-red-500/50 bg-red-500/20 px-3 py-1 text-xs font-bold text-red-300">
                                  <Bug size={14} />
                                  {exploits.length} Exploit{exploits.length > 1 ? "s" : ""}
                                </span>
                              ) : isOpen ? (
                                <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                                  No Known Exploits
                                </span>
                              ) : null}
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                          </div>

                          {/* EXPANDABLE DETAILS */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-zinc-800/80 p-5 space-y-4"
                              >
                                {/* BANNER SECTION */}
                                {service.banner && service.banner.banner && (
                                  <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                      Socket Banner Grab:
                                    </span>
                                    <pre className="mt-1.5 overflow-x-auto rounded-xl bg-black p-3 font-mono text-xs text-emerald-400 border border-zinc-800">
                                      {service.banner.banner}
                                    </pre>
                                  </div>
                                )}

                                 {/* OFFICIAL NIST CVE SECTION (PHASE 6) */}
                                {service.cves && service.cves.length > 0 && (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                                        <Shield size={14} />
                                        Official NIST CVE Intelligence ({service.cves.length}):
                                      </span>
                                    </div>
                                    <div className="space-y-2">
                                      {service.cves.map((cve, cveIdx) => (
                                        <div
                                          key={cveIdx}
                                          className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-3 space-y-1.5"
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <span className="font-mono text-xs font-bold text-white">
                                                {cve.cve_id}
                                              </span>
                                              <span
                                                className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                                                  cve.severity === "CRITICAL"
                                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                                    : cve.severity === "HIGH"
                                                    ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                                                    : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                                                }`}
                                              >
                                                CVSS {cve.cvss_score} {cve.severity}
                                              </span>
                                            </div>
                                            <span className="text-[10px] font-mono text-zinc-500">
                                              {cve.published_date}
                                            </span>
                                          </div>
                                          <p className="text-xs text-zinc-300 leading-relaxed">
                                            {cve.description}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* EXPLOITDB CORRELATIONS */}
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                                      <Bug size={14} />
                                      ExploitDB / Searchsploit Matches ({exploits.length}):
                                    </span>
                                    <span className="text-xs text-zinc-500 font-mono">
                                      Query: {service.product || service.name} {service.version}
                                    </span>
                                  </div>

                                  {exploits.length > 0 ? (
                                    <div className="mt-2 space-y-2">
                                      {exploits.map((exp, expIdx) => {
                                        const title = exp.title || exp.Title || exp.name || "Exploit reference";
                                        const path = exp.path || exp.Path || "N/A";
                                        const id = `${service.port}-${expIdx}`;

                                        return (
                                          <div
                                            key={expIdx}
                                            className="flex flex-col gap-2 rounded-xl border border-red-500/20 bg-black/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                                          >
                                            <div className="space-y-1">
                                              <p className="text-sm font-semibold text-red-200">{title}</p>
                                              <p className="font-mono text-xs text-zinc-400 break-all">{path}</p>
                                            </div>
                                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                              <button
                                                onClick={() => copyToClipboard(`searchsploit -x ${path}`, id)}
                                                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-300 transition hover:border-purple-500 hover:text-white"
                                                title="Copy Searchsploit CLI Command"
                                              >
                                                <Copy size={13} />
                                                {copiedPath === id ? "Copied!" : "Copy CLI"}
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="mt-2 text-xs text-zinc-500 italic">
                                      No direct ExploitDB proof-of-concept files found for this exact version string.
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default NmapScanner;
