import {
  LayoutDashboard,
  Globe,
  Network,
  FileText,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";


const menuItems = [

  {
    title:"Overview",
    icon:<LayoutDashboard size={20}/>,
    path:"/dashboard/overview"
  },

  {
    title:"Web Scanner",
    icon:<Globe size={20}/>,
    path:"/dashboard/website-scanner"
  },

  {
    title:"Network Scanner",
    icon:<Network size={20}/>,
    path:"/dashboard/network-scanner"
  },

  {
    title:"Reports",
    icon:<FileText size={20}/>,
    path:"/dashboard/reports"
  },

  {
    title:"Settings",
    icon:<Settings size={20}/>,
    path:"/dashboard/settings"
  }

];



const Sidebar =()=>{


return (

<motion.aside


initial={{
x:-100,
opacity:0
}}

animate={{
x:0,
opacity:1
}}

transition={{
duration:0.5
}}


className="

flex

h-screen

w-72

flex-col

border-r

border-purple-500/20

bg-black/50

backdrop-blur-xl

"

>


{/* LOGO */}


<div

className="

border-b

border-purple-500/20

p-6

"

>


<div className="flex items-center gap-3">


<motion.div


whileHover={{
rotate:15,
scale:1.1
}}


className="

flex

h-12

w-12

items-center

justify-center

rounded-2xl

bg-purple-600/20

shadow-[0_0_25px_rgba(168,85,247,0.5)]

"


>


<Shield

size={28}

className="text-purple-400"

/>


</motion.div>



<div>


<h1

className="

text-2xl

font-bold

text-white

"

>

VioletShield

</h1>



<p className="text-xs text-purple-300">

Cyber Defense Platform

</p>



</div>


</div>


</div>





{/* MENU */}


<nav

className="

flex-1

px-5

py-8

"

>


{

menuItems.map((item)=>(


<NavLink


key={item.title}

to={item.path}

end={item.title==="Overview"}


className={({isActive})=>`

mb-3

flex

items-center

gap-4

rounded-xl

px-5

py-4

transition-all

duration-300


${

isActive

?

`
bg-purple-600/30

border

border-purple-400/40

text-white

shadow-[0_0_20px_rgba(168,85,247,0.35)]

`

:

`

text-zinc-400

hover:bg-purple-500/10

hover:text-white

`

}

`}


>


<span>

{item.icon}

</span>



<span className="font-medium">

{item.title}

</span>



</NavLink>


))


}


</nav>








{/* USER AREA */}


<div

className="

border-t

border-purple-500/20

p-5

"

>



<div


className="

flex

items-center

gap-3

rounded-2xl

border

border-purple-500/20

bg-purple-500/10

p-4

"


>



<div


className="

flex

h-12

w-12

items-center

justify-center

rounded-full

bg-gradient-to-r

from-purple-600

to-violet-500

font-bold

text-white

shadow-lg

"


>

A

</div>



<div>

<h3 className="font-semibold text-white">

Administrator

</h3>


<p className="text-xs text-purple-300">

Security Analyst

</p>


</div>



</div>






<button


className="

mt-4

flex

w-full

items-center

gap-3

rounded-xl

border

border-red-500/30

px-4

py-3

text-red-400

transition

hover:bg-red-500/10

"


>


<LogOut size={20}/>


<span>

Logout

</span>


</button>



</div>





</motion.aside>


);


};


export default Sidebar;