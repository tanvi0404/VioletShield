import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderTree,
  ExternalLink,
  Copy,
  Check,
  Search,
  Clock,
  Filter,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

const DirectoryScannerCard = ({ gobusterData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedPath, setCopiedPath] = useState(null);

  if (!gobusterData) return null;

  const paths = gobusterData.discovered_paths || [];
  const totalTested = gobusterData.total_tested || 0;
  const durationSec = gobusterData.duration_sec || 0;

  const handleCopy = (path) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const getStatusBadge = (code) => {
    if (code >= 200 && code < 300) {
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
    }
    if (code >= 300 && code < 400) {
      return "border-sky-500/40 bg-sky-500/10 text-sky-300";
    }
    if (code === 401 || code === 403) {
      return "border-amber-500/40 bg-amber-500/10 text-amber-300";
    }
    return "border-rose-500/40 bg-rose-500/10 text-rose-300";
  };

  const filteredPaths = paths.filter((item) => {
    const matchesSearch = item.path.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === "200") return matchesSearch && item.status_code >= 200 && item.status_code < 300;
    if (statusFilter === "REDIRECTS") return matchesSearch && item.status_code >= 300 && item.status_code < 400;
    if (statusFilter === "PROTECTED") return matchesSearch && (item.status_code === 401 || item.status_code === 403);
    return matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-zinc-950 to-black p-6 md:p-8 shadow-2xl space-y-6"
    >
      {/* HEADER & STATS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-purple-500/20 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/20 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <FolderTree size={24} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-purple-300">
              Phase 7 Directory Enumeration (Gobuster)
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Discovered Endpoints & Hidden Directories ({paths.length})
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
          <span className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 flex items-center gap-1.5">
            <Clock size={13} className="text-purple-400" />
            {durationSec}s Fuzzing Time
          </span>
          <span className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1.5">
            Tested: <strong className="text-white">{totalTested}</strong> paths
          </span>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            placeholder="Filter discovered paths (e.g. /admin, .env, api)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2.5 pl-10 pr-4 font-mono text-xs text-white outline-none transition focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {["ALL", "200", "REDIRECTS", "PROTECTED"].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                statusFilter === f
                  ? "border-purple-500 bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              {f === "200" ? "200 OK" : f}
            </button>
          ))}
        </div>
      </div>

      {/* PATHS LIST */}
      {paths.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center space-y-2">
          <ShieldCheck size={28} className="mx-auto text-emerald-400" />
          <p className="text-sm font-semibold text-zinc-300">
            No sensitive hidden directories or administrative interfaces discovered.
          </p>
          <p className="text-xs text-zinc-500">
            Target enforces standard URL routing with no exposed backup files.
          </p>
        </div>
      ) : filteredPaths.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-xs text-zinc-400">
          No discovered paths matched the filter query '{searchQuery}'.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="grid grid-cols-12 border-b border-zinc-800 bg-zinc-900/80 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            <div className="col-span-5 sm:col-span-6">Path / URL</div>
            <div className="col-span-3 sm:col-span-2 text-center">Status</div>
            <div className="col-span-2 hidden sm:block text-right">Size</div>
            <div className="col-span-4 sm:col-span-2 text-right">Action</div>
          </div>

          <div className="divide-y divide-zinc-900 max-h-96 overflow-y-auto font-mono text-xs">
            {filteredPaths.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 items-center px-4 py-3 transition hover:bg-purple-950/10"
              >
                <div className="col-span-5 sm:col-span-6 truncate font-bold text-zinc-200 flex items-center gap-2">
                  <span className="text-purple-400 font-normal">GET</span>
                  <span className="truncate">{item.path}</span>
                  {item.redirect_url && (
                    <span className="hidden lg:inline text-[10px] text-zinc-500 truncate">
                      &rarr; {item.redirect_url}
                    </span>
                  )}
                </div>

                <div className="col-span-3 sm:col-span-2 text-center">
                  <span className={`inline-block rounded-lg border px-2 py-0.5 text-[11px] font-bold ${getStatusBadge(item.status_code)}`}>
                    HTTP {item.status_code}
                  </span>
                </div>

                <div className="col-span-2 hidden sm:block text-right text-zinc-400 text-[11px]">
                  {item.content_length ? `${item.content_length} B` : "-"}
                </div>

                <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleCopy(item.url || item.path)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 transition hover:border-purple-500 hover:text-white"
                    title="Copy URL"
                  >
                    {copiedPath === (item.url || item.path) ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 transition hover:bg-purple-500/20"
                      title="Open in Browser"
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DirectoryScannerCard;
