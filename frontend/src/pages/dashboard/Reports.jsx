import { useEffect, useState } from "react";
import { motion } from "framer-motion";


const Reports = () => {


  const [reports,setReports] = useState([]);



useEffect(()=>{

const token = localStorage.getItem("token");


fetch("http://127.0.0.1:5000/api/my-scans",{

headers:{
    "Authorization":`Bearer ${token}`
}

})

.then(res=>res.json())

.then(data=>{

console.log("USER SCANS:",data);

setReports(data.reverse());

})

.catch(err=>{

console.log("REPORT FETCH ERROR:",err);

});


},[]);





  const riskColor=(risk)=>{


    if(risk==="High")

      return "text-red-400 bg-red-500/20 border-red-500/40";


    if(risk==="Medium")

      return "text-yellow-400 bg-yellow-500/20 border-yellow-500/40";


    return "text-green-400 bg-green-500/20 border-green-500/40";


  };




return (

<div className="space-y-8">



<motion.h1

initial={{opacity:0,y:-20}}

animate={{opacity:1,y:0}}

className="
text-3xl
font-bold
text-white
"

>

🛡️ Security Reports

</motion.h1>






{

reports.length===0 ?


<div className="
rounded-xl
border
border-zinc-800
bg-zinc-950
p-5
text-zinc-400
">

No reports generated yet

</div>



:


reports.map((report,index)=>(



<motion.div

key={index}

initial={{
opacity:0,
y:30
}}

animate={{
opacity:1,
y:0
}}

transition={{
delay:index*0.1
}}

whileHover={{
scale:1.01
}}

className="
rounded-2xl
border
border-zinc-800
bg-zinc-950
p-5
"



>





{/* HEADER */}



<div className="
rounded-xl
border
border-purple-500/30
bg-purple-900/10
p-4
flex
justify-between
items-center
">


<div>


<h2 className="
text-3xl
font-bold
text-purple-400
drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]
">

🌐 {
    typeof report.website === "object"
    ? report.website
    : report.website || "Unknown"
}

</h2>



<p className="
mt-2
text-sm
text-zinc-400
">

Generated:

<span className="ml-2 text-white">

{report.created_at}

</span>

</p>


</div>




<div className={`

px-4
py-1.5
rounded-full
border
font-semibold

${riskColor(report.risk)}

`}>

⚠ {report.ai_report?.risk}

</div>



</div>









{/* CARDS */}



<div className="
mt-5
grid
md:grid-cols-3
gap-4
">


<Card

title="Security Score"

value={`${report.security_score}%`}

/>



<Card

title="Issues Found"

value={report.ai_report?.issues?.length || 0}

/>




<Card

title="SSL"

value={
report.ssl_status?.valid
?
"Valid"
:
"Invalid"
}

/>


</div>









{/* TECHNOLOGY */}



{

report.technologies?.length>0 &&


<Section title="⚙️ Technologies">


<div className="
flex
flex-wrap
gap-2
">


{

report.technologies.map((tech,i)=>(


<span

key={i}

className="
rounded-full
bg-purple-500/20
border
border-purple-500/30
px-3
py-1
text-sm
text-purple-300
"

>

{tech}

</span>



))

}


</div>


</Section>


}









{/* PORTS */}



{

report.ports?.length>0 &&


<Section title="🌐 Network Exposure">


<div className="
grid
md:grid-cols-2
gap-4
">


{


report.ports.map((port,i)=>(


<motion.div

key={i}

whileHover={{
scale:1.02
}}

className="
rounded-xl
border
border-green-500/30
bg-green-500/10
p-4
"

>


<h3 className="
text-xl
font-bold
text-green-400
">

🟢 Port {port.port}

</h3>



<p className="
mt-2
text-white
">

Service:

<span className="
ml-2
text-green-300
">

{port.service}

</span>


</p>




<p className="
mt-2
text-green-400
font-semibold
">

{port.status}

</p>



</motion.div>



))


}



</div>


</Section>


}









{/* PORT ANALYSIS */}



{

report.port_analysis?.length>0 &&


<Section title="🔍 Port Security Analysis">


{


report.port_analysis.map((item,i)=>(


<div

key={i}

className="
mt-4
rounded-xl
border
border-purple-500/20
bg-black
p-4
"

>


<h3 className="
text-purple-400
font-bold
">

Port {item.port} - {item.service}

</h3>



<p className="text-white mt-2">

Risk:

<span className="
ml-2
text-yellow-400
">

{item.risk}

</span>

</p>




<p className="
mt-2
text-zinc-300
">

{item.reason}

</p>




<p className="
mt-2
text-purple-300
">

Recommendation:

<span className="text-white ml-2">

{item.recommendation}

</span>


</p>



</div>


))


}



</Section>


}










{/* SSL */}



<Section title="🔐 SSL Security">


<div className="
rounded-xl
bg-blue-500/10
border
border-blue-500/30
p-4
">


<p className="text-white">

Status:

<span className="
ml-2
text-green-400
font-bold
">

{
report.ssl_status?.valid
?
"Valid"
:
"Invalid"
}

</span>


</p>



<p className="
mt-2
text-zinc-300
">

Issuer:

<span className="text-white ml-2">

{report.ssl_status?.issuer}

</span>

</p>


</div>


</Section>









{/* AI */}



<Section title="🤖 AI Security Report">


<div className="
rounded-xl
bg-purple-950/40
border
border-purple-500/30
p-4
">


<p className="text-purple-300">

{report.ai_report?.risk || "Unknown"}

</p>



{

report.ai_report?.recommendations?.map((r,i)=>(


<p

key={i}

className="
mt-2
text-zinc-300
"

>

⚡ {r}

</p>


))


}



</div>


</Section>







</motion.div>


))


}



</div>


);


};







const Card=({title,value})=>(


<motion.div

whileHover={{
y:-5
}}

className="
rounded-xl
bg-purple-600/10
border
border-purple-500/20
p-4
"


>


<p className="
text-zinc-400
text-sm
">

{title}

</p>



<h2 className="
mt-2
text-3xl
font-bold
text-white
">

{value}

</h2>


</motion.div>


);








const Section=({title,children})=>(


<div className="mt-7">


<h2 className="
text-xl
font-bold
text-white
mb-3
">

{title}

</h2>


{children}


</div>


);




export default Reports;