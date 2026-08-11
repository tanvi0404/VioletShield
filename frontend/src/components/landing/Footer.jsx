import { Shield, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer
      id="contact"
      className="border-t border-zinc-800 bg-[#09090B] py-16"
    >
      <div className="mx-auto max-w-7xl px-6">

        <div className="grid gap-10 md:grid-cols-3">

          {/* Logo */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Shield size={32} className="text-purple-500" />

              <h2 className="text-2xl font-bold text-white">
                VioletShield
              </h2>
            </div>

            <p className="text-zinc-400">
              AI-Powered Cybersecurity Platform.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Quick Links
            </h3>

            <ul className="space-y-2 text-zinc-400">
              <li>Home</li>
              <li>Features</li>
              <li>Workflow</li>
              <li>Dashboard</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Contact
            </h3>

            <div className="flex items-center gap-3 text-zinc-400">
              <Mail size={18} />
              <span>support@violetshield.com</span>
            </div>

          </div>

        </div>

        <div className="mt-10 border-t border-zinc-800 pt-6 text-center text-zinc-500">
          © 2026 VioletShield
        </div>

      </div>
    </footer>
  );
};

export default Footer;