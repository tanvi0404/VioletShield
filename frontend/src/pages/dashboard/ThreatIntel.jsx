import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Flame,
  Search,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  MapPin,
  Activity,
  Award,
  Radio,
  Server,
  Layers,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Calendar,
  Sparkles,
  Link as LinkIcon,
  Tag
} from "lucide-react";
import {
  checkThreatIntel,
  checkIpThreatIntel,
  checkDomainThreatIntel,
  checkUrlThreatIntel,
  checkDnsBlacklists
} from "../../api/scannerApi";
import AuthorizationNotice from "../../components/common/AuthorizationNotice";

const SAMPLES = {
  ip: [
    { label: "Cloudflare DNS", value: "1.1.1.1" },
    { label: "Google DNS", value: "8.8.8.8" },
    { label: "Known Tor Exit Relay", value: "185.220.101.5" },
    { label: "Malicious Host", value: "194.26.29.118" }
  ],
  domain: [
    { label: "GitHub", value: "github.com" },
    { label: "Google", value: "google.com" },
    { label: "Wikipedia", value: "wikipedia.org" },
    { label: "Pinterest", value: "pinterest.com" }
  ],
  url: [
    { label: "Secure Login", value: "https://github.com/login" },
    { label: "Example Target", value: "https://example.com/test" },
    { label: "Fastly Portal", value: "https://fastly.com/products" }
  ]
};

const ThreatIntel = () => {
  const [vector, setVector] = useState("ip"); // 'ip' | 'domain' | 'url'
  const [targetInput, setTargetInput] = useState("");
  const [authorized, setAuthorized] = useState(true);
  const [loading, setLoading] = useState(false);
  const [intelData, setIntelData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLookup = async (overrideTarget) => {
    const query = (overrideTarget || targetInput).trim();
    if (!query) {
      setErrorMessage("Please enter a target to analyze.");
      return;
    }
    if (!authorized) {
      setErrorMessage("Please confirm authorization before running threat intel checks.");
      return;
    }

    setErrorMessage("");
    setLoading(true);
    setIntelData(null);

    try {
      let data;
      if (vector === "domain") {
        data = await checkDomainThreatIntel(query);
      } else if (vector === "url") {
        data = await checkUrlThreatIntel(query);
      } else {
        data = await checkIpThreatIntel(query);
      }

      if (data.error) {
        setErrorMessage(data.error);
      } else {
        setIntelData(data.threat_data || data || {});
      }
    } catch (err) {
      console.error("THREAT INTEL ERROR:", err);
      setErrorMessage(
        err.response?.data?.error || "Failed to query threat intelligence services."
      );
    } finally {
      setLoading(false);
    }
  };

  const vt = intelData?.virustotal || {};
  const risk = intelData?.risk_analysis || {};
  const stats = vt.last_analysis_stats || {};
  const dnsbl = intelData?.dnsbl || {};
  const maliciousEngines = vt.malicious_engines || [];

  const getRiskStyle = (r) => {
    switch ((r || "").toLowerCase()) {
      case "critical":
        return "border-rose-500/50 bg-rose-500/10 text-rose-300";
      case "high":
        return "border-orange-500/50 bg-orange-500/10 text-orange-300";
      case "medium":
        return "border-amber-500/50 bg-amber-500/10 text-amber-300";
      default:
        return "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
    }
  };

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
              Phase 9 Multi-Vector Threat Intelligence Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Global Threat & Blacklist Intelligence
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl">
              Inspect IP addresses, domains, and URLs for malicious reputation, live DNS Blacklist (DNSBL) listings, registrar history, and security vendor detections.
            </p>
          </div>

          {/* VECTOR SELECTOR TABS */}
          <div className="flex rounded-2xl border border-zinc-800 bg-zinc-900/90 p-1.5 shrink-0 self-start md:self-auto">
            {[
              { id: "ip", label: "IP & DNSBL", icon: Globe },
              { id: "domain", label: "Domain Intel", icon: Server },
              { id: "url", label: "URL Scanner", icon: LinkIcon }
            ].map((t) => {
              const Icon = t.icon;
              const active = vector === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setVector(t.id);
                    setTargetInput("");
                    setErrorMessage("");
                  }}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    active
                      ? "bg-gradient-to-r from-purple-600 to-violet-500 text-white shadow-lg shadow-purple-600/30"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* INPUT CARD */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            {vector === "ip" ? (
              <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
            ) : vector === "domain" ? (
              <Server size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
            ) : (
              <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
            )}

            <input
              type="text"
              placeholder={
                vector === "ip"
                  ? "Enter IPv4 address (e.g. 8.8.8.8, 185.220.101.5)..."
                  : vector === "domain"
                  ? "Enter domain name (e.g. github.com, example.com)..."
                  : "Enter full URL (e.g. https://example.com/login)..."
              }
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              disabled={loading}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 py-3.5 pl-12 pr-4 font-mono text-sm text-white outline-none transition focus:border-purple-500"
            />
          </div>

          <button
            onClick={() => handleLookup()}
            disabled={loading || !authorized || !targetInput.trim()}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-600/30 transition hover:scale-102 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Auditing Intelligence...</span>
              </>
            ) : (
              <>
                <Search size={18} />
                <span>Analyze Threat</span>
              </>
            )}
          </button>
        </div>

        {/* Sample chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-500">Quick Samples:</span>
          {SAMPLES[vector]?.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTargetInput(s.value);
                handleLookup(s.value);
              }}
              className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1 font-mono text-zinc-300 transition hover:border-purple-500 hover:text-white"
            >
              <span className="text-purple-400 font-bold">{s.label}:</span> {s.value}
            </button>
          ))}
        </div>

        <AuthorizationNotice checked={authorized} onChange={setAuthorized} />

        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-4 text-sm text-rose-300 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage("")} className="text-xs font-bold text-rose-400 hover:text-rose-200">
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RESULTS DISPLAY */}
      {intelData && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* EXECUTIVE ASSESSMENT CARD */}
          <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-zinc-950 to-black p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-purple-500/20 pb-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border shadow-xl ${getRiskStyle(risk.risk)}`}>
                  {risk.risk === "High" || risk.risk === "Critical" ? (
                    <ShieldAlert size={28} />
                  ) : (
                    <ShieldCheck size={28} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md border px-2.5 py-0.5 text-xs font-black uppercase font-mono ${getRiskStyle(risk.risk)}`}>
                      {risk.risk || "LOW"} RISK
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Target: <strong className="text-white">{intelData.target || targetInput}</strong>
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">
                    {stats.malicious > 0 ? "Flagged by Security Vendors" : "Clean Threat Profile"}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 px-4 py-2 text-right">
                  <span className="text-[10px] uppercase text-zinc-500 block">Calculated Threat Score</span>
                  <span className={`text-xl font-black ${
                    (risk.score || 0) >= 50 ? "text-rose-400" : (risk.score || 0) >= 20 ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {risk.score ?? 0} / 100
                  </span>
                </div>
              </div>
            </div>

            {/* DETECTION STATS TILES */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/10 p-4">
                <span className="text-[11px] font-bold uppercase text-zinc-400 block">Malicious</span>
                <span className="text-2xl font-black text-rose-400">{stats.malicious ?? 0}</span>
              </div>
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/10 p-4">
                <span className="text-[11px] font-bold uppercase text-zinc-400 block">Suspicious</span>
                <span className="text-2xl font-black text-amber-400">{stats.suspicious ?? 0}</span>
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-4">
                <span className="text-[11px] font-bold uppercase text-zinc-400 block">Harmless</span>
                <span className="text-2xl font-black text-emerald-400">{stats.harmless ?? 0}</span>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                <span className="text-[11px] font-bold uppercase text-zinc-400 block">Undetected</span>
                <span className="text-2xl font-black text-zinc-300">{stats.undetected ?? 0}</span>
              </div>
            </div>
          </div>

          {/* METADATA & REPUTATION CARDS */}
          <div className="grid gap-6 lg:grid-cols-2 font-mono">
            {/* TARGET METADATA */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-sans">
                <Activity size={18} className="text-purple-400" />
                Infrastructure & Origin Metadata
              </h3>

              <div className="space-y-2.5 text-xs">
                {vt.country && (
                  <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
                    <span className="text-zinc-400 flex items-center gap-1.5 font-sans">
                      <MapPin size={14} className="text-purple-400" /> Country Origin:
                    </span>
                    <span className="text-white font-bold">{vt.country}</span>
                  </div>
                )}

                {vt.as_owner && (
                  <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
                    <span className="text-zinc-400 font-sans">Autonomous System (ASN):</span>
                    <span className="text-purple-300 font-bold truncate max-w-xs">{vt.as_owner} (AS{vt.asn})</span>
                  </div>
                )}

                {vt.registrar && (
                  <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
                    <span className="text-zinc-400 font-sans">Domain Registrar:</span>
                    <span className="text-white font-bold">{vt.registrar}</span>
                  </div>
                )}

                {vt.creation_date && (
                  <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
                    <span className="text-zinc-400 flex items-center gap-1.5 font-sans">
                      <Calendar size={14} className="text-purple-400" /> Registered On:
                    </span>
                    <span className="text-white font-bold">{vt.creation_date}</span>
                  </div>
                )}

                {vt.reputation !== undefined && (
                  <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
                    <span className="text-zinc-400 font-sans">VirusTotal Reputation Score:</span>
                    <span className={`font-bold ${vt.reputation >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {vt.reputation}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CATEGORIES & THREAT TAGS */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-sans">
                <Tag size={18} className="text-purple-400" />
                Threat Categories & Classification
              </h3>

              {intelData.categories?.length > 0 || vt.categories?.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  {(intelData.categories || vt.categories || []).map((cat, idx) => (
                    <span
                      key={idx}
                      className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-300"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 pt-2 font-sans">
                  No malicious threat categories or IoC tags attached to this endpoint.
                </p>
              )}

              {vt.tags?.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-zinc-900">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Security Tags:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {vt.tags.map((t, i) => (
                      <span key={i} className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-300">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DNS BLACKLIST (DNSBL) STATUS MATRIX */}
          {dnsbl.results?.length > 0 && (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Radio size={18} className="text-purple-400" />
                    DNS Blacklist (DNSBL) Verification ({dnsbl.total_listed} Listed)
                  </h3>
                  <p className="text-xs text-zinc-400">Live query status against industry spam and exploit databases</p>
                </div>

                <span className={`rounded-xl border px-3 py-1 text-xs font-bold font-mono ${
                  dnsbl.is_blacklisted ? "border-rose-500/40 bg-rose-500/10 text-rose-300" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                }`}>
                  {dnsbl.is_blacklisted ? "BLACKLISTED" : "CLEAN - NOT LISTED"}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 font-mono text-xs">
                {dnsbl.results.map((b, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2 hover:border-purple-500/30 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-sans">{b.name}</span>
                      {b.listed ? (
                        <span className="flex items-center gap-1 text-rose-400 text-[11px] font-bold">
                          <XCircle size={14} /> LISTED
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
                          <CheckCircle2 size={14} /> CLEAN
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 font-sans">{b.description}</p>
                    <span className="text-[10px] text-purple-400 block">{b.host}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VENDOR DETECTIONS MATRIX */}
          {maliciousEngines.length > 0 && (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers size={18} className="text-purple-400" />
                Flagged Security Engines ({maliciousEngines.length})
              </h3>

              <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 font-mono text-xs">
                <div className="grid grid-cols-12 border-b border-zinc-800 bg-zinc-900/80 px-4 py-3 text-[11px] font-bold uppercase text-zinc-400">
                  <div className="col-span-6">Security Engine</div>
                  <div className="col-span-6 text-right">Verdict / Classification</div>
                </div>
                <div className="divide-y divide-zinc-800/60 max-h-64 overflow-y-auto">
                  {maliciousEngines.map((eng, i) => (
                    <div key={i} className="grid grid-cols-12 items-center px-4 py-2.5 hover:bg-purple-950/10">
                      <div className="col-span-6 font-bold text-white">{eng.engine}</div>
                      <div className="col-span-6 text-right text-rose-400 font-bold">{eng.result}</div>
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

export default ThreatIntel;
