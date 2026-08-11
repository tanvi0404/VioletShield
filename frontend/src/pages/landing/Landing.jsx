import { motion } from "framer-motion";

import Navbar from "../../components/layout/Navbar";
import Hero from "../../components/landing/Hero";
import Features from "../../components/landing/Features";
import HowItWorks from "../../components/landing/HowItWorks";
import Footer from "../../components/landing/Footer";


const Landing = () => {

  return (

    <motion.div

      initial={{
        opacity:0
      }}

      animate={{
        opacity:1
      }}

      transition={{
        duration:0.8
      }}

      className="min-h-screen bg-black text-white"

    >


      <Navbar />



      <main>


        <section id="home">

          <Hero />

        </section>




        <section id="features">

          <Features />

        </section>





        <section id="docs">

          <HowItWorks />

        </section>



      </main>




      <Footer />



    </motion.div>

  );

};


export default Landing;