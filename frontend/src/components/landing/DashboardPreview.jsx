import Card from "../ui/Card";
import {
  Shield,
  AlertTriangle,
  Wifi,
  Lock,
  BrainCircuit,
  Activity,
} from "lucide-react";

import { motion } from "framer-motion";


const DashboardPreview = () => {


return (

<motion.div

animate={{
  y:[0,-10,0]
}}

transition={{
  duration:5,
  repeat:Infinity,
  ease:"easeInOut"
}}

className="relative"

>


{/* Premium Glow */}

<div

className="
absolute
inset-0
rounded-3xl
bg-purple-600/20
blur-[80px]
"

/>





<Card

className="

relative

w-full

max-w-[450px]

rounded-3xl

border

border-purple-500/30

bg-[#111113]/90

p-5

shadow-[0_0_50px_rgba(168,85,247,0.30)]

backdrop-blur-xl

transition-all

duration-300

hover:border-purple-400/50

"

>





{/* HEADER */}


<div className="mb-5 flex items-center justify-between">


<div>

<p className="text-xs uppercase tracking-[0.25em] text-purple-400">

Live Security Scan

</p>


<h2 className="mt-1 text-xl font-bold text-white">

Scan Summary

</h2>


<p className="text-sm text-zinc-400">

example.com

</p>


</div>





<motion.div

animate={{
 rotate:[0,10,0]
}}

transition={{
 duration:3,
 repeat:Infinity
}}

className="

rounded-2xl

bg-purple-500/20

p-3

shadow-lg

shadow-purple-500/20

"

>

<Shield

size={34}

className="text-purple-400"

/>


</motion.div>


</div>









{/* SCORE CARD */}



<div

className="

rounded-2xl

border

border-purple-500/30

bg-purple-500/10

p-4

"


>


<div className="flex justify-between">


<p className="text-sm text-zinc-400">

Security Score

</p>


<Activity

size={18}

className="text-green-400"

/>


</div>





<div className="flex items-end gap-2">


<h2 className="mt-2 text-4xl font-black text-green-400">

94

</h2>


<span className="mb-1 text-xl font-bold text-green-400">

%

</span>


</div>





<div className="mt-3 h-2.5 overflow-hidden rounded-full bg-zinc-800">


<motion.div

initial={{
width:0
}}

animate={{
width:"94%"
}}

transition={{
duration:1.5
}}

className="

h-full

rounded-full

bg-gradient-to-r

from-green-400

to-emerald-500

"

/>


</div>


</div>










{/* STATS */}



<div className="mt-5 space-y-3">



<Stat

icon={<AlertTriangle size={22}/>}

title="Critical Issues"

value="1"

color="text-red-400"

/>





<Stat

icon={<Wifi size={22}/>}

title="Open Ports"

value="22 • 80 • 443"

color="text-purple-400"

/>





<Stat

icon={<Lock size={22}/>}

title="SSL Status"

value="Secure"

color="text-green-400"

/>





<Stat

icon={<BrainCircuit size={22}/>}

title="AI Analysis"

value="Running..."

color="text-cyan-400"

/>


</div>









{/* ENGINE STATUS */}


<div

className="

mt-5

flex

items-center

gap-3

rounded-xl

border

border-purple-500/20

bg-purple-500/10

p-3

"

>


<span

className="

h-3

w-3

rounded-full

bg-green-400

animate-pulse

"

/>


<p className="text-sm text-zinc-300">

VioletShield engine active

</p>


</div>






</Card>


</motion.div>


);

};







const Stat=({icon,title,value,color})=>(


<div

className="

flex

items-center

justify-between

rounded-xl

border

border-zinc-800

bg-zinc-900/70

px-4

py-3

transition

hover:border-purple-500/30

"

>


<div className="flex items-center gap-3">


<div className={color}>

{icon}

</div>


<p className="text-sm text-zinc-300">

{title}

</p>


</div>



<p

className={`text-sm font-bold ${color}`}

>

{value}

</p>



</div>


);



export default DashboardPreview;