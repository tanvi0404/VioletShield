import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCode,
  UploadCloud,
  Search,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Binary,
  Layers,
  Activity,
  HardDrive,
  Cpu,
  Clock,
  Sparkles,
  ExternalLink,
  Wrench
} from "lucide-react";
import { scanFile, lookupFileHash } from "../../api/scannerApi";

const SAMPLE_HASHES = [
  { label: "WannaCry Ransomware", hash: "84c82835a5d21bbcf75a61706d8ab549" },
  { label: "Emotet Banking Trojan", hash: "41ed497e7dd271b86d141e97c9b26500" },
  { label: "LockBit 3.0 Sample", hash: "d6f5195e2f75a6c174d1561f38e68bb5a6bfd484b3faeb48b04a919fcd9cfda5" }
];

const FileAnalysis = () => {
  const [activeTab, setActiveTab] = useState("upload"); // 'upload' | 'hash'
  const [file, setFile] = useState(null);
  const [hashInput, setHashInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [filterEngine, setFilterEngine] = useState("ALL");

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError("");
    }
  };

  const handleScanFile = async () => {
    if (!file) {
      setError("Please select or drop a file to analyze.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);
      const res = await scanFile(file);
      if (res.error) {
        setError(res.error);
      } else {
        setResult(res);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to analyze file.");
    } finally {
      setLoading(false);
    }
  };

  const handleHashLookup = async (hashToSearch) => {
    const query = (hashToSearch || hashInput).trim();
    if (!query) {
      setError("Please enter a valid SHA-256, MD5, or SHA-1 hash.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);
      const res = await lookupFileHash(query);
      if (res.error) {
        setError(res.error);
      } else {
        setResult(res);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Hash query failed.");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityStyle = (sev) => {
    switch ((sev || "").toUpperCase()) {
      case "CRITICAL":
        return "border-rose-500/50 bg-rose-500/10 text-rose-300";
      case "HIGH":
        return "border-orange-500/50 bg-orange-500/10 text-orange-300";
      case "MEDIUM":
        return "border-amber-500/50 bg-amber-500/10 text-amber-300";
      case "LOW":
        return "border-blue-500/50 bg-blue-500/10 text-blue-300";
      default:
        return "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
    }
  };

  const assessment = result?.security_assessment || {};
  const metadata = result?.metadata || {};
  const hashes = result?.hashes || (result?.hash ? { sha256: result.hash } : {});
  const vt = result?.virustotal || {};
  const engines = vt.engine_detections || [];
  const stats = vt.stats || { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 };

  const filteredEngines = engines.filter((e) => {
    if (filterEngine === "MALICIOUS") return e.category === "malicious" || e.category === "suspicious";
    if (filterEngine === "CLEAN") return e.category !== "malicious" && e.category !== "suspicious";
    return true;
  });

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* HERO BANNER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-zinc-950 to-black p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-300">
              <Sparkles size={14} className="text-purple-400" />
              Phase 8 Multi-Engine Malware Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Malware & File Threat Analysis
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl">
              Inspect suspicious executables, documents, and scripts with cryptographic checksums, Shannon entropy calculations, and live VirusTotal multi-engine AV detections.
            </p>
          </div>

          {/* TAB SELECTOR */}
          <div className="flex rounded-2xl border border-zinc-800 bg-zinc-900/90 p-1.5 shrink-0 self-start md:self-auto">
            <button
              onClick={() => { setActiveTab("upload"); setError(""); }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "upload"
                  ? "bg-gradient-to-r from-purple-600 to-violet-500 text-white shadow-lg shadow-purple-600/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <UploadCloud size={15} />
              File Upload
            </button>
            <button
              onClick={() => { setActiveTab("hash"); setError(""); }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "hash"
                  ? "bg-gradient-to-r from-purple-600 to-violet-500 text-white shadow-lg shadow-purple-600/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Binary size={15} />
              Hash Lookup
            </button>
          </div>
        </div>
      </motion.div>

      {/* INPUT CONTROLS */}
      {activeTab === "upload" ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-6"
        >
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer ${
              file ? "border-purple-500/60 bg-purple-950/20" : "border-zinc-800 hover:border-purple-500/40 bg-zinc-900/40"
            }`}
            onClick={() => document.getElementById("file-upload-input").click()}
          >
            <input
              id="file-upload-input"
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600/20 text-purple-400 mb-4 shadow-[0_0_25px_rgba(168,85,247,0.3)]">
              <UploadCloud size={28} />
            </div>
            {file ? (
              <div className="space-y-1">
                <p className="text-base font-bold text-white">{file.name}</p>
                <p className="text-xs font-mono text-purple-300">
                  {(file.size / 1024).toFixed(1)} KB &bull; {file.type || "binary payload"}
                </p>
                <p className="text-xs text-zinc-400 pt-2">Click or drop another file to replace</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-base font-bold text-white">Drag & drop your suspicious file here</p>
                <p className="text-xs text-zinc-400">Supports .exe, .dll, .pdf, .zip, .sh, .py, .php up to 32MB</p>
                <p className="text-xs font-semibold text-purple-400 pt-2">or browse files from your computer</p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleScanFile}
              disabled={loading || !file}
              className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold transition shadow-lg ${
                loading || !file
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-violet-500 text-white shadow-purple-600/30 hover:scale-102"
              }`}
            >
              {loading ? (
                <>
                  <Activity size={18} className="animate-spin" />
                  Analyzing Artifact & Querying VirusTotal...
                </>
              ) : (
                <>
                  <FileCode size={18} />
                  Analyze File
                </>
              )}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-6"
        >
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Query VirusTotal Global Malware Database by Hash
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
                <input
                  type="text"
                  placeholder="Enter SHA-256, MD5, or SHA-1 hash..."
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleHashLookup()}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 py-3.5 pl-12 pr-4 font-mono text-sm text-white outline-none transition focus:border-purple-500"
                />
              </div>
              <button
                onClick={() => handleHashLookup()}
                disabled={loading || !hashInput.trim()}
                className={`flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold transition shadow-lg ${
                  loading || !hashInput.trim()
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-violet-500 text-white shadow-purple-600/30 hover:scale-102"
                }`}
              >
                {loading ? <Activity size={18} className="animate-spin" /> : <Search size={18} />}
                Lookup Hash
              </button>
            </div>
          </div>

          {/* SAMPLE HASH CHIPS */}
          <div className="space-y-2 pt-2 border-t border-zinc-900">
            <span className="text-xs text-zinc-500 block">Quick Test Malware Samples:</span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_HASHES.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setHashInput(s.hash);
                    handleHashLookup(s.hash);
                  }}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:border-purple-500/50 hover:text-white transition flex items-center gap-2"
                >
                  <span className="text-purple-400 font-bold">{s.label}:</span>
                  <span className="text-zinc-500">{s.hash.slice(0, 10)}...</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ERROR BANNER */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-4 text-sm text-rose-300 flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="text-xs font-bold text-rose-400 hover:text-rose-200">
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESULTS DISPLAY */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* EXECUTIVE ASSESSMENT CARD */}
          <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-zinc-950 to-black p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-purple-500/20 pb-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border shadow-xl ${getSeverityStyle(assessment.severity)}`}>
                  {assessment.severity === "CRITICAL" || assessment.severity === "HIGH" ? (
                    <ShieldAlert size={28} />
                  ) : (
                    <ShieldCheck size={28} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md border px-2.5 py-0.5 text-xs font-black uppercase font-mono ${getSeverityStyle(assessment.severity)}`}>
                      {assessment.severity || "CLEAN"}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Detection Ratio: <strong className="text-white">{assessment.detection_ratio || "0/70"}</strong>
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">
                    {assessment.risk_label || "Security Assessment Complete"}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 px-4 py-2 text-right">
                  <span className="text-[10px] uppercase text-zinc-500 block">Threat Score</span>
                  <span className={`text-xl font-black ${
                    assessment.threat_score >= 70 ? "text-rose-400" : assessment.threat_score >= 30 ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {assessment.threat_score || 0} / 100
                  </span>
                </div>
              </div>
            </div>

            {/* DETECTION STATS COUNTERS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/10 p-4">
                <span className="text-[11px] font-bold uppercase text-zinc-400 block">Malicious Engines</span>
                <span className="text-2xl font-black text-rose-400">{stats.malicious || 0}</span>
              </div>
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/10 p-4">
                <span className="text-[11px] font-bold uppercase text-zinc-400 block">Suspicious Engines</span>
                <span className="text-2xl font-black text-amber-400">{stats.suspicious || 0}</span>
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-4">
                <span className="text-[11px] font-bold uppercase text-zinc-400 block">Harmless / Clean</span>
                <span className="text-2xl font-black text-emerald-400">{stats.harmless || 0}</span>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                <span className="text-[11px] font-bold uppercase text-zinc-400 block">Undetected</span>
                <span className="text-2xl font-black text-zinc-300">{stats.undetected || 0}</span>
              </div>
            </div>

            {/* THREAT REASONS & ACTIONS */}
            {assessment.threat_reasons?.length > 0 && (
              <div className="space-y-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Activity size={14} /> Key Threat Factors Observed:
                </h3>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {assessment.threat_reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-purple-400">&bull;</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* TWO COLUMN GRID: HASHES & METADATA */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* CRYPTOGRAPHIC HASHES */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-4 font-mono">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-sans">
                <Binary size={18} className="text-purple-400" />
                Cryptographic File Hashes
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">SHA-256 Checksum:</span>
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 p-2.5">
                    <span className="text-purple-300 truncate">{hashes.sha256 || "N/A"}</span>
                    <button
                      onClick={() => handleCopy(hashes.sha256, "sha256")}
                      className="text-zinc-400 hover:text-white p-1"
                      title="Copy SHA-256"
                    >
                      {copiedKey === "sha256" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {hashes.md5 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">MD5 Checksum:</span>
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 p-2.5">
                      <span className="text-zinc-300 truncate">{hashes.md5}</span>
                      <button
                        onClick={() => handleCopy(hashes.md5, "md5")}
                        className="text-zinc-400 hover:text-white p-1"
                        title="Copy MD5"
                      >
                        {copiedKey === "md5" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                )}

                {hashes.sha1 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">SHA-1 Checksum:</span>
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 p-2.5">
                      <span className="text-zinc-300 truncate">{hashes.sha1}</span>
                      <button
                        onClick={() => handleCopy(hashes.sha1, "sha1")}
                        className="text-zinc-400 hover:text-white p-1"
                        title="Copy SHA-1"
                      >
                        {copiedKey === "sha1" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* FILE METADATA & SHANNON ENTROPY */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-4 font-mono">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-sans">
                <Cpu size={18} className="text-purple-400" />
                File Metadata & Shannon Entropy
              </h3>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5">
                    <span className="text-[10px] uppercase text-zinc-500 block">File Size</span>
                    <span className="text-white font-bold">{metadata.file_size_human || "N/A"}</span>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5">
                    <span className="text-[10px] uppercase text-zinc-500 block">MIME Type</span>
                    <span className="text-white font-bold truncate block">{metadata.mime_type || "N/A"}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5">
                  <span className="text-[10px] uppercase text-zinc-500 block">Magic Byte Signature</span>
                  <span className="text-purple-300 font-bold">{metadata.file_type_magic || "N/A"}</span>
                </div>

                {metadata.entropy !== undefined && (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-400">Shannon Entropy:</span>
                      <span className={`font-bold ${metadata.is_suspicious_entropy ? "text-rose-400" : "text-emerald-400"}`}>
                        {metadata.entropy} / 8.0 {metadata.is_suspicious_entropy && "(High - Packed/Encrypted)"}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          metadata.entropy >= 7.2 ? "bg-rose-500" : metadata.entropy >= 5.0 ? "bg-purple-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${(metadata.entropy / 8.0) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ANTIVIRUS ENGINE DETECTION BREAKDOWN */}
          {engines.length > 0 && (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers size={18} className="text-purple-400" />
                    Security Engine Detections ({engines.length})
                  </h3>
                  <p className="text-xs text-zinc-400">AV engine vendor verdicts from VirusTotal threat intelligence</p>
                </div>

                <div className="flex gap-1.5">
                  {["ALL", "MALICIOUS", "CLEAN"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilterEngine(f)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                        filterEngine === f
                          ? "border-purple-500 bg-purple-600 text-white"
                          : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
                <div className="grid grid-cols-12 border-b border-zinc-800 bg-zinc-900/80 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  <div className="col-span-4 sm:col-span-4">Security Engine</div>
                  <div className="col-span-5 sm:col-span-5">Detection Verdict</div>
                  <div className="col-span-3 sm:col-span-3 text-right">Category</div>
                </div>

                <div className="divide-y divide-zinc-800/60 max-h-96 overflow-y-auto font-mono text-xs">
                  {filteredEngines.map((eng, idx) => (
                    <div key={idx} className="grid grid-cols-12 items-center px-4 py-2.5 hover:bg-purple-950/10">
                      <div className="col-span-4 font-bold text-white">{eng.engine_name}</div>
                      <div className="col-span-5 text-purple-300 truncate">{eng.result}</div>
                      <div className="col-span-3 text-right">
                        <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${
                          eng.category === "malicious"
                            ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                            : eng.category === "suspicious"
                            ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                            : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                        }`}>
                          {eng.category || "undetected"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default FileAnalysis;
