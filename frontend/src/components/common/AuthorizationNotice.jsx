import React from "react";
import { ShieldAlert } from "lucide-react";

const AuthorizationNotice = ({ checked, onChange }) => {
  return (
    <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 transition-all duration-300">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" />
        <div className="flex-1 text-sm">
          <p className="font-semibold text-purple-200">
            Authorization Compliance Required
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            VioletShield security scanning modules must strictly be executed against systems you own or have explicit written authorization to test.
          </p>
          <label className="mt-3 flex cursor-pointer items-center gap-2 select-none">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-purple-600 accent-purple-600 focus:ring-purple-500"
            />
            <span className="text-xs font-medium text-zinc-300 hover:text-white">
              I confirm that I am authorized to scan this target
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AuthorizationNotice;
