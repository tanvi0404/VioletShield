const Button = ({
  children,
  onClick,
  type = "button",
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        px-6
        py-3
        rounded-xl
        bg-purple-600
        hover:bg-purple-700
        transition-all
        duration-300
        text-white
        font-semibold
        shadow-lg
        hover:scale-105
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;