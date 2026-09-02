import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  Loader2,
  ChevronRight,
  ExternalLink,
  BookOpen,
  ArrowUpRight,
  Filter,
  FileText,
  Activity,
  Globe
} from "lucide-react";
import { getScans, getScanCompliance, evaluateCompliance, getComplianceFrameworks } from "../../api/scannerApi";

const Compliance = () => {
  const [activeFramework, setActiveFramework] = useState("UNIFIED"); // UNIFIED, PCI_DSS_V4, HIPAA_SECURITY, SOC2_TYPE2, ISO_27001
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState([]);
  const [selectedScanId, setSelectedScanId] = useState("");
  const [complianceData, setComplianceData] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const pastScans = await getScans().catch(() => []);
      setScans(pastScans || []);

      if (pastScans && pastScans.length > 0) {
        const firstScan = pastScans[0];
        setSelectedScanId(firstScan.id);
        const comp = await getScanCompliance(firstScan.id);
        setComplianceData(comp);
      } else {
        // Fallback to sample evaluation
        const sampleComp = await evaluateCompliance({
          website: "production-gateway.corp.local",
          ports: [{ port: 80 }, { port: 443 }],
          vulnerabilities: [{ title: "Nginx Version Exposure", severity: "LOW" }],
          ssl: { valid: true, protocol: "TLSv1.3" },
          headers: { "Strict-Transport-Security": "max-age=31536000", "Content-Security-Policy": "default-src 'self'" }
        });
        setComplianceData(sampleComp);
      }
    } catch (err) {
      console.error("COMPLIANCE INIT ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectScan = async (scanId) => {
    setSelectedScanId(scanId);
    setEvaluating(true);
    try {
      const comp = await getScanCompliance(scanId);
      setComplianceData(comp);
    } catch (err) {
      alert("Failed to load compliance report for this scan");
    } finally {
      setEvaluating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch ((status || "").toUpperCase()) {
      case "AUDIT_READY":
      case "PASS":
        return "border-emerald-500/40 bg-emerald-500/15 text-emerald-300";
      case "NEEDS_REMEDIATION":
      case "WARNING":
        return "border-amber-500/40 bg-amber-500/15 text-amber-300";
      default:
        return "border-rose-500/40 bg-rose-500/15 text-rose-300";
    }
  };

  const frameworksList = [
    { id: "UNIFIED", name: "Unified GRC Matrix", icon: <Layers size={16} /> },
    { id: "PCI_DSS_V4", name: "PCI-DSS v4.0", icon: <CreditCard size={16} /> },
    { id: "HIPAA_SECURITY", name: "HIPAA Security", icon: <HeartHandshake size={16} /> },
    { id: "SOC2_TYPE2", name: "SOC 2 Type II", icon: <ShieldCheck size={16} /> },
    { id: "ISO_27001", name: "ISO 27001:2022", icon: <Award size={16} /> },
  ];

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 size={36} className="animate-spin mx-auto text-purple-400" />
        <p className="text-sm font-mono text-zinc-400">Evaluating Regulatory Compliance & GRC Frameworks...</p>
      </div>
    );
  }

  const selectedFwData = complianceData?.frameworks?.[activeFramework];

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* HEADER BANNER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-black p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
              <Award size={14} className="text-emerald-400" />
              Phase 16 Regulatory Governance & Compliance Mapping Engine
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
              GRC Compliance & Audit Readiness
            </h1>
            <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
              Map technical vulnerabilities, open ports, SSL configurations, and security headers against regulatory controls for PCI-DSS v4.0, HIPAA, SOC 2, and ISO 27001.
            </p>
          </div>

          {/* SCAN SELECTOR */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 font-mono text-center shrink-0 space-y-1.5">
            <span className="text-[10px] text-zinc-500 block uppercase">Audited Perimeter Target</span>
            {scans.length > 0 ? (
              <select
                value={selectedScanId}
                onChange={(e) => handleSelectScan(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-black px-3 py-1.5 text-xs text-emerald-400 outline-none focus:border-emerald-500 font-mono"
              >
                {scans.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.website} (Score: {s.security_score}%)
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {complianceData?.target || "Target Host"}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* FRAMEWORK NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {frameworksList.map((fw) => (
          <button
            key={fw.id}
            onClick={() => setActiveFramework(fw.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeFramework === fw.id
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            {fw.icon}
            <span>{fw.name}</span>
          </button>
        ))}
      </div>

      {evaluating ? (
        <div className="py-20 text-center space-y-2">
          <Loader2 size={32} className="animate-spin mx-auto text-emerald-400" />
          <p className="text-xs font-mono text-zinc-400">Recomputing compliance gap analysis...</p>
        </div>
      ) : complianceData && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* TAB 1: UNIFIED GRC MATRIX */}
          {activeFramework === "UNIFIED" && (
            <div className="space-y-6">
              {/* OVERALL SCORECARDS */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-3xl border border-emerald-500/30 bg-zinc-950 p-6 shadow-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Overall Compliance Index</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">{complianceData.overall_score}%</span>
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${getStatusBadge(complianceData.overall_status)}`}>
                      {complianceData.overall_status}
                    </span>
                  </div>
                </div>

                <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Passed Controls</span>
                  <div className="text-3xl font-black text-emerald-400">
                    {complianceData.total_passed} / {complianceData.total_controls}
                  </div>
                </div>

                <div className="rounded-3xl border border-rose-500/30 bg-zinc-950 p-6 shadow-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Regulatory Gaps</span>
                  <div className="text-3xl font-black text-rose-400">
                    {complianceData.total_failed}
                  </div>
                </div>

                <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Frameworks Covered</span>
                  <div className="text-3xl font-black text-sky-400">
                    4 Standards
                  </div>
                </div>
              </div>

              {/* 4 FRAMEWORKS SUMMARY GRID */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {Object.values(complianceData.frameworks || {}).map((fw) => (
                  <div
                    key={fw.id}
                    onClick={() => setActiveFramework(fw.id)}
                    className="cursor-pointer rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl transition hover:border-emerald-500/40 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                          <Award size={18} className="text-emerald-400" />
                          {fw.name}
                        </h2>
                        <p className="text-xs text-zinc-400 mt-0.5">{fw.title}</p>
                      </div>
                      <span className={`rounded-md border px-2.5 py-1 text-xs font-mono font-bold uppercase ${getStatusBadge(fw.status)}`}>
                        {fw.status}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-zinc-400">Compliance Rate</span>
                        <span className="font-bold text-white">{fw.compliance_score}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                          style={{ width: `${fw.compliance_score}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pt-2 border-t border-zinc-800/80">
                      <span>Passed: <b className="text-emerald-400">{fw.passed_controls}</b> / {fw.total_controls}</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        View Audit Details <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SPECIFIC FRAMEWORK VIEW */}
          {activeFramework !== "UNIFIED" && selectedFwData && (
            <div className="space-y-6">
              {/* FRAMEWORK SCORECARD */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-emerald-500/30 bg-zinc-950 p-6 shadow-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{selectedFwData.name} Score</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">{selectedFwData.compliance_score}%</span>
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${getStatusBadge(selectedFwData.status)}`}>
                      {selectedFwData.status}
                    </span>
                  </div>
                </div>

                <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Passed Controls</span>
                  <div className="text-3xl font-black text-emerald-400">
                    {selectedFwData.passed_controls} / {selectedFwData.total_controls}
                  </div>
                </div>

                <div className="rounded-3xl border border-rose-500/30 bg-zinc-950 p-6 shadow-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Actionable Gaps</span>
                  <div className="text-3xl font-black text-rose-400">
                    {selectedFwData.failed_controls}
                  </div>
                </div>
              </div>

              {/* CONTROLS BREAKDOWN LIST */}
              <div className="space-y-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen size={18} className="text-emerald-400" />
                  {selectedFwData.name} Control Verification Audit
                </h2>

                <div className="space-y-4">
                  {selectedFwData.controls?.map((c, idx) => (
                    <div
                      key={idx}
                      className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl transition hover:border-emerald-500/30 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`rounded-md border px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase ${getStatusBadge(c.status)}`}>
                            {c.status}
                          </span>
                          <span className="font-mono text-xs font-bold text-emerald-400">{c.id}</span>
                          <h3 className="font-bold text-white text-sm">{c.name}</h3>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-500">
                          {c.category}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400">{c.requirement}</p>

                      {/* TECHNICAL EVIDENCE */}
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 font-mono text-xs space-y-1">
                        <span className="text-[10px] text-zinc-500 uppercase block">Audit Telemetry & Evidence:</span>
                        <p className={c.status === "PASS" ? "text-emerald-300" : "text-rose-300"}>
                          {c.technical_evidence}
                        </p>
                      </div>

                      {/* REMEDIATION STEPS IF FAILED */}
                      {c.status === "FAIL" && (
                        <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-3.5 text-xs font-sans text-amber-200 space-y-1">
                          <span className="text-[10px] font-mono text-amber-400 uppercase block font-bold">
                            ⚠️ Auditor Remediation Roadmap:
                          </span>
                          <p>{c.remediation_steps}</p>
                        </div>
                      )}
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

export default Compliance;
