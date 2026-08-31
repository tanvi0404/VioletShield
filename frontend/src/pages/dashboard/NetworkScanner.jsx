import { useState } from "react";
import { scanNetwork } from "../../api/scannerApi";
import NetworkAICard from "../../components/dashboard/NetworkAICard";
import DomainInfoCard from "../../components/dashboard/DomainInfoCard";
import TechnologyCard from "../../components/dashboard/TechnologyCard";
import SecurityHeadersCard from "../../components/dashboard/SecurityHeadersCard";
import AuthorizationNotice from "../../components/common/AuthorizationNotice";

const NetworkScanner = () => {
  const [domain, setDomain] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [ports, setPorts] = useState([]);
  const [analysis, setAnalysis] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [securityHeaders, setSecurityHeaders] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [domainInfo, setDomainInfo] = useState(null);
  const [networkScore, setNetworkScore] = useState(0);

  const [stats, setStats] = useState({
    high: 0,
    medium: 0,
    low: 0,
  });

  const handleScan = async () => {
    if (!domain) {
      alert("Please enter domain");
      return;
    }

    if (!authorized) {
      alert("Please confirm authorization before scanning.");
      return;
    }

    try {
      setLoading(true);



setPorts([]);

setAnalysis([]);

setAiReport(null);

setSecurityHeaders(null);





const result = await scanNetwork(domain);



console.log(
"NETWORK RESULT:",
result
);





const portData = result.ports || [];

const analysisData = result.port_analysis || [];

const techData = result.technologies || [];

const headerData = result.security_headers || null;

const aiData = result.network_ai_report || null;

const domainData = result.domain_information || null;




setPorts(portData);

setAnalysis(analysisData);

setTechnologies(techData);

setSecurityHeaders(headerData);

setAiReport(aiData);

setDomainInfo(domainData);





let high = 0;

let medium = 0;

let low = 0;





analysisData.forEach((item)=>{


if(item.risk==="High")

high++;


else if(item.risk==="Medium")

medium++;


else

low++;


});





setStats({

high,

medium,

low

});






if(aiData?.threat_score){

    setNetworkScore(
        100 - aiData.threat_score
    );

}
else{

    setNetworkScore(0);

}



}

catch(error){


console.log(error);


alert(
"Unable to connect backend"
);


}

finally{


setLoading(false);


}


};

const getRiskStyle=(risk)=>{


if(risk==="High"){

return {

box:"border-red-500 bg-red-950/30",

text:"text-red-400"

};

}




if(risk==="Medium"){

return {

box:"border-yellow-500 bg-yellow-950/30",

text:"text-yellow-400"

};

}




return {

box:"border-green-500 bg-green-950/30",

text:"text-green-400"

};


};







return (

<div className="space-y-8">





{/* HEADER */}


<div
className="
rounded-3xl
border
border-purple-500/30
bg-zinc-950
p-8
"
>


<h1
className="
text-4xl
font-black
text-white
"
>

Network Scanner

</h1>



<p
className="
mt-3
text-zinc-400
"
>

Discover open ports, running services and network exposure.

</p>


</div>







{/* INPUT */}



<div
className="
rounded-3xl
border
border-zinc-800
bg-zinc-950
p-8
"
>



<h2
className="
text-2xl
font-bold
text-white
"
>

Port Discovery

</h2>





<div
className="
mt-6
flex
gap-4
"
>



<input

value={domain}

onChange={(e)=>setDomain(e.target.value)}

placeholder="Enter domain (google.com)"

className="
flex-1
rounded-xl
border
border-zinc-700
bg-black
px-5
py-4
text-white
outline-none
focus:border-purple-500
"

/>





        <button
          onClick={handleScan}
          disabled={loading || !authorized}
          className="rounded-xl bg-purple-600 px-8 font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Scanning..." : "Scan Ports"}
        </button>
      </div>

      <div className="mt-4">
        <AuthorizationNotice checked={authorized} onChange={setAuthorized} />
      </div>
    </div>









{/* NETWORK SCORE */}



<div
className="
rounded-3xl
border
border-purple-500/30
bg-zinc-950
p-8
"
>



<h2
className="
text-2xl
font-bold
text-white
"
>

Network Security Score

</h2>




<h1
className="
mt-5
text-6xl
font-black
text-purple-400
"
>

{networkScore}%

</h1>





<div
className="
mt-6
grid
grid-cols-3
gap-4
"
>




<div
className="
rounded-xl
bg-red-950/30
p-4
text-center
"
>

<p className="text-red-400">

High

</p>


<p className="text-2xl text-white">

{stats.high}

</p>


</div>





<div
className="
rounded-xl
bg-yellow-950/30
p-4
text-center
"
>

<p className="text-yellow-400">

Medium

</p>


<p className="text-2xl text-white">

{stats.medium}

</p>


</div>





<div
className="
rounded-xl
bg-green-950/30
p-4
text-center
"
>

<p className="text-green-400">

Low

</p>


<p className="text-2xl text-white">

{stats.low}

</p>


</div>



</div>



</div>





{/* OPEN PORTS */}



<div
className="
rounded-3xl
border
border-zinc-800
bg-zinc-950
p-8
"
>


<h2
className="
text-2xl
font-bold
text-white
"
>

Open Ports

</h2>





{

ports.length===0 && !loading && (

<p className="mt-5 text-zinc-400">

No ports scanned yet.

</p>

)

}





{

ports.map((port,index)=>(


<div

key={index}

className="
mt-5
rounded-xl
border
border-green-700
bg-green-950/30
p-5
"

>


<h3
className="
text-xl
font-bold
text-green-400
"
>

🟢 Port {port.port}

</h3>



<p className="mt-2 text-zinc-300">

Service: {port.service}

</p>



<p className="text-green-400">

Status: {port.status}

</p>



</div>


))

}



</div>









{/* RISK ANALYSIS */}



<div
className="
rounded-3xl
border
border-zinc-800
bg-zinc-950
p-8
"
>



<h2
className="
text-2xl
font-bold
text-white
"
>

Port Risk Analysis

</h2>





{

analysis.length===0 && (

<p className="mt-5 text-zinc-400">

No risk analysis available.

</p>

)

}






{

analysis.map((item,index)=>{


const style = getRiskStyle(item.risk);



return (

<div

key={index}

className={`
mt-5
rounded-xl
border
p-5
${style.box}
`}

>



<h3
className={`
text-xl
font-bold
${style.text}
`}
>

Port {item.port}

</h3>




<p className="mt-3 text-white">

Service: {item.service}

</p>




<p className="mt-2 text-white">

Risk:

<span
className={`
ml-2
font-bold
${style.text}
`}
>

{item.risk}

</span>

</p>




<p className="mt-3 text-zinc-300">

{item.reason}

</p>




<p className="mt-3 text-purple-300">

Recommendation:

{item.recommendation}

</p>



</div>


)


})



}






</div>









{/* TECHNOLOGY */}



<TechnologyCard

technologies={technologies}

/>








{/* SECURITY HEADERS */}



<SecurityHeadersCard

headers={securityHeaders}

/>


<DomainInfoCard

data={domainInfo}

/>






{/* AI NETWORK ANALYSIS */}



{

aiReport && (

<NetworkAICard

analysis={aiReport}

portAnalysis={analysis}

/>

)

}






</div>

);


};



export default NetworkScanner;