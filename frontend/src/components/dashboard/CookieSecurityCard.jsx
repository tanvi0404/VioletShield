const CookieSecurityCard = ({ cookies }) => {


if(!cookies){
    return null;
}



const cookieList = cookies.cookies || [];



const totalCookies = cookies.total || 0;



const highRisk =
cookieList.filter(
(cookie)=>cookie.risk==="High"
).length;



const mediumRisk =
cookieList.filter(
(cookie)=>cookie.risk==="Medium"
).length;



return (

<div

className="
mt-8
rounded-3xl
border
border-purple-500/30
bg-zinc-950
p-8
shadow-[0_0_40px_rgba(168,85,247,0.15)]
"

>



<h2

className="
text-2xl
font-bold
text-white
"

>

🍪 Cookie Security Intelligence

</h2>




<p

className="
mt-2
text-zinc-400
"

>

Analysis of website cookies and security flags

</p>







{/* SUMMARY CARDS */}



<div

className="
mt-6
grid
gap-5
md:grid-cols-4
"

>




<div

className="
rounded-xl
bg-purple-500/10
p-5
"

>

<p className="text-zinc-400">

Total Cookies

</p>


<h3

className="
mt-2
text-4xl
font-black
text-purple-400
"

>

{totalCookies}

</h3>


</div>








<div

className="
rounded-xl
bg-purple-500/10
p-5
"

>

<p className="text-zinc-400">

High Risk

</p>


<h3

className="
mt-2
text-3xl
font-black
text-red-400
"

>

{highRisk}

</h3>


</div>








<div

className="
rounded-xl
bg-purple-500/10
p-5
"

>

<p className="text-zinc-400">

Medium Risk

</p>


<h3

className="
mt-2
text-3xl
font-black
text-yellow-400
"

>

{mediumRisk}

</h3>


</div>








<div

className="
rounded-xl
bg-purple-500/10
p-5
"

>

<p className="text-zinc-400">

Status

</p>


<h3

className="
mt-2
text-xl
font-bold
text-green-400
"

>

{

highRisk > 0

?

"⚠ Risk"

:

"✅ Secure"

}

</h3>


</div>





</div>









{/* COOKIE TABLE */}



<div

className="
mt-8
overflow-x-auto
"

>


<table

className="
w-full
text-left
"

>


<thead>

<tr

className="
border-b
border-purple-500/20
text-zinc-400
"

>


<th className="p-4">

Cookie Name

</th>


<th className="p-4">

Secure

</th>


<th className="p-4">

HttpOnly

</th>


<th className="p-4">

SameSite

</th>


<th className="p-4">

Risk

</th>


</tr>


</thead>





<tbody>


{

cookieList.length > 0 ?


cookieList.map((cookie,index)=>(


<tr

key={index}

className="
border-b
border-zinc-800
"

>



<td

className="
p-4
text-white
font-semibold
"

>

{cookie.name}

</td>






<td className="p-4">


{

cookie.secure

?

"✅"

:

"❌"

}


</td>







<td className="p-4">


{

cookie.httponly

?

"✅"

:

"❌"

}


</td>







<td className="p-4">


{

cookie.samesite

?

cookie.samesite

:

"❌"

}


</td>








<td className="p-4">


<span

className={

`
rounded-full
px-3
py-1
text-sm
font-bold

${
cookie.risk==="High"

?

"bg-red-500/20 text-red-400"

:

cookie.risk==="Medium"

?

"bg-yellow-500/20 text-yellow-400"

:

cookie.risk==="Low"

?

"bg-blue-500/20 text-blue-400"

:

"bg-green-500/20 text-green-400"

}

`

}

>

{cookie.risk}

</span>


</td>







</tr>


))


:


<tr>


<td

colSpan="5"

className="
p-5
text-center
text-zinc-400
"

>

No cookies detected

</td>


</tr>



}



</tbody>


</table>



</div>






</div>


);


};


export default CookieSecurityCard;