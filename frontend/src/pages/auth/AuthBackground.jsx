const AuthBackground = () => {
  return (
    <>

      {/* Dark Base */}
      <div
        className="
        absolute
        inset-0
        bg-[#050816]
        "
      />


      {/* Grid */}
      <div
        className="
        absolute
        inset-0
        opacity-10
        "
        style={{
          backgroundImage:
            "linear-gradient(rgba(168,85,247,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.15) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />


      {/* Purple Glow */}
      <div
        className="
        absolute
        -left-40
        top-20
        h-96
        w-96
        rounded-full
        bg-purple-600/20
        blur-[150px]
        "
      />


      {/* Cyan Glow */}
      <div
        className="
        absolute
        right-0
        bottom-0
        h-96
        w-96
        rounded-full
        bg-cyan-500/10
        blur-[150px]
        "
      />

    </>
  );
};


export default AuthBackground;