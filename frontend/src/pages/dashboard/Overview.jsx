import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Globe,
  AlertTriangle,
  FileText,
  Activity,
  Terminal,
  Bug,
  Flame,
  ArrowUpRight,
  Zap,
  Lock,
  Layers,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Cpu
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import StatCard from "../../components/dashboard/StatCard";
import ThreatAnalytics from "../../components/dashboard/ThreatAnalytics";
import SecurityTrendChart from "../../components/dashboard/SecurityTrendChart";
import AttackSurfaceCard from "../../components/dashboard/AttackSurfaceCard";
import ScanHistoryTable from "../../components/dashboard/ScanHistoryTable";
import { getDashboardStats } from "../../api/scannerApi";

const Overview = () => {
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setDashboard(data || {});
    } catch (err) {
      console.error("DASHBOARD STATS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

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
      title: "Total Audited Targets",
      value: dashboard.total_scans || 0,
      color: "text-purple-400",
      glowColor: "border-purple-500/30 bg-purple-950/10",
      subtext: "Perimeter endpoints & hosts",
    },
    {
      icon: <AlertTriangle size={24} />,
      title: "Critical Findings",
      value: dashboard.high || dashboard.attack_surface?.vulnerability_distribution?.critical_high || 0,
      color: "text-rose-400",
      glowColor: "border-rose-500/30 bg-rose-950/10",
      subtext: "Active exploit vulnerabilities",
    },
    {
      icon: <FileText size={24} />,
      title: "Audit Reports",
      value: dashboard.total_scans || 0,
      color: "text-sky-400",
      glowColor: "border-sky-500/30 bg-sky-950/10",
      subtext: "PDF, HTML & JSON exports",
    },
  ];

  const tools = [
    {
      title: "Nmap & ExploitDB",
      desc: "Deep OS & service detection with automated Searchsploit exploit correlation.",
      icon: <Terminal size={20} className="text-purple-400" />,
      link: "/dashboard/nmap-scanner",
      tag: "Kali Bridge",
    },
    {
      title: "Web Vulnerability Scanner",
      desc: "SSL, security headers, cookie flags, Gobuster and Nikto server audits.",
      icon: <Globe size={20} className="text-emerald-400" />,
      link: "/dashboard/website-scanner",
      tag: "OWASP Top 10",
    },
    {
      title: "Exploit Database Finder",
      desc: "Search thousands of public CVEs and PoCs from ExploitDB archives.",
      icon: <Bug size={20} className="text-rose-400" />,
      link: "/dashboard/exploit-search",
      tag: "Searchsploit",
    },
    {
      title: "Threat Intelligence",
      desc: "VirusTotal multi-vector IP, domain, URL and DNSBL reputation monitoring.",
      icon: <Flame size={20} className="text-amber-400" />,
      link: "/dashboard/threat-intel",
      tag: "VirusTotal v3",
    },
  ];

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* HERO SOC BANNER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-zinc-950 to-black p-8 shadow-2xl backdrop-blur-2xl"
      >
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-purple-300">
              <Sparkles size={14} className="text-purple-400" />
              Phase 12 SOC Security Operations Center
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              Automated Defense & Penetration Testing
            </h1>
            <p className="text-sm text-zinc-400">
              Continuous infrastructure vulnerability reconnaissance, Nmap service fingerprinting, ExploitDB CVE correlation, and SIEM compliance logging.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 text-xs font-bold text-zinc-300 hover:border-purple-500 hover:text-white transition disabled:opacity-50"
              title="Refresh Dashboard Stats"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-purple-400" : ""} />
              <span>Refresh</span>
            </button>
            <Link
              to="/dashboard/website-scanner"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition hover:scale-102"
            >
              <Globe size={15} />
              <span>Scan Website</span>
            </Link>
            <Link
              to="/dashboard/nmap-scanner"
              className="flex items-center gap-2 rounded-2xl border border-purple-500/40 bg-purple-600/20 px-6 py-3 text-xs font-bold text-purple-200 transition hover:bg-purple-600/40"
            >
              <Terminal size={15} />
              <span>Launch Nmap</span>
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-purple-600/15 blur-3xl" />
      </motion.div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className={`rounded-3xl border p-6 shadow-lg transition-all duration-300 ${item.glowColor}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {item.title}
              </span>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-purple-400">
                {item.icon}
              </div>
            </div>

            <div className="mt-4 font-mono">
              <h2 className={`text-3xl font-black tracking-tight ${item.color}`}>
                {loading ? "..." : item.value}
              </h2>
              <p className="mt-1 text-xs text-zinc-500 font-sans">{item.subtext}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ANALYTICS CHARTS SECTION */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-purple-500/20 bg-zinc-950/90 p-6 shadow-xl backdrop-blur-xl"
        >
          <ThreatAnalytics reports={dashboard.reports || []} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-3xl border border-purple-500/20 bg-zinc-950/90 p-6 shadow-xl backdrop-blur-xl"
        >
          <SecurityTrendChart reports={dashboard.reports || []} />
        </motion.div>
      </div>

      {/* ATTACK SURFACE & INTEGRATED MODULES */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ATTACK SURFACE (2 COLS) */}
        <div className="lg:col-span-2">
          <AttackSurfaceCard attackSurface={dashboard.attack_surface || {}} />
        </div>

        {/* QUICK LAUNCH MODULES (1 COL) */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap size={18} className="text-purple-400" />
            Quick Audit Launchers
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {tools.map((t, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -2 }}
                className="group rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-purple-500/40"
              >
                <Link to={t.link} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 shrink-0">
                      {t.icon}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition">
                        {t.title}
                      </h3>
                      <p className="text-[11px] text-zinc-500 line-clamp-1">{t.desc}</p>
                    </div>
                  </div>
                  <ArrowUpRight size={14} className="text-zinc-600 group-hover:text-purple-400 shrink-0 ml-2" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* FULL SCAN HISTORY TABLE */}
      <ScanHistoryTable scans={dashboard.scan_history || dashboard.reports || []} />
    </div>
  );
};

export default Overview;
