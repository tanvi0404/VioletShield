import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Globe,
  AlertTriangle,
  FileText,
  Activity,
  Network,
  Terminal,
  Bug,
  Flame,
  ArrowUpRight,
  Radio,
  Zap,
  TrendingUp,
  Cpu
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import StatCard from "../../components/dashboard/StatCard";
import ThreatAnalytics from "../../components/dashboard/ThreatAnalytics";
import SecurityTrendChart from "../../components/dashboard/SecurityTrendChart";

const Overview = () => {
  const [dashboard, setDashboard] = useState({});
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://127.0.0.1:5000/api/dashboard", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setDashboard(data);
        setReports(data.reports || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("DASHBOARD ERROR:", err);
        setLoading(false);
      });
  }, []);

  const latestScan = dashboard.latest_scan;

  const stats = [
    {
      icon: <ShieldCheck size={24} />,
      title: "Avg Security Score",
      value: `${dashboard.average_score || 0}%`,
      color: "text-emerald-400",
      glowColor: "border-emerald-500/30 bg-emerald-950/10",
      subtext: "Across all target audits",
    },
    {
      icon: <Globe size={24} />,
      title: "Total Targets Scanned",
      value: dashboard.total_scans || 0,
      color: "text-purple-400",
      glowColor: "border-purple-500/30 bg-purple-950/10",
      subtext: "Websites & IP endpoints",
    },
    {
      icon: <AlertTriangle size={24} />,
      title: "Critical Findings",
      value: dashboard.high || 0,
      color: "text-rose-400",
      glowColor: "border-rose-500/30 bg-rose-950/10",
      subtext: "High risk vulnerabilities",
    },
    {
      icon: <FileText size={24} />,
      title: "Audit Reports",
      value: dashboard.total_scans || 0,
      color: "text-sky-400",
      glowColor: "border-sky-500/30 bg-sky-950/10",
      subtext: "Persisted to Splunk & DB",
    },
  ];

  const tools = [
    {
      title: "Nmap & ExploitDB",
      desc: "Deep OS & service detection with automated Searchsploit exploit correlation.",
      icon: <Terminal size={22} className="text-purple-400" />,
      link: "/dashboard/nmap-scanner",
      tag: "Kali Bridge",
    },
    {
      title: "Web Vulnerability Scanner",
      desc: "SSL, security headers, cookie flags, and exposed files audit.",
      icon: <Globe size={22} className="text-emerald-400" />,
      link: "/dashboard/website-scanner",
      tag: "OWASP Top 10",
    },
    {
      title: "Exploit Database Finder",
      desc: "Search thousands of public CVEs and PoCs from ExploitDB archives.",
      icon: <Bug size={22} className="text-rose-400" />,
      link: "/dashboard/exploit-search",
      tag: "Searchsploit",
    },
    {
      title: "Threat Intelligence",
      desc: "VirusTotal IP reputation, malicious vendor counts, and risk scoring.",
      icon: <Flame size={22} className="text-amber-400" />,
      link: "/dashboard/threat-intel",
      tag: "VirusTotal v3",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* HERO BANNER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-purple-500/25 bg-gradient-to-br from-purple-950/40 via-zinc-950 to-black p-8 shadow-2xl backdrop-blur-2xl"
      >
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-purple-300">
              <Zap size={14} className="text-purple-400" />
              Automated Defense & Penetration Testing
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              Security Operations Center
            </h1>
            <p className="text-sm text-zinc-400">
              Continuous infrastructure vulnerability scanning, Nmap fingerprinting, ExploitDB CVE correlation, and SIEM logging.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard/nmap-scanner"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/40 transition-all hover:scale-105 hover:shadow-purple-600/60"
            >
              <Terminal size={17} className="text-white" />
              <span>Launch Nmap Scan</span>
            </Link>
            <Link
              to="/dashboard/website-scanner"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/40 transition-all hover:scale-105 hover:shadow-purple-600/60"
            >
              <Globe size={17} className="text-white" />
              <span>Scan Website</span>
            </Link>
          </div>


        </div>

        {/* Ambient subtle glow background */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-purple-600/15 blur-3xl" />
      </motion.div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`rounded-3xl border p-6 shadow-lg transition-all duration-300 ${item.glowColor}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {item.title}
              </span>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-purple-400">
                {item.icon}
              </div>
            </div>

            <div className="mt-4">
              <h2 className={`text-3xl font-black tracking-tight ${item.color}`}>
                {loading ? "..." : item.value}
              </h2>
              <p className="mt-1 text-xs text-zinc-500">{item.subtext}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-purple-500/20 bg-zinc-950/90 p-6 shadow-xl backdrop-blur-xl"
        >
          <ThreatAnalytics reports={reports} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-3xl border border-purple-500/20 bg-zinc-950/90 p-6 shadow-xl backdrop-blur-xl"
        >
          <SecurityTrendChart reports={reports} />
        </motion.div>
      </div>

      {/* QUICK LAUNCH TOOLS & LATEST AUDIT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* TOOLKIT QUICK LAUNCH (2 COLS) */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap size={18} className="text-purple-400" />
              Integrated Security Modules
            </h2>
            <span className="text-xs text-zinc-500">Ready to audit</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {tools.map((t, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -3, scale: 1.01 }}
                className="group relative rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition-all hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <Link to={t.link} className="block space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-2.5">
                      {t.icon}
                    </div>
                    <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-300">
                      {t.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition flex items-center gap-1">
                      {t.title}
                      <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition" />
                    </h3>
                    <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                      {t.desc}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* LATEST AUDIT CARD (1 COL) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity size={18} className="text-emerald-400" />
            Latest Scan Report
          </h2>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-5">
            {latestScan ? (
              <>
                <div>
                  <span className="text-xs text-zinc-500">Target Host</span>
                  <p className="mt-1 font-mono text-base font-bold text-purple-300 truncate">
                    {latestScan.website}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-zinc-900/80 p-3">
                    <span className="text-[11px] text-zinc-400">Security Score</span>
                    <p className="text-xl font-black text-emerald-400">
                      {latestScan.score || 0}%
                    </p>
                  </div>
                  <div className="rounded-xl bg-zinc-900/80 p-3">
                    <span className="text-[11px] text-zinc-400">Risk Assessment</span>
                    <p
                      className={`text-sm font-bold ${
                        latestScan.risk === "High"
                          ? "text-rose-400"
                          : latestScan.risk === "Medium"
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {latestScan.risk || "Low"} Risk
                    </p>
                  </div>
                </div>

                <div className="border-t border-zinc-850 pt-3 text-xs text-zinc-500 flex items-center justify-between">
                  <span>Timestamp:</span>
                  <span className="font-mono text-zinc-400">
                    {latestScan.created_at?.slice(0, 16) || "Recent"}
                  </span>
                </div>

                <Link
                  to="/dashboard/reports"
                  className="block w-full text-center rounded-xl border border-purple-500/30 bg-purple-500/10 py-2.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition"
                >
                  View All Audit Reports →
                </Link>
              </>
            ) : (
              <div className="text-center py-8 text-zinc-500 text-sm space-y-2">
                <p>No target scans recorded yet.</p>
                <Link
                  to="/dashboard/website-scanner"
                  className="inline-block text-xs font-semibold text-purple-400 hover:underline"
                >
                  Start your first scan
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
