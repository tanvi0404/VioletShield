import { motion } from "framer-motion";


const FeatureCard = ({
  icon,
  title,
  description,
}) => {


return (


<motion.div


whileHover={{
  y:-10,
  scale:1.02
}}


transition={{
  duration:0.3
}}



className="

group

relative

overflow-hidden

rounded-3xl

border

border-purple-500/20

bg-black/40

p-8

backdrop-blur-xl

shadow-[0_0_30px_rgba(168,85,247,0.08)]

hover:border-purple-500/60

hover:shadow-[0_0_45px_rgba(168,85,247,0.25)]

"

>





{/* Glow Effect */}


<div

className="

absolute

right-0

top-0

h-32

w-32

rounded-full

bg-purple-600/20

blur-3xl

opacity-0

transition

group-hover:opacity-100

"

/>







{/* ICON */}



<motion.div


whileHover={{
rotate:10,
scale:1.1
}}


className="

relative

mb-6

inline-flex

rounded-2xl

border

border-purple-500/20

bg-purple-500/10

p-4

text-purple-400

shadow-[0_0_20px_rgba(168,85,247,0.2)]

"


>


{icon}


</motion.div>








{/* TITLE */}



<h3

className="

relative

mb-3

text-2xl

font-bold

text-white

group-hover:text-purple-300

transition

"

>

{title}

</h3>







{/* DESCRIPTION */}



<p

className="

relative

leading-7

text-zinc-400

"

>

{description}

</p>








{/* Bottom line animation */}


<div

className="

absolute

bottom-0

left-0

h-[2px]

w-0

bg-gradient-to-r

from-purple-500

to-violet-500

transition-all

duration-500

group-hover:w-full

"

/>





</motion.div>



);


};



export default FeatureCard;