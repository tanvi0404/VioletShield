import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud,
  FileCode,
  UploadCloud,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Code2,
  Terminal,
  BookOpen,
  Copy,
  Check,
  Sparkles,
  Loader2,
  Layers,
  ArrowRight,
  Filter,
  FileText
} from "lucide-react";
import { scanIacSnippet, scanIacFile, getIacRules } from "../../api/scannerApi";

const SAMPLE_TEMPLATES = {
  terraform: `resource "aws_s3_bucket" "insecure_data_bucket" {
  bucket = "prod-customer-backups"
  acl    = "public-read" # Critical: Publicly readable S3 bucket
}

resource "aws_security_group" "ssh_ingress_all" {
  name = "allow_all_ssh"
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # High: SSH exposed to entire internet
  }
}

resource "aws_ebs_volume" "database_storage" {
  availability_zone = "us-east-1a"
  size              = 100
  encrypted         = false # High: Unencrypted EBS volume
}`,
  kubernetes: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: microservice-payment
  namespace: production
spec:
  replicas: 3
  template:
    spec:
      hostNetwork: true # High: Host network namespace shared
      containers:
      - name: payment-api
        image: payment-service:latest
        securityContext:
          privileged: true # Critical: Privileged container mode
          # Missing: runAsNonRoot: true
        # Missing: resources.limits (cpu / memory)`,
  dockerfile: `FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Critical: Leaking credentials in build metadata
ENV AWS_SECRET_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE

EXPOSE 3000

# High: Missing non-root USER instruction
# Low: Missing HEALTHCHECK instruction
CMD ["node", "index.js"]`
};

const CloudSecurity = () => {
  const [activeTab, setActiveTab] = useState("editor"); // editor, upload, rules
  const [format, setFormat] = useState("terraform");
  const [code, setCode] = useState(SAMPLE_TEMPLATES.terraform);
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [rules, setRules] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [rulesLoading, setRulesLoading] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setRulesLoading(true);
      const data = await getIacRules();
      setRules(data || []);
    } catch (err) {
      console.error("RULES LOAD ERROR:", err);
    } finally {
      setRulesLoading(false);
    }
  };

  const handleFormatChange = (newFmt) => {
    setFormat(newFmt);
    setCode(SAMPLE_TEMPLATES[newFmt] || "");
  };

  const handleScanSnippet = async () => {
    if (!code.trim()) return;
    setScanning(true);
    setResults(null);
    try {
      const data = await scanIacSnippet(code, format);
      setResults(data);
    } catch (err) {
      alert(err.response?.data?.error || "IaC Static Scan Failed");
    } finally {
      setScanning(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setScanning(true);
    setResults(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const data = await scanIacFile(formData);
      setResults(data);
    } catch (err) {
      alert(err.response?.data?.error || "File Scan Failed");
    } finally {
      setScanning(false);
    }
  };

  const handleCopyCode = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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

  const filteredFindings = results?.findings?.filter((f) => {
    if (severityFilter === "ALL") return true;
    return f.severity?.toUpperCase() === severityFilter;
  }) || [];

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* HEADER BANNER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/40 via-zinc-950 to-black p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-sky-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-sky-300">
              <Cloud size={14} className="text-sky-400" />
              Phase 15 Cloud Infrastructure & IaC Security Engine
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
              Shift-Left Cloud Security & Static IaC Auditing
            </h1>
            <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
              Scan Terraform, Kubernetes manifests, and Dockerfiles for CIS benchmark violations, privileged container breakouts, unencrypted storage, and exposed cloud perimeters.
            </p>
          </div>

          <div className="rounded-2xl border border-sky-500/30 bg-zinc-900/90 p-4 font-mono text-center shrink-0">
            <span className="text-[10px] text-zinc-500 block uppercase">Policy Compliance</span>
            <span className="text-lg font-black text-sky-400 flex items-center justify-center gap-1.5">
              <ShieldCheck size={18} />
              CIS & OWASP Verified
            </span>
          </div>
        </div>
      </motion.div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("editor")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
            activeTab === "editor"
              ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
              : "bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          }`}
        >
          <Code2 size={16} />
          <span>Interactive Code Editor</span>
        </button>

        <button
          onClick={() => setActiveTab("upload")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
            activeTab === "upload"
              ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
              : "bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          }`}
        >
          <UploadCloud size={16} />
          <span>Upload IaC Files (.tf, .yaml, Dockerfile)</span>
        </button>

        <button
          onClick={() => setActiveTab("rules")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
            activeTab === "rules"
              ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
              : "bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          }`}
        >
          <BookOpen size={16} />
          <span>CIS Benchmark Policy Catalog ({rules.length})</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE CODE EDITOR */}
      {activeTab === "editor" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400">Target IaC Spec:</span>
                <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800">
                  <button
                    onClick={() => handleFormatChange("terraform")}
                    className={`rounded-lg px-3 py-1 text-xs font-mono font-bold transition ${
                      format === "terraform" ? "bg-sky-600 text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Terraform (.tf)
                  </button>
                  <button
                    onClick={() => handleFormatChange("kubernetes")}
                    className={`rounded-lg px-3 py-1 text-xs font-mono font-bold transition ${
                      format === "kubernetes" ? "bg-sky-600 text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Kubernetes (.yaml)
                  </button>
                  <button
                    onClick={() => handleFormatChange("dockerfile")}
                    className={`rounded-lg px-3 py-1 text-xs font-mono font-bold transition ${
                      format === "dockerfile" ? "bg-sky-600 text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Dockerfile
                  </button>
                </div>
              </div>

              <button
                onClick={handleScanSnippet}
                disabled={scanning}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-600/30 hover:brightness-110 transition disabled:opacity-50"
              >
                {scanning ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                <span>{scanning ? "Analyzing IaC Rules..." : "Audit IaC Security"}</span>
              </button>
            </div>

            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/90 font-mono text-xs overflow-hidden">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={16}
                placeholder="Paste Terraform HCL, Kubernetes YAML, or Dockerfile contents here..."
                className="w-full bg-transparent p-4 text-sky-300 outline-none resize-y font-mono leading-relaxed placeholder:text-zinc-600"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: FILE UPLOAD */}
      {activeTab === "upload" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <form onSubmit={handleFileUpload} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/10 text-sky-400">
              <UploadCloud size={32} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Upload Infrastructure-as-Code File</h2>
              <p className="text-xs text-zinc-400 mt-1">Supported formats: .tf, .tfvars, .yaml, .yml, Dockerfile, .json</p>
            </div>

            <input
              type="file"
              id="iac-file-input"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
            <label
              htmlFor="iac-file-input"
              className="inline-block cursor-pointer rounded-2xl border border-dashed border-sky-500/40 bg-zinc-900/60 px-8 py-6 text-xs text-zinc-400 hover:border-sky-400 hover:bg-zinc-900 transition"
            >
              {file ? (
                <span className="font-mono font-bold text-sky-300 flex items-center gap-2">
                  <FileCode size={16} />
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
              ) : (
                <span>Click or drag and drop IaC configuration file here</span>
              )}
            </label>

            <div>
              <button
                type="submit"
                disabled={!file || scanning}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-600/30 hover:bg-sky-500 transition disabled:opacity-50"
              >
                {scanning ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                <span>{scanning ? "Performing Static Analysis..." : "Execute Cloud Security Scan"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* RESULTS DISPLAY */}
      {results && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
          {/* METRIC SCORECARDS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* COMPLIANCE SCORE */}
            <div className="rounded-3xl border border-sky-500/30 bg-zinc-950 p-6 shadow-xl space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">CIS Compliance Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{results.compliance_score}%</span>
                <span className={`rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                  results.status === "COMPLIANT" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-rose-500/40 bg-rose-500/10 text-rose-300"
                }`}>
                  {results.status}
                </span>
              </div>
            </div>

            {/* CRITICAL FINDINGS */}
            <div className="rounded-3xl border border-rose-500/30 bg-zinc-950 p-6 shadow-xl space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Critical Violations</span>
              <div className="text-3xl font-black text-rose-400">
                {results.summary?.severity_counts?.critical || 0}
              </div>
            </div>

            {/* HIGH FINDINGS */}
            <div className="rounded-3xl border border-orange-500/30 bg-zinc-950 p-6 shadow-xl space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">High Risk Misconfigs</span>
              <div className="text-3xl font-black text-orange-400">
                {results.summary?.severity_counts?.high || 0}
              </div>
            </div>

            {/* TOTAL CHECKS */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Passed / Total Checks</span>
              <div className="text-3xl font-black text-emerald-400">
                {results.summary?.passed_checks} / {results.summary?.total_checks}
              </div>
            </div>
          </div>

          {/* FINDINGS LIST */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert size={18} className="text-sky-400" />
                Detected Security Misconfigurations ({results.findings?.length || 0})
              </h2>

              {/* SEVERITY FILTER */}
              <div className="flex items-center gap-1.5 rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs font-mono">
                {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSeverityFilter(lvl)}
                    className={`rounded-lg px-2.5 py-1 transition ${
                      severityFilter === lvl ? "bg-sky-600 text-white font-bold" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {filteredFindings.length === 0 ? (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center text-xs text-zinc-500 space-y-2">
                <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
                <p className="text-sm font-bold text-white">No Policy Violations Found</p>
                <p>All checked resources comply with active CIS and OWASP Cloud security benchmarks.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFindings.map((f, i) => (
                  <div
                    key={i}
                    className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-sky-500/40 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold font-mono uppercase ${getSeverityBadge(f.severity)}`}>
                          {f.severity}
                        </span>
                        <span className="font-mono text-xs font-bold text-sky-400">{f.id}</span>
                        <h3 className="font-bold text-white text-sm">{f.title}</h3>
                      </div>
                      <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 font-mono text-[11px] text-zinc-400">
                        {f.benchmark}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400">{f.description}</p>

                    {/* VULNERABLE SNIPPET */}
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-3.5 font-mono text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-rose-400 uppercase">
                        <span>Affected Resource: <b>{f.resource}</b> (Line {f.line_number})</span>
                        <span>File: {f.file_name}</span>
                      </div>
                      <code className="text-rose-300 block truncate">{f.code_snippet}</code>
                    </div>

                    {/* REMEDIATION ADVICE */}
                    {f.remediation_code && (
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-4 font-mono text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                            <Sparkles size={14} />
                            Recommended CIS Fix:
                          </span>
                          <button
                            onClick={() => handleCopyCode(f.remediation_code, `${f.id}-${i}`)}
                            className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-300 hover:bg-emerald-500/20 transition"
                          >
                            {copiedId === `${f.id}-${i}` ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedId === `${f.id}-${i}` ? "Copied" : "Copy Fix"}</span>
                          </button>
                        </div>
                        <pre className="text-emerald-300 text-[11px] overflow-x-auto leading-relaxed">
                          {f.remediation_code}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* TAB 3: RULES CATALOG */}
      {activeTab === "rules" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen size={18} className="text-sky-400" />
            CIS & OWASP Cloud Security Policy Catalog ({rules.length} Active Rules)
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {rules.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-2 hover:border-sky-500/30 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-sky-400">{r.id}</span>
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold font-mono uppercase ${getSeverityBadge(r.severity)}`}>
                      {r.severity}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">{r.format}</span>
                </div>
                <h3 className="font-bold text-white text-sm">{r.title}</h3>
                <p className="text-xs text-zinc-400">{r.description}</p>
                <div className="text-[11px] font-mono text-sky-400 pt-1">
                  Standard: {r.benchmark}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CloudSecurity;
