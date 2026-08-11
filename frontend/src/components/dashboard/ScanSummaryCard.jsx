import {
  Clock3,
  ShieldAlert,
  Bug,
  CheckCircle2,
} from "lucide-react";

const ScanSummaryCard = ({ summary }) => {
  if (!summary) return null;

  const items = [
    {
      icon: CheckCircle2,
      label: "Status",
      value: summary.status,
      color: "text-green-400",
    },
    {
      icon: ShieldAlert,
      label: "Risk Level",
      value: summary.risk,
      color:
        summary.risk === "Low"
          ? "text-green-400"
          : summary.risk === "Medium"
          ? "text-yellow-400"
          : "text-red-400",
    },
    {
      icon: Clock3,
      label: "Duration",
      value: summary.duration,
    },
    {
      icon: Bug,
      label: "Issues Found",
      value: summary.issues,
    },
  ];

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-lg">

      <h2 className="mb-6 text-2xl font-bold text-white">
        Scan Summary
      </h2>

      <div className="space-y-4">
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-600/20 p-2">
                  <Icon className="h-5 w-5 text-purple-400" />
                </div>

                <span className="text-zinc-400">
                  {item.label}
                </span>
              </div>

              <span className={`font-semibold ${item.color || "text-white"}`}>
                {item.value}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default ScanSummaryCard;