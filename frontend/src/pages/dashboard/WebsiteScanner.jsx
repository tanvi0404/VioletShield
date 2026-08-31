import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldAlert } from "lucide-react";

import ScannerHero from "../../components/dashboard/ScannerHero";
import ScannerInput from "../../components/dashboard/ScannerInput";

import SecurityScoreCard from "../../components/dashboard/SecurityScoreCard";
import WebsiteInfoCard from "../../components/dashboard/WebsiteInfoCard";
import ScanSummaryCard from "../../components/dashboard/ScanSummaryCard";
import SecurityHeadersCard from "../../components/dashboard/SecurityHeadersCard";
import VulnerabilityCard from "../../components/dashboard/VulnerabilityCard";
import TechnologyCard from "../../components/dashboard/TechnologyCard";
import AISecurityCard from "../../components/dashboard/AISecurityCard";
import SSLCard from "../../components/dashboard/SSLCard";
import ReportCard from "../../components/dashboard/ReportCard";
import CookieSecurityCard from "../../components/dashboard/CookieSecurityCard";
import DomainInfoCard from "../../components/dashboard/DomainInfoCard";
import DirectoryScannerCard from "../../components/dashboard/DirectoryScannerCard";
import NiktoMisconfigCard from "../../components/dashboard/NiktoMisconfigCard";
import { scanWebsite } from "../../api/scannerApi";

const WebsiteScanner = () => {

const [loading,setLoading] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
const [domainInfo,setDomainInfo] = useState(null);




const [scanData,setScanData] = useState({


score:0,



website:{

domain:"-",
ip:"-",
https:false,
responseTime:"-",
hosting:"-"

},



headers:{

score:0,
present:[],
missing:[]

},



cookies:{


total:0,

secure:[],

missing_secure:[],

missing_httponly:[],

missing_samesite:[]

},





vulnerabilities:[],



technologies:[],




ssl_analysis:{


valid:false,
issuer:"-",
expiry:"-",
daysRemaining:0

},






ai_analysis:{


risk:"Unknown",

issues:[],

recommendations:[]

},






summary:{


status:"Waiting",

risk:"Unknown",

duration:"-",

issues:0


},

gobuster:null,
nikto:null,

report:null



});












const handleScan = async(url)=>{


try{


setLoading(true);





console.log(
"Scanning:",
url
);







    setErrorMessage("");

    const result = await scanWebsite(url);

    setDomainInfo(
        result.domain_information
    );

    console.log(
    "SCAN RESULT:",
    result
    );

    // COOKIE DEBUG
    console.log(
    "COOKIE DATA:",
    result.cookies
    );

    if(result.error){
        setErrorMessage(result.error);
        return;
    }










const websiteData =

typeof result.website === "object"

?

result.website

:

{};









const formattedData = {





score:
result.score ?? 0,









website:{


domain:


websiteData.domain

||

url,




ip:


websiteData.ip

||

result.ip

||

"Unknown",





https:


websiteData.https

||

result.ssl_status?.valid

||

false,




responseTime:


websiteData.responseTime

||

"Unknown",





hosting:


websiteData.hosting

||

"Unknown"



},










headers:{


score:


result.security_headers?.score

??

result.headers?.score

??

0,





present:


result.security_headers?.present

??

result.headers?.present

??

[],






missing:


result.security_headers?.missing

??

result.headers?.missing

??

[]



},









// COOKIE DATA

cookies:


result.cookies

||

{


total:0,

secure:[],

missing_secure:[],

missing_httponly:[],

missing_samesite:[]


},










vulnerabilities:


result.vulnerabilities

||

result.ai_report?.issues

||

[],









technologies:


result.technologies

||

[],









ssl_analysis:


result.ssl_analysis

||

result.ssl

||

{


valid:false,

issuer:"Unknown",

expiry:"Unknown",

daysRemaining:0


},











ai_analysis:{


...(result.ai_report || result.ai_analysis || {}),



threat_score:


result.ai_report?.threat_score

||

result.ai_analysis?.threat_score

||

0


},











summary:{



status:"Completed",





risk:


result.ai_report?.risk

||

result.ai_analysis?.risk

||

"Unknown",






duration:


result.duration

||

result.summary?.duration

||

"2 sec",







issues:


result.ai_report?.issues?.length

||

result.ai_analysis?.issues?.length

||

0



},







report:


result.report

||

null,

gobuster: result.gobuster || null,
nikto: result.nikto || null,
risk_score_details: result.risk_score_details || null

};












console.log(

"FORMATTED DATA:",

formattedData

);








setScanData(formattedData);





}
catch(error){
    console.error("SCAN ERROR:", error);
    const msg = error.response?.data?.error || error.response?.data?.msg || error.message || "Failed to communicate with Flask backend.";
    setErrorMessage(msg);
}
finally{
    setLoading(false);
}
};

return (
<div className="space-y-8">
    <ScannerHero />

    <ScannerInput
        onScan={handleScan}
        loading={loading}
    />

    <AnimatePresence>
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-4 text-sm text-rose-300 flex items-center justify-between gap-3 shadow-lg backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage("")}
            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-200 transition"
          >
            Dismiss
          </button>
        </motion.div>
      )}
    </AnimatePresence>








<SecurityScoreCard
  score={scanData.score}
  riskDetails={scanData.risk_score_details}
/>









<VulnerabilityCard

vulnerabilities={
scanData.vulnerabilities
}

/>









<AISecurityCard

analysis={
scanData.ai_analysis
}

/>









<TechnologyCard

technologies={
scanData.technologies
}

/>









<div className="grid gap-6 lg:grid-cols-2">



<WebsiteInfoCard

website={
scanData.website
}

/>




<ScanSummaryCard

summary={
scanData.summary
}

/>


</div>









<SecurityHeadersCard

headers={
scanData.headers
}

/>









<CookieSecurityCard

cookies={
scanData.cookies
}

/>










<ReportCard

report={
scanData.report
}

/>









<SSLCard

ssl={
scanData.ssl_analysis
}

/>

{/* PHASE 7 ADVANCED WEB VULNERABILITY AUDIT */}
{scanData.gobuster && (
  <DirectoryScannerCard gobusterData={scanData.gobuster} />
)}

{scanData.nikto && (
  <NiktoMisconfigCard niktoData={scanData.nikto} />
)}

<DomainInfoCard
domainInfo={domainInfo}
/>




</div>



);



};






export default WebsiteScanner;