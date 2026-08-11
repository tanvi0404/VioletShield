const NetworkAICard = ({ analysis }) => {

if(!analysis) return null;


const score = analysis.threat_score ?? 0;


const getRiskColor = (risk)=>{

if(risk==="High")
return "text-red-400 bg-red-950/30 border-red-500/40";

if(risk==="Medium")
return "text-yellow-400 bg-yellow-950/30 border-yellow-500/40";

return "text-green-400 bg-green-950/30 border-green-500/40";

};


const getScoreLabel = (score)=>{

if(score <=30)
return "Low Threat";

if(score <=70)
return "Medium Threat";

return "High Threat";

};



return (

<div className="
mt-8
rounded-2xl
border
border-purple-500/30
bg-zinc-950
p-6
">


{/* HEADER */}

<div className="flex justify-between items-center">

<h2 className="
text-2xl
font-bold
text-white
">

🤖 AI Network Analysis

</h2>


<span className="
rounded-full
bg-purple-500/20
px-4
py-2
text-purple-300
">

AI Powered

</span>


</div>



{/* SCORE */}

<div className="mt-8">


<p className="text-zinc-400">
Threat Score
</p>


<div className="
mt-2
flex
items-center
gap-3
">


<h1 className="
text-5xl
font-black
text-purple-400
">

{score}/100

</h1>


<span className="
text-zinc-400
">

{getScoreLabel(score)}

</span>


</div>



{/* PROGRESS BAR */}

<div className="
mt-5
h-4
rounded-full
bg-zinc-800
overflow-hidden
">


<div

className={`
h-full
rounded-full

${
score <=30
?
"bg-green-500"
:
score <=70
?
"bg-yellow-500"
:
"bg-red-500"
}

`}

style={{
width:`${score}%`
}}

/>


</div>



<p className="
mt-3
text-sm
text-zinc-400
">

AI calculated network exposure score

</p>


</div>




{/* RISK */}

<div className="
mt-6
">

<p className="text-zinc-400">
Risk Level
</p>


<span className={`
inline-block
mt-2
rounded-full
border
px-4
py-2
font-semibold

${getRiskColor(analysis.risk)}

`}>

{analysis.risk}

</span>


</div>




{/* SUMMARY */}

<div className="mt-6">


<h3 className="
text-white
font-bold
">

🎯 Attack Surface

</h3>


<p className="
mt-2
text-zinc-400
">

{analysis.summary ||
"Network exposure analysis completed"}

</p>


</div>




{/* ISSUES */}

<div className="mt-6">


<h3 className="
text-white
font-bold
">

🚨 Security Issues

</h3>



{

analysis.issues?.length ?

analysis.issues.map((item,index)=>(


<div

key={index}

className="
mt-4
rounded-xl
border
border-red-500/30
bg-red-950/30
p-5
"

>


<div className="
flex
justify-between
">

<span className="text-white font-semibold">

{item.title}

</span>


<span className="
text-red-400
">

{item.severity}

</span>


</div>



<p className="
mt-2
text-zinc-300
">

{item.description}

</p>


</div>


))


:

<p className="text-green-400 mt-3">

No security issues detected

</p>


}


</div>




{/* RECOMMENDATIONS */}

<div className="mt-6">


<h3 className="
text-white
font-bold
">

🛡 AI Recommendations

</h3>



{

analysis.recommendations?.map((item,index)=>(


<div

key={index}

className="
mt-3
rounded-xl
bg-green-950/30
p-4
text-green-300
"

>

✓ {item}

</div>


))


}



</div>


</div>


);

};


export default NetworkAICard;