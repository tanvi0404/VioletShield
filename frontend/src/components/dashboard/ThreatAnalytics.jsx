import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { ShieldAlert } from "lucide-react";

const ThreatAnalytics = ({ reports = [] }) => {
  // Score-aware, industry-standard risk categorization
  const highCount = reports.filter((r) => {
    const risk = (r.risk || "").toLowerCase();
    const score = Number(r.security_score) || 0;
    return risk === "high" || risk === "critical" || (score > 0 && score < 50);
  }).length;

  const mediumCount = reports.filter((r) => {
    const risk = (r.risk || "").toLowerCase();
    const score = Number(r.security_score) || 0;
    if (risk === "high" || risk === "critical" || (score > 0 && score < 50)) return false;
    return (risk === "medium" && score < 80) || (score >= 50 && score < 80);
  }).length;

  const lowCount = reports.filter((r) => {
    const risk = (r.risk || "").toLowerCase();
    const score = Number(r.security_score) || 0;
    if (risk === "high" || risk === "critical" || (score > 0 && score < 50)) return false;
    return risk === "low" || score >= 80;
  }).length;

  const data = [
    { name: "Critical / High", value: highCount, color: "#f43f5e" },
    { name: "Medium Risk", value: mediumCount, color: "#eab308" },
    { name: "Low Risk", value: lowCount, color: "#10b981" },
  ];


  const total = reports.length || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldAlert size={18} className="text-purple-400" />
          Threat Distribution
        </h2>
        <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-xs text-zinc-400">
          {total} Total Scans
        </span>
      </div>

      <div className="h-64 w-full">
        {total === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-xs text-zinc-500">
            <p>No vulnerability data recorded yet.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                stroke="rgba(0,0,0,0.5)"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#09090b",
                  borderColor: "rgba(168,85,247,0.3)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#fff",
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{
                  paddingTop: "10px",
                  fontSize: "11px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ThreatAnalytics;
