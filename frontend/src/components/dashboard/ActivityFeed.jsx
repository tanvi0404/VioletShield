const activities = [
  "Security headers checked",
  "SSL certificate verified",
  "Cookies analysed",
  "AI vulnerability analysis running...",
];

const ActivityFeed = () => {
  return (
    <div>

      <h3 className="mb-4 text-lg font-semibold text-white">
        Recent Activity
      </h3>

      <div className="space-y-3">

        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-center gap-3 text-zinc-300"
          >
            <div className="h-2 w-2 rounded-full bg-green-400"></div>

            <span>{activity}</span>
          </div>
        ))}

      </div>

    </div>
  );
};

export default ActivityFeed;