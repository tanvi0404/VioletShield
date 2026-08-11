const SecurityHeadersCard = ({ headers }) => {


if(!headers) return null;



return (


<div

className="
mt-8
rounded-3xl
border
border-purple-500/30
bg-gradient-to-br
from-purple-950/40
via-black
to-zinc-950
p-8
shadow-[0_0_40px_rgba(168,85,247,0.2)]
"

>



<h2

className="
text-2xl
font-bold
text-white
"

>

🔐 Security Headers Intelligence

</h2>





{/* SCORE */}

<div

className="
mt-6
rounded-2xl
bg-purple-500/10
border
border-purple-500/20
p-6
"

>


<p className="text-zinc-400">

Security Header Score

</p>



<h1

className="
mt-2
text-5xl
font-black
text-purple-400
"

>

{headers.score || 0}

<span className="text-2xl text-zinc-400">

/100

</span>


</h1>



</div>







{/* PRESENT HEADERS */}


<div className="mt-8">


<h3

className="
text-xl
font-bold
text-green-400
"

>

✅ Present Security Headers

</h3>




<div className="mt-4 grid md:grid-cols-2 gap-4">


{


headers.present?.map((item,index)=>(


<div

key={index}

className="
rounded-xl
border
border-green-500/30
bg-green-500/10
p-4
text-green-300
"

>


✅ {item}


</div>


))


}



</div>



</div>








{/* MISSING HEADERS */}


<div className="mt-8">


<h3

className="
text-xl
font-bold
text-red-400
"

>

⚠ Missing Security Headers

</h3>





<div className="mt-4 grid md:grid-cols-2 gap-4">


{


headers.missing?.length > 0 ?


headers.missing.map((item,index)=>(


<div

key={index}

className="
rounded-xl
border
border-red-500/30
bg-red-500/10
p-4
text-red-300
"

>


❌ {item}


</div>


))


:


<div className="
text-green-400
mt-3
">

No missing security headers 🎉

</div>


}




</div>



</div>






</div>


);


};



export default SecurityHeadersCard;