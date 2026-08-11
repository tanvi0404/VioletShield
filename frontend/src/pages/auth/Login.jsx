import {
  Shield,
  Mail,
  Lock,
  Smartphone,
} from "lucide-react";

import {
  motion
} from "framer-motion";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  useState
} from "react";

import AuthBackground from "./AuthBackground";

import cyberImage from "../../assets/cyber-security.png";



const Login = () => {


const navigate = useNavigate();


const [email,setEmail] = useState("");

const [password,setPassword] = useState("");





const handleLogin = async()=>{


try{


const response = await fetch(
"http://127.0.0.1:5000/api/login",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

email:email,

password:password

})

}

);




const data = await response.json();

console.log(
"LOGIN RESPONSE:",
data
);



if(response.ok){


localStorage.setItem(
"token",
data.token
);


localStorage.setItem(
"user_id",
data.user_id
);



navigate("/dashboard");


}

else{


alert(
data.error || "Login Failed"
);


}



}

catch(error){


console.log(
"LOGIN ERROR:",
error
);


alert(
"Server Error"
);


}


};





return (


<div

className="
relative
min-h-screen
overflow-hidden
flex
items-center
justify-center
"

>


<AuthBackground />



<div

className="
relative
z-10
grid
w-full
max-w-7xl
items-center
gap-12
px-8
lg:grid-cols-2
"

>



{/* LEFT SIDE */}


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
duration:0.7
}}

className="
hidden
lg:flex
flex-col
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


Secure Your


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

Digital World

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


AI powered cybersecurity platform
designed to detect threats,
analyse vulnerabilities and protect
your digital assets.


</p>




<motion.div

whileHover={{
scale:1.02
}}

className="
relative
mt-8
h-[430px]
overflow-hidden
rounded-3xl
border
border-purple-500/30
bg-black/60
p-3
"

>


<img

src={cyberImage}

alt="Cyber Security"

className="
h-full
w-full
rounded-2xl
object-cover
"

/>



<div

className="
absolute
bottom-6
left-6
rounded-xl
border
border-purple-500/30
bg-black/70
px-5
py-3
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

Protect. Detect. Defend.

</span>


</div>


</div>


</motion.div>



</motion.div>

{/* LOGIN CARD */}


<motion.div


initial={{
opacity:0,
y:30
}}

animate={{
opacity:1,
y:0
}}

transition={{
duration:0.6
}}


className="
min-h-[430px]
rounded-3xl
border
border-purple-500/30
bg-[#09090B]/90
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


Welcome Back


</h2>




<p className="
mt-2
text-zinc-400
">


Login to your VioletShield account


</p>


</div>







<div

className="
mt-8
space-y-4
"

>



<Input

icon={<Mail size={20}/>}

placeholder="Email address"

value={email}

onChange={(e)=>setEmail(e.target.value)}

/>




<Input

icon={<Lock size={20}/>}

placeholder="Password"

type="password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

/>



</div>







<button

onClick={handleLogin}

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


Login


</button>








<div

className="
my-6
flex
items-center
gap-3
"

>


<div

className="
h-px
flex-1
bg-zinc-700
"

/>



<span

className="
text-sm
text-zinc-500
"

>

OR

</span>




<div

className="
h-px
flex-1
bg-zinc-700
"

/>



</div>








<button

className="
flex
w-full
justify-center
items-center
gap-3
rounded-xl
border
border-zinc-700
bg-zinc-900
py-3
text-white
hover:border-purple-500
"

>


<b>

G

</b>


Continue with Google


</button>







<button

className="
mt-3
flex
w-full
justify-center
items-center
gap-3
rounded-xl
border
border-zinc-700
bg-zinc-900
py-3
text-white
hover:border-purple-500
"

>


<Smartphone size={20}/>


Login with Mobile OTP


</button>








<p

className="
mt-6
text-center
text-zinc-400
"

>


Don't have an account?



<Link

to="/signup"

className="
ml-2
text-purple-400
hover:text-purple-300
"

>


Create Account


</Link>



</p>




</motion.div>



</div>


</div>


);

};

const Input = ({
  icon,
  placeholder,
  type = "text",
  value,
  onChange
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
bg-zinc-900
px-4
py-3
focus-within:border-purple-500
"

>


<div className="text-purple-400">

{icon}

</div>



<input

type={type}

value={value}

onChange={onChange}

placeholder={placeholder}

className="
w-full
bg-transparent
outline-none
text-white
placeholder:text-zinc-500
"

/>



</div>

);


};



export default Login;