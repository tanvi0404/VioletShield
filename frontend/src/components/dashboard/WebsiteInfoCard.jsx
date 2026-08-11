import {
  Globe,
  MapPin,
  ShieldCheck,
  Zap,
  Building2,
} from "lucide-react";

const WebsiteInfoCard = ({ website }) => {
  if (!website) return null;

  const info = [
    {
      icon: Globe,
      label: "Domain",
      value: website.domain,
    },
    {
      icon: MapPin,
      label: "IP Address",
      value: website.ip,
    },
    {
      icon: ShieldCheck,
      label: "HTTPS",
      value: website.https ? "Enabled" : "Disabled",
      color: website.https ? "text-green-400" : "text-red-400",
    },
    {
      icon: Zap,
      label: "Response Time",
      value: website.responseTime,
    },
    {
      icon: Building2,
      label: "Hosting",
      value: website.hosting,
    },
  ];

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-lg">

      <h2 className="mb-6 text-2xl font-bold text-white">
        Website Information
      </h2>

      <div className="space-y-5">

        {info.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-600/20 p-2">
                  <Icon size={20} className="text-purple-400" />
                </div>

                <span className="text-zinc-400">
                  {item.label}
                </span>
              </div>

              <span
                className={`font-semibold ${
                  item.color ?? "text-white"
                }`}
              >
                {item.value}
              </span>
            </div>
          );
        })}

      </div>
    </div>
  );
};

export default WebsiteInfoCard;