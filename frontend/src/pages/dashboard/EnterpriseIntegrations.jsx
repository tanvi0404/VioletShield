import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Network,
  Server,
  Share2,
  Ticket,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Loader2,
  ExternalLink,
  Zap,
  Activity,
  Send,
  Database,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  Check,
  RefreshCw
} from "lucide-react";
import {
  getIntegrations,
  saveIntegration,
  deleteIntegration,
  testIntegration,
  forwardScanToSiem,
  getIncidentTickets,
  getScans
} from "../../api/scannerApi";

const CONNECTOR_PRESETS = [
  {
    type: "SPLUNK_HEC",
    name: "Splunk Enterprise HEC",
    endpoint: "https://splunk.corp.internal:8088/services/collector/event",
    index: "violetshield-main",
    icon: <Database size={16} className="text-amber-400" />
  },
  {
    type: "ELASTICSEARCH",
    name: "ElasticSearch / ELK Logstash",
    endpoint: "https://elasticsearch.corp.internal:9200",
    index: "violetshield-security",
    icon: <Layers size={16} className="text-teal-400" />
  },
  {
    type: "JIRA",
    name: "Atlassian Jira Cloud",
    endpoint: "https://your-domain.atlassian.net",
    index: "SEC",
    icon: <Ticket size={16} className="text-sky-400" />
  },
  {
    type: "SERVICENOW",
    name: "ServiceNow ITSM Incident API",
    endpoint: "https://dev00000.service-now.com",
    index: "incident",
    icon: <Server size={16} className="text-purple-400" />
  }
];

const EnterpriseIntegrations = () => {
  const [activeTab, setActiveTab] = useState("CONNECTORS"); // CONNECTORS, TICKETS, FORWARDER
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [scans, setScans] = useState([]);
  const [selectedScanId, setSelectedScanId] = useState("");
  const [forwarding, setForwarding] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [testResults, setTestResults] = useState({});

  // New Connector Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "SPLUNK_HEC",
    endpoint_url: "",
    api_token_or_key: "",
    project_or_index: "",
    auth_username: "",
    min_severity_threshold: "HIGH",
    auto_forward: true,
    is_active: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [integData, ticketData, scanData] = await Promise.all([
        getIntegrations().catch(() => []),
        getIncidentTickets().catch(() => []),
        getScans().catch(() => [])
      ]);
      setIntegrations(integData || []);
      setTickets(ticketData || []);
      setScans(scanData || []);
      if (scanData && scanData.length > 0) {
        setSelectedScanId(scanData[0].id);
      }
    } catch (err) {
      console.error("LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (integ) => {
    setTestingId(integ.id);
    try {
      const res = await testIntegration({
        endpoint_url: integ.endpoint_url,
        api_token_or_key: integ.api_token_or_key
      });
      setTestResults((prev) => ({
        ...prev,
        [integ.id]: {
          success: res.success,
          message: res.message || (res.success ? "Connection verified" : res.error),
          latency: res.latency_ms
        }
      }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [integ.id]: {
          success: false,
          message: err.response?.data?.error || "Connection timeout"
        }
      }));
    } finally {
      setTestingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this enterprise connector?")) return;
    try {
      await deleteIntegration(id);
      setIntegrations((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      alert("Failed to delete integration");
    }
  };

  const handleSaveConnector = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveIntegration(formData);
      setShowAddModal(false);
      setFormData({
        name: "",
        type: "SPLUNK_HEC",
        endpoint_url: "",
        api_token_or_key: "",
        project_or_index: "",
        auth_username: "",
        min_severity_threshold: "HIGH",
        auto_forward: true,
        is_active: true
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save connector");
    } finally {
      setSaving(false);
    }
  };

  const handleManualForward = async () => {
    if (!selectedScanId) return;
    setForwarding(true);
    try {
      const res = await forwardScanToSiem({ scan_id: Number(selectedScanId) });
      alert(res.message || "Scan telemetry forwarded successfully");
    } catch (err) {
      alert("Failed to forward scan telemetry");
    } finally {
      setForwarding(false);
    }
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

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 size={36} className="animate-spin mx-auto text-sky-400" />
        <p className="text-sm font-mono text-zinc-400">Loading Enterprise SIEM & Ticketing Connectors...</p>
      </div>
    );
  }

  const siemCount = integrations.filter((i) => ["SPLUNK_HEC", "ELASTICSEARCH", "GENERIC_SIEM"].includes(i.type)).length;
  const ticketingCount = integrations.filter((i) => ["JIRA", "SERVICENOW"].includes(i.type)).length;

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
              <Share2 size={14} className="text-sky-400" />
              Phase 18 Enterprise SIEM & Incident Ticketing Integration
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
              Enterprise SIEM & ITSM Orchestration
            </h1>
            <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
              Stream real-time security events to Splunk and ElasticSearch, and automatically create and track incident tickets in Jira and ServiceNow when critical vulnerabilities are discovered.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-sky-600/30 hover:bg-sky-500 transition shrink-0"
          >
            <Plus size={16} />
            <span>Add Connector</span>
          </button>
        </div>
      </motion.div>

      {/* OVERVIEW STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Active SIEM Forwarders</span>
          <div className="text-3xl font-black text-amber-400 flex items-center justify-between">
            <span>{siemCount} Connectors</span>
            <Database size={24} className="text-amber-500/40" />
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Ticketing Integrations</span>
          <div className="text-3xl font-black text-sky-400 flex items-center justify-between">
            <span>{ticketingCount} Platforms</span>
            <Ticket size={24} className="text-sky-500/40" />
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Logged Incident Tickets</span>
          <div className="text-3xl font-black text-emerald-400 flex items-center justify-between">
            <span>{tickets.length} Created</span>
            <CheckCircle2 size={24} className="text-emerald-500/40" />
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("CONNECTORS")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
            activeTab === "CONNECTORS"
              ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
              : "bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          }`}
        >
          <Layers size={16} />
          <span>Configured Connectors ({integrations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("TICKETS")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
            activeTab === "TICKETS"
              ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
              : "bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          }`}
        >
          <Ticket size={16} />
          <span>Incident Tickets Feed ({tickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("FORWARDER")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
            activeTab === "FORWARDER"
              ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
              : "bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          }`}
        >
          <Send size={16} />
          <span>Broadcast Scan to SIEM</span>
        </button>
      </div>

      {/* TAB 1: CONNECTORS MANAGER */}
      {activeTab === "CONNECTORS" && (
        <div className="space-y-4">
          {integrations.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950 p-12 text-center space-y-3">
              <Server size={32} className="mx-auto text-zinc-600" />
              <p className="text-sm text-zinc-400 font-mono">No enterprise SIEM or ticketing connectors configured yet.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-sky-500 transition"
              >
                <Plus size={14} />
                <span>Configure First Connector</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {integrations.map((integ) => (
                <div
                  key={integ.id}
                  className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-4 transition hover:border-sky-500/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800">
                        {integ.type.includes("SPLUNK") ? (
                          <Database size={18} className="text-amber-400" />
                        ) : integ.type.includes("ELASTIC") ? (
                          <Layers size={18} className="text-teal-400" />
                        ) : integ.type.includes("JIRA") ? (
                          <Ticket size={18} className="text-sky-400" />
                        ) : (
                          <Server size={18} className="text-purple-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{integ.name}</h3>
                        <span className="rounded-md border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                          {integ.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTestConnection(integ)}
                        disabled={testingId === integ.id}
                        className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-mono font-bold text-sky-300 hover:bg-sky-500 hover:text-white transition disabled:opacity-50 flex items-center gap-1"
                      >
                        {testingId === integ.id ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                        <span>Test</span>
                      </button>
                      <button
                        onClick={() => handleDelete(integ.id)}
                        className="rounded-xl border border-red-500/20 bg-red-500/5 p-2 text-red-400 hover:bg-red-500/20 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Endpoint:</span>
                      <span className="text-zinc-300 truncate max-w-[220px]">{integ.endpoint_url}</span>
                    </div>
                    {integ.project_or_index && (
                      <div className="flex justify-between text-zinc-400">
                        <span>Project / Index:</span>
                        <span className="text-sky-400 font-bold">{integ.project_or_index}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-zinc-400">
                      <span>Threshold:</span>
                      <span className="text-amber-400 font-bold">{integ.min_severity_threshold}+</span>
                    </div>
                  </div>

                  {/* TEST RESULT PILL */}
                  {testResults[integ.id] && (
                    <div
                      className={`rounded-2xl border p-3 text-xs font-mono flex items-center justify-between ${
                        testResults[integ.id].success
                          ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
                          : "border-rose-500/30 bg-rose-950/20 text-rose-300"
                      }`}
                    >
                      <span className="truncate max-w-[240px]">{testResults[integ.id].message}</span>
                      {testResults[integ.id].latency && (
                        <span className="text-[10px] font-bold">{testResults[integ.id].latency}ms</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INCIDENT TICKETS FEED */}
      {activeTab === "TICKETS" && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Ticket size={18} className="text-sky-400" />
              Automated Incident Tickets
            </h3>
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition"
            >
              <RefreshCw size={12} />
              <span>Refresh</span>
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-xs font-mono text-zinc-500">No incident tickets logged yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-sans transition hover:border-sky-500/30"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${getSeverityBadge(t.severity)}`}>
                        {t.severity}
                      </span>
                      <span className="font-mono text-xs font-bold text-sky-400">{t.ticket_key}</span>
                      <h4 className="font-bold text-white text-sm">{t.title}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                      <span>Target: <b className="text-zinc-300">{t.target}</b></span>
                      {t.cve_id && <span>CVE: <b className="text-purple-400">{t.cve_id}</b></span>}
                    </div>
                  </div>

                  {t.ticket_url && (
                    <a
                      href={t.ticket_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-mono font-bold text-sky-300 hover:bg-sky-500 hover:text-white transition shrink-0"
                    >
                      <span>Open Ticket</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BROADCAST SCAN TO SIEM */}
      {activeTab === "FORWARDER" && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-4 max-w-xl font-sans">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Send size={18} className="text-sky-400" />
            Manual SIEM Telemetry Dispatcher
          </h3>
          <p className="text-xs text-zinc-400">
            Select a completed penetration scan from history and broadcast its finding payloads across all active SIEM streams (Splunk, ElasticSearch) asynchronously.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1">Select Scan History Record</label>
              <select
                value={selectedScanId}
                onChange={(e) => setSelectedScanId(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs text-sky-400 outline-none focus:border-sky-500 font-mono"
              >
                {scans.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.website} (Score: {s.security_score}% | Findings: {s.vulnerabilities?.length || 0})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleManualForward}
              disabled={forwarding || scans.length === 0}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-sky-600/30 hover:brightness-110 transition disabled:opacity-50"
            >
              {forwarding ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              <span>{forwarding ? "Dispatching Stream..." : "Broadcast Telemetry to SIEM"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ADD CONNECTOR MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4 font-sans"
            >
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Plus size={20} className="text-sky-400" />
                Configure Enterprise Connector
              </h3>

              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-400 block">Quick Presets:</span>
                <div className="grid grid-cols-2 gap-2">
                  {CONNECTOR_PRESETS.map((p) => (
                    <button
                      key={p.type}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          type: p.type,
                          name: p.name,
                          endpoint_url: p.endpoint,
                          project_or_index: p.index
                        })
                      }
                      className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 p-2.5 text-xs text-left hover:border-sky-500 transition"
                    >
                      {p.icon}
                      <span className="font-bold text-zinc-300 truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveConnector} className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Connector Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-white outline-none focus:border-sky-500 font-mono"
                  >
                    <option value="SPLUNK_HEC">Splunk HEC (HTTP Event Collector)</option>
                    <option value="ELASTICSEARCH">ElasticSearch / ELK Logstash</option>
                    <option value="JIRA">Atlassian Jira REST API</option>
                    <option value="SERVICENOW">ServiceNow Table API</option>
                    <option value="GENERIC_SIEM">Generic SIEM / Syslog Webhook</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Connector Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Production Splunk Cluster"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-white outline-none focus:border-sky-500 font-sans"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Endpoint URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://splunk.corp.internal:8088/services/collector/event"
                    value={formData.endpoint_url}
                    onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-white outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 block mb-1">API Token / HEC Key</label>
                    <input
                      type="password"
                      placeholder="Token or API Key"
                      value={formData.api_token_or_key}
                      onChange={(e) => setFormData({ ...formData, api_token_or_key: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-white outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-400 block mb-1">Project / Index Name</label>
                    <input
                      type="text"
                      placeholder="e.g. SEC or main"
                      value={formData.project_or_index}
                      onChange={(e) => setFormData({ ...formData, project_or_index: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-white outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-zinc-900 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-sky-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-sky-600/30 hover:bg-sky-500 transition disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Connector"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnterpriseIntegrations;
