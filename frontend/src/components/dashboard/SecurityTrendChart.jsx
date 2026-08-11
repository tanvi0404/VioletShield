import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";


const SecurityTrendChart = ({ reports = [] }) => {


  const data = Object.values(

    reports.reduce((acc, report) => {

      let website = report.website;

      if (!website) return acc;


      website = website.replace("www.", "");


      acc[website] = {

        website,

        score:
          Number(report.security_score) || 0,

        risk:
          report.risk || "Unknown",

        date:
          report.created_at || ""

      };


      return acc;

    }, {})

  )

  .sort(
    (a,b)=>
      new Date(a.date) - new Date(b.date)
  )

  .slice(-3);



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
h-[420px]
shadow-[0_0_45px_rgba(168,85,247,0.3)]
backdrop-blur-xl
"
>


<h2
className="
text-xl
font-bold
text-white
mb-4
"
>
📈 Recent Security Score Trend
</h2>



<ResponsiveContainer
width="100%"
height="85%"
>


<LineChart

data={data}

margin={{
top:30,
right:40,
left:50,
bottom:40
}}

>


<CartesianGrid

stroke="rgba(255,255,255,0.08)"

vertical={false}

/>



<XAxis

dataKey="website"

stroke="#a1a1aa"

padding={{
left:40,
right:40
}}
tick={{
fontSize:12
}}

interval={0}

/>



<YAxis

domain={[0,100]}

stroke="#a1a1aa"

width={45}

tickCount={5}

/>



<Tooltip

contentStyle={{

background:"#09090b",

border:"1px solid #a855f7",

borderRadius:"14px",

color:"#fff",

boxShadow:
"0 0 30px rgba(168,85,247,0.5)"

}}

/>



<Line

type="monotone"

dataKey="score"

stroke="#c084fc"

strokeWidth={4}

dot={{

r:7,

fill:"#d8b4fe",

stroke:"#fff",

strokeWidth:2

}}

activeDot={{

r:10,

fill:"#fff",

stroke:"#a855f7",

strokeWidth:3

}}

/>



</LineChart>


</ResponsiveContainer>


</div>


)

}


export default SecurityTrendChart;