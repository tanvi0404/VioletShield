import React from "react";
import {
  LayoutDashboard,
  Globe,
  Network,
  Terminal,
  Bug,
  Flame,
  FileText,
  Settings,
  LogOut,
  Shield,
  Zap,
  Radio,
  Cloud
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const menuItems = [
  {
    title: "Overview",
    icon: <LayoutDashboard size={19} />,
    path: "/dashboard/overview",
    badge: null,
  },
  {
    title: "Web Scanner",
    icon: <Globe size={19} />,
    path: "/dashboard/website-scanner",
    badge: "SSL/Vuln",
  },
  {
    title: "Network Scanner",
    icon: <Network size={19} />,
    path: "/dashboard/network-scanner",
    badge: null,
  },
  {
    title: "Nmap & ExploitDB",
    icon: <Terminal size={19} />,
    path: "/dashboard/nmap-scanner",
    badge: "Kali/AI",
  },
  {
    title: "Exploit Finder",
    icon: <Bug size={19} />,
    path: "/dashboard/exploit-search",
    badge: null,
  },
  {
    title: "CVE Database",
    icon: <Shield size={19} />,
    path: "/dashboard/cve-search",
    badge: "NVD",
  },
  {
    title: "Threat Intel",
    icon: <Flame size={19} />,
    path: "/dashboard/threat-intel",
    badge: "VT",
  },
  {
    title: "Malware Analysis",
    icon: <FileText size={19} />,
    path: "/dashboard/file-analysis",
    badge: "VT/Hash",
  },
  {
    title: "Security Reports",
    icon: <FileText size={19} />,
    path: "/dashboard/reports",
    badge: null,
  },
  {
    title: "Continuous Monitoring",
    icon: <Radio size={19} />,
    path: "/dashboard/monitoring",
    badge: "Alerts",
  },
  {
    title: "Cloud & IaC Security",
    icon: <Cloud size={19} />,
    path: "/dashboard/cloud-security",
    badge: "CIS/CSPM",
  },
  {
    title: "Team & Settings",
    icon: <Settings size={19} />,
    path: "/dashboard/settings",
    badge: "RBAC",
  },
];





const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-72 flex-col justify-between border-r border-purple-500/20 bg-[#07070b]/90 backdrop-blur-2xl">
      {/* BRAND LOGO */}
      <div>
        <div className="border-b border-purple-500/15 p-6">
          <div className="flex items-center gap-3.5">
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-violet-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]"
            >
              <Shield size={24} />
            </motion.div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-black tracking-tight text-white">
                  Violet<span className="text-purple-400">Shield</span>
                </h1>
                <span className="rounded-md border border-purple-500/40 bg-purple-500/10 px-1.5 py-0.5 text-[9px] font-mono font-bold text-purple-300">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] font-medium text-zinc-400">
                AI Penetration Toolkit
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="space-y-1.5 px-4 py-6">
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Navigation Suite
          </div>
          {menuItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.path}
              end={item.title === "Overview"}
              className={({ isActive }) =>
                `group relative flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "border border-purple-500/40 bg-gradient-to-r from-purple-600/25 to-violet-600/10 text-white shadow-[0_0_20px_rgba(168,85,247,0.25)]"
                    : "text-zinc-400 hover:border hover:border-purple-500/20 hover:bg-purple-500/5 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`transition-colors duration-300 ${
                        isActive
                          ? "text-purple-400"
                          : "text-zinc-500 group-hover:text-purple-300"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.title}</span>
                  </div>

                  {item.badge && (
                    <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-purple-300">
                      {item.badge}
                    </span>
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-purple-400 shadow-[0_0_12px_#a855f7]"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* FOOTER USER & STATUS */}
      <div className="border-t border-purple-500/15 p-4 space-y-3">
        {/* SYSTEM STATUS PILL */}
        <div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-zinc-400">SIEM Pipeline</span>
          </div>
          <span className="font-mono text-[10px] font-bold text-emerald-400">
            Active
          </span>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-xs font-semibold text-red-400 transition hover:border-red-500/40 hover:bg-red-500/15"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
