import { motion } from "framer-motion";

const StatCard = ({ icon, title, value, color }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-400">{title}</p>

          <h2 className={`mt-3 text-3xl font-bold ${color}`}>
            {value}
          </h2>
        </div>

        <div className="text-purple-400">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;