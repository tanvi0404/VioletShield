const DomainInfoCard = ({domainInfo}) => {


if(!domainInfo){
    return null;
}


return (

<div
className="
rounded-2xl
border
border-zinc-800
bg-zinc-950
p-8
space-y-6
"
>


<h2
className="
text-2xl
font-bold
text-white
"
>

🌐 Domain Intelligence

</h2>



<div
className="
grid
md:grid-cols-2
gap-5
"
>


<div className="box">

🏢 Registrar

<h3>
{domainInfo.registrar || "Unknown"}
</h3>

</div>



<div className="box">

🏭 Organization

<h3>
{domainInfo.organization || "Unknown"}
</h3>

</div>



<div className="box">

🌍 Country

<h3>
{domainInfo.country || "Unknown"}
</h3>

</div>



<div className="box">

📅 Created Date

<h3>
{domainInfo.created_date || "Unknown"}
</h3>

</div>



<div className="box">

⏳ Expiry Date

<h3>
{domainInfo.expiry_date || "Unknown"}
</h3>

</div>



<div className="box">

🌐 Nameservers

<h3>
{
domainInfo.nameservers?.join(", ")
||
"Unknown"
}

</h3>

</div>


</div>


</div>

);

};


export default DomainInfoCard;