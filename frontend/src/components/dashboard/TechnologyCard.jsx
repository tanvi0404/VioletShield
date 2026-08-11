const TechnologyCard = ({ technologies }) => {


if(!technologies || technologies.length===0)
return null;



return (

<div className="
rounded-3xl
border
border-purple-500/30
bg-zinc-950
p-8
">


<div className="
flex
items-center
justify-between
">

<h2 className="
text-2xl
font-bold
text-white
">

🧠 Technology Intelligence

</h2>


<span className="
rounded-full
bg-purple-500/20
px-4
py-2
text-purple-300
">

Detected

</span>


</div>





<p className="
mt-3
text-zinc-400
">

Technologies identified from target website

</p>





<div className="
mt-6
grid
gap-4
md:grid-cols-2
">


{

technologies.map((tech,index)=>(


<div

key={index}

className="
rounded-xl
border
border-purple-500/20
bg-purple-950/30
p-5
text-purple-300
font-semibold
transition
hover:scale-105
"

>

<div className="
text-2xl
mb-2
">

🌐

</div>


{tech}


</div>


))

}


</div>




</div>

);


};


export default TechnologyCard;