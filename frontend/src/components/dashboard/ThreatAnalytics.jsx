import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";


const ThreatAnalytics = ({ reports }) => {



const data = [

{
name:"High",
value:
reports.filter(
r=>r.risk==="High"
).length,
color:"#ef4444"
},

{
name:"Medium",
value:
reports.filter(
r=>r.risk==="Medium"
).length,
color:"#facc15"
},

{
name:"Low",
value:
reports.filter(
r=>r.risk==="Low"
).length,
color:"#22c55e"
}

];





return (
<div
className="
rounded-2xl
border
border-purple-500/40
bg-gradient-to-br
from-purple-950/50
via-black
to-zinc-950
p-6
shadow-[0_0_45px_rgba(168,85,247,0.3)]
backdrop-blur-xl
h-[420px]
"
>



<h2

className="
text-xl
font-bold
text-white
mb-8
"

>

📊 Threat Analytics

</h2>






<div className="h-64">



<ResponsiveContainer

width="100%"

height={320} //

>



<PieChart>





{/* CENTER VALUE */}


<text
x="50%"
y="46%"
textAnchor="middle"
dominantBaseline="middle"
fill="white"
fontSize="28"
fontWeight="800"
>
{reports.length}
</text>


<text
x="50%"
y="54%"
textAnchor="middle"
fill="#a1a1aa"
fontSize="12"
>
Total Scans
</text>








<Pie

data={data}

dataKey="value"

nameKey="name"

cx="50%"

cy="50%"

innerRadius={55}

outerRadius={95}

paddingAngle={6}

stroke="rgba(255,255,255,0.2)"

animationDuration={1200}



>


{


data.map(
(entry,index)=>(


<Cell

key={index}

fill={entry.color}

/>


)

)


}



</Pie>







<Tooltip

contentStyle={{

background:"#09090b",

border:"1px solid #a855f7",

borderRadius:"14px",

color:"#fff",

boxShadow:
"0 0 25px rgba(168,85,247,0.5)"


}}



/>








<Legend


verticalAlign="bottom"


align="center"


iconType="circle"


wrapperStyle={{

paddingTop:"15px",

fontSize:"13px",

color:"#fff"

}}



/>







</PieChart>




</ResponsiveContainer>




</div>




</div>



);


};


export default ThreatAnalytics;