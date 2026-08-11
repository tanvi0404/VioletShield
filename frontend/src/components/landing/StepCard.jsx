import { motion } from "framer-motion";


const StepCard = ({
  icon: Icon,
  title,
  description
}) => {


return (

<motion.div


whileHover={{
y:-8,
scale:1.03
}}


className="

group

h-full

rounded-3xl

border

border-purple-500/20

bg-black/40

p-6

backdrop-blur-xl

transition

hover:border-purple-500/50

hover:shadow-[0_0_35px_rgba(168,85,247,0.25)]

"


>


<div

className="

mb-5

inline-flex

rounded-2xl

bg-purple-500/10

p-4

text-purple-400

group-hover:bg-purple-500/20

transition

"

>

<Icon size={30}/>

</div>



<h3

className="

text-xl

font-bold

text-white

"

>

{title}

</h3>




<p

className="

mt-3

text-sm

leading-6

text-zinc-400

"

>

{description}

</p>



</motion.div>


);


};


export default StepCard;