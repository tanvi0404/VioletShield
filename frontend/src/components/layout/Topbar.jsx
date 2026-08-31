import React, { useState, useEffect } from "react";
import { ShieldCheck, Search, Bell, Clock, Terminal, Radio } from "lucide-react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const Topbar = () => {
  const location = useLocation();
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = (path) => {
    switch (path) {
      case "/dashboard/overview":
        return "Security Operations Center";
      case "/dashboard/website-scanner":
        return "Website Vulnerability Scanner";
      case "/dashboard/network-scanner":
        return "Network Port Reconnaissance";
      case "/dashboard/nmap-scanner":
        return "Nmap & ExploitDB Advanced Scanner";
      case "/dashboard/exploit-search":
        return "Exploit Database & Searchsploit";
      case "/dashboard/threat-intel":
        return "Threat Intelligence & IP Reputation";
      case "/dashboard/reports":
        return "Security Audit Reports";
      default:
        return "Security Dashboard";
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex h-20 items-center justify-between border-b border-purple-500/15 bg-[#050508]/80 px-8 backdrop-blur-2xl"
    >
      {/* LEFT: PAGE TITLE & LIVE STATUS */}
      <div>
        <h1 className="text-xl font-black tracking-tight text-white">
          {getPageTitle(location.pathname)}
        </h1>
        <div className="mt-0.5 flex items-center gap-2 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="font-mono text-zinc-400">SOC Live Monitoring</span>
        </div>
      </div>

      {/* RIGHT: SYSTEM TELEMETRY & PROFILE */}
      <div className="flex items-center gap-4">
        {/* TIME CLOCK */}
        <div className="hidden items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/70 px-3.5 py-2 font-mono text-xs text-zinc-300 sm:flex">
          <Clock size={14} className="text-purple-400" />
          <span>{time}</span>
        </div>

        {/* NODES BADGE */}
        <div className="hidden items-center gap-2 rounded-xl border border-purple-500/25 bg-purple-500/10 px-3.5 py-2 text-xs font-semibold text-purple-300 md:flex">
          <Radio size={14} className="animate-pulse text-purple-400" />
          <span>Kali Bridge: 8000</span>
        </div>

        {/* USER PROFILE */}
        <div className="flex items-center gap-3 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/30 to-zinc-950/80 px-3.5 py-1.5 shadow-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-violet-400 font-black text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            A
          </div>
          <div className="hidden text-left lg:block">
            <p className="text-xs font-bold text-white">Security Analyst</p>
            <p className="text-[10px] font-mono text-purple-300">Level 3 Clearance</p>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Topbar;
