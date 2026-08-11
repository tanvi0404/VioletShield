const SecurityScoreCard = ({ score }) => {
  let color = "text-red-400";
  let bg = "bg-red-500";

  if (score >= 80) {
    color = "text-green-400";
    bg = "bg-green-400";
  } else if (score >= 60) {
    color = "text-yellow-400";
    bg = "bg-yellow-400";
  }

  return (
    <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 shadow-lg">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm uppercase tracking-widest text-zinc-400">
            Security Score
          </p>

          <h2 className={`mt-3 text-6xl font-black ${color}`}>
            {score}
            <span className="text-3xl">%</span>
          </h2>

          <p className="mt-2 text-zinc-400">
            Overall website security rating
          </p>
        </div>

        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-600/20 border border-purple-500/30">
          🛡️
        </div>

      </div>

      <div className="mt-8 h-4 overflow-hidden rounded-full bg-zinc-700">
        <div
          className={`${bg} h-full rounded-full transition-all duration-1000`}
          style={{ width: `${score}%` }}
        />
      </div>

    </div>
  );
};

export default SecurityScoreCard;