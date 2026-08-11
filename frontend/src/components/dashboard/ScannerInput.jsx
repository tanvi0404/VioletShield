import { useState } from "react";
import { Globe, Search, Loader2 } from "lucide-react";


const ScannerInput = ({ onScan, loading }) => {


  const [url, setUrl] = useState("");



  const handleScan = async () => {


    const website = url.trim();



    if (!website) {

      alert("Please enter a website URL.");

      return;

    }



    try {


      await onScan(website);


    } 
    
    catch (error) {


      console.error(error);

      alert("Failed to scan website.");

    }


  };





  return (

    <div className="
    rounded-3xl
    border
    border-zinc-800
    bg-zinc-900/60
    p-8
    shadow-lg
    ">


      <h2 className="
      mb-6
      text-2xl
      font-bold
      text-white
      ">

        Website Security Scanner

      </h2>





      <div className="
      flex
      flex-col
      gap-4
      lg:flex-row
      ">





        {/* URL INPUT */}

        <div className="
        relative
        flex-1
        ">



          <Globe

            size={22}

            className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-purple-400
            "

          />





          <input

            type="text"

            placeholder="https://example.com"

            value={url}

            onChange={(e)=>setUrl(e.target.value)}

            disabled={loading}


            className="
            w-full
            rounded-2xl
            border
            border-zinc-700
            bg-zinc-950
            py-4
            pl-14
            pr-4
            text-white
            outline-none
            transition-all
            focus:border-purple-500
            focus:ring-2
            focus:ring-purple-500/30
            disabled:cursor-not-allowed
            disabled:opacity-60
            "

          />



        </div>








        {/* SCAN BUTTON */}


        <button


          onClick={handleScan}


          disabled={loading}


          className="
          flex
          items-center
          justify-center
          gap-2
          rounded-2xl
          bg-gradient-to-r
          from-purple-600
          to-violet-500
          px-8
          py-4
          font-semibold
          text-white
          transition-all
          hover:scale-105
          hover:shadow-[0_0_25px_rgba(124,58,237,0.45)]
          disabled:cursor-not-allowed
          disabled:opacity-60
          "


        >



          {

          loading ? (

            <>

            <Loader2

            size={20}

            className="animate-spin"

            />

            Analyzing Website...

            </>


          ) : (


            <>


            <Search

            size={20}

            />


            Scan Website


            </>


          )


          }



        </button>





      </div>





    </div>

  );


};


export default ScannerInput;