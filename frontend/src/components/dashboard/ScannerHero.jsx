import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const ScannerHero = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-900/30 to-zinc-900 p-8"
    >
      <div className="flex items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600/20">
          <ShieldCheck className="h-8 w-8 text-purple-400" />
        </div>

        <div>
          <h1 className="text-4xl font-black text-white">
            Website Security Scanner
          </h1>

          <p className="mt-2 text-zinc-400">
            Scan websites for security headers, SSL configuration,
            technologies, cookies and common vulnerabilities.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ScannerHero;