import { motion } from "framer-motion";

import {
  Target,
  Globe,
  Network,
  BrainCircuit,
  FileText,
} from "lucide-react";

import StepCard from "./StepCard";



const workflowSteps = [

{
icon:Target,
title:"Enter Target",
description:
"Enter a website URL, domain or authorised IP address to begin security assessment."
},


{
icon:Globe,
title:"Web Scanner",
description:
"Analyse security headers, SSL/TLS, cookies, technologies and web vulnerabilities."
},


{
icon:Network,
title:"Network Scanner",
description:
"Discover open ports, running services and exposed network services."
},


{
icon:BrainCircuit,
title:"AI Analysis",
description:
"AI prioritises threats, explains vulnerabilities and provides remediation."
},


{
icon:FileText,
title:"Generate Report",
description:
"Create professional security reports with findings and recommendations."
}

];





const HowItWorks =()=>{


return (


<section

id="docs"

className="

relative

overflow-hidden

bg-[#050816]

py-28

"


>






{/* Background */}


<motion.div


animate={{

scale:[1,1.2,1]

}}


transition={{

duration:8,

repeat:Infinity

}}



className="

absolute

left-1/2

top-20

h-[500px]

w-[500px]

-translate-x-1/2

rounded-full

bg-purple-700/20

blur-[150px]

"

/>







<div className="relative mx-auto max-w-7xl px-6">







{/* HEADER */}




<motion.div


initial={{

opacity:0,

y:40

}}


whileInView={{

opacity:1,

y:0

}}


viewport={{

once:true

}}


className="mb-20 text-center"


>


<p

className="

mb-3

text-sm

font-bold

uppercase

tracking-[0.35em]

text-purple-400

"

>

⚡ Workflow

</p>




<h2

className="

text-5xl

font-black

text-white

"

>

How VioletShield Works

</h2>




<p

className="

mx-auto

mt-5

max-w-3xl

text-lg

leading-8

text-zinc-400

"

>

A complete cybersecurity pipeline from target discovery
to AI-powered threat intelligence and reporting.

</p>



</motion.div>









{/* STEPS */}



<div

className="

relative

grid

grid-cols-1

gap-8

md:grid-cols-2

xl:grid-cols-5

"

>





{/* Connecting Line */}


<div

className="

absolute

left-0

right-0

top-12

hidden

h-[2px]

bg-purple-500/20

xl:block

"

/>






{

workflowSteps.map((step,index)=>(



<motion.div


key={index}


initial={{

opacity:0,

y:50

}}


whileInView={{

opacity:1,

y:0

}}


viewport={{

once:true

}}



transition={{

duration:0.5,

delay:index*0.2

}}



className="relative z-10"


>







{/* Number */}


<div

className="

mx-auto

mb-5

flex

h-12

w-12

items-center

justify-center

rounded-full

border

border-purple-500/40

bg-black

text-lg

font-bold

text-purple-400

shadow-[0_0_20px_rgba(168,85,247,0.4)]

"


>

{index+1}

</div>





<StepCard

icon={step.icon}

title={step.title}

description={step.description}

/>





</motion.div>



))


}



</div>







</div>





</section>


);


};



export default HowItWorks;