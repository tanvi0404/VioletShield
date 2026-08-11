import { motion } from "framer-motion";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";


const DashboardLayout = ({ children }) => {


  return (


    <div

      className="
      flex
      h-screen
      overflow-hidden
      bg-[#050505]
      text-white
      "

    >



      {/* Sidebar */}

      <aside

        className="
        w-72
        border-r
        border-purple-500/20
        bg-black/40
        backdrop-blur-xl
        "

      >

        <Sidebar />

      </aside>





      {/* Main Area */}


      <div

        className="
        flex
        flex-1
        flex-col
        overflow-hidden
        "

      >




        {/* Top Navigation */}


        <div

          className="
          sticky
          top-0
          z-50
          border-b
          border-purple-500/20
          bg-black/50
          backdrop-blur-xl
          "

        >

          <Topbar />

        </div>






        {/* Page Content */}


        <motion.main


          initial={{
            opacity:0,
            y:20
          }}


          animate={{
            opacity:1,
            y:0
          }}


          transition={{
            duration:0.5
          }}


          className="

          flex-1

          overflow-y-auto

          p-8

          bg-gradient-to-br

          from-black

          via-[#09090B]

          to-purple-950/20


          scrollbar-thin

          scrollbar-thumb-purple-700

          "

        >


          {children}


        </motion.main>




      </div>




    </div>


  );

};



export default DashboardLayout;