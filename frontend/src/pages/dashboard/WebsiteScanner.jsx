import { useState } from "react";


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
import { scanWebsite } from "../../api/scannerApi";





const WebsiteScanner = () => {



const [loading,setLoading] = useState(false);


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




report:null



});











const handleScan = async(url)=>{


try{


setLoading(true);





console.log(
"Scanning:",
url
);







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


alert(result.error);

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

null





};










console.log(

"FORMATTED DATA:",

formattedData

);








setScanData(formattedData);





}

catch(error){



console.error(

"SCAN ERROR:",

error

);




alert(
"Unable to connect to backend"
);



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








<SecurityScoreCard

score={scanData.score}

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

<DomainInfoCard
domainInfo={domainInfo}
/>




</div>


);



};






export default WebsiteScanner;