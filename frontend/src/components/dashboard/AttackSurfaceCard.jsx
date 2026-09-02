import React from "react";
import { motion } from "framer-motion";
import {
  Layers,
  Globe,
  Lock,
  AlertTriangle,
  Server,
  ShieldCheck,
  Cpu,
  Radio
} from "lucide-react";

const AttackSurfaceCard = ({ attackSurface = {} }) => {
  const uniqueHosts = attackSurface.unique_hosts || 0;
  const totalAssets = attackSurface.total_scanned_assets || 0;
  const sslRate = attackSurface.ssl_compliance_rate ?? 100;
  const totalVulns = attackSurface.total_vulnerabilities || 0;
  const vulnDist = attackSurface.vulnerability_distribution || {};

  return (
    <div className="rounded-3xl border border-purple-500/20 bg-zinc-950/90 p-6 shadow-xl backdrop-blur-xl space-y-5 font-sans">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers size={18} className="text-purple-400" />
            Attack Surface & Asset Perimeter
          </h2>
          <p className="text-xs text-zinc-400">Continuous reconnaissance and perimeter discovery metrics</p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-bold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active Monitor
        </span>
      </div>

      {/* METRIC GRIDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block font-sans">Unique Hosts</span>
          <p className="text-2xl font-black text-white">{uniqueHosts}</p>
          <span className="text-[10px] text-purple-400 font-sans">Discovered Targets</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block font-sans">SSL Compliance</span>
          <p className={`text-2xl font-black ${sslRate >= 80 ? "text-emerald-400" : "text-amber-400"}`}>
            {sslRate}%
          </p>
          <span className="text-[10px] text-zinc-400 font-sans">Enforced HTTPS</span>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-rose-400 block font-sans">Critical/High Flaws</span>
          <p className="text-2xl font-black text-rose-400">{vulnDist.critical_high || 0}</p>
          <span className="text-[10px] text-rose-300 font-sans">Action Required</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block font-sans">Total Flaws Found</span>
          <p className="text-2xl font-black text-purple-300">{totalVulns}</p>
          <span className="text-[10px] text-zinc-400 font-sans">Indexed in DB</span>
        </div>
      </div>

      {/* SSL & SECURITY POSTURE BAR */}
      <div className="space-y-2 pt-2 border-t border-zinc-850">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <Lock size={13} className="text-purple-400" />
            Infrastructure Transport Encryption (SSL/TLS)
          </span>
          <span className="font-mono font-bold text-white">{sslRate}% Compliant</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${sslRate}%` }}
            transition={{ duration: 1 }}
            className={`h-full rounded-full ${sslRate >= 80 ? "bg-emerald-400" : "bg-amber-400"}`}
          />
        </div>
      </div>
    </div>
  );
};

export default AttackSurfaceCard;
