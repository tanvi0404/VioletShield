import {
  Globe,
  Shield,
  BrainCircuit,
  FileText,
} from "lucide-react";

import { motion } from "framer-motion";

import FeatureCard from "./FeatureCard";


const features = [

{
icon:<Globe size={34}/>,
title:"Website Scanner",
description:
"Scan websites for missing security headers, exposed technologies, configuration issues and common vulnerabilities."
},


{
icon:<Shield size={34}/>,
title:"SSL & Security Analysis",
description:
"Inspect SSL/TLS configuration, HTTPS support, cookies and HTTP security headers."
},


{
icon:<BrainCircuit size={34}/>,
title:"AI Vulnerability Analysis",
description:
"Receive AI-generated explanations and remediation guidance for every identified security issue."
},


{
icon:<FileText size={34}/>,
title:"Professional Reports",
description:
"Generate clear security reports containing risks, findings, recommendations and security scores."
}

];





const Features = () => {


return (


<section

id="features"

className="

relative

overflow-hidden

bg-[#09090B]

px-8

py-28

"

>




{/* BACKGROUND GLOW */}


<div

className="

absolute

left-0

top-40

h-96

w-96

rounded-full

bg-purple-600/10

blur-[120px]

"

/>



<div

className="

absolute

right-0

bottom-20

h-96

w-96

rounded-full

bg-cyan-500/10

blur-[120px]

"

/>









<div className="relative z-10 mx-auto max-w-7xl">





{/* TITLE */}



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


transition={{

duration:0.7

}}



className="mb-20 text-center"


>


<p

className="

font-semibold

uppercase

tracking-[0.3em]

text-purple-400

"

>

Features

</p>





<h2

className="

mt-4

text-5xl

font-black

text-white

"

>

Everything You Need

</h2>




<p

className="

mx-auto

mt-6

max-w-3xl

text-lg

leading-8

text-zinc-400

"

>

VioletShield combines website scanning,
network analysis, AI-powered security insights
and professional reporting into one intelligent
cybersecurity platform.

</p>



</motion.div>









{/* CARDS */}



<div

className="

grid

gap-8

md:grid-cols-2

"


>


{


features.map((feature,index)=>(


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

delay:index*0.15

}}


whileHover={{

y:-8

}}



>


<FeatureCard

icon={feature.icon}

title={feature.title}

description={feature.description}

/>



</motion.div>



))


}



</div>






</div>



</section>


);


};



export default Features;