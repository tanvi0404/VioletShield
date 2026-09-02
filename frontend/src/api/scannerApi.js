import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000",
});

// Attach JWT token automatically
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
};

// ===================================
// WEBSITE SCANNER
// ===================================
export const scanWebsite = async (url) => {
  const response = await API.post(
    "/api/scan",
    { url },
    getAuthHeaders()
  );
  return response.data;
};

// ===================================
// BASIC NETWORK SCANNER
// ===================================
export const scanNetwork = async (domain) => {
  const response = await API.post(
    "/api/network-scan",
    { domain },
    getAuthHeaders()
  );
  return response.data;
};

// ===================================
// NMAP ADVANCED SCANNER & EXPLOITDB
// ===================================
export const scanNmap = async (target) => {
  const response = await API.post(
    "/api/nmap-scan",
    { target },
    getAuthHeaders()
  );
  return response.data;
};

// ===================================
// EXPLOITDB / SEARCHSPLOIT LOOKUP
// ===================================
export const searchExploitDB = async (query) => {
  const response = await API.post(
    "/api/exploit-search",
    { query },
    getAuthHeaders()
  );
  return response.data;
};

// ===================================
// PHASE 6: CVE INTELLIGENCE LOOKUP
// ===================================
export const searchCVE = async (params) => {
  const payload = typeof params === "string" ? { query: params } : params;
  const response = await API.post(
    "/api/cve-search",
    payload,
    getAuthHeaders()
  );
  return response.data;
};

// ===================================
// PHASE 7: ADVANCED WEB VULNERABILITY SCANNER
// ===================================
export const runAdvancedWebScan = async (url, options = {}) => {
  const response = await API.post(
    "/api/advanced-web-scan",
    { url, ...options },
    getAuthHeaders()
  );
  return response.data;
};

export const runDirScan = async (url, options = {}) => {
  const response = await API.post(
    "/api/dir-scan",
    { url, ...options },
    getAuthHeaders()
  );
  return response.data;
};

export const runNiktoScan = async (url) => {
  const response = await API.post(
    "/api/nikto-scan",
    { url },
    getAuthHeaders()
  );
  return response.data;
};



// ===================================
// PHASE 8: MALWARE & FILE ANALYSIS
// ===================================
export const scanFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("token");
  const response = await API.post("/api/file-scan", formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const lookupFileHash = async (hash) => {
  const response = await API.post(
    "/api/hash-lookup",
    { hash },
    getAuthHeaders()
  );
  return response.data;
};

// ===================================
// PHASE 9: ADVANCED THREAT INTELLIGENCE
// ===================================
export const checkThreatIntel = async (target) => {
  const payload = typeof target === "string" ? { target } : target;
  const response = await API.post(
    "/api/threat-intel",
    payload,
    getAuthHeaders()
  );
  return response.data;
};

export const checkDomainThreatIntel = async (domain) => {
  const response = await API.post(
    "/api/threat-intel/domain",
    { domain },
    getAuthHeaders()
  );
  return response.data;
};

export const checkUrlThreatIntel = async (url) => {
  const response = await API.post(
    "/api/threat-intel/url",
    { url },
    getAuthHeaders()
  );
  return response.data;
};

export const checkIpThreatIntel = async (ip) => {
  const response = await API.post(
    "/api/threat-intel/ip",
    { ip },
    getAuthHeaders()
  );
  return response.data;
};

export const checkDnsBlacklists = async (ip) => {
  const response = await API.post(
    "/api/threat-intel/blacklists",
    { ip },
    getAuthHeaders()
  );
  return response.data;
};


// ===================================
// DASHBOARD STATS
// ===================================
export const getDashboardStats = async () => {
  const response = await API.get("/api/dashboard", getAuthHeaders());
  return response.data;
};

// ===================================
// USER SCANS & REPORTS
// ===================================
export const getMyScans = async () => {
  const response = await API.get("/api/my-scans", getAuthHeaders());
  return response.data;
};

export const getScans = getMyScans;


export const getReports = async () => {
  const response = await API.get("/api/reports", getAuthHeaders());
  return response.data;
};

// ===================================
// PHASE 11: MULTI-FORMAT REPORT EXPORTS
// ===================================
export const downloadReportPdf = (reportId) => {
  return `http://127.0.0.1:5000/api/report/${reportId}/pdf`;
};

export const downloadReportJson = (reportId) => {
  return `http://127.0.0.1:5000/api/report/${reportId}/json`;
};

export const downloadReportHtml = (reportId) => {
  return `http://127.0.0.1:5000/api/report/${reportId}/html`;
};

export const exportCustomReport = async (scanData, format = "json") => {
  const response = await API.post(
    "/api/report/export",
    { ...scanData, format },
    getAuthHeaders()
  );
  return response.data;
};

// ===================================
// PHASE 14: CONTINUOUS MONITORING & ALERTING
// ===================================

export const getScheduledScans = async () => {
  const response = await API.get("/api/schedules", getAuthHeaders());
  return response.data;
};

export const createScheduledScan = async (scheduleData) => {
  const response = await API.post(
    "/api/schedules",
    scheduleData,
    getAuthHeaders()
  );
  return response.data;
};

export const deleteScheduledScan = async (schedId) => {
  const response = await API.delete(
    `/api/schedules/${schedId}`,
    getAuthHeaders()
  );
  return response.data;
};

export const triggerScheduledScan = async (schedId) => {
  const response = await API.post(
    `/api/schedules/${schedId}/run`,
    {},
    getAuthHeaders()
  );
  return response.data;
};

export const getNotificationChannels = async () => {
  const response = await API.get("/api/notification-channels", getAuthHeaders());
  return response.data;
};

export const createNotificationChannel = async (channelData) => {
  const response = await API.post(
    "/api/notification-channels",
    channelData,
    getAuthHeaders()
  );
  return response.data;
};

export const testNotificationChannel = async (channelData) => {
  const response = await API.post(
    "/api/notification-channels/test",
    channelData,
    getAuthHeaders()
  );
  return response.data;
};

export const deleteNotificationChannel = async (channelId) => {
  const response = await API.delete(
    `/api/notification-channels/${channelId}`,
    getAuthHeaders()
  );
  return response.data;
};

export const getSecurityAlerts = async () => {
  const response = await API.get("/api/alerts", getAuthHeaders());
  return response.data;
};

// ===================================
// PHASE 15: CLOUD INFRASTRUCTURE & IAC SECURITY
// ===================================
export const scanIacFile = async (formData) => {
  const token = localStorage.getItem("token");
  const response = await API.post("/api/iac-scan", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const scanIacSnippet = async (code, format = "terraform") => {
  const response = await API.post(
    "/api/iac-scan/snippet",
    { code, format },
    getAuthHeaders()
  );
  return response.data;
};

export const getIacRules = async () => {
  const response = await API.get("/api/iac-scan/rules", getAuthHeaders());
  return response.data;
};

// ===================================
// PHASE 16: REGULATORY COMPLIANCE & FRAMEWORK MAPPING
// ===================================
export const getScanCompliance = async (scanId) => {
  const response = await API.get(`/api/compliance/${scanId}`, getAuthHeaders());
  return response.data;
};

export const evaluateCompliance = async (scanData) => {
  const response = await API.post(
    "/api/compliance/evaluate",
    scanData,
    getAuthHeaders()
  );
  return response.data;
};

export const getComplianceFrameworks = async () => {
  const response = await API.get("/api/compliance/frameworks", getAuthHeaders());
  return response.data;
};

// ===================================
// PHASE 17: AUTOMATED REMEDIATION & PATCH GENERATOR
// ===================================
export const generatePatch = async (vulnData) => {
  const response = await API.post(
    "/api/generate-patch",
    vulnData,
    getAuthHeaders()
  );
  return response.data;
};

export const getRemediationCatalog = async () => {
  const response = await API.get("/api/remediation-catalog", getAuthHeaders());
  return response.data;
};





