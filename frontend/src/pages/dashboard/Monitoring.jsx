import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  Bell,
  Clock,
  Send,
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Globe,
  Sparkles,
  Loader2,
  ExternalLink,
  MessageSquare,
  Mail,
  Zap,
  Activity,
  Layers
} from "lucide-react";
import {
  getScheduledScans,
  createScheduledScan,
  deleteScheduledScan,
  triggerScheduledScan,
  getNotificationChannels,
  createNotificationChannel,
  testNotificationChannel,
  deleteNotificationChannel,
  getSecurityAlerts
} from "../../api/scannerApi";

const Monitoring = () => {
  const [activeTab, setActiveTab] = useState("schedules"); // schedules, channels, alerts
  const [loading, setLoading] = useState(true);

  // Schedules state
  const [schedules, setSchedules] = useState([]);
  const [targetInput, setTargetInput] = useState("");
  const [freqInput, setFreqInput] = useState("DAILY");
  const [creatingSched, setCreatingSched] = useState(false);
  const [schedMsg, setSchedMsg] = useState({ type: "", text: "" });

  // Channels state
  const [channels, setChannels] = useState([]);
  const [channelName, setChannelName] = useState("");
  const [channelType, setChannelType] = useState("SLACK");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [minSev, setMinSev] = useState("HIGH");
  const [creatingChannel, setCreatingChannel] = useState(false);
  const [testingChannelId, setTestingChannelId] = useState(null);
  const [channelMsg, setChannelMsg] = useState({ type: "", text: "" });

  // Alerts state
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [schedsData, channelsData, alertsData] = await Promise.all([
        getScheduledScans().catch(() => []),
        getNotificationChannels().catch(() => []),
        getSecurityAlerts().catch(() => [])
      ]);
      setSchedules(schedsData || []);
      setChannels(channelsData || []);
      setAlerts(alertsData || []);
    } catch (err) {
      console.error("MONITORING DATA LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!targetInput.trim()) return;
    setCreatingSched(true);
    setSchedMsg({ type: "", text: "" });

    try {
      await createScheduledScan({ target: targetInput.trim(), frequency: freqInput });
      setSchedMsg({ type: "success", text: `Continuous monitoring schedule active for ${targetInput}` });
      setTargetInput("");
      const updated = await getScheduledScans();
      setSchedules(updated || []);
    } catch (err) {
      setSchedMsg({ type: "error", text: err.response?.data?.error || "Failed to create schedule" });
    } finally {
      setCreatingSched(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await deleteScheduledScan(id);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete schedule");
    }
  };

  const handleRunNow = async (id) => {
    try {
      await triggerScheduledScan(id);
      alert("Immediate scan triggered! Delta differences and alerts will update shortly.");
      const updated = await getScheduledScans();
      setSchedules(updated || []);
    } catch (err) {
      alert(err.response?.data?.error || "Scan execution failed");
    }
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!channelName.trim() || !destinationUrl.trim()) return;
    setCreatingChannel(true);
    setChannelMsg({ type: "", text: "" });

    try {
      await createNotificationChannel({
        name: channelName.trim(),
        channel_type: channelType,
        destination: destinationUrl.trim(),
        min_severity: minSev
      });
      setChannelMsg({ type: "success", text: `Channel '${channelName}' added successfully!` });
      setChannelName("");
      setDestinationUrl("");
      const updated = await getNotificationChannels();
      setChannels(updated || []);
    } catch (err) {
      setChannelMsg({ type: "error", text: err.response?.data?.error || "Failed to configure channel" });
    } finally {
      setCreatingChannel(false);
    }
  };

  const handleTestChannel = async (ch) => {
    setTestingChannelId(ch.id);
    try {
      const res = await testNotificationChannel({
        channel_type: ch.channel_type,
        destination: ch.destination
      });
      alert(res.message || "Test notification dispatched!");
    } catch (err) {
      alert(err.response?.data?.error || "Test dispatch failed");
    } finally {
      setTestingChannelId(null);
    }
  };

  const handleDeleteChannel = async (id) => {
    try {
      await deleteNotificationChannel(id);
      setChannels((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete channel");
    }
  };

  const getSeverityBadge = (sev) => {
    switch ((sev || "").toUpperCase()) {
      case "CRITICAL":
      case "HIGH":
        return "border-rose-500/40 bg-rose-500/15 text-rose-300";
      case "MEDIUM":
        return "border-amber-500/40 bg-amber-500/15 text-amber-300";
      default:
        return "border-emerald-500/40 bg-emerald-500/15 text-emerald-300";
    }
  };

  const tabs = [
    { id: "schedules", label: `Scan Schedules (${schedules.length})`, icon: <Clock size={16} /> },
    { id: "channels", label: `Notification Webhooks (${channels.length})`, icon: <Bell size={16} /> },
    { id: "alerts", label: `Security Alert Feed (${alerts.length})`, icon: <ShieldAlert size={16} /> },
  ];

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 size={36} className="animate-spin mx-auto text-purple-400" />
        <p className="text-sm font-mono text-zinc-400">Initializing Continuous Monitoring & Scheduler Telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* HEADER BANNER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-zinc-950 to-black p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-purple-300">
              <Radio size={14} className="animate-pulse text-purple-400" />
              Phase 14 Continuous Monitoring & Automated Alerting Engine
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
              Perimeter Surveillance & Threat Dispatch
            </h1>
            <p className="mt-2 text-sm text-zinc-400 max-w-xl">
              Automate recurring security scans across critical assets, track baseline delta differences, and dispatch real-time security alerts via Slack, Discord, MS Teams, and Email.
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/30 bg-zinc-900/90 p-4 font-mono text-center shrink-0">
            <span className="text-[10px] text-zinc-500 block uppercase">Background Engine</span>
            <span className="text-lg font-black text-emerald-400 flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              APScheduler Active
            </span>
          </div>
        </div>
      </motion.div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === t.id
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: SCHEDULES */}
      {activeTab === "schedules" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* SCHEDULES LIST */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock size={18} className="text-purple-400" />
                Active Monitoring Targets ({schedules.length})
              </h2>

              {schedules.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center text-xs text-zinc-500 space-y-2">
                  <Clock size={32} className="mx-auto text-zinc-600" />
                  <p>No automated recurring scan schedules configured yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {schedules.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-purple-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Globe size={16} className="text-purple-400" />
                          <h3 className="font-bold text-white text-sm">{s.target}</h3>
                          <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold font-mono text-purple-300">
                            {s.frequency}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 font-mono">
                          Last Run: {s.last_run ? s.last_run.slice(0, 16) : "Pending"} • Next Run: {s.next_run ? s.next_run.slice(0, 16) : "Automated"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs">
                        <button
                          onClick={() => handleRunNow(s.id)}
                          className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-bold text-emerald-300 hover:bg-emerald-600 hover:text-white transition"
                          title="Execute Scan Immediately"
                        >
                          <Play size={12} />
                          <span>Run Now</span>
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(s.id)}
                          className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-600 hover:text-white transition"
                          title="Delete Schedule"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ADD SCHEDULE FORM */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus size={18} className="text-purple-400" />
                Add Recurring Target
              </h2>
              <p className="text-xs text-zinc-400">Register an endpoint for continuous background baseline auditing.</p>

              {schedMsg.text && (
                <div
                  className={`flex items-center gap-2 rounded-xl p-3 text-xs font-mono ${
                    schedMsg.type === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300" : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                  }`}
                >
                  {schedMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{schedMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleCreateSchedule} className="space-y-3 font-sans">
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Target Domain or IP</label>
                  <input
                    type="text"
                    placeholder="e.g. api.target.com or 192.168.1.1"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-white outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Scan Interval Frequency</label>
                  <select
                    value={freqInput}
                    onChange={(e) => setFreqInput(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-white outline-none focus:border-purple-500 font-mono"
                  >
                    <option value="HOURLY">Hourly Continuous Probe</option>
                    <option value="DAILY">Daily Perimeter Audit</option>
                    <option value="WEEKLY">Weekly Compliance Deep Scan</option>
                    <option value="MONTHLY">Monthly Audit</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={creatingSched}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-500 transition disabled:opacity-50"
                >
                  {creatingSched ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>Activate Target Monitoring</span>
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: CHANNELS */}
      {activeTab === "channels" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* CHANNELS LIST */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Bell size={18} className="text-purple-400" />
                Configured Webhook Channels ({channels.length})
              </h2>

              {channels.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center text-xs text-zinc-500 space-y-2">
                  <Bell size={32} className="mx-auto text-zinc-600" />
                  <p>No external webhook alert channels connected yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {channels.map((ch) => (
                    <div
                      key={ch.id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-purple-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MessageSquare size={16} className="text-purple-400" />
                          <h3 className="font-bold text-white text-sm">{ch.name}</h3>
                          <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold font-mono text-purple-300">
                            {ch.channel_type}
                          </span>
                          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold font-mono uppercase ${getSeverityBadge(ch.min_severity)}`}>
                            {ch.min_severity}+ Alert Threshold
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 font-mono truncate max-w-md">
                          Destination: {ch.destination}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs">
                        <button
                          onClick={() => handleTestChannel(ch)}
                          disabled={testingChannelId === ch.id}
                          className="flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 font-bold text-purple-300 hover:bg-purple-600 hover:text-white transition disabled:opacity-50"
                          title="Dispatch Test Notification"
                        >
                          {testingChannelId === ch.id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                          <span>Test</span>
                        </button>
                        <button
                          onClick={() => handleDeleteChannel(ch.id)}
                          className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-600 hover:text-white transition"
                          title="Delete Channel"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ADD CHANNEL FORM */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus size={18} className="text-purple-400" />
                Connect Alert Webhook
              </h2>
              <p className="text-xs text-zinc-400">Receive automated breach dispatches to your team's incident response channel.</p>

              {channelMsg.text && (
                <div
                  className={`flex items-center gap-2 rounded-xl p-3 text-xs font-mono ${
                    channelMsg.type === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300" : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                  }`}
                >
                  {channelMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{channelMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleCreateChannel} className="space-y-3 font-sans">
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Channel Label</label>
                  <input
                    type="text"
                    placeholder="e.g. SOC War Room Discord"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-white outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Platform Integration Type</label>
                  <select
                    value={channelType}
                    onChange={(e) => setChannelType(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-white outline-none focus:border-purple-500 font-mono"
                  >
                    <option value="SLACK">Slack Incoming Webhook</option>
                    <option value="DISCORD">Discord Webhook</option>
                    <option value="TEAMS">Microsoft Teams Webhook</option>
                    <option value="EMAIL">SMTP Email Notification</option>
                    <option value="WEBHOOK">Generic JSON Webhook</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Webhook URL / Email Destination</label>
                  <input
                    type="text"
                    placeholder="https://discord.com/api/webhooks/..."
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-white outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">Minimum Severity Trigger</label>
                  <select
                    value={minSev}
                    onChange={(e) => setMinSev(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-white outline-none focus:border-purple-500 font-mono"
                  >
                    <option value="CRITICAL">Critical Breaches Only</option>
                    <option value="HIGH">High & Critical Severity</option>
                    <option value="MEDIUM">Medium, High & Critical</option>
                    <option value="ALL">All Events (Including Info)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={creatingChannel}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-500 transition disabled:opacity-50"
                >
                  {creatingChannel ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>Save Notification Channel</span>
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: ALERTS */}
      {activeTab === "alerts" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert size={18} className="text-rose-400" />
              Automated Incident Alert History ({alerts.length} Events)
            </h2>
          </div>

          {alerts.length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center text-xs text-zinc-500 space-y-2">
              <ShieldCheck size={40} className="mx-auto text-emerald-500" />
              <p className="text-sm font-bold text-white">All Monitored Assets Clean</p>
              <p>No critical security breaches or baseline delta degradation detected.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-purple-500/40 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold font-mono uppercase ${getSeverityBadge(a.severity)}`}>
                        {a.severity}
                      </span>
                      <h3 className="font-bold text-white text-sm">{a.title}</h3>
                    </div>
                    <span className="text-xs font-mono text-zinc-500">{a.timestamp?.slice(0, 19)}</span>
                  </div>

                  <p className="text-xs text-zinc-400 font-sans">{a.description}</p>

                  {a.delta_summary && (
                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 text-xs font-mono text-purple-300">
                      <span className="text-[10px] text-zinc-500 uppercase block mb-1">Delta Diff Breakdown:</span>
                      {a.delta_summary}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-1">
                    <span>Target: <b className="text-white">{a.target}</b></span>
                    <span className="text-emerald-400">Status: {a.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Monitoring;
