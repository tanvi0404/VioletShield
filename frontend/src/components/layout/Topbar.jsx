import { Bell, ShieldCheck, Search } from "lucide-react";
import { motion } from "framer-motion";


const Topbar = () => {


  return (


    <motion.header


      initial={{
        y:-30,
        opacity:0
      }}


      animate={{
        y:0,
        opacity:1
      }}


      transition={{
        duration:0.5
      }}


      className="

      flex

      h-20

      items-center

      justify-between

      border-b

      border-purple-500/20

      bg-black/40

      backdrop-blur-xl

      px-8

      "


    >






      {/* LEFT SIDE */}


      <div>


        <h1

        className="

        text-2xl

        font-bold

        text-white

        "

        >

        Security Dashboard

        </h1>



        <div className="flex items-center gap-2 mt-1">


          <ShieldCheck

          size={15}

          className="text-green-400"

          />


          <p className="text-xs text-green-400">

          All Security Systems Online

          </p>


        </div>



      </div>









      {/* RIGHT SIDE */}


      <div className="flex items-center gap-5">





        {/* SEARCH */}


        <div

        className="

        hidden

        md:flex

        items-center

        gap-3

        rounded-xl

        border

        border-purple-500/20

        bg-purple-500/10

        px-4

        py-2

        "

        >


          <Search

          size={18}

          className="text-purple-300"

          />


          <input

          placeholder="Search..."

          className="

          bg-transparent

          outline-none

          text-sm

          text-white

          placeholder:text-zinc-500

          w-40

          "

          />


        </div>









        {/* NOTIFICATION */}



        <motion.button


        whileHover={{
          scale:1.1
        }}


        className="

        relative

        rounded-xl

        border

        border-purple-500/20

        bg-purple-500/10

        p-3

        "

        >


        <Bell

        size={20}

        className="text-purple-300"

        />



        <span

        className="

        absolute

        right-2

        top-2

        h-2

        w-2

        rounded-full

        bg-red-500

        "

        />


        </motion.button>









        {/* PROFILE */}



        <div

        className="

        flex

        items-center

        gap-3

        rounded-xl

        border

        border-purple-500/20

        bg-purple-500/10

        px-4

        py-2

        "

        >



        <div

        className="

        flex

        h-10

        w-10

        items-center

        justify-center

        rounded-full

        bg-gradient-to-r

        from-purple-600

        to-violet-500

        font-bold

        text-white

        "

        >

        A

        </div>




        <div className="hidden md:block">


        <p className="text-sm font-semibold text-white">

        Admin

        </p>


        <p className="text-xs text-purple-300">

        Online

        </p>


        </div>




        </div>




      </div>







    </motion.header>


  );


};


export default Topbar;