import {
  Shield,
  Mail,
  Lock,
  Smartphone,
  User,
} from "lucide-react";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import AuthBackground from "./AuthBackground";
import signupImage from "../../assets/cyber-security2.png";


const Signup = () => {

return (

<div
className="
relative
min-h-screen
overflow-hidden
flex
items-center
justify-center
py-10
"
>

<AuthBackground />


<div
className="
relative
z-10
grid
w-full
max-w-6xl
items-center
gap-12
px-6
lg:grid-cols-2
"
>


{/* ================= FORM LEFT ================= */}


<motion.div

initial={{
opacity:0,
x:-40
}}

animate={{
opacity:1,
x:0
}}

transition={{
duration:0.6
}}

className="
rounded-3xl
border
border-purple-500/30
bg-black/60
p-8
shadow-[0_0_60px_rgba(168,85,247,0.25)]
backdrop-blur-xl
"

>


<div className="text-center">


<div
className="
mx-auto
flex
h-14
w-14
items-center
justify-center
rounded-2xl
bg-purple-500/20
"
>

<Shield
size={32}
className="text-purple-400"
/>

</div>



<h2
className="
mt-5
text-3xl
font-bold
text-white
"
>

Create Account

</h2>


<p
className="
mt-2
text-zinc-400
"
>

Join your VioletShield account

</p>


</div>





<div
className="
mt-8
space-y-4
"
>


<Input

icon={<User size={20}/>}
placeholder="Full Name"

/>


<Input

icon={<Mail size={20}/>}
placeholder="Email Address"

/>


<Input

icon={<Smartphone size={20}/>}
placeholder="Mobile Number"

/>


<Input

icon={<Lock size={20}/>}
placeholder="Password"
type="password"

/>


<Input

icon={<Lock size={20}/>}
placeholder="Confirm Password"
type="password"

/>


</div>




<button

className="
mt-6
w-full
rounded-xl
bg-gradient-to-r
from-purple-600
to-violet-500
py-3
font-semibold
text-white
shadow-lg
shadow-purple-600/30
transition
hover:scale-105
"

>

Create Account

</button>



<div
className="
my-6
flex
items-center
gap-3
"
>

<div className="h-px flex-1 bg-zinc-700"/>

<span
className="
text-sm
text-zinc-500
"
>
OR
</span>

<div className="h-px flex-1 bg-zinc-700"/>

</div>

<button

className="
flex
w-full
items-center
justify-center
gap-3
rounded-xl
border
border-zinc-700
bg-zinc-900
py-3
text-white
transition
hover:border-purple-500
"

>

<span className="font-bold">
G
</span>

Continue with Google

</button>





<button

className="
mt-3
flex
w-full
items-center
justify-center
gap-3
rounded-xl
border
border-zinc-700
bg-zinc-900
py-3
text-white
transition
hover:border-purple-500
"

>

<Smartphone size={20}/>

Signup with Mobile OTP

</button>





<p

className="
mt-6
text-center
text-zinc-400
"

>

Already have an account?


<Link

to="/login"

className="
ml-2
text-purple-400
hover:text-purple-300
"

>

Login

</Link>


</p>


</motion.div>







{/* ================= RIGHT SIDE ================= */}



<motion.div

initial={{
opacity:0,
x:40
}}

animate={{
opacity:1,
x:0
}}

transition={{
duration:0.6
}}

className="
hidden
lg:flex
flex-col
justify-center
"

>


<h1

className="
text-5xl
font-black
leading-tight
text-white
"

>

Join The Future


<br/>


<span

className="
bg-gradient-to-r
from-purple-400
to-fuchsia-500
bg-clip-text
text-transparent
"

>

Cyber Defense

</span>


</h1>





<p

className="
mt-5
max-w-lg
text-lg
leading-8
text-zinc-400
"

>

Create your VioletShield account and experience
AI-powered security, threat detection and
digital protection.

</p>






<div

className="
mt-8
relative
overflow-hidden
rounded-3xl
border
border-purple-500/30
bg-black/50
p-3
shadow-[0_0_50px_rgba(168,85,247,0.25)]
"

>


<img

src={signupImage}

alt="Signup Security"

className="
h-[330px]
w-full
rounded-2xl
object-cover
"

/>




<div

className="
absolute
bottom-7
left-7
rounded-xl
border
border-purple-500/30
bg-black/70
px-5
py-3
backdrop-blur-xl
"

>


<div

className="
flex
items-center
gap-3
text-purple-400
"

>


<Shield size={22}/>


<span className="font-semibold">

Secure Your Identity

</span>


</div>


</div>


</div>



</motion.div>



</div>


</div>


);

};








const Input = ({
icon,
placeholder,
type="text"
}) => {


return (

<div

className="
flex
items-center
gap-3
rounded-xl
border
border-zinc-700
bg-zinc-900/70
px-4
py-3
"

>


<div className="text-purple-400">

{icon}

</div>



<input

type={type}

placeholder={placeholder}

className="
w-full
bg-transparent
outline-none
text-white
"

/>



</div>

);


};





export default Signup;