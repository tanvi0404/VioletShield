import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const WelcomeBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-zinc-900 p-6"
    >
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-purple-500/20 p-3">
          <ShieldCheck className="h-8 w-8 text-purple-400" />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome Back 👋
          </h1>

          <p className="mt-2 text-zinc-400">
            Your cybersecurity dashboard is ready. Monitor threats,
            launch scans and review reports from one place.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeBanner;