import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";


const Navbar = () => {


  const scrollToSection = (id) => {

    const section = document.getElementById(id);

    if(section){

      section.scrollIntoView({
        behavior:"smooth"
      });

    }

  };



  const navItems = [
    {
      name:"Home",
      id:"home"
    },
    {
      name:"Features",
      id:"features"
    },
    {
      name:"Docs",
      id:"docs"
    },
    {
      name:"Contact",
      id:"contact"
    }
  ];




  return (

    <motion.nav


      initial={{
        y:-80
      }}


      animate={{
        y:0
      }}


      transition={{
        duration:0.6
      }}


      className="

      fixed

      top-0

      left-0

      z-50

      w-full

      border-b

      border-purple-500/20

      bg-black/50

      backdrop-blur-xl

      "


    >




      <div

      className="

      mx-auto

      flex

      h-20

      max-w-7xl

      items-center

      justify-between

      px-8

      "


      >





      {/* LOGO */}


      <Link

      to="/"

      className="flex items-center gap-3 group"


      >


        <motion.div

        whileHover={{
          rotate:15,
          scale:1.1
        }}

        className="

        rounded-xl

        bg-purple-600/20

        p-2

        shadow-[0_0_25px_rgba(168,85,247,0.5)]

        "

        >


          <Shield

          size={34}

          className="text-purple-400"

          />


        </motion.div>





        <h1

        className="

        text-2xl

        font-bold

        text-white

        group-hover:text-purple-400

        transition

        "

        >

        VioletShield

        </h1>



      </Link>








      {/* NAV LINKS */}


      <div

      className="

      hidden

      md:flex

      items-center

      gap-10

      text-zinc-300

      "

      >



      {
        navItems.map((item)=>(


          <button


          key={item.id}


          onClick={()=>scrollToSection(item.id)}


          className="

          relative

          transition

          hover:text-purple-400

          group

          "


          >


          {item.name}



          <span

          className="

          absolute

          left-0

          -bottom-2

          h-[2px]

          w-0

          bg-purple-500

          transition-all

          group-hover:w-full

          "

          />


          </button>


        ))
      }






      {/* DASHBOARD BUTTON */}



      <Link

      to="/dashboard/overview"


      className="

      rounded-xl

      bg-gradient-to-r

      from-purple-600

      via-violet-500

      to-purple-600

      px-6

      py-3

      font-semibold

      text-white

      shadow-[0_0_25px_rgba(168,85,247,0.5)]

      transition

      hover:scale-105

      "

      >

      Dashboard

      </Link>



      </div>




      </div>




    </motion.nav>


  );

};


export default Navbar;