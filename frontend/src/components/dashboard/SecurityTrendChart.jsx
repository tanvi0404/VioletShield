import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { TrendingUp } from "lucide-react";

const SecurityTrendChart = ({ reports = [] }) => {
  const data = Object.values(
    reports.reduce((acc, report) => {
      let website = report.website;
      if (!website) return acc;
      website = website.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0];

      acc[website] = {
        website: website.length > 14 ? website.slice(0, 12) + ".." : website,
        score: Number(report.security_score) || 0,
        risk: report.risk || "Low",
        date: report.created_at || "",
      };
      return acc;
    }, {})
  )
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-6);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <TrendingUp size={18} className="text-purple-400" />
          Security Posture Trend
        </h2>
        <span className="text-xs text-zinc-500 font-mono">Score / 100</span>
      </div>

      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-xs text-zinc-500">
            <p>Scan targets to generate posture history.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="website"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                padding={{ left: 30, right: 30 }}
              />
              <YAxis stroke="#71717a" fontSize={11} domain={[0, 100]} tickLine={false} />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#09090b",
                  borderColor: "rgba(168,85,247,0.3)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#a855f7"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#scoreGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SecurityTrendChart;
