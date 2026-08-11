import {
  ShieldCheck,
  Globe,
  AlertTriangle,
  FileText,
  Activity,
  Network
} from "lucide-react";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import StatCard from "../../components/dashboard/StatCard";
import ThreatAnalytics from "../../components/dashboard/ThreatAnalytics";
import SecurityTrendChart from "../../components/dashboard/SecurityTrendChart";


const Overview = () => {


const [dashboard,setDashboard] = useState({});
const [reports,setReports] = useState([]);
const [loading,setLoading] = useState(true);



useEffect(()=>{


const token = localStorage.getItem("token");


console.log(
"TOKEN FROM OVERVIEW:",
token
);



fetch(
"http://127.0.0.1:5000/api/dashboard",
{
method:"GET",

headers:{
Authorization:`Bearer ${token}`,
"Content-Type":"application/json"
}

}

)


.then(res=>res.json())


.then(data=>{


console.log(
"DASHBOARD DATA:",
data
);



setDashboard(data);



/*
 IMPORTANT
 Graph + PieChart ke liye data
*/

setReports(
data.reports || []
);



setLoading(false);


})


.catch(err=>{


console.log(
"DASHBOARD ERROR:",
err
);


setLoading(false);


});



},[]);





const latestScan =
dashboard.latest_scan;




const stats=[


{
icon:<ShieldCheck size={28}/>,
title:"Security Score",
value:`${dashboard.average_score || 0}%`,
color:"text-green-400"
},



{
icon:<Globe size={28}/>,
title:"Websites Scanned",
value:dashboard.total_scans || 0,
color:"text-purple-400"
},



{
icon:<AlertTriangle size={28}/>,
title:"Critical Issues",
value:dashboard.high || 0,
color:"text-red-400"
},



{
icon:<FileText size={28}/>,
title:"Reports Generated",
value:dashboard.total_scans || 0,
color:"text-blue-400"
}


];






return (


<div>


{/* ================= STATS ================= */}


<div
className="
grid
md:grid-cols-4
gap-6
"
>


{
stats.map((item,index)=>(


<motion.div

key={index}

initial={{
opacity:0,
y:20
}}

animate={{
opacity:1,
y:0
}}

transition={{
delay:index*0.1
}}

>


<StatCard

icon={item.icon}

title={item.title}

value={
loading
?
"..."
:
item.value
}

color={item.color}

/>


</motion.div>


))

}



</div>







{/* ================= PIE + GRAPH ================= */}



<div
className="
grid
md:grid-cols-2
gap-6
mt-8
"
>



<motion.div

whileHover={{
scale:1.02
}}

className="
rounded-2xl
border
border-purple-500/40
bg-gradient-to-br
from-purple-950/50
via-black
to-zinc-950
p-6
"

>


<ThreatAnalytics

reports={reports}

/>


</motion.div>





<motion.div

whileHover={{
scale:1.02
}}

className="
rounded-2xl
border
border-purple-500/40
bg-gradient-to-br
from-purple-950/50
via-black
to-zinc-950
p-6
"

>


<SecurityTrendChart

reports={reports}

/>


</motion.div>



</div>









{/* ================= BOTTOM ================= */}



<div
className="
grid
md:grid-cols-2
gap-6
mt-8
"
>



<motion.div

className="
rounded-2xl
border
border-zinc-800
bg-zinc-950
p-6
"

>


<Activity

size={30}

className="text-green-400"

/>



<h2
className="
text-xl
font-bold
text-white
mt-4
"
>

System Status

</h2>



<p
className="
text-green-400
mt-4
"
>

● All Security Modules Active

</p>



<p
className="
text-zinc-400
mt-3
"
>

Web scanner, network scanner and AI engine are running.

</p>



</motion.div>







<motion.div

className="
rounded-2xl
border
border-zinc-800
bg-zinc-950
p-6
"

>


<Network

size={30}

className="text-purple-400"

/>


<h2
className="
text-xl
font-bold
text-white
mt-4
"
>
Latest Scan
</h2>



<p className="text-zinc-400 mt-3">
Scan completed successfully
</p>



<div className="mt-4 space-y-2 text-white">


<p>
Target:

<span className="ml-2 text-purple-400">
{
latestScan?.website || "No scan yet"
}
</span>

</p>



<p>
Score:

<span className="ml-2 text-green-400">
{
latestScan?.score || 0
}%
</span>

</p>



<p>
Risk:

<span className="ml-2 text-yellow-400">
{
latestScan?.risk || "Unknown"
}
</span>

</p>



</div>



</motion.div>




</div>





</div>



);

};


export default Overview;