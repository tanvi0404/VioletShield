const AISecurityCard = ({ analysis }) => {


if (!analysis) return null;



const issues = analysis.issues || [];

const recommendations = analysis.recommendations || [];



const getRiskStyle = (risk)=>{


if(risk==="High"){

return "text-red-400 bg-red-500/10";

}


if(risk==="Medium"){

return "text-yellow-400 bg-yellow-500/10";

}


return "text-green-400 bg-green-500/10";


};





return (


<div className="
rounded-2xl
border
border-purple-500/30
bg-zinc-950
p-6
">





<h2 className="
mb-6
text-2xl
font-bold
text-white
">

🧠 AI Security Intelligence

</h2>







{/* RISK + SCORE */}


<div className="
grid
gap-5
md:grid-cols-2
mb-8
">





<div className="
rounded-xl
bg-purple-500/10
p-5
">


<p className="text-zinc-400">

Risk Level

</p>



<div className={`
mt-3
inline-block
rounded-full
px-5
py-2
font-bold
${getRiskStyle(analysis.risk)}
`}>

{analysis.risk || "Unknown"}

</div>



</div>







<div className="
rounded-xl
bg-purple-500/10
p-5
">


<p className="text-zinc-400">

Threat Score

</p>



<h1 className="
mt-2
text-4xl
font-black
text-purple-400
">

{

analysis.threat_score || 0

}

/100

</h1>


</div>





</div>









{/* ISSUES */}


<h3 className="
mb-4
text-lg
font-semibold
text-red-400
">

⚠ Security Issues

</h3>





{

issues.length===0 ? (


<div className="
rounded-xl
bg-green-500/10
p-4
text-green-300
">

✅ No security issues detected

</div>


):(


issues.map((issue,index)=>(


<div

key={index}

className="
mb-4
rounded-xl
border
border-red-500/20
bg-red-500/10
p-5
"

>


<div className="
flex
justify-between
items-center
">


<p className="
font-bold
text-red-300
">

{issue.title}

</p>



<span className="
rounded-full
bg-red-500/20
px-3
py-1
text-xs
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


)

}









{/* RECOMMENDATIONS */}


<h3 className="
mb-4
mt-8
text-lg
font-semibold
text-green-400
">

🛡 Recommendations

</h3>





{

recommendations.length===0 ? (


<div className="
rounded-xl
bg-zinc-900
p-4
text-zinc-400
">

No recommendations available

</div>


):(



recommendations.map((item,index)=>(


<div

key={index}

className="
mb-3
rounded-xl
bg-green-500/10
p-4
text-green-300
"

>


✓ {item}


</div>


))


)


}



</div>


);


};


export default AISecurityCard;