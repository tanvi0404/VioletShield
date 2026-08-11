const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`
        rounded-2xl
        bg-zinc-900
        border
        border-zinc-800
        p-6
        shadow-lg
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;