import DashboardPreview from "./DashboardPreview";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";


const Hero = () => {


const handleLearnMore =()=>{

const section=document.getElementById("features");

if(section){

section.scrollIntoView({
behavior:"smooth"
});

}

};




return (


<section

id="home"

className="

relative

min-h-screen

overflow-hidden

bg-black

"


>





{/* BACKGROUND GLOW */}



<motion.div


animate={{

scale:[1,1.2,1],

opacity:[0.3,0.5,0.3]

}}


transition={{

duration:5,

repeat:Infinity

}}


className="

absolute

-left-40

top-20

h-[500px]

w-[500px]

rounded-full

bg-purple-600/20

blur-[150px]

"

/>







<motion.div


animate={{

scale:[1,1.3,1]

}}


transition={{

duration:6,

repeat:Infinity

}}



className="

absolute

right-[-150px]

bottom-0

h-[450px]

w-[450px]

rounded-full

bg-cyan-500/10

blur-[150px]

"

/>







{/* GRID */}


<div

className="

absolute

inset-0

opacity-20

"

style={{

backgroundImage:

"linear-gradient(rgba(168,85,247,0.15) 1px, transparent 1px),linear-gradient(90deg,rgba(168,85,247,0.15) 1px,transparent 1px)",


backgroundSize:"60px 60px"

}}


/>







{/* SCAN LINE */}



<motion.div


animate={{

y:["0%","100%"]

}}


transition={{

duration:6,

repeat:Infinity,

ease:"linear"

}}


className="

absolute

left-0

right-0

h-[2px]

bg-purple-500/40

shadow-[0_0_20px_rgba(168,85,247,1)]

"


/>









<div


className="

relative

z-10

mx-auto

flex

min-h-screen

max-w-7xl

items-center

justify-between

gap-20

px-8

pt-20

lg:flex-row

flex-col

"


>








{/* LEFT CONTENT */}




<motion.div


initial={{

opacity:0,

x:-60

}}


animate={{

opacity:1,

x:0

}}


transition={{

duration:0.8

}}



className="max-w-3xl"

>


<p

className="

mb-5

text-sm

font-bold

uppercase

tracking-[0.3em]

text-purple-400

"

>

🛡 Protect. Detect. Defend.

</p>








<h1

className="

text-6xl

font-black

leading-tight

text-white

lg:text-7xl

"

>

AI-Powered

</h1>





<motion.h1


animate={{

backgroundPosition:["0%","100%","0%"]

}}


transition={{

duration:5,

repeat:Infinity

}}



className="

mt-2

bg-gradient-to-r

from-purple-400

via-fuchsia-500

to-violet-600

bg-[length:200%_auto]

bg-clip-text

text-6xl

font-black

text-transparent

lg:text-7xl

"

>


Web Security Platform


</motion.h1>









<p

className="

mt-8

max-w-2xl

text-lg

leading-9

text-zinc-400

"


>

Scan websites, analyse security headers, inspect SSL/TLS,
detect open ports, discover vulnerabilities and receive
AI-powered security recommendations from one intelligent platform.

</p>










<div className="mt-10 flex gap-5 flex-wrap">





<Link


to="/dashboard/website-scanner"


className="

rounded-xl

bg-gradient-to-r

from-purple-600

to-violet-600

px-8

py-4

font-bold

text-white

shadow-[0_0_30px_rgba(168,85,247,0.5)]

transition

hover:scale-105

"


>

🚀 Start Free Scan

</Link>






<button


onClick={handleLearnMore}


className="

rounded-xl

border

border-purple-500/30

bg-white/5

px-8

py-4

font-bold

text-white

backdrop-blur-xl

transition

hover:bg-purple-500/20

"


>

Explore Platform

</button>




</div>







</motion.div>









{/* RIGHT PREVIEW */}




<motion.div


initial={{

opacity:0,

scale:0.8

}}


animate={{

opacity:1,

scale:1,

y:[0,-15,0]

}}


transition={{

duration:1,

y:{

duration:4,

repeat:Infinity

}

}}



>


<DashboardPreview/>


</motion.div>







</div>




</section>


);


};


export default Hero;