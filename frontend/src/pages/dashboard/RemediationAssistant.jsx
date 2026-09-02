import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Sparkles,
  Copy,
  Check,
  Download,
  Terminal,
  Code2,
  FileCode,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Play,
  Layers,
  ArrowRight,
  Loader2,
  BookOpen,
  CheckCircle2,
  ListOrdered,
  FileText
} from "lucide-react";
import { generatePatch, getRemediationCatalog } from "../../api/scannerApi";

const PRESET_OPTIONS = [
  { id: "CVE-2021-44228", label: "Log4Shell (CVE-2021-44228)", tech: "Java / Maven" },
  { id: "SQL_INJECTION", label: "SQL Injection Parameterization", tech: "Python / PostgreSQL" },
  { id: "NGINX_SECURITY_HEADERS", label: "Nginx Hardening Headers", tech: "Nginx Server" },
  { id: "DOCKER_ROOT_CONTAINER", label: "Non-Root Docker User", tech: "Docker Container" },
  { id: "EXPOSED_SSH_PORT", label: "Firewall SSH Ingress Lock", tech: "UFW / Linux" },
  { id: "S3_PUBLIC_BUCKET", label: "AWS S3 Private ACL", tech: "Terraform IaC" },
];

const RemediationAssistant = () => {
  const [cveId, setCveId] = useState("CVE-2021-44228");
  const [title, setTitle] = useState("Apache Log4j JNDI Remote Code Execution");
  const [tech, setTech] = useState("java");
  const [snippet, setSnippet] = useState("");
  const [loading, setLoading] = useState(false);
  const [patchData, setPatchData] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedVerify, setCopiedVerify] = useState(false);

  useEffect(() => {
    // Generate initial preset patch
    handleGenerate({ cve_id: "CVE-2021-44228", title: "Apache Log4j JNDI Remote Code Execution", technology: "java" });
  }, []);

  const handleSelectPreset = (preset) => {
    setCveId(preset.id);
    setTitle(preset.label);
    setTech(preset.tech.toLowerCase());
    handleGenerate({ cve_id: preset.id, title: preset.label, technology: preset.tech });
  };

  const handleGenerate = async (payloadOverride = null) => {
    setLoading(true);
    try {
      const payload = payloadOverride || {
        cve_id: cveId.trim(),
        title: title.trim(),
        technology: tech.trim(),
        code_snippet: snippet.trim()
      };
      const res = await generatePatch(payload);
      setPatchData(res);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to generate security patch");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else if (type === "cmd") {
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    } else if (type === "verify") {
      setCopiedVerify(true);
      setTimeout(() => setCopiedVerify(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!patchData || !patchData.patch_content) return;
    const blob = new Blob([patchData.patch_content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = patchData.download_filename || "security-patch.diff";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getSeverityBadge = (sev) => {
    switch ((sev || "").toUpperCase()) {
      case "CRITICAL":
        return "border-rose-500/40 bg-rose-500/15 text-rose-300";
      case "HIGH":
        return "border-orange-500/40 bg-orange-500/15 text-orange-300";
      case "MEDIUM":
        return "border-amber-500/40 bg-amber-500/15 text-amber-300";
      default:
        return "border-emerald-500/40 bg-emerald-500/15 text-emerald-300";
    }
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* HEADER BANNER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-zinc-950 to-black p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-violet-300">
              <Sparkles size={14} className="text-violet-400 animate-pulse" />
              Phase 17 Automated Remediation & Security Patch Generator
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
              AI-Assisted Patching & Vulnerability Remediation
            </h1>
            <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
              Generate production-ready code diffs, server hardening configs, firewall isolation scripts, and step-by-step mitigation roadmaps for discovered security vulnerabilities.
            </p>
          </div>

          <div className="rounded-2xl border border-violet-500/30 bg-zinc-900/90 p-4 font-mono text-center shrink-0">
            <span className="text-[10px] text-zinc-500 block uppercase">Remediation Engine</span>
            <span className="text-lg font-black text-violet-400 flex items-center justify-center gap-1.5">
              <Wrench size={18} />
              Deterministic & AI
            </span>
          </div>
        </div>
      </motion.div>

      {/* PRESETS BAR */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-zinc-400 block font-mono uppercase">Quick Remediation Presets:</span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {PRESET_OPTIONS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`rounded-xl border px-3.5 py-2 text-xs font-mono font-bold transition whitespace-nowrap flex items-center gap-2 ${
                cveId === p.id
                  ? "border-violet-500 bg-violet-600/25 text-violet-200 shadow-md shadow-violet-600/20"
                  : "border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700 hover:text-white"
              }`}
            >
              <FileCode size={14} className="text-violet-400" />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN WORKBENCH GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* INPUT DRAWER */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-4 font-sans">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Wrench size={18} className="text-violet-400" />
            Vulnerability Specifications
          </h2>
          <p className="text-xs text-zinc-400">Specify finding metadata to synthesize an automated security patch.</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="space-y-3"
          >
            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1">CVE ID / Classification</label>
              <input
                type="text"
                placeholder="e.g. CVE-2021-44228 or CWE-89"
                value={cveId}
                onChange={(e) => setCveId(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-white outline-none focus:border-violet-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1">Vulnerability Title / Issue</label>
              <input
                type="text"
                placeholder="e.g. SQL Injection in authentication service"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-white outline-none focus:border-violet-500 font-sans"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1">Target Technology / Framework</label>
              <input
                type="text"
                placeholder="e.g. Python, Nginx, Docker, Kubernetes, Java"
                value={tech}
                onChange={(e) => setTech(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-white outline-none focus:border-violet-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1">Insecure Code Snippet (Optional)</label>
              <textarea
                rows={4}
                placeholder="Paste affected code snippet or config block..."
                value={snippet}
                onChange={(e) => setSnippet(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-violet-300 outline-none focus:border-violet-500 font-mono resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 hover:brightness-110 transition disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              <span>{loading ? "Generating Patch Artifacts..." : "Generate Security Patch"}</span>
            </button>
          </form>
        </div>

        {/* PATCH VIEWER OUTPUT */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-16 text-center space-y-3">
              <Loader2 size={36} className="animate-spin mx-auto text-violet-400" />
              <p className="text-sm font-mono text-zinc-400">Synthesizing Contextual Security Code Diff...</p>
            </div>
          ) : patchData ? (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              {/* PATCH HEADER */}
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`rounded-md border px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase ${getSeverityBadge(patchData.severity)}`}>
                      {patchData.severity}
                    </span>
                    <span className="rounded-md border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-violet-300">
                      {patchData.patch_type}
                    </span>
                    <h3 className="font-bold text-white text-sm">{patchData.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(patchData.patch_content, "code")}
                      className="flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-mono font-bold text-violet-300 hover:bg-violet-600 hover:text-white transition"
                    >
                      {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedCode ? "Copied" : "Copy Patch"}</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-1.5 text-xs font-mono font-bold text-white hover:bg-violet-500 transition shadow-lg shadow-violet-600/30"
                    >
                      <Download size={14} />
                      <span>{patchData.download_filename || "Download"}</span>
                    </button>
                  </div>
                </div>

                {/* CODE DIFF / CONFIG VIEWER */}
                <div className="relative rounded-2xl border border-zinc-800 bg-[#09090d] p-4 font-mono text-xs overflow-x-auto">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pb-2 border-b border-zinc-800/80 mb-3">
                    <span>Artifact: <b>{patchData.download_filename}</b></span>
                    <span>Language: {patchData.patch_language}</span>
                  </div>
                  <pre className="text-zinc-300 leading-relaxed font-mono">
                    {patchData.patch_content?.split("\n").map((line, idx) => {
                      let colorClass = "text-zinc-300";
                      if (line.startsWith("+") && !line.startsWith("+++")) colorClass = "text-emerald-400 bg-emerald-950/30 px-1 rounded block";
                      else if (line.startsWith("-") && !line.startsWith("---")) colorClass = "text-rose-400 bg-rose-950/30 px-1 rounded block";
                      else if (line.startsWith("@@") || line.startsWith("#")) colorClass = "text-violet-400";
                      return (
                        <div key={idx} className={colorClass}>
                          {line}
                        </div>
                      );
                    })}
                  </pre>
                </div>

                {/* HARDENING SHELL COMMAND */}
                {patchData.shell_command && (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 font-mono">
                        <Terminal size={14} className="text-violet-400" />
                        CLI Hardening Command / Script:
                      </span>
                      <button
                        onClick={() => handleCopy(patchData.shell_command, "cmd")}
                        className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[10px] font-mono text-zinc-300 hover:text-white transition"
                      >
                        {copiedCmd ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedCmd ? "Copied" : "Copy Command"}</span>
                      </button>
                    </div>
                    <pre className="rounded-xl bg-black p-3 text-xs text-emerald-400 font-mono overflow-x-auto">
                      {patchData.shell_command}
                    </pre>
                  </div>
                )}

                {/* MITIGATION STEPS */}
                {patchData.steps && patchData.steps.length > 0 && (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2.5 font-sans">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ListOrdered size={14} className="text-violet-400" />
                      Step-by-Step Developer Mitigation Roadmap:
                    </span>
                    <ol className="space-y-1.5 text-xs text-zinc-300 list-decimal pl-4">
                      {patchData.steps.map((step, sIdx) => (
                        <li key={sIdx} className="leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* VERIFICATION COMMAND */}
                {patchData.verification_command && (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-mono text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        Mitigation Verification Test:
                      </span>
                      <code className="text-emerald-300">{patchData.verification_command}</code>
                    </div>
                    <button
                      onClick={() => handleCopy(patchData.verification_command, "verify")}
                      className="shrink-0 flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-300 hover:bg-emerald-500/20 transition"
                    >
                      {copiedVerify ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedVerify ? "Copied" : "Copy Test"}</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default RemediationAssistant;
