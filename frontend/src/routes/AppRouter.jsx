import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "../pages/landing/Landing";
import Overview from "../pages/dashboard/Overview";
import WebsiteScanner from "../pages/dashboard/WebsiteScanner";
import NetworkScanner from "../pages/dashboard/NetworkScanner";
import NmapScanner from "../pages/dashboard/NmapScanner";
import ExploitSearch from "../pages/dashboard/ExploitSearch";
import CveSearch from "../pages/dashboard/CveSearch";
import ThreatIntel from "../pages/dashboard/ThreatIntel";
import Reports from "../pages/dashboard/Reports";
import FileAnalysis from "../pages/dashboard/FileAnalysis";
import UserSettings from "../pages/dashboard/UserSettings";
import Monitoring from "../pages/dashboard/Monitoring";
import Login from "../pages/auth/Login";



import Signup from "../pages/auth/Signup";
import DashboardLayout from "../layouts/DashboardLayout";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route
          path="/dashboard"
          element={<Navigate to="/dashboard/overview" replace />}
        />

        <Route
          path="/dashboard/overview"
          element={
            <DashboardLayout>
              <Overview />
            </DashboardLayout>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard/website-scanner"
          element={
            <DashboardLayout>
              <WebsiteScanner />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard/network-scanner"
          element={
            <DashboardLayout>
              <NetworkScanner />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard/nmap-scanner"
          element={
            <DashboardLayout>
              <NmapScanner />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard/exploit-search"
          element={
            <DashboardLayout>
              <ExploitSearch />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard/cve-search"
          element={
            <DashboardLayout>
              <CveSearch />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard/threat-intel"
          element={
            <DashboardLayout>
              <ThreatIntel />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard/reports"
          element={
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard/file-analysis"
          element={
            <DashboardLayout>
              <FileAnalysis />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard/settings"
          element={
            <DashboardLayout>
              <UserSettings />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard/monitoring"
          element={
            <DashboardLayout>
              <Monitoring />
            </DashboardLayout>
          }
        />

        {/* URL Aliases & Fallbacks */}
        <Route path="/dashboard/alerts" element={<Navigate to="/dashboard/monitoring" replace />} />
        <Route path="/dashboard/schedules" element={<Navigate to="/dashboard/monitoring" replace />} />
        <Route path="/dashboard/continuous-monitoring" element={<Navigate to="/dashboard/monitoring" replace />} />
        <Route path="/dashboard/continuous_monitoring" element={<Navigate to="/dashboard/monitoring" replace />} />
        <Route path="/dashboard/continuous monitoring" element={<Navigate to="/dashboard/monitoring" replace />} />
        <Route path="/dashboard/continuous%20monitoring" element={<Navigate to="/dashboard/monitoring" replace />} />
        <Route path="/continuous-monitoring" element={<Navigate to="/dashboard/monitoring" replace />} />
        <Route path="/continuous_monitoring" element={<Navigate to="/dashboard/monitoring" replace />} />
        <Route path="/monitoring" element={<Navigate to="/dashboard/monitoring" replace />} />
        <Route path="/dashboard/team" element={<Navigate to="/dashboard/settings" replace />} />


        <Route path="/dashboard/organization" element={<Navigate to="/dashboard/settings" replace />} />
        <Route path="/dashboard/user-settings" element={<Navigate to="/dashboard/settings" replace />} />
        <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />

        <Route path="/dashboard/malware-analysis" element={<Navigate to="/dashboard/file-analysis" replace />} />
        <Route path="/dashboard/file_analysis" element={<Navigate to="/dashboard/file-analysis" replace />} />
        <Route path="/file-analysis" element={<Navigate to="/dashboard/file-analysis" replace />} />
        <Route path="/malware-analysis" element={<Navigate to="/dashboard/file-analysis" replace />} />
        <Route path="/file-scan" element={<Navigate to="/dashboard/file-analysis" replace />} />

        <Route path="/dashboard/website scanner" element={<Navigate to="/dashboard/website-scanner" replace />} />
        <Route path="/dashboard/website%20scanner" element={<Navigate to="/dashboard/website-scanner" replace />} />
        <Route path="/dashboard/website_scanner" element={<Navigate to="/dashboard/website-scanner" replace />} />
        <Route path="/website-scanner" element={<Navigate to="/dashboard/website-scanner" replace />} />
        <Route path="/website_scanner" element={<Navigate to="/dashboard/website-scanner" replace />} />
        <Route path="/website scanner" element={<Navigate to="/dashboard/website-scanner" replace />} />
        <Route path="/scanner" element={<Navigate to="/dashboard/website-scanner" replace />} />


        <Route path="/dashboard/network scanner" element={<Navigate to="/dashboard/network-scanner" replace />} />
        <Route path="/dashboard/network%20scanner" element={<Navigate to="/dashboard/network-scanner" replace />} />
        <Route path="/dashboard/network_scanner" element={<Navigate to="/dashboard/network-scanner" replace />} />
        <Route path="/network-scanner" element={<Navigate to="/dashboard/network-scanner" replace />} />

        <Route path="/dashboard/nmap scanner" element={<Navigate to="/dashboard/nmap-scanner" replace />} />
        <Route path="/dashboard/nmap%20scanner" element={<Navigate to="/dashboard/nmap-scanner" replace />} />
        <Route path="/dashboard/nmap_scanner" element={<Navigate to="/dashboard/nmap-scanner" replace />} />
        <Route path="/nmap-scanner" element={<Navigate to="/dashboard/nmap-scanner" replace />} />

        <Route path="/dashboard/exploit scanner" element={<Navigate to="/dashboard/exploit-search" replace />} />
        <Route path="/dashboard/exploit_search" element={<Navigate to="/dashboard/exploit-search" replace />} />
        <Route path="/exploit-search" element={<Navigate to="/dashboard/exploit-search" replace />} />

        <Route path="/dashboard/threat_intel" element={<Navigate to="/dashboard/threat-intel" replace />} />
        <Route path="/threat-intel" element={<Navigate to="/dashboard/threat-intel" replace />} />

        <Route path="/api/cve_search" element={<Navigate to="/dashboard/cve-search" replace />} />
        <Route path="/api/cve-search" element={<Navigate to="/dashboard/cve-search" replace />} />
        <Route path="/cve-search" element={<Navigate to="/dashboard/cve-search" replace />} />
        <Route path="/cve_search" element={<Navigate to="/dashboard/cve-search" replace />} />
        <Route path="/dashboard/cve_search" element={<Navigate to="/dashboard/cve-search" replace />} />

        <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
      </Routes>
    </BrowserRouter>
  );
};





export default AppRouter;