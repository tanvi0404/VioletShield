const Badge = ({ children }) => {
  return (
    <span
      className="
        rounded-full
        bg-purple-600/20
        px-3
        py-1
        text-sm
        text-purple-400
      "
    >
      {children}
    </span>
  );
};

export default Badge;