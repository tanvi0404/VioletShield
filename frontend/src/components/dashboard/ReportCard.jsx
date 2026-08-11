import axios from "axios";


const ReportCard = ({ report }) => {


if(!report){
    return null;
}



const issues = report.ai_report?.issues || [];



const downloadReport = async()=>{

try{


const response = await axios.get(
`http://localhost:5000/api/report/${report.id}`,
{
responseType:"blob"
}
);



const url = window.URL.createObjectURL(response.data);



const link = document.createElement("a");


link.href = url;


link.download="VioletShield_Report.pdf";


document.body.appendChild(link);


link.click();


link.remove();



alert("PDF Generated Successfully");


}

catch(error){

console.log(error);

alert("PDF generation failed");

}


};





return (

<div
className="
mt-8
rounded-3xl
border
border-purple-500/30
bg-zinc-950
p-6
shadow-[0_0_40px_rgba(168,85,247,0.15)]
"
>


<h2
className="
mb-6
text-2xl
font-bold
text-white
"
>

📄 Security Report

</h2>





{/* TOP CARDS */}


<div
className="
grid
gap-5
md:grid-cols-2
"
>


<div className="
rounded-xl
border
border-purple-500/20
bg-purple-500/10
p-5
">

<p className="text-zinc-400">
Website
</p>

<h3 className="
mt-2
text-xl
font-bold
text-white
">

{report.website || "Unknown"}

</h3>

</div>






<div className="
rounded-xl
border
border-purple-500/20
bg-purple-500/10
p-5
">


<p className="text-zinc-400">
Security Score
</p>


<h3 className="
mt-2
text-4xl
font-black
text-purple-400
">

{report.security_score ?? 0}%

</h3>


</div>






<div className="
rounded-xl
border
border-yellow-500/20
bg-yellow-500/10
p-5
">


<p className="text-zinc-400">
AI Risk Level
</p>


<h3 className="
mt-2
text-xl
font-bold
text-yellow-400
">

{report.ai_report?.risk || "Unknown"}

</h3>


</div>






<div className="
rounded-xl
border
border-green-500/20
bg-green-500/10
p-5
">


<p className="text-zinc-400">
Generated On
</p>


<h3 className="
mt-2
text-xl
font-bold
text-green-400
">

{report.date || "Unknown"}

</h3>


</div>


</div>









{/* SSL */}


<div
className="
mt-6
rounded-xl
border
border-green-500/30
bg-green-500/10
p-6
"
>


<p className="text-zinc-400">
SSL Status
</p>


<h3 className="
mt-2
text-xl
font-bold
text-green-400
">

{
report.ssl_status?.valid
?
"✅ Valid"
:
"❌ Invalid"
}

</h3>



<p className="mt-3 text-zinc-300">

Issuer:

<span className="
ml-2
font-semibold
text-white
">

{report.ssl_status?.issuer || "Unknown"}

</span>


</p>


</div>









{/* SECURITY FINDINGS */}


<div
className="
mt-8
rounded-2xl
border
border-red-500/30
bg-gradient-to-br
from-red-950/40
to-black
p-6
"
>


<h3 className="
text-xl
font-bold
text-red-400
">

⚠ Security Findings

</h3>



<p className="mt-2 text-zinc-400">

{issues.length}

{" "}

Security Issues Detected

</p>





<div className="
mt-6
space-y-4
">

{

issues.length > 0 ?


issues.map((issue,index)=>(


<div
key={index}
className="
rounded-xl
border
border-red-500/30
bg-red-500/10
p-5
"
>


<div className="
flex
justify-between
items-center
"
>


<h4 className="
font-bold
text-red-300
">

🚨 {issue.title}

</h4>


<span className="
rounded-full
bg-red-500/20
px-3
py-1
text-sm
text-red-300
">

{issue.severity}

</span>


</div>



<p className="
mt-3
text-zinc-300
">

{issue.description}

</p>


</div>


))


:


<div
className="
rounded-xl
bg-green-500/10
border
border-green-500/30
p-5
"
>

<p className="
text-green-400
font-bold
">

✅ No Security Issues Found

</p>


<p className="
text-zinc-400
mt-2
">

Website passed all current security checks.

</p>


</div>


}


</div>


</div>









<button

onClick={downloadReport}

className="
mt-6
rounded-xl
bg-purple-600
px-6
py-3
font-bold
text-white
hover:bg-purple-700
transition
"

>

📄 Download Report

</button>









{/* TECHNOLOGIES */}



<div
className="
mt-6
rounded-xl
border
border-purple-500/20
bg-purple-500/10
p-5
"
>


<h3 className="
font-bold
text-purple-300
">

🌐 Technologies

</h3>



<div className="
mt-4
flex
flex-wrap
gap-3
">


{

report.technologies?.length > 0 ?


report.technologies.map((tech,index)=>(


<span
key={index}
className="
rounded-full
bg-purple-500/20
px-4
py-2
text-purple-300
"
>

{tech}

</span>


))


:

<p className="text-zinc-400">

No technologies detected

</p>


}


</div>


</div>







</div>


);


};


export default ReportCard;