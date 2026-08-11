const SSLCard = ({ ssl }) => {

    if (!ssl) {
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


            {/* HEADER */}

            <h2
                className="
                text-2xl
                font-bold
                text-white
                "
            >

                🔐 SSL Certificate Analysis

            </h2>




            {/* STATUS */}

            <div
                className="
                rounded-xl
                bg-purple-950/30
                border
                border-purple-500/30
                p-6
                "
            >


                <p className="text-zinc-400">
                    Certificate Status
                </p>


                <h1
                    className={`
                    text-4xl
                    font-bold
                    mt-2
                    ${
                        ssl.valid
                        ?
                        "text-green-400"
                        :
                        "text-red-400"
                    }
                    `}
                >

                    {
                        ssl.valid
                        ?
                        "✓ Secure"
                        :
                        "✕ Invalid"
                    }


                </h1>


            </div>






            {/* DETAILS */}

            <div
                className="
                grid
                md:grid-cols-2
                gap-5
                "
            >




                {/* Certificate Authority */}

                <div
                    className="
                    rounded-xl
                    bg-black
                    border
                    border-zinc-800
                    p-5
                    "
                >

                    🏢

                    <span className="text-zinc-400 ml-2">
                        Certificate Authority
                    </span>


                    <h3 className="text-white font-bold mt-2">

                        {
                            ssl.issuer || "Unknown"
                        }

                    </h3>


                </div>





                {/* Domain */}

                <div
                    className="
                    rounded-xl
                    bg-black
                    border
                    border-zinc-800
                    p-5
                    "
                >

                    🌐

                    <span className="text-zinc-400 ml-2">
                        Domain
                    </span>


                    <h3 className="text-white font-bold mt-2">

                        {
                            ssl.subject || "Unknown"
                        }

                    </h3>


                </div>






                {/* Valid From */}

                <div
                    className="
                    rounded-xl
                    bg-black
                    border
                    border-zinc-800
                    p-5
                    "
                >

                    📅

                    <span className="text-zinc-400 ml-2">
                        Valid From
                    </span>


                    <h3 className="text-white font-bold mt-2">

                        {
                            ssl.validFrom || "Unknown"
                        }

                    </h3>


                </div>






                {/* Expiry */}

                <div
                    className="
                    rounded-xl
                    bg-black
                    border
                    border-zinc-800
                    p-5
                    "
                >

                    ⏳

                    <span className="text-zinc-400 ml-2">
                        Expiry
                    </span>


                    <h3 className="text-white font-bold mt-2">

                        {
                            ssl.expiry || "Unknown"
                        }

                    </h3>


                </div>






                {/* Remaining Days */}

                <div
                    className="
                    rounded-xl
                    bg-black
                    border
                    border-zinc-800
                    p-5
                    "
                >

                    ⌛

                    <span className="text-zinc-400 ml-2">
                        Remaining
                    </span>


                    <h3
                        className="
                        text-green-400
                        font-bold
                        mt-2
                        "
                    >

                        {
                            ssl.daysRemaining || 0
                        }

                        {" "}days


                    </h3>


                </div>






                {/* Encryption */}

                <div
                    className="
                    rounded-xl
                    bg-black
                    border
                    border-zinc-800
                    p-5
                    "
                >

                    🔒

                    <span className="text-zinc-400 ml-2">
                        Encryption
                    </span>


                    <h3
                        className="
                        text-purple-400
                        font-bold
                        mt-2
                        "
                    >

                        {
                            ssl.encryption 
                            ||
                            ssl.cipher
                            ||
                            "Unknown"
                        }


                    </h3>


                </div>



<div
className="
rounded-xl
bg-black
border
border-zinc-800
p-5
"
>

🔐

<span className="text-zinc-400 ml-2">
Signature Algorithm
</span>


<h3
className="
text-purple-400
font-bold
mt-2
"
>

{
ssl.signatureAlgorithm || "Unknown"
}

</h3>


</div>



                {/* Protocol */}

                {
                    ssl.protocol &&

                    <div
                        className="
                        rounded-xl
                        bg-black
                        border
                        border-zinc-800
                        p-5
                        "
                    >

                        🔐

                        <span className="text-zinc-400 ml-2">
                            Protocol
                        </span>


                        <h3
                            className="
                            text-blue-400
                            font-bold
                            mt-2
                            "
                        >

                            {
                                ssl.protocol
                            }


                        </h3>


                    </div>

                }



            </div>


        </div>

    );

};


export default SSLCard;